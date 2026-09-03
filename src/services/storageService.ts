import type { Empresa, Client, Article, Pressupost, Factura } from '../types';
import { empresaInicial, clientsInicials, articlesInicials, pressupostosInicials, facturesInicials } from '../data/mockData';

const KEYS = {
  EMPRESA: 'ts_gestio_empresa',
  CLIENTS: 'ts_gestio_clients',
  ARTICLES: 'ts_gestio_articles',
  PRESSUPOSTOS: 'ts_gestio_pressupostos',
  FACTURES: 'ts_gestio_factures',
  THEME: 'ts_gestio_theme'
};

export const storageService = {
  // Empresa
  getEmpresa: (): Empresa => {
    const data = localStorage.getItem(KEYS.EMPRESA);
    return data ? JSON.parse(data) : empresaInicial;
  },
  saveEmpresa: (empresa: Empresa): void => {
    localStorage.setItem(KEYS.EMPRESA, JSON.stringify(empresa));
  },

  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : clientsInicials;
  },
  saveClients: (clients: Client[]): void => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Articles
  getArticles: (): Article[] => {
    const data = localStorage.getItem(KEYS.ARTICLES);
    return data ? JSON.parse(data) : articlesInicials;
  },
  saveArticles: (articles: Article[]): void => {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
  },

  // Pressupostos
  getPressupostos: (): Pressupost[] => {
    const data = localStorage.getItem(KEYS.PRESSUPOSTOS);
    return data ? JSON.parse(data) : pressupostosInicials;
  },
  savePressupostos: (pressupostos: Pressupost[]): void => {
    localStorage.setItem(KEYS.PRESSUPOSTOS, JSON.stringify(pressupostos));
  },

  // Factures
  getFactures: (): Factura[] => {
    const data = localStorage.getItem(KEYS.FACTURES);
    return data ? JSON.parse(data) : facturesInicials;
  },
  saveFactures: (factures: Factura[]): void => {
    localStorage.setItem(KEYS.FACTURES, JSON.stringify(factures));
  },

  // Tema (Fosc / Clar)
  getTheme: (): 'dark' | 'light' => {
    return (localStorage.getItem(KEYS.THEME) as 'dark' | 'light') || 'dark';
  },
  saveTheme: (theme: 'dark' | 'light'): void => {
    localStorage.setItem(KEYS.THEME, theme);
  },

  // Exportar dades a fitxer JSON
  exportDataJSON: (): string => {
    const data = {
      empresa: storageService.getEmpresa(),
      clients: storageService.getClients(),
      articles: storageService.getArticles(),
      pressupostos: storageService.getPressupostos(),
      factures: storageService.getFactures(),
      dataExportacio: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  // Importar dades des de JSON
  importDataJSON: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.empresa) storageService.saveEmpresa(data.empresa);
      if (Array.isArray(data.clients)) storageService.saveClients(data.clients);
      if (Array.isArray(data.articles)) storageService.saveArticles(data.articles);
      if (Array.isArray(data.pressupostos)) storageService.savePressupostos(data.pressupostos);
      if (Array.isArray(data.factures)) storageService.saveFactures(data.factures);
      return true;
    } catch (e) {
      console.error('Error carregant JSON:', e);
      return false;
    }
  },

  // Restablir a dades inicials
  resetData: (): void => {
    localStorage.clear();
  }
};
