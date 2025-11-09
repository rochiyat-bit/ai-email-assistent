import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface NotificationPreferences {
  important: boolean;
  transactional: boolean;
  promotional: boolean;
  digest_times: string[];
  timezone: string;
}

interface UserAttributes {
  id: string;
  email: string;
  name: string | null;
  gmail_access_token: string | null;
  gmail_refresh_token: string | null;
  gmail_token_expiry: Date | null;
  gmail_email: string | null;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_plan: 'free' | 'pro' | 'enterprise';
  subscription_start_date: Date | null;
  subscription_end_date: Date | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  notification_preferences: NotificationPreferences;
  language: string;
  onboarding_completed: boolean;
  last_sync_at: Date | null;
  total_emails_processed: number;
  ai_tokens_used: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'name'
    | 'gmail_access_token'
    | 'gmail_refresh_token'
    | 'gmail_token_expiry'
    | 'gmail_email'
    | 'subscription_start_date'
    | 'subscription_end_date'
    | 'stripe_customer_id'
    | 'stripe_subscription_id'
    | 'last_sync_at'
    | 'deleted_at'
    | 'created_at'
    | 'updated_at'
  > {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string | null;
  public gmail_access_token!: string | null;
  public gmail_refresh_token!: string | null;
  public gmail_token_expiry!: Date | null;
  public gmail_email!: string | null;
  public subscription_status!: 'trial' | 'active' | 'expired' | 'cancelled';
  public subscription_plan!: 'free' | 'pro' | 'enterprise';
  public subscription_start_date!: Date | null;
  public subscription_end_date!: Date | null;
  public stripe_customer_id!: string | null;
  public stripe_subscription_id!: string | null;
  public notification_preferences!: NotificationPreferences;
  public language!: string;
  public onboarding_completed!: boolean;
  public last_sync_at!: Date | null;
  public total_emails_processed!: number;
  public ai_tokens_used!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at!: Date | null;
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gmail_access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gmail_refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gmail_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gmail_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subscription_status: {
        type: DataTypes.ENUM('trial', 'active', 'expired', 'cancelled'),
        defaultValue: 'trial',
        allowNull: false,
      },
      subscription_plan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free',
        allowNull: false,
      },
      subscription_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      subscription_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      notification_preferences: {
        type: DataTypes.JSONB,
        defaultValue: {
          important: true,
          transactional: true,
          promotional: false,
          digest_times: ['09:00', '18:00'],
          timezone: 'Asia/Jakarta',
        },
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(10),
        defaultValue: 'en',
        allowNull: false,
      },
      onboarding_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      last_sync_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      total_emails_processed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      ai_tokens_used: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['gmail_email'] },
        { fields: ['subscription_status'] },
        { fields: ['stripe_customer_id'] },
      ],
    }
  );

  return User;
}

export { User };
export type { UserAttributes, UserCreationAttributes, NotificationPreferences };
