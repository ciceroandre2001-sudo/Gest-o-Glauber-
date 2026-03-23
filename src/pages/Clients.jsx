import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Search, Filter, MessageSquare, AlertTriangle, TrendingUp, Cpu, X, Copy, Check, Send, Activity, Plus, Trash2, Phone } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function Clients() {
  const { clients, addClient, deleteClients } = useDatabase();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUf, setFilterUf] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Batch Actions
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modals
  const [selectedActionClient, setSelectedActionClient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', cnpj: '', city: '', uf: 'SP', status: 'Ativo', mainCategory: 'Cama', phone: '' });

  const [sidebarTab, setSidebarTab] = useState('chat');

  // IA Chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Olá! Sou a **Cortex Vision IA** (Integração Cloud 100% Interativa).\n\nEstou pronta para analisar sua carteira de acompanhamento offline diretamente na nuvem! Pode me fazer qualquer pergunta corporativa.', isHtml: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, sidebarTab]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.cnpj && c.cnpj.includes(searchTerm));
      const matchUf = filterUf ? c.uf === filterUf : true;
      const matchStatus = filterStatus ? c.status === filterStatus : true;
      return matchSearch && matchUf && matchStatus;
    });
  }, [clients, searchTerm, filterUf, filterStatus]);

  const aiInsightsList = useMemo(() => {
    return clients.filter(c => c.aiInsight);
  }, [clients]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if(selectedIds.length === filteredClients.length) setSelectedIds([]);
    else setSelectedIds(filteredClients.map(c => c.id));
  };

  const handleBatchDelete = () => {
    if(window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} clientes da sua base de dados local?`)) {
      deleteClients(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleCreateClient = (e) => {
    e.preventDefault();
    addClient({ 
      ...newClient, 
      volumeTotal: 0, 
      daysSinceLastPurchase: 0, 
      aiInsight: null 
    });
    setNewClient({ name: '', cnpj: '', city: '', uf: 'SP', status: 'Ativo', mainCategory: 'Cama', phone: '' });
    setShowAddModal(false);
  };

  const openWhatsAppModal = (client) => {
    setSelectedActionClient(client);
    setCopied(false);
  };

  const getWhatsAppMessage = (client) => {
    if (!client) return '';
    const name = client.name.split(' ')[0];
    if (client.actionType === 'churn_alert') {
      return `Olá ${name}, tudo bem? Sou o Glauber da Corttex.\n\nNotei que faz ${client.daysSinceLastPurchase} dias desde o seu último pedido conosco. Estamos com condições especiais na linha de ${client.mainCategory}. Podemos conversar 5 minutinhos?`;
    }
    return `Olá ${name}, tudo bem? Sou o Glauber da Corttex e trago novidades da linha de ${client.mainCategory}!`;
  };

  const processAIAgentLogic = async (msg) => {
    const apiKey = 'AIzaSyBrn2nskwDcmhSDLPnDXQYk2_wqcvGIeYg';

    try {
      const simplifiedDB = clients.slice(0, 50).map(c => ({ name: c.name, uf: c.uf, stat: c.status, val: c.volumeTotal }));
      const dbContextStr = JSON.stringify(simplifiedDB);
      
      const payload = {
        contents: [{
          parts: [{ text: `Você é "Cortex Vision IA", o analista de dados avançado 100% interativo para o app Corttex Brasil. Responda ESTRITAMENTE em Português-BR usando Markdown de forma limpa, corporativa e humanizada. Sem introduções longas.\n\nContexto da carteira: ${dbContextStr}\n\nUser: ${msg}` }]
        }]
      };
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if(!res.ok) {
         const errData = await res.json();
         throw new Error(errData.error?.message || 'Falha na API da Nuvem');
      }
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
      
    } catch (e) {
      return `❌ **Erro de Comunicação com Nuvem**\n\nA IA na Nuvem falhou com a seguinte mensagem:\n\`${e.message}\`\n\nVerifique se sua **Gemini API Key** em Configurações está correta.`;
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if(!chatInput.trim() || isTyping) return;
    
    const userMsg = { role: 'user', text: chatInput, isHtml: false };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    
    const currentInput = chatInput;
    setChatInput('');

    const response = await processAIAgentLogic(currentInput);
    setIsTyping(false);
    setChatMessages(prev => [...prev, { role: 'ai', text: response, isHtml: true }]);
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.2);padding:2px 4px;border-radius:4px;">$1</code>');
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');
    html = html.replace(/- \*(.*?)\*/g, '<br/>&bull; <em>$1</em>');
    html = html.replace(/- (.*?)(<br|\n|$)/g, '&bull; $1$2');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 450px', gap: '1.5rem', height: 'calc(100vh - 4rem)' }}>
      
      {/* Client List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Gestão de Clientes</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '8px 16px' }}><Plus size={16}/> Novo Cliente</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="text" placeholder="Buscar Razão Social ou CNPJ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px 10px 38px', color: 'var(--color-text-main)', width: '280px', outline: 'none' }} />
              </div>
              <select value={filterUf} onChange={e => setFilterUf(e.target.value)} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none', cursor: 'pointer' }}>
                <option value="">Todas UF</option>
                <option value="SP">SP</option><option value="RJ">RJ</option><option value="MG">MG</option><option value="RS">RS</option><option value="BA">BA</option><option value="CE">CE</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-main)', outline: 'none', cursor: 'pointer' }}>
                <option value="">Todos Status</option>
                <option value="Ativo">Ativo</option><option value="Inativo">Inativo</option>
              </select>
            </div>
            
            {selectedIds.length > 0 && (
              <button onClick={handleBatchDelete} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Trash2 size={16} /> Excluir ({selectedIds.length}) Selecionados
              </button>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px', color: 'var(--color-text-main)' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1.2rem 1rem', borderBottom: '1px solid var(--glass-border)', width: '40px' }}>
                    <input type="checkbox" checked={selectedIds.length === filteredClients.length && filteredClients.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }}/>
                  </th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Cliente / CNPJ</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Local e Contato</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Status</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Volume Mov.</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s', background: selectedIds.includes(client.id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '1rem' }}><input type="checkbox" checked={selectedIds.includes(client.id)} onChange={() => toggleSelect(client.id)} style={{ cursor: 'pointer' }}/></td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>{client.name}{client.aiInsight && <Cpu size={14} className="text-blue" />}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>CNPJ: {client.cnpj || 'Não Cadastrado'}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      <div>{client.city} - {client.uf}</div>
                      {client.phone && <div style={{ fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/> {client.phone}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, background: client.status === 'Ativo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: client.status === 'Ativo' ? 'var(--color-success)' : 'var(--color-danger)' }}>{client.status}</span></td>
                    <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.95rem' }} className="text-blue">{formatCurrency(client.volumeTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: AI Insights & Chat Sidebar */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(to right, rgba(6, 182, 212, 0.05), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={24} className="text-cyan" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Cortex Vision IA</h2>
          </div>
          <div style={{ display: 'flex', background: 'var(--color-bg-deep)', borderRadius: '8px', padding: '4px' }}>
            <button onClick={() => setSidebarTab('chat')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: sidebarTab === 'chat' ? 'var(--color-bg-charcoal)' : 'transparent', color: sidebarTab === 'chat' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: sidebarTab === 'chat' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}><MessageSquare size={16}/> IAI OpenSource</button>
            <button onClick={() => setSidebarTab('insights')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: sidebarTab === 'insights' ? 'var(--color-bg-charcoal)' : 'transparent', color: sidebarTab === 'insights' ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: sidebarTab === 'insights' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Alertas Ativos</button>
          </div>
        </div>
        
        {sidebarTab === 'insights' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiInsightsList.length === 0 ? (
              <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum alerta preditivo ativo no momento. As anomalias de risco aparecerão aqui.</p>
            ) : aiInsightsList.map(client => {
              const isChurn = client.actionType === 'churn_alert';
              const isUpsell = client.actionType === 'up_sell';
              return (
                <div key={`ai-${client.id}`} style={{ background: 'var(--color-bg-deep)', border: `1px solid ${isChurn ? 'rgba(239, 68, 68, 0.3)' : isUpsell ? 'rgba(251, 191, 36, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`, borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isChurn ? 'var(--color-danger)' : isUpsell ? 'var(--color-accent-gold)' : 'var(--color-accent-blue)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{client.name}</strong>
                    {isChurn ? <AlertTriangle size={16} color="var(--color-danger)" /> : isUpsell ? <TrendingUp size={16} color="var(--color-accent-gold)" /> : <Activity size={16} color="var(--color-accent-blue)" />}
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{client.aiInsight}</p>
                  <button onClick={() => openWhatsAppModal(client)} className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem', marginTop: '0.5rem', background: isChurn ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}>
                    <MessageSquare size={14} /> WhatsApp Co-Pilot
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-bg-deep)' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                  {msg.role === 'ai' && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Cpu size={14} color="white"/></div>}
                  <div style={{ maxWidth: '85%', padding: '14px 18px', borderRadius: '16px', fontSize: '0.9rem', lineHeight: 1.5, background: msg.role === 'user' ? 'var(--color-accent-blue)' : 'var(--color-bg-charcoal)', color: msg.role === 'user' ? 'white' : 'var(--color-text-main)', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px', border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none' }}>
                    {msg.isHtml ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Cpu size={14} color="white"/></div>
                  <div style={{ padding: '12px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px', background: 'var(--color-bg-charcoal)', border: '1px solid var(--glass-border)', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Analisando dados offline via Ollama Local...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px', background: 'var(--color-bg-charcoal)' }}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isTyping} placeholder="Pergunte à IA Open Source sobre sua base..." style={{ flex: 1, background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '10px 16px', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.9rem' }} />
              <button type="submit" disabled={!chatInput.trim() || isTyping} style={{ background: 'var(--color-accent-blue)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: chatInput.trim() && !isTyping ? 1 : 0.5 }}>
                <Send size={18} style={{ marginLeft: '-2px' }}/>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Cadastrar Novo Cliente</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateClient} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Razão Social" required value={newClient.name} onChange={e=>setNewClient({...newClient, name: e.target.value})} className="input-field" style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="CNPJ" required value={newClient.cnpj} onChange={e=>setNewClient({...newClient, cnpj: e.target.value})} style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}/>
                <input type="text" placeholder="Telefone / Contato" value={newClient.phone} onChange={e=>setNewClient({...newClient, phone: e.target.value})} style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Cidade" required value={newClient.city} onChange={e=>setNewClient({...newClient, city: e.target.value})} style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}/>
                <select value={newClient.uf} onChange={e=>setNewClient({...newClient, uf: e.target.value})} style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}>
                  <option value="SP">SP</option><option value="RJ">RJ</option><option value="MG">MG</option><option value="RS">RS</option><option value="BA">BA</option><option value="CE">CE</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '1rem' }}>Confirmar Cadastro</button>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {selectedActionClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ background: '#25D366', padding: '8px', borderRadius: '50%', display: 'flex' }}><MessageSquare size={18} color="white" /></span><h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>WhatsApp Co-Pilot IA</h3></div>
              <button onClick={() => setSelectedActionClient(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Mensagem gerada para <strong style={{ color: 'var(--color-text-main)' }}>{selectedActionClient.name}</strong>:</p>
              <div style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {getWhatsAppMessage(selectedActionClient)}
              </div>
              <button onClick={handleCopy} className="btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem', background: copied ? 'var(--color-success)' : undefined }}>
                {copied ? <><Check size={18} /> Copiado!</> : <><Copy size={18} /> Copiar para WhatsApp</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
