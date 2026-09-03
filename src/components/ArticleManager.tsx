import React, { useState } from 'react';
import { Package, Plus, Search, Edit3, Trash2, Image, Upload, X, Tag } from 'lucide-react';
import type { Article, TipusIVA, UnitatMesura } from '../types';

interface ArticleManagerProps {
  articles: Article[];
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  articles,
  onSaveArticle,
  onDeleteArticle
}) => {
  const [cerca, setCerca] = useState('');
  const [sectorFiltre, setSectorFiltre] = useState<string>('tots');
  const [modalObert, setModalObert] = useState(false);
  const [articleActual, setArticleActual] = useState<Partial<Article>>({});

  const sectorsDisponibles = Array.from(
    new Set(articles.map(a => a.sectorPerDefecte).filter(Boolean))
  );

  const articlesFiltrats = articles.filter(a => {
    const coincideixCerca = 
      a.nom.toLowerCase().includes(cerca.toLowerCase()) ||
      a.codi.toLowerCase().includes(cerca.toLowerCase()) ||
      a.descripcio.toLowerCase().includes(cerca.toLowerCase());
    
    const coincideixSector = sectorFiltre === 'tots' || a.sectorPerDefecte === sectorFiltre;
    return coincideixCerca && coincideixSector;
  });

  const obrirModalCrear = () => {
    setArticleActual({
      id: 'art-' + Date.now(),
      codi: 'ART-' + Math.floor(100 + Math.random() * 900),
      nom: '',
      descripcio: '',
      preuUnitari: 0,
      ivaPercent: 21,
      unitat: 'unitats',
      imatgeUrl: '',
      sectorPerDefecte: 'Generals',
      estat: 'actiu',
      dataCreacio: new Date().toISOString().split('T')[0]
    });
    setModalObert(true);
  };

  const obrirModalEditar = (art: Article) => {
    setArticleActual({ ...art });
    setModalObert(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imatge és massa gran. Màxim 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleActual(prev => ({ ...prev, imatgeUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleActual.nom || !articleActual.codi) {
      alert('Si us plau, omple el Nom i el Codi de l\'article.');
      return;
    }
    onSaveArticle(articleActual as Article);
    setModalObert(false);
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Package className="text-indigo-400" /> Catàleg d'Articles i Imatges
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Gestió de productes, serveis, fotogaleria i preus de referència.</p>
        </div>
        <button onClick={obrirModalCrear} className="btn btn-primary">
          <Plus size={18} /> Afegir Nou Article
        </button>
      </div>

      {/* Cerca i Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Cercar article per nom, codi o descripció..." 
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={sectorFiltre} 
            onChange={(e) => setSectorFiltre(e.target.value)}
            className="w-full"
          >
            <option value="tots">Tots els sectors</option>
            {sectorsDisponibles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Graella d'Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesFiltrats.length === 0 ? (
          <div className="col-span-full card text-center py-12 text-[var(--text-muted)]">
            No s'ha trobat cap article amb aquests filtres.
          </div>
        ) : (
          articlesFiltrats.map((art) => (
            <div key={art.id} className="card card-interactive flex flex-col justify-between overflow-hidden">
              <div>
                {/* Visualització d'Imatge */}
                <div className="relative h-44 -mx-6 -mt-6 mb-4 bg-slate-900 flex items-center justify-center border-b border-[var(--border)] overflow-hidden">
                  {art.imatgeUrl ? (
                    <img 
                      src={art.imatgeUrl} 
                      alt={art.nom} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Image size={36} />
                      <span className="text-xs font-semibold">Sense Imatge</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-950/80 text-sky-400 backdrop-blur-md border border-sky-500/30">
                      {art.codi}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-950/80 text-amber-400 backdrop-blur-md border border-amber-500/30">
                      IVA {art.ivaPercent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg leading-snug">{art.nom}</h3>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-sky-400">{formatEuro(art.preuUnitari)}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">per {art.unitat}</div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {art.descripcio || 'Sense descripció.'}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs">
                    <Tag size={14} className="text-indigo-400" />
                    <span className="text-[var(--text-muted)] font-medium">Sector:</span>
                    <span className="font-semibold text-[var(--text-main)]">{art.sectorPerDefecte}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
                <button 
                  onClick={() => obrirModalEditar(art)}
                  className="btn btn-secondary btn-sm text-sky-400 hover:bg-sky-500/10"
                >
                  <Edit3 size={15} /> Editar
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Vols eliminar l'article "${art.nom}"?`)) {
                      onDeleteArticle(art.id);
                    }
                  }}
                  className="btn btn-secondary btn-sm text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 size={15} /> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Creació / Edició d'Article */}
      {modalObert && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-xl font-bold">
                {articleActual.id && articles.some(a => a.id === articleActual.id) ? 'Editar Article' : 'Afegir Nou Article'}
              </h3>
              <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              {/* Imatge Upload Preview */}
              <div>
                <label>Imatge de l'Article</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden bg-[var(--bg-app)] shrink-0 relative">
                    {articleActual.imatgeUrl ? (
                      <>
                        <img src={articleActual.imatgeUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setArticleActual({ ...articleActual, imatgeUrl: '' })}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-xs shadow-md"
                          title="Eliminar imatge"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <Image size={28} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      id="article-img-input" 
                    />
                    <label 
                      htmlFor="article-img-input" 
                      className="btn btn-secondary cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload size={16} /> Carregar Imatge
                    </label>
                    <p className="text-xs text-[var(--text-muted)] mt-1">S'accepten fitxers JPG, PNG, WEBP o SVG (Màx 5MB).</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Codi de l'Article *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: ELE-001" 
                    value={articleActual.codi || ''} 
                    onChange={e => setArticleActual({ ...articleActual, codi: e.target.value })}
                  />
                </div>
                <div>
                  <label>Nom de l'Article / Servei *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Quadre Elèctric CGP" 
                    value={articleActual.nom || ''} 
                    onChange={e => setArticleActual({ ...articleActual, nom: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label>Descripció Tècnica</label>
                <textarea 
                  rows={3} 
                  placeholder="Detalls sobre el material, especificacions, garantia..."
                  value={articleActual.descripcio || ''} 
                  onChange={e => setArticleActual({ ...articleActual, descripcio: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label>Preu Unitari (€) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00" 
                    value={articleActual.preuUnitari ?? 0} 
                    onChange={e => setArticleActual({ ...articleActual, preuUnitari: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label>Tipus d'IVA (%)</label>
                  <select 
                    value={articleActual.ivaPercent ?? 21}
                    onChange={e => setArticleActual({ ...articleActual, ivaPercent: Number(e.target.value) as TipusIVA })}
                  >
                    <option value={21}>21% (General)</option>
                    <option value={10}>10% (Reduït)</option>
                    <option value={4}>4% (Superreduït)</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
                <div>
                  <label>Unitat de Mesura</label>
                  <select 
                    value={articleActual.unitat ?? 'unitats'}
                    onChange={e => setArticleActual({ ...articleActual, unitat: e.target.value as UnitatMesura })}
                  >
                    <option value="unitats">Unitats (ud)</option>
                    <option value="hores">Hores (h)</option>
                    <option value="m²">Metres quadrats (m²)</option>
                    <option value="m">Metres (m)</option>
                    <option value="kg">Quilograms (kg)</option>
                    <option value="pack">Pack / Paquet</option>
                    <option value="global">Treball Global</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Sector / Secció per Defecte</label>
                <input 
                  type="text" 
                  placeholder="Ex: Fusteria, Electricitat, Pintura, Demolició..." 
                  value={articleActual.sectorPerDefecte || ''} 
                  onChange={e => setArticleActual({ ...articleActual, sectorPerDefecte: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary">
                  Cancel·lar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
