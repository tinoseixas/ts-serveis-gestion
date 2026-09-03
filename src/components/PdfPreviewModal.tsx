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
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      // Marges de 10mm a cada costat
      const margin = 10;
      const printWidth = pdfWidth - (margin * 2); // 190mm
      const printHeight = (canvas.height * printWidth) / canvas.width;
      
      // Afegir imatge amb marges exactes de 10mm
      pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, Math.min(printHeight, pdfHeight - (margin * 2)));
      pdf.save(`${document.numero}.pdf`);
    } catch (e) {
      console.error('Error descarregant PDF:', e);
      alert('Error generant el PDF. Utilitza la botó d\'Imprimir -> Guardar com a PDF.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-5xl w-full p-0 bg-slate-900 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Barra d'Accions Superior */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between no-print shadow-md">
          <div className="flex items-center gap-3 text-white font-bold">
            <span className="text-amber-400">📄 Previsualització de Document PDF:</span>
            <span className="bg-slate-700 px-2.5 py-1 rounded text-xs text-slate-200">{document.numero}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPdf} className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5">
              <Download size={16} /> Descarregar PDF
            </button>
            <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg border border-slate-600 flex items-center gap-1.5">
              <Printer size={16} /> Imprimir / PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Fulla de Document A4 amb estil Executiu i Marges d'Edició Nítids */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div 
            id="pdf-print-area"
            ref={printRef}
            className="w-[210mm] max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-10 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between border border-slate-200"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            <div className="space-y-8">
              {/* Capçalera de l'Empresa i Bloc del Document */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 gap-6">
                <div className="space-y-2">
                  {empresa.logoUrl ? (
                    <img src={empresa.logoUrl} alt={empresa.nom} className="h-16 object-contain mb-2" />
                  ) : (
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{empresa.nom}</h1>
                  )}
                  <div className="text-xs text-slate-600 space-y-0.5 font-medium leading-relaxed">
                    <p className="font-bold text-slate-900 text-sm">{empresa.nom}</p>
                    <p>NIF/CIF: <span className="font-semibold text-slate-800">{empresa.nif || 'N/A'}</span></p>
                    <p>{empresa.adreca}, {empresa.codiPostal} {empresa.poblacio} ({empresa.provincia})</p>
                    <p>Tel: {empresa.telefon} | Email: {empresa.email}</p>
                    {empresa.web && <p>Web: {empresa.web}</p>}
                  </div>
                </div>

                <div className="text-right bg-slate-50 p-5 rounded-xl border border-slate-300 min-w-[220px] shadow-sm">
                  <span className={`inline-block px-3.5 py-1 text-white font-black text-xs tracking-widest uppercase rounded shadow-sm ${esPressupost ? 'bg-sky-600' : 'bg-indigo-700'}`}>
                    {esPressupost ? 'PRESSUPOST' : 'FACTURA COMERCIAL'}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{document.numero}</h2>
                  <div className="text-xs text-slate-700 mt-2 space-y-1 border-t border-slate-200 pt-2">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-slate-500">Data d'Emissió:</span>
                      <span className="font-bold text-slate-900">{document.data}</span>
                    </div>
                    {esPressupost && pressupost?.validesaFins && (
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-slate-500">Validesa Fins:</span>
                        <span className="font-bold text-slate-900">{pressupost.validesaFins}</span>
                      </div>
                    )}
                    {!esPressupost && factura?.dataVenciment && (
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-slate-500">Venciment:</span>
                        <span className="font-bold text-slate-900">{factura.dataVenciment}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dades de la Targeta del Client */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-300 flex flex-col sm:flex-row justify-between gap-6 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dades del Client / Receptor</span>
                  <h3 className="font-extrabold text-lg text-slate-900">{document.clientNom}</h3>
                  <p className="text-xs font-bold text-slate-700 font-mono">NIF / CIF: {document.clientNif || 'No especificat'}</p>
                </div>
                <div className="text-xs text-slate-700 space-y-0.5 font-medium sm:text-right">
                  {document.clientAdreca && <p className="font-semibold">{document.clientAdreca}</p>}
                  {(document.clientCodiPostal || document.clientPoblacio) && (
                    <p>{document.clientCodiPostal} {document.clientPoblacio}</p>
                  )}
                  {document.clientTelefon && <p>Telèfon: {document.clientTelefon}</p>}
                  {document.clientEmail && <p>Email: {document.clientEmail}</p>}
                </div>
              </div>

              {/* Taula de Línies organitzada per SECTORS en Pressupostos */}
              <div className="space-y-6">
                {esPressupost && pressupost?.sectors && pressupost.sectors.length > 0 ? (
                  pressupost.sectors.map((sec, secIdx) => {
                    const liniesSector = document.linies.filter(l => l.sectorId === sec.id);
                    if (liniesSector.length === 0) return null;
                    const subtotalSector = liniesSector.reduce((acc, l) => {
                      const desc = (l.preuUnitari * l.quantitat * (l.descomptePercent || 0)) / 100;
                      return acc + (l.preuUnitari * l.quantitat - desc);
                    }, 0);

                    return (
                      <div key={sec.id} className="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                        {/* Capçalera del Sector */}
                        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                          <h4 className="font-black text-xs uppercase tracking-wider">Sector #{secIdx + 1}: {sec.nom}</h4>
                          <span className="text-xs font-bold text-sky-300">
                            Subtotal Sector: {formatEuro(subtotalSector)}
                          </span>
                        </div>

                        {/* Taula d'Articles del Sector */}
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[10px] border-b border-slate-300">
                            <tr>
                              <th className="p-3 w-12 text-center">Línia</th>
                              <th className="p-3">Concepte i Descripció Tècnica</th>
                              <th className="p-3 text-center w-24">Quantitat</th>
                              <th className="p-3 text-right w-28">Preu U. (€)</th>
                              <th className="p-3 text-right w-20">Desc %</th>
                              <th className="p-3 text-right w-32">Total Base (€)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {liniesSector.map((item, itemIdx) => {
                              const base = item.preuUnitari * item.quantitat;
                              const desc = (base * (item.descomptePercent || 0)) / 100;
                              const totalBase = base - desc;

                              return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-3 text-center font-bold text-slate-500">{itemIdx + 1}</td>
                                  <td className="p-3">
                                    <div className="flex items-start gap-3">
                                      {pressupost.incloureImatgesPDF && item.imatgeUrl && (
                                        <img 
                                          src={item.imatgeUrl} 
                                          alt={item.nom} 
                                          className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0 shadow-sm" 
                                        />
                                      )}
                                      <div>
                                        {item.codi && <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">{item.codi}</span>}
                                        <div className="font-bold text-slate-900 text-xs mt-0.5">{item.nom}</div>
                                        {item.descripcio && (
                                          <p className="text-[11px] text-slate-600 mt-1 whitespace-pre-line leading-normal">{item.descripcio}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-extrabold text-slate-900">{item.quantitat}</td>
                                  <td className="p-3 text-right font-semibold text-slate-800">{formatEuro(item.preuUnitari)}</td>
                                  <td className="p-3 text-right text-slate-600 font-semibold">{item.descomptePercent ? `${item.descomptePercent}%` : '-'}</td>
                                  <td className="p-3 text-right font-black text-slate-900">{formatEuro(totalBase)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  /* Taula Estàndard sense sectors o per a Factura */
                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-800 text-white font-extrabold uppercase text-[10px]">
                        <tr>
                          <th className="p-3 w-12 text-center">Línia</th>
                          <th className="p-3">Concepte i Descripció de la Factura</th>
                          <th className="p-3 text-center w-24">Quantitat</th>
                          <th className="p-3 text-right w-28">Preu U. (€)</th>
                          <th className="p-3 text-right w-20">Desc %</th>
                          <th className="p-3 text-right w-32">Total Base (€)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {document.linies.map((item, itemIdx) => {
                          const base = item.preuUnitari * item.quantitat;
                          const desc = (base * (item.descomptePercent || 0)) / 100;
                          const totalBase = base - desc;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-3 text-center font-bold text-slate-500">{itemIdx + 1}</td>
                              <td className="p-3">
                                <div>
                                  {item.codi && <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">{item.codi}</span>}
                                  <div className="font-bold text-slate-900 text-xs mt-0.5">{item.nom}</div>
                                  {item.descripcio && (
                                    <p className="text-[11px] text-slate-600 mt-1 leading-normal">{item.descripcio}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center font-extrabold text-slate-900">{item.quantitat}</td>
                              <td className="p-3 text-right font-semibold text-slate-800">{formatEuro(item.preuUnitari)}</td>
                              <td className="p-3 text-right text-slate-600 font-semibold">{item.descomptePercent ? `${item.descomptePercent}%` : '-'}</td>
                              <td className="p-3 text-right font-black text-slate-900">{formatEuro(totalBase)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Resum de Totals i Observacions */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-slate-300 pt-6">
                <div className="flex-1 text-xs text-slate-700 space-y-3">
                  {!esPressupost && factura && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
                      <span className="font-extrabold text-slate-900 block mb-1 uppercase text-[10px] tracking-wider">Forma de Pagament & IBAN:</span>
                      <p className="capitalize font-extrabold text-indigo-700">{factura.formaPagament || 'Transferència Bancària'}</p>
                      <p className="font-mono text-[11px] mt-1 text-slate-800 font-bold">IBAN: {empresa.iban || 'ES00 0000 0000 0000 0000 0000'} ({empresa.banc || 'Banc'})</p>
                    </div>
                  )}

                  {document.notes && (
                    <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-300 text-amber-950">
                      <span className="font-extrabold block mb-1 uppercase text-[10px] tracking-wider text-amber-800">Observacions / Condicions del Document:</span>
                      <p className="text-[11px] font-medium italic whitespace-pre-line leading-relaxed">{document.notes}</p>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-80 space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-300 text-xs shadow-sm">
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Base Imponible (Subtotal):</span>
                    <span className="font-extrabold text-slate-900">{formatEuro(document.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Quota d'IVA Total (21%):</span>
                    <span className="font-extrabold text-slate-900">{formatEuro(document.totalIva)}</span>
                  </div>
                  {!esPressupost && factura && factura.irpfPercent > 0 && (
                    <div className="flex justify-between text-rose-700 font-semibold">
                      <span>Retenció IRPF (-{factura.irpfPercent}%):</span>
                      <span className="font-extrabold">-{formatEuro(factura.totalIrpf)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-3 mt-3 flex justify-between text-slate-900 text-base font-black">
                    <span>TOTAL DOCUMENT:</span>
                    <span className="text-sky-700">{formatEuro(document.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Legal al peu de la fulla */}
            <div className="mt-10 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-medium">
              <p>{empresa.peuPagina || `${empresa.nom} — Avinguda François Mitterrand 55, AD200 Encamp, Andorra. Tots els drets reservats.`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
