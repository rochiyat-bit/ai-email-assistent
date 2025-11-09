import { Sequelize } from 'sequelize';
import { initUser, User } from './User';
import { initProcessedEmail, ProcessedEmail } from './ProcessedEmail';
import { initEmailThread, EmailThread } from './EmailThread';
import { initAIUsageLog, AIUsageLog } from './AIUsageLog';
import { initNotificationLog, NotificationLog } from './NotificationLog';
import { initDraftReply, DraftReply } from './DraftReply';
import { initSyncJob, SyncJob } from './SyncJob';
import sequelize from '../lib/sequelize';

// Initialize all models
initUser(sequelize);
initProcessedEmail(sequelize);
initEmailThread(sequelize);
initAIUsageLog(sequelize);
initNotificationLog(sequelize);
initDraftReply(sequelize);
initSyncJob(sequelize);

// Define associations
User.hasMany(ProcessedEmail, {
  foreignKey: 'user_id',
  as: 'processed_emails',
});
ProcessedEmail.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(EmailThread, {
  foreignKey: 'user_id',
  as: 'email_threads',
});
EmailThread.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(AIUsageLog, {
  foreignKey: 'user_id',
  as: 'ai_usage_logs',
});
AIUsageLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(NotificationLog, {
  foreignKey: 'user_id',
  as: 'notification_logs',
});
NotificationLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(DraftReply, {
  foreignKey: 'user_id',
  as: 'draft_replies',
});
DraftReply.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(SyncJob, {
  foreignKey: 'user_id',
  as: 'sync_jobs',
});
SyncJob.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export {
  sequelize,
  User,
  ProcessedEmail,
  EmailThread,
  AIUsageLog,
  NotificationLog,
  DraftReply,
  SyncJob,
};

export type { Sequelize };
