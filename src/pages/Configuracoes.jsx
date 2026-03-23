import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Palette, Cpu, Key, Check } from 'lucide-react';

export default function Configuracoes() {
  const { isDark, setIsDark, accentColor, setAccentColor } = useTheme();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [saved, setSaved] = useState(false);
  
  const colors = [
    { label: 'Azul Elétrico', value: '#3b82f6' },
    { label: 'Ciano', value: '#06b6d4' },
    { label: 'Esmeralda', value: '#10b981' },
    { label: 'Roxo', value: '#8b5cf6' },
    { label: 'Rosa', value: '#f43f5e' }
  ];

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text-main)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Configurações do Sistema</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '700px' }}>
        
        {/* IA Cloud Config */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <Cpu size={20} className="text-blue" /> Integração de Inteligência Artificial (Nuvem)
          </h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Para que a <strong>Cortex Vision IA</strong> converse em tempo real com sua base de clientes sem precisar baixar nada pesado no seu computador, informe sua chave secreta da API do Google Gemini (gratuita e open-source para desenvolvedores).<br/><br/>
            Crie sua chave em 1 minuto aqui: <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-blue)' }}>Google AI Studio</a>.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                 type="password" 
                 placeholder="Cole sua Gemini API Key aqui (ex: AIzaSyB...)" 
                 value={apiKey}
                 onChange={e => setApiKey(e.target.value)}
                 style={{ width: '100%', background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={handleSaveKey} disabled={!apiKey.trim()} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', opacity: apiKey.trim() ? 1 : 0.5 }}>
              {saved ? <><Check size={18}/> Salvo</> : 'Salvar Chave'}
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }}/>

        {/* Tema */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <Moon size={20} className="text-blue" /> Modo Visual
          </h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setIsDark(true)}
              style={{ padding: '12px 24px', borderRadius: '8px', border: isDark ? '2px solid var(--color-accent-blue)' : '1px solid var(--glass-border)', background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
              <Moon size={18} /> Escuro
            </button>
            <button 
              onClick={() => setIsDark(false)}
              style={{ padding: '12px 24px', borderRadius: '8px', border: !isDark ? '2px solid var(--color-accent-blue)' : '1px solid var(--glass-border)', background: '#f8fafc', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
              <Sun size={18} /> Claro
            </button>
          </div>
        </div>

        {/* Cor Destaque */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <Palette size={20} className="text-blue" /> Destaque do Sistema
          </h3>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Escolha a cor primária para botões, gráficos e ações.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setAccentColor(c.value)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: c.value, cursor: 'pointer',
                  border: accentColor === c.value ? '2px solid var(--color-text-main)' : 'none',
                  boxShadow: accentColor === c.value ? `0 0 12px ${c.value}80` : 'none',
                  transition: 'all 0.2s'
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
