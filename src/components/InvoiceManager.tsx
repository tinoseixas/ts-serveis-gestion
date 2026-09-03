import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  SkipBack,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Printer,
  Save,
  RotateCcw,
  FileMinus
} from 'lucide-react';
import type { Factura, Client, Article, LiniaItem, EstatFactura, Empresa } from '../types';
import { PdfPreviewModal } from './PdfPreviewModal';
import { QuickLookupModal } from './QuickLookupModal';

interface InvoiceManagerProps {
  factures: Factura[];
  clients: Client[];
  articles: Article[];
  empresa: Empresa;
  onSaveFactura: (factura: Factura) => void;
  onDeleteFactura: (id: string) => void;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({
  factures,
  clients,
  articles,
  empresa,
  onSaveFactura,
  onDeleteFactura
}) => {
  const [cerca, setCerca] = useState('');
  const [estatFiltre, setEstatFiltre] = useState<string>('tots');
  const [modalObert, setModalObert] = useState(false);
  const [pdfModalDoc, setPdfModalDoc] = useState<Factura | null>(null);
  const [lookupType, setLookupType] = useState<'articles' | 'clients' | null>(null);
  const [activeRecordIndex, setActiveRecordIndex] = useState<number>(0);

  const [facturaActual, setFacturaActual] = useState<Partial<Factura>>({});

  const facturesFiltrades = factures.filter(f => {
    const coincideixCerca = 
      f.numero.toLowerCase().includes(cerca.toLowerCase()) ||
      f.clientNom.toLowerCase().includes(cerca.toLowerCase());
    const coincideixEstat = estatFiltre === 'tots' || f.estat === estatFiltre;
    return coincideixCerca && coincideixEstat;
  });

  const obrirModalCrear = () => {
    const dataAvui = new Date().toISOString().split('T')[0];
    const dataVenc = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nouNum = `F-2026/${String(factures.length + 1).padStart(3, '0')}`;

    setFacturaActual({
      id: 'fac-' + Date.now(),
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
      dataVenciment: dataVenc,
      estat: 'pendent',
      formaPagament: 'transferencia',
      linies: [],
      subtotal: 0,
      totalIva: 0,
      irpfPercent: 0,
      totalIrpf: 0,
      total: 0,
      notes: 'Forma de pagament: Transferència bancària a CaixaBank.',
      dataCreacio: dataAvui
    });
    setModalObert(true);
  };

  const obrirModalEditar = (f: Factura) => {
    const idx = factures.findIndex(item => item.id === f.id);
    if (idx !== -1) setActiveRecordIndex(idx);
    setFacturaActual(JSON.parse(JSON.stringify(f)));
    setModalObert(true);
  };

  const carregarRegistrePerIndex = (idx: number) => {
    if (idx >= 0 && idx < factures.length) {
      setActiveRecordIndex(idx);
      setFacturaActual(JSON.parse(JSON.stringify(factures[idx])));
    }
  };

  const crearNotaCreditoNC = (f: Factura) => {
    const dataAvui = new Date().toISOString().split('T')[0];
    const nouNumNC = `NC-2026/${String(factures.length + 1).padStart(3, '0')}`;
    
    // Crear línies en negatiu per rectificativa
    const liniesNC = f.linies.map(l => ({
      ...l,
      quantitat: -Math.abs(l.quantitat)
    }));

    const novaNC: Factura = {
      ...JSON.parse(JSON.stringify(f)),
      id: 'nc-' + Date.now(),
      numero: nouNumNC,
      data: dataAvui,
      estat: 'anul.lada',
      linies: liniesNC,
      subtotal: -Math.abs(f.subtotal),
      totalIva: -Math.abs(f.totalIva),
      total: -Math.abs(f.total),
      notes: `Document Rectificatiu (Nota de Crèdit) de la factura ${f.numero}.`
    };

    onSaveFactura(novaNC);
    alert(`Document Rectificatiu ${nouNumNC} emès amb èxit.`);
  };

  const afegirLinia = (article?: Article) => {
    const novaLinia: LiniaItem = {
      id: 'lin-f-' + Date.now() + Math.random(),
      articleId: article?.id,
      codi: article?.codi || 'CON-001',
      nom: article?.nom || 'Concepte personalitzat',
      descripcio: article?.descripcio || '',
      quantitat: 1,
      preuUnitari: article?.preuUnitari || 0,
      descomptePercent: 0,
      ivaPercent: article?.ivaPercent || 21,
      sectorId: 'general'
    };

    setFacturaActual(prev => {
      const novesLinies = [...(prev.linies || []), novaLinia];
      const calculs = calcularTotals(novesLinies, prev.irpfPercent || 0);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  const actualitzarLinia = (liniaId: string, camp: keyof LiniaItem, valor: any) => {
    setFacturaActual(prev => {
      const novesLinies = (prev.linies || []).map(l => {
        if (l.id === liniaId) {
          return { ...l, [camp]: valor };
        }
        return l;
      });
      const calculs = calcularTotals(novesLinies, prev.irpfPercent || 0);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  const eliminarLinia = (liniaId: string) => {
    setFacturaActual(prev => {
      const novesLinies = (prev.linies || []).filter(l => l.id !== liniaId);
      const calculs = calcularTotals(novesLinies, prev.irpfPercent || 0);
      return {
        ...prev,
        linies: novesLinies,
        ...calculs
      };
    });
  };

  const calcularTotals = (linies: LiniaItem[], irpfPercent: number) => {
    let subtotal = 0;
    let totalIva = 0;

    linies.forEach(l => {
      const base = l.preuUnitari * l.quantitat;
      const desc = (base * (l.descomptePercent || 0)) / 100;
      const baseDesc = base - desc;
      const iva = (baseDesc * l.ivaPercent) / 100;

      subtotal += baseDesc;
      totalIva += iva;
    });

    const totalIrpf = (subtotal * irpfPercent) / 100;
    const total = subtotal + totalIva - totalIrpf;

    return {
      subtotal,
      totalIva,
      totalIrpf,
      total
    };
  };

  const seleccioClientHandler = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    if (c) {
      setFacturaActual(prev => ({
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

  const canviarEstatRapida = (f: Factura, nouEstat: EstatFactura) => {
    const fActualitzada = { ...f, estat: nouEstat };
    onSaveFactura(fActualitzada);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaActual.clientNom) {
      alert('Si us plau, selecciona un client.');
      return;
    }
    if ((facturaActual.linies?.length || 0) === 0) {
      alert('Has d\'afegir com a mínim un concepte a la factura.');
      return;
    }
    onSaveFactura(facturaActual as Factura);
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
            <FileText className="text-indigo-400" /> Gestió de Factures
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Emissió de factures, control de cobraments, retencions i generació de PDF.</p>
        </div>
        <button onClick={obrirModalCrear} className="btn btn-primary">
          <Plus size={18} /> Nova Factura
        </button>
      </div>

      {/* Cerca i Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Cercar per número de factura o client..." 
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-56">
          <select value={estatFiltre} onChange={(e) => setEstatFiltre(e.target.value)}>
            <option value="tots">Tots els estats</option>
            <option value="pendent">Pendent de pagament</option>
            <option value="pagada">Pagada (Cobrada)</option>
            <option value="vencuda">Vencuda</option>
            <option value="anul.lada">Anul·lada</option>
          </select>
        </div>
      </div>

      {/* Taula de Factures */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Client</th>
                <th>Data / Venciment</th>
                <th>Forma de Pagament</th>
                <th>Total</th>
                <th>Estat de Pagament</th>
                <th className="text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {facturesFiltrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[var(--text-muted)]">
                    No s'ha trobat cap factura.
                  </td>
                </tr>
              ) : (
                facturesFiltrades.map((f) => (
                  <tr key={f.id}>
                    <td className="font-extrabold text-indigo-400">{f.numero}</td>
                    <td>
                      <div className="font-bold text-sm">{f.clientNom}</div>
                      <div className="text-xs text-[var(--text-muted)]">{f.clientNif}</div>
                    </td>
                    <td className="text-xs">
                      <div>{f.data}</div>
                      <div className="text-[var(--text-muted)]">Venc: {f.dataVenciment}</div>
                    </td>
                    <td className="capitalize text-xs font-semibold text-[var(--text-muted)]">
                      {f.formaPagament}
                    </td>
                    <td className="font-extrabold text-base">{formatEuro(f.total)}</td>
                    <td>
                      <button
                        onClick={() => canviarEstatRapida(f, f.estat === 'pagada' ? 'pendent' : 'pagada')}
                        className={`badge cursor-pointer transition-transform hover:scale-105 ${
                          f.estat === 'pagada' ? 'badge-success' :
                          f.estat === 'pendent' ? 'badge-warning' : 'badge-danger'
                        }`}
                        title="Fes clic per canviar ràpidament entre Pagada / Pendent"
                      >
                        {f.estat}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setPdfModalDoc(f)}
                          className="btn btn-secondary btn-icon btn-sm text-sky-400 hover:bg-sky-500/10"
                          title="Veure / Descarregar PDF"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => obrirModalEditar(f)}
                          className="btn btn-secondary btn-icon btn-sm text-indigo-400 hover:bg-indigo-500/10"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Vols eliminar la factura "${f.numero}"?`)) {
                              onDeleteFactura(f.id);
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

      {/* Modal d'Edició / Creació de Factura en estil PHC Enterprise (Header-Detail) */}
      {modalObert && (
        <div className="modal-overlay p-2 sm:p-4">
          <div className="modal-content modal-content-wide max-w-[96vw] w-[96vw] bg-white rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 animate-fade-in my-auto border border-slate-300 text-slate-900">
            {/* Barra d'Accions Superior Padronitzada PHC */}
            <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={obrirModalCrear}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                  title="Nova Fatura"
                >
                  <Plus size={14} /> + Novo
                </button>
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); guardar(e as any); }} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  title="Gravar Registo"
                >
                  <Save size={14} /> Gravar
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalObert(false)} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                  title="Cancelar / Sair"
                >
                  <RotateCcw size={14} /> Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (facturaActual.id) setPdfModalDoc(facturaActual as Factura);
                  }}
                  className="bg-sky-700 hover:bg-sky-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-sky-600"
                  title="Imprimir Documento PDF"
                >
                  <Printer size={14} /> Imprimir PDF
                </button>
                {facturaActual.id && (
                  <button 
                    type="button" 
                    onClick={() => crearNotaCreditoNC(facturaActual as Factura)}
                    className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-rose-600"
                    title="Emitir Documento Retificativo (Nota de Crédito NC)"
                  >
                    <FileMinus size={14} /> Rectificativa (NC)
                  </button>
                )}
              </div>

              {/* Control de Navegació Sequencial entre Registres (Primeiro, Anterior, Próximo, Último) */}
              <div className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mr-1">Registo:</span>
                <button 
                  type="button" 
                  onClick={() => carregarRegistrePerIndex(0)} 
                  disabled={activeRecordIndex <= 0}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-amber-400"
                  title="Primeiro Registo"
                >
                  <SkipBack size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => carregarRegistrePerIndex(activeRecordIndex - 1)} 
                  disabled={activeRecordIndex <= 0}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-amber-400"
                  title="Registo Anterior"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="font-mono text-xs text-white font-bold px-2">
                  {factures.length > 0 ? `${activeRecordIndex + 1} / ${factures.length}` : 'Novo'}
                </span>

                <button 
                  type="button" 
                  onClick={() => carregarRegistrePerIndex(activeRecordIndex + 1)} 
                  disabled={activeRecordIndex >= factures.length - 1}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-amber-400"
                  title="Próximo Registo"
                >
                  <ChevronRight size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => carregarRegistrePerIndex(factures.length - 1)} 
                  disabled={activeRecordIndex >= factures.length - 1}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-amber-400"
                  title="Último Registo"
                >
                  <SkipForward size={14} />
                </button>
              </div>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              {/* 1. SECCIÓ INFORMACIÓ GENERAL COMPACTA (Header Pattern 2-3 Columnes) */}
              <div className="space-y-3 text-slate-800 text-xs bg-slate-50 p-4 rounded-xl border border-slate-300">
                {/* Fila 1: Client + Lookup Client */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-9 space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Cliente (Receptor) *</label>
                    <div className="flex gap-2">
                      <select 
                        value={facturaActual.clientId || ''}
                        onChange={(e) => seleccioClientHandler(e.target.value)}
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="">Seleccione o Cliente da Ficha...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.nom} ({c.cifNif || 'Sem NIF'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setLookupType('clients')}
                        className="bg-sky-700 hover:bg-sky-600 text-white font-extrabold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 text-xs"
                        title="Pesquisa Rápida Lookup por NIF/Nome"
                      >
                        <Search size={14} /> Lookup
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <button 
                      type="button" 
                      onClick={() => alert("Per afegir un client nou, utilitza el menú de Clients a la barra lateral.")}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-1.5 rounded-lg shadow-sm"
                    >
                      + Novo Cliente
                    </button>
                  </div>
                </div>

                {/* Fila 2: Data Emissió, Data Venciment, Número i Estat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Data Factura *</label>
                    <input 
                      type="date" 
                      value={facturaActual.data || ''} 
                      onChange={e => setFacturaActual({ ...facturaActual, data: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Data Venciment</label>
                    <input 
                      type="date" 
                      value={facturaActual.dataVenciment || ''} 
                      onChange={e => setFacturaActual({ ...facturaActual, dataVenciment: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Número Factura *</label>
                    <input 
                      type="text" 
                      value={facturaActual.numero || ''} 
                      onChange={e => setFacturaActual({ ...facturaActual, numero: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Estat de Cobrament</label>
                    <select 
                      value={facturaActual.estat || 'pendent'}
                      onChange={e => setFacturaActual({ ...facturaActual, estat: e.target.value as EstatFactura })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-indigo-700 bg-white"
                    >
                      <option value="pendent">⏳ Pendent de pagament</option>
                      <option value="pagada">💰 Pagada (Cobrada)</option>
                      <option value="vencuda">⚠️ Vencuda</option>
                      <option value="anul.lada">🚫 Anul·lada</option>
                    </select>
                  </div>
                </div>

                {/* Fila 3: Resum del Document */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Resum del Document</label>
                  <input 
                    type="text" 
                    value={facturaActual.notes || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, notes: e.target.value })}
                    placeholder="Escriu en aquest camp el resum d'aquest document (Solo será visible por ti)..."
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* 2. SECCIÓ LÍNEES DE DETALL */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-slate-300 pb-2">
                  <h4 className="text-lg font-extrabold text-slate-800">Línies de Detall</h4>
                </div>

                {/* Cercador i Inserció de Productes del Catàleg */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Productes i Serveis (Catàleg)</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <select 
                      id="catalaSelect"
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (selectedId) {
                          const art = articles.find(a => a.id === selectedId);
                          if (art) afegirLinia(art);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 min-w-[280px] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                    >
                      <option value="">Selecciona un Producte o Servei...</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => {
                        const el = document.getElementById('catalaSelect') as HTMLSelectElement;
                        if (el && el.value) {
                          const art = articles.find(a => a.id === el.value);
                          if (art) afegirLinia(art);
                          el.value = '';
                        }
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-300"
                    >
                      Insertar
                    </button>
                    <button 
                      type="button" 
                      onClick={() => alert("Per afegir un nou article al catàleg general, utilitza la secció de Catàleg d'Articles.")}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                    >
                      + Nou Producte o Servei
                    </button>
                  </div>
                </div>

                {/* Taula Visual de Línies exactament com la imatge de FacturasCLOUD */}
                <div className="space-y-2 overflow-x-auto pt-2 pb-2">
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
                  {(facturaActual.linies || []).length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg">
                      Sense línies de detall. Fes clic a "Insertar Fila (F8)" a baix per afegir una línia.
                    </div>
                  ) : (
                    (facturaActual.linies || []).map((l) => {
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
                <div className="pt-2">
                  <button 
                    type="button" 
                    onClick={() => afegirLinia()} 
                    className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2"
                  >
                    Insertar Fila (F8)
                  </button>
                </div>
              </div>

              {/* 3. RESUM I TOTALS FINALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Notes i Instruccions de Pagament</label>
                  <textarea 
                    rows={3} 
                    value={facturaActual.notes || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, notes: e.target.value })}
                    placeholder="Informació bancària, IBAN, dades de transferència..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 bg-white"
                  />
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-300 space-y-2.5 text-sm">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Base Imponible Totals:</span>
                    <span className="font-bold text-slate-900">{formatEuro(facturaActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Quota d'IVA Total:</span>
                    <span className="font-bold text-slate-900">{formatEuro(facturaActual.totalIva || 0)}</span>
                  </div>
                  {(facturaActual.irpfPercent || 0) > 0 && (
                    <div className="flex justify-between font-semibold text-rose-600">
                      <span>Retenció IRPF (-{facturaActual.irpfPercent}%):</span>
                      <span className="font-bold">-{formatEuro(facturaActual.totalIrpf || 0)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-xl text-slate-900">
                    <span>TOTAL FACTURA:</span>
                    <span className="text-indigo-700">{formatEuro(facturaActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Botons d'Acció al Peu */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary font-bold px-5 py-2.5">
                  Descartar
                </button>
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-7 py-2.5 rounded-lg shadow-lg text-base">
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal PDF Preview */}
      {pdfModalDoc && (
        <PdfPreviewModal 
          document={pdfModalDoc}
          tipus="factura"
          empresa={empresa}
          onClose={() => setPdfModalDoc(null)}
        />
      )}

      {/* Modal Popup de Cerca Predictiva Lookup */}
      {lookupType && (
        <QuickLookupModal 
          type={lookupType}
          articles={articles}
          clients={clients}
          onSelectClient={c => seleccioClientHandler(c.id)}
          onSelectArticle={art => afegirLinia(art)}
          onClose={() => setLookupType(null)}
        />
      )}
    </div>
  );
};
