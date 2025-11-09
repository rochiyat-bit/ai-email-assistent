import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { User } from "@/models";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    expiresAt?: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.compose",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Find or create user
        let dbUser = await User.findOne({ where: { email: user.email } });

        if (!dbUser) {
          // Create new user
          dbUser = await User.create({
            email: user.email,
            name: user.name || null,
            gmail_email: user.email,
            subscription_status: 'trial',
            subscription_plan: 'free',
            subscription_start_date: new Date(),
            subscription_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
            onboarding_completed: false,
            notification_preferences: {
              important: true,
              transactional: true,
              promotional: false,
              digest_times: ['09:00', '18:00'],
              timezone: 'Asia/Jakarta',
            },
            language: 'en',
            total_emails_processed: 0,
            ai_tokens_used: 0,
          });
        }

        // Update Gmail tokens if available
        if (account?.access_token && account?.refresh_token) {
          await dbUser.update({
            gmail_access_token: account.access_token,
            gmail_refresh_token: account.refresh_token,
            gmail_token_expiry: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, account, user, trigger, session }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.userId = user.id;
      }

      // Update token if updated from session
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.userId = token.userId as string;
      }

      // Get fresh user data from database
      if (session.user?.email) {
        const dbUser = await User.findOne({
          where: { email: session.user.email },
          attributes: [
            'id',
            'email',
            'name',
            'subscription_status',
            'subscription_plan',
            'onboarding_completed',
          ],
        });

        if (dbUser) {
          session.userId = dbUser.id;
        }
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === 'development',
});
