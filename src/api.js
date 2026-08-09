// ═══════════════════════════════════════════════════════════
// api.js — Sistema Unificado v5 (reconstruido de App.jsx + server.js)
// ═══════════════════════════════════════════════════════════
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() { return localStorage.getItem('gm_token'); }
function setToken(t) { localStorage.setItem('gm_token', t); }
function logout() { localStorage.removeItem('gm_token'); }

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error API');
  return data;
}

// ─── AUTH ───
export const login = (usuario, password, otp_code) => req('/api/login', { method: 'POST', body: JSON.stringify({ usuario, password, otp_code }) }).then(d => { if (d.token) setToken(d.token); return d; });
export const register = (data) => req('/api/register', { method: 'POST', body: JSON.stringify(data) });
export const getMe = () => req('/api/me');
export const updateMe = (data) => req('/api/me', { method: 'PUT', body: JSON.stringify(data) });
export const forgotPassword = (usuario) => req('/api/forgot-password', { method: 'POST', body: JSON.stringify({ usuario }) });
export const resetPassword = (codigo, nueva_password) => req('/api/reset-password', { method: 'POST', body: JSON.stringify({ codigo, nueva_password }) });
export { getToken, logout };

// ─── CATÁLOGO ───
export const getSecciones = () => req('/api/secciones');
export const getConfig = () => req('/api/config');
export const getDesign = () => req('/api/design');
export const getMenu = () => req('/api/menu');
export const getRedesSociales = () => req('/api/redes-sociales');
export const getListas = () => req('/api/listas');
export const getPreciosFijos = () => req('/api/precios-fijos');
export const getProductos = ({ seccion_id, categoria, q, page, limit } = {}) => {
  const p = new URLSearchParams(); if (seccion_id) p.set('seccion_id', seccion_id); if (categoria) p.set('categoria', categoria); if (q) p.set('q', q); if (page) p.set('page', page); if (limit) p.set('limit', limit);
  return req(`/api/productos?${p.toString()}`);
};
export const getCategorias = (seccion_id) => req(`/api/categorias${seccion_id ? `?seccion_id=${seccion_id}` : ''}`);
export const getPromocionesActivas = (seccion_id) => req(`/api/promociones/activas${seccion_id ? `?seccion_id=${seccion_id}` : ''}`);
export const getBadges = (seccion_id) => req(`/api/badges${seccion_id ? `?seccion_id=${seccion_id}` : ''}`);
export const getMetodosPago = (seccion_id) => req(`/api/metodos-pago${seccion_id ? `?seccion_id=${seccion_id}` : ''}`);
export const getPaginas = () => req('/api/paginas');
export const getSlider = () => req('/api/slider');
export const getPopups = () => req('/api/popups');
export const getDolarBlue = () => req('/api/dolar-blue');
export const getMaintenanceStatus = () => req('/api/maintenance-status');
export const busquedaGlobal = (q) => req(`/api/busqueda-global?q=${encodeURIComponent(q)}`);
export const buscarProductosAdmin = (q) => req(`/api/productos/buscar?q=${encodeURIComponent(q)}`);
export const getProductoImagenes = (id) => req(`/api/producto-imagenes/${id}`);
export const getVariantes = (id) => req(`/api/variantes/${id}`);

// ─── FAVORITOS / NOTIF ───
export const getFavoritos = () => req('/api/favoritos');
export const addFavorito = (id) => req(`/api/favoritos/${id}`, { method: 'POST' });
export const removeFavorito = (id) => req(`/api/favoritos/${id}`, { method: 'DELETE' });
export const notificarStock = (producto_id, email) => req('/api/notificar-stock', { method: 'POST', body: JSON.stringify({ producto_id, email }) });

// ─── ENVÍOS ───
export const getEnvioCustom = (seccion_id) => req(`/api/envio/custom${seccion_id ? `?seccion_id=${seccion_id}` : ''}`);
export const getEnvioCustomAll = () => req('/api/envio/custom/all');
export const cotizarAndreani = (cp_destino, peso, volumen, seccion_id) => req('/api/andreani/cotizar', { method: 'POST', body: JSON.stringify({ cp_destino, peso, volumen, seccion_id }) });
export const getSucursalesAndreani = (cp) => req(`/api/andreani/sucursales?cp=${cp}`);

// ─── CARRITO / PEDIDOS ───
export const createPedidosMulti = (pedidos, is_test) => req('/api/pedidos/multi', { method: 'POST', body: JSON.stringify({ pedidos, is_test }) });
export const validarCupon = (codigo, seccion_id, subtotal, metodo_pago, items) => req('/api/cupones/validar', { method: 'POST', body: JSON.stringify({ codigo, seccion_id, subtotal, metodo_pago, items }) });
export const trackSearch = (q, total) => { /* analytics opcional */ };
export const trackSectionView = (nombre) => { /* analytics opcional */ };

// ─── UPLOADS ───
export const uploadImagen = async (file) => {
  const form = new FormData(); form.append('imagen', file);
  const token = getToken();
  const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const data = await res.json(); if (!res.ok) throw new Error(data.error); return data;
};
export const uploadBase64 = (data, filename) => req('/api/upload-base64', { method: 'POST', body: JSON.stringify({ data, filename }) });

// ─── ADMIN ─── (wrappers genéricos)
export const getStats = (seccion_id, desde, hasta) => { const p = new URLSearchParams(); if (seccion_id && seccion_id !== 'all') p.set('seccion_id', seccion_id); if (desde) p.set('desde', desde); if (hasta) p.set('hasta', hasta); return req(`/api/stats?${p.toString()}`); };
export const getPedidos = (params = {}) => { const p = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => { if (v != null) p.set(k, v); }); return req(`/api/pedidos?${p.toString()}`); };
export const getPedido = (id) => req(`/api/pedidos/${id}`);
export const updatePedido = (id, data) => req(`/api/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const archivarPedido = (id) => req(`/api/pedidos/${id}/archivar`, { method: 'POST' });
export const deletePedido = (id) => req(`/api/pedidos/${id}`, { method: 'DELETE' });
export const createPedido = (data) => req('/api/pedidos', { method: 'POST', body: JSON.stringify(data) });

export const createProducto = (data) => req('/api/productos', { method: 'POST', body: JSON.stringify(data) });
export const updateProducto = (id, data) => req(`/api/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProducto = (id) => req(`/api/productos/${id}`, { method: 'DELETE' });
export const bulkProductos = (productos, reemplazar) => req('/api/productos/bulk', { method: 'POST', body: JSON.stringify({ productos, reemplazar }) });
export const ajustarPrecios = (porcentaje, categoria) => req('/api/precios/ajustar', { method: 'POST', body: JSON.stringify({ porcentaje, categoria }) });
export const resetPrecios = () => req('/api/precios/reset', { method: 'POST' });
export const getHistorialPrecios = () => req('/api/historial-precios');
export const setPrecioFijo = (producto_id, lista_precio_id, precio_fijo) => req('/api/precios-fijos', { method: 'POST', body: JSON.stringify({ producto_id, lista_precio_id, precio_fijo }) });

export const getUsuarios = (q) => req(`/api/usuarios${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const updateUsuario = (id, data) => req(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const aprobarUsuario = (id, lista_precio_id) => req(`/api/usuarios/${id}/aprobar`, { method: 'POST', body: JSON.stringify({ lista_precio_id }) });
export const rechazarUsuario = (id) => req(`/api/usuarios/${id}/rechazar`, { method: 'POST' });
export const resetPassword = (id) => req(`/api/usuarios/${id}/reset-password`, { method: 'POST' });

export const getCupones = () => req('/api/cupones');
export const createCupon = (data) => req('/api/cupones', { method: 'POST', body: JSON.stringify(data) });
export const updateCupon = (id, data) => req(`/api/cupones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCupon = (id) => req(`/api/cupones/${id}`, { method: 'DELETE' });

export const getPromociones = () => req('/api/promociones');
export const createPromocion = (data) => req('/api/promociones', { method: 'POST', body: JSON.stringify(data) });
export const updatePromocion = (id, data) => req(`/api/promociones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePromocion = (id) => req(`/api/promociones/${id}`, { method: 'DELETE' });

export const getPopupsAll = () => req('/api/popups/all');
export const createPopup = (data) => req('/api/popups', { method: 'POST', body: JSON.stringify(data) });
export const updatePopup = (id, data) => req(`/api/popups/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePopup = (id) => req(`/api/popups/${id}`, { method: 'DELETE' });

export const getBadgesAll = () => req('/api/badges/all');
export const createBadge = (data) => req('/api/badges', { method: 'POST', body: JSON.stringify(data) });
export const updateBadge = (id, data) => req(`/api/badges/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBadge = (id) => req(`/api/badges/${id}`, { method: 'DELETE' });

export const getMetodosPagoAll = () => req('/api/metodos-pago/all');
export const createMetodoPago = (data) => req('/api/metodos-pago', { method: 'POST', body: JSON.stringify(data) });
export const updateMetodoPago = (id, data) => req(`/api/metodos-pago/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMetodoPago = (id) => req(`/api/metodos-pago/${id}`, { method: 'DELETE' });

export const getMenuAll = () => req('/api/menu/all');
export const createMenuItem = (data) => req('/api/menu', { method: 'POST', body: JSON.stringify(data) });
export const updateMenuItem = (id, data) => req(`/api/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMenuItem = (id) => req(`/api/menu/${id}`, { method: 'DELETE' });

export const updateRedesSociales = (redes) => req('/api/redes-sociales', { method: 'PUT', body: JSON.stringify({ redes }) });
export const updateDesign = (data) => req('/api/design', { method: 'PUT', body: JSON.stringify(data) });
export const updateConfig = (data) => req('/api/config', { method: 'PUT', body: JSON.stringify(data) });
export const setMaintenanceMode = (activo, mensaje, countdown) => req('/api/maintenance-mode', { method: 'POST', body: JSON.stringify({ activo, mensaje, countdown }) });

export const getSliderAll = () => req('/api/slider/all');
export const createSlider = (data) => req('/api/slider', { method: 'POST', body: JSON.stringify(data) });
export const updateSlider = (id, data) => req(`/api/slider/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSlider = (id) => req(`/api/slider/${id}`, { method: 'DELETE' });

export const createPagina = (data) => req('/api/paginas', { method: 'POST', body: JSON.stringify(data) });
export const updatePagina = (id, data) => req(`/api/paginas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePagina = (id) => req(`/api/paginas/${id}`, { method: 'DELETE' });

export const getEnvioCustomAll_admin = getEnvioCustomAll;
export const createEnvioCustom = (data) => req('/api/envio/custom', { method: 'POST', body: JSON.stringify(data) });
export const updateEnvioCustom = (id, data) => req(`/api/envio/custom/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEnvioCustom = (id) => req(`/api/envio/custom/${id}`, { method: 'DELETE' });

export const addProductoImagen = (producto_id, url, orden) => req('/api/producto-imagenes', { method: 'POST', body: JSON.stringify({ producto_id, url, orden }) });
export const deleteProductoImagen = (id) => req(`/api/producto-imagenes/${id}`, { method: 'DELETE' });
export const addVariante = (data) => req('/api/variantes', { method: 'POST', body: JSON.stringify(data) });
export const updateVariante = (id, data) => req(`/api/variantes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVariante = (id) => req(`/api/variantes/${id}`, { method: 'DELETE' });

export const updateSeccion = (id, data) => req(`/api/secciones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const createSeccion = (data) => req('/api/secciones', { method: 'POST', body: JSON.stringify(data) });
export const deleteSeccion = (id) => req(`/api/secciones/${id}`, { method: 'DELETE' });

export const createLista = (data) => req('/api/listas', { method: 'POST', body: JSON.stringify(data) });
export const updateLista = (id, data) => req(`/api/listas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLista = (id) => req(`/api/listas/${id}`, { method: 'DELETE' });
