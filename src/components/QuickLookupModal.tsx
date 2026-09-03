import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Users, Barcode } from 'lucide-react';
import type { Article, Client } from '../types';

interface QuickLookupModalProps {
  type: 'articles' | 'clients';
  articles?: Article[];
  clients?: Client[];
  onSelectArticle?: (article: Article) => void;
  onSelectClient?: (client: Client) => void;
  onClose: () => void;
}

export const QuickLookupModal: React.FC<QuickLookupModalProps> = ({
  type,
  articles = [],
  clients = [],
  onSelectArticle,
  onSelectClient,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const esArticles = type === 'articles';

  const articlesFiltrats = articles.filter(a => 
    a.codi.toLowerCase().includes(query.toLowerCase()) ||
    a.nom.toLowerCase().includes(query.toLowerCase()) ||
    (a.codiBarras && a.codiBarras.includes(query)) ||
    a.descripcio.toLowerCase().includes(query.toLowerCase())
  );

  const clientsFiltrats = clients.filter(c => 
    c.nom.toLowerCase().includes(query.toLowerCase()) ||
    c.cifNif.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.telefon.includes(query)
  );

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl w-full p-0 bg-slate-900 overflow-hidden shadow-2xl rounded-2xl border border-slate-800 animate-fade-in">
        {/* Header Modal */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-sm">
            {esArticles ? <Package className="text-amber-400" size={18} /> : <Users className="text-sky-400" size={18} />}
            <span>Consulta Rápida de {esArticles ? 'Artigos & Catálogo' : 'Ficha de Clientes'} (PHC Lookup)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Input de Cerca Predictiva */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3.5 top-3 text-amber-400" />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={esArticles ? "Pesquise por código, código de barras ou descrição..." : "Pesquise por nome, NIF/CIF ou e-mail..."}
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none shadow-inner"
            />
          </div>
        </div>

        {/* Llista de Resultats Predictius */}
        <div className="max-h-96 overflow-y-auto p-2 bg-slate-900 divide-y divide-slate-800/80">
          {esArticles ? (
            articlesFiltrats.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">Nenhum artigo encontrado para a pesquisa.</p>
            ) : (
              articlesFiltrats.map(art => (
                <div 
                  key={art.id}
                  onClick={() => {
                    if (onSelectArticle) onSelectArticle(art);
                    onClose();
                  }}
                  className="p-3 hover:bg-slate-800/90 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    {art.imatgeUrl ? (
                      <img src={art.imatgeUrl} alt={art.nom} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-slate-700 text-xs">
                        {art.codi}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                          {art.codi}
                        </span>
                        {art.codiBarras && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Barcode size={12} /> {art.codiBarras}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-white mt-1 group-hover:text-amber-300">{art.nom}</h4>
                      {art.descripcio && <p className="text-[11px] text-slate-400 truncate max-w-md">{art.descripcio}</p>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-white block">{formatEuro(art.preuUnitari)}</span>
                    <span className="text-[10px] font-bold text-slate-400">IVA: {art.ivaPercent}%</span>
                  </div>
                </div>
              ))
            )
          ) : (
            clientsFiltrats.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">Nenhum cliente encontrado para a pesquisa.</p>
            ) : (
              clientsFiltrats.map(cli => (
                <div 
                  key={cli.id}
                  onClick={() => {
                    if (onSelectClient) onSelectClient(cli);
                    onClose();
                  }}
                  className="p-3 hover:bg-slate-800/90 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-sky-300">{cli.nom}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIF/CIF: <span className="font-semibold text-slate-300">{cli.cifNif}</span></p>
                    <p className="text-[10px] text-slate-500">{cli.adreca}, {cli.poblacio}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-sky-400 font-semibold block">{cli.telefon}</span>
                    <span className="text-[10px] text-slate-400 block">{cli.email}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
