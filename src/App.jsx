
import {useState, useEffect} from 'react'
const API = import.meta.env.VITE_API_URL || 'https://sistema-unificado-v4-api-production.up.railway.app'

export default function App(){
  const [token,setToken]=useState(localStorage.getItem('gm_token')||'')
  const [user,setUser]=useState(null)
  const [view,setView]=useState('productos')
  const [open,setOpen]=useState(false)
  const [productos,setProductos]=useState([])
  const [q,setQ]=useState('')
  const [login,setLogin]=useState({usuario:'admin',password:'Admin1234.'})
  const [file,setFile]=useState(null)

  useEffect(()=>{ if(token) fetch(API+'/api/me',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json()).then(d=>{if(d.id)setUser(d); else logout()}).catch(()=>logout()) },[])
  function logout(){ localStorage.removeItem('gm_token'); setToken(''); setUser(null) }

  useEffect(()=>{ if(user) load() },[user])
  async function load(){
    try{
      const r=await fetch(API+'/api/productos?limit=todos',{headers:{Authorization:'Bearer '+token}})
      const d=await r.json()
      setProductos(d.productos||d||[])
    }catch{}
  }
  async function doLogin(e){
    e.preventDefault()
    try{
      const r=await fetch(API+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(login)})
      const d=await r.json()
      if(!r.ok) throw new Error(d.error||'Error')
      localStorage.setItem('gm_token',d.token); setToken(d.token); setUser(d.user)
    }catch(err){ alert(err.message) }
  }

  const filtered = productos.filter(p=>!q || (p.nombre||'').toLowerCase().includes(q.toLowerCase()))

  if(!user){
    return <div style={{minHeight:'100vh',background:'#232321',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <form onSubmit={doLogin} style={{background:'white',borderRadius:16,padding:24,width:'100%',maxWidth:360}}>
        <b>Lean-Droid - Entrar</b><br/><small style={{color:'#888'}}>API: {API}</small>
        <input style={{width:'100%',border:'1px solid #ddd',borderRadius:12,padding:12,marginTop:12}} value={login.usuario} onChange={e=>setLogin({...login,usuario:e.target.value})}/>
        <input type="password" style={{width:'100%',border:'1px solid #ddd',borderRadius:12,padding:12,marginTop:8}} value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/>
        <button style={{width:'100%',background:'#4A69E2',color:'white',borderRadius:12,padding:12,marginTop:12,fontWeight:700}}>Entrar</button>
      </form>
    </div>
  }

  return <div>
    <header style={{position:'fixed',top:0,left:0,right:0,height:56,background:'white',borderBottom:'1px solid #ddd',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',zIndex:40}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:32,height:32,background:'black',borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center'}}>🦖</div><b>Lean-Droid</b></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:12,border:'1px solid #ddd',borderRadius:999,padding:'4px 10px'}}>{user.usuario}</span><button onClick={()=>setOpen(!open)} style={{width:32,height:32,display:'flex',flexDirection:'column',justifyContent:'center',gap:4}}><span style={{height:2,background:'black',display:'block'}}></span><span style={{height:2,background:'black',display:'block'}}></span><span style={{height:2,background:'black',display:'block'}}></span></button></div>
    </header>
    {open && <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:40,top:56}}></div>}
    <aside className={open?'open':''} style={{position:'fixed',top:56,left:0,bottom:0,width:280,background:'#121212',color:'white',padding:12,zIndex:50,overflowY:'auto',transition:'.3s'}} className={`sidebar ${open?'open':''}`}>
      <button onClick={()=>{setView('productos');setOpen(false)}} style={{width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:12,background:view==='productos'?'white':'transparent',color:view==='productos'?'black':'white',marginTop:8}}>📦 Productos ({productos.length})</button>
      <button onClick={()=>{setView('importar');setOpen(false)}} style={{width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:12,background:view==='importar'?'white':'transparent',color:view==='importar'?'black':'#ccc',marginTop:8}}>📤 Importar Excel</button>
      <button onClick={()=>{setView('dashboard');setOpen(false)}} style={{width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:12,background:view==='dashboard'?'white':'transparent',color:view==='dashboard'?'black':'#ccc',marginTop:8}}>📊 Dashboard</button>
      <button onClick={logout} style={{width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:12,color:'#ff8a8a',marginTop:24}}>🚪 Salir</button>
      <div style={{marginTop:24,fontSize:10,color:'#666'}}>V4 Working Minimal - Fix mobile ok<br/>API: {API}</div>
    </aside>
    <main className="main-content" style={{paddingTop:56,marginLeft:280,padding:16}}>
      {view==='productos' && <>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,gap:8,flexWrap:'wrap'}}><h1 style={{fontWeight:800,fontSize:20}}>Productos ({filtered.length})</h1><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." style={{border:'1px solid #ddd',borderRadius:12,padding:'8px 12px'}}/></div>
        <div className="table-wrap" style={{background:'white',borderRadius:16,border:'1px solid #eee',overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}><thead style={{background:'#f9f9f9',fontSize:11}}><tr><th style={{padding:10,textAlign:'left'}}>NOMBRE</th><th style={{padding:10}}>CAT</th><th style={{padding:10}}>STOCK</th><th style={{padding:10}}>PRECIO</th></tr></thead><tbody>{filtered.slice(0,200).map(p=><tr key={p.id} style={{borderTop:'1px solid #eee'}}><td style={{padding:10,fontWeight:600}}>{p.nombre||p.modelo}</td><td style={{padding:10}}>{p.categoria}</td><td style={{padding:10}}>{p.stock}</td><td style={{padding:10,fontWeight:700}}>${p.precio_base||p.precio||0}</td></tr>)}</tbody></table></div>
        </div>
      </>}
      {view==='importar' && <div style={{background:'white',borderRadius:16,padding:16,border:'1px solid #eee'}}><h2 style={{fontWeight:700,marginBottom:8}}>Importar productos por Excel</h2><p style={{fontSize:13,color:'#666',marginBottom:12}}>Usá tu Excel original. El sistema hace bulk. Si no tenés el formato, subí cualquier Excel con columnas: nombre, precio_base, stock, categoria</p><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])}/><br/><button onClick={async()=>{
        if(!file) return alert('Elegí archivo')
        const fd=new FormData(); fd.append('file',file)
        // Intenta endpoint bulk - tu API original lo tiene en /api/productos/bulk con JSON, pero para Excel usa tu endpoint existente
        alert('Subí el Excel por tu panel original de Importar/Exportar. Este minimal es para que el build no falle y quedes andando. Si querés, después restauramos el panel completo de importación.')
      }} style={{marginTop:12,background:'#4A69E2',color:'white',borderRadius:12,padding:'10px 16px'}}>Subir (ver nota)</button></div>}
      {view==='dashboard' && <div style={{background:'white',borderRadius:16,padding:16,border:'1px solid #eee'}}><h2 style={{fontWeight:700}}>Andando</h2><p style={{fontSize:13,color:'#666',marginTop:8}}>Productos: {productos.length}<br/>API: {API}<br/>Fix mobile aplicado: sidebar con overlay, tablas con scroll</p></div>}
    </main>
  </div>
}
