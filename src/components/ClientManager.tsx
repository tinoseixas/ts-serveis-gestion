import React, { useState } from 'react';
import { Users, Plus, Search, Edit3, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';
import type { Client } from '../types';

interface ClientManagerProps {
  clients: Client[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  onSaveClient,
  onDeleteClient
}) => {
  const [cerca, setCerca] = useState('');
  const [modalObert, setModalObert] = useState(false);
  const [clientActual, setClientActual] = useState<Partial<Client>>({});

  const clientsFiltrats = clients.filter(c => 
    c.nom.toLowerCase().includes(cerca.toLowerCase()) ||
    c.cifNif.toLowerCase().includes(cerca.toLowerCase()) ||
    c.email.toLowerCase().includes(cerca.toLowerCase()) ||
    c.poblacio.toLowerCase().includes(cerca.toLowerCase())
  );

  const obrirModalCrear = () => {
    setClientActual({
      id: 'cli-' + Date.now(),
      nom: '',
      cifNif: '',
      adreca: '',
      poblacio: '',
      codiPostal: '',
      provincia: 'Barcelona',
      telefon: '',
      email: '',
      notes: '',
      dataCreacio: new Date().toISOString().split('T')[0]
    });
    setModalObert(true);
  };

  const obrirModalEditar = (c: Client) => {
    setClientActual({ ...c });
    setModalObert(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientActual.nom || clientActual.nom.trim() === '') {
      alert('Si us plau, indica el Nom o Raó Social del client.');
      return;
    }
    onSaveClient(clientActual as Client);
    setModalObert(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Users className="text-sky-400" /> Directori de Clients
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Gestió de fitxes de clients, dades fiscals i de contacte.</p>
        </div>
        <button onClick={obrirModalCrear} className="btn btn-primary">
          <Plus size={18} /> Afegir Nou Client
        </button>
      </div>

      {/* Cerca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={18} />
        <input 
          type="text" 
          placeholder="Cercar client per nom, NIF, email o població..." 
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Graella de clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clientsFiltrats.length === 0 ? (
          <div className="col-span-full card text-center py-12 text-[var(--text-muted)]">
            No s'ha trobat cap client amb aquest filtre.
          </div>
        ) : (
          clientsFiltrats.map((c) => (
            <div key={c.id} className="card card-interactive flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg leading-snug">{c.nom}</h3>
                    <span className="inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-app)] text-sky-400 font-semibold border border-[var(--border)]">
                      NIF: {c.cifNif}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => obrirModalEditar(c)}
                      className="btn btn-secondary btn-icon text-sky-400 hover:bg-sky-500/10"
                      title="Editar client"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Estàs segur de voler eliminar el client "${c.nom}"?`)) {
                          onDeleteClient(c.id);
                        }
                      }}
                      className="btn btn-secondary btn-icon text-rose-400 hover:bg-rose-500/10"
                      title="Eliminar client"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
                  {c.adreca && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-sky-400 shrink-0" />
                      <span>{c.adreca}, {c.codiPostal} {c.poblacio} ({c.provincia})</span>
                    </div>
                  )}
                  {c.telefon && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-emerald-400 shrink-0" />
                      <span>{c.telefon}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-indigo-400 shrink-0" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="mt-3 text-xs italic bg-[var(--bg-app)] p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]">
                    "{c.notes}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Formulari Client */}
      {modalObert && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-xl font-bold">
                {clientActual.id && clients.some(c => c.id === clientActual.id) ? 'Editar Client' : 'Afegir Nou Client'}
              </h3>
              <button onClick={() => setModalObert(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Nom o Raó Social *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Construccions Comas S.L." 
                    value={clientActual.nom || ''} 
                    onChange={e => setClientActual({ ...clientActual, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label>CIF / NIF / DNI (opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: B-65432109" 
                    value={clientActual.cifNif || ''} 
                    onChange={e => setClientActual({ ...clientActual, cifNif: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label>Adreça Fiscal</label>
                <input 
                  type="text" 
                  placeholder="Ex: Carrer de Mallorca 234" 
                  value={clientActual.adreca || ''} 
                  onChange={e => setClientActual({ ...clientActual, adreca: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label>Població</label>
                  <input 
                    type="text" 
                    placeholder="Barcelona" 
                    value={clientActual.poblacio || ''} 
                    onChange={e => setClientActual({ ...clientActual, poblacio: e.target.value })}
                  />
                </div>
                <div>
                  <label>Codi Postal</label>
                  <input 
                    type="text" 
                    placeholder="08008" 
                    value={clientActual.codiPostal || ''} 
                    onChange={e => setClientActual({ ...clientActual, codiPostal: e.target.value })}
                  />
                </div>
                <div>
                  <label>Província</label>
                  <input 
                    type="text" 
                    placeholder="Barcelona" 
                    value={clientActual.provincia || ''} 
                    onChange={e => setClientActual({ ...clientActual, provincia: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Telèfon de Contacte</label>
                  <input 
                    type="text" 
                    placeholder="+34 932 998 877" 
                    value={clientActual.telefon || ''} 
                    onChange={e => setClientActual({ ...clientActual, telefon: e.target.value })}
                  />
                </div>
                <div>
                  <label>Correu Electrònic</label>
                  <input 
                    type="email" 
                    placeholder="contacte@client.cat" 
                    value={clientActual.email || ''} 
                    onChange={e => setClientActual({ ...clientActual, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label>Notes Internes</label>
                <textarea 
                  rows={3} 
                  placeholder="Anotacions especials sobre el client..."
                  value={clientActual.notes || ''} 
                  onChange={e => setClientActual({ ...clientActual, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setModalObert(false)} className="btn btn-secondary">
                  Cancel·lar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
