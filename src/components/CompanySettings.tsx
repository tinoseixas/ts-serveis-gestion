import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, Building, CreditCard, Shield, Image as ImageIcon } from 'lucide-react';
import type { Empresa } from '../types';
import { storageService } from '../services/storageService';

interface CompanySettingsProps {
  empresa: Empresa;
  onSaveEmpresa: (empresa: Empresa) => void;
  onReloadAllData: () => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  empresa,
  onSaveEmpresa,
  onReloadAllData
}) => {
  const [formData, setFormData] = useState<Empresa>({ ...empresa });
  const [missatgeOk, setMissatgeOk] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El logo és massa gran. Màxim 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEmpresa(formData);
    setMissatgeOk('Dades de l\'empresa desades correctament!');
    setTimeout(() => setMissatgeOk(''), 4000);
  };

  const exportarJSON = () => {
    const json = storageService.exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copia_seguretat_ts_gestio_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const exit = storageService.importDataJSON(content);
        if (exit) {
          alert('Còpia de seguretat importada amb èxit!');
          onReloadAllData();
        } else {
          alert('Error: El fitxer JSON no és vàlid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const restablirInici = () => {
    if (confirm('ATENCIÓ: Això esborrarà les dades locals i restaurarà la demostració inicial. Vols continuar?')) {
      storageService.resetData();
      onReloadAllData();
      alert('Dades restablertes a l\'estat inicial.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Title */}
      <div>
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Settings className="text-sky-400" /> Configuració de l'Empresa i Dades Privades
        </h2>
        <p className="text-sm text-[var(--text-muted)]">Personalitza la capçalera de les teves factures, dades fiscals, bancàries i còpies de seguretat.</p>
      </div>

      {missatgeOk && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2">
          ✓ {missatgeOk}
        </div>
      )}

      {/* Form Dades d'Empresa */}
      <form onSubmit={guardarEmpresa} className="card space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Building size={20} className="text-sky-400" /> Fitxa Fiscal de la Teva Empresa
        </h3>

        {/* Logo upload */}
        <div>
          <label>Logo de l'Empresa (Apareixerà a les Factures i Pressupostos)</label>
          <div className="flex items-center gap-4">
            <div className="w-40 h-16 rounded-xl border border-[var(--border)] bg-slate-900 flex items-center justify-center p-2 overflow-hidden">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-500">Sense Logo</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-input" />
              <label htmlFor="logo-input" className="btn btn-secondary btn-sm cursor-pointer">
                <ImageIcon size={16} /> Canviar Logo
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Nom de l'Empresa / Autònom *</label>
            <input 
              type="text" 
              required 
              value={formData.nom} 
              onChange={e => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>
          <div>
            <label>CIF / NIF *</label>
            <input 
              type="text" 
              required 
              value={formData.nif} 
              onChange={e => setFormData({ ...formData, nif: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label>Adreça Fiscal</label>
          <input 
            type="text" 
            value={formData.adreca} 
            onChange={e => setFormData({ ...formData, adreca: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label>Població</label>
            <input 
              type="text" 
              value={formData.poblacio} 
              onChange={e => setFormData({ ...formData, poblacio: e.target.value })}
            />
          </div>
          <div>
            <label>Codi Postal</label>
            <input 
              type="text" 
              value={formData.codiPostal} 
              onChange={e => setFormData({ ...formData, codiPostal: e.target.value })}
            />
          </div>
          <div>
            <label>Província</label>
            <input 
              type="text" 
              value={formData.provincia} 
              onChange={e => setFormData({ ...formData, provincia: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label>Telèfon</label>
            <input 
              type="text" 
              value={formData.telefon} 
              onChange={e => setFormData({ ...formData, telefon: e.target.value })}
            />
          </div>
          <div>
            <label>Correu Electrònic</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label>Lloc Web</label>
            <input 
              type="text" 
              value={formData.web || ''} 
              onChange={e => setFormData({ ...formData, web: e.target.value })}
            />
          </div>
        </div>

        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--border)] pt-4 pb-3">
          <CreditCard size={20} className="text-indigo-400" /> Dades Bancàries per als Pagaments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Entitat Bancària</label>
            <input 
              type="text" 
              value={formData.banc} 
              onChange={e => setFormData({ ...formData, banc: e.target.value })}
            />
          </div>
          <div>
            <label>Compte IBAN (Ex: ES66 2100...)</label>
            <input 
              type="text" 
              value={formData.iban} 
              onChange={e => setFormData({ ...formData, iban: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label>Text Legal / Peu de Pàgina de les Factures</label>
          <textarea 
            rows={3} 
            value={formData.peuPagina || ''} 
            onChange={e => setFormData({ ...formData, peuPagina: e.target.value })}
            placeholder="Informació del Registre Mercantil, RGPD, condicions legals..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Desa la Configuració
          </button>
        </div>
      </form>

      {/* Còpies de seguretat */}
      <div className="card space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Shield size={20} className="text-emerald-400" /> Copia de Seguretat i Privacitat 100% Local
        </h3>

        <p className="text-xs text-[var(--text-muted)]">
          Totes les teves dades s'emmagatzemen de manera 100% privada al teu propi navegador. Per evitar pèrdues, pots exportar una còpia en JSON en qualsevol moment.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button onClick={exportarJSON} className="btn btn-secondary">
            <Download size={18} className="text-emerald-400" /> Exportar Còpia (.json)
          </button>

          <div>
            <input type="file" accept=".json" onChange={importarJSON} className="hidden" id="import-json" />
            <label htmlFor="import-json" className="btn btn-secondary cursor-pointer">
              <Upload size={18} className="text-sky-400" /> Importar Còpia (.json)
            </label>
          </div>

          <button onClick={restablirInici} className="btn btn-danger btn-sm ml-auto">
            <RefreshCw size={16} /> Restablir Dades de Demostració
          </button>
        </div>
      </div>
    </div>
  );
};
