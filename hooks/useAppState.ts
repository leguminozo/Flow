import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';

export interface AppStateData {
  user: {
    id: string;
    email: string;
    subscriptionLevel: 'free' | 'premium' | 'super';
    timeSavedMinutes: number;
    totalOrders: number;
    activeSubscriptions: number;
  } | null;
  subscriptions: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'cancelled';
    nextDelivery: string;
    totalPrice: number;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }>;
  analytics: {
    timeSaved: number;
    moneySaved: number;
    deliveriesCompleted: number;
    averageOrderValue: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface AppActions {
  updateUser: (userData: Partial<AppStateData['user']>) => void;
  addSubscription: (subscription: AppStateData['subscriptions'][0]) => void;
  updateSubscription: (id: string, updates: Partial<AppStateData['subscriptions'][0]>) => void;
  removeSubscription: (id: string) => void;
  addNotification: (notification: Omit<AppStateData['notifications'][0], 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  updateAnalytics: (analytics: Partial<AppStateData['analytics']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
}

export function useAppState(): [AppStateData, AppActions] {
  const [state, setState] = useState<AppStateData>({
    user: null,
    subscriptions: [],
    notifications: [],
    analytics: {
      timeSaved: 0,
      moneySaved: 0,
      deliveriesCompleted: 0,
      averageOrderValue: 0,
    },
    isLoading: false,
    error: null,
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Manejar cambios en el estado de la app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App vuelve a estar activa, refrescar datos
        refreshData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadInitialData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Cargar datos del usuario
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Cargar perfil del usuario
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setState(prev => ({
            ...prev,
            user: {
              id: user.id,
              email: user.email || '',
              subscriptionLevel: profile.subscription_level || 'free',
              timeSavedMinutes: profile.time_saved_minutes || 0,
              totalOrders: profile.total_orders || 0,
              activeSubscriptions: profile.active_subscriptions || 0,
            }
          }));
        }

        // Cargar suscripciones
        await loadSubscriptions(user.id);
        
        // Cargar notificaciones
        await loadNotifications(user.id);
        
        // Cargar analytics
        await loadAnalytics(user.id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al cargar datos iniciales' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadSubscriptions = async (userId: string) => {
    try {
      const { data: subscriptions } = await supabase
        .from('flows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (subscriptions) {
        setState(prev => ({
          ...prev,
          subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            name: sub.name,
            status: sub.status,
            nextDelivery: sub.next_delivery,
            totalPrice: sub.total_price,
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadNotifications = async (userId: string) => {
    try {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifications) {
        setState(prev => ({
          ...prev,
          notifications: notifications.map(notif => ({
            id: notif.id,
            title: notif.title,
            body: notif.body,
            read: notif.read,
            createdAt: notif.created_at,
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadAnalytics = async (userId: string) => {
    try {
      const { data: analytics } = await supabase
        .from('time_saved_analytics')
        .select('*')
        .eq('id', userId)
        .single();

      if (analytics) {
        setState(prev => ({
          ...prev,
          analytics: {
            timeSaved: analytics.time_saved_minutes || 0,
            moneySaved: analytics.money_saved || 0,
            deliveriesCompleted: analytics.total_orders || 0,
            averageOrderValue: analytics.avg_order_value || 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const updateUser = useCallback((userData: Partial<AppStateData['user']>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }, []);

  const addSubscription = useCallback((subscription: AppStateData['subscriptions'][0]) => {
    setState(prev => ({
      ...prev,
      subscriptions: [subscription, ...prev.subscriptions]
    }));
  }, []);

  const updateSubscription = useCallback((id: string, updates: Partial<AppStateData['subscriptions'][0]>) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      )
    }));
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(sub => sub.id !== id)
    }));
  }, []);

  const addNotification = useCallback((notification: Omit<AppStateData['notifications'][0], 'id' | 'createdAt'>) => {
    const newNotification: AppStateData['notifications'][0] = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, 9)] // Mantener solo las últimas 10
    }));
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    }));

    // Actualizar en la base de datos
    try {
      await notificationService.markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const updateAnalytics = useCallback((analytics: Partial<AppStateData['analytics']>) => {
    setState(prev => ({
      ...prev,
      analytics: { ...prev.analytics, ...analytics }
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const refreshData = useCallback(async () => {
    if (state.user?.id) {
      await Promise.all([
        loadSubscriptions(state.user.id),
        loadNotifications(state.user.id),
        loadAnalytics(state.user.id),
      ]);
    }
  }, [state.user?.id]);

  const actions: AppActions = {
    updateUser,
    addSubscription,
    updateSubscription,
    removeSubscription,
    addNotification,
    markNotificationAsRead,
    updateAnalytics,
    setLoading,
    setError,
    refreshData,
  };

  return [state, actions];
} 