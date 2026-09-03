import React from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  PackageSearch,
  UserCheck,
  Building2,
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
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
              <Sparkles size={14} className="text-amber-300" /> Gestió Privada TS SERVEIS
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Tauler de Control Principal</h2>
            <p className="mt-2 text-sky-100 text-sm max-w-xl leading-relaxed">
              Crea factures, gestiona el teu catàleg d'articles amb imatges i organitza els teus pressupostos per sectors de treball.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onCrearPressupost}
              className="btn bg-white text-slate-900 hover:bg-sky-50 font-extrabold px-5 py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="text-sky-600" /> Nou Pressupost
            </button>
            <button 
              onClick={onCrearFactura}
              className="btn bg-sky-500 text-white hover:bg-sky-400 font-extrabold px-5 py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-sky-400/40"
            >
              <Plus size={20} /> Nova Factura
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 top-0 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Selector Ràpid de Mòduls / Icones Personalitzades */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <Layers size={15} className="text-sky-500" /> Selectors d'Accés Ràpid
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('pressupostos')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-400 transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={20} />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-sky-600 block flex items-center justify-between">
                Pressupostos <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-slate-500 font-medium">Per Sectors</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('factures')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-600 block flex items-center justify-between">
                Factures <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-slate-500 font-medium">I Pagaments</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageSearch size={20} />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-600 block flex items-center justify-between">
                Catàleg <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-slate-500 font-medium">Articles & Fotos</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-amber-600 block flex items-center justify-between">
                Clients <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-slate-500 font-medium">Directori Actiu</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('configuracio')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-400 transition-all text-left group flex flex-col justify-between col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
            <div className="mt-3">
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-purple-600 block flex items-center justify-between">
                Empresa <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-slate-500 font-medium">Dades & Logotip</span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card card-interactive flex items-center justify-between p-5 border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Facturat (Cobrat)</p>
            <h3 className="text-2xl font-extrabold mt-1.5 text-emerald-600">{formatEuro(totalFacturat)}</h3>
            <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={14} /> {factures.filter(f => f.estat === 'pagada').length} Factures Cobrades
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between p-5 border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Pendent de Cobrar</p>
            <h3 className="text-2xl font-extrabold mt-1.5 text-amber-600">{formatEuro(totalPendentPagament)}</h3>
            <p className="text-xs text-amber-600 font-bold mt-1.5 flex items-center gap-1">
              <Clock size={14} /> {factures.filter(f => f.estat === 'pendent').length} Factures Pendents
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
            <FileText size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between p-5 border-l-4 border-l-sky-500">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Pressupostos Acceptats</p>
            <h3 className="text-2xl font-extrabold mt-1.5 text-sky-600">{formatEuro(totalPressupostosValor)}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5">
              {pressupostosAcceptats} acceptats / {pressupostosPendents} en revisió
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shadow-sm">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between p-5 border-l-4 border-l-indigo-500">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Catàleg & Clients</p>
            <h3 className="text-2xl font-extrabold mt-1.5 text-indigo-600">{clients.length} Clients</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5">
              {articles.length} Articles i serveis registrats
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-sm">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Grid of Tables & Quick List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Darrers Pressupostos */}
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <FileSpreadsheet size={20} />
              </div>
              <h3 className="font-extrabold text-lg">Darrers Pressupostos per Sectors</h3>
            </div>
            <button 
              onClick={() => setActiveTab('pressupostos')}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-800 flex items-center gap-1 group"
            >
              Veure tots <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Núm / Data</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Estat</th>
                </tr>
              </thead>
              <tbody>
                {darrersPressupostos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[var(--text-muted)] italic">
                      No hi ha cap pressupost registrat.
                    </td>
                  </tr>
                ) : (
                  darrersPressupostos.map((p) => (
                    <tr key={p.id} className="cursor-pointer hover:bg-sky-50/50 transition-colors" onClick={() => setActiveTab('pressupostos')}>
                      <td>
                        <div className="font-bold text-sm text-slate-900">{p.numero}</div>
                        <div className="text-xs text-slate-500 font-medium">{p.data}</div>
                      </td>
                      <td className="font-semibold text-sm text-slate-700">{p.clientNom}</td>
                      <td className="font-extrabold text-sm text-sky-700">{formatEuro(p.total)}</td>
                      <td>
                        <span className={`badge ${
                          p.estat === 'acceptat' ? 'badge-success' :
                          p.estat === 'enviat' ? 'badge-info' :
                          p.estat === 'rebutjat' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {p.estat}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Darreres Factures */}
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={20} />
              </div>
              <h3 className="font-extrabold text-lg">Darreres Factures</h3>
            </div>
            <button 
              onClick={() => setActiveTab('factures')}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              Veure totes <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Factura / Data</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Pagament</th>
                </tr>
              </thead>
              <tbody>
                {darreresFactures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[var(--text-muted)] italic">
                      No hi ha cap factura registrada.
                    </td>
                  </tr>
                ) : (
                  darreresFactures.map((f: Factura) => (
                    <tr key={f.id} className="cursor-pointer hover:bg-indigo-50/50 transition-colors" onClick={() => setActiveTab('factures')}>
                      <td>
                        <div className="font-bold text-sm text-slate-900">{f.numero}</div>
                        <div className="text-xs text-slate-500 font-medium">{f.data}</div>
                      </td>
                      <td className="font-semibold text-sm text-slate-700">{f.clientNom}</td>
                      <td className="font-extrabold text-sm text-indigo-700">{formatEuro(f.total)}</td>
                      <td>
                        <span className={`badge ${
                          f.estat === 'pagada' ? 'badge-success' :
                          f.estat === 'pendent' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {f.estat}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
