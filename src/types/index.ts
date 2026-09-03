export type TipusIVA = 21 | 10 | 4 | 0;

export type UnitatMesura = 'unitats' | 'hores' | 'm²' | 'm' | 'kg' | 'pack' | 'global';

export interface Empresa {
  nom: string;
  nif: string;
  adreca: string;
  poblacio: string;
  codiPostal: string;
  provincia: string;
  telefon: string;
  email: string;
  web?: string;
  logoUrl?: string;
  iban: string;
  banc: string;
  peuPagina?: string;
}

export interface Client {
  id: string;
  nom: string;
  cifNif: string;
  adreca: string;
  poblacio: string;
  codiPostal: string;
  provincia: string;
  telefon: string;
  email: string;
  notes?: string;
  dataCreacio: string;
}

export interface Article {
  id: string;
  codi: string;
  nom: string;
  descripcio: string;
  preuUnitari: number;
  ivaPercent: TipusIVA;
  unitat: UnitatMesura;
  imatgeUrl?: string;
  sectorPerDefecte: string;
  estat: 'actiu' | 'inactiu';
  dataCreacio: string;
}

export interface Sector {
  id: string;
  nom: string;
  descripcio?: string;
  ordre: number;
}

export interface LiniaItem {
  id: string;
  articleId?: string;
  codi: string;
  nom: string;
  descripcio: string;
  imatgeUrl?: string;
  quantitat: number;
  preuUnitari: number;
  descomptePercent: number;
  ivaPercent: TipusIVA;
  sectorId: string; // Enllaçat a Sector en els pressupostos
}

export type EstatPressupost = 'esborrany' | 'enviat' | 'acceptat' | 'rebutjat';

export interface Pressupost {
  id: string;
  numero: string; // Ex: PRES-2026/001
  clientId: string;
  clientNom: string;
  clientNif: string;
  clientAdreca: string;
  clientPoblacio?: string;
  clientCodiPostal?: string;
  clientEmail?: string;
  clientTelefon?: string;
  data: string;
  validesaFins: string;
  estat: EstatPressupost;
  sectors: Sector[];
  linies: LiniaItem[];
  incloureImatgesPDF: boolean;
  notes?: string;
  subtotal: number;
  totalIva: number;
  total: number;
  dataCreacio: string;
}

export type EstatFactura = 'pendent' | 'pagada' | 'vencuda' | 'anul.lada';

export type FormaPagament = 'transferencia' | 'efectiu' | 'domiciliacio' | 'targeta';

export interface Factura {
  id: string;
  numero: string; // Ex: F-2026/001
  pressupostId?: string; // Si prové d'un pressupost
  clientId: string;
  clientNom: string;
  clientNif: string;
  clientAdreca: string;
  clientPoblacio?: string;
  clientCodiPostal?: string;
  clientEmail?: string;
  clientTelefon?: string;
  data: string;
  dataVenciment: string;
  estat: EstatFactura;
  formaPagament: FormaPagament;
  linies: LiniaItem[];
  subtotal: number;
  totalIva: number;
  irpfPercent: number;
  totalIrpf: number;
  total: number;
  notes?: string;
  dataCreacio: string;
}
