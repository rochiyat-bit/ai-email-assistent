import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface DigestContent {
  important_count: number;
  transactional_count: number;
  promotional_count: number;
  top_senders: string[];
  summaries: Array<{
    sender: string;
    summary: string;
    count: number;
  }>;
}

interface NotificationLogAttributes {
  id: string;
  user_id: string;
  notification_type: 'digest' | 'realtime' | 'important_alert';
  category_filter: string[];
  emails_included: number;
  digest_content: DigestContent;
  sent_at: Date;
  delivery_status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  created_at: Date;
}

interface NotificationLogCreationAttributes
  extends Optional<NotificationLogAttributes, 'id' | 'created_at'> {}

class NotificationLog
  extends Model<NotificationLogAttributes, NotificationLogCreationAttributes>
  implements NotificationLogAttributes
{
  public id!: string;
  public user_id!: string;
  public notification_type!: 'digest' | 'realtime' | 'important_alert';
  public category_filter!: string[];
  public emails_included!: number;
  public digest_content!: DigestContent;
  public sent_at!: Date;
  public delivery_status!: 'sent' | 'failed' | 'pending';
  public error_message!: string | null;
  public readonly created_at!: Date;
}

export function initNotificationLog(sequelize: Sequelize) {
  NotificationLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notification_type: {
        type: DataTypes.ENUM('digest', 'realtime', 'important_alert'),
        allowNull: false,
      },
      category_filter: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
      },
      emails_included: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      digest_content: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      delivery_status: {
        type: DataTypes.ENUM('sent', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
    },
    {
      sequelize,
      tableName: 'notification_logs',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'sent_at'] },
        { fields: ['notification_type'] },
        { fields: ['delivery_status'] },
      ],
    }
  );

  return NotificationLog;
}

export { NotificationLog };
export type { NotificationLogAttributes, NotificationLogCreationAttributes, DigestContent };
