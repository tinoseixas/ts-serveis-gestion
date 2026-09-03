import React from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  PackageSearch,
  UserCheck,
  Receipt,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
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

  const pressupostosAcceptats = pressupostos.filter(p => p.estat === 'acceptat').length;
  const pressupostosPendents = pressupostos.filter(p => p.estat === 'enviat' || p.estat === 'esborrany').length;

  const totalPressupostosValor = pressupostos
    .filter(p => p.estat === 'acceptat')
    .reduce((acc, p) => acc + p.total, 0);

  const darreresFactures = [...factures].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);
  const darrersPressupostos = [...pressupostos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Header Banner PHC Enterprise */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/20 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 border border-amber-400/30">
              <Sparkles size={14} className="text-amber-400" /> PAINEL DE GESTÃO PHC ENTERPRISE
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Resumo de Gestão e Controlo Operacional</h2>
            <p className="mt-1.5 text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Consulte indicadores em tempo real, acompanhe a faturação cobrada, gira os orçamentos agrupados por sectores e aceda rapidamente às operações comerciais.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onCrearPressupost}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-lg shadow-lg transition-all text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <Plus size={16} /> + Novo Orçamento
            </button>
            <button 
              onClick={onCrearFactura}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-5 py-2.5 rounded-lg shadow-md border border-slate-700 text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <Plus size={16} /> + Emitir Fatura
            </button>
          </div>
        </div>
      </div>

      {/* 5 Indicadors Clau de Gestió (KPI Ribbon PHC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Faturação Total Cobrada */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Faturação Cobrada</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{formatEuro(totalFacturat)}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={13} /> {factures.filter(f => f.estat === 'pagada').length} Faturas liquidadas
            </span>
          </div>
        </div>

        {/* KPI 2: Faturas Pendentes de Cobrança */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Pendentes de Cobrança</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{formatEuro(totalPendentPagament)}</span>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
              <Clock size={13} /> {factures.filter(f => f.estat === 'pendent').length} Faturas a cobrar
            </span>
          </div>
        </div>

        {/* KPI 3: Valor em Orçamentos */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Orçamentos Ativos</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{formatEuro(totalPressupostosValor)}</span>
            <span className="text-[11px] font-bold text-sky-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={13} /> {pressupostosAcceptats} Aprovados ({pressupostosPendents} Pendentes)
            </span>
          </div>
        </div>

        {/* KPI 4: Total de Clientes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Ficha de Clientes</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Users size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{clients.length} Clientes</span>
            <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-0.5">
              <UserCheck size={13} /> Registados na base
            </span>
          </div>
        </div>

        {/* KPI 5: Catálogo de Artigos */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Catálogo de Artigos</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <PackageSearch size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{articles.length} Artigos</span>
            <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-0.5">
              <PackageSearch size={13} /> Com fotos e preços
            </span>
          </div>
        </div>
      </div>

      {/* Selectors d'Accés i Mòduls Rápidos PHC */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Layers size={16} className="text-amber-500" /> OPERAÇÕES E MÓDULOS DE GESTÃO
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('pressupostos')}
            className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <FileSpreadsheet size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 block">Gestão de Orçamentos</span>
              <span className="text-xs text-slate-500 font-medium">Agrupados por Sectors</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('factures')}
            className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Receipt size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 block">Emissão de Faturas</span>
              <span className="text-xs text-slate-500 font-medium">Cobranças & Vencimentos</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <PackageSearch size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 block">Catálogo de Produtos</span>
              <span className="text-xs text-slate-500 font-medium">Preços e Fotografias</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 block">Ficha de Clientes</span>
              <span className="text-xs text-slate-500 font-medium">Contactos e NIF/CIF</span>
            </div>
          </button>
        </div>
      </div>

      {/* Resum d'Activitat Operacional a 2 Colunes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panell 1: Darrers Orçamentos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-sky-600" /> Últimos Orçamentos Emitidos
            </h4>
            <button onClick={() => setActiveTab('pressupostos')} className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              Ver Todos <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {darrersPressupostos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum orçamento registado.</p>
            ) : (
              darrersPressupostos.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{p.numero}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        p.estat === 'acceptat' ? 'bg-emerald-100 text-emerald-800' :
                        p.estat === 'enviat' ? 'bg-sky-100 text-sky-800' :
                        p.estat === 'rebutjat' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.estat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold">{p.clientNom}</p>
                    <span className="text-[10px] text-slate-400">{p.data}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 block">{formatEuro(p.total)}</span>
                    <span className="text-[10px] font-bold text-sky-600">{p.sectors?.length || 0} Sectors</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panell 2: Darreres Faturas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt size={18} className="text-indigo-600" /> Últimas Faturas Registadas
            </h4>
            <button onClick={() => setActiveTab('factures')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Ver Todas <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {darreresFactures.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Nenhuma fatura emitida.</p>
            ) : (
              darreresFactures.map(f => (
                <div key={f.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{f.numero}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        f.estat === 'pagada' ? 'bg-emerald-100 text-emerald-800' :
                        f.estat === 'pendent' ? 'bg-amber-100 text-amber-800' :
                        f.estat === 'vencuda' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {f.estat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold">{f.clientNom}</p>
                    <span className="text-[10px] text-slate-400">{f.data}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 block">{formatEuro(f.total)}</span>
                    <span className="text-[10px] font-bold text-indigo-600">{f.linies?.length || 0} Linhas</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
