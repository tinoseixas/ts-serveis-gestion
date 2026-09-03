import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Receipt, 
  PackageSearch, 
  Users, 
  Building2, 
  LayoutDashboard,
  Briefcase,
  Boxes,
  Landmark,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import type { Empresa } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  empresa: Empresa;
}

interface ModuleGroup {
  id: string;
  label: string;
  icon: any;
  items: { id: string; label: string; icon: any; badge?: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  empresa
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>('comercial');

  const modules: ModuleGroup[] = [
    {
      id: 'comercial',
      label: 'Comercial',
      icon: Briefcase,
      items: [
        { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard },
        { id: 'pressupostos', label: 'Orçamentos (Sectors)', icon: FileSpreadsheet, badge: 'Sectors' },
        { id: 'factures', label: 'Faturação & Vendas', icon: Receipt, badge: 'NC' },
      ]
    },
    {
      id: 'stocks',
      label: 'Stocks & Serviços',
      icon: Boxes,
      items: [
        { id: 'articles', label: 'Artigos & Catálogo', icon: PackageSearch },
      ]
    },
    {
      id: 'tesouraria',
      label: 'Tesouraria & Clientes',
      icon: Landmark,
      items: [
        { id: 'clients', label: 'Ficha de Clientes', icon: Users },
      ]
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: SlidersHorizontal,
      items: [
        { id: 'configuracio', label: 'Empresa & Séries', icon: Building2 },
      ]
    }
  ];

  const toggleGroup = (id: string) => {
    if (collapsed) setCollapsed(false);
    setOpenGroup(prev => prev === id ? null : id);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-950 border-r border-slate-800 text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header Logo Sidebar */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {empresa.logoUrl ? (
              <img src={empresa.logoUrl} alt={empresa.nom} className="h-7 object-contain bg-white/10 p-0.5 rounded" />
            ) : (
              <div className="w-7 h-7 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                PHC
              </div>
            )}
            <div className="truncate">
              <span className="font-extrabold text-xs text-white block truncate">{empresa.nom}</span>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">ENTERPRISE</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs mx-auto">
            PHC
          </div>
        )}

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          title={collapsed ? 'Expandir Menu' : 'Colapsar Menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Lista de Mòduls Empresarials */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
        {modules.map(mod => {
          const ModIcon = mod.icon;
          const isOpen = openGroup === mod.id || mod.items.some(i => i.id === activeTab);

          return (
            <div key={mod.id} className="space-y-1">
              {/* Module Header Button */}
              <button
                onClick={() => toggleGroup(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                  isOpen ? 'text-amber-400 bg-slate-900/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={mod.label}
              >
                <div className="flex items-center gap-2.5">
                  <ModIcon size={16} className="shrink-0 text-amber-400" />
                  {!collapsed && <span>{mod.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-500'}`} />
                )}
              </button>

              {/* Items per Mòdul */}
              {(isOpen || collapsed) && (
                <div className={`space-y-0.5 ${!collapsed ? 'pl-3 border-l border-slate-800/80 ml-3.5 my-1' : ''}`}>
                  {mod.items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-150 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        } ${collapsed ? 'justify-center px-0 py-2' : ''}`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon size={15} className="shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!collapsed && item.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Utilizador i Badge de Versió */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0 text-xs">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400/40 text-amber-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
              ADM
            </div>
            <div className="truncate">
              <span className="font-extrabold text-white block text-[11px] truncate">Utilizador Administrador</span>
              <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> PHC CS Online
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400/40 text-amber-400 font-extrabold flex items-center justify-center mx-auto text-xs">
            A
          </div>
        )}
      </div>
    </aside>
  );
};
