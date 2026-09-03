import React from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock 
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Benvingut a la teva Gestió Privada</h2>
            <p className="mt-1 text-sky-100 text-sm max-w-xl">
              Crea factures, administra el catàleg d'articles amb fotogaleria i organitza els teus pressupostos per sectors de treball.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onCrearPressupost}
              className="btn bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg"
            >
              <Plus size={18} className="text-sky-600" /> Nou Pressupost
            </button>
            <button 
              onClick={onCrearFactura}
              className="btn bg-sky-500 text-white hover:bg-sky-400 font-bold shadow-lg"
            >
              <Plus size={18} /> Nova Factura
            </button>
          </div>
        </div>
        {/* Subtle background blur decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card card-interactive flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Facturat (Cobrat)</p>
            <h3 className="text-2xl font-extrabold mt-1 text-emerald-400">{formatEuro(totalFacturat)}</h3>
            <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 size={13} /> {factures.filter(f => f.estat === 'pagada').length} Factures Cobrades
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pendent de Cobrar</p>
            <h3 className="text-2xl font-extrabold mt-1 text-amber-400">{formatEuro(totalPendentPagament)}</h3>
            <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
              <Clock size={13} /> {factures.filter(f => f.estat === 'pendent').length} Factures Pendents
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pressupostos Acceptats</p>
            <h3 className="text-2xl font-extrabold mt-1 text-sky-400">{formatEuro(totalPressupostosValor)}</h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
              {pressupostosAcceptats} acceptats / {pressupostosPendents} en revisió
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="card card-interactive flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Catàleg & Clients</p>
            <h3 className="text-2xl font-extrabold mt-1 text-indigo-400">{clients.length} Clients</h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
              {articles.length} Articles i serveis registrats
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Grid of Tables & Quick List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Darrers Pressupostos */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-sky-400" />
              <h3 className="font-bold text-lg">Darrers Pressupostos per Sectors</h3>
            </div>
            <button 
              onClick={() => setActiveTab('pressupostos')}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              Veure tots →
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
                    <td colSpan={4} className="text-center py-6 text-[var(--text-muted)]">
                      No hi ha cap pressupost registrat.
                    </td>
                  </tr>
                ) : (
                  darrersPressupostos.map((p) => (
                    <tr key={p.id} className="cursor-pointer" onClick={() => setActiveTab('pressupostos')}>
                      <td>
                        <div className="font-semibold text-sm">{p.numero}</div>
                        <div className="text-xs text-[var(--text-muted)]">{p.data}</div>
                      </td>
                      <td className="font-medium text-sm">{p.clientNom}</td>
                      <td className="font-bold text-sm">{formatEuro(p.total)}</td>
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
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" />
              <h3 className="font-bold text-lg">Darreres Factures</h3>
            </div>
            <button 
              onClick={() => setActiveTab('factures')}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              Veure totes →
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
                    <td colSpan={4} className="text-center py-6 text-[var(--text-muted)]">
                      No hi ha cap factura registrada.
                    </td>
                  </tr>
                ) : (
                  darreresFactures.map((f: Factura) => (
                    <tr key={f.id} className="cursor-pointer" onClick={() => setActiveTab('factures')}>
                      <td>
                        <div className="font-semibold text-sm">{f.numero}</div>
                        <div className="text-xs text-[var(--text-muted)]">{f.data}</div>
                      </td>
                      <td className="font-medium text-sm">{f.clientNom}</td>
                      <td className="font-bold text-sm">{formatEuro(f.total)}</td>
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
