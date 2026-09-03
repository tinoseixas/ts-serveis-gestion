import React from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  PackageSearch, 
  ChevronDown,
  PhoneCall,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { Empresa } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  empresa: Empresa;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="w-56 shrink-0 bg-[#dbe8f8] border-r border-[#9ab9e5] flex flex-col select-none text-xs font-sans shadow-md">
      {/* 1. Pestanyes Superiors (Pocket / Opções / Navegador) */}
      <div className="bg-[#b3d1f3] p-1 flex items-center gap-1 border-b border-[#92b5e2]">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex-1 py-1 rounded text-center font-bold text-[11px] border ${
            activeTab === 'dashboard' ? 'bg-[#316ac5] text-white border-[#1d4b94]' : 'bg-[#d0e2f7] hover:bg-white text-slate-800 border-[#9dbfe8]'
          }`}
        >
          Pocket
        </button>
        <button className="flex-1 py-1 rounded text-center text-slate-700 bg-[#d0e2f7] hover:bg-white border border-[#9dbfe8] text-[11px]">
          Opções
        </button>
      </div>

      {/* 2. Botó Pocket de Destacats */}
      <div className="p-2">
        <button 
          onClick={() => setActiveTab('pressupostos')}
          className="w-full bg-[#10489e] hover:bg-[#0b387d] text-white font-extrabold py-1.5 px-3 rounded text-center shadow border border-[#09295e] flex items-center justify-between"
        >
          <span>Pocket</span>
          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 rounded">Sectors</span>
        </button>
      </div>

      {/* 3. Caixa "Indicadores" (Marcador Blau Estil PHC Advanced) */}
      <div className="px-2 pb-2 space-y-2">
        <div className="border border-[#1b4e9b] rounded overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
            <span>Indicadores</span>
            <ChevronDown size={14} />
          </div>
          <div className="p-2 space-y-1.5 text-slate-800 text-[11px]">
            <button 
              onClick={() => setActiveTab('clients')}
              className={`w-full text-left font-semibold hover:text-[#1b4e9b] hover:underline flex items-center gap-1.5 ${
                activeTab === 'clients' ? 'text-[#1b4e9b] font-bold' : ''
              }`}
            >
              <Users size={13} className="text-[#1b4e9b]" />
              <span className="truncate">Clientes de Andorra</span>
            </button>
            <button 
              onClick={() => setActiveTab('articles')}
              className={`w-full text-left font-semibold hover:text-[#1b4e9b] hover:underline flex items-center gap-1.5 ${
                activeTab === 'articles' ? 'text-[#1b4e9b] font-bold' : ''
              }`}
            >
              <PackageSearch size={13} className="text-[#1b4e9b]" />
              <span className="truncate">Catálogo de Artigos</span>
            </button>
            <button 
              onClick={() => setActiveTab('pressupostos')}
              className={`w-full text-left font-semibold hover:text-[#1b4e9b] hover:underline flex items-center gap-1.5 ${
                activeTab === 'pressupostos' ? 'text-[#1b4e9b] font-bold' : ''
              }`}
            >
              <FileSpreadsheet size={13} className="text-amber-600" />
              <span className="truncate">Orçamentos por Sector</span>
            </button>
          </div>
        </div>

        {/* 4. Caixa "Indicadores de Assistência" */}
        <div className="border border-[#1b4e9b] rounded overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
            <span>Assistência</span>
            <ChevronDown size={14} />
          </div>
          <div className="p-2 space-y-1.5 text-slate-800 text-[11px]">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1"><PhoneCall size={12} className="text-blue-600" /> Chamadas:</span>
              <span className="font-extrabold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">23</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1"><Clock size={12} className="text-emerald-600" /> Assistência:</span>
              <span className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">130h</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1"><AlertCircle size={12} className="text-amber-600" /> Pats Urgentes:</span>
              <span className="font-extrabold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">5</span>
            </div>
          </div>
        </div>

        {/* 5. Caixa "Monitores PHC" */}
        <div className="border border-[#1b4e9b] rounded overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1b4e9b] to-[#2a68c4] text-white font-extrabold px-3 py-1 flex items-center justify-between">
            <span>Monitores</span>
            <ChevronDown size={14} />
          </div>
          <div className="p-2 space-y-1.5 text-slate-800 text-[11px]">
            <button 
              onClick={() => setActiveTab('clients')}
              className="w-full flex items-center justify-between text-slate-800 hover:text-blue-700 font-semibold"
            >
              <span>Clientes Ficha:</span>
              <span className="font-extrabold text-blue-900 underline">10</span>
            </button>
            <button 
              onClick={() => setActiveTab('pressupostos')}
              className="w-full flex items-center justify-between text-slate-800 hover:text-blue-700 font-semibold"
            >
              <span>Orçamentos:</span>
              <span className="font-extrabold text-amber-700 underline">8</span>
            </button>
            <button 
              onClick={() => setActiveTab('factures')}
              className="w-full flex items-center justify-between text-slate-800 hover:text-blue-700 font-semibold"
            >
              <span>Facturas:</span>
              <span className="font-extrabold text-emerald-700 underline">12</span>
            </button>
          </div>
        </div>
      </div>

      {/* Peu del Painel Navegador */}
      <div className="mt-auto p-2 bg-[#b3d1f3] border-t border-[#92b5e2] text-center text-[10px] text-slate-700 font-bold">
        PHC Advanced Desktop v2009
      </div>
    </aside>
  );
};
