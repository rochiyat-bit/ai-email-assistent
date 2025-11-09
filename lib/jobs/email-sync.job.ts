import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { createGmailService } from '@/lib/gmail/client';
import { GmailParser } from '@/lib/gmail/parser';
import { createAIService } from '@/lib/ai/service';
import { ProcessedEmail, EmailThread, User, SyncJob } from '@/models';
import { Op } from 'sequelize';
import logger from '@/lib/utils/logger';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

export const emailSyncQueue = new Queue('email-sync', { connection });

interface EmailSyncJobData {
  userId: string;
  syncType: 'full' | 'incremental';
  maxResults?: number;
}

export async function scheduleEmailSync(
  userId: string,
  syncType: 'full' | 'incremental',
  maxResults?: number
): Promise<Job<EmailSyncJobData>> {
  return await emailSyncQueue.add(
    'sync-emails',
    { userId, syncType, maxResults },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
}

export const emailSyncWorker = new Worker<EmailSyncJobData>(
  'email-sync',
  async (job: Job<EmailSyncJobData>) => {
    const { userId, syncType, maxResults = 100 } = job.data;

    logger.info(`Starting email sync for user ${userId}`, { syncType, maxResults });

    // Create sync job record
    const syncJob = await SyncJob.create({
      user_id: userId,
      job_type: syncType === 'full' ? 'full_sync' : 'incremental_sync',
      status: 'running',
      emails_fetched: 0,
      emails_processed: 0,
      started_at: new Date(),
    });

    try {
      // Get user
      const user = await User.findByPk(userId);
      if (!user || !user.gmail_access_token || !user.gmail_refresh_token) {
        throw new Error('User not found or Gmail not connected');
      }

      await job.updateProgress(10);

      // Initialize services
      const gmailService = await createGmailService(userId);
      if (!gmailService) {
        throw new Error('Failed to create Gmail service');
      }

      const aiService = await createAIService(userId);

      await job.updateProgress(20);

      // Fetch emails from Gmail
      const query =
        syncType === 'incremental'
          ? 'in:inbox is:unread newer_than:7d'
          : 'in:inbox newer_than:30d';

      const messagesResponse = await gmailService.listMessages({
        maxResults,
        q: query,
      });

      const messageIds = messagesResponse.messages?.map(m => m.id!) || [];

      if (messageIds.length === 0) {
        logger.info(`No new emails found for user ${userId}`);
        await syncJob.update({
          status: 'completed',
          completed_at: new Date(),
        });
        return { processed: 0, message: 'No new emails' };
      }

      await syncJob.update({ emails_fetched: messageIds.length });
      await job.updateProgress(40);

      // Process emails in batches
      const batchSize = 10;
      let processed = 0;

      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);

        // Fetch full email data
        const gmailMessages = await Promise.all(
          batch.map(id => gmailService.getMessage(id, 'full'))
        );

        // Parse emails
        const parsedEmails = gmailMessages.map(msg => GmailParser.parseMessage(msg));

        // Check for existing emails
        const existingEmailIds = await ProcessedEmail.findAll({
          where: {
            email_id: { [Op.in]: parsedEmails.map(e => e.id) },
          },
          attributes: ['email_id'],
        });

        const existingIds = new Set(existingEmailIds.map(e => e.email_id));

        // Filter out already processed emails
        const newEmails = parsedEmails.filter(e => !existingIds.has(e.id));

        if (newEmails.length === 0) {
          continue;
        }

        // AI processing
        const aiResults = await Promise.all(
          newEmails.map(async email => {
            try {
              const result = await aiService.summarizeEmail({
                subject: email.subject,
                from: email.from,
                snippet: email.snippet,
                body: email.plainTextBody || email.htmlBody,
                date: email.date,
              });

              return {
                email,
                ...result,
              };
            } catch (error) {
              logger.error(`AI processing failed for email ${email.id}`, error);
              // Fallback to basic categorization
              return {
                email,
                summary: email.snippet.substring(0, 100),
                category: 'promotional' as const,
                confidence: 0.5,
                tokensUsed: 0,
              };
            }
          })
        );

        // Save to database
        const emailsToCreate = aiResults.map(result => ({
          user_id: userId,
          email_id: result.email.id,
          thread_id: result.email.threadId,
          category: result.category,
          summary: result.summary,
          sender: result.email.from,
          sender_email: result.email.fromEmail,
          subject: result.email.subject,
          snippet: result.email.snippet,
          labels: result.email.labels,
          has_attachments: result.email.hasAttachments,
          is_read: result.email.isRead,
          is_starred: result.email.isStarred,
          received_at: new Date(result.email.date),
          processed_at: new Date(),
          ai_confidence_score: result.confidence,
          ai_model_used: process.env.AI_PROVIDER === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022',
          tokens_used: result.tokensUsed,
        }));

        await ProcessedEmail.bulkCreate(emailsToCreate, {
          ignoreDuplicates: true,
        });

        // Update or create email threads
        await updateEmailThreads(userId, aiResults);

        processed += aiResults.length;

        // Update progress
        const progress = 40 + ((i + batch.length) / messageIds.length) * 50;
        await job.updateProgress(Math.min(90, progress));

        // Small delay to avoid rate limiting
        if (i + batchSize < messageIds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Update user stats
      await user.update({
        last_sync_at: new Date(),
        total_emails_processed: user.total_emails_processed + processed,
      });

      // Complete sync job
      await syncJob.update({
        status: 'completed',
        emails_processed: processed,
        completed_at: new Date(),
      });

      await job.updateProgress(100);

      logger.info(`Email sync completed for user ${userId}`, { processed });

      return {
        processed,
        message: `Successfully processed ${processed} emails`,
      };
    } catch (error) {
      logger.error(`Email sync failed for user ${userId}`, error);

      await syncJob.update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date(),
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
  }
);

async function updateEmailThreads(userId: string, aiResults: any[]) {
  // Group emails by thread
  const threadGroups = new Map<string, any[]>();

  for (const result of aiResults) {
    const threadId = result.email.threadId;
    if (!threadGroups.has(threadId)) {
      threadGroups.set(threadId, []);
    }
    threadGroups.get(threadId)!.push(result);
  }

  // Update or create threads
  for (const [threadId, emails] of threadGroups) {
    const existingThread = await EmailThread.findOne({
      where: { user_id: userId, thread_id: threadId },
    });

    const latestEmail = emails[emails.length - 1];
    const firstEmail = emails[0];

    if (existingThread) {
      // Update existing thread
      await existingThread.update({
        email_count: existingThread.email_count + emails.length,
        latest_subject: latestEmail.email.subject,
        last_email_at: new Date(latestEmail.email.date),
        consolidated_summary: latestEmail.summary,
        is_read: emails.every(e => e.email.isRead),
        is_starred: emails.some(e => e.email.isStarred),
      });
    } else {
      // Create new thread
      await EmailThread.create({
        user_id: userId,
        thread_id: threadId,
        sender: firstEmail.email.from,
        sender_email: firstEmail.email.fromEmail,
        email_count: emails.length,
        category: latestEmail.category,
        consolidated_summary: latestEmail.summary,
        latest_subject: latestEmail.email.subject,
        first_email_at: new Date(firstEmail.email.date),
        last_email_at: new Date(latestEmail.email.date),
        is_read: emails.every(e => e.email.isRead),
        is_starred: emails.some(e => e.email.isStarred),
      });
    }
  }
}

// Error handling for worker
emailSyncWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Email sync job ${job.id} failed`, { error: err.message, userId: job.data.userId });
  }
});

emailSyncWorker.on('completed', (job) => {
  logger.info(`Email sync job ${job.id} completed`, { userId: job.data.userId });
});
