import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { gmail_v1 } from 'googleapis';
import { User } from '@/models';

export class GmailService {
  private oauth2Client: OAuth2Client;
  private userId: string;

  constructor(accessToken: string, refreshToken: string, userId: string) {
    this.userId = userId;
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Auto-refresh token when expired
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.updateUserTokens(tokens.access_token, tokens.refresh_token);
      }
    });
  }

  private async updateUserTokens(accessToken: string, refreshToken?: string | null) {
    const user = await User.findByPk(this.userId);
    if (user) {
      await user.update({
        gmail_access_token: accessToken,
        gmail_refresh_token: refreshToken || user.gmail_refresh_token,
        gmail_token_expiry: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      });
    }
  }

  async getGmailClient(): Promise<gmail_v1.Gmail> {
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async listMessages(options: {
    maxResults?: number;
    pageToken?: string;
    q?: string;
    labelIds?: string[];
  }): Promise<gmail_v1.Schema$ListMessagesResponse> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: options.maxResults || 100,
      pageToken: options.pageToken,
      q: options.q,
      labelIds: options.labelIds || ['INBOX'],
    });
    return response.data;
  }

  async getMessage(
    messageId: string,
    format: 'full' | 'metadata' | 'minimal' = 'full'
  ): Promise<gmail_v1.Schema$Message> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format,
    });
    return response.data;
  }

  async modifyMessage(
    messageId: string,
    addLabelIds?: string[],
    removeLabelIds?: string[]
  ): Promise<void> {
    const gmail = await this.getGmailClient();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.modifyMessage(messageId, undefined, ['UNREAD']);
  }

  async markAsUnread(messageId: string): Promise<void> {
    await this.modifyMessage(messageId, ['UNREAD'], undefined);
  }

  async addStar(messageId: string): Promise<void> {
    await this.modifyMessage(messageId, ['STARRED'], undefined);
  }

  async removeStar(messageId: string): Promise<void> {
    await this.modifyMessage(messageId, undefined, ['STARRED']);
  }

  async sendMessage(rawMessage: string): Promise<gmail_v1.Schema$Message> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });
    return response.data;
  }

  async createDraft(rawMessage: string): Promise<gmail_v1.Schema$Draft> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: rawMessage,
        },
      },
    });
    return response.data;
  }

  async getProfile(): Promise<gmail_v1.Schema$Profile> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.getProfile({ userId: 'me' });
    return response.data;
  }

  async watchMailbox(topicName: string): Promise<gmail_v1.Schema$WatchResponse> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });
    return response.data;
  }

  async stopWatch(): Promise<void> {
    const gmail = await this.getGmailClient();
    await gmail.users.stop({ userId: 'me' });
  }

  async getHistory(startHistoryId: string): Promise<gmail_v1.Schema$ListHistoryResponse> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      labelId: 'INBOX',
    });
    return response.data;
  }

  async getAttachment(messageId: string, attachmentId: string): Promise<gmail_v1.Schema$MessagePartBody> {
    const gmail = await this.getGmailClient();
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });
    return response.data;
  }

  async batchGetMessages(messageIds: string[]): Promise<gmail_v1.Schema$Message[]> {
    const gmail = await this.getGmailClient();
    const messages = await Promise.all(
      messageIds.map(id => this.getMessage(id, 'full'))
    );
    return messages;
  }
}

export async function createGmailService(userId: string): Promise<GmailService | null> {
  const user = await User.findByPk(userId);

  if (!user || !user.gmail_access_token || !user.gmail_refresh_token) {
    return null;
  }

  return new GmailService(
    user.gmail_access_token,
    user.gmail_refresh_token,
    userId
  );
}
