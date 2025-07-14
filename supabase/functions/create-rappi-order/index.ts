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

// Interfaz para datos de suscripción
interface SubscriptionData {
  user_id: string;
  subscription_id: string;
  products: Array<{
    product_id: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  delivery_address: string;
  delivery_time: string;
}

// Interfaz para respuesta de Rappi
interface RappiOrderResponse {
  orderId: string;
  status: string;
  estimatedDeliveryTime: string;
}

serve(async (req) => {
  try {
    // Manejar CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método inválido: rompe la norma' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: SubscriptionData = await req.json();
    const { user_id, subscription_id, products, delivery_address, delivery_time } = body;

    if (!user_id || !subscription_id || !products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Datos esenciales faltantes para el flujo vital' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔄 Iniciando flujo regenerativo para usuario: ${user_id}`);

    // 1. AUTENTICACIÓN OAUTH ÉTICA (token fresco cada call)
    console.log('🔐 Obteniendo token de autenticación...');
    const tokenResponse = await fetch('https://rests-integrations.auth0.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('RAPPI_CLIENT_ID'),
        client_secret: Deno.env.get('RAPPI_CLIENT_SECRET'),
        audience: 'https://int-public-api-v2/api',
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      console.error('❌ Error en autenticación OAuth:', await tokenResponse.text());
      return new Response(
        JSON.stringify({ 
          error: 'Barrera de autenticación detectada',
          details: 'No se pudo obtener token de acceso'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('✅ Token de autenticación obtenido exitosamente');

    // 2. OBTENER DATOS DE SUSCRIPCIÓN DE LA BASE DE DATOS
    console.log('📊 Consultando datos de suscripción...');
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('flows')
      .select(`
        *,
        flow_products (
          quantity,
          products (
            name,
            price,
            description
          )
        )
      `)
      .eq('id', subscription_id)
      .eq('user_id', user_id)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('❌ Error al obtener datos de suscripción:', subscriptionError);
      return new Response(
        JSON.stringify({ 
          error: 'Suscripción no encontrada o acceso denegado',
          details: subscriptionError
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. PREPARAR ORDEN PARA RAPPI (formato ético)
    const orderItems = products.map(product => ({
      id: product.product_id,
      name: product.name,
      quantity: product.quantity,
      unit_price: product.price,
      total_price: product.price * product.quantity
    }));

    const totalOrderValue = orderItems.reduce((sum, item) => sum + item.total_price, 0);

    const rappiOrderPayload = {
      store_id: Deno.env.get('RAPPI_STORE_ID'),
      customer_address: delivery_address,
      delivery_time: delivery_time,
      items: orderItems,
      total_value: totalOrderValue,
      payment_method: 'credit_card', // O el método configurado
      special_instructions: 'Entrega regenerativa - EssentialFlow'
    };

    console.log('📦 Preparando orden para Rappi:', JSON.stringify(rappiOrderPayload, null, 2));

    // 4. CREAR ORDEN EN RAPPI
    console.log('🚀 Enviando orden a Rappi...');
    const orderResponse = await fetch('https://microservices.dev.rappi.com/api/v2/restaurants-integrations-public-api/orders', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${access_token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(rappiOrderPayload)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('❌ Error al crear orden en Rappi:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Barrera en Rappi detectada',
          details: errorText,
          status: orderResponse.status
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const rappiResponse: RappiOrderResponse = await orderResponse.json();
    console.log('✅ Orden creada exitosamente en Rappi:', rappiResponse);

    // 5. ACTUALIZAR BASE DE DATOS CON ESTADO TRASCENDENTAL
    console.log('💾 Actualizando estado en base de datos...');
    const { error: updateError } = await supabase
      .from('flows')
      .update({ 
        next_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
        status: 'activo'
      })
      .eq('id', subscription_id);

    if (updateError) {
      console.error('❌ Error al actualizar suscripción:', updateError);
      // No fallamos aquí, solo loggeamos
    }

    // 6. REGISTRAR ORDEN EN HISTORIAL
    const { error: historyError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id,
        flow_id: subscription_id,
        rappi_order_id: rappiResponse.orderId,
        status: 'creada',
        total_amount: totalOrderValue,
        delivery_address: delivery_address,
        items: orderItems,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('❌ Error al registrar historial:', historyError);
    }

    // 7. RESPUESTA ÉTICA Y TRASCENDENTAL
    console.log('🎉 Flujo esencial activado exitosamente');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Flujo esencial activado: orden regenerativa en camino',
        order_id: rappiResponse.orderId,
        estimated_delivery: rappiResponse.estimatedDeliveryTime,
        total_value: totalOrderValue,
        status: 'fluyendo'
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Error crítico en flujo regenerativo:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor ético',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 