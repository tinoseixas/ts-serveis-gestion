import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  ShieldCheck 
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
  const navItems = [
    { id: 'dashboard', label: 'Tauler de Control', icon: LayoutDashboard },
    { id: 'pressupostos', label: 'Pressupostos', icon: FileSpreadsheet },
    { id: 'factures', label: 'Factures', icon: FileText },
    { id: 'articles', label: 'Articles & Imatges', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'configuracio', label: 'Configuració', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[var(--border)] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {empresa.logoUrl ? (
            <img src={empresa.logoUrl} alt={empresa.nom} className="h-10 object-contain rounded-md" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              TS
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none text-[var(--text-main)] flex items-center gap-2">
              {empresa.nom}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck size={12} /> Privat
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Gestió Factures & Pressupostos per Sectors</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[var(--bg-app)] p-1.5 rounded-xl border border-[var(--border)] overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-md font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Theme toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-icon rounded-xl"
            title={theme === 'dark' ? 'Canviar a tema clar' : 'Canviar a tema fosc'}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
