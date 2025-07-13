// Función Edge de Supabase para obtener datos de marca
// Esta función consulta una API externa para obtener información de marca
// y la almacena en la tabla brand_assets

import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// Definir tipos para la respuesta
interface BrandAsset {
  brand_name: string;
  domain: string;
  logo_url: string;
  icon_url?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

// Crear cliente de Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Configurar CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Manejar solicitudes CORS preflight
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
}

// Función principal
Deno.serve(async (req) => {
  try {
    // Manejar CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Obtener datos del cuerpo de la solicitud
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un dominio' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Buscando datos de marca para: ${domain}`);

    // Verificar si ya tenemos los datos en la base de datos
    const { data: existingData, error: queryError } = await supabaseClient
      .from('brand_assets')
      .select('*')
      .eq('domain', domain)
      .single();

    if (existingData) {
      console.log(`Datos de marca encontrados en la base de datos para: ${domain}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          brand: existingData,
          source: 'database'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Si no tenemos datos, consultar la API externa
    // Aquí simularemos datos para La Obrera y el Zángano
    const brandData: BrandAsset = {
      brand_name: 'La Obrera y el Zángano',
      domain: domain,
      logo_url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=400',
      icon_url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=100',
      colors: {
        primary: '#D4AF37',
        secondary: '#8B4513',
        accent: '#FFC107',
        background: '#1a1a1a',
        text: '#FFFFFF'
      }
    };

    // Guardar los datos en la base de datos
    const { data: insertedData, error: insertError } = await supabaseClient
      .from('brand_assets')
      .upsert({
        brand_name: brandData.brand_name,
        domain: domain,
        api_response: brandData,
        logo_url: brandData.logo_url,
        icon_url: brandData.icon_url,
        colors: brandData.colors
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al guardar datos de marca:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Error al guardar datos de marca',
          details: insertError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Datos de marca guardados para: ${domain}`);

    // Devolver los datos
    return new Response(
      JSON.stringify({ 
        success: true, 
        brand: insertedData,
        source: 'api'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error en la función Edge:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});