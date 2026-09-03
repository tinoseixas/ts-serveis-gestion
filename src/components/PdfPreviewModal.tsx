import React, { useRef } from 'react';
import { Download, Printer, X } from 'lucide-react';
import type { Pressupost, Factura, Empresa } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfPreviewModalProps {
  document: Pressupost | Factura;
  tipus: 'pressupost' | 'factura';
  empresa: Empresa;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  document,
  tipus,
  empresa,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const esPressupost = tipus === 'pressupost';
  const pressupost = esPressupost ? (document as Pressupost) : null;
  const factura = !esPressupost ? (document as Factura) : null;

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${document.numero}.pdf`);
    } catch (e) {
      console.error('Error descarregant PDF:', e);
      alert('Hi ha hagut un problema generant el PDF. Et recomanem utilitzar l\'opció d\'Imprimir -> Guardar com a PDF.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl w-full p-0 bg-slate-900 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Actions Bar */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-white font-bold">
            <span>Visualització Prèvia PDF: {document.numero}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} className="btn btn-primary btn-sm">
              <Download size={16} /> Descarregar PDF
            </button>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={16} /> Imprimir / PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Content - A4 Styled Sheet */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div 
            ref={printRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div>
              {/* Header Empresa i Document */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-sky-600 pb-6 gap-6">
                <div>
                  {empresa.logoUrl ? (
                    <img src={empresa.logoUrl} alt={empresa.nom} className="h-14 object-contain mb-3" />
                  ) : (
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{empresa.nom}</h1>
                  )}
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800">{empresa.nom} — NIF: {empresa.nif}</p>
                    <p>{empresa.adreca}, {empresa.codiPostal} {empresa.poblacio} ({empresa.provincia})</p>
                    <p>Tel: {empresa.telefon} | Correu: {empresa.email}</p>
                    {empresa.web && <p>Web: {empresa.web}</p>}
                  </div>
                </div>

                <div className="text-right sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px]">
                  <span className="inline-block px-3 py-1 bg-sky-600 text-white font-extrabold text-xs tracking-widest uppercase rounded">
                    {esPressupost ? 'PRESSUPOST' : 'FACTURA'}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-2">{document.numero}</h2>
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    <p><span className="font-semibold">Data:</span> {document.data}</p>
                    {esPressupost && pressupost?.validesaFins && (
                      <p><span className="font-semibold">Vàlid fins:</span> {pressupost.validesaFins}</p>
                    )}
                    {!esPressupost && factura?.dataVenciment && (
                      <p><span className="font-semibold">Venciment:</span> {factura.dataVenciment}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dades del Client */}
              <div className="mt-6 p-4 bg-sky-50/50 rounded-xl border border-sky-100 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-sky-700 tracking-wider">Dades del Client</span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{document.clientNom}</h3>
                  <p className="text-xs text-slate-600 font-mono font-medium">NIF/CIF: {document.clientNif}</p>
                </div>
                <div className="text-xs text-slate-600">
                  {document.clientAdreca && <p>{document.clientAdreca}</p>}
                  {(document.clientCodiPostal || document.clientPoblacio) && (
                    <p>{document.clientCodiPostal} {document.clientPoblacio}</p>
                  )}
                  {document.clientTelefon && <p>Telèfon: {document.clientTelefon}</p>}
                  {document.clientEmail && <p>Email: {document.clientEmail}</p>}
                </div>
              </div>

              {/* Línies del Document organitzades per SECTORS en Pressupost */}
              <div className="mt-8 space-y-6">
                {esPressupost && pressupost?.sectors && pressupost.sectors.length > 0 ? (
                  pressupost.sectors.map((sec) => {
                    const liniesSector = document.linies.filter(l => l.sectorId === sec.id);
                    if (liniesSector.length === 0) return null;
                    const subtotalSector = liniesSector.reduce((acc, l) => {
                      const desc = (l.preuUnitari * l.quantitat * (l.descomptePercent || 0)) / 100;
                      return acc + (l.preuUnitari * l.quantitat - desc);
                    }, 0);

                    return (
                      <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Sector Header */}
                        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
                          <h4 className="font-extrabold text-sm tracking-wide">{sec.nom}</h4>
                          <span className="text-xs font-semibold text-sky-300">
                            Subtotal Sector: {formatEuro(subtotalSector)}
                          </span>
                        </div>

                        {/* Articles del Sector */}
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="p-3">Article / Descripció</th>
                              <th className="p-3 text-center">Quantitat</th>
                              <th className="p-3 text-right">Preu U.</th>
                              <th className="p-3 text-right">Desc %</th>
                              <th className="p-3 text-right">Total Base</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {liniesSector.map((item) => {
                              const base = item.preuUnitari * item.quantitat;
                              const desc = (base * (item.descomptePercent || 0)) / 100;
                              const totalBase = base - desc;

                              return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-3">
                                    <div className="flex items-start gap-3">
                                      {pressupost.incloureImatgesPDF && item.imatgeUrl && (
                                        <img 
                                          src={item.imatgeUrl} 
                                          alt={item.nom} 
                                          className="w-12 h-12 rounded object-cover border border-slate-300 shrink-0" 
                                        />
                                      )}
                                      <div>
                                        <span className="font-mono text-[10px] font-bold text-sky-700">{item.codi}</span>
                                        <div className="font-bold text-slate-900 text-xs">{item.nom}</div>
                                        {item.descripcio && (
                                          <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">{item.descripcio}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-semibold text-slate-800">{item.quantitat}</td>
                                  <td className="p-3 text-right font-medium text-slate-800">{formatEuro(item.preuUnitari)}</td>
                                  <td className="p-3 text-right text-slate-600">{item.descomptePercent ? `${item.descomptePercent}%` : '-'}</td>
                                  <td className="p-3 text-right font-bold text-slate-900">{formatEuro(totalBase)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  /* Taula estàndard si no hi ha sectors o és Factura */
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Article / concepte</th>
                          <th className="p-3 text-center">Quantitat</th>
                          <th className="p-3 text-right">Preu U.</th>
                          <th className="p-3 text-right">Desc %</th>
                          <th className="p-3 text-right">Total Base</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {document.linies.map((item) => {
                          const base = item.preuUnitari * item.quantitat;
                          const desc = (base * (item.descomptePercent || 0)) / 100;
                          const totalBase = base - desc;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <div>
                                  <span className="font-mono text-[10px] font-bold text-sky-700">{item.codi}</span>
                                  <div className="font-bold text-slate-900 text-xs">{item.nom}</div>
                                  {item.descripcio && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{item.descripcio}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center font-semibold text-slate-800">{item.quantitat}</td>
                              <td className="p-3 text-right font-medium text-slate-800">{formatEuro(item.preuUnitari)}</td>
                              <td className="p-3 text-right text-slate-600">{item.descomptePercent ? `${item.descomptePercent}%` : '-'}</td>
                              <td className="p-3 text-right font-bold text-slate-900">{formatEuro(totalBase)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Resum de Totals i Impostos */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
                <div className="flex-1 text-xs text-slate-600 space-y-3">
                  {!esPressupost && factura && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">Forma de Pagament:</span>
                      <p className="capitalize font-semibold text-sky-700">{factura.formaPagament}</p>
                      <p className="font-mono text-[11px] mt-0.5">IBAN: {empresa.iban} ({empresa.banc})</p>
                    </div>
                  )}

                  {document.notes && (
                    <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-900">
                      <span className="font-bold block mb-1">Observacions / Condicions:</span>
                      <p className="text-[11px] italic whitespace-pre-line">{document.notes}</p>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Base Imponible (Subtotal):</span>
                    <span className="font-semibold">{formatEuro(document.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>IVA (21%):</span>
                    <span className="font-semibold">{formatEuro(document.totalIva)}</span>
                  </div>
                  {!esPressupost && factura && factura.irpfPercent > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Retenció IRPF (-{factura.irpfPercent}%):</span>
                      <span className="font-semibold">-{formatEuro(factura.totalIrpf)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-2 mt-2 flex justify-between text-slate-900 text-sm font-extrabold">
                    <span>TOTAL DOCUMENT:</span>
                    <span className="text-sky-700">{formatEuro(document.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Legal */}
            <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              <p>{empresa.peuPagina || `${empresa.nom} — Tots els drets reservats.`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
