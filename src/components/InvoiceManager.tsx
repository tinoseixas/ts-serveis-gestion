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
        <div className="modal-overlay">
          <div className="modal-content max-w-[1250px] w-full p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-indigo-400" />
                {facturaActual.numero ? `Editar Factura (${facturaActual.numero})` : 'Nova Factura'}
              </h3>
              <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border)]">
                <div>
                  <label>Client *</label>
                  <select 
                    value={facturaActual.clientId || ''}
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
                  <label>Data d'Emissió</label>
                  <input 
                    type="date" 
                    value={facturaActual.data || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, data: e.target.value })}
                  />
                </div>
                <div>
                  <label>Data de Venciment</label>
                  <input 
                    type="date" 
                    value={facturaActual.dataVenciment || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, dataVenciment: e.target.value })}
                  />
                </div>
                <div>
                  <label>Estat de Pagament</label>
                  <select 
                    value={facturaActual.estat || 'pendent'}
                    onChange={e => setFacturaActual({ ...facturaActual, estat: e.target.value as EstatFactura })}
                  >
                    <option value="pendent">Pendent de pagament</option>
                    <option value="pagada">Pagada (Cobrada)</option>
                    <option value="vencuda">Vencuda</option>
                    <option value="anul.lada">Anul·lada</option>
                  </select>
                </div>
                <div>
                  <label>Forma de Pagament</label>
                  <select 
                    value={facturaActual.formaPagament || 'transferencia'}
                    onChange={e => setFacturaActual({ ...facturaActual, formaPagament: e.target.value as FormaPagament })}
                  >
                    <option value="transferencia">Transferència Bancària</option>
                    <option value="efectiu">Efectiu</option>
                    <option value="domiciliacio">Domiciliació Bancària</option>
                    <option value="targeta">Targeta de Crèdit</option>
                  </select>
                </div>
                <div>
                  <label>Retenció IRPF (%)</label>
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
                  />
                </div>
              </div>

              {/* Línies de la Factura */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base">Conceptes de la Factura</h4>
                  <div className="flex items-center gap-2">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const art = articles.find(a => a.id === e.target.value);
                          afegirLinia(art);
                          e.target.value = '';
                        }
                      }}
                      className="text-xs py-1"
                    >
                      <option value="">+ Carregar des del Catàleg</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.id}>{a.nom} ({formatEuro(a.preuUnitari)})</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => afegirLinia()} className="btn btn-secondary btn-sm">
                      + Concepte Manual
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="min-w-[850px]">
                    <thead>
                      <tr>
                        <th className="min-w-[220px]">Concepte / Descripció</th>
                        <th className="w-36 text-center">Quantitat</th>
                        <th className="w-40 text-right">Preu U. (€)</th>
                        <th className="w-32 text-right">Desc. %</th>
                        <th className="w-32 text-center">IVA %</th>
                        <th className="w-36 text-right">Subtotal</th>
                        <th className="w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(facturaActual.linies || []).map((l) => {
                        const base = l.preuUnitari * l.quantitat;
                        const desc = (base * (l.descomptePercent || 0)) / 100;
                        const subtotalLinia = base - desc;

                        return (
                          <tr key={l.id}>
                            <td>
                              <input 
                                type="text" 
                                value={l.nom} 
                                onChange={e => actualitzarLinia(l.id, 'nom', e.target.value)}
                                placeholder="Descripció del servei o producte"
                                className="font-bold text-sm mb-1"
                              />
                              <input 
                                type="text" 
                                value={l.descripcio || ''} 
                                onChange={e => actualitzarLinia(l.id, 'descripcio', e.target.value)}
                                placeholder="Detalls addicionals..."
                                className="text-xs text-[var(--text-muted)]"
                              />
                            </td>
                            <td className="w-36">
                              <input 
                                type="number" 
                                step="any" 
                                value={l.quantitat} 
                                onChange={e => actualitzarLinia(l.id, 'quantitat', parseFloat(e.target.value) || 0)}
                                className="text-center font-extrabold text-base py-2 px-3 bg-sky-50 border-sky-300 focus:bg-white text-slate-900 shadow-sm"
                              />
                            </td>
                            <td className="w-40">
                              <input 
                                type="number" 
                                step="0.01" 
                                value={l.preuUnitari} 
                                onChange={e => actualitzarLinia(l.id, 'preuUnitari', parseFloat(e.target.value) || 0)}
                                className="text-right font-bold text-sm py-2 px-3"
                              />
                            </td>
                            <td className="w-32">
                              <input 
                                type="number" 
                                step="1" 
                                value={l.descomptePercent} 
                                onChange={e => actualitzarLinia(l.id, 'descomptePercent', parseFloat(e.target.value) || 0)}
                                className="text-right font-medium text-sm py-2 px-3"
                              />
                            </td>
                            <td className="w-32">
                              <select 
                                value={l.ivaPercent}
                                onChange={e => actualitzarLinia(l.id, 'ivaPercent', Number(e.target.value))}
                                className="text-sm py-2 text-center font-semibold"
                              >
                                <option value={21}>21%</option>
                                <option value={10}>10%</option>
                                <option value={4}>4%</option>
                                <option value={0}>0%</option>
                              </select>
                            </td>
                            <td className="text-right font-extrabold text-sm text-indigo-600">
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
              </div>

              {/* Totals de Factura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-app)] p-5 rounded-xl border border-[var(--border)]">
                <div>
                  <label>Notes & Informació Bancària</label>
                  <textarea 
                    rows={4} 
                    value={facturaActual.notes || ''} 
                    onChange={e => setFacturaActual({ ...facturaActual, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-3 justify-self-end w-full max-w-xs text-sm">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Base Imponible:</span>
                    <span className="font-semibold text-[var(--text-main)]">{formatEuro(facturaActual.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Quota IVA:</span>
                    <span className="font-semibold text-[var(--text-main)]">{formatEuro(facturaActual.totalIva || 0)}</span>
                  </div>
                  {(facturaActual.irpfPercent || 0) > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Retenció IRPF (-{facturaActual.irpfPercent}%):</span>
                      <span className="font-semibold">-{formatEuro(facturaActual.totalIrpf || 0)}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between font-extrabold text-lg">
                    <span>TOTAL FACTURA:</span>
                    <span className="text-indigo-400">{formatEuro(facturaActual.total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary">
                  Cancel·lar
                </button>
                <button type="submit" className="btn btn-primary">
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
