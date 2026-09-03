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
    <div className="min-h-screen flex bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Sidebar Col·lapsable Lateral PHC */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        empresa={empresa}
      />

      {/* Àrea de Contingut Principal amb offset dinàmic de Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        {/* Topbar Persistent de Comanda */}
        <Topbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          empresa={empresa}
          onOpenLookup={type => setLookupType(type)}
        />

        {/* Panell de Contingut de Mòdul */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 overflow-y-auto max-w-full">
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

        <footer className="py-3 px-6 border-t border-[var(--border)] bg-slate-900 text-slate-400 text-xs flex justify-between items-center">
          <p>© {new Date().getFullYear()} {empresa.nom} — Sistema de Gestió Empresarial PHC Enterprise</p>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Exercício 2026 / AD
          </span>
        </footer>
      </div>

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
