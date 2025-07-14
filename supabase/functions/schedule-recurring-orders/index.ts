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

// Interfaz para flujo recurrente
interface RecurringFlow {
  id: string;
  user_id: string;
  name: string;
  frequency: 'mensual' | 'quincenal' | 'personalizada';
  next_delivery: string;
  status: 'activo' | 'pausado' | 'cancelado';
  products: Array<{
    product_id: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  delivery_address: string;
  delivery_time: string;
}

// Función para calcular próxima fecha de entrega
function calculateNextDelivery(frequency: string, currentDate: Date): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'mensual':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quincenal':
      nextDate.setDate(nextDate.getDate() + 15);
      break;
    case 'personalizada':
      nextDate.setDate(nextDate.getDate() + 30); // Por defecto 30 días
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

// Función para verificar si una fecha es hoy
function isToday(dateString: string): boolean {
  const today = new Date();
  const targetDate = new Date(dateString);
  
  return today.getFullYear() === targetDate.getFullYear() &&
         today.getMonth() === targetDate.getMonth() &&
         today.getDate() === targetDate.getDate();
}

serve(async (req) => {
  try {
    // Manejar CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método inválido: solo POST para scheduling' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔄 Iniciando proceso de scheduling automático...');

    // 1. BUSCAR FLUJOS ACTIVOS CON ENTREGAS PENDIENTES
    console.log('📊 Consultando flujos activos...');
    const { data: activeFlows, error: flowsError } = await supabase
      .from('flows')
      .select(`
        *,
        flow_products (
          quantity,
          products (
            id,
            name,
            price,
            description
          )
        ),
        users (
          id,
          email,
          subscription_level
        ),
        addresses (
          address_text
        )
      `)
      .eq('status', 'activo')
      .lte('next_delivery', new Date().toISOString());

    if (flowsError) {
      console.error('❌ Error al consultar flujos:', flowsError);
      return new Response(
        JSON.stringify({ 
          error: 'Error al consultar flujos activos',
          details: flowsError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!activeFlows || activeFlows.length === 0) {
      console.log('📝 No hay flujos activos con entregas pendientes');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No hay flujos activos con entregas pendientes',
          processed_flows: 0
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📦 Encontrados ${activeFlows.length} flujos activos con entregas pendientes`);

    // 2. PROCESAR CADA FLUJO
    const processedFlows = [];
    const failedFlows = [];

    for (const flow of activeFlows) {
      try {
        console.log(`🔄 Procesando flujo: ${flow.name} (ID: ${flow.id})`);

        // Verificar si la entrega es para hoy
        if (!isToday(flow.next_delivery)) {
          console.log(`⏰ Flujo ${flow.name} no es para hoy, saltando...`);
          continue;
        }

        // Verificar nivel de suscripción del usuario
        const userLevel = flow.users?.subscription_level || 'basico';
        if (userLevel === 'basico') {
          console.log(`⚠️ Usuario ${flow.users?.email} tiene plan básico, saltando...`);
          continue;
        }

        // Preparar productos para la orden
        const products = flow.flow_products?.map(fp => ({
          product_id: fp.products?.id || '',
          quantity: fp.quantity || 1,
          name: fp.products?.name || '',
          price: fp.products?.price || 0
        })).filter(p => p.product_id) || [];

        if (products.length === 0) {
          console.log(`❌ Flujo ${flow.name} no tiene productos válidos`);
          failedFlows.push({
            flow_id: flow.id,
            error: 'No hay productos válidos'
          });
          continue;
        }

        // Obtener dirección de entrega
        const deliveryAddress = flow.addresses?.address_text || 'Dirección no especificada';

        // 3. CREAR ORDEN EN RAPPI
        console.log(`🚀 Creando orden para flujo: ${flow.name}`);
        
        const orderPayload = {
          user_id: flow.user_id,
          subscription_id: flow.id,
          products: products,
          delivery_address: deliveryAddress,
          delivery_time: '9:00-12:00' // Horario por defecto
        };

        // Llamar a la función create-rappi-order
        const orderResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/create-rappi-order`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        if (!orderResponse.ok) {
          const errorText = await orderResponse.text();
          console.error(`❌ Error al crear orden para flujo ${flow.name}:`, errorText);
          failedFlows.push({
            flow_id: flow.id,
            error: errorText
          });
          continue;
        }

        const orderResult = await orderResponse.json();
        console.log(`✅ Orden creada exitosamente para flujo ${flow.name}:`, orderResult.order_id);

        // 4. ACTUALIZAR PRÓXIMA ENTREGA
        const nextDelivery = calculateNextDelivery(flow.frequency, new Date());
        const { error: updateError } = await supabase
          .from('flows')
          .update({ 
            next_delivery: nextDelivery.toISOString()
          })
          .eq('id', flow.id);

        if (updateError) {
          console.error(`❌ Error al actualizar próxima entrega para flujo ${flow.name}:`, updateError);
        }

        // 5. REGISTRAR ÉXITO
        processedFlows.push({
          flow_id: flow.id,
          flow_name: flow.name,
          order_id: orderResult.order_id,
          next_delivery: nextDelivery.toISOString()
        });

        console.log(`✅ Flujo ${flow.name} procesado exitosamente`);

      } catch (error) {
        console.error(`💥 Error procesando flujo ${flow.name}:`, error);
        failedFlows.push({
          flow_id: flow.id,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    // 6. RESPUESTA ÉTICA Y TRASCENDENTAL
    console.log(`🎉 Proceso de scheduling completado. Procesados: ${processedFlows.length}, Fallidos: ${failedFlows.length}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Scheduling automático completado con ética trascendental',
        processed_flows: processedFlows.length,
        failed_flows: failedFlows.length,
        processed: processedFlows,
        failed: failedFlows,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Error crítico en scheduling:', error);
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