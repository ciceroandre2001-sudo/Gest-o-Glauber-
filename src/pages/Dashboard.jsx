import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { DollarSign, Users, Target, Activity, FileText, CheckCircle2, TrendingUp, Edit2, Check, Filter, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTheme } from '../contexts/ThemeContext';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function Dashboard() {
  const { isDark } = useTheme();
  const { clients, sales } = useDatabase();
  const reportRef = useRef();

  const [metaMensal, setMetaMensal] = useState(() => localStorage.getItem('metaMensal') || '1600000');
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState(metaMensal);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Filtros Globais (V5)
  const [filtros, setFiltros] = useState({ uf: '', categoria: '', dataInicio: '', dataFim: '' });

  useEffect(() => {
    localStorage.setItem('metaMensal', metaMensal);
  }, [metaMensal]);

  const handleSaveMeta = () => {
    setMetaMensal(tempMeta);
    setIsEditingMeta(false);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: isDark ? '#070b14' : '#f8fafc', useCORS: true });
      const data = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(data, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(data, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save('Relatorio_Executivo_Corttex_V5.pdf');
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar PDF');
    }
    setIsGeneratingPDF(false);
  };

  // Aplicação dos Filtros nas Vendas
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Data Filters
      if (filtros.dataInicio && new Date(s.date) < new Date(filtros.dataInicio)) return false;
      if (filtros.dataFim && new Date(s.date) > new Date(filtros.dataFim)) return false;
      
      // Relational Filters
      const client = clients.find(c => c.id === s.clientId);
      if (!client) return false;
      if (filtros.uf && client.uf !== filtros.uf) return false;
      if (filtros.categoria && client.mainCategory !== filtros.categoria) return false;
      
      return true;
    });
  }, [sales, clients, filtros]);

  // Aplicação dos Filtros Híbridos nos Clientes (para Mapa e Top 10)
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (filtros.uf && c.uf !== filtros.uf) return false;
      if (filtros.categoria && c.mainCategory !== filtros.categoria) return false;
      
      // Se tiver data, cliente tem que ter pelo menos 1 venda naquele intervalo
      if (filtros.dataInicio || filtros.dataFim) {
        const hasSalesInPeriod = filteredSales.some(s => s.clientId === c.id);
        if (!hasSalesInPeriod) return false;
      }
      return true;
    });
  }, [clients, filteredSales, filtros]);

  // Derived KPIs baseados no filtro
  const faturamento = filteredSales.reduce((acc, s) => acc + Number(s.total), 0);
  const clientesAtivos = filteredClients.filter(c => c.status === 'Ativo').length;
  const ticketMedio = filteredSales.length > 0 ? faturamento / filteredSales.length : 0;
  const porcentagemMeta = Math.min(100, Math.round((faturamento / parseFloat(metaMensal)) * 100));

  // Gráfico de Vendas Mês a Mês V5
  const salesChartData = useMemo(() => {
    const months = {};
    filteredSales.forEach(s => {
       const d = new Date(s.date);
       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
       if(!months[key]) months[key] = { month: key, quantidade: 0, valorTotal: 0 };
       months[key].quantidade += 1;
       months[key].valorTotal += Number(s.total);
    });
    const sorted = Object.values(months).sort((a,b) => a.month.localeCompare(b.month));
    return sorted.map(m => ({
       name: m.month,
       Quantidade: m.quantidade,
       MediaVenda: m.quantidade > 0 ? (m.valorTotal / m.quantidade) : 0
    }));
  }, [filteredSales]);

  // Maps & Charts Data
  const topClients = useMemo(() => {
    return [...filteredClients].sort((a,b) => b.volumeTotal - a.volumeTotal).slice(0, 5).map(c => ({ name: c.name.split(' ')[0], volume: c.volumeTotal }));
  }, [filteredClients]);

  const productMix = useMemo(() => {
    const mixMap = {};
    filteredClients.forEach(c => { mixMap[c.mainCategory] = (mixMap[c.mainCategory] || 0) + c.volumeTotal; });
    return Object.entries(mixMap).map(([name, value]) => ({name, value})).sort((a,b) => b.value - a.value);
  }, [filteredClients]);
  const PIE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#fbbf24', '#f43f5e'];

  const mapData = useMemo(() => {
    const stateData = {};
    filteredClients.forEach(c => {
      if(!stateData[c.uf]) stateData[c.uf] = { uf: c.uf, lat: c.lat, lng: c.lng, clients: 0, volume: 0, categoryCounts: {} };
      stateData[c.uf].clients++;
      stateData[c.uf].volume += c.volumeTotal;
      stateData[c.uf].categoryCounts[c.mainCategory] = (stateData[c.uf].categoryCounts[c.mainCategory] || 0) + 1;
    });
    return Object.values(stateData).map(s => { 
      const sorted = Object.entries(s.categoryCounts).sort((a,b) => b[1] - a[1]);
      s.mainCat = sorted.length > 0 ? sorted[0][0] : 'N/A'; 
      return s; 
    });
  }, [filteredClients]);

  const activities = useMemo(() => {
    const alerts = filteredClients.filter(c => c.aiInsight).slice(0, 5);
    return alerts.map(c => ({
      id: c.id,
      title: c.actionType === 'churn_alert' ? 'Risco de Churn' : c.actionType === 'up_sell' ? 'Oportunidade Up-Sell' : 'Oportunidade Cross-Sell',
      desc: `Falar com ${c.name} - ${c.uf}`,
      type: c.actionType
    }));
  }, [filteredClients]);

  const selectStyle = { background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-text-main)', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' };
  const inputStyle = { background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} ref={reportRef}>
      <style>{`
        @keyframes ticker-anim {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .ticker-wrap { width: 100%; overflow: hidden; background: var(--glass-bg); padding: 8px 0; border-bottom: 1px solid var(--glass-border); display: flex; white-space: nowrap; box-sizing: border-box; }
        /* Velocidade da animação reduzida em 50% (agora 90s) */
        .ticker-content { display: inline-block; padding-left: 100%; animation: ticker-anim 90s linear infinite; }
        .ticker-item { display: inline-flex; align-items: center; gap: 8px; margin-right: 3rem; color: var(--color-text-main); font-size: 0.85rem; font-weight: 500; }
        .ticker-value { color: var(--color-success); font-weight: 700; }
      `}</style>

      {/* Ticker V5 */}
      <div className="ticker-wrap glass-panel" style={{ margin: '-2rem -2rem 0 -2rem', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="ticker-content">
          {sales.slice(-10).map((s, idx) => {
             const c = clients.find(cl => cl.id === s.clientId);
             return c && (
               <span key={idx} className="ticker-item">
                 <TrendingUp size={14} className="text-blue" /> Venda para {c.name.split(' ')[0]} ({c.uf}) <span className="ticker-value">{formatCurrency(s.total)}</span>
               </span>
             )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Painel Executivo</h1>
        <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> {isGeneratingPDF ? 'Gerando PDF...' : 'Exportar Relatório'}
        </button>
      </div>

      {/* Global Filters Bar V5 */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-blue)', fontWeight: 600 }}>
          <Filter size={18} /> Filtros:
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="text-muted" style={{ fontSize: '0.85rem' }}>De:</label>
          <input type="date" value={filtros.dataInicio} onChange={e => setFiltros({...filtros, dataInicio: e.target.value})} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="text-muted" style={{ fontSize: '0.85rem' }}>Até:</label>
          <input type="date" value={filtros.dataFim} onChange={e => setFiltros({...filtros, dataFim: e.target.value})} style={inputStyle} />
        </div>

        <select value={filtros.uf} onChange={e => setFiltros({...filtros, uf: e.target.value})} style={selectStyle}>
          <option value="">Todas Regiões (UFs)</option>
          <option value="SP">SP</option><option value="RJ">RJ</option><option value="MG">MG</option><option value="RS">RS</option><option value="BA">BA</option><option value="CE">CE</option>
        </select>
        
        <select value={filtros.categoria} onChange={e => setFiltros({...filtros, categoria: e.target.value})} style={selectStyle}>
           <option value="">Todas Categorias</option><option value="Cama">Cama</option><option value="Mesa">Mesa</option><option value="Banho">Banho</option><option value="Tapetes">Tapetes</option><option value="Mantas">Mantas</option>
        </select>

        <button onClick={() => setFiltros({ uf: '', categoria: '', dataInicio: '', dataFim: '' })} style={{ background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>Limpar</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <KpiCard title="Faturamento (Período)" value={formatCurrency(faturamento)} icon={DollarSign} color="var(--color-accent-blue)" />
        <KpiCard title="Vendas Registradas" value={filteredSales.length} icon={Activity} color="var(--color-accent-gold)" />
        <KpiCard title="Ticket Médio" value={formatCurrency(ticketMedio)} icon={Target} color="var(--color-accent-cyan)" />
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Progresso da Meta Global</h3>
                <button onClick={() => setIsEditingMeta(!isEditingMeta)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}><Edit2 size={12} /></button>
              </div>
              {isEditingMeta ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{color: 'var(--color-text-main)', fontSize: '0.8rem'}}>R$</span>
                  <input type="number" value={tempMeta} onChange={e => setTempMeta(e.target.value)} style={{ width: '80px', background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', color: 'var(--color-text-main)', borderRadius: '4px', padding: '4px', fontSize: '0.8rem' }}/>
                  <button onClick={handleSaveMeta} style={{ background: 'var(--color-success)', border: 'none', color: 'white', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><Check size={14}/></button>
                </div>
              ) : (
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{porcentagemMeta}%</p>
              )}
            </div>
            <div style={{ padding: '10px', background: `rgba(16, 185, 129, 0.15)`, borderRadius: '12px', color: 'var(--color-success)' }}><Target size={24} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${porcentagemMeta}%`, height: '100%', background: 'var(--color-success)', borderRadius: '3px' }} />
            </div>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Alvo: {formatCurrency(metaMensal)}</span>
          </div>
        </div>
      </div>

      {/* New Line Chart Section V5 */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Evolução Mensal de Vendas e Ticket</h2>
         <div style={{ height: '300px', width: '100%' }}>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => 
                     val >= 1000 ? `k` : val
                  } />
                  <RechartsTooltip contentStyle={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', color: 'var(--color-text-main)', borderRadius: '8px' }} formatter={(val, name) => [name === 'MediaVenda' ? formatCurrency(val) : val, name === 'MediaVenda' ? 'Média Valor/Venda' : 'Qtd. de Vendas']} />
                  <Line yAxisId="left" type="monotone" dataKey="Quantidade" stroke="var(--color-accent-cyan)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="MediaVenda" stroke="var(--color-accent-gold)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Nenhuma venda no período.</div>}
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mapa de Densidade Comercial</h2>
            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={[-14.235, -51.925]} zoom={4} style={{ height: '100%', width: '100%', background: '#1e293b' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {mapData.map(state => (
                  <CircleMarker key={state.uf} center={[state.lat, state.lng]} radius={Math.max(10, Math.min(state.volume / 10000, 35))} pathOptions={{ color: 'var(--color-accent-cyan)', fillColor: 'var(--color-accent-blue)', fillOpacity: 0.6 }}>
                    <Popup>
                      <div style={{ background: '#0f172a', color: 'white', padding: '5px', borderRadius: '4px' }}>
                        <strong style={{ fontSize: '1.1em' }}>{state.uf}</strong><br/>
                        <span>Volume: {formatCurrency(state.volume)}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Top 5 Clientes</h2>
            <div style={{ flex: 1, minHeight: '180px' }}>
              {topClients.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} width={80} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', color: 'var(--color-text-main)' }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="volume" fill="var(--color-accent-blue)" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
              ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Sem dados</div>}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mix de Produtos</h2>
            <div style={{ flex: 1, minHeight: '180px' }}>
              {productMix.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productMix} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {productMix.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', color: 'var(--color-text-main)' }} formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Sem dados</div>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {productMix.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                  <span className="text-muted">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, trend, color }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{value}</p>
        </div>
        <div style={{ padding: '10px', background: `${color}15`, borderRadius: '12px', color: color }}><Icon size={24} /></div>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>{trend}</span>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>vs mês anterior</span>
        </div>
      )}
    </div>
  )
}
