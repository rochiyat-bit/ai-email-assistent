import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface EmailThreadAttributes {
  id: string;
  user_id: string;
  thread_id: string;
  sender: string;
  sender_email: string;
  email_count: number;
  category: 'important' | 'transactional' | 'promotional';
  consolidated_summary: string;
  latest_subject: string;
  first_email_at: Date;
  last_email_at: Date;
  is_read: boolean;
  is_starred: boolean;
  created_at: Date;
  updated_at: Date;
}

interface EmailThreadCreationAttributes
  extends Optional<EmailThreadAttributes, 'id' | 'created_at' | 'updated_at'> {}

class EmailThread
  extends Model<EmailThreadAttributes, EmailThreadCreationAttributes>
  implements EmailThreadAttributes
{
  public id!: string;
  public user_id!: string;
  public thread_id!: string;
  public sender!: string;
  public sender_email!: string;
  public email_count!: number;
  public category!: 'important' | 'transactional' | 'promotional';
  public consolidated_summary!: string;
  public latest_subject!: string;
  public first_email_at!: Date;
  public last_email_at!: Date;
  public is_read!: boolean;
  public is_starred!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initEmailThread(sequelize: Sequelize) {
  EmailThread.init(
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
      thread_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Gmail thread ID',
      },
      sender: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sender_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      category: {
        type: DataTypes.ENUM('important', 'transactional', 'promotional'),
        allowNull: false,
      },
      consolidated_summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      latest_subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      first_email_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      last_email_at: {
        type: DataTypes.DATE,
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
      tableName: 'email_threads',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'last_email_at'] },
        { fields: ['user_id', 'category'] },
        { fields: ['thread_id'] },
        { fields: ['sender_email'] },
        { fields: ['user_id', 'thread_id'], unique: true },
      ],
    }
  );

  return EmailThread;
}

export { EmailThread };
export type { EmailThreadAttributes, EmailThreadCreationAttributes };
