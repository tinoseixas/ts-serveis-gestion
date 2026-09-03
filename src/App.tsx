import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ArticleManager } from './components/ArticleManager';
import { QuoteManager } from './components/QuoteManager';
import { InvoiceManager } from './components/InvoiceManager';
import { CompanySettings } from './components/CompanySettings';
import { QuickLookupModal } from './components/QuickLookupModal';

import { storageService } from './services/storageService';
import type { Empresa, Client, Article, Pressupost, Factura } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(storageService.getTheme());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lookupType, setLookupType] = useState<'articles' | 'clients' | null>(null);

  const [empresa, setEmpresa] = useState<Empresa>(storageService.getEmpresa());
  const [clients, setClients] = useState<Client[]>(storageService.getClients());
  const [articles, setArticles] = useState<Article[]>(storageService.getArticles());
  const [pressupostos, setPressupostos] = useState<Pressupost[]>(storageService.getPressupostos());
  const [factures, setFactures] = useState<Factura[]>(storageService.getFactures());

  // Sincronització del tema amb el body HTML
  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : '';
    storageService.saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const recarregarDades = () => {
    setEmpresa(storageService.getEmpresa());
    setClients(storageService.getClients());
    setArticles(storageService.getArticles());
    setPressupostos(storageService.getPressupostos());
    setFactures(storageService.getFactures());
  };

  // Handlers Clients
  const handleSaveClient = (client: Client) => {
    const exist = clients.some(c => c.id === client.id);
    let noves: Client[];
    if (exist) {
      noves = clients.map(c => c.id === client.id ? client : c);
    } else {
      noves = [client, ...clients];
    }
    setClients(noves);
    storageService.saveClients(noves);
  };

  const handleDeleteClient = (id: string) => {
    const noves = clients.filter(c => c.id !== id);
    setClients(noves);
    storageService.saveClients(noves);
  };

  // Handlers Articles
  const handleSaveArticle = (article: Article) => {
    const exist = articles.some(a => a.id === article.id);
    let noves: Article[];
    if (exist) {
      noves = articles.map(a => a.id === article.id ? article : a);
    } else {
      noves = [article, ...articles];
    }
    setArticles(noves);
    storageService.saveArticles(noves);
  };

  const handleDeleteArticle = (id: string) => {
    const noves = articles.filter(a => a.id !== id);
    setArticles(noves);
    storageService.saveArticles(noves);
  };

  // Handlers Pressupostos
  const handleSavePressupost = (pressupost: Pressupost) => {
    const exist = pressupostos.some(p => p.id === pressupost.id);
    let noves: Pressupost[];
    if (exist) {
      noves = pressupostos.map(p => p.id === pressupost.id ? pressupost : p);
    } else {
      noves = [pressupost, ...pressupostos];
    }
    setPressupostos(noves);
    storageService.savePressupostos(noves);
  };

  const handleDeletePressupost = (id: string) => {
    const noves = pressupostos.filter(p => p.id !== id);
    setPressupostos(noves);
    storageService.savePressupostos(noves);
  };

  // Conversió Directa de Pressupost a Factura
  const handleConvertToFactura = (pressupost: Pressupost) => {
    const nouNumFactura = `F-2026/${String(factures.length + 1).padStart(3, '0')}`;
    const dataAvui = new Date().toISOString().split('T')[0];
    const dataVenc = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const novaFactura: Factura = {
      id: 'fac-' + Date.now(),
      numero: nouNumFactura,
      pressupostId: pressupost.id,
      clientId: pressupost.clientId,
      clientNom: pressupost.clientNom,
      clientNif: pressupost.clientNif,
      clientAdreca: pressupost.clientAdreca,
      clientPoblacio: pressupost.clientPoblacio,
      clientCodiPostal: pressupost.clientCodiPostal,
      clientEmail: pressupost.clientEmail,
      clientTelefon: pressupost.clientTelefon,
      data: dataAvui,
      dataVenciment: dataVenc,
      estat: 'pendent',
      formaPagament: 'transferencia',
      linies: JSON.parse(JSON.stringify(pressupost.linies)),
      subtotal: pressupost.subtotal,
      totalIva: pressupost.totalIva,
      irpfPercent: 0,
      totalIrpf: 0,
      total: pressupost.total,
      notes: `Factura corresponent al pressupost ${pressupost.numero}.`,
      dataCreacio: dataAvui
    };

    const novesFactures = [novaFactura, ...factures];
    setFactures(novesFactures);
    storageService.saveFactures(novesFactures);

    const pressupostActualitzat: Pressupost = { ...pressupost, estat: 'acceptat' };
    handleSavePressupost(pressupostActualitzat);

    setActiveTab('factures');
    alert(`Enhorabona! S'ha creat la Factura ${nouNumFactura} a partir del pressupost ${pressupost.numero}.`);
  };

  // Handlers Factures
  const handleSaveFactura = (factura: Factura) => {
    const exist = factures.some(f => f.id === factura.id);
    let noves: Factura[];
    if (exist) {
      noves = factures.map(f => f.id === factura.id ? factura : f);
    } else {
      noves = [factura, ...factures];
    }
    setFactures(noves);
    storageService.saveFactures(noves);
  };

  const handleDeleteFactura = (id: string) => {
    const noves = factures.filter(f => f.id !== id);
    setFactures(noves);
    storageService.saveFactures(noves);
  };

  // Handlers Empresa
  const handleSaveEmpresa = (novaEmpresa: Empresa) => {
    setEmpresa(novaEmpresa);
    storageService.saveEmpresa(novaEmpresa);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#c5d8ef] text-slate-900 font-sans antialiased overflow-x-hidden select-none">
      {/* 1. Barra Superior Completa PHC Advanced 2009 (Titlebar + Menus + Iconbar + Logo Watermark) */}
      <Topbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        empresa={empresa}
        onOpenLookup={type => setLookupType(type)}
      />

      {/* 2. Àrea Central (Painel Navegador Esquerre + Espai de Treball Central PHC) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Painel Navegador Esquerre (Pocket / Indicadores / Monitores) */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          empresa={empresa}
        />

        {/* Panell de Contingut de Mòdul Central */}
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto max-w-full bg-[#d8e5f5]">
          {activeTab === 'dashboard' && (
            <Dashboard 
              pressupostos={pressupostos}
              factures={factures}
              clients={clients}
              articles={articles}
              setActiveTab={setActiveTab}
              onCrearPressupost={() => setActiveTab('pressupostos')}
              onCrearFactura={() => setActiveTab('factures')}
            />
          )}

          {activeTab === 'pressupostos' && (
            <QuoteManager 
              pressupostos={pressupostos}
              clients={clients}
              articles={articles}
              empresa={empresa}
              onSavePressupost={handleSavePressupost}
              onDeletePressupost={handleDeletePressupost}
              onConvertToFactura={handleConvertToFactura}
            />
          )}

          {activeTab === 'factures' && (
            <InvoiceManager 
              factures={factures}
              clients={clients}
              articles={articles}
              empresa={empresa}
              onSaveFactura={handleSaveFactura}
              onDeleteFactura={handleDeleteFactura}
            />
          )}

          {activeTab === 'articles' && (
            <ArticleManager 
              articles={articles}
              onSaveArticle={handleSaveArticle}
              onDeleteArticle={handleDeleteArticle}
            />
          )}

          {activeTab === 'clients' && (
            <ClientManager 
              clients={clients}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'configuracio' && (
            <CompanySettings 
              empresa={empresa}
              onSaveEmpresa={handleSaveEmpresa}
              onReloadAllData={recarregarDades}
            />
          )}
        </main>
      </div>

      {/* 3. Barra d'Estat Inferior Clàssica de PHC Advanced (Software PHC / Administrador / Empresa) */}
      <footer className="h-6 bg-[#ece9d8] border-t border-[#b2b0a6] text-slate-800 text-[11px] font-semibold px-3 flex items-center justify-between shrink-0 shadow-inner">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-blue-900 font-extrabold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Software PHC Advanced
          </span>
          <span className="text-slate-400">|</span>
          <span>👤 Administrador de Sistema</span>
          <span className="text-slate-400">|</span>
          <span>📁 {empresa.nom}_2026</span>
          <span className="text-slate-400">|</span>
          <span>🏢 {empresa.nom}, Lda</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
          <span>ℹ️ Exercício Fiscal 2026</span>
          <span>• Andorra AD</span>
        </div>
      </footer>

      {/* Modal Popup Lookup si està actiu */}
      {lookupType && (
        <QuickLookupModal 
          type={lookupType}
          articles={articles}
          clients={clients}
          onClose={() => setLookupType(null)}
        />
      )}
    </div>
  );
}

export default App;
