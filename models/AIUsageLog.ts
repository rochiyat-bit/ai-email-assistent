import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface AIUsageLogAttributes {
  id: string;
  user_id: string;
  operation_type: 'summarize' | 'categorize' | 'reply' | 'batch_process';
  email_count: number;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  success: boolean;
  error_message: string | null;
  created_at: Date;
}

interface AIUsageLogCreationAttributes
  extends Optional<AIUsageLogAttributes, 'id' | 'created_at'> {}

class AIUsageLog
  extends Model<AIUsageLogAttributes, AIUsageLogCreationAttributes>
  implements AIUsageLogAttributes
{
  public id!: string;
  public user_id!: string;
  public operation_type!: 'summarize' | 'categorize' | 'reply' | 'batch_process';
  public email_count!: number;
  public model_used!: string;
  public tokens_input!: number;
  public tokens_output!: number;
  public total_tokens!: number;
  public cost_usd!: number;
  public latency_ms!: number;
  public success!: boolean;
  public error_message!: string | null;
  public readonly created_at!: Date;
}

export function initAIUsageLog(sequelize: Sequelize) {
  AIUsageLog.init(
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
      operation_type: {
        type: DataTypes.ENUM('summarize', 'categorize', 'reply', 'batch_process'),
        allowNull: false,
      },
      email_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      model_used: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tokens_input: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tokens_output: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      cost_usd: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0,
      },
      latency_ms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: 'ai_usage_logs',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'created_at'] },
        { fields: ['operation_type'] },
        { fields: ['model_used'] },
      ],
    }
  );

  return AIUsageLog;
}

export { AIUsageLog };
export type { AIUsageLogAttributes, AIUsageLogCreationAttributes };
