/**
 * Types TypeScript pour l'application Kofry
 * Espace personnel d'épargne par objectifs
 */

export type StatutCoffre = 'EN_COURS' | 'OBJECTIF_ATTEINT';

export interface Coffre {
  id: string;
  nom: string;
  description?: string;
  montantObjectif: number; // en FCFA
  soldeActuel: number; // en FCFA
  minimumQuotidien: number; // en FCFA, défini individuellement pour ce coffre
  dateCible?: string; // Format ISO YYYY-MM-DD
  statut: StatutCoffre;
  dateCreation: string;
  dateModification: string;
}

export type TypeTransaction = 'DEPOT' | 'RETRAIT';

export type StatutTransaction = 
  | 'EN_ATTENTE' 
  | 'INITIE' 
  | 'EN_TRAITEMENT' 
  | 'REUSSI' 
  | 'ECHOUE' 
  | 'ANNULE' 
  | 'EXPIRE';

export interface Transaction {
  id: string;
  referenceInterne: string; // Ex: DEP-20260909-XXXXXXXX ou RET-20260909-XXXXXXXX
  coffreId: string;
  coffreNom: string;
  type: TypeTransaction;
  montant: number; // en FCFA
  statut: StatutTransaction;
  idempotencyKey: string;
  modePaiement: 'MOBILE_MONEY';
  fournisseurRef?: string;
  numeroMobileMoney?: string;
  operateur?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE';
  motifEchec?: string;
  dateCreation: string;
  dateConfirmation?: string;
}

export type TypeJournal = 
  | 'CONNEXION'
  | 'DECONNEXION'
  | 'CREATION_COFFRE'
  | 'MODIFICATION_COFFRE'
  | 'DEPOT'
  | 'RETRAIT'
  | 'SUPPRESSION_COFFRE'
  | 'CHANGEMENT_MINIMUM'
  | 'CHANGEMENT_OBJECTIF'
  | 'CHANGEMENT_DATE'
  | 'OBJECTIF_ATTEINT';

export interface JournalEvent {
  id: string;
  type: TypeJournal;
  description: string;
  date: string;
  coffreId?: string;
  coffreNom?: string;
  montant?: number;
  details?: Record<string, unknown>;
}

export interface Proprietaire {
  nomComplet: string;
  identifiant: string;
  numeroMobileMoney: string;
  operateurDefaut: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE';
  derniereConnexion: string;
}
