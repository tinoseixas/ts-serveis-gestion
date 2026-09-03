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

      {/* Modal d'Edició / Creació de Pressupost Avançat per Sectors */}
      {modalObert && (
        <div className="modal-overlay p-2 sm:p-4">
          <div className="modal-content modal-content-wide max-w-[96vw] w-[96vw] p-6 sm:p-8 lg:p-10 space-y-8 animate-fade-in my-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-100 text-sky-600">
                  <FileSpreadsheet size={28} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {pressupostActual.numero ? `Editor de Pressupost (${pressupostActual.numero})` : 'Nou Pressupost per Sectors'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Organitza els articles per sectors i genera una oferta professional.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary text-slate-600">
                  Descartar
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); guardar(e as any); }} className="btn btn-primary font-extrabold px-6">
                  Guardar Pressupost
                </button>
                <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon ml-2">
                  <X size={22} />
                </button>
              </div>
            </div>

            <form onSubmit={guardar} className="space-y-8">
              {/* Dades Principals del Document */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">1. Dades Generals del Document</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="col-span-1 sm:col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Client *</label>
                    <select 
                      value={pressupostActual.clientId || ''}
                      onChange={(e) => seleccioClientHandler(e.target.value)}
                      required
                      className="font-bold text-sm bg-white border-slate-300 text-slate-900 py-3"
                    >
                      <option value="">-- Selecciona Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.nom} ({c.cifNif || 'Sense NIF'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Data d'Emissió</label>
                    <input 
                      type="date" 
                      value={pressupostActual.data || ''} 
                      onChange={e => setPressupostActual({ ...pressupostActual, data: e.target.value })}
                      className="font-semibold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Validesa Fins a</label>
                    <input 
                      type="date" 
                      value={pressupostActual.validesaFins || ''} 
                      onChange={e => setPressupostActual({ ...pressupostActual, validesaFins: e.target.value })}
                      className="font-semibold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Estat del Pressupost</label>
                    <select 
                      value={pressupostActual.estat || 'esborrany'}
                      onChange={e => setPressupostActual({ ...pressupostActual, estat: e.target.value as EstatPressupost })}
                      className="font-extrabold text-sm bg-white border-slate-300 text-sky-700 py-3"
                    >
                      <option value="esborrany">📝 Esborrany</option>
                      <option value="enviat">📩 Enviat al client</option>
                      <option value="acceptat">✅ Acceptat</option>
                      <option value="rebutjat">❌ Rebutjat</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                  <input 
                    type="checkbox" 
                    id="incloureImatges" 
                    checked={pressupostActual.incloureImatgesPDF ?? true}
                    onChange={e => setPressupostActual({ ...pressupostActual, incloureImatgesPDF: e.target.checked })}
                    className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                  />
                  <label htmlFor="incloureImatges" className="cursor-pointer text-sm font-semibold text-slate-800 mb-0">
                    Incloure imatges i fotografies dels articles en el PDF generat
                  </label>
                </div>
              </div>

              {/* SECTORS I ARTICLES */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">2. Desglossament per Sectors de Treball</h4>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">Afegeix sectors per agrupar la informació a la factura/pressupost.</p>
                  </div>
                  <button type="button" onClick={afegirSector} className="btn btn-secondary font-bold border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100">
                    <FolderPlus size={18} /> Afegir Nou Sector
                  </button>
                </div>

                {pressupostActual.sectors?.map((sec, secIdx) => {
                  const liniesSector = (pressupostActual.linies || []).filter(l => l.sectorId === sec.id);

                  return (
                    <div key={sec.id} className="card p-6 space-y-5 border-2 border-slate-200 bg-white shadow-md rounded-2xl">
                      {/* Encapçalament del Sector */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                          <span className="font-extrabold text-xs px-3.5 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider shrink-0">
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
                            className="font-extrabold text-lg bg-white border border-slate-300 focus:border-sky-500 rounded-lg px-3 py-1.5 text-slate-900 w-full"
                            placeholder="Nom del Sector (ex: Demolicions i Neteja)"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Seleccionador d'articles ràpid */}
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                const art = articles.find(a => a.id === e.target.value);
                                afegirLiniaASector(sec.id, art);
                                e.target.value = '';
                              }
                            }}
                            className="text-xs font-bold py-2 px-3 bg-white border-slate-300 text-slate-800"
                          >
                            <option value="">+ Carregar des del Catàleg</option>
                            {articles.map(a => (
                              <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => afegirLiniaASector(sec.id)}
                            className="btn btn-secondary btn-sm text-xs font-bold bg-white"
                            title="Afegir línia manual"
                          >
                            + Línia Personalitzada
                          </button>
                          <button 
                            type="button" 
                            onClick={() => eliminarSector(sec.id)}
                            className="btn btn-secondary btn-icon btn-sm text-rose-600 hover:bg-rose-50 border-rose-200 bg-white"
                            title="Eliminar sector"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Llista organitzada d'articles d'aquest sector */}
                      {liniesSector.length === 0 ? (
                        <div className="text-center py-8 text-sm text-slate-500 italic border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          Cap article afegit a aquest sector. Fes clic a "+ Carregar des del Catàleg" o "+ Línia Personalitzada".
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {liniesSector.map((l, indexLinia) => {
                            const base = l.preuUnitari * l.quantitat;
                            const desc = (base * (l.descomptePercent || 0)) / 100;
                            const subtotalLinia = base - desc;

                            return (
                              <div key={l.id} className="p-5 rounded-2xl border-2 border-slate-200 bg-white space-y-4 shadow-sm hover:border-sky-300 transition-all">
                                {/* Fila 1: Nom de l'Article / Servei i Accions */}
                                <div className="flex items-start gap-4">
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                        Línia #{indexLinia + 1}
                                      </span>
                                      <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Concepte / Nom de l'Article o Servei *</label>
                                    </div>
                                    <input 
                                      type="text" 
                                      value={l.nom} 
                                      onChange={e => actualitzarLinia(l.id, 'nom', e.target.value)}
                                      placeholder="Ex: Treballs de Demolió, Instal·lació de Paviment, Pintura..."
                                      className="font-extrabold text-base sm:text-lg text-slate-900 border-slate-300 focus:border-sky-500 py-3 px-4 rounded-xl w-full"
                                    />
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => eliminarLinia(l.id)}
                                    className="text-rose-500 hover:text-rose-700 p-3 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors mt-7 shrink-0"
                                    title="Eliminar aquesta línia"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </div>

                                {/* Fila 2: Descripció Tècnica Detallada (Super Ampla) */}
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600 uppercase">Descripció Tècnica i Detalls de la Línia (Opcional)</label>
                                  <textarea 
                                    rows={2}
                                    value={l.descripcio || ''} 
                                    onChange={e => actualitzarLinia(l.id, 'descripcio', e.target.value)}
                                    placeholder="Introdueix detalls tècnics, materials, mides o especificacions del treball..."
                                    className="text-sm text-slate-800 border-slate-300 focus:border-sky-500 py-2.5 px-4 rounded-xl w-full bg-slate-50/50"
                                  />
                                </div>

                                {/* Fila 3: Reixeta Ampla de Preus, Quantitats, Descomptes i Subtotal */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-3 border-t border-slate-100 items-end">
                                  <div>
                                    <label className="text-xs font-extrabold uppercase text-slate-700">Quantitat</label>
                                    <input 
                                      type="number" 
                                      step="any" 
                                      value={l.quantitat} 
                                      onChange={e => actualitzarLinia(l.id, 'quantitat', parseFloat(e.target.value) || 0)}
                                      className="text-center font-black text-xl py-3 px-3 bg-sky-50 border-2 border-sky-400 focus:border-sky-600 text-sky-950 rounded-xl shadow-inner w-full mt-1"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs font-extrabold uppercase text-slate-700">Preu Unitari (€)</label>
                                    <input 
                                      type="number" 
                                      step="0.01" 
                                      value={l.preuUnitari} 
                                      onChange={e => actualitzarLinia(l.id, 'preuUnitari', parseFloat(e.target.value) || 0)}
                                      className="text-right font-extrabold text-lg py-3 px-3 border-2 border-slate-300 focus:border-sky-500 rounded-xl w-full mt-1 text-slate-900"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold uppercase text-slate-700">Descompte (%)</label>
                                    <input 
                                      type="number" 
                                      step="1" 
                                      value={l.descomptePercent} 
                                      onChange={e => actualitzarLinia(l.id, 'descomptePercent', parseFloat(e.target.value) || 0)}
                                      className="text-right font-bold text-base py-3 px-3 border-slate-300 rounded-xl w-full mt-1 text-slate-900"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold uppercase text-slate-700">Tipus IVA</label>
                                    <select 
                                      value={l.ivaPercent}
                                      onChange={e => actualitzarLinia(l.id, 'ivaPercent', Number(e.target.value))}
                                      className="text-center font-extrabold text-base py-3 px-3 border-slate-300 rounded-xl w-full mt-1 bg-white text-slate-900"
                                    >
                                      <option value={21}>21% IVA</option>
                                      <option value={10}>10% IVA</option>
                                      <option value={4}>4% IVA</option>
                                      <option value={0}>0% IVA</option>
                                    </select>
                                  </div>

                                  <div className="col-span-2 sm:col-span-1 text-right bg-sky-50 p-3 rounded-xl border border-sky-200">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block">Subtotal Línia</span>
                                    <span className="text-xl font-black text-sky-700 block mt-0.5">{formatEuro(subtotalLinia)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes i Totals Finals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Condicions Generals & Notes per al Client</label>
                  <textarea 
                    rows={4} 
                    value={pressupostActual.notes || ''} 
                    onChange={e => setPressupostActual({ ...pressupostActual, notes: e.target.value })}
                    placeholder="Escriu les condicions de pagament, termini d'execució, validesa de l'oferta..."
                    className="bg-white border-slate-300 text-sm mt-1"
                  />
                </div>
                <div className="space-y-4 justify-self-end w-full max-w-sm text-sm bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Base Imponible Totals:</span>
                    <span className="font-bold text-slate-900">{formatEuro(pressupostActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Quota d'IVA Total:</span>
                    <span className="font-bold text-slate-900">{formatEuro(pressupostActual.totalIva || 0)}</span>
                  </div>
                  <div className="border-t-2 border-slate-200 pt-3 flex justify-between font-extrabold text-xl">
                    <span className="text-slate-900">TOTAL PRESSUPOST:</span>
                    <span className="text-sky-600">{formatEuro(pressupostActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary font-bold px-6 py-3">
                  Descartar Canvis
                </button>
                <button type="submit" className="btn btn-primary font-extrabold px-8 py-3 text-base shadow-lg">
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
