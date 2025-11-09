import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

interface SyncJobAttributes {
  id: string;
  user_id: string;
  job_type: 'full_sync' | 'incremental_sync' | 'manual_sync';
  status: 'pending' | 'running' | 'completed' | 'failed';
  emails_fetched: number;
  emails_processed: number;
  started_at: Date | null;
  completed_at: Date | null;
  error_message: string | null;
  history_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface SyncJobCreationAttributes
  extends Optional<
    SyncJobAttributes,
    'id' | 'started_at' | 'completed_at' | 'error_message' | 'history_id' | 'created_at' | 'updated_at'
  > {}

class SyncJob
  extends Model<SyncJobAttributes, SyncJobCreationAttributes>
  implements SyncJobAttributes
{
  public id!: string;
  public user_id!: string;
  public job_type!: 'full_sync' | 'incremental_sync' | 'manual_sync';
  public status!: 'pending' | 'running' | 'completed' | 'failed';
  public emails_fetched!: number;
  public emails_processed!: number;
  public started_at!: Date | null;
  public completed_at!: Date | null;
  public error_message!: string | null;
  public history_id!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initSyncJob(sequelize: Sequelize) {
  SyncJob.init(
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
      job_type: {
        type: DataTypes.ENUM('full_sync', 'incremental_sync', 'manual_sync'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      emails_fetched: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      emails_processed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      history_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Gmail history ID for incremental sync',
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
      tableName: 'sync_jobs',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'created_at'] },
        { fields: ['status'] },
        { fields: ['job_type'] },
      ],
    }
  );

  return SyncJob;
}

export { SyncJob };
export type { SyncJobAttributes, SyncJobCreationAttributes };
