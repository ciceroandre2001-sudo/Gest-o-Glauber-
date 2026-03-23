import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg-deep)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="https://corttex.com.br/wp-content/uploads/2021/04/Logo-Corttex-1.png" alt="Corttex" style={{ height: '35px', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <h2 style={{ display: 'none', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-accent-blue)' }}>CORTTEX</h2>
        </div>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: 'var(--color-text-main)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
          Área do Representante
        </button>
      </header>

      <main style={{ flex: 1 }}></main>
    </div>
  );
}
