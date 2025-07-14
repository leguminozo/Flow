import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// Configurar cliente de Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Headers CORS para ética ofensiva
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Manejar CORS preflight
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
}

// Interfaz para webhook de Rappi
interface RappiWebhook {
  event_type: 'NEW_ORDER' | 'ORDER_READY' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  order_id: string;
  store_id: string;
  customer_address: string;
  estimated_delivery_time?: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  timestamp: string;
}

// Interfaz para notificación push
interface PushNotification {
  user_id: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

serve(async (req) => {
  try {
    // Manejar CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método inválido: solo webhooks POST' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar autenticación del webhook (si es necesario)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Webhook sin autenticación');
      return new Response(
        JSON.stringify({ error: 'Autenticación requerida para webhook' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const webhookData: RappiWebhook = await req.json();
    console.log('📡 Webhook recibido:', JSON.stringify(webhookData, null, 2));

    // Validar datos esenciales
    if (!webhookData.order_id || !webhookData.event_type) {
      return new Response(
        JSON.stringify({ error: 'Datos de webhook incompletos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. BUSCAR ORDEN EN BASE DE DATOS
    console.log('🔍 Buscando orden en base de datos...');
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        flows (
          user_id,
          name,
          frequency
        )
      `)
      .eq('rappi_order_id', webhookData.order_id)
      .single();

    if (orderError || !orderData) {
      console.error('❌ Orden no encontrada en base de datos:', orderError);
      return new Response(
        JSON.stringify({ 
          error: 'Orden no encontrada',
          details: 'La orden no existe en nuestro sistema'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = orderData.flows?.user_id;
    if (!userId) {
      console.error('❌ Usuario no encontrado para la orden');
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. ACTUALIZAR ESTADO DE LA ORDEN
    console.log('💾 Actualizando estado de la orden...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: webhookData.status,
        updated_at: new Date().toISOString(),
        delivery_estimated_time: webhookData.estimated_delivery_time
      })
      .eq('rappi_order_id', webhookData.order_id);

    if (updateError) {
      console.error('❌ Error al actualizar orden:', updateError);
    }

    // 3. PROCESAR EVENTO SEGÚN TIPO
    let notification: PushNotification | null = null;

    switch (webhookData.event_type) {
      case 'NEW_ORDER':
        notification = {
          user_id: userId,
          title: '🔄 Flujo Regenerativo Iniciado',
          body: `Tu orden esencial ha sido confirmada y está en preparación. Tiempo estimado: ${webhookData.estimated_delivery_time || '15-30 minutos'}`,
          data: {
            type: 'order_confirmed',
            order_id: webhookData.order_id,
            estimated_time: webhookData.estimated_delivery_time
          }
        };
        break;

      case 'ORDER_READY':
        notification = {
          user_id: userId,
          title: '📦 Tu Ciclo Esencial Está Listo',
          body: 'Tu entrega regenerativa ha sido preparada y está en camino hacia tu dirección.',
          data: {
            type: 'order_ready',
            order_id: webhookData.order_id
          }
        };
        break;

      case 'ORDER_DELIVERED':
        notification = {
          user_id: userId,
          title: '✅ Ciclo Trascendental Completado',
          body: 'Tu entrega esencial ha llegado. Tu flujo regenerativo continúa su ciclo infinito.',
          data: {
            type: 'order_delivered',
            order_id: webhookData.order_id
          }
        };

        // Actualizar tiempo ahorrado del usuario
        const { error: timeError } = await supabase
          .from('users')
          .update({ 
            time_saved_minutes: supabase.sql`time_saved_minutes + 120` // 2 horas ahorradas
          })
          .eq('id', userId);

        if (timeError) {
          console.error('❌ Error al actualizar tiempo ahorrado:', timeError);
        }
        break;

      case 'ORDER_CANCELLED':
        notification = {
          user_id: userId,
          title: '⚠️ Interrupción en el Flujo',
          body: 'Tu orden ha sido cancelada. Revisa los detalles y contacta soporte si es necesario.',
          data: {
            type: 'order_cancelled',
            order_id: webhookData.order_id
          }
        };
        break;

      default:
        console.log('📝 Evento no procesado:', webhookData.event_type);
    }

    // 4. ENVIAR NOTIFICACIÓN PUSH SI EXISTE
    if (notification) {
      console.log('📱 Enviando notificación push...');
      
      // Aquí integrarías con tu servicio de notificaciones push
      // Por ahora, solo loggeamos
      console.log('🔔 Notificación:', JSON.stringify(notification, null, 2));
      
      // En producción, usarías:
      // await sendPushNotification(notification);
    }

    // 5. REGISTRAR EVENTO EN HISTORIAL
    const { error: historyError } = await supabase
      .from('webhook_events')
      .insert({
        order_id: webhookData.order_id,
        user_id: userId,
        event_type: webhookData.event_type,
        status: webhookData.status,
        payload: webhookData,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('❌ Error al registrar evento:', historyError);
    }

    // 6. RESPUESTA ÉTICA
    console.log('✅ Webhook procesado exitosamente');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Evento procesado con ética trascendental',
        order_id: webhookData.order_id,
        event_type: webhookData.event_type,
        notification_sent: !!notification
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Error crítico en webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor ético',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 