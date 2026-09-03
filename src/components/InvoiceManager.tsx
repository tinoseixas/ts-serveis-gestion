import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  X 
} from 'lucide-react';
import type { Factura, Client, Article, LiniaItem, EstatFactura, FormaPagament, Empresa } from '../types';
import { PdfPreviewModal } from './PdfPreviewModal';

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
    setFacturaActual(JSON.parse(JSON.stringify(f)));
    setModalObert(true);
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

      {/* Modal Formulari Factura */}
      {modalObert && (
        <div className="modal-overlay p-2 sm:p-4">
          <div className="modal-content modal-content-wide max-w-[96vw] w-[96vw] p-6 sm:p-8 lg:p-10 space-y-8 animate-fade-in my-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {facturaActual.numero ? `Editar Factura (${facturaActual.numero})` : 'Nova Factura Comercial'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Emets una factura oficial amb impostos i condicions de cobrament.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary text-slate-600">
                  Descartar
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); guardar(e as any); }} className="btn btn-primary font-extrabold px-6 bg-indigo-600 hover:bg-indigo-700">
                  Guardar Factura
                </button>
                <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon ml-2">
                  <X size={22} />
                </button>
              </div>
            </div>

            <form onSubmit={guardar} className="space-y-8">
              {/* Dades Principals de la Factura */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">1. Dades Principals de la Factura</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Client *</label>
                    <select 
                      value={facturaActual.clientId || ''}
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
                      value={facturaActual.data || ''} 
                      onChange={e => setFacturaActual({ ...facturaActual, data: e.target.value })}
                      className="font-semibold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Data de Venciment</label>
                    <input 
                      type="date" 
                      value={facturaActual.dataVenciment || ''} 
                      onChange={e => setFacturaActual({ ...facturaActual, dataVenciment: e.target.value })}
                      className="font-semibold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Estat de Pagament</label>
                    <select 
                      value={facturaActual.estat || 'pendent'}
                      onChange={e => setFacturaActual({ ...facturaActual, estat: e.target.value as EstatFactura })}
                      className="font-extrabold text-sm bg-white border-slate-300 text-indigo-700 py-3"
                    >
                      <option value="pendent">⏳ Pendent de pagament</option>
                      <option value="pagada">💰 Pagada (Cobrada)</option>
                      <option value="vencuda">⚠️ Vencuda</option>
                      <option value="anul.lada">🚫 Anul·lada</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Forma de Pagament</label>
                    <select 
                      value={facturaActual.formaPagament || 'transferencia'}
                      onChange={e => setFacturaActual({ ...facturaActual, formaPagament: e.target.value as FormaPagament })}
                      className="font-semibold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    >
                      <option value="transferencia">🏛️ Transferència Bancària</option>
                      <option value="efectiu">💵 Efectiu</option>
                      <option value="domiciliacio">💳 Domiciliació Bancària</option>
                      <option value="targeta">💳 Targeta de Crèdit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Retenció IRPF (%)</label>
                    <input 
                      type="number" 
                      step="1"
                      placeholder="0" 
                      value={facturaActual.irpfPercent ?? 0}
                      onChange={e => {
                        const irpf = parseFloat(e.target.value) || 0;
                        setFacturaActual(prev => ({
                          ...prev,
                          irpfPercent: irpf,
                          ...calcularTotals(prev.linies || [], irpf)
                        }));
                      }}
                      className="font-extrabold text-sm bg-white border-slate-300 py-3 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Línies de la Factura */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">2. Línies de Treball i Productes</h4>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">Defineix els serveis o productes d'aquesta factura.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const art = articles.find(a => a.id === e.target.value);
                          afegirLinia(art);
                          e.target.value = '';
                        }
                      }}
                      className="text-xs font-bold py-2.5 px-3 bg-white border-slate-300 text-slate-800"
                    >
                      <option value="">+ Carregar des del Catàleg</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => afegirLinia()} className="btn btn-secondary font-bold text-xs py-2.5 bg-white">
                      + Concepte Manual
                    </button>
                  </div>
                </div>

                {/* Llista organitzada de línies de la factura */}
                {(facturaActual.linies || []).length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500 italic border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    Cap concepte afegit a aquesta factura. Fes clic a "+ Carregar des del Catàleg" o "+ Concepte Manual".
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(facturaActual.linies || []).map((l, indexLinia) => {
                      const base = l.preuUnitari * l.quantitat;
                      const desc = (base * (l.descomptePercent || 0)) / 100;
                      const subtotalLinia = base - desc;

                      return (
                        <div key={l.id} className="p-5 rounded-2xl border-2 border-slate-200 bg-white space-y-4 shadow-sm hover:border-indigo-300 transition-all">
                          {/* Fila 1: Nom del Concepte / Servei i Accions */}
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase border border-indigo-200">
                                  Línia #{indexLinia + 1}
                                </span>
                                <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Concepte / Descripció del Servei *</label>
                              </div>
                              <input 
                                type="text" 
                                value={l.nom} 
                                onChange={e => actualitzarLinia(l.id, 'nom', e.target.value)}
                                placeholder="Ex: Manteniment mensual, Assessorament tècnic, Subministrament..."
                                className="font-extrabold text-base sm:text-lg text-slate-900 border-slate-300 focus:border-indigo-500 py-3 px-4 rounded-xl w-full"
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

                          {/* Fila 2: Descripció Addicional (Super Ampla) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Detalls Addicionals de la Factura (Opcional)</label>
                            <input 
                              type="text" 
                              value={l.descripcio || ''} 
                              onChange={e => actualitzarLinia(l.id, 'descripcio', e.target.value)}
                              placeholder="Detalls addicionals, període de prestació, referència..."
                              className="text-sm text-slate-800 border-slate-300 focus:border-indigo-500 py-2.5 px-4 rounded-xl w-full bg-slate-50/50"
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
                                className="text-center font-black text-xl py-3 px-3 bg-indigo-50 border-2 border-indigo-400 focus:border-indigo-600 text-indigo-950 rounded-xl shadow-inner w-full mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-extrabold uppercase text-slate-700">Preu Unitari (€)</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                value={l.preuUnitari} 
                                onChange={e => actualitzarLinia(l.id, 'preuUnitari', parseFloat(e.target.value) || 0)}
                                className="text-right font-extrabold text-lg py-3 px-3 border-2 border-slate-300 focus:border-indigo-500 rounded-xl w-full mt-1 text-slate-900"
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

                            <div className="col-span-2 sm:col-span-1 text-right bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">Subtotal Línia</span>
                              <span className="text-xl font-black text-indigo-700 block mt-0.5">{formatEuro(subtotalLinia)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Totals i Resum Final */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Notes i Instruccions de Pagament</label>
                  <textarea 
                    rows={4} 
                    value={facturaActual.notes || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, notes: e.target.value })}
                    placeholder="Número de compte bancari IBAN, dades de transferència..."
                    className="bg-white border-slate-300 text-sm mt-1"
                  />
                </div>
                <div className="space-y-3 justify-self-end w-full max-w-sm text-sm bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Base Imponible Totals:</span>
                    <span className="font-bold text-slate-900">{formatEuro(facturaActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Quota d'IVA Total:</span>
                    <span className="font-bold text-slate-900">{formatEuro(facturaActual.totalIva || 0)}</span>
                  </div>
                  {(facturaActual.irpfPercent || 0) > 0 && (
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Retenció IRPF (-{facturaActual.irpfPercent}%):</span>
                      <span className="font-bold">-{formatEuro(facturaActual.totalIrpf || 0)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-200 pt-3 flex justify-between font-extrabold text-xl">
                    <span className="text-slate-900">TOTAL FACTURA:</span>
                    <span className="text-indigo-600">{formatEuro(facturaActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary font-bold px-6 py-3">
                  Descartar Canvis
                </button>
                <button type="submit" className="btn btn-primary font-extrabold px-8 py-3 text-base shadow-lg bg-indigo-600 hover:bg-indigo-700">
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
    </div>
  );
};
