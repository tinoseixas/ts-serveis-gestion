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
        <div className="modal-overlay">
          <div className="modal-content max-w-5xl w-full p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="text-sky-400" />
                {pressupostActual.numero ? `Editor de Pressupost (${pressupostActual.numero})` : 'Nou Pressupost'}
              </h3>
              <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-6">
              {/* Dades Principals del Document */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border)]">
                <div>
                  <label>Client *</label>
                  <select 
                    value={pressupostActual.clientId || ''}
                    onChange={(e) => seleccioClientHandler(e.target.value)}
                    required
                  >
                    <option value="">-- Selecciona Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.cifNif})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Data del Pressupost</label>
                  <input 
                    type="date" 
                    value={pressupostActual.data || ''} 
                    onChange={e => setPressupostActual({ ...pressupostActual, data: e.target.value })}
                  />
                </div>
                <div>
                  <label>Validesa Fins a</label>
                  <input 
                    type="date" 
                    value={pressupostActual.validesaFins || ''} 
                    onChange={e => setPressupostActual({ ...pressupostActual, validesaFins: e.target.value })}
                  />
                </div>
                <div>
                  <label>Estat del Pressupost</label>
                  <select 
                    value={pressupostActual.estat || 'esborrany'}
                    onChange={e => setPressupostActual({ ...pressupostActual, estat: e.target.value as EstatPressupost })}
                  >
                    <option value="esborrany">Esborrany</option>
                    <option value="enviat">Enviat al client</option>
                    <option value="acceptat">Acceptat</option>
                    <option value="rebutjat">Rebutjat</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 pt-4">
                  <input 
                    type="checkbox" 
                    id="incloureImatges" 
                    checked={pressupostActual.incloureImatgesPDF ?? true}
                    onChange={e => setPressupostActual({ ...pressupostActual, incloureImatgesPDF: e.target.checked })}
                    className="w-5 h-5 accent-sky-500 cursor-pointer"
                  />
                  <label htmlFor="incloureImatges" className="cursor-pointer text-sm font-semibold capitalize text-[var(--text-main)] mb-0">
                    Incloure imatges dels articles en el PDF generat
                  </label>
                </div>
              </div>

              {/* SECTORS I ARTICLES */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-lg flex items-center gap-2">
                    <Layers className="text-indigo-400" /> Sectors i Línies de Treball
                  </h4>
                  <button type="button" onClick={afegirSector} className="btn btn-secondary btn-sm">
                    <FolderPlus size={16} /> Afegir Nou Sector
                  </button>
                </div>

                {pressupostActual.sectors?.map((sec, secIdx) => {
                  const liniesSector = (pressupostActual.linies || []).filter(l => l.sectorId === sec.id);

                  return (
                    <div key={sec.id} className="card p-4 space-y-4 border-2 border-indigo-500/20 bg-slate-900/40">
                      {/* Encapçalament del Sector */}
                      <div className="flex items-center justify-between gap-4 bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-extrabold text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
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
                            className="font-bold text-sm bg-transparent border-none focus:ring-0 text-sky-400"
                            placeholder="Nom del Sector (ex: Sector 1: Demolicions)"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Seleccionador d'articles ràpid */}
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                const art = articles.find(a => a.id === e.target.value);
                                afegirLiniaASector(sec.id, art);
                                e.target.value = '';
                              }
                            }}
                            className="text-xs py-1"
                          >
                            <option value="">+ Afegir des del Catàleg</option>
                            {articles.map(a => (
                              <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => afegirLiniaASector(sec.id)}
                            className="btn btn-secondary btn-sm text-xs"
                            title="Afegir línia manual"
                          >
                            + Línia Personalitzada
                          </button>
                          <button 
                            type="button" 
                            onClick={() => eliminarSector(sec.id)}
                            className="btn btn-secondary btn-icon btn-sm text-rose-400 hover:bg-rose-500/10"
                            title="Eliminar sector"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Taula d'articles d'aquest sector */}
                      {liniesSector.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[var(--text-muted)] italic border border-dashed border-[var(--border)] rounded-lg">
                          Cap article afegit a aquest sector. Fes clic a "+ Afegir des del Catàleg" o "+ Línia Personalitzada".
                        </div>
                      ) : (
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>Concept/Article</th>
                                <th className="w-24">Quantitat</th>
                                <th className="w-28">Preu U. (€)</th>
                                <th className="w-24">Desc. %</th>
                                <th className="w-24">IVA %</th>
                                <th className="w-28 text-right">Subtotal</th>
                                <th className="w-12 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {liniesSector.map((l) => {
                                const base = l.preuUnitari * l.quantitat;
                                const desc = (base * (l.descomptePercent || 0)) / 100;
                                const subtotalLinia = base - desc;

                                return (
                                  <tr key={l.id}>
                                    <td>
                                      <div className="space-y-1">
                                        <input 
                                          type="text" 
                                          value={l.nom} 
                                          onChange={e => actualitzarLinia(l.id, 'nom', e.target.value)}
                                          placeholder="Nom de l'article o servei"
                                          className="font-bold text-xs"
                                        />
                                        <textarea 
                                          rows={1}
                                          value={l.descripcio || ''} 
                                          onChange={e => actualitzarLinia(l.id, 'descripcio', e.target.value)}
                                          placeholder="Descripció tècnica..."
                                          className="text-xs text-[var(--text-muted)]"
                                        />
                                      </div>
                                    </td>
                                    <td>
                                      <input 
                                        type="number" 
                                        step="1" 
                                        value={l.quantitat} 
                                        onChange={e => actualitzarLinia(l.id, 'quantitat', parseFloat(e.target.value) || 0)}
                                        className="text-center text-xs"
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" 
                                        step="0.01" 
                                        value={l.preuUnitari} 
                                        onChange={e => actualitzarLinia(l.id, 'preuUnitari', parseFloat(e.target.value) || 0)}
                                        className="text-right text-xs"
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" 
                                        step="1" 
                                        value={l.descomptePercent} 
                                        onChange={e => actualitzarLinia(l.id, 'descomptePercent', parseFloat(e.target.value) || 0)}
                                        className="text-right text-xs"
                                      />
                                    </td>
                                    <td>
                                      <select 
                                        value={l.ivaPercent}
                                        onChange={e => actualitzarLinia(l.id, 'ivaPercent', Number(e.target.value))}
                                        className="text-xs py-1"
                                      >
                                        <option value={21}>21%</option>
                                        <option value={10}>10%</option>
                                        <option value={4}>4%</option>
                                        <option value={0}>0%</option>
                                      </select>
                                    </td>
                                    <td className="text-right font-extrabold text-xs">
                                      {formatEuro(subtotalLinia)}
                                    </td>
                                    <td className="text-center">
                                      <button 
                                        type="button" 
                                        onClick={() => eliminarLinia(l.id)}
                                        className="text-rose-400 hover:text-rose-600 p-1"
                                      >
                                        <X size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes i Totals Finals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-app)] p-5 rounded-xl border border-[var(--border)]">
                <div>
                  <label>Condicions Generals & Notes</label>
                  <textarea 
                    rows={4} 
                    value={pressupostActual.notes || ''} 
                    onChange={e => setPressupostActual({ ...pressupostActual, notes: e.target.value })}
                    placeholder="Escriu les condicions de pagament, termini de validesa..."
                  />
                </div>
                <div className="space-y-3 justify-self-end w-full max-w-xs text-sm">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Base Imponible:</span>
                    <span className="font-semibold text-[var(--text-main)]">{formatEuro(pressupostActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Quota IVA:</span>
                    <span className="font-semibold text-[var(--text-main)]">{formatEuro(pressupostActual.totalIva || 0)}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between font-extrabold text-lg">
                    <span>TOTAL PRESSUPOST:</span>
                    <span className="text-sky-400">{formatEuro(pressupostActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary">
                  Cancel·lar
                </button>
                <button type="submit" className="btn btn-primary">
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
