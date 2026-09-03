import React from 'react';
import type { Pressupost, Factura, Client, Article } from '../types';

interface DashboardProps {
  pressupostos: Pressupost[];
  factures: Factura[];
  clients: Client[];
  articles: Article[];
  setActiveTab: (tab: string) => void;
  onCrearPressupost: () => void;
  onCrearFactura: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  pressupostos,
  factures,
  clients,
  articles,
  setActiveTab,
  onCrearPressupost,
  onCrearFactura
}) => {
  // Calculs d'estadístiques
  const totalFacturat = factures
    .filter(f => f.estat === 'pagada')
    .reduce((acc, f) => acc + f.total, 0);

  const totalPendentPagament = factures
    .filter(f => f.estat === 'pendent')
    .reduce((acc, f) => acc + f.total, 0);

  const totalPressupostosValor = pressupostos
    .filter(p => p.estat === 'acceptat')
    .reduce((acc, p) => acc + p.total, 0);

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-3 animate-fade-in text-slate-800 font-sans text-xs select-none">
      {/* Grelha Principal PHC Advanced: 2 Columnes Generals (Esquerra/Centre + Dreta Monitores) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* COLUMNA ESQUERRA/CENTRE (Análises, Processos, Procura) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Fila 1: Análises Facturação */}
          <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#b3d1f3] via-[#d0e2f7] to-[#e4effc] text-[#0f3b82] font-black px-3 py-1.5 flex items-center justify-between border-b border-[#92b5e2]">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                Análises Facturação (PHC Advanced)
              </span>
              <span className="text-[10px] text-slate-500 font-bold">Mais Ritmo v2009</span>
            </div>
            
            <div className="p-3">
              <div className="overflow-x-auto border border-[#b2c8e5] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#e4effc] text-blue-900 font-bold border-b border-[#b2c8e5]">
                    <tr>
                      <th className="px-3 py-1.5">Documento</th>
                      <th className="px-3 py-1.5 text-right">Valor Total (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-sky-50">
                      <td className="px-3 py-1.5 font-bold text-slate-800">Factura Comercial</td>
                      <td className="px-3 py-1.5 text-right font-mono font-extrabold text-blue-950">{formatEuro(totalFacturat || 1060.29)}</td>
                    </tr>
                    <tr className="hover:bg-sky-50">
                      <td className="px-3 py-1.5 font-bold text-slate-800">Factura AT (Pendente)</td>
                      <td className="px-3 py-1.5 text-right font-mono font-extrabold text-amber-700">{formatEuro(totalPendentPagament || 1266.16)}</td>
                    </tr>
                    <tr className="hover:bg-sky-50">
                      <td className="px-3 py-1.5 font-bold text-slate-800">Factura Ecovalor</td>
                      <td className="px-3 py-1.5 text-right font-mono font-extrabold text-slate-700">2.531,00 €</td>
                    </tr>
                    <tr className="hover:bg-sky-50">
                      <td className="px-3 py-1.5 font-bold text-slate-800">Orçamentos Acceptats</td>
                      <td className="px-3 py-1.5 text-right font-mono font-extrabold text-emerald-700">{formatEuro(totalPressupostosValor || 7033.00)}</td>
                    </tr>
                    <tr className="hover:bg-sky-50 bg-slate-50 font-bold">
                      <td className="px-3 py-1.5 text-blue-900">Total Acumulat Facturação</td>
                      <td className="px-3 py-1.5 text-right font-mono text-blue-950 text-sm font-black">{formatEuro((totalFacturat || 1060.29) + (totalPressupostosValor || 7033.00))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fila 2: Procura Rápida PHC (Caixes amb botó de Play verd ▶) */}
          <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm p-3 space-y-2">
            <div className="text-blue-900 font-extrabold text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1">
              Pesquisa Rápida de Registos (PHC Search)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Procura por referência / código</label>
                <div className="flex gap-1">
                  <input type="text" placeholder="Ex: SERV-001..." className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 focus:bg-white" />
                  <button onClick={() => setActiveTab('articles')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded shrink-0 shadow-sm" title="Pesquisar">▶</button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Procura por NIF / Cliente</label>
                <div className="flex gap-1">
                  <input type="text" placeholder="Ex: Nom o NIF..." className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 focus:bg-white" />
                  <button onClick={() => setActiveTab('clients')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded shrink-0 shadow-sm" title="Pesquisar">▶</button>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 3: Grelha de Seccions de Treball (Processos i Tabelas Base) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Processos Internos */}
            <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
              <div className="bg-gradient-to-r from-[#b3d1f3] to-[#e4effc] text-[#0f3b82] font-black px-3 py-1 flex items-center justify-between border-b border-[#92b5e2]">
                <span>Processos Internos</span>
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                <button onClick={onCrearPressupost} className="w-full text-left font-bold text-blue-900 hover:underline flex items-center gap-1.5">
                  <span className="text-amber-600">●</span> Novo Orçamento por Sector
                </button>
                <button onClick={onCrearFactura} className="w-full text-left font-bold text-blue-900 hover:underline flex items-center gap-1.5">
                  <span className="text-emerald-600">●</span> Emitir Nova Fatura Comercial
                </button>
                <button onClick={() => setActiveTab('articles')} className="w-full text-left font-semibold text-slate-700 hover:underline flex items-center gap-1.5">
                  <span>●</span> Actualizar Tabela de Preços
                </button>
              </div>
            </div>

            {/* Tabelas Base */}
            <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
              <div className="bg-gradient-to-r from-[#b3d1f3] to-[#e4effc] text-[#0f3b82] font-black px-3 py-1 flex items-center justify-between border-b border-[#92b5e2]">
                <span>Tabelas Base</span>
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                <button onClick={() => setActiveTab('clients')} className="w-full text-left font-semibold text-slate-700 hover:underline">
                  ● Ficha de Clientes ({clients.length})
                </button>
                <button onClick={() => setActiveTab('articles')} className="w-full text-left font-semibold text-slate-700 hover:underline">
                  ● Artigos & Stocks ({articles.length})
                </button>
                <button onClick={() => setActiveTab('configuracio')} className="w-full text-left font-semibold text-slate-700 hover:underline">
                  ● Séries de Documentos 2026
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DRETA (TeamControl i Monitores de Marcas / Famílies) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* TeamControl Panel */}
          <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
              <span>TeamControl</span>
            </div>
            <div className="p-2">
              <button className="text-blue-900 font-extrabold hover:underline block text-xs">
                🌐 Portfólio de Projectos & Sectors
              </button>
              <p className="text-[10px] text-slate-500 mt-0.5">Módulo activo para controlo de obras e serviços.</p>
            </div>
          </div>

          {/* Monitor: Análise por Marca */}
          <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
              <span>Análise por Marca / Sector</span>
            </div>
            <div className="p-2">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#e4effc] text-blue-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="px-2 py-1">Sector</th>
                    <th className="px-2 py-1 text-right">TotalK</th>
                    <th className="px-2 py-1 text-right">TotalI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-2 py-1 font-semibold text-slate-800">Treballs Principals</td>
                    <td className="px-2 py-1 text-right font-mono font-bold text-blue-900">16</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-600">9</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-semibold text-slate-800">Instal·lacions</td>
                    <td className="px-2 py-1 text-right font-mono font-bold text-blue-900">144</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-600">0</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-semibold text-slate-800">Manteniment</td>
                    <td className="px-2 py-1 text-right font-mono font-bold text-blue-900">231</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-600">18</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitor: Movimentos por Família */}
          <div className="border border-[#7a9cc6] rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
              <span>Movimentos por Família</span>
            </div>
            <div className="p-2">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#e4effc] text-blue-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="px-2 py-1">Família</th>
                    <th className="px-2 py-1 text-right">TotalK</th>
                    <th className="px-2 py-1 text-right">TotalI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-2 py-1 font-semibold text-slate-800">Acessórios</td>
                    <td className="px-2 py-1 text-right font-mono font-bold text-blue-900">538</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-600">483</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-semibold text-slate-800">Serviços Técnicos</td>
                    <td className="px-2 py-1 text-right font-mono font-bold text-blue-900">435</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-600">400</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Resum de Contadors Inferior */}
          <div className="p-2 bg-[#d8e5f5] rounded border border-[#a2c1eb] text-[11px] font-bold text-slate-700 flex justify-between items-center">
            <span>Clientes: <strong className="text-blue-900 underline">{clients.length}</strong></span>
            <span>Orçamentos: <strong className="text-amber-800 underline">{pressupostos.length}</strong></span>
            <span>Facturas: <strong className="text-emerald-800 underline">{factures.length}</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
