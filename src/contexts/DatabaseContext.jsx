import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockClients } from '../data/mockClients';

const DatabaseContext = createContext();

const generateMockSales = () => {
  const arr = [];
  const months = 6;
  for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const count = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < count; j++) {
          const fakeDay = Math.floor(Math.random() * 28) + 1;
          const fakeDate = new Date(d.getFullYear(), d.getMonth(), fakeDay);
          arr.push({
              id: Math.random().toString(36).substr(2, 9),
              clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
              date: fakeDate.toISOString(),
              total: Math.floor(Math.random() * 8000) + 1500
          });
      }
  }
  return arr.sort((a,b) => new Date(a.date) - new Date(b.date));
};

export const DatabaseProvider = ({ children }) => {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('db_clients');
    return saved ? JSON.parse(saved) : mockClients;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('db_products');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Jogo de Cama Percal 200 Fios', category: 'Cama', price: 149.90 },
      { id: 'p2', name: 'Toalha de Banho Premium Fio Penteado', category: 'Banho', price: 59.90 },
      { id: 'p3', name: 'Cobertor Microfibra King Size', category: 'Mantas', price: 129.90 },
      { id: 'p4', name: 'Tapete Peludo Sala 2x2', category: 'Tapetes', price: 299.90 }
    ];
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('db_sales');
    return saved ? JSON.parse(saved) : generateMockSales();
  });

  useEffect(() => { localStorage.setItem('db_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('db_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('db_sales', JSON.stringify(sales)); }, [sales]);

  const addClient = (c) => setClients(prev => [{ id: Date.now().toString(), ...c }, ...prev]);
  const deleteClients = (ids) => setClients(prev => prev.filter(c => !ids.includes(c.id)));
  
  const addProduct = (p) => setProducts(prev => [{ id: Date.now().toString(), ...p }, ...prev]);
  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const addSale = (s) => {
    const newSale = { id: Date.now().toString(), ...s };
    setSales(prev => [...prev, newSale]);
    
    // Atualiza o volume do cliente correspondente
    setClients(prev => prev.map(c => 
      c.id === s.clientId 
        ? { ...c, volumeTotal: c.volumeTotal + Number(s.total), daysSinceLastPurchase: 0 } 
        : c
    ));
  };

  return (
    <DatabaseContext.Provider value={{ 
      clients, setClients, addClient, deleteClients, 
      products, addProduct, deleteProduct, 
      sales, addSale 
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => useContext(DatabaseContext);
