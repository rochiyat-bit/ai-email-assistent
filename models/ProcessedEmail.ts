import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface ProcessedEmailAttributes {
  id: string;
  user_id: string;
  email_id: string;
  thread_id: string;
  category: 'important' | 'transactional' | 'promotional';
  summary: string;
  sender: string;
  sender_email: string;
  subject: string;
  snippet: string;
  labels: string[];
  has_attachments: boolean;
  is_read: boolean;
  is_starred: boolean;
  received_at: Date;
  processed_at: Date;
  ai_confidence_score: number;
  ai_model_used: string;
  tokens_used: number;
  created_at: Date;
  updated_at: Date;
}

interface ProcessedEmailCreationAttributes
  extends Optional<ProcessedEmailAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ProcessedEmail
  extends Model<ProcessedEmailAttributes, ProcessedEmailCreationAttributes>
  implements ProcessedEmailAttributes
{
  public id!: string;
  public user_id!: string;
  public email_id!: string;
  public thread_id!: string;
  public category!: 'important' | 'transactional' | 'promotional';
  public summary!: string;
  public sender!: string;
  public sender_email!: string;
  public subject!: string;
  public snippet!: string;
  public labels!: string[];
  public has_attachments!: boolean;
  public is_read!: boolean;
  public is_starred!: boolean;
  public received_at!: Date;
  public processed_at!: Date;
  public ai_confidence_score!: number;
  public ai_model_used!: string;
  public tokens_used!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initProcessedEmail(sequelize: Sequelize) {
  ProcessedEmail.init(
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
      category: {
        type: DataTypes.ENUM('important', 'transactional', 'promotional'),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sender: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sender_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      snippet: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      labels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
      },
      has_attachments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_starred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      received_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ai_confidence_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 1,
        },
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
      tableName: 'processed_emails',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'category'] },
        { fields: ['user_id', 'received_at'] },
        { fields: ['email_id'], unique: true },
        { fields: ['thread_id'] },
        { fields: ['sender_email'] },
        { fields: ['is_read'] },
        { fields: ['is_starred'] },
      ],
    }
  );

  return ProcessedEmail;
}

export { ProcessedEmail };
export type { ProcessedEmailAttributes, ProcessedEmailCreationAttributes };
