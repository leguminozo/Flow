import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { supabase } from '@/lib/supabase';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'delivery' | 'subscription' | 'payment' | 'reminder' | 'system';
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Solicitar permisos de notificación
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación no otorgados');
        return false;
      }

      console.log('✅ Permisos de notificación otorgados');
      return true;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Obtener token de notificación
   */
  async getPushToken(): Promise<string | null> {
    try {
      if (!this.expoPushToken) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });
        this.expoPushToken = token.data;
        console.log('📱 Token de notificación obtenido:', this.expoPushToken);
      }
      return this.expoPushToken;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Enviar notificación local inmediata
   */
  async sendLocalNotification(notification: Omit<NotificationData, 'id'>): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: notification.priority,
        },
        trigger: null, // Envío inmediato
      });

      console.log('📨 Notificación local enviada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error enviando notificación local:', error);
      throw error;
    }
  }

  /**
   * Programar notificación local
   */
  async scheduleLocalNotification(notification: Omit<NotificationData, 'id'>, scheduledFor: Date): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: notification.priority,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor((scheduledFor.getTime() - Date.now()) / 1000),
        },
      });

      console.log('⏰ Notificación programada:', notificationId, 'para:', scheduledFor);
      return notificationId;
    } catch (error) {
      console.error('Error programando notificación:', error);
      throw error;
    }
  }

  /**
   * Cancelar notificación programada
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notificación cancelada:', notificationId);
    } catch (error) {
      console.error('Error cancelando notificación:', error);
    }
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error cancelando todas las notificaciones:', error);
    }
  }

  /**
   * Enviar notificación de entrega
   */
  async sendDeliveryNotification(orderId: string, estimatedTime: string): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: '🚚 Tu pedido está en camino',
      body: `Tu entrega llegará en aproximadamente ${estimatedTime}`,
      type: 'delivery',
      priority: 'high',
      data: { orderId, type: 'delivery' },
    };

    await this.sendLocalNotification(notification);
  }

  /**
   * Enviar notificación de suscripción
   */
  async sendSubscriptionNotification(subscriptionName: string, nextDelivery: string): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: '📦 Próxima entrega programada',
      body: `Tu suscripción "${subscriptionName}" se entregará el ${nextDelivery}`,
      type: 'subscription',
      priority: 'normal',
      data: { subscriptionName, nextDelivery, type: 'subscription' },
    };

    await this.sendLocalNotification(notification);
  }

  /**
   * Enviar notificación de pago
   */
  async sendPaymentNotification(amount: number, planName: string): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: '💳 Pago procesado exitosamente',
      body: `Se ha cobrado $${amount.toLocaleString('es-CL')} por tu plan ${planName}`,
      type: 'payment',
      priority: 'normal',
      data: { amount, planName, type: 'payment' },
    };

    await this.sendLocalNotification(notification);
  }

  /**
   * Enviar recordatorio de automatización
   */
  async sendAutomationReminder(automationName: string, daysUntilDelivery: number): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: '⏰ Recordatorio de automatización',
      body: `Tu automatización "${automationName}" se entregará en ${daysUntilDelivery} días`,
      type: 'reminder',
      priority: 'normal',
      data: { automationName, daysUntilDelivery, type: 'reminder' },
    };

    await this.sendLocalNotification(notification);
  }

  /**
   * Programar recordatorio de entrega
   */
  async scheduleDeliveryReminder(orderId: string, deliveryDate: Date, hoursBefore: number = 2): Promise<string> {
    const reminderDate = new Date(deliveryDate.getTime() - (hoursBefore * 60 * 60 * 1000));
    
    const notification: Omit<NotificationData, 'id'> = {
      title: '📦 Tu entrega llegará pronto',
      body: `Tu pedido llegará en ${hoursBefore} horas. ¡Prepárate!`,
      type: 'delivery',
      priority: 'high',
      data: { orderId, type: 'delivery_reminder' },
    };

    return await this.scheduleLocalNotification(notification, reminderDate);
  }

  /**
   * Programar recordatorio de suscripción
   */
  async scheduleSubscriptionReminder(subscriptionName: string, deliveryDate: Date, daysBefore: number = 1): Promise<string> {
    const reminderDate = new Date(deliveryDate.getTime() - (daysBefore * 24 * 60 * 60 * 1000));
    
    const notification: Omit<NotificationData, 'id'> = {
      title: '📅 Recordatorio de suscripción',
      body: `Tu suscripción "${subscriptionName}" se entregará mañana`,
      type: 'subscription',
      priority: 'normal',
      data: { subscriptionName, type: 'subscription_reminder' },
    };

    return await this.scheduleLocalNotification(notification, reminderDate);
  }

  /**
   * Mostrar alerta de confirmación
   */
  showConfirmationAlert(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
      { cancelable: false }
    );
  }

  /**
   * Mostrar alerta de éxito
   */
  showSuccessAlert(title: string, message: string, onPress?: () => void): void {
    Alert.alert(
      `✅ ${title}`,
      message,
      [{ text: 'Perfecto', onPress }]
    );
  }

  /**
   * Mostrar alerta de error
   */
  showErrorAlert(title: string, message: string, onPress?: () => void): void {
    Alert.alert(
      `❌ ${title}`,
      message,
      [{ text: 'Entendido', onPress }]
    );
  }

  /**
   * Mostrar alerta de información
   */
  showInfoAlert(title: string, message: string, onPress?: () => void): void {
    Alert.alert(
      `ℹ️ ${title}`,
      message,
      [{ text: 'OK', onPress }]
    );
  }

  /**
   * Configurar listener para notificaciones recibidas
   */
  setupNotificationListener(onNotificationReceived: (notification: any) => void): () => void {
    const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
    return () => subscription.remove();
  }

  /**
   * Configurar listener para notificaciones respondidas
   */
  setupNotificationResponseListener(onNotificationResponse: (response: any) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
    return () => subscription.remove();
  }

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadNotifications(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo notificaciones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marcando notificación como leída:', error);
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async getUserNotificationSettings(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error obteniendo configuración de notificaciones:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo configuración de notificaciones:', error);
      return null;
    }
  }

  /**
   * Actualizar configuración de notificaciones del usuario
   */
  async updateUserNotificationSettings(userId: string, settings: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
        });

      if (error) {
        console.error('Error actualizando configuración de notificaciones:', error);
      }
    } catch (error) {
      console.error('Error actualizando configuración de notificaciones:', error);
    }
  }
}

export const notificationService = new NotificationService(); 