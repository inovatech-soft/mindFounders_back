/**
 * Notification Service
 * Handles scheduling and sending of user notifications
 */

import cron from 'node-cron';
import { getUsersWithEnabledNotifications } from './preferencesService.js';
import { createStructuredResponse } from '../config/openai.js';
import logger from '../utils/logger.js';

// Store active cron jobs
const activeCronJobs = new Map();

/**
 * Generate motivational message using OpenAI
 */
async function generateMotivationalMessage(userContext) {
  try {
    const messages = [
      {
        role: 'system',
        content: `Você é um conselheiro sábio e motivacional. Gere uma mensagem inspiradora curta (máximo 2 parágrafos) baseada no contexto do usuário. Use tom acolhedor e encorajador.`
      },
      {
        role: 'user',
        content: `Gere uma mensagem motivacional personalizada para: Nome: ${userContext.name}. Mantenha a mensagem positiva, inspiradora e aplicável ao dia a dia.`
      }
    ];

    const completion = await createStructuredResponse({
      messages,
      responseFormat: {
        type: "object",
        properties: {
          message: { type: "string" },
          blessing: { type: "string" }
        },
        required: ["message", "blessing"],
        additionalProperties: false
      },
      temperature: 0.8,
      maxTokens: 300
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return `${parsed.message}\n\n${parsed.blessing}`;
    }

    return "Que este dia seja abençoado com sabedoria, paz e alegria. Confie no seu potencial e siga em frente com coragem! 🙏✨";
  } catch (error) {
    logger.error('Error generating motivational message:', error);
    return "Que este dia seja abençoado com sabedoria, paz e alegria. Confie no seu potencial e siga em frente com coragem! 🙏✨";
  }
}

/**
 * Send notification (placeholder for actual implementation)
 * In a real app, this would integrate with push notification services,
 * email services, etc.
 */
async function sendNotification(user, message, type = 'motivational') {
  try {
    // TODO: Implement actual notification sending
    // For now, just log the notification
    logger.info(`📱 Notification sent to ${user.name} (${user.email}):`, {
      type,
      message: message.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    // Here you would integrate with:
    // - Firebase Cloud Messaging (FCM) for mobile push notifications
    // - Email service (SendGrid, AWS SES, etc.)
    // - WebSocket for real-time web notifications
    // - SMS service (Twilio, etc.)
    
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    logger.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send daily notifications to all eligible users
 */
async function sendDailyNotifications() {
  try {
    logger.info('🔄 Starting daily notifications job...');
    
    const users = await getUsersWithEnabledNotifications();
    const dailyUsers = users.filter(pref => pref.notificationType === 'daily');
    
    if (dailyUsers.length === 0) {
      logger.info('📭 No users with daily notifications enabled');
      return;
    }

    logger.info(`📨 Sending daily notifications to ${dailyUsers.length} users`);

    for (const userPref of dailyUsers) {
      try {
        const message = await generateMotivationalMessage({
          name: userPref.user.name
        });

        await sendNotification(userPref.user, message, 'daily_motivational');
      } catch (error) {
        logger.error(`Error sending daily notification to user ${userPref.user.id}:`, error);
      }
    }

    logger.info('✅ Daily notifications job completed');
  } catch (error) {
    logger.error('❌ Error in daily notifications job:', error);
  }
}

/**
 * Send weekly notifications to eligible users
 */
async function sendWeeklyNotifications() {
  try {
    logger.info('🔄 Starting weekly notifications job...');
    
    const users = await getUsersWithEnabledNotifications();
    const today = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    
    const weeklyUsers = users.filter(pref => 
      pref.notificationType === 'weekly' && 
      pref.notificationDays.includes(today)
    );
    
    if (weeklyUsers.length === 0) {
      logger.info(`📭 No users with weekly notifications enabled for ${today}`);
      return;
    }

    logger.info(`📨 Sending weekly notifications to ${weeklyUsers.length} users for ${today}`);

    for (const userPref of weeklyUsers) {
      try {
        const message = await generateMotivationalMessage({
          name: userPref.user.name
        });

        await sendNotification(userPref.user, message, 'weekly_motivational');
      } catch (error) {
        logger.error(`Error sending weekly notification to user ${userPref.user.id}:`, error);
      }
    }

    logger.info('✅ Weekly notifications job completed');
  } catch (error) {
    logger.error('❌ Error in weekly notifications job:', error);
  }
}

/**
 * Initialize notification scheduler
 */
export function initializeNotificationScheduler() {
  try {
    logger.info('🚀 Initializing notification scheduler...');

    // Stop existing jobs
    stopNotificationScheduler();

    // Schedule daily notifications check - runs every hour to catch different user times
    const dailyJob = cron.schedule('0 * * * *', async () => {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${Math.floor(currentMinute / 60) * 60}`.padStart(2, '0');
      
      // Only run for users who have notifications at this exact hour
      try {
        const users = await getUsersWithEnabledNotifications();
        const usersForThisTime = users.filter(pref => 
          pref.notificationType === 'daily' && 
          pref.notificationTime && 
          pref.notificationTime.substring(0, 2) === currentHour.toString().padStart(2, '0')
        );

        if (usersForThisTime.length > 0) {
          logger.info(`📅 Sending notifications to ${usersForThisTime.length} users at ${currentHour}:00`);
          await sendDailyNotifications();
        }
      } catch (error) {
        logger.error('Error in hourly notification check:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule weekly notifications check - runs every hour to catch different user times
    const weeklyJob = cron.schedule('0 * * * *', async () => {
      const currentHour = new Date().getHours();
      const today = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
      
      try {
        const users = await getUsersWithEnabledNotifications();
        const usersForThisTime = users.filter(pref => 
          pref.notificationType === 'weekly' && 
          pref.notificationDays.includes(today) &&
          pref.notificationTime &&
          pref.notificationTime.substring(0, 2) === currentHour.toString().padStart(2, '0')
        );

        if (usersForThisTime.length > 0) {
          logger.info(`📅 Sending weekly notifications to ${usersForThisTime.length} users at ${currentHour}:00 on ${today}`);
          await sendWeeklyNotifications();
        }
      } catch (error) {
        logger.error('Error in hourly weekly notification check:', error);
      }
    }, {
      scheduled: false
    });

    // Store jobs for management
    activeCronJobs.set('daily', dailyJob);
    activeCronJobs.set('weekly', weeklyJob);

    // Start the jobs
    dailyJob.start();
    weeklyJob.start();

    logger.info('✅ Notification scheduler initialized successfully');
    logger.info('📋 Active jobs: daily notifications (hourly check), weekly notifications (hourly check)');

  } catch (error) {
    logger.error('❌ Error initializing notification scheduler:', error);
    throw error;
  }
}

/**
 * Stop notification scheduler
 */
export function stopNotificationScheduler() {
  try {
    logger.info('🛑 Stopping notification scheduler...');
    
    for (const [jobName, job] of activeCronJobs) {
      if (job) {
        job.stop();
        job.destroy();
        logger.info(`✅ Stopped ${jobName} notification job`);
      }
    }
    
    activeCronJobs.clear();
    logger.info('✅ Notification scheduler stopped');
  } catch (error) {
    logger.error('❌ Error stopping notification scheduler:', error);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning: activeCronJobs.size > 0,
    activeJobs: Array.from(activeCronJobs.keys()),
    totalJobs: activeCronJobs.size
  };
}

/**
 * Send test notification
 */
export async function sendTestNotification(userId) {
  try {
    // This would be used for testing notifications
    const message = await generateMotivationalMessage({ name: 'Usuário Teste' });
    
    // In a real implementation, you'd get user details and send actual notification
    logger.info(`🧪 Test notification generated: ${message.substring(0, 100)}...`);
    
    return { success: true, message };
  } catch (error) {
    logger.error('Error sending test notification:', error);
    throw error;
  }
}

export default {
  initializeNotificationScheduler,
  stopNotificationScheduler,
  getSchedulerStatus,
  sendTestNotification
};
