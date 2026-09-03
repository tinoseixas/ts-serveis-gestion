import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Package, 
  FileSpreadsheet, 
  Settings, 
  Printer, 
  Search, 
  RefreshCw, 
  Folder, 
  BarChart2, 
  ChevronDown
} from 'lucide-react';
import type { Empresa } from '../types';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  empresa: Empresa;
  onOpenLookup?: (type: 'articles' | 'clients') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  setActiveTab,
  empresa
}) => {
  const [gestaoMenuOpen, setGestaoMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Tancar menús al fer clic a fora
  useEffect(() => {
    const handleClickOutside = () => {
      setGestaoMenuOpen(false);
      setActiveMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col shrink-0 select-none font-sans text-xs border-b border-slate-400 bg-slate-100 shadow-sm">
      {/* 1. Barra de Títol de Finestra Estil Windows / PHC Desktop */}
      <div className="h-7 bg-gradient-to-r from-slate-800 via-blue-900 to-slate-900 text-white px-3 flex items-center justify-between border-b border-slate-700 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-[9px] font-black text-white">
            P
          </div>
          <span>Mais Ritmo — PHC Advanced 2009 ({empresa.nom})</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-5 h-4 bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center rounded-sm text-[10px]" title="Minimizar">_</button>
          <button className="w-5 h-4 bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center rounded-sm text-[10px]" title="Maximizar">□</button>
          <button className="w-5 h-4 bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center rounded-sm text-[10px] font-bold" title="Fechar">✕</button>
        </div>
      </div>

      {/* 2. Barra de Menús Principal Clàssica de PHC Advanced */}
      <div className="relative bg-[#ece9d8] text-slate-900 border-b border-[#aca899] px-2 flex items-center gap-0.5 text-xs font-semibold py-0.5 shadow-inner">
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'sistema' ? null : 'sistema'); }}
          className={`px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white ${activeMenu === 'sistema' ? 'bg-[#316ac5] text-white' : ''}`}
        >
          Sistema
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'editar' ? null : 'editar'); }}
          className={`px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white ${activeMenu === 'editar' ? 'bg-[#316ac5] text-white' : ''}`}
        >
          Editar
        </button>

        {/* Menú Desplegable "Gestão" autèntic PHC */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setGestaoMenuOpen(!gestaoMenuOpen); }}
            className={`px-2.5 py-0.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-1 font-bold ${
              gestaoMenuOpen || ['pressupostos', 'factures', 'articles', 'clients'].includes(activeTab) 
                ? 'bg-[#316ac5] text-white' 
                : 'text-blue-900 font-extrabold'
            }`}
          >
            Gestão <ChevronDown size={11} />
          </button>

          {gestaoMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-0.5 w-64 bg-[#f6f6f6] border border-[#716f64] shadow-xl z-50 py-1 text-xs text-slate-800 animate-fade-in"
            >
              <button 
                onClick={() => { setActiveTab('dashboard'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold"
              >
                <span>Painel Principal</span>
                <span className="text-[10px] text-slate-400">Ctrl+D</span>
              </button>
              <button 
                onClick={() => { setActiveTab('clients'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold border-t border-slate-200"
              >
                <span>Gestão de Clientes</span>
                <Users size={13} />
              </button>
              <button 
                onClick={() => { setActiveTab('factures'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold"
              >
                <span>Facturação a Clientes</span>
                <FileText size={13} />
              </button>
              <button 
                onClick={() => { setActiveTab('pressupostos'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold bg-amber-50 text-blue-900"
              >
                <span>Orçamentos por Sectores</span>
                <FileSpreadsheet size={13} className="text-amber-600" />
              </button>
              <button 
                onClick={() => { setActiveTab('articles'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold border-t border-slate-200"
              >
                <span>Gestão de Stocks / Tabelas de Preços</span>
                <Package size={13} />
              </button>
              <button 
                onClick={() => { setActiveTab('configuracio'); setGestaoMenuOpen(false); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#316ac5] hover:text-white flex items-center justify-between font-semibold border-t border-slate-200"
              >
                <span>Configurações Globais da Empresa</span>
                <Settings size={13} />
              </button>
            </div>
          )}
        </div>

        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">Supervisor</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">ControlDoc</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">TeamControl</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">Tabelas</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">Análises</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">Janelas</button>
        <button className="px-2 py-0.5 rounded hover:bg-[#316ac5] hover:text-white">Ajuda</button>

        {/* Marca d'Aigua Watermark `phcadvanced®` a la dreta tal com a la captura */}
        <div className="ml-auto flex items-center pr-3">
          <span className="text-lg font-black tracking-tight italic bg-gradient-to-r from-blue-700 via-sky-600 to-sky-400 bg-clip-text text-transparent opacity-90 drop-shadow-sm font-sans">
            phc<span className="font-light">advanced</span><sup className="text-[9px] text-sky-600 not-italic">®</sup>
          </span>
        </div>
      </div>

      {/* 3. Barra d'Ícones de Comanda i Dreceres Rapides PHC */}
      <div className="bg-[#f0ede0] border-b border-[#c8c4b7] px-3 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-inner">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`p-1.5 rounded border ${activeTab === 'dashboard' ? 'bg-amber-400 border-amber-600 text-slate-950 font-bold' : 'bg-[#e0dcd0] hover:bg-white border-[#b0ac9e] text-slate-700'}`}
            title="Painel Principal (Dashboard)"
          >
            <BarChart2 size={15} />
          </button>
          <button 
            onClick={() => setActiveTab('clients')} 
            className={`p-1.5 rounded border ${activeTab === 'clients' ? 'bg-amber-400 border-amber-600 text-slate-950 font-bold' : 'bg-[#e0dcd0] hover:bg-white border-[#b0ac9e] text-slate-700'}`}
            title="Ficha de Clientes"
          >
            <Users size={15} />
          </button>
          <button 
            onClick={() => setActiveTab('pressupostos')} 
            className={`p-1.5 rounded border ${activeTab === 'pressupostos' ? 'bg-amber-400 border-amber-600 text-slate-950 font-bold' : 'bg-[#e0dcd0] hover:bg-white border-[#b0ac9e] text-slate-700'}`}
            title="Orçamentos por Sectores"
          >
            <FileSpreadsheet size={15} />
          </button>
          <button 
            onClick={() => setActiveTab('factures')} 
            className={`p-1.5 rounded border ${activeTab === 'factures' ? 'bg-amber-400 border-amber-600 text-slate-950 font-bold' : 'bg-[#e0dcd0] hover:bg-white border-[#b0ac9e] text-slate-700'}`}
            title="Facturação a Clientes"
          >
            <FileText size={15} />
          </button>
          <button 
            onClick={() => setActiveTab('articles')} 
            className={`p-1.5 rounded border ${activeTab === 'articles' ? 'bg-amber-400 border-amber-600 text-slate-950 font-bold' : 'bg-[#e0dcd0] hover:bg-white border-[#b0ac9e] text-slate-700'}`}
            title="Tabelas de Preços / Stocks"
          >
            <Package size={15} />
          </button>

          <div className="h-5 w-px bg-[#c0bcaf] mx-1"></div>

          <button className="p-1.5 bg-[#e0dcd0] hover:bg-white border border-[#b0ac9e] rounded text-slate-700" title="Imprimir Relatório">
            <Printer size={15} />
          </button>
          <button className="p-1.5 bg-[#e0dcd0] hover:bg-white border border-[#b0ac9e] rounded text-slate-700" title="Dossiers Internos">
            <Folder size={15} />
          </button>
          <button className="p-1.5 bg-[#e0dcd0] hover:bg-white border border-[#b0ac9e] rounded text-slate-700" title="Recarregar Dados">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Selector de Exercício e Série Activa */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-bold text-blue-900 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
            Exercício 2026 / Série Principal
          </span>
          <div className="flex items-center gap-1 bg-white border border-[#b0ac9e] px-2 py-0.5 rounded">
            <Search size={13} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisa PHC..." 
              className="w-28 text-xs bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
