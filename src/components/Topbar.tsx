import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Warehouse, 
  Sun, 
  Moon, 
  SlidersHorizontal,
  Command
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
  theme,
  toggleTheme,
}) => {
  const [cercaGlobal, setCercaGlobal] = useState('');
  const [serieActiva, setSerieActiva] = useState('Série 2026 - Principal');
  const [armazemActiu, setArmazemActiu] = useState('Armazém AD - Andorra');
  const exerciciFiscal = '2026';

  // Atalho de teclat Ctrl+K per a la barra de cerca global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('phc-global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabTitles: Record<string, string> = {
    dashboard: 'Painel Principal de Gestão e Indicadores',
    pressupostos: 'Orçamentos por Sectors de Trabalho',
    factures: 'Faturação Comercial & Documentos de Venda',
    articles: 'Gestão de Stocks e Catálogo de Artigos',
    clients: 'Ficha e Directório de Clientes',
    configuracio: 'Configurações Globais da Empresa e Séries'
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-white px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 shadow-md">
      {/* Títol Actiu i Seletores Fiscals */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
            {tabTitles[activeTab] || 'PHC Enterprise'}
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
              PHC CS
            </span>
          </h2>
        </div>

        {/* Selector de Sèrie / Armagatzem i Exercici (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300 font-semibold">
            <SlidersHorizontal size={13} className="text-amber-400" />
            <select 
              value={serieActiva}
              onChange={e => setSerieActiva(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
            >
              <option value="Série 2026 - Principal" className="bg-slate-900 text-white">Série 2026 - Principal</option>
              <option value="Série B - Rectificatives" className="bg-slate-900 text-white">Série B - NC Rectificatives</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300 font-semibold">
            <Warehouse size={13} className="text-sky-400" />
            <select 
              value={armazemActiu}
              onChange={e => setArmazemActiu(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
            >
              <option value="Armazém AD - Andorra" className="bg-slate-900 text-white">Armazém AD - Andorra</option>
              <option value="Armazém Central" className="bg-slate-900 text-white">Armazém Central</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded text-amber-300 font-black text-xs">
            <Calendar size={13} />
            <span>Exercício: {exerciciFiscal}</span>
          </div>
        </div>
      </div>

      {/* Input de Pesquisa Global (Atalho Universal) */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            id="phc-global-search-input"
            type="text" 
            value={cercaGlobal}
            onChange={e => setCercaGlobal(e.target.value)}
            placeholder="Pesquisa global universal (Ctrl+K)..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
          />
          <div className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      {/* Opció i Accions de Tema */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
