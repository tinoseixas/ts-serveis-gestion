import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowRightLeft, 
  FolderPlus, 
  X, 
  Layers 
} from 'lucide-react';
import type { Pressupost, Client, Article, Sector, LiniaItem, EstatPressupost, Empresa } from '../types';
import { PdfPreviewModal } from './PdfPreviewModal';

interface QuoteManagerProps {
  pressupostos: Pressupost[];
  clients: Client[];
  articles: Article[];
  empresa: Empresa;
  onSavePressupost: (pressupost: Pressupost) => void;
  onDeletePressupost: (id: string) => void;
  onConvertToFactura: (pressupost: Pressupost) => void;
}

const SECTOR_THEMES = [
  {
    border: 'border-sky-500',
    bg: 'bg-sky-50/60',
    headerBg: 'bg-sky-100/90 border-sky-300',
    tagBg: 'bg-sky-600 text-white',
    titleText: 'text-sky-900 font-black',
    subtotalBg: 'bg-sky-100 border-sky-300 text-sky-900',
    qtyBg: 'bg-sky-100/80 border-sky-400 text-sky-950',
    hoverBorder: 'hover:border-sky-400'
  },
  {
    border: 'border-indigo-500',
    bg: 'bg-indigo-50/60',
    headerBg: 'bg-indigo-100/90 border-indigo-300',
    tagBg: 'bg-indigo-600 text-white',
    titleText: 'text-indigo-900 font-black',
    subtotalBg: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    qtyBg: 'bg-indigo-100/80 border-indigo-400 text-indigo-950',
    hoverBorder: 'hover:border-indigo-400'
  },
  {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50/60',
    headerBg: 'bg-emerald-100/90 border-emerald-300',
    tagBg: 'bg-emerald-600 text-white',
    titleText: 'text-emerald-900 font-black',
    subtotalBg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    qtyBg: 'bg-emerald-100/80 border-emerald-400 text-emerald-950',
    hoverBorder: 'hover:border-emerald-400'
  },
  {
    border: 'border-amber-500',
    bg: 'bg-amber-50/60',
    headerBg: 'bg-amber-100/90 border-amber-300',
    tagBg: 'bg-amber-600 text-white',
    titleText: 'text-amber-900 font-black',
    subtotalBg: 'bg-amber-100 border-amber-300 text-amber-900',
    qtyBg: 'bg-amber-100/80 border-amber-400 text-amber-950',
    hoverBorder: 'hover:border-amber-400'
  },
  {
    border: 'border-purple-500',
    bg: 'bg-purple-50/60',
    headerBg: 'bg-purple-100/90 border-purple-300',
    tagBg: 'bg-purple-600 text-white',
    titleText: 'text-purple-900 font-black',
    subtotalBg: 'bg-purple-100 border-purple-300 text-purple-900',
    qtyBg: 'bg-purple-100/80 border-purple-400 text-purple-950',
    hoverBorder: 'hover:border-purple-400'
  },
  {
    border: 'border-rose-500',
    bg: 'bg-rose-50/60',
    headerBg: 'bg-rose-100/90 border-rose-300',
    tagBg: 'bg-rose-600 text-white',
    titleText: 'text-rose-900 font-black',
    subtotalBg: 'bg-rose-100 border-rose-300 text-rose-900',
    qtyBg: 'bg-rose-100/80 border-rose-400 text-rose-950',
    hoverBorder: 'hover:border-rose-400'
  },
  {
    border: 'border-teal-500',
    bg: 'bg-teal-50/60',
    headerBg: 'bg-teal-100/90 border-teal-300',
    tagBg: 'bg-teal-600 text-white',
    titleText: 'text-teal-900 font-black',
    subtotalBg: 'bg-teal-100 border-teal-300 text-teal-900',
    qtyBg: 'bg-teal-100/80 border-teal-400 text-teal-950',
    hoverBorder: 'hover:border-teal-400'
  }
];

export const QuoteManager: React.FC<QuoteManagerProps> = ({
  pressupostos,
  clients,
  articles,
  empresa,
  onSavePressupost,
  onDeletePressupost,
  onConvertToFactura
}) => {
  const [cerca, setCerca] = useState('');
  const [estatFiltre, setEstatFiltre] = useState<string>('tots');
  const [modalObert, setModalObert] = useState(false);
  const [pdfModalDoc, setPdfModalDoc] = useState<Pressupost | null>(null);

  // Pressupost en edició
  const [pressupostActual, setPressupostActual] = useState<Partial<Pressupost>>({});

  const pressupostosFiltrats = pressupostos.filter(p => {
    const coincideixCerca = 
      p.numero.toLowerCase().includes(cerca.toLowerCase()) ||
      p.clientNom.toLowerCase().includes(cerca.toLowerCase());
    const coincideixEstat = estatFiltre === 'tots' || p.estat === estatFiltre;
    return coincideixCerca && coincideixEstat;
  });

  const obrirModalCrear = () => {
    const dataAvui = new Date().toISOString().split('T')[0];
    const dataValidesa = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nouNum = `PRES-2026/${String(pressupostos.length + 1).padStart(3, '0')}`;

    const sectorDefecte: Sector = {
      id: 'sec-1',
      nom: 'Sector 1: Treballs Principals',
      ordre: 1
    };

    setPressupostActual({
      id: 'pres-' + Date.now(),
      numero: nouNum,
      clientId: clients[0]?.id || '',
      clientNom: clients[0]?.nom || '',
      clientNif: clients[0]?.cifNif || '',
      clientAdreca: clients[0]?.adreca || '',
      clientPoblacio: clients[0]?.poblacio || '',
      clientCodiPostal: clients[0]?.codiPostal || '',
      clientEmail: clients[0]?.email || '',
      clientTelefon: clients[0]?.telefon || '',
      data: dataAvui,
      validesaFins: dataValidesa,
      estat: 'esborrany',
      sectors: [sectorDefecte],
      linies: [],
      incloureImatgesPDF: true,
      notes: 'Garantia de 2 anys. Condicions de pagament: 30% a la confirmació, 70% a la finalització.',
      subtotal: 0,
      totalIva: 0,
      total: 0,
      dataCreacio: dataAvui
    });
    setModalObert(true);
  };

  const obrirModalEditar = (p: Pressupost) => {
    setPressupostActual(JSON.parse(JSON.stringify(p)));
    setModalObert(true);
  };

  // Afegir un sector nou
  const afegirSector = () => {
    const numSectors = (pressupostActual.sectors?.length || 0) + 1;
    const nouSector: Sector = {
      id: 'sec-' + Date.now(),
      nom: `Sector ${numSectors}: Nou Sector de Treball`,
      ordre: numSectors
    };
    setPressupostActual(prev => ({
      ...prev,
      sectors: [...(prev.sectors || []), nouSector]
    }));
  };

  // Eliminar un sector
  const eliminarSector = (sectorId: string) => {
    if ((pressupostActual.sectors?.length || 0) <= 1) {
      alert('Ha d\'haver-hi com a mínim un sector en el pressupost.');
      return;
    }
    setPressupostActual(prev => ({
      ...prev,
      sectors: prev.sectors?.filter(s => s.id !== sectorId),
      linies: prev.linies?.filter(l => l.sectorId !== sectorId)
    }));
    recalcularTotals();
  };

  // Afegir linia d'article a un sector
  const afegirLiniaASector = (sectorId: string, article?: Article) => {
    const novaLinia: LiniaItem = {
      id: 'lin-' + Date.now() + Math.random(),
      articleId: article?.id,
      codi: article?.codi || 'SERV-00',
      nom: article?.nom || 'Servei personalitzat',
      descripcio: article?.descripcio || '',
      imatgeUrl: article?.imatgeUrl || '',
      quantitat: 1,
      preuUnitari: article?.preuUnitari || 0,
      descomptePercent: 0,
      ivaPercent: article?.ivaPercent || 21,
      sectorId: sectorId
    };

    setPressupostActual(prev => {
      const novesLinies = [...(prev.linies || []), novaLinia];
      const calculs = calcularSubtotals(novesLinies);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  // Actualitzar linia item
  const actualitzarLinia = (liniaId: string, camp: keyof LiniaItem, valor: any) => {
    setPressupostActual(prev => {
      const novesLinies = (prev.linies || []).map(l => {
        if (l.id === liniaId) {
          return { ...l, [camp]: valor };
        }
        return l;
      });
      const calculs = calcularSubtotals(novesLinies);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  // Eliminar linia item
  const eliminarLinia = (liniaId: string) => {
    setPressupostActual(prev => {
      const novesLinies = (prev.linies || []).filter(l => l.id !== liniaId);
      const calculs = calcularSubtotals(novesLinies);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  const calcularSubtotals = (linies: LiniaItem[]) => {
    let subtotal = 0;
    let totalIva = 0;

    linies.forEach(l => {
      const baseLinia = l.preuUnitari * l.quantitat;
      const descompte = (baseLinia * (l.descomptePercent || 0)) / 100;
      const baseAmbDesc = baseLinia - descompte;
      const ivaLinia = (baseAmbDesc * l.ivaPercent) / 100;

      subtotal += baseAmbDesc;
      totalIva += ivaLinia;
    });

    return {
      subtotal,
      totalIva,
      total: subtotal + totalIva
    };
  };

  const recalcularTotals = () => {
    setPressupostActual(prev => ({
      ...prev,
      ...calcularSubtotals(prev.linies || [])
    }));
  };

  const seleccioClientHandler = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    if (c) {
      setPressupostActual(prev => ({
        ...prev,
        clientId: c.id,
        clientNom: c.nom,
        clientNif: c.cifNif,
        clientAdreca: c.adreca,
        clientPoblacio: c.poblacio,
        clientCodiPostal: c.codiPostal,
        clientEmail: c.email,
        clientTelefon: c.telefon
      }));
    }
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pressupostActual.clientNom) {
      alert('Si us plau, selecciona un client.');
      return;
    }
    if ((pressupostActual.linies?.length || 0) === 0) {
      alert('S’ha d’afegir com a mínim un article o línia de treball al pressupost.');
      return;
    }
    onSavePressupost(pressupostActual as Pressupost);
    setModalObert(false);
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <FileSpreadsheet className="text-sky-400" /> Pressupostos Organitzats per Sectors
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Creació de pressupostos estructurats per seccions de treball amb imatges i conversió a factura.</p>
        </div>
        <button onClick={obrirModalCrear} className="btn btn-primary">
          <Plus size={18} /> Crear Nou Pressupost
        </button>
      </div>

      {/* Cerca i Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Cercar per número de pressupost o client..." 
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-56">
          <select value={estatFiltre} onChange={(e) => setEstatFiltre(e.target.value)}>
            <option value="tots">Tots els estats</option>
            <option value="esborrany">Esborrany</option>
            <option value="enviat">Enviat</option>
            <option value="acceptat">Acceptat</option>
            <option value="rebutjat">Rebutjat</option>
          </select>
        </div>
      </div>

      {/* Taula de Pressupostos */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Client</th>
                <th>Data / Validesa</th>
                <th>Sectors</th>
                <th>Total</th>
                <th>Estat</th>
                <th className="text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {pressupostosFiltrats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[var(--text-muted)]">
                    No s'ha trobat cap pressupost.
                  </td>
                </tr>
              ) : (
                pressupostosFiltrats.map((p) => (
                  <tr key={p.id}>
                    <td className="font-extrabold text-sky-400">{p.numero}</td>
                    <td>
                      <div className="font-bold text-sm">{p.clientNom}</div>
                      <div className="text-xs text-[var(--text-muted)]">{p.clientNif}</div>
                    </td>
                    <td className="text-xs">
                      <div>{p.data}</div>
                      <div className="text-[var(--text-muted)]">Fins: {p.validesaFins}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border)]">
                        <Layers size={13} className="text-indigo-400" /> {p.sectors?.length || 0} Sectors
                      </span>
                    </td>
                    <td className="font-extrabold text-base">{formatEuro(p.total)}</td>
                    <td>
                      <span className={`badge ${
                        p.estat === 'acceptat' ? 'badge-success' :
                        p.estat === 'enviat' ? 'badge-info' :
                        p.estat === 'rebutjat' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {p.estat}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setPdfModalDoc(p)}
                          className="btn btn-secondary btn-icon btn-sm text-sky-400 hover:bg-sky-500/10"
                          title="Veure i Descarregar PDF"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => onConvertToFactura(p)}
                          className="btn btn-secondary btn-sm text-emerald-400 hover:bg-emerald-500/10"
                          title="Convertir a Factura en 1 clic"
                        >
                          <ArrowRightLeft size={14} /> Facturar
                        </button>
                        <button 
                          onClick={() => obrirModalEditar(p)}
                          className="btn btn-secondary btn-icon btn-sm text-indigo-400 hover:bg-indigo-500/10"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Vols eliminar el pressupost "${p.numero}"?`)) {
                              onDeletePressupost(p.id);
                            }
                          }}
                          className="btn btn-secondary btn-icon btn-sm text-rose-400 hover:bg-rose-500/10"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'Edició / Creació de Pressupost en estil FacturasCLOUD */}
      {modalObert && (
        <div className="modal-overlay p-2 sm:p-4">
          <div className="modal-content modal-content-wide max-w-[96vw] w-[96vw] bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in my-auto border border-slate-200">
            {/* Capçalera amb Pestanya "Informació General" */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 text-amber-400 font-extrabold text-sm px-5 py-2 rounded-t-lg shadow-sm border-t-2 border-amber-400 flex items-center gap-2">
                  <FileSpreadsheet size={16} /> Informació General
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary text-slate-600 py-1.5 px-4 text-xs font-bold">
                  Descartar
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); guardar(e as any); }} className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-5 py-1.5 rounded-lg text-xs shadow-md">
                  Guardar Pressupost
                </button>
                <button onClick={() => setModalObert(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={22} />
                </button>
              </div>
            </div>

            <form onSubmit={guardar} className="space-y-6">
              {/* 1. SECCIÓ INFORMACIÓ GENERAL */}
              <div className="space-y-4 text-slate-800 text-sm bg-slate-50/50 p-5 rounded-xl border border-slate-200">
                {/* Fila 1: Client + Botó Nou Client */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Client *</label>
                    <select 
                      value={pressupostActual.clientId || ''}
                      onChange={(e) => seleccioClientHandler(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-400 bg-white"
                    >
                      <option value="">Selecciona un Client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.nom} ({c.cifNif || 'Sense NIF'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <button 
                      type="button" 
                      onClick={() => alert("Per afegir un client nou, utilitza la secció de Clients a la barra lateral.")}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                    >
                      + Nou Client
                    </button>
                  </div>
                </div>

                {/* Fila 2: Data Emissió, Data Venciment, Número i Estat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Data Pressupost *</label>
                    <input 
                      type="date" 
                      value={pressupostActual.data || ''} 
                      onChange={e => setPressupostActual({ ...pressupostActual, data: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Validesa Fins a</label>
                    <input 
                      type="date" 
                      value={pressupostActual.validesaFins || ''} 
                      onChange={e => setPressupostActual({ ...pressupostActual, validesaFins: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Número Pressupost *</label>
                    <input 
                      type="text" 
                      value={pressupostActual.numero || ''} 
                      onChange={e => setPressupostActual({ ...pressupostActual, numero: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-sky-700 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Estat del Pressupost</label>
                    <select 
                      value={pressupostActual.estat || 'esborrany'}
                      onChange={e => setPressupostActual({ ...pressupostActual, estat: e.target.value as EstatPressupost })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-sky-700 bg-white"
                    >
                      <option value="esborrany">📝 Esborrany</option>
                      <option value="enviat">📩 Enviat al client</option>
                      <option value="acceptat">✅ Acceptat</option>
                      <option value="rebutjat">❌ Rebutjat</option>
                    </select>
                  </div>
                </div>

                {/* Fila 3: Opció Imatges PDF */}
                <div className="flex items-center gap-3 pt-1">
                  <input 
                    type="checkbox" 
                    id="incloureImatges" 
                    checked={pressupostActual.incloureImatgesPDF ?? true}
                    onChange={e => setPressupostActual({ ...pressupostActual, incloureImatgesPDF: e.target.checked })}
                    className="w-4 h-4 accent-slate-800 rounded cursor-pointer"
                  />
                  <label htmlFor="incloureImatges" className="cursor-pointer text-xs font-semibold text-slate-700">
                    Incloure imatges i fotografies dels articles en el PDF generat
                  </label>
                </div>
              </div>

              {/* 2. SECTORS I LÍNEES DE DETALL */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <h4 className="text-lg font-extrabold text-slate-800">Línies de Detall per Sectors</h4>
                  <button type="button" onClick={afegirSector} className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5">
                    <FolderPlus size={16} /> + Afegir Nou Sector
                  </button>
                </div>

                {pressupostActual.sectors?.map((sec, secIdx) => {
                  const liniesSector = (pressupostActual.linies || []).filter(l => l.sectorId === sec.id);
                  const theme = SECTOR_THEMES[secIdx % SECTOR_THEMES.length];

                  return (
                    <div key={sec.id} className={`p-5 space-y-4 border-2 border-l-8 ${theme.border} ${theme.bg} shadow-sm rounded-xl`}>
                      {/* Encapçalament del Sector */}
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border ${theme.headerBg}`}>
                        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                          <span className={`font-black text-xs px-3 py-1 rounded ${theme.tagBg} uppercase tracking-wider shrink-0`}>
                            Sector {secIdx + 1}
                          </span>
                          <input 
                            type="text" 
                            value={sec.nom}
                            onChange={(e) => {
                              const nomNou = e.target.value;
                              setPressupostActual(prev => ({
                                ...prev,
                                sectors: prev.sectors?.map(s => s.id === sec.id ? { ...s, nom: nomNou } : s)
                              }));
                            }}
                            className={`font-bold text-base bg-white border border-slate-300 focus:border-slate-500 rounded-lg px-3 py-1 ${theme.titleText} w-full`}
                            placeholder="Nom del Sector (ex: Demolicions i Neteja)"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Seleccionador d'articles ràpid del catàleg */}
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                const art = articles.find(a => a.id === e.target.value);
                                afegirLiniaASector(sec.id, art);
                                e.target.value = '';
                              }
                            }}
                            className="text-xs font-bold py-1.5 px-3 bg-white border border-slate-300 text-slate-800 rounded-lg"
                          >
                            <option value="">+ Carregar del Catàleg</option>
                            {articles.map(a => (
                              <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => eliminarSector(sec.id)}
                            className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 border border-rose-200 bg-white"
                            title="Eliminar sector"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Taula Visual de Línies exactament com la imatge de FacturasCLOUD */}
                      <div className="space-y-2 overflow-x-auto pt-1 pb-1">
                        {/* Fila de Capçaleres amb Línia d'Enquadrament */}
                        <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-700 min-w-[920px] border-b border-slate-300 pb-1">
                          <div className="w-8 text-center text-amber-500">
                            <span className="text-base font-extrabold">↕</span>
                          </div>
                          <div className="flex-1 min-w-[320px] px-2 text-left">Descripció</div>
                          <div className="w-28 text-center px-2">Quantitat</div>
                          <div className="w-32 text-right px-2">Preu (€)</div>
                          <div className="w-20 text-right px-2">Desc %</div>
                          <div className="w-24 text-center px-2">IVA %</div>
                          <div className="w-36 text-right px-2">Subtotal</div>
                          <div className="w-8 text-center"></div>
                        </div>

                        {/* Registres de línia */}
                        {liniesSector.length === 0 ? (
                          <div className="text-center py-6 text-sm text-slate-400 italic bg-white border border-slate-200 rounded-lg">
                            Sense línies en aquest sector. Fes clic a "Insertar Fila (F8)" a baix.
                          </div>
                        ) : (
                          liniesSector.map((l) => {
                            const base = l.preuUnitari * l.quantitat;
                            const desc = (base * (l.descomptePercent || 0)) / 100;
                            const subtotalLinia = base - desc;

                            return (
                              <div key={l.id} className="flex items-center gap-2 min-w-[920px]">
                                {/* Icona reordenar ↕ */}
                                <div className="w-8 text-center text-amber-500 cursor-grab font-black text-lg">
                                  ↕
                                </div>

                                {/* Campo Descripció (Super Ample) */}
                                <div className="flex-1 min-w-[320px]">
                                  <input 
                                    type="text" 
                                    value={l.nom} 
                                    onChange={e => actualitzarLinia(l.id, 'nom', e.target.value)}
                                    placeholder="Escriu la descripció del concepte o servei..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-400 bg-white"
                                  />
                                </div>

                                {/* Quantitat */}
                                <div className="w-28">
                                  <input 
                                    type="number" 
                                    step="any" 
                                    value={l.quantitat} 
                                    onChange={e => actualitzarLinia(l.id, 'quantitat', parseFloat(e.target.value) || 0)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-900 bg-white"
                                  />
                                </div>

                                {/* Preu (€) */}
                                <div className="w-32">
                                  <input 
                                    type="number" 
                                    step="0.01" 
                                    value={l.preuUnitari} 
                                    onChange={e => actualitzarLinia(l.id, 'preuUnitari', parseFloat(e.target.value) || 0)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-right font-bold text-slate-900 bg-white"
                                  />
                                </div>

                                {/* Descompte % */}
                                <div className="w-20">
                                  <input 
                                    type="number" 
                                    step="1" 
                                    value={l.descomptePercent || 0} 
                                    onChange={e => actualitzarLinia(l.id, 'descomptePercent', parseFloat(e.target.value) || 0)}
                                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm text-right text-slate-800 bg-white"
                                  />
                                </div>

                                {/* IVA % */}
                                <div className="w-24">
                                  <select 
                                    value={l.ivaPercent}
                                    onChange={e => actualitzarLinia(l.id, 'ivaPercent', Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-1 py-2 text-sm text-center font-semibold text-slate-800 bg-white"
                                  >
                                    <option value={21}>21%</option>
                                    <option value={10}>10%</option>
                                    <option value={4}>4%</option>
                                    <option value={0}>0%</option>
                                  </select>
                                </div>

                                {/* Subtotal (Lectura en fons gris nítid) */}
                                <div className="w-36 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-right text-slate-900">
                                  {formatEuro(subtotalLinia)}
                                </div>

                                {/* Botó X d'Eliminar Línia (Cercle vermell/taronja com la imatge) */}
                                <div className="w-8 flex justify-center">
                                  <button 
                                    type="button" 
                                    onClick={() => eliminarLinia(l.id)}
                                    className="w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-sm transition-transform active:scale-95"
                                    title="Eliminar fila"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Botó Inferior Esquerra "Insertar Fila (F8)" com la imatge */}
                      <div className="pt-1">
                        <button 
                          type="button" 
                          onClick={() => afegirLiniaASector(sec.id)} 
                          className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
                        >
                          Insertar Fila (F8)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. RESUM I TOTALS FINALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Notes i Condicions del Pressupost</label>
                  <textarea 
                    rows={3} 
                    value={pressupostActual.notes || ''} 
                    onChange={e => setPressupostActual({ ...pressupostActual, notes: e.target.value })}
                    placeholder="Escriu les condicions d'acceptació, terminis d'execució..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 bg-white"
                  />
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-300 space-y-2.5 text-sm">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Base Imponible Totals:</span>
                    <span className="font-bold text-slate-900">{formatEuro(pressupostActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Quota d'IVA Total:</span>
                    <span className="font-bold text-slate-900">{formatEuro(pressupostActual.totalIva || 0)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-xl text-slate-900">
                    <span>TOTAL PRESSUPOST:</span>
                    <span className="text-sky-700">{formatEuro(pressupostActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Botons d'Acció al Peu */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary font-bold px-5 py-2.5">
                  Descartar
                </button>
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-7 py-2.5 rounded-lg shadow-lg text-base">
                  Guardar Pressupost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Previsualització PDF */}
      {pdfModalDoc && (
        <PdfPreviewModal 
          document={pdfModalDoc}
          tipus="pressupost"
          empresa={empresa}
          onClose={() => setPdfModalDoc(null)}
        />
      )}
    </div>
  );
};
