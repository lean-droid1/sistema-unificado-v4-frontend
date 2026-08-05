
import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import * as api from './api';
import { Truck, Shield, CreditCard, Clock, Star, Lock, Zap, Package, Heart, ThumbsUp, CheckCircle, Gift, Headphones, Phone, Mail, MapPin, Globe, Award, BadgeCheck, ShoppingCart, Tag, Percent, RefreshCw, Send, Eye, Users, Wrench, Wifi, Battery, Cpu, Monitor, Smartphone, Camera, Bookmark, Bell, MessageCircle, HelpCircle, Info, AlertCircle, Home, BarChart3, DollarSign, Boxes, Layers, Megaphone, Store, Palette, Menu, FileText, PenLine, Puzzle, User, Settings, ChevronRight, ChevronDown, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const fmt = n => Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtARS = n => `$${fmt(n)}`;
const openWA = (num, msg) => window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,'_blank');

const ICON_MAP = { truck:Truck, shield:Shield, 'credit-card':CreditCard, clock:Clock, star:Star, lock:Lock, zap:Zap, package:Package, heart:Heart, 'thumbs-up':ThumbsUp, 'check-circle':CheckCircle, gift:Gift, headphones:Headphones, phone:Phone, mail:Mail, 'map-pin':MapPin, globe:Globe, award:Award, 'badge-check':BadgeCheck, 'shopping-cart':ShoppingCart, tag:Tag, percent:Percent, 'refresh-cw':RefreshCw, send:Send, eye:Eye, users:Users, wrench:Wrench, wifi:Wifi, battery:Battery, cpu:Cpu, monitor:Monitor, smartphone:Smartphone, camera:Camera, bookmark:Bookmark, bell:Bell, 'message-circle':MessageCircle, 'help-circle':HelpCircle, info:Info, 'alert-circle':AlertCircle };
const ICON_LIST = Object.keys(ICON_MAP);
function RenderIcon({value,size=20,color}){ if(!value) return null; if(value.startsWith('http')||value.startsWith('/')||value.startsWith('data:')) return <img src={value} alt="" style={{width:size,height:size,objectFit:'contain',borderRadius:4}}/>; const I=ICON_MAP[value]; if(I) return <I size={size} color={color||'currentColor'}/>; return <span style={{fontSize:size*0.9}}>{value}</span>; }

const Ctx = createContext();
function useToast(){
  const [toasts,setToasts]=useState([]);
  const show=useCallback((msg,type='success')=>{ const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000); },[]);
  const ToastContainer=()=><div style={{position:'fixed',top:16,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>{toasts.map(t=><div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>)}</div>;
  return {show,ToastContainer};
}

// --- Andreani Calculator Component (like image example) ---
function AndreaniCalculator({seccionId, peso, volumen, onSelect}){
  const [cp,setCp]=useState('1888');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const {show}=useContext(Ctx);
  const calcular=async()=>{
    if(!cp||cp.length<4) return show('Ingresá CP','error');
    setLoading(true);
    try{
      const r=await api.cotizarAndreani(cp, peso||1, volumen||5000, seccionId);
      // Mock fallback si Andreani no configurado
      if(!r.tarifas && !r.domicilio){
        setResult({
          domicilio:{precio:10385.17, dias:'1 a 3 días hábiles', tipo:'Envío a domicilio'},
          sucursal:{precio:6389.12, dias:'1 a 3 días hábiles', direccion:'Av. Gral. José de San Martin 2326, Florencio Varela, Buenos Aires - Lunes a viernes de 08:00 a 18:00 - Sábados de 08:00 a 13:00hs', tipo:'Envío a sucursal'}
        });
      }else{
        // Normalizar respuesta real
        setResult({
          domicilio:{precio: r.domicilio?.precio||r.tarifas?.[0]?.precio||10385, dias:'1 a 3 días hábiles', tipo:'Envío a domicilio'},
          sucursal:{precio: r.sucursal?.precio||6389, dias:'1 a 3 días hábiles', direccion:'Retiro en sucursal del correo', tipo:'Envío a sucursal'}
        });
      }
    }catch(e){ show(e.message,'error'); }
    setLoading(false);
  };
  return(
    <div className="andreani-box">
      <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:800}}><Truck size={18}/> Calculá el costo de envío</div>
      <div className="andreani-input-row">
        <input value={cp} onChange={e=>setCp(e.target.value)} placeholder="Código postal" />
        <button onClick={calcular} disabled={loading}>{loading?'...' :'CALCULAR'}</button>
      </div>
      {result && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginTop:12,marginBottom:8}}>Envío a domicilio</div>
          <div className={`andreani-option ${onSelect?'':''}`} onClick={()=>onSelect && onSelect({tipo:'andreani_domicilio', precio:result.domicilio.precio, nombre:result.domicilio.tipo, cp})}>
            <div className="andreani-logo">A</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{result.domicilio.tipo}</div>
              <div style={{fontSize:13}}>${fmt(result.domicilio.precio)} - {result.domicilio.dias} (luego de ser despachado)</div>
            </div>
          </div>
          <div style={{fontSize:13,fontWeight:700,marginTop:12,marginBottom:8}}>Retirar en sucursal del correo</div>
          <div className="andreani-option" onClick={()=>onSelect && onSelect({tipo:'andreani_sucursal', precio:result.sucursal.precio, nombre:result.sucursal.tipo, cp})}>
            <div className="andreani-logo" style={{background:'#000'}}>A</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{result.sucursal.tipo}</div>
              <div style={{fontSize:12}}>${fmt(result.sucursal.precio)} - {result.sucursal.dias} (luego de ser despachado)<br/>{result.sucursal.direccion}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Progress barra envio gratis ---
function EnvioProgress({subtotal, gratisDesde, seccionNombre}){
  if(!gratisDesde || gratisDesde<=0) return null;
  const pct=Math.min(100, (subtotal/gratisDesde)*100);
  const falta=gratisDesde-subtotal;
  return(
    <div style={{margin:'12px 0'}}>
      <div className="envio-progress"><div className="envio-progress-fill" style={{width:`${pct}%`}}></div></div>
      <div className="envio-progress-text">{falta<=0? `🎉 ¡Tenés envío gratis en ${seccionNombre}!` : `Te faltan ${fmtARS(falta)} para envío gratis en ${seccionNombre}`}</div>
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [page,setPage]=useState('landing');
  const [loading,setLoading]=useState(true);
  const [dark,setDark]=useState(()=>localStorage.getItem('gm_dark')==='true');
  const [mobileMenu,setMobileMenu]=useState(false);
  const {show:toast, ToastContainer}=useToast();
  const [secciones,setSecciones]=useState([]);
  const [config,setConfig]=useState({});
  const [design,setDesign]=useState({});
  const [productos,setProductos]=useState([]);
  const [cart,setCart]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('gm_cart')||'[]'); }catch{ return []; } });
  const [q,setQ]=useState('');
  const [selectedSeccion,setSelectedSeccion]=useState(null);
  const [isTestMode,setIsTestMode]=useState(()=>localStorage.getItem('gm_test')==='true');
  const [multiStoreEnabled,setMultiStoreEnabled]=useState(()=>localStorage.getItem('gm_multi')!=='false');
  const [allowedMix,setAllowedMix]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('gm_mix')||'[]'); }catch{ return []; } });
  const [selectedEnvios,setSelectedEnvios]=useState({}); // seccion_id -> envio seleccionado
  const [cpDestino,setCpDestino]=useState('1888');

  // Parallax effect setup
  useEffect(()=>{
    if(page!=='landing' && page!=='catalogo') return;
    const ctx=gsap.context(()=>{
      gsap.utils.toArray('.kicks-parallax-card').forEach(card=>{
        const img=card.querySelector('.kicks-parallax-img');
        if(!img) return;
        gsap.fromTo(img, {scale:0.75}, {scale:1.15, ease:'none', scrollTrigger:{trigger:card, start:'top bottom', end:'bottom top', scrub:1.2}});
      });
    });
    return()=>ctx.revert();
  },[page,productos]);

  useEffect(()=>{
    (async()=>{
      try{
        const [secs,cfg,des]=await Promise.all([api.getSecciones().catch(()=>[]), api.getConfig().catch(()=>({})), api.getDesign().catch(()=>({}))]);
        setSecciones(secs); setConfig(cfg); setDesign(des);
        if(api.getToken()){
          try{ const me=await api.getMe(); setUser(me); }catch{ api.setToken(null); }
        }
      }finally{ setLoading(false); }
    })();
  },[]);

  useEffect(()=>{ localStorage.setItem('gm_cart', JSON.stringify(cart)); },[cart]);
  useEffect(()=>{ localStorage.setItem('gm_test', isTestMode?'true':'false'); },[isTestMode]);
  useEffect(()=>{ localStorage.setItem('gm_multi', multiStoreEnabled?'true':'false'); },[multiStoreEnabled]);
  useEffect(()=>{ localStorage.setItem('gm_mix', JSON.stringify(allowedMix)); },[allowedMix]);

  const addToCart=(prod, qty=1)=>{
    // Validar stock si no permite sin stock y no es digital
    const sec=secciones.find(s=>s.id===prod.seccion_id);
    const puedeSinStock = prod.permitir_sin_stock || prod.es_digital || sec?.permitir_sin_stock || sec?.ignorar_stock;
    if(!puedeSinStock && prod.stock < qty){
      toast(`Sin stock disponible (${prod.stock})`,'error'); return;
    }
    setCart(prev=>{
      const idx=prev.findIndex(p=>p.id===prod.id);
      if(idx>=0){ const copy=[...prev]; copy[idx]={...copy[idx], qty:copy[idx].qty+qty}; return copy; }
      return [...prev, {...prod, qty}];
    });
    toast('Agregado al carrito');
  };
  const removeFromCart=(id)=>setCart(prev=>prev.filter(p=>p.id!==id));
  const updateQty=(id,qty)=>{ if(qty<=0) return removeFromCart(id); setCart(prev=>prev.map(p=>p.id===id?{...p,qty}:p)); };

  // Agrupar carrito por seccion
  const cartByStore=useMemo(()=>{
    const map={};
    cart.forEach(item=>{ const sid=item.seccion_id||1; if(!map[sid]) map[sid]={seccion: secciones.find(s=>s.id===sid)||{id:sid,nombre:`Tienda ${sid}`}, items:[], subtotal:0}; map[sid].items.push(item); map[sid].subtotal+= (item.precio_oferta||item.precio_base||0)*item.qty; });
    return Object.values(map);
  },[cart,secciones]);

  // Validar mezcla de tiendas
  const canMix=(seccionId)=>{
    if(!multiStoreEnabled && cartByStore.length>0 && !cartByStore.find(g=>g.seccion.id===seccionId)) return false;
    if(allowedMix.length>0 && cartByStore.length>0){
      // solo permitir si todas las secciones estan en allowedMix o si es la misma
      const allIds=[...cartByStore.map(g=>g.seccion.id), seccionId];
      return allIds.every(id=> allowedMix.includes(id) || allowedMix.length===0);
    }
    return true;
  };

  // Buscar con debounce
  const [searchResult,setSearchResult]=useState(null);
  useEffect(()=>{
    if(!q || q.length<2){ setSearchResult(null); return; }
    const t=setTimeout(async()=>{
      try{ const r=await api.busquedaGlobal(q); setSearchResult(r); api.trackSearch(q, r.total); }catch{}
    },400);
    return()=>clearTimeout(t);
  },[q]);

  const handleCheckout=async()=>{
    if(!user) { toast('Iniciá sesión para comprar','error'); setPage('login'); return; }
    if(cart.length===0) return;
    try{
      // Crear pedidos por tienda
      const pedidosPayload = cartByStore.map(group=>{
        const envio=selectedEnvios[group.seccion.id];
        return{
          seccion_id: group.seccion.id,
          items: group.items.map(i=>({producto_id:i.id, categoria:i.categoria, modelo:i.modelo, nombre_producto:i.nombre||i.modelo, cantidad:i.qty, precio_unitario:i.precio_oferta||i.precio_base, precio_base:i.precio_base})),
          subtotal: group.subtotal,
          descuento:0,
          total: group.subtotal + (envio?.precio||0),
          costo_envio: envio?.precio||0,
          metodo_envio: envio?.nombre||'',
          cp_destino: cpDestino,
          metodo_pago:'a coordinar',
          datos_envio: JSON.stringify(envio||{}),
        };
      });
      if(pedidosPayload.length===1){
        const ped=pedidosPayload[0];
        const res=await api.createPedido({...ped, is_test:isTestMode});
        toast(isTestMode? 'Venta de prueba creada #'+res.id : 'Pedido creado #'+res.id);
      }else{
        const res=await api.createPedidosMulti(pedidosPayload, isTestMode);
        toast(`${res.pedidos.length} pedidos creados ${isTestMode?'(PRUEBA)':''}`);
      }
      setCart([]); setPage('pedidos');
    }catch(e){ toast(e.message,'error'); }
  };

  if(loading) return <div style={{padding:40,textAlign:'center'}}>Cargando...</div>;

  return(
    <Ctx.Provider value={{toast, user, setUser, secciones, config, design, cart, addToCart}}>
      <div className={dark?'dark':''}>
        <header className="header">
          <div className="header-inner">
            <button className="header-logo" onClick={()=>setPage('landing')}>{design.logo_url?<img src={design.logo_url} alt="" style={{height:36}}/>:null} <span>{design.nombre_tienda||config.nombre_negocio||'TIENDA'}</span></button>
            <nav className="header-nav desktop-only">
              {secciones.filter(s=>s.visible).map(s=><a key={s.id} href="#" onClick={e=>{e.preventDefault(); setSelectedSeccion(s); setPage('catalogo');}}>{s.nombre}</a>)}
            </nav>
            <div className="header-right">
              <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}><input type="checkbox" checked={isTestMode} onChange={e=>setIsTestMode(e.target.checked)}/>PRUEBA</label>
              <button className="icon-btn" onClick={()=>setPage('favoritos')}><Heart size={20}/></button>
              <button className="icon-btn cart-btn" onClick={()=>setPage('carrito')}><ShoppingCart size={20}/>{cart.length>0 && <span className="cart-badge">{cart.reduce((s,i)=>s+i.qty,0)}</span>}</button>
              {user? <button className="btn btn-sm btn-outline" onClick={()=>setPage(user.rol==='admin'?'admin':'mi-cuenta')}>{user.nombre||user.usuario}</button> : <button className="btn btn-sm btn-primary" onClick={()=>setPage('login')}>Ingresar</button>}
              <button className="hamburger mobile-only" onClick={()=>setMobileMenu(!mobileMenu)}>☰</button>
            </div>
          </div>
          {mobileMenu && <div className="mobile-menu">{secciones.map(s=><button key={s.id} onClick={()=>{setSelectedSeccion(s); setPage('catalogo'); setMobileMenu(false);}}>{s.nombre}</button>)}<button onClick={()=>setPage('carrito')}>Carrito ({cart.length})</button></div>}
        </header>

        {/* Landing */}
        {page==='landing' && (
          <div>
            <div className="hero">
              <h1>{design.nombre_tienda||'KICKS UNIFICADO V4'}</h1>
              <p>Parallax + Multi-tienda + Andreani automático + Envíos custom</p>
              <div className="search-box"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar productos..." /><button className="btn btn-primary" onClick={()=>setPage('catalogo')}><Search size={16}/> Buscar</button></div>
            </div>
            {searchResult && (
              <div style={{maxWidth:1100,margin:'0 auto',padding:20}}>
                <h3>Resultados para "{q}" ({searchResult.total})</h3>
                {searchResult.resultados.map(r=><div key={r.seccion.id} style={{marginTop:16}}><h4>{r.seccion.nombre}</h4><div className="product-grid" style={{padding:0}}>{r.productos.map(p=><div key={p.id} className="product-card kicks-parallax-card" onClick={()=>{setSelectedSeccion(r.seccion); setPage('producto');}}><div className="product-img-wrap"><img src={p.imagen||'/placeholder.png'} alt="" className="product-img kicks-parallax-img"/></div><div className="product-info"><div className="product-name">{p.nombre||p.modelo}</div><div className="price-new">{p.precio_base? fmtARS(p.precio_base):'Consultar'}</div></div></div>)}</div></div>)}
              </div>
            )}
            <div className="sections-grid">
              {secciones.filter(s=>s.visible).map(s=><div key={s.id} className="product-card section-card kicks-parallax-card" onClick={()=>{setSelectedSeccion(s); setPage('catalogo');}}><div className="product-img-wrap"><img src={s.imagen||'https://via.placeholder.com/400x200?text='+s.nombre} alt="" className="product-img kicks-parallax-img" style={{height:200,objectFit:'cover'}}/></div><div className="section-card-body"><h2>{s.nombre}</h2><p>{s.descripcion}</p>{s.ignorar_stock && <span className="chip">Sin control stock</span>}{s.permitir_sin_stock && <span className="chip" style={{marginLeft:6}}>Compra sin stock</span>}</div></div>)}
            </div>
          </div>
        )}

        {/* Catalogo */}
        {page==='catalogo' && (
          <CatalogoPage seccion={selectedSeccion} productos={productos} setProductos={setProductos} addToCart={addToCart} canMix={canMix} secciones={secciones} toast={toast} multiStoreEnabled={multiStoreEnabled} setMultiStoreEnabled={setMultiStoreEnabled} allowedMix={allowedMix} setAllowedMix={setAllowedMix} />
        )}

        {/* Producto detalle con Andreani */}
        {page==='producto' && <ProductoDetalle seccion={selectedSeccion} addToCart={addToCart} toast={toast} />}

        {/* Carrito multi-tienda */}
        {page==='carrito' && (
          <div style={{maxWidth:1000,margin:'0 auto',padding:20}}>
            <h2 style={{fontWeight:900,marginBottom:16}}>Carrito {isTestMode && <span style={{background:'#ff0',padding:'2px 8px',borderRadius:6,fontSize:12}}>MODO PRUEBA</span>}</h2>
            <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
              <label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={multiStoreEnabled} onChange={e=>setMultiStoreEnabled(e.target.checked)}/> Permitir mezclar tiendas</label>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:12}}>Mezcla permitida:</span>
                {secciones.map(s=><label key={s.id} style={{fontSize:12,display:'flex',alignItems:'center',gap:4}}><input type="checkbox" checked={allowedMix.includes(s.id)} onChange={e=>{ if(e.target.checked) setAllowedMix([...allowedMix,s.id]); else setAllowedMix(allowedMix.filter(id=>id!==s.id)); }}/>{s.nombre}</label>)}
              </div>
            </div>
            {cartByStore.length===0? <p>Carrito vacío</p> : (
              <div className="multi-store-cart">
                {cartByStore.map(group=>{
                  const cfgEnvio = {gratis_desde: 50000}; // vendría de config_envio
                  return(
                    <div key={group.seccion.id} className="store-cart-group">
                      <div className="store-cart-header"><h4>{group.seccion.nombre}</h4><span>{group.items.length} productos - {fmtARS(group.subtotal)}</span></div>
                      <EnvioProgress subtotal={group.subtotal} gratisDesde={cfgEnvio.gratis_desde} seccionNombre={group.seccion.nombre} />
                      {group.items.map(item=><div key={item.id} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:'1px solid #eee'}}><img src={item.imagen} alt="" style={{width:60,height:60,objectFit:'contain',background:'#f5f5f5',borderRadius:8}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{item.nombre||item.modelo}</div><div style={{fontSize:12,color:'#666'}}>{item.categoria} {item.permitir_sin_stock && '· Sin stock permitido'} {item.es_digital && '· Digital'}</div><div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}><button className="btn btn-sm btn-outline" onClick={()=>updateQty(item.id,item.qty-1)}>-</button><span>{item.qty}</span><button className="btn btn-sm btn-outline" onClick={()=>updateQty(item.id,item.qty+1)}>+</button><span style={{marginLeft:8,fontWeight:700}}>{fmtARS((item.precio_oferta||item.precio_base)*item.qty)}</span></div></div><button className="icon-btn" onClick={()=>removeFromCart(item.id)}><X size={16}/></button></div>)}
                      <div style={{marginTop:12}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Elegí envío para {group.seccion.nombre}:</div>
                        <AndreaniCalculator seccionId={group.seccion.id} peso={group.items.reduce((s,i)=>s+(i.peso||0)*i.qty,0)} onSelect={(env)=>setSelectedEnvios({...selectedEnvios, [group.seccion.id]:env})} />
                        <EnviosCustomList seccionId={group.seccion.id} onSelect={(env)=>setSelectedEnvios({...selectedEnvios, [group.seccion.id]:env})} selected={selectedEnvios[group.seccion.id]} />
                        {selectedEnvios[group.seccion.id] && <div style={{marginTop:8,fontSize:13,background:'#f0f9ff',padding:8,borderRadius:8}}>Seleccionado: {selectedEnvios[group.seccion.id].nombre} - {fmtARS(selectedEnvios[group.seccion.id].precio)}</div>}
                      </div>
                    </div>
                  );
                })}
                <div style={{display:'flex',gap:12,marginTop:20}}>
                  <input value={cpDestino} onChange={e=>setCpDestino(e.target.value)} placeholder="CP destino para todos" style={{maxWidth:200}}/>
                  <button className="btn btn-primary" style={{flex:1}} onClick={handleCheckout}>{isTestMode?'Crear venta de PRUEBA':'Finalizar compra'} - {fmtARS(cart.reduce((s,i)=>s+(i.precio_oferta||i.precio_base)*i.qty,0) + Object.values(selectedEnvios).reduce((s,e)=>s+(e?.precio||0),0))}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Login + Forgot */}
        {page==='login' && <LoginPage setPage={setPage} setUser={setUser} toast={toast} />}
        {page==='admin' && user?.rol==='admin' && <AdminV4 setPage={setPage} toast={toast} secciones={secciones} />}
        {page==='pedidos' && <PedidosPage toast={toast} isTestMode={isTestMode} setIsTestMode={setIsTestMode} />}
        {page==='mi-cuenta' && <MiCuentaPage user={user} setUser={setUser} toast={toast} setPage={setPage} />}
        {page==='favoritos' && <FavoritosPage addToCart={addToCart} />}

        <footer className="footer"><div className="footer-social"><a href="#"><Globe size={16}/> Web</a><a href="#"><Phone size={16}/> WhatsApp</a></div><p>© 2026 {design.nombre_tienda||'KICKS'} - V4 con Parallax + Multi-tienda + Andreani + Envíos custom</p></footer>
        <ToastContainer />
        {config.whatsapp && <a href={`https://wa.me/${config.whatsapp}?text=Hola`} className="wa-float" target="_blank">💬</a>}
      </div>
    </Ctx.Provider>
  );
}

// --- Subcomponents ---

function CatalogoPage({seccion, productos, setProductos, addToCart, canMix, secciones, toast, multiStoreEnabled, setMultiStoreEnabled, allowedMix, setAllowedMix}){
  const [q,setQ]=useState('');
  const [categoria,setCategoria]=useState('');
  const [cats,setCats]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ (async()=>{ setLoading(true); try{ const [prods, catList]=await Promise.all([api.getProductos({seccion_id:seccion?.id, q, categoria, limit:50}), api.getCategorias(seccion?.id)]); setProductos(prods.productos||prods); setCats(catList); }catch(e){ toast(e.message,'error'); } setLoading(false); })(); },[seccion,q,categoria]);
  return(
    <div>
      <div style={{maxWidth:1300,margin:'0 auto',padding:'16px 24px',display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <h2 style={{fontWeight:900}}>{seccion?.nombre||'Catálogo'} {seccion?.ignorar_stock && <span className="chip">Sin stock</span>}</h2>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." style={{maxWidth:240}}/>
        <select value={categoria} onChange={e=>setCategoria(e.target.value)} style={{maxWidth:180}}><option value="">Todas categorías</option>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}><input type="checkbox" checked={multiStoreEnabled} onChange={e=>setMultiStoreEnabled(e.target.checked)}/> Multi-tienda</label>
      </div>
      {loading? <div style={{padding:40,textAlign:'center'}}>Cargando...</div> : (
        <div className="product-grid">
          {productos.map(p=>{
            const sinStock = !p.permitir_sin_stock && !p.es_digital && p.stock<=0;
            const seccionActual = secciones.find(s=>s.id===p.seccion_id);
            const ignoraStock = seccionActual?.ignorar_stock || seccionActual?.permitir_sin_stock;
            const bloqueado = sinStock && !ignoraStock;
            const puedeComprar = !bloqueado || p.permitir_sin_stock || p.es_digital;
            const mezclaOk = canMix(p.seccion_id);
            return(
              <div key={p.id} className="product-card kicks-parallax-card">
                <div className="product-img-wrap">
                  <img src={p.imagen||'https://via.placeholder.com/300?text=Sin+foto'} alt="" className="product-img kicks-parallax-img" loading="lazy"/>
                  <div className="product-badges">
                    {p.envio_gratis && <span className="pbadge pbadge-shipping">Envío gratis</span>}
                    {p.precio_oferta>0 && <span className="pbadge pbadge-discount">OFERTA</span>}
                    {p.es_digital && <span className="pbadge pbadge-digital">Digital</span>}
                    {p.permitir_sin_stock && <span className="pbadge pbadge-nostock">Sin stock OK</span>}
                    {bloqueado && <span className="pbadge pbadge-nostock">Sin stock</span>}
                  </div>
                  {bloqueado && !p.permitir_sin_stock && !p.es_digital && <div className="sin-stock-overlay">SIN STOCK</div>}
                </div>
                <div className="product-info">
                  <div className="product-cat">{p.categoria}</div>
                  <div className="product-name">{p.nombre||p.modelo}</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:6}}>{p.precio_oferta>0 && <span className="price-old">{fmtARS(p.precio_base)}</span>}<span className="price-new">{fmtARS(p.precio_oferta||p.precio_base)}</span></div>
                  <div style={{fontSize:11,color:'#666',marginTop:4}}>Stock: {p.es_digital?'Digital':p.permitir_sin_stock?`${p.stock} (permite sin stock)`:p.stock} {seccionActual?.nombre && `· ${seccionActual.nombre}`}</div>
                  <button className="btn" disabled={!puedeComprar || !mezclaOk} onClick={()=>addToCart(p)}>{!mezclaOk? 'No mezcla con carrito' : puedeComprar? 'Agregar' : 'Sin stock'}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductoDetalle({seccion, addToCart, toast}){
  const [id,setId]=useState(null);
  const [prod,setProd]=useState(null);
  const [imagenes,setImagenes]=useState([]);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const pid=params.get('id')||null;
    if(pid){ setId(pid); (async()=>{ try{ const r=await api.getProductos({}); const p=r.productos?.find(x=>x.id==pid)||r.find(x=>x.id==pid); if(p){ setProd(p); const imgs=await api.getProductoImagenes(pid).catch(()=>[]); setImagenes(imgs); } }catch{} })(); }
  },[]);
  if(!prod) return <div style={{padding:20}}><button className="btn btn-outline" onClick={()=>history.back()}>Volver</button><p style={{marginTop:20}}>Seleccioná un producto del catálogo. Para demo, usá el catálogo.</p></div>;
  return(
    <div style={{maxWidth:1000,margin:'0 auto',padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}} className="mobile-stack">
      <div><div style={{background:'#fff',borderRadius:24,padding:16}}><img src={prod.imagen} alt="" style={{width:'100%',borderRadius:16}}/><div style={{display:'flex',gap:8,marginTop:12,overflowX:'auto'}}>{imagenes.map(img=><img key={img.id} src={img.url} alt="" style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:'1px solid #eee'}}/>)}</div></div></div>
      <div>
        <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',color:'var(--primary)'}}>{prod.categoria}</div>
        <h1 style={{fontSize:28,fontWeight:900,margin:'8px 0'}}>{prod.nombre||prod.modelo}</h1>
        <div style={{fontSize:24,fontWeight:900}}>{fmtARS(prod.precio_oferta||prod.precio_base)}</div>
        <div style={{margin:'12px 0',fontSize:13}}>Stock: {prod.es_digital?'Producto digital - sin stock': prod.permitir_sin_stock? `${prod.stock} (permite compra sin stock)` : prod.stock} {prod.es_digital && '· Entrega automática'} </div>
        <div style={{display:'flex',gap:8,margin:'16px 0'}}><button className="btn btn-primary" style={{flex:1}} onClick={()=>addToCart(prod)}>Agregar al carrito</button></div>
        <AndreaniCalculator seccionId={prod.seccion_id} peso={prod.peso} volumen={(prod.alto||0)*(prod.ancho||0)*(prod.largo||0)} onSelect={(env)=>toast(`Envío seleccionado: ${env.nombre} ${fmtARS(env.precio)}`)} />
        <div style={{marginTop:16,padding:16,background:'#fff',borderRadius:16}}><h4 style={{fontWeight:800,marginBottom:8}}>Descripción</h4><p style={{fontSize:14,color:'#555',whiteSpace:'pre-wrap'}}>{prod.descripcion||prod.notas||'Sin descripción'}</p></div>
      </div>
    </div>
  );
}

function EnviosCustomList({seccionId, onSelect, selected}){
  const [envios,setEnvios]=useState([]);
  useEffect(()=>{ (async()=>{ try{ const r=await api.getEnvioCustom(seccionId); setEnvios(r); }catch{} })(); },[seccionId]);
  if(!envios.length) return null;
  return(
    <div style={{marginTop:12}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Envíos personalizados</div>
      {envios.map(e=><div key={e.id} className={`andreani-option ${selected?.id===e.id?'selected':''}`} onClick={()=>onSelect({...e, tipo:'custom', nombre:e.nombre, precio:e.precio})}><span style={{fontSize:20}}>{e.icono||'🚚'}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{e.nombre}</div><div style={{fontSize:12,color:'#666'}}>{e.descripcion} {e.tiempo_estimado && `· ${e.tiempo_estimado}`} {e.gratis_desde>0 && `· Gratis desde ${fmtARS(e.gratis_desde)}`}</div></div><div style={{fontWeight:800}}>{e.precio==0?'Gratis':fmtARS(e.precio)}</div></div>)}
    </div>
  );
}

function LoginPage({setPage,setUser,toast}){
  const [usuario,setUsuario]=useState(''); const [password,setPassword]=useState(''); const [otp,setOtp]=useState(''); const [needsOtp,setNeedsOtp]=useState(false); const [showForgot,setShowForgot]=useState(false);
  const login=async()=>{
    try{
      const r=await api.login(usuario,password, otp||undefined);
      if(r.requires_otp){ setNeedsOtp(true); toast('Código enviado a tu email'); return; }
      setUser(r.user); setPage(r.user.rol==='admin'?'admin':'landing'); toast('Bienvenido');
    }catch(e){ toast(e.message,'error'); }
  };
  const forgot=async()=>{
    try{ const r=await api.forgotPassword(usuario); toast(`Código: ${r.codigo} ${r.email?'enviado por mail':''}`); setShowForgot(false); }catch(e){ toast(e.message,'error'); }
  };
  return(
    <div style={{maxWidth:400,margin:'40px auto',padding:20}}>
      <div className="card" style={{padding:24}}>
        <h2 style={{fontWeight:900,marginBottom:16}}>Ingresar</h2>
        <div className="form-group"><label className="form-label">Usuario o email</label><input value={usuario} onChange={e=>setUsuario(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Contraseña o código de recupero</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {needsOtp && <div className="form-group"><label className="form-label">Código OTP</label><input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456" /></div>}
        <button className="btn btn-primary" style={{width:'100%',marginTop:12}} onClick={login}>Entrar</button>
        <div style={{marginTop:12,display:'flex',justifyContent:'space-between',fontSize:13}}><a href="#" onClick={e=>{e.preventDefault(); setShowForgot(!showForgot);}}>¿Olvidaste tu contraseña?</a><a href="#" onClick={e=>{e.preventDefault(); setPage('register');}}>Crear cuenta</a></div>
        {showForgot && <div style={{marginTop:16,padding:12,background:'#f9fafb',borderRadius:12}}><p style={{fontSize:13,marginBottom:8}}>Te generamos un código tipo KICKS-A1B2C3 válido 24hs. Podés usarlo como contraseña y luego cambiarla.</p><button className="btn btn-outline" style={{width:'100%'}} onClick={forgot}>Generar código</button></div>}
      </div>
    </div>
  );
}

function MiCuentaPage({user,setUser,toast,setPage}){
  const [form,setForm]=useState({...user}); const [pass,setPass]=useState('');
  const save=async()=>{ try{ const r=await api.updateMe({...form, password:pass||undefined}); setUser(r); toast('Guardado'); }catch(e){ toast(e.message,'error'); } };
  return(
    <div style={{maxWidth:600,margin:'20px auto',padding:20}}>
      <div className="card" style={{padding:20}}>
        <h3>Mi cuenta</h3>
        <div className="form-group"><label className="form-label">Nombre</label><input value={form.nombre||''} onChange={e=>setForm({...form,nombre:e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Teléfono</label><input value={form.telefono||''} onChange={e=>setForm({...form,telefono:e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Email</label><input value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Nueva contraseña (dejar vacío para no cambiar)</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Nueva clave" /></div>
        <button className="btn btn-primary" onClick={save}>Guardar</button>
        <button className="btn btn-outline" style={{marginLeft:8}} onClick={()=>{api.logout(); setUser(null); setPage('landing');}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

function PedidosPage({toast,isTestMode,setIsTestMode}){
  const [pedidos,setPedidos]=useState([]); const [filtroTest,setFiltroTest]=useState(isTestMode?'all':'false');
  useEffect(()=>{ (async()=>{ try{ const r=await api.getPedidos({is_test: filtroTest==='all'?undefined:filtroTest}); setPedidos(r); }catch(e){ toast(e.message,'error'); } })(); },[filtroTest]);
  return(
    <div style={{maxWidth:1000,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h2 style={{fontWeight:900}}>Pedidos</h2><label style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}><input type="checkbox" checked={filtroTest==='all'} onChange={e=>setFiltroTest(e.target.checked?'all':'false')}/> Ver pruebas</label></div>
      <div style={{display:'grid',gap:12}}>{pedidos.map(p=><div key={p.id} className="card" style={{padding:16}}><div style={{display:'flex',justifyContent:'space-between'}}><div><strong>#{p.id}</strong> {p.is_test && <span style={{background:'#ff0',padding:'2px 6px',borderRadius:4,fontSize:10}}>PRUEBA</span>} - {p.usuario_nombre} - {fmtARS(p.total)}<div style={{fontSize:12,color:'#666'}}>{new Date(p.created_at).toLocaleString()} · {p.metodo_envio} {p.cp_destino && `· CP ${p.cp_destino}`} · {p.costo_envio>0? `Envío ${fmtARS(p.costo_envio)}` : ''}</div></div><span className="chip">{p.estado}</span></div></div>)}</div>
    </div>
  );
}

function FavoritosPage({addToCart}){
  const [favs,setFavs]=useState([]);
  useEffect(()=>{ (async()=>{ try{ const r=await api.getFavoritos(); setFavs(r); }catch{} })(); },[]);
  return(<div style={{maxWidth:1000,margin:'0 auto',padding:20}}><h2 style={{fontWeight:900}}>Favoritos</h2><div className="product-grid">{favs.map(f=><div key={f.id} className="product-card"><div className="product-img-wrap"><img src={f.imagen} alt="" className="product-img"/></div><div className="product-info"><div className="product-name">{f.nombre||f.modelo}</div><div className="price-new">{fmtARS(f.precio_base)}</div><button className="btn" onClick={()=>addToCart(f)}>Agregar</button></div></div>)}</div></div>);
}

// --- ADMIN V4 con menú organizado tipo TiendaNegocio ---
function AdminV4({setPage,toast,secciones}){
  const [activeMenu,setActiveMenu]=useState('dashboard');
  const [openSubmenus,setOpenSubmenus]=useState({ventas:false, productos:true, clientes:false, marketing:false});
  const [stats,setStats]=useState(null);
  useEffect(()=>{ (async()=>{ try{ const s=await api.getStats(); setStats(s); }catch{} })(); },[]);
  const toggleSubmenu=(key)=>setOpenSubmenus({...openSubmenus, [key]:!openSubmenus[key]});

  return(
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo"><span>🚀</span> TIENDA NEGOCIO <span style={{fontSize:10,background:'#fff',color:'#000',padding:'2px 6px',borderRadius:4,marginLeft:8}}>V4</span></div>
        <button className={`admin-nav-item ${activeMenu==='dashboard'?'active':''}`} onClick={()=>setActiveMenu('dashboard')}><span style={{display:'flex',alignItems:'center',gap:10}}><Home size={18}/> Inicio</span></button>
        <button className={`admin-nav-item ${activeMenu==='estadisticas'?'active':''}`} onClick={()=>setActiveMenu('estadisticas')}><span style={{display:'flex',alignItems:'center',gap:10}}><BarChart3 size={18}/> Estadísticas</span></button>

        <div className="admin-section-title">Administración</div>
        <button className={`admin-nav-item ${openSubmenus.ventas?'open':''}`} onClick={()=>toggleSubmenu('ventas')}><span style={{display:'flex',alignItems:'center',gap:10}}><DollarSign size={18}/> Ventas</span><ChevronRight size={14} className="arrow"/></button>
        {openSubmenus.ventas && <div className="admin-submenu"><div className={`admin-sub-item ${activeMenu==='ventas_realizadas'?'active':''}`} onClick={()=>setActiveMenu('ventas_realizadas')}>Ventas realizadas</div><div className={`admin-sub-item ${activeMenu==='carritos'?'active':''}`} onClick={()=>setActiveMenu('carritos')}>Carritos abandonados</div><div className={`admin-sub-item ${activeMenu==='ordenes'?'active':''}`} onClick={()=>setActiveMenu('ordenes')}>Órdenes de compra</div></div>}

        <button className={`admin-nav-item ${openSubmenus.productos?'open':''}`} onClick={()=>toggleSubmenu('productos')}><span style={{display:'flex',alignItems:'center',gap:10}}><Tag size={18}/> Productos</span><ChevronDown size={14} className="arrow"/></button>
        {openSubmenus.productos && <div className="admin-submenu">
          <div className={`admin-sub-item ${activeMenu==='productos_admin'?'active':''}`} onClick={()=>setActiveMenu('productos_admin')}>Administrar productos</div>
          <div className={`admin-sub-item ${activeMenu==='productos_add'?'active':''}`} onClick={()=>setActiveMenu('productos_add')}>Agregar producto</div>
          <div className={`admin-sub-item ${activeMenu==='inventario'?'active':''}`} onClick={()=>setActiveMenu('inventario')}>Inventario <span className="admin-badge-new">¡Nueva funcionalidad!</span></div>
          <div className="admin-sub-item" onClick={()=>toast('Próximamente')}>Orden de los productos</div>
          <div className={`admin-sub-item ${activeMenu==='aumento'?'active':''}`} onClick={()=>setActiveMenu('aumento')}>Aumento masivo de precios</div>
          <div className={`admin-sub-item ${activeMenu==='importar'?'active':''}`} onClick={()=>setActiveMenu('importar')}>Importar y exportar productos</div>
          <div className="admin-sub-item" onClick={()=>toast('Próximamente')}>Catálogo en PDF</div>
          <div className="admin-sub-item" onClick={()=>toast('Próximamente')}>Migrar desde otra plataforma</div>
        </div>}

        <button className={`admin-nav-item ${activeMenu==='categorias'?'active':''}`} onClick={()=>setActiveMenu('categorias')}><span style={{display:'flex',alignItems:'center',gap:10}}><Layers size={18}/> Categorías</span></button>
        <button className={`admin-nav-item ${activeMenu==='clientes'?'active':''}`} onClick={()=>setActiveMenu('clientes')}><span style={{display:'flex',alignItems:'center',gap:10}}><Users size={18}/> Clientes</span></button>

        <button className={`admin-nav-item ${openSubmenus.marketing?'open':''}`} onClick={()=>toggleSubmenu('marketing')}><span style={{display:'flex',alignItems:'center',gap:10}}><Percent size={18}/> Marketing</span><ChevronRight size={14} className="arrow"/></button>
        {openSubmenus.marketing && <div className="admin-submenu">
          <div className={`admin-sub-item ${activeMenu==='cupones'?'active':''}`} onClick={()=>setActiveMenu('cupones')}>Cupones de descuento</div>
          <div className={`admin-sub-item ${activeMenu==='promociones'?'active':''}`} onClick={()=>setActiveMenu('promociones')}>Promociones</div>
          <div className="admin-sub-item">Material publicitario <span className="admin-badge-new">¡Nuevo!</span></div>
        </div>}

        <button className="admin-nav-item"><span style={{display:'flex',alignItems:'center',gap:10}}><Store size={18}/> Punto de venta</span><span className="admin-badge-soon">¡Próximamente!</span></button>
        <button className={`admin-nav-item ${activeMenu==='mayorista'?'active':''}`} onClick={()=>setActiveMenu('mayorista')}><span style={{display:'flex',alignItems:'center',gap:10}}><Boxes size={18}/> Venta Mayorista</span></button>

        <div className="admin-section-title">Personalización</div>
        <button className={`admin-nav-item ${activeMenu==='diseno'?'active':''}`} onClick={()=>setActiveMenu('diseno')}><span style={{display:'flex',alignItems:'center',gap:10}}><Palette size={18}/> Diseño tienda</span></button>
        <button className={`admin-nav-item ${activeMenu==='menus'?'active':''}`} onClick={()=>setActiveMenu('menus')}><span style={{display:'flex',alignItems:'center',gap:10}}><Menu size={18}/> Menús</span></button>
        <button className={`admin-nav-item ${activeMenu==='paginas'?'active':''}`} onClick={()=>setActiveMenu('paginas')}><span style={{display:'flex',alignItems:'center',gap:10}}><FileText size={18}/> Páginas</span></button>
        <button className={`admin-nav-item ${activeMenu==='blogs'?'active':''}`} onClick={()=>setActiveMenu('blogs')}><span style={{display:'flex',alignItems:'center',gap:10}}><PenLine size={18}/> Blogs</span></button>
        <button className={`admin-nav-item ${activeMenu==='apps'?'active':''}`} onClick={()=>setActiveMenu('apps')}><span style={{display:'flex',alignItems:'center',gap:10}}><Puzzle size={18}/> Aplicaciones</span><span className="admin-badge-new">¡Nuevo!</span></button>

        <div style={{marginTop:'auto',borderTop:'1px solid rgba(255,255,255,.1)',padding:'12px 0'}}>
          <button className="admin-nav-item"><span style={{display:'flex',alignItems:'center',gap:10}}><User size={18}/> Mi cuenta</span><ChevronRight size={14}/></button>
          <button className={`admin-nav-item ${activeMenu==='config'?'active':''}`} onClick={()=>setActiveMenu('config')}><span style={{display:'flex',alignItems:'center',gap:10}}><Settings size={18}/> Configuraciones</span></button>
        </div>
      </aside>

      <main className="admin-content">
        {activeMenu==='dashboard' && (
          <div>
            <h3>Dashboard</h3>
            {stats && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:20}}>
              <div className="stat-card"><div style={{fontSize:12,color:'#666'}}>Ventas totales</div><div className="stat-card-value">{fmtARS(stats.total_ventas)}</div></div>
              <div className="stat-card"><div style={{fontSize:12,color:'#666'}}>Pedidos</div><div className="stat-card-value">{stats.total_pedidos}</div></div>
              <div className="stat-card"><div style={{fontSize:12,color:'#666'}}>Productos</div><div className="stat-card-value">{stats.total_productos}</div></div>
              <div className="stat-card"><div style={{fontSize:12,color:'#666'}}>Clientes</div><div className="stat-card-value">{stats.total_usuarios}</div></div>
              <div className="stat-card"><div style={{fontSize:12,color:'#666'}}>Carritos abandonados</div><div className="stat-card-value">{stats.carritos_abandonados||0}</div></div>
            </div>}
            <div className="admin-card"><h4 style={{marginBottom:12}}>Novedades V4</h4><ul style={{fontSize:14,lineHeight:1.8,paddingLeft:20}}><li>✅ Menú organizado tipo TiendaNegocio</li><li>✅ Productos con toggle "Permitir compra sin stock" y "Es digital"</li><li>✅ Secciones con "Ignorar stock" para Mayorista</li><li>✅ Andreani automático con CP como en la foto</li><li>✅ Envíos custom Uber/Didi/Moto</li><li>✅ Carrito multi-tienda con barra % envío gratis</li><li>✅ Ventas de prueba con flag is_test</li><li>✅ KICKS parallax 0.75→1.15 scrub 1.2</li><li>✅ Recupero contraseña con código largo + mail + WhatsApp</li></ul></div>
          </div>
        )}
        {activeMenu==='productos_admin' && <AdminProductos toast={toast} secciones={secciones} />}
        {activeMenu==='productos_add' && <AdminProductoForm toast={toast} secciones={secciones} />}
        {activeMenu==='inventario' && <AdminInventario toast={toast} secciones={secciones} />}
        {activeMenu==='aumento' && <AdminAumento toast={toast} />}
        {activeMenu==='importar' && <AdminImportar toast={toast} secciones={secciones} />}
        {activeMenu==='categorias' && <AdminCategorias toast={toast} secciones={secciones} />}
        {activeMenu==='clientes' && <AdminClientes toast={toast} />}
        {activeMenu==='cupones' && <AdminCupones toast={toast} secciones={secciones} />}
        {activeMenu==='promociones' && <AdminPromociones toast={toast} secciones={secciones} />}
        {activeMenu==='ventas_realizadas' && <AdminVentas toast={toast} />}
        {activeMenu==='carritos' && <AdminCarritos toast={toast} />}
        {activeMenu==='diseno' && <AdminDiseno toast={toast} secciones={secciones} />}
        {activeMenu==='menus' && <AdminMenus toast={toast} secciones={secciones} />}
        {activeMenu==='paginas' && <AdminPaginas toast={toast} secciones={secciones} />}
        {activeMenu==='apps' && <AdminApps toast={toast} secciones={secciones} />}
        {activeMenu==='config' && <AdminConfig toast={toast} secciones={secciones} />}
        {activeMenu==='estadisticas' && <AdminEstadisticas toast={toast} />}
      </main>
    </div>
  );
}

function AdminProductos({toast,secciones}){
  const [productos,setProductos]=useState([]); const [q,setQ]=useState(''); const [edit,setEdit]=useState(null);
  const load=async()=>{ try{ const r=await api.getProductos({q,limit:100}); setProductos(r.productos||r); }catch(e){ toast(e.message,'error'); } };
  useEffect(()=>{ load(); },[q]);
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3>Administrar productos</h3><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." style={{maxWidth:240}}/></div>
      <div className="admin-card" style={{overflowX:'auto'}}><table className="admin-table"><thead><tr><th>Producto</th><th>Sección</th><th>Stock</th><th>Precio</th><th>Sin stock</th><th>Digital</th><th>Acciones</th></tr></thead><tbody>{productos.map(p=><tr key={p.id}><td><div style={{display:'flex',alignItems:'center',gap:8}}><img src={p.imagen} alt="" style={{width:40,height:40,objectFit:'contain',background:'#f5f5f5',borderRadius:6}}/><div><div style={{fontWeight:600}}>{p.nombre||p.modelo}</div><div style={{fontSize:11,color:'#666'}}>{p.categoria} · {p.sku}</div></div></div></td><td>{secciones.find(s=>s.id===p.seccion_id)?.nombre}</td><td>{p.stock} {p.permitir_sin_stock && '✅'} {p.es_digital && '💾'}</td><td>{fmtARS(p.precio_base)}</td><td>{p.permitir_sin_stock? 'Sí':'No'}</td><td>{p.es_digital? 'Sí':'No'}</td><td><div style={{display:'flex',gap:6}}><button className="btn btn-sm btn-outline" onClick={()=>setEdit(p)}><Edit size={14}/></button><button className="btn btn-sm btn-danger" onClick={async()=>{ if(confirm('Borrar?')){ await api.deleteProducto(p.id); load(); } }}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>
      {edit && <AdminProductoFormEdit prod={edit} onClose={()=>{setEdit(null); load();}} toast={toast} secciones={secciones} />}
    </div>
  );
}
function AdminProductoForm({toast,secciones}){
  const [form,setForm]=useState({nombre:'',categoria:'',modelo:'',precio_base:0,stock:0,seccion_id:secciones[0]?.id||1, permitir_sin_stock:false, es_digital:false, descripcion:'', imagen:''});
  const save=async()=>{ try{ await api.createProducto(form); toast('Creado'); setForm({nombre:'',categoria:'',modelo:'',precio_base:0,stock:0,seccion_id:secciones[0]?.id||1, permitir_sin_stock:false, es_digital:false, descripcion:'', imagen:''}); }catch(e){ toast(e.message,'error'); } };
  return(<div className="admin-card"><h4>Agregar producto</h4><div className="form-row"><div className="form-group"><label className="form-label">Nombre</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div><div className="form-group"><label className="form-label">Categoría</label><input value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}/></div></div><div className="form-row"><div className="form-group"><label className="form-label">Precio</label><input type="number" value={form.precio_base} onChange={e=>setForm({...form,precio_base:e.target.value})}/></div><div className="form-group"><label className="form-label">Stock</label><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></div></div><div className="form-group"><label className="form-label">Sección</label><select value={form.seccion_id} onChange={e=>setForm({...form,seccion_id:e.target.value})}><option value="">Seleccionar</option>{secciones.map(s=><option key={s.id} value={s.id}>{s.nombre} {s.ignorar_stock?'(sin stock)':''}</option>)}</select></div><div style={{display:'flex',gap:16,margin:'12px 0'}}><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={form.permitir_sin_stock} onChange={e=>setForm({...form,permitir_sin_stock:e.target.checked})}/> Permitir compra sin stock (Mayorista / Digital)</label><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={form.es_digital} onChange={e=>setForm({...form,es_digital:e.target.checked})}/> Es producto digital (sin stock, sin envío)</label></div><div className="form-group"><label className="form-label">Imagen URL</label><input value={form.imagen} onChange={e=>setForm({...form,imagen:e.target.value})}/></div><div className="form-group"><label className="form-label">Descripción</label><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} rows={3}/></div><button className="btn btn-primary" onClick={save}>Guardar producto</button></div>);
}
function AdminProductoFormEdit({prod,onClose,toast,secciones}){
  const [form,setForm]=useState({...prod});
  const save=async()=>{ try{ await api.updateProducto(prod.id, form); toast('Actualizado'); onClose(); }catch(e){ toast(e.message,'error'); } };
  return(<div className="modal"><div className="modal-content"><div className="modal-header"><h4 className="modal-title">Editar {prod.nombre||prod.modelo}</h4><button className="icon-btn" onClick={onClose}><X/></button></div><div className="modal-body"><div className="form-row"><div className="form-group"><label className="form-label">Nombre</label><input value={form.nombre||''} onChange={e=>setForm({...form,nombre:e.target.value})}/></div><div className="form-group"><label className="form-label">Precio</label><input type="number" value={form.precio_base} onChange={e=>setForm({...form,precio_base:e.target.value})}/></div></div><div className="form-row"><div className="form-group"><label className="form-label">Stock</label><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></div><div className="form-group"><label className="form-label">Sección</label><select value={form.seccion_id} onChange={e=>setForm({...form,seccion_id:e.target.value})}>{secciones.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div></div><div style={{display:'flex',gap:16,margin:'12px 0',flexWrap:'wrap'}}><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={!!form.permitir_sin_stock} onChange={e=>setForm({...form,permitir_sin_stock:e.target.checked})}/> Permitir sin stock</label><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={!!form.es_digital} onChange={e=>setForm({...form,es_digital:e.target.checked})}/> Es digital</label><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={form.visible!==false} onChange={e=>setForm({...form,visible:e.target.checked})}/> Visible</label></div><div className="form-group"><label className="form-label">Imagen</label><input value={form.imagen||''} onChange={e=>setForm({...form,imagen:e.target.value})}/></div><button className="btn btn-primary" style={{width:'100%'}} onClick={save}>Guardar cambios</button></div></div></div>);
}
function AdminInventario({toast,secciones}){
  const [productos,setProductos]=useState([]);
  useEffect(()=>{ (async()=>{ const r=await api.getProductos({limit:200}); setProductos(r.productos||r); })(); },[]);
  return(<div><h3>Inventario - Control rápido stock</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Producto</th><th>Sección</th><th>Stock</th><th>Sin stock OK</th><th>Digital</th><th>Acción</th></tr></thead><tbody>{productos.map(p=><tr key={p.id}><td>{p.nombre||p.modelo}</td><td>{secciones.find(s=>s.id===p.seccion_id)?.nombre}</td><td><input type="number" value={p.stock} style={{width:80}} onChange={async e=>{ const ns=parseInt(e.target.value)||0; await api.updateProducto(p.id,{stock:ns}); setProductos(prev=>prev.map(x=>x.id===p.id?{...x,stock:ns}:x)); }} /></td><td><input type="checkbox" checked={!!p.permitir_sin_stock} onChange={async e=>{ await api.updateProducto(p.id,{permitir_sin_stock:e.target.checked}); setProductos(prev=>prev.map(x=>x.id===p.id?{...x,permitir_sin_stock:e.target.checked}:x)); }}/></td><td><input type="checkbox" checked={!!p.es_digital} onChange={async e=>{ await api.updateProducto(p.id,{es_digital:e.target.checked}); setProductos(prev=>prev.map(x=>x.id===p.id?{...x,es_digital:e.target.checked}:x)); }}/></td><td><span className="chip">{p.stock<=0 && !p.permitir_sin_stock && !p.es_digital? 'Sin stock':'OK'}</span></td></tr>)}</tbody></table></div></div>);
}
function AdminAumento({toast}){ const [pct,setPct]=useState(10); const [cat,setCat]=useState(''); const doAumento=async()=>{ try{ await api.ajustarPrecios(pct, cat||null); toast(`Precios aumentados ${pct}%`); }catch(e){ toast(e.message,'error'); } }; return(<div className="admin-card"><h4>Aumento masivo de precios</h4><div className="form-row"><div className="form-group"><label className="form-label">Porcentaje</label><input type="number" value={pct} onChange={e=>setPct(e.target.value)}/></div><div className="form-group"><label className="form-label">Categoría (vacío=todas)</label><input value={cat} onChange={e=>setCat(e.target.value)}/></div></div><button className="btn btn-primary" onClick={doAumento}>Aplicar aumento</button></div>); }
function AdminImportar({toast,secciones}){ const [json,setJson]=useState(''); const importar=async()=>{ try{ const arr=JSON.parse(json); await api.bulkProductos(arr,false); toast(`${arr.length} productos importados`); }catch(e){ toast(e.message,'error'); } }; return(<div className="admin-card"><h4>Importar y exportar productos</h4><p style={{fontSize:13,marginBottom:12}}>Pegá un JSON array con productos. Podés incluir permitir_sin_stock y es_digital.</p><textarea value={json} onChange={e=>setJson(e.target.value)} rows={10} placeholder='[{"nombre":"Producto","precio_base":1000,"stock":10,"categoria":"Cat","seccion_id":1,"permitir_sin_stock":true,"es_digital":false}]'/><button className="btn btn-primary" style={{marginTop:12}} onClick={importar}>Importar</button></div>); }
function AdminCategorias({toast,secciones}){ const [cats,setCats]=useState([]); const [seccionId,setSeccionId]=useState(''); useEffect(()=>{ (async()=>{ const r=await api.getCategorias(seccionId||undefined); setCats(r); })(); },[seccionId]); return(<div><h3>Categorías</h3><div className="admin-card"><div style={{display:'flex',gap:8,marginBottom:12}}><select value={seccionId} onChange={e=>setSeccionId(e.target.value)}><option value="">Todas secciones</option>{secciones.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{cats.map(c=><span key={c} className="chip">{c} <button onClick={async()=>{ if(confirm('Borrar categoría y productos?')){ await api.deleteCategoria(c); setCats(cats.filter(x=>x!==c)); } }} style={{background:'none',border:'none',marginLeft:4,cursor:'pointer'}}>×</button></span>)}</div></div></div>); }
function AdminClientes({toast}){ const [users,setUsers]=useState([]); const [q,setQ]=useState(''); useEffect(()=>{ (async()=>{ const r=await api.getUsuarios(q); setUsers(r); })(); },[q]); return(<div><h3>Clientes</h3><div className="admin-card"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente..." style={{marginBottom:12}}/><table className="admin-table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Tel</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.usuario}</td><td>{u.nombre}</td><td>{u.telefono}</td><td>{u.email}</td><td>{u.rol}</td><td><button className="btn btn-sm btn-outline" onClick={async()=>{ const codigo=await api.resetPasswordAdmin(u.id); toast(`Código nuevo: ${codigo.codigo}`); }}>Reset código</button></td></tr>)}</tbody></table></div></div>); }
function AdminCupones({toast,secciones}){ const [cupones,setCupones]=useState([]); useEffect(()=>{ (async()=>{ const r=await api.getCupones(); setCupones(r); })(); },[]); return(<div><h3>Cupones de descuento</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Usos</th><th>Secciones</th><th>Activo</th></tr></thead><tbody>{cupones.map(c=><tr key={c.id}><td style={{fontWeight:700}}>{c.codigo}</td><td>{c.tipo}</td><td>{c.valor}</td><td>{c.usos_actuales}/{c.uso_maximo||'∞'}</td><td>{c.secciones_ids}</td><td>{c.activo?'Sí':'No'}</td></tr>)}</tbody></table></div></div>); }
function AdminPromociones({toast,secciones}){ const [promos,setPromos]=useState([]); useEffect(()=>{ (async()=>{ const r=await api.getPromociones(); setPromos(r); })(); },[]); return(<div><h3>Promociones automáticas</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Valor</th><th>Secciones</th><th>Activo</th></tr></thead><tbody>{promos.map(p=><tr key={p.id}><td>{p.nombre}</td><td>{p.tipo}</td><td>{p.valor}</td><td>{p.secciones_ids}</td><td>{p.activo?'Sí':'No'}</td></tr>)}</tbody></table></div></div>); }
function AdminVentas({toast}){ const [pedidos,setPedidos]=useState([]); const [filtro,setFiltro]=useState('false'); useEffect(()=>{ (async()=>{ const r=await api.getPedidos({is_test: filtro==='all'?undefined:filtro}); setPedidos(r); })(); },[filtro]); return(<div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3>Ventas realizadas</h3><label style={{fontSize:13}}><input type="checkbox" checked={filtro==='all'} onChange={e=>setFiltro(e.target.checked?'all':'false')}/> Ver pruebas</label></div><div className="admin-card"><table className="admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Envío</th><th>Estado</th><th>Test</th><th>Fecha</th></tr></thead><tbody>{pedidos.map(p=><tr key={p.id}><td>#{p.id}</td><td>{p.usuario_nombre}</td><td>{fmtARS(p.total)} {p.costo_envio>0 && `(+${fmtARS(p.costo_envio)} envío)`}</td><td>{p.metodo_envio} {p.cp_destino && `CP ${p.cp_destino}`}</td><td>{p.estado}</td><td>{p.is_test?'🧪':''}</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>); }
function AdminCarritos({toast}){ const [carts,setCarts]=useState([]); useEffect(()=>{ (async()=>{ const r=await api.getCarritosAbandonados().catch(()=>[]); setCarts(r); })(); },[]); return(<div><h3>Carritos abandonados</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Email</th><th>Total</th><th>Items</th><th>Fecha</th></tr></thead><tbody>{carts.map(c=><tr key={c.id}><td>{c.email||c.telefono||'Anónimo'}</td><td>{fmtARS(c.total)}</td><td>{(c.items||[]).length}</td><td>{new Date(c.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></div>); }
function AdminDiseno({toast,secciones}){ const [design,setDesign]=useState({}); const [slider,setSlider]=useState([]); useEffect(()=>{ (async()=>{ const [d,s]=await Promise.all([api.getDesign(), api.getSliderAll().catch(()=>[])]); setDesign(d); setSlider(s); })(); },[]); const save=async()=>{ try{ await api.updateDesign(design); toast('Diseño guardado'); }catch(e){ toast(e.message,'error'); } }; return(<div><h3>Diseño tienda - KICKS + Banners</h3><div className="admin-card"><div className="form-group"><label className="form-label">Nombre tienda</label><input value={design.nombre_tienda||''} onChange={e=>setDesign({...design,nombre_tienda:e.target.value})}/></div><div className="form-group"><label className="form-label">Logo URL</label><input value={design.logo_url||''} onChange={e=>setDesign({...design,logo_url:e.target.value})}/></div><div className="form-group"><label className="form-label">Color primario</label><input type="color" value={design.color_primario||'#4A69E2'} onChange={e=>setDesign({...design,color_primario:e.target.value})}/></div><button className="btn btn-primary" onClick={save}>Guardar diseño</button></div><div className="admin-card" style={{marginTop:16}}><h4>Banners / Slider</h4>{slider.map(s=><div key={s.id} style={{display:'flex',gap:12,alignItems:'center',padding:'8px 0',borderBottom:'1px solid #eee'}}><img src={s.imagen} alt="" style={{width:80,height:40,objectFit:'cover',borderRadius:6}}/><div style={{flex:1}}>{s.titulo}</div><button className="btn btn-sm btn-danger" onClick={async()=>{ await api.deleteSlider(s.id); setSlider(slider.filter(x=>x.id!==s.id)); }}><Trash2 size={14}/></button></div>)}</div></div>); }
function AdminMenus({toast,secciones}){ const [menus,setMenus]=useState([]); useEffect(()=>{ (async()=>{ const r=await api.getMenuAll(); setMenus(r); })(); },[]); return(<div><h3>Menús</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Título</th><th>URL</th><th>Visible</th></tr></thead><tbody>{menus.map(m=><tr key={m.id}><td>{m.titulo}</td><td>{m.url}</td><td>{m.visible?'Sí':'No'}</td></tr>)}</tbody></table></div></div>); }
function AdminPaginas({toast,secciones}){ const [paginas,setPaginas]=useState([]); useEffect(()=>{ (async()=>{ const r=await api.getPaginas(); setPaginas(r); })(); },[]); return(<div><h3>Páginas</h3><div className="admin-card"><table className="admin-table"><thead><tr><th>Título</th><th>Slug</th><th>Visible</th></tr></thead><tbody>{paginas.map(p=><tr key={p.id}><td>{p.titulo}</td><td>{p.slug}</td><td>{p.visible?'Sí':'No'}</td></tr>)}</tbody></table></div></div>); }
function AdminApps({toast,secciones}){
  const [enviosCustom,setEnviosCustom]=useState([]); const [form,setForm]=useState({nombre:'',precio:0,seccion_id:'',descripcion:'',tiempo_estimado:'',icono:'🚚'});
  const load=async()=>{ const r=await api.getEnvioCustomAll(); setEnviosCustom(r); };
  useEffect(()=>{ load(); },[]);
  const save=async()=>{ try{ await api.createEnvioCustom(form); toast('Envío creado'); load(); }catch(e){ toast(e.message,'error'); } };
  return(
    <div>
      <h3>Aplicaciones - Andreani + Envíos custom</h3>
      <div className="admin-card">
        <h4>Andreani - Config por sección</h4>
        <p style={{fontSize:13,marginBottom:12}}>Configurá el CP origen por sección en Administración {'>'} Secciones. Las credenciales van en Configuraciones. El cotizador automático ya funciona en la ficha del producto como en la foto que pasaste.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {secciones.map(s=><div key={s.id} className="card" style={{padding:12}}><div style={{fontWeight:700}}>{s.nombre}</div><div style={{fontSize:12}}>CP origen: {s.cp_origen||'1888'} {s.ignorar_stock && '· Sin stock'}</div></div>)}
        </div>
      </div>
      <div className="admin-card" style={{marginTop:16}}>
        <h4>Envíos personalizados - Uber / Didi / Moto / Retiro</h4>
        <div className="form-row"><div className="form-group"><label className="form-label">Nombre (ej: Uber Moto CABA)</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div><div className="form-group"><label className="form-label">Precio</label><input type="number" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Sección</label><select value={form.seccion_id} onChange={e=>setForm({...form,seccion_id:e.target.value})}><option value="">Todas</option>{secciones.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div><div className="form-group"><label className="form-label">Icono</label><input value={form.icono} onChange={e=>setForm({...form,icono:e.target.value})} placeholder="🚚"/></div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Descripción</label><input value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="A coordinar por WhatsApp"/></div><div className="form-group"><label className="form-label">Tiempo estimado</label><input value={form.tiempo_estimado} onChange={e=>setForm({...form,tiempo_estimado:e.target.value})} placeholder="2hs / 24hs"/></div></div>
        <button className="btn btn-primary" onClick={save}>Agregar envío custom</button>
        <table className="admin-table" style={{marginTop:16}}><thead><tr><th>Nombre</th><th>Precio</th><th>Sección</th><th>Acción</th></tr></thead><tbody>{enviosCustom.map(e=><tr key={e.id}><td>{e.icono} {e.nombre}</td><td>{e.precio==0?'Gratis':fmtARS(e.precio)}</td><td>{secciones.find(s=>s.id==e.seccion_id)?.nombre||'Todas'}</td><td><button className="btn btn-sm btn-danger" onClick={async()=>{ await api.deleteEnvioCustom(e.id); load(); }}><Trash2 size={14}/></button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
function AdminConfig({toast,secciones}){
  const [config,setConfig]=useState({}); const [seccionEdit,setSeccionEdit]=useState(null);
  useEffect(()=>{ (async()=>{ const c=await api.getConfig(); setConfig(c); })(); },[]);
  const saveConfig=async()=>{ try{ await api.updateConfig(config); toast('Config guardada'); }catch(e){ toast(e.message,'error'); } };
  const saveSeccion=async()=>{
    try{ await api.updateSeccion(seccionEdit.id, seccionEdit); toast('Sección guardada'); setSeccionEdit(null); }catch(e){ toast(e.message,'error'); }
  };
  return(
    <div>
      <h3>Configuraciones</h3>
      <div className="admin-card">
        <h4>General</h4>
        <div className="form-group"><label className="form-label">WhatsApp</label><input value={config.whatsapp||''} onChange={e=>setConfig({...config,whatsapp:e.target.value})}/></div>
        <div className="form-group"><label className="form-label">Info pagos</label><textarea value={config.info_pagos||''} onChange={e=>setConfig({...config,info_pagos:e.target.value})} rows={2}/></div>
        <div className="form-group"><label className="form-label">Info envíos</label><textarea value={config.info_envios||''} onChange={e=>setConfig({...config,info_envios:e.target.value})} rows={2}/></div>
        <button className="btn btn-primary" onClick={saveConfig}>Guardar config</button>
      </div>
      <div className="admin-card" style={{marginTop:16}}>
        <h4>Secciones - Stock y CP origen Andreani</h4>
        <table className="admin-table"><thead><tr><th>Nombre</th><th>Slug</th><th>CP Origen</th><th>Ignorar stock</th><th>Permitir sin stock</th><th>Acción</th></tr></thead><tbody>{secciones.map(s=><tr key={s.id}><td>{s.nombre}</td><td>{s.slug}</td><td>{s.cp_origen||'1888'}</td><td>{s.ignorar_stock?'Sí':'No'}</td><td>{s.permitir_sin_stock?'Sí':'No'}</td><td><button className="btn btn-sm btn-outline" onClick={()=>setSeccionEdit(s)}>Editar</button></td></tr>)}</tbody></table>
      </div>
      {seccionEdit && <div className="modal"><div className="modal-content"><div className="modal-header"><h4 className="modal-title">Editar {seccionEdit.nombre}</h4><button className="icon-btn" onClick={()=>setSeccionEdit(null)}><X/></button></div><div className="modal-body"><div className="form-group"><label className="form-label">Nombre</label><input value={seccionEdit.nombre} onChange={e=>setSeccionEdit({...seccionEdit,nombre:e.target.value})}/></div><div className="form-group"><label className="form-label">CP Origen (Andreani)</label><input value={seccionEdit.cp_origen||''} onChange={e=>setSeccionEdit({...seccionEdit,cp_origen:e.target.value})} placeholder="1888"/></div><div style={{display:'flex',gap:16,margin:'12px 0'}}><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={!!seccionEdit.ignorar_stock} onChange={e=>setSeccionEdit({...seccionEdit,ignorar_stock:e.target.checked})}/> Ignorar stock (Mayorista)</label><label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={!!seccionEdit.permitir_sin_stock} onChange={e=>setSeccionEdit({...seccionEdit,permitir_sin_stock:e.target.checked})}/> Permitir compra sin stock</label></div><button className="btn btn-primary" style={{width:'100%'}} onClick={saveSeccion}>Guardar sección</button></div></div></div>}
      <div className="admin-card" style={{marginTop:16}}>
        <h4>Andreani - Credenciales (.env)</h4>
        <p style={{fontSize:13}}>Configurá en Railway: ANDREANI_USER, ANDREANI_PASS, ANDREANI_CLIENTE (o NRO_CLIENTE), ANDREANI_CONTRATO, ANDREANI_CP_ORIGEN. El sistema ya acepta ambos nombres para compatibilidad. Debug en logs.</p>
      </div>
    </div>
  );
}
function AdminEstadisticas({toast}){
  const [stats,setStats]=useState(null);
  useEffect(()=>{ (async()=>{ const s=await api.getStats(); setStats(s); })(); },[]);
  if(!stats) return <div>Cargando...</div>;
  return(<div><h3>Estadísticas</h3><div className="admin-card"><h4>Ventas por día (últimos 30)</h4><table className="admin-table"><thead><tr><th>Fecha</th><th>Cantidad</th><th>Total</th></tr></thead><tbody>{stats.ventas_por_dia.map(d=><tr key={d.fecha}><td>{new Date(d.fecha).toLocaleDateString()}</td><td>{d.cantidad}</td><td>{fmtARS(d.total)}</td></tr>)}</tbody></table></div><div className="admin-card" style={{marginTop:16}}><h4>Top categorías</h4><table className="admin-table"><thead><tr><th>Categoría</th><th>Cantidad</th><th>Total</th></tr></thead><tbody>{stats.top_categorias.map(c=><tr key={c.categoria}><td>{c.categoria}</td><td>{c.cantidad}</td><td>{fmtARS(c.total)}</td></tr>)}</tbody></table></div></div>);
}
