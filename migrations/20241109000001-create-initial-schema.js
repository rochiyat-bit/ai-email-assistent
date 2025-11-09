'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gmail_access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gmail_refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gmail_token_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      gmail_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      subscription_status: {
        type: Sequelize.ENUM('trial', 'active', 'expired', 'cancelled'),
        defaultValue: 'trial',
        allowNull: false,
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free',
        allowNull: false,
      },
      subscription_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      subscription_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      stripe_customer_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      stripe_subscription_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notification_preferences: {
        type: Sequelize.JSONB,
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
        type: Sequelize.STRING(10),
        defaultValue: 'en',
        allowNull: false,
      },
      onboarding_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_emails_processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      ai_tokens_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['gmail_email']);
    await queryInterface.addIndex('users', ['subscription_status']);
    await queryInterface.addIndex('users', ['stripe_customer_id']);

    // Create processed_emails table
    await queryInterface.createTable('processed_emails', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      thread_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('important', 'transactional', 'promotional'),
        allowNull: false,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sender: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sender_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      subject: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      snippet: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      labels: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      has_attachments: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_starred: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ai_confidence_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      ai_model_used: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tokens_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('processed_emails', ['user_id', 'category']);
    await queryInterface.addIndex('processed_emails', ['user_id', 'received_at']);
    await queryInterface.addIndex('processed_emails', ['email_id'], { unique: true });
    await queryInterface.addIndex('processed_emails', ['thread_id']);
    await queryInterface.addIndex('processed_emails', ['sender_email']);
    await queryInterface.addIndex('processed_emails', ['is_read']);
    await queryInterface.addIndex('processed_emails', ['is_starred']);

    // Create email_threads table
    await queryInterface.createTable('email_threads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      thread_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sender: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sender_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      category: {
        type: Sequelize.ENUM('important', 'transactional', 'promotional'),
        allowNull: false,
      },
      consolidated_summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      latest_subject: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      first_email_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      last_email_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_starred: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('email_threads', ['user_id', 'last_email_at']);
    await queryInterface.addIndex('email_threads', ['user_id', 'category']);
    await queryInterface.addIndex('email_threads', ['thread_id']);
    await queryInterface.addIndex('email_threads', ['sender_email']);
    await queryInterface.addIndex('email_threads', ['user_id', 'thread_id'], { unique: true });

    // Create ai_usage_logs table
    await queryInterface.createTable('ai_usage_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      operation_type: {
        type: Sequelize.ENUM('summarize', 'categorize', 'reply', 'batch_process'),
        allowNull: false,
      },
      email_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      model_used: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tokens_input: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tokens_output: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      cost_usd: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0,
      },
      latency_ms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('ai_usage_logs', ['user_id', 'created_at']);
    await queryInterface.addIndex('ai_usage_logs', ['operation_type']);
    await queryInterface.addIndex('ai_usage_logs', ['model_used']);

    // Create notification_logs table
    await queryInterface.createTable('notification_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notification_type: {
        type: Sequelize.ENUM('digest', 'realtime', 'important_alert'),
        allowNull: false,
      },
      category_filter: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      emails_included: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      digest_content: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      delivery_status: {
        type: Sequelize.ENUM('sent', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('notification_logs', ['user_id', 'sent_at']);
    await queryInterface.addIndex('notification_logs', ['notification_type']);
    await queryInterface.addIndex('notification_logs', ['delivery_status']);

    // Create draft_replies table
    await queryInterface.createTable('draft_replies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      thread_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      reply_content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reply_subject: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tone: {
        type: Sequelize.ENUM('professional', 'casual', 'friendly', 'formal'),
        allowNull: false,
        defaultValue: 'professional',
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      ai_model_used: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tokens_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('draft_replies', ['user_id', 'created_at']);
    await queryInterface.addIndex('draft_replies', ['email_id']);
    await queryInterface.addIndex('draft_replies', ['thread_id']);
    await queryInterface.addIndex('draft_replies', ['is_sent']);

    // Create sync_jobs table
    await queryInterface.createTable('sync_jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      job_type: {
        type: Sequelize.ENUM('full_sync', 'incremental_sync', 'manual_sync'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'running', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      emails_fetched: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      emails_processed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      history_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('sync_jobs', ['user_id', 'created_at']);
    await queryInterface.addIndex('sync_jobs', ['status']);
    await queryInterface.addIndex('sync_jobs', ['job_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sync_jobs');
    await queryInterface.dropTable('draft_replies');
    await queryInterface.dropTable('notification_logs');
    await queryInterface.dropTable('ai_usage_logs');
    await queryInterface.dropTable('email_threads');
    await queryInterface.dropTable('processed_emails');
    await queryInterface.dropTable('users');
  },
};
