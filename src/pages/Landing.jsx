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

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-accent-cyan)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} /> Novo Sistema V2 Liberado
        </div>

        <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
          Inteligência em Gestão de <span style={{ background: 'linear-gradient(to right, var(--color-accent-blue), var(--color-accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Carteira Premium</span>
        </h1>
        
        <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          Transforme seus dados em ações estratégicas. Uma plataforma exclusiva da Corttex para impulsionar suas vendas com análise preditiva e inteligência de mercado.
        </p>

        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)' }}>
          Acessar Sistema <ArrowRight size={20} />
        </button>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}><BarChart3 className="text-blue" size={24} /></div>
            <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Dashboard Executivo</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}><Zap className="text-cyan" size={24} /></div>
            <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Cortex Vision AI</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}><ShieldCheck className="text-gold" size={24} /></div>
            <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Acesso Restrito</span>
          </div>
        </div>
      </main>
    </div>
  );
}
