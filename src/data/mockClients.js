export const mockClients = Array.from({ length: 50 }).map((_, i) => {
  const cities = [
    { city: 'São Paulo', uf: 'SP', lat: -23.5505, lng: -46.6333 },
    { city: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729 },
    { city: 'Belo Horizonte', uf: 'MG', lat: -19.9208, lng: -43.9378 },
    { city: 'Curitiba', uf: 'PR', lat: -25.4284, lng: -49.2733 },
    { city: 'Porto Alegre', uf: 'RS', lat: -30.0346, lng: -51.2177 },
    { city: 'Salvador', uf: 'BA', lat: -12.9714, lng: -38.5014 },
    { city: 'Recife', uf: 'PE', lat: -8.0476, lng: -34.8770 },
    { city: 'Fortaleza', uf: 'CE', lat: -3.7172, lng: -38.5431 }
  ];
  const categories = ['Cama', 'Mesa', 'Banho', 'Tapetes', 'Mantas'];
  const names = ['Varejo Silva', 'Magazine Premium', 'Casa e Conforto', 'Decor Lar', 'Enxovais Real', 'Têxtil Center', 'Bazar do Povo', 'Rede Casa', 'Cama Certa', 'Imperador Enxovais'];
  
  const cityObj = cities[i % cities.length];
  const baseName = names[i % names.length];
  const category = categories[i % categories.length];
  
  const daysSinceLastPurchase = (i * 7) % 65; 
  let lastPurchaseDate = new Date();
  lastPurchaseDate.setDate(lastPurchaseDate.getDate() - daysSinceLastPurchase);
  
  const volumeTotal = 5000 + ((i * 1378) % 150000);
  const isActive = daysSinceLastPurchase < 50;
  
  let aiInsight = null;
  let aiSuggestion = null;
  let actionType = null;
  
  if (daysSinceLastPurchase >= 45) {
    aiInsight = `Risco de Churn. Sem comprar há ${daysSinceLastPurchase} dias.`;
    aiSuggestion = `Gerar Mensagem de Reativação no WhatsApp`;
    actionType = 'churn_alert';
  } else if (category === 'Cama' && (i % 3 === 0)) {
    aiInsight = `Compra alta de "Cama", zero de "Banho" na região.`;
    aiSuggestion = `Sugerir mix complementar de Banho Corttex.`;
    actionType = 'cross_sell';
  } else if (volumeTotal > 50000 && i % 4 === 0) {
    aiInsight = `Alto potencial: focado em linhas populares.`;
    aiSuggestion = `Apresentar nova linha de Cobertores Premium.`;
    actionType = 'up_sell';
  }

  return {
    id: i + 1,
    name: `${baseName} ${cityObj.uf} ${i+1}`,
    cnpj: `00.000.${String(i).padStart(3, '0')}/0001-${String(i % 99).padStart(2,'0')}`,
    city: cityObj.city,
    uf: cityObj.uf,
    lat: cityObj.lat,
    lng: cityObj.lng,
    status: isActive ? 'Ativo' : 'Inativo',
    lastPurchaseDate: lastPurchaseDate.toISOString(),
    daysSinceLastPurchase,
    volumeTotal,
    mainCategory: category,
    aiInsight,
    aiSuggestion,
    actionType
  };
});

export const kpiData = {
  faturamentoMes: 1254300.50,
  crescimentoFaturamento: 12.5,
  clientesAtivos: mockClients.filter(c => c.status === 'Ativo').length,
  ticketMedio: 25086.01,
  metaAtingida: 78
};
