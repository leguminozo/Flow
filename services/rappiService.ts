import { createClient } from '@supabase/supabase-js';

// Configurar cliente de Supabase
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Interfaces para tipos de datos
export interface RappiProduct {
  product_id: string;
  quantity: number;
  name: string;
  price: number;
}

export interface RappiOrderRequest {
  user_id: string;
  subscription_id: string;
  products: RappiProduct[];
  delivery_address: string;
  delivery_time: string;
}

export interface RappiOrderResponse {
  success: boolean;
  message: string;
  order_id?: string;
  estimated_delivery?: string;
  total_value?: number;
  status?: string;
  error?: string;
  details?: string;
}

export interface RappiWebhookEvent {
  event_type: 'NEW_ORDER' | 'ORDER_READY' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  order_id: string;
  status: string;
  estimated_delivery_time?: string;
  timestamp: string;
}

export interface OrderStatus {
  id: string;
  rappi_order_id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_estimated_time?: string;
  created_at: string;
  updated_at: string;
  flow_name?: string;
  frequency?: string;
}

export interface TimeSavedAnalytics {
  user_id: string;
  email: string;
  subscription_level: string;
  time_saved_minutes: number;
  total_orders: number;
  avg_order_value: number;
  last_order_date?: string;
}

class RappiService {
  /**
   * Crear orden en Rappi a través de Edge Function
   */
  async createOrder(orderData: RappiOrderRequest): Promise<RappiOrderResponse> {
    try {
      console.log('🚀 Creando orden en Rappi:', orderData);

      const { data, error } = await supabase.functions.invoke('create-rappi-order', {
        body: orderData
      });

      if (error) {
        console.error('❌ Error al crear orden:', error);
        return {
          success: false,
          message: 'Error al crear orden',
          error: 'Error al crear orden',
          details: error.message
        };
      }

      console.log('✅ Orden creada exitosamente:', data);
      return {
        success: true,
        message: data.message || 'Orden creada exitosamente',
        order_id: data.order_id,
        estimated_delivery: data.estimated_delivery,
        total_value: data.total_value,
        status: data.status
      };

    } catch (error) {
      console.error('💥 Error crítico al crear orden:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener estado de órdenes del usuario
   */
  async getUserOrders(userId: string): Promise<OrderStatus[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          flows (
            name,
            frequency
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error al obtener órdenes:', error);
        throw error;
      }

      return data?.map(order => ({
        id: order.id,
        rappi_order_id: order.rappi_order_id,
        status: order.status,
        total_amount: order.total_amount,
        delivery_address: order.delivery_address,
        delivery_estimated_time: order.delivery_estimated_time,
        created_at: order.created_at,
        updated_at: order.updated_at,
        flow_name: order.flows?.name,
        frequency: order.flows?.frequency
      })) || [];

    } catch (error) {
      console.error('💥 Error al obtener órdenes:', error);
      throw error;
    }
  }

  /**
   * Obtener analytics de tiempo ahorrado
   */
  async getTimeSavedAnalytics(userId: string): Promise<TimeSavedAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('time_saved_analytics')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error al obtener analytics:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('💥 Error al obtener analytics:', error);
      return null;
    }
  }

  /**
   * Obtener eventos de webhook para una orden
   */
  async getWebhookEvents(orderId: string): Promise<RappiWebhookEvent[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error al obtener eventos webhook:', error);
        throw error;
      }

      return data?.map(event => ({
        event_type: event.event_type,
        order_id: event.order_id,
        status: event.status,
        estimated_delivery_time: event.payload?.estimated_delivery_time,
        timestamp: event.created_at
      })) || [];

    } catch (error) {
      console.error('💥 Error al obtener eventos webhook:', error);
      throw error;
    }
  }

  /**
   * Activar scheduling automático para un usuario
   */
  async activateScheduling(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Activando scheduling automático para usuario:', userId);

      const { data, error } = await supabase.functions.invoke('schedule-recurring-orders', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('❌ Error al activar scheduling:', error);
        return false;
      }

      console.log('✅ Scheduling activado:', data);
      return data.success || false;

    } catch (error) {
      console.error('💥 Error crítico al activar scheduling:', error);
      return false;
    }
  }

  /**
   * Verificar si un usuario tiene plan premium
   */
  async checkPremiumStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_level')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error al verificar estado premium:', error);
        return false;
      }

      return data?.subscription_level === 'super' || data?.subscription_level === 'premium';

    } catch (error) {
      console.error('💥 Error al verificar estado premium:', error);
      return false;
    }
  }

  /**
   * Obtener configuración de Rappi
   */
  async getRappiConfig(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('rappi_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error al obtener configuración Rappi:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('💥 Error al obtener configuración Rappi:', error);
      return null;
    }
  }

  /**
   * Simular webhook de Rappi (para testing)
   */
  async simulateWebhook(orderId: string, eventType: string): Promise<boolean> {
    try {
      console.log('📡 Simulando webhook:', { orderId, eventType });

      const { data, error } = await supabase.functions.invoke('rappi-webhook', {
        body: {
          event_type: eventType,
          order_id: orderId,
          status: eventType === 'ORDER_DELIVERED' ? 'entregada' : 'procesando',
          estimated_delivery_time: '15-30 minutos',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('❌ Error al simular webhook:', error);
        return false;
      }

      console.log('✅ Webhook simulado exitosamente:', data);
      return true;

    } catch (error) {
      console.error('💥 Error crítico al simular webhook:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de flujos activos
   */
  async getActiveFlowsStats(userId: string): Promise<{
    total_flows: number;
    active_flows: number;
    paused_flows: number;
    next_delivery_date?: string;
    monthly_cost: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error al obtener estadísticas de flujos:', error);
        throw error;
      }

      const flows = data || [];
      const activeFlows = flows.filter(f => f.status === 'activo');
      const pausedFlows = flows.filter(f => f.status === 'pausado');

      // Calcular costo mensual estimado (simplificado)
      const monthlyCost = activeFlows.reduce((total, flow) => {
        // Estimación básica de $50 por flujo mensual
        return total + 50;
      }, 0);

      // Obtener próxima entrega
      const nextDelivery = activeFlows
        .filter(f => f.next_delivery)
        .sort((a, b) => new Date(a.next_delivery).getTime() - new Date(b.next_delivery).getTime())[0];

      return {
        total_flows: flows.length,
        active_flows: activeFlows.length,
        paused_flows: pausedFlows.length,
        next_delivery_date: nextDelivery?.next_delivery,
        monthly_cost: monthlyCost
      };

    } catch (error) {
      console.error('💥 Error al obtener estadísticas de flujos:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const rappiService = new RappiService();
export default rappiService; 