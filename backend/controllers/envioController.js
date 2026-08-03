const axios = require('axios');

// ── Pesos estimados por tipo de producto (en gramos) ──────────────────────────
const PESOS = {
  pulsera: 50, tobillera: 50, aro: 50, aros: 50,
  llavero: 50, strap: 50, collar: 100, pack: 200, mayor: 200, default: 80,
};

function estimarPesoItem(item) {
  const texto = [item.nombre || '', ...(item.categorias || []).map(c => c.nombre || c)]
    .join(' ').toLowerCase();
  for (const [clave, peso] of Object.entries(PESOS)) {
    if (texto.includes(clave)) return peso * item.cantidad;
  }
  return PESOS.default * item.cantidad;
}

function calcularPesoTotal(items) {
  return items.reduce((sum, item) => sum + estimarPesoItem(item), 0) + 100; // +100g embalaje
}

// ── Mercado Envíos ────────────────────────────────────────────────────────────
async function consultarMercadoEnvios(cpDestino, pesoGramos) {
  const token    = process.env.MP_ACCESS_TOKEN;
  const cpOrigen = process.env.CP_ORIGEN || '5730'; // Villa Mercedes, SL

  try {
    // 1. Obtener el seller_id desde el token
    const meRes = await axios.get('https://api.mercadolibre.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });
    const sellerId = meRes.data.id;

    // 2. Calcular tarifas de Mercado Envíos
    const tarifaRes = await axios.get(`https://api.mercadolibre.com/users/${sellerId}/shipping_options`, {
      params: {
        zip_code_from: cpOrigen,
        zip_code_to:   cpDestino,
        dimensions:    `15x20x5,${Math.ceil(pesoGramos)}`, // ancho x largo x alto, peso en gramos
      },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });

    const opciones = (tarifaRes.data.options || [])
      .filter(o => o.list_cost > 0)
      .map(o => ({
        id:     o.shipping_method_id,
        nombre: o.name || 'Mercado Envíos',
        precio: Number(o.list_cost),
        dias:   o.estimated_delivery_time?.date
          ? null
          : (o.estimated_delivery_time?.shipping || null),
      }));

    if (opciones.length === 0) {
      return { disponible: false, error: 'No hay opciones de envío para ese código postal' };
    }

    return { disponible: true, opciones };

  } catch (err) {
    console.error('❌ Error Mercado Envíos:', err.response?.data || err.message);
    return { disponible: false, error: 'No se pudo calcular el envío' };
  }
}

// ── Controller ────────────────────────────────────────────────────────────────
exports.calcularEnvio = async (req, res) => {
  const { codigoPostal, items } = req.body;

  if (!codigoPostal || !items || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos: codigoPostal e items son requeridos' });
  }

  const cpLimpio = String(codigoPostal).replace(/\D/g, '');
  if (cpLimpio.length < 4) {
    return res.status(400).json({ error: 'Código postal inválido' });
  }

  const pesoTotal = calcularPesoTotal(items);
  const resultado = await consultarMercadoEnvios(cpLimpio, pesoTotal);

  res.json({
    pesoTotal,
    codigoPostal: cpLimpio,
    transportistas: {
      mercadoEnvios: resultado,
    },
  });
};