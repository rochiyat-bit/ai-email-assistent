import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface DraftReplyAttributes {
  id: string;
  user_id: string;
  email_id: string;
  thread_id: string;
  reply_content: string;
  reply_subject: string;
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  language: string;
  ai_model_used: string;
  tokens_used: number;
  is_sent: boolean;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface DraftReplyCreationAttributes
  extends Optional<DraftReplyAttributes, 'id' | 'sent_at' | 'created_at' | 'updated_at'> {}

class DraftReply
  extends Model<DraftReplyAttributes, DraftReplyCreationAttributes>
  implements DraftReplyAttributes
{
  public id!: string;
  public user_id!: string;
  public email_id!: string;
  public thread_id!: string;
  public reply_content!: string;
  public reply_subject!: string;
  public tone!: 'professional' | 'casual' | 'friendly' | 'formal';
  public language!: string;
  public ai_model_used!: string;
  public tokens_used!: number;
  public is_sent!: boolean;
  public sent_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initDraftReply(sequelize: Sequelize) {
  DraftReply.init(
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
      email_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Gmail message ID',
      },
      thread_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Gmail thread ID',
      },
      reply_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reply_subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tone: {
        type: DataTypes.ENUM('professional', 'casual', 'friendly', 'formal'),
        allowNull: false,
        defaultValue: 'professional',
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      ai_model_used: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tokens_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'draft_replies',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'created_at'] },
        { fields: ['email_id'] },
        { fields: ['thread_id'] },
        { fields: ['is_sent'] },
      ],
    }
  );

  return DraftReply;
}

export { DraftReply };
export type { DraftReplyAttributes, DraftReplyCreationAttributes };
