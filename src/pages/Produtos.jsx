import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Package, Plus, Trash2 } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function Produtos() {
  const { products, addProduct, deleteProduct } = useDatabase();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cama');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    addProduct({ name, category, price: parseFloat(price) });
    setName('');
    setPrice('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Package size={28} className="text-cyan" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Catálogo de Produtos</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18}/> Novo Produto</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Nome do Produto</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Travesseiro Nasa..." style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none' }}>
                <option value="Cama">Cama</option>
                <option value="Mesa">Mesa</option>
                <option value="Banho">Banho</option>
                <option value="Cortinas">Cortinas</option>
                <option value="Mantas">Mantas</option>
                <option value="Tapetes">Tapetes</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-muted" style={{ fontSize: '0.85rem' }}>Preço Base Unitário (R$)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="Ex: 89.90" style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              Cadastrar Produto
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Estoque Atual</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--color-text-main)' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Nome</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Categoria</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Preço</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhum produto cadastrado.</td></tr>
              )}
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{p.category}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-accent-blue)' }}>{formatCurrency(p.price)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => deleteProduct(p.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
