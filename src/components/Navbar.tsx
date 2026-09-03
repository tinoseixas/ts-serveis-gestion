import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  Search, 
  Building2
} from 'lucide-react';
import type { Empresa } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  empresa: Empresa;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  empresa
}) => {
  const [cercaRapida, setCercaRapida] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Painel de Controlo', icon: LayoutDashboard },
    { id: 'pressupostos', label: 'Orçamentos (Sectors)', icon: FileSpreadsheet },
    { id: 'factures', label: 'Faturação & Cobranças', icon: FileText },
    { id: 'articles', label: 'Artigos & Catálogo', icon: Package },
    { id: 'clients', label: 'Ficha de Clientes', icon: Users },
    { id: 'configuracio', label: 'Configuração Empresa', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Barra de Comando Superior PHC */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Marca / Logotip de l'Empresa */}
        <div className="flex items-center gap-3 shrink-0">
          {empresa.logoUrl ? (
            <img src={empresa.logoUrl} alt={empresa.nom} className="h-9 object-contain rounded bg-white/10 p-1" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              PHC
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              {empresa.nom}
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
                SISTEMA PHC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Plataforma Integrada de Gestão Empresarial</p>
          </div>
        </div>

        {/* Cerca Ràpida de Gestió */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              value={cercaRapida}
              onChange={e => setCercaRapida(e.target.value)}
              placeholder="Pesquisa rápida no sistema (faturas, orçamentos, clientes)..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Accions i Canvi de Tema */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Building2 size={14} className="text-amber-400" />
            <span className="font-semibold">{empresa.nif ? `NIF: ${empresa.nif}` : 'Andorra'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Sub-barra de Navegació per Mòduls en estil PHC Enterprise */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
