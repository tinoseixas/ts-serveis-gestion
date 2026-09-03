import type { Empresa, Client, Article, Pressupost, Factura } from '../types';

export const empresaInicial: Empresa = {
  nom: 'TS SERVEIS I GESTIÓ S.L.',
  nif: 'B-67890123',
  adreca: 'Av. Diagonal 450, Principal 2a',
  poblacio: 'Barcelona',
  codiPostal: '08006',
  provincia: 'Barcelona',
  telefon: '+34 934 123 456',
  email: 'info@tsserveisgestio.cat',
  web: 'www.tsserveisgestio.cat',
  iban: 'ES66 2100 0418 4012 3456 7890',
  banc: 'CaixaBank',
  peuPagina: "Inscrita al Registre Mercantil de Barcelona, Volum 45210, Foli 112. D'acord amb el RGPD 2016/679, les seves dades personals són tractades amb màxima confidencialitat.",
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect width="160" height="60" rx="10" fill="%231e293b"/><text x="20" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="%2338bdf8">TS</text><text x="60" y="32" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="%23f8fafc">SERVEIS</text><text x="60" y="46" font-family="system-ui, sans-serif" font-weight="500" font-size="11" fill="%2394a3b8">i GESTIÓ</text></svg>'
};

// Imatges d'exemple en Data URL SVG per garantir visualització immediata i 100% offline
const imgFusteria = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%2378350f"/><path d="M20 30 h160 v90 h-160 z" fill="%2392400e" stroke="%23f59e0b" stroke-width="4"/><line x1="20" y1="60" x2="180" y2="60" stroke="%23d97706" stroke-width="2"/><line x1="20" y1="90" x2="180" y2="90" stroke="%23d97706" stroke-width="2"/><text x="100" y="135" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23fef3c7" font-weight="bold">Fusteria & Acabats</text></svg>';

const imgElectricitat = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%230f172a"/><circle cx="100" cy="65" r="35" fill="%23f59e0b" opacity="0.2"/><path d="M105 25 L80 70 H105 L95 115 L125 60 H100 Z" fill="%23fbbf24"/><text x="100" y="138" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23fef3c7" font-weight="bold">Quadre Elèctric</text></svg>';

const imgPintura = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%230284c7"/><rect x="40" y="30" width="120" height="35" rx="8" fill="%23e0f2fe"/><rect x="92" y="65" width="16" height="50" rx="4" fill="%2338bdf8"/><text x="100" y="135" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23f0f9ff" font-weight="bold">Pintura Plàstica Premium</text></svg>';

const imgFontaneria = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23111827"/><path d="M40 75 H120 V100 H140 V50 H160" fill="none" stroke="%2338bdf8" stroke-width="12" stroke-linecap="round"/><circle cx="40" cy="75" r="10" fill="%2360a5fa"/><text x="100" y="135" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23e0f2fe" font-weight="bold">Aixeteria i Conductes</text></svg>';

export const clientsInicials: Client[] = [
  {
    id: 'cli-001',
    nom: 'Construccions i Reformes Comas S.L.',
    cifNif: 'B-65432109',
    adreca: 'Carrer de Mallorca 234',
    poblacio: 'Barcelona',
    codiPostal: '08008',
    provincia: 'Barcelona',
    telefon: '+34 932 998 877',
    email: 'contacte@comasreformes.cat',
    notes: 'Client habitual per a obres de reforma integral de pisos i locals.',
    dataCreacio: '2026-01-15'
  },
  {
    id: 'cli-002',
    nom: 'Immobiliària Maresme Mar S.L.',
    cifNif: 'B-61122334',
    adreca: 'Passeig Marítim 45',
    poblacio: 'Mataró',
    codiPostal: '08301',
    provincia: 'Barcelona',
    telefon: '+34 937 445 566',
    email: 'administració@maresmemar.cat',
    notes: 'Manteniment de comunitats de veïns.',
    dataCreacio: '2026-02-01'
  },
  {
    id: 'cli-003',
    nom: 'Jordi Soler i Font',
    cifNif: '46789123K',
    adreca: 'Carrer Major 12',
    poblacio: 'Girona',
    codiPostal: '17001',
    provincia: 'Girona',
    telefon: '+34 655 443 211',
    email: 'jordi.soler@email.cat',
    notes: 'Client particular - Reforma de cuina i bany.',
    dataCreacio: '2026-02-18'
  }
];

export const articlesInicials: Article[] = [
  {
    id: 'art-001',
    codi: 'ELE-001',
    nom: 'Quadre Elèctric General de Protecció (CGP)',
    descripcio: 'Suministrament i instal·lació de quadre de comandament i protecció automàtica segons normativa REBT amb diferencials i IGA.',
    preuUnitari: 450.00,
    ivaPercent: 21,
    unitat: 'unitats',
    imatgeUrl: imgElectricitat,
    sectorPerDefecte: 'Instal·lació Elèctrica',
    estat: 'actiu',
    dataCreacio: '2026-01-10'
  },
  {
    id: 'art-002',
    codi: 'FUS-001',
    nom: 'Porta d\'Entrada de Fusta de Roure Macís',
    descripcio: 'Porta blindada de roure acabat satinat amb pany de seguretat de 3 punts, frontisses antipalanca i maneta d\'acer inoxidable.',
    preuUnitari: 850.00,
    ivaPercent: 21,
    unitat: 'unitats',
    imatgeUrl: imgFusteria,
    sectorPerDefecte: 'Fusteria i Acabats',
    estat: 'actiu',
    dataCreacio: '2026-01-12'
  },
  {
    id: 'art-003',
    codi: 'PIN-001',
    nom: 'Pintura Plàstica Lavable Interior (m²)',
    descripcio: 'Preparació de superfícies, plastejat de fissures, capa d\'imprimació i 2 mans de pintura plàstica de primera qualitat (color a escollir).',
    preuUnitari: 14.50,
    ivaPercent: 21,
    unitat: 'm²',
    imatgeUrl: imgPintura,
    sectorPerDefecte: 'Pintura i Revestiments',
    estat: 'actiu',
    dataCreacio: '2026-01-15'
  },
  {
    id: 'art-004',
    codi: 'FON-001',
    nom: 'Instal·lació de Bateria de Mitjanes d\'Aigua',
    descripcio: 'Canvi de xarxa d\'aigua freda i calenta amb tub Multicapa i aixeteria monocomandament d\'alta eficiència.',
    preuUnitari: 620.00,
    ivaPercent: 21,
    unitat: 'global',
    imatgeUrl: imgFontaneria,
    sectorPerDefecte: 'Fontaneria i Sanitaris',
    estat: 'actiu',
    dataCreacio: '2026-01-20'
  },
  {
    id: 'art-005',
    codi: 'MO-001',
    nom: 'Mà d\'Obra Oficial 1a Especialista',
    descripcio: 'Hora de treball d\'oficial de primera qualificat en rehabilitació i reformes.',
    preuUnitari: 32.00,
    ivaPercent: 21,
    unitat: 'hores',
    sectorPerDefecte: 'Generals',
    estat: 'actiu',
    dataCreacio: '2026-01-01'
  }
];

export const pressupostosInicials: Pressupost[] = [
  {
    id: 'pres-001',
    numero: 'PRES-2026/001',
    clientId: 'cli-001',
    clientNom: 'Construccions i Reformes Comas S.L.',
    clientNif: 'B-65432109',
    clientAdreca: 'Carrer de Mallorca 234, Barcelona',
    clientPoblacio: 'Barcelona',
    clientCodiPostal: '08008',
    clientEmail: 'contacte@comasreformes.cat',
    clientTelefon: '+34 932 998 877',
    data: '2026-02-20',
    validesaFins: '2026-03-20',
    estat: 'acceptat',
    sectors: [
      { id: 'sec-01', nom: 'Sector 1: Instal·lació Elèctrica i Domòtica', ordre: 1 },
      { id: 'sec-02', nom: 'Sector 2: Fusteria i Portes', ordre: 2 },
      { id: 'sec-03', nom: 'Sector 3: Pintura i Acabats Generals', ordre: 3 }
    ],
    linies: [
      {
        id: 'lin-001',
        articleId: 'art-001',
        codi: 'ELE-001',
        nom: 'Quadre Elèctric General de Protecció (CGP)',
        descripcio: 'Instal·lació de quadre de comandament amb diferencial superimmunitzat.',
        imatgeUrl: imgElectricitat,
        quantitat: 1,
        preuUnitari: 450.00,
        descomptePercent: 5,
        ivaPercent: 21,
        sectorId: 'sec-01'
      },
      {
        id: 'lin-002',
        articleId: 'art-005',
        codi: 'MO-001',
        nom: 'Mà d\'Obra Elèctrica Especialitzada',
        descripcio: 'Pastat de regates i cablejat d\'habitatge complet.',
        quantitat: 16,
        preuUnitari: 32.00,
        descomptePercent: 0,
        ivaPercent: 21,
        sectorId: 'sec-01'
      },
      {
        id: 'lin-003',
        articleId: 'art-002',
        codi: 'FUS-001',
        nom: 'Porta d\'Entrada de Fusta de Roure Macís',
        descripcio: 'Porta blindada amb acabats de luxe.',
        imatgeUrl: imgFusteria,
        quantitat: 2,
        preuUnitari: 850.00,
        descomptePercent: 10,
        ivaPercent: 21,
        sectorId: 'sec-02'
      },
      {
        id: 'lin-004',
        articleId: 'art-003',
        codi: 'PIN-001',
        nom: 'Pintura Plàstica Lavable Interior (m²)',
        descripcio: 'Color blanc mat satinat sobre parets llises.',
        imatgeUrl: imgPintura,
        quantitat: 180,
        preuUnitari: 14.50,
        descomptePercent: 0,
        ivaPercent: 21,
        sectorId: 'sec-03'
      }
    ],
    incloureImatgesPDF: true,
    notes: 'Els treballs començaran en un termini de 5 dies hàbils des de la signatura de conformitat. Garantia de 2 anys en totes les instal·lacions.',
    subtotal: 5067.50,
    totalIva: 1064.18,
    total: 6131.68,
    dataCreacio: '2026-02-20'
  }
];

export const facturesInicials: Factura[] = [
  {
    id: 'fac-001',
    numero: 'F-2026/001',
    pressupostId: 'pres-001',
    clientId: 'cli-001',
    clientNom: 'Construccions i Reformes Comas S.L.',
    clientNif: 'B-65432109',
    clientAdreca: 'Carrer de Mallorca 234, Barcelona',
    clientPoblacio: 'Barcelona',
    clientCodiPostal: '08008',
    clientEmail: 'contacte@comasreformes.cat',
    clientTelefon: '+34 932 998 877',
    data: '2026-02-28',
    dataVenciment: '2026-03-30',
    estat: 'pagada',
    formaPagament: 'transferencia',
    linies: [
      {
        id: 'lin-f01',
        articleId: 'art-001',
        codi: 'ELE-001',
        nom: 'Quadre Elèctric General de Protecció (CGP)',
        descripcio: 'Instal·lació de quadre de comandament amb diferencial superimmunitzat.',
        quantitat: 1,
        preuUnitari: 450.00,
        descomptePercent: 5,
        ivaPercent: 21,
        sectorId: 'sec-01'
      },
      {
        id: 'lin-f02',
        articleId: 'art-002',
        codi: 'FUS-001',
        nom: 'Porta d\'Entrada de Fusta de Roure Macís',
        descripcio: 'Porta blindada amb acabats de luxe.',
        quantitat: 2,
        preuUnitari: 850.00,
        descomptePercent: 10,
        ivaPercent: 21,
        sectorId: 'sec-02'
      }
    ],
    subtotal: 1957.50,
    totalIva: 411.08,
    irpfPercent: 0,
    totalIrpf: 0,
    total: 2368.58,
    notes: 'Pagament efectuat mitjançant transferència bancària a CaixaBank. Moltes gràcies per la seva confiança.',
    dataCreacio: '2026-02-28'
  }
];
