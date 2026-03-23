import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { ShoppingCart, Plus, Check, Calendar, DollarSign } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function Vendas() {
  const { clients, sales, addSale } = useDatabase();
  
  const [clientId, setClientId] = useState('');
  const [total, setTotal] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !total || !date) return;
    addSale({ clientId, total: parseFloat(total), date: new Date(date).toISOString() });
    setClientId('');
    setTotal('');
    setDate('');
    alert('Venda registrada e carteira do cliente atualizada com sucesso!');
  };

  const sortedSales = [...sales].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShoppingCart size={28} className="text-blue" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Central de Vendas</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18}/> Nova Venda</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Cliente Destino</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} required style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none' }}>
                <option value="">Selecione um Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.uf})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Valor Total da Venda (R$)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} required placeholder="Ex: 4500.00" style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px 10px 32px', color: 'var(--color-text-main)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Data do Faturamento</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px 10px 32px', color: 'var(--color-text-main)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Check size={18} /> Confirmar Lançamento
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Últimos 50 Lançamentos</h2>
          </div>
          <div style={{ overflow: 'auto', flex: 1, padding: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--color-text-main)' }}>
              <thead style={{ position: 'sticky', top: '-1.5rem', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Data</th>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Cliente</th>
                  <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhuma venda registrada.</td></tr>
                )}
                {sortedSales.map(s => {
                  const client = clients.find(c => c.id === s.clientId);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{client ? client.name : 'Cliente Excluído'}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(s.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
