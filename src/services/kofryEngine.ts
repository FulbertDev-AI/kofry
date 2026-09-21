import { Coffre, Transaction, JournalEvent, Proprietaire } from '../types';

const STORAGE_KEYS = {
  COFFRES: 'kofry_coffres_v1',
  TRANSACTIONS: 'kofry_transactions_v1',
  JOURNAL: 'kofry_journal_v1',
  PROPRIETAIRE: 'kofry_proprietaire_v1',
  AUTH: 'kofry_auth_session_v1',
  IDEMPOTENCY_PROCESSED: 'kofry_idempotency_keys_v1',
};

const IDENTIFIANT_CONNEXION = 'kofry';
const MOT_DE_PASSE_CONNEXION = 'kofry2026';

// Formateur de devise FCFA avec séparateur de milliers
export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts} FCFA`;
}

// Formateur de date en français (ex: 15 octobre 2026)
export function formatDateFr(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Formateur de date/heure complète (ex: 09 septembre 2026 à 14:30)
export function formatDateTimeFr(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Générateur de référence interne unique (ex: DEP-20260909-8F3A9C12)
export function genererReference(type: 'DEP' | 'RET'): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${type}-${datePart}-${randPart}`;
}

// Données de démonstration initiales conformes au cahier des charges
const DEMO_COFFRES: Coffre[] = [
  {
    id: 'coffre-demo-1',
    nom: 'Achat Ordinateur',
    description: 'Poste de travail portable haute performance pour projets personnels.',
    montantObjectif: 350000,
    soldeActuel: 180000,
    minimumQuotidien: 2000,
    dateCible: '2026-10-15',
    statut: 'EN_COURS',
    dateCreation: '2026-08-01T09:00:00.000Z',
    dateModification: '2026-09-01T10:30:00.000Z',
  },
  {
    id: 'coffre-demo-2',
    nom: "Fonds d'urgence",
    description: "Réserve de sécurité personnelle en cas d'imprévu majeur.",
    montantObjectif: 1000000,
    soldeActuel: 450000,
    minimumQuotidien: 5000,
    dateCible: undefined,
    statut: 'EN_COURS',
    dateCreation: '2026-07-15T08:00:00.000Z',
    dateModification: '2026-09-05T14:15:00.000Z',
  },
  {
    id: 'coffre-demo-3',
    nom: 'Voyage',
    description: 'Séjour de découverte et repos pour les prochaines vacances.',
    montantObjectif: 500000,
    soldeActuel: 125000,
    minimumQuotidien: 3000,
    dateCible: '2026-12-20',
    statut: 'EN_COURS',
    dateCreation: '2026-08-10T11:00:00.000Z',
    dateModification: '2026-09-08T16:45:00.000Z',
  },
];

const DEMO_PROPRIETAIRE: Proprietaire = {
  nomComplet: 'Nanga',
  identifiant: 'kofry',
  numeroMobileMoney: '+225 07 89 45 12 30',
  operateurDefaut: 'ORANGE',
  derniereConnexion: '2026-09-09T08:15:00.000Z',
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-demo-1',
    referenceInterne: 'DEP-20260908-4B82A109',
    coffreId: 'coffre-demo-1',
    coffreNom: 'Achat Ordinateur',
    type: 'DEPOT',
    montant: 5000,
    statut: 'REUSSI',
    idempotencyKey: 'kofry:deposit:DEP-20260908-4B82A109',
    modePaiement: 'MOBILE_MONEY',
    fournisseurRef: 'OM_CI_9921471',
    numeroMobileMoney: '+225 07 89 45 12 30',
    operateur: 'ORANGE',
    dateCreation: '2026-09-08T10:14:00.000Z',
    dateConfirmation: '2026-09-08T10:14:22.000Z',
  },
  {
    id: 'tx-demo-2',
    referenceInterne: 'DEP-20260905-19EF874A',
    coffreId: 'coffre-demo-2',
    coffreNom: "Fonds d'urgence",
    type: 'DEPOT',
    montant: 10000,
    statut: 'REUSSI',
    idempotencyKey: 'kofry:deposit:DEP-20260905-19EF874A',
    modePaiement: 'MOBILE_MONEY',
    fournisseurRef: 'MTN_MOMO_817263',
    numeroMobileMoney: '+225 05 64 21 88 90',
    operateur: 'MTN',
    dateCreation: '2026-09-05T14:12:00.000Z',
    dateConfirmation: '2026-09-05T14:12:35.000Z',
  },
  {
    id: 'tx-demo-3',
    referenceInterne: 'RET-20260902-771DA9B0',
    coffreId: 'coffre-demo-2',
    coffreNom: "Fonds d'urgence",
    type: 'RETRAIT',
    montant: 25000,
    statut: 'REUSSI',
    idempotencyKey: 'kofry:withdrawal:RET-20260902-771DA9B0',
    modePaiement: 'MOBILE_MONEY',
    fournisseurRef: 'PAYOUT_OM_440192',
    numeroMobileMoney: '+225 07 89 45 12 30',
    operateur: 'ORANGE',
    dateCreation: '2026-09-02T16:30:00.000Z',
    dateConfirmation: '2026-09-02T16:31:05.000Z',
  },
];

const DEMO_JOURNAL: JournalEvent[] = [
  {
    id: 'jr-1',
    type: 'CONNEXION',
    description: 'Connexion sécurisée à votre espace Kofry',
    date: '2026-09-09T08:15:00.000Z',
  },
  {
    id: 'jr-2',
    type: 'DEPOT',
    description: 'Dépôt de 5 000 FCFA dans Achat Ordinateur',
    date: '2026-09-08T10:14:22.000Z',
    coffreId: 'coffre-demo-1',
    coffreNom: 'Achat Ordinateur',
    montant: 5000,
  },
  {
    id: 'jr-3',
    type: 'MODIFICATION_COFFRE',
    description: 'Modification du minimum quotidien — Achat Ordinateur : 2 000 FCFA',
    date: '2026-09-07T11:00:00.000Z',
    coffreId: 'coffre-demo-1',
    coffreNom: 'Achat Ordinateur',
  },
  {
    id: 'jr-4',
    type: 'DEPOT',
    description: "Dépôt de 10 000 FCFA dans Fonds d'urgence",
    date: '2026-09-05T14:12:35.000Z',
    coffreId: 'coffre-demo-2',
    coffreNom: "Fonds d'urgence",
    montant: 10000,
  },
  {
    id: 'jr-5',
    type: 'RETRAIT',
    description: "Retrait effectué de 25 000 FCFA depuis Fonds d'urgence (0 FCFA de frais)",
    date: '2026-09-02T16:31:05.000Z',
    coffreId: 'coffre-demo-2',
    coffreNom: "Fonds d'urgence",
    montant: 25000,
  },
  {
    id: 'jr-6',
    type: 'CREATION_COFFRE',
    description: 'Création du coffre Voyage (Objectif : 500 000 FCFA)',
    date: '2026-08-10T11:00:00.000Z',
    coffreId: 'coffre-demo-3',
    coffreNom: 'Voyage',
  },
];

export class KofryEngine {
  // Lecture / Écriture des coffres
  static getCoffres(): Coffre[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COFFRES);
    if (!raw) {
      this.saveCoffres(DEMO_COFFRES);
      return DEMO_COFFRES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_COFFRES;
    }
  }

  static saveCoffres(coffres: Coffre[]): void {
    localStorage.setItem(STORAGE_KEYS.COFFRES, JSON.stringify(coffres));
  }

  static getCoffre(id: string): Coffre | undefined {
    return this.getCoffres().find((c) => c.id === id);
  }

  // Transactions
  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      this.saveTransactions(DEMO_TRANSACTIONS);
      return DEMO_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_TRANSACTIONS;
    }
  }

  static saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  // Journal d'activité
  static getJournal(): JournalEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (!raw) {
      this.saveJournal(DEMO_JOURNAL);
      return DEMO_JOURNAL;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_JOURNAL;
    }
  }

  static saveJournal(events: JournalEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(events));
  }

  static ajouterJournal(event: Omit<JournalEvent, 'id' | 'date'>): JournalEvent {
    const events = this.getJournal();
    const newEvent: JournalEvent = {
      ...event,
      id: 'jr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      date: new Date().toISOString(),
    };
    events.unshift(newEvent);
    this.saveJournal(events);
    return newEvent;
  }

  // Propriétaire
  static getProprietaire(): Proprietaire {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPRIETAIRE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROPRIETAIRE, JSON.stringify(DEMO_PROPRIETAIRE));
      return DEMO_PROPRIETAIRE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_PROPRIETAIRE;
    }
  }

  static saveProprietaire(p: Proprietaire): void {
    localStorage.setItem(STORAGE_KEYS.PROPRIETAIRE, JSON.stringify(p));
  }

  // Session d'authentification privée
  static isConnecte(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  static connecter(identifiant: string, motDePasse: string): { succes: boolean; message: string } {
    const prop = this.getProprietaire();
    // Espace privé pour son propriétaire exclusif
    // Identifiant insensible à la casse et mot de passe défini
    if (
      identifiant.trim().toLowerCase() === IDENTIFIANT_CONNEXION &&
      motDePasse === MOT_DE_PASSE_CONNEXION
    ) {
      prop.identifiant = IDENTIFIANT_CONNEXION;
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      prop.derniereConnexion = new Date().toISOString();
      this.saveProprietaire(prop);
      this.ajouterJournal({
        type: 'CONNEXION',
        description: `Connexion sécurisée réussie pour le propriétaire ${prop.nomComplet}`,
      });
      return { succes: true, message: 'Connexion réussie.' };
    }
    return { 
      succes: false, 
      message: 'Identifiants invalides. Cet espace est privé et réservé à son propriétaire.' 
    };
  }

  static deconnecter(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    this.ajouterJournal({
      type: 'DECONNEXION',
      description: "Déconnexion de l'espace privé",
    });
  }

  // Clés d'idempotence traitées
  static getIdempotencyKeys(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.IDEMPOTENCY_PROCESSED);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static markIdempotencyKey(key: string): void {
    const keys = this.getIdempotencyKeys();
    if (!keys.includes(key)) {
      keys.push(key);
      localStorage.setItem(STORAGE_KEYS.IDEMPOTENCY_PROCESSED, JSON.stringify(keys));
    }
  }

  static isIdempotencyKeyProcessed(key: string): boolean {
    return this.getIdempotencyKeys().includes(key);
  }

  // ===================== LOGIQUE MÉTIER DÉPÔT =====================
  static executerDepot(params: {
    coffreId: string;
    montant: number;
    numeroMobileMoney?: string;
    operateur?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE';
    idempotencyKey?: string;
    simulationStatus?: 'REUSSI' | 'ECHOUE' | 'EN_ATTENTE';
  }): {
    succes: boolean;
    message: string;
    transaction?: Transaction;
    coffre?: Coffre;
    codeErreur?: string;
  } {
    const coffres = this.getCoffres();
    const coffreIndex = coffres.findIndex((c) => c.id === params.coffreId);

    if (coffreIndex === -1) {
      return {
        succes: false,
        message: "Le coffre demandé n'existe pas.",
        codeErreur: 'COFFRE_INTROUVABLE',
      };
    }

    const coffre = coffres[coffreIndex];

    // Vérification montant strictement positif
    if (!params.montant || params.montant <= 0) {
      return {
        succes: false,
        message: 'Le montant du dépôt doit être strictement positif.',
        codeErreur: 'MONTANT_INVALIDE',
      };
    }

    // RÈGLE IMPORTANTE DU MINIMUM QUOTIDIEN PROPRE AU COFFRE
    if (params.montant < coffre.minimumQuotidien) {
      return {
        succes: false,
        message: `Le montant est inférieur au minimum quotidien de ce coffre : ${formatFCFA(coffre.minimumQuotidien)}.`,
        codeErreur: 'MINIMUM_QUOTIDIEN_NON_ATTEINT',
      };
    }

    // Gestion de l'idempotence
    const referenceInterne = genererReference('DEP');
    const idempotencyKey = params.idempotencyKey || `kofry:deposit:${referenceInterne}`;

    if (this.isIdempotencyKeyProcessed(idempotencyKey)) {
      const existingTx = this.getTransactions().find((t) => t.idempotencyKey === idempotencyKey);
      return {
        succes: true,
        message: 'Transaction déjà traitée (réponse idempotente). Aucun double crédit.',
        transaction: existingTx,
        coffre,
      };
    }

    // Statut simulé ou succès
    const statutTx = params.simulationStatus || 'REUSSI';

    const prop = this.getProprietaire();
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      referenceInterne,
      coffreId: coffre.id,
      coffreNom: coffre.nom,
      type: 'DEPOT',
      montant: params.montant,
      statut: statutTx,
      idempotencyKey,
      modePaiement: 'MOBILE_MONEY',
      fournisseurRef: `MOMO_PAY_${Date.now()}`,
      numeroMobileMoney: params.numeroMobileMoney || prop.numeroMobileMoney,
      operateur: params.operateur || prop.operateurDefaut,
      dateCreation: new Date().toISOString(),
      dateConfirmation: statutTx === 'REUSSI' ? new Date().toISOString() : undefined,
    };

    if (statutTx === 'REUSSI') {
      // Créditer le coffre de manière atomique
      coffre.soldeActuel += params.montant;
      coffre.dateModification = new Date().toISOString();

      // Vérifier si l'objectif est atteint
      const ancienStatut = coffre.statut;
      if (coffre.soldeActuel >= coffre.montantObjectif) {
        coffre.statut = 'OBJECTIF_ATTEINT';
        if (ancienStatut !== 'OBJECTIF_ATTEINT') {
          this.ajouterJournal({
            type: 'OBJECTIF_ATTEINT',
            description: `Objectif atteint pour le coffre ${coffre.nom} ! Solde : ${formatFCFA(coffre.soldeActuel)}`,
            coffreId: coffre.id,
            coffreNom: coffre.nom,
            montant: coffre.soldeActuel,
          });
        }
      }

      coffres[coffreIndex] = coffre;
      this.saveCoffres(coffres);
      this.markIdempotencyKey(idempotencyKey);

      // Journaliser l'opération
      this.ajouterJournal({
        type: 'DEPOT',
        description: `Dépôt de ${formatFCFA(params.montant)} enregistré avec succès dans ${coffre.nom}`,
        coffreId: coffre.id,
        coffreNom: coffre.nom,
        montant: params.montant,
      });

      // Enregistrer la transaction
      const txs = this.getTransactions();
      txs.unshift(newTx);
      this.saveTransactions(txs);

      return {
        succes: true,
        message: `Dépôt de ${formatFCFA(params.montant)} enregistré avec succès.`,
        transaction: newTx,
        coffre,
      };
    } else {
      // Transaction non réussie (ex: simulation échec ou en attente)
      const txs = this.getTransactions();
      txs.unshift(newTx);
      this.saveTransactions(txs);

      return {
        succes: false,
        message: statutTx === 'ECHOUE' 
          ? 'Le paiement Mobile Money a échoué auprès de l’opérateur.' 
          : 'Le paiement est en cours de traitement par l’opérateur.',
        transaction: newTx,
        coffre,
      };
    }
  }

  // ===================== LOGIQUE MÉTIER RETRAIT =====================
  static executerRetrait(params: {
    coffreId: string;
    montant: number;
    numeroMobileMoney?: string;
    operateur?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE';
    idempotencyKey?: string;
    simulationStatus?: 'REUSSI' | 'ECHOUE';
  }): {
    succes: boolean;
    message: string;
    transaction?: Transaction;
    coffre?: Coffre;
    codeErreur?: string;
  } {
    const coffres = this.getCoffres();
    const coffreIndex = coffres.findIndex((c) => c.id === params.coffreId);

    if (coffreIndex === -1) {
      return {
        succes: false,
        message: "Le coffre demandé n'existe pas.",
        codeErreur: 'COFFRE_INTROUVABLE',
      };
    }

    const coffre = coffres[coffreIndex];

    // Vérification montant strictement positif
    if (!params.montant || params.montant <= 0) {
      return {
        succes: false,
        message: 'Le montant du retrait doit être strictement positif.',
        codeErreur: 'MONTANT_INVALIDE',
      };
    }

    // Vérification solde disponible
    if (params.montant > coffre.soldeActuel) {
      return {
        succes: false,
        message: `Solde insuffisant dans ce coffre. Solde disponible : ${formatFCFA(coffre.soldeActuel)}.`,
        codeErreur: 'SOLDE_INSUFFISANT',
      };
    }

    // Gestion idempotence
    const referenceInterne = genererReference('RET');
    const idempotencyKey = params.idempotencyKey || `kofry:withdrawal:${referenceInterne}`;

    if (this.isIdempotencyKeyProcessed(idempotencyKey)) {
      const existingTx = this.getTransactions().find((t) => t.idempotencyKey === idempotencyKey);
      return {
        succes: true,
        message: 'Demande de retrait déjà exécutée (réponse idempotente). Aucun double débit.',
        transaction: existingTx,
        coffre,
      };
    }

    const statutTx = params.simulationStatus || 'REUSSI';
    const prop = this.getProprietaire();

    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      referenceInterne,
      coffreId: coffre.id,
      coffreNom: coffre.nom,
      type: 'RETRAIT',
      montant: params.montant,
      statut: statutTx,
      idempotencyKey,
      modePaiement: 'MOBILE_MONEY',
      fournisseurRef: `MOMO_PAYOUT_${Date.now()}`,
      numeroMobileMoney: params.numeroMobileMoney || prop.numeroMobileMoney,
      operateur: params.operateur || prop.operateurDefaut,
      dateCreation: new Date().toISOString(),
      dateConfirmation: statutTx === 'REUSSI' ? new Date().toISOString() : undefined,
    };

    if (statutTx === 'REUSSI') {
      // Débit atomique sans aucun frais, sans aucune pénalité
      coffre.soldeActuel -= params.montant;
      coffre.dateModification = new Date().toISOString();

      // Mise à jour du statut si le solde repasse sous l'objectif
      if (coffre.soldeActuel < coffre.montantObjectif) {
        coffre.statut = 'EN_COURS';
      }

      coffres[coffreIndex] = coffre;
      this.saveCoffres(coffres);
      this.markIdempotencyKey(idempotencyKey);

      // Journaliser le retrait sans frais
      this.ajouterJournal({
        type: 'RETRAIT',
        description: `Retrait de ${formatFCFA(params.montant)} effectué vers ${newTx.numeroMobileMoney} (0 FCFA de frais)`,
        coffreId: coffre.id,
        coffreNom: coffre.nom,
        montant: params.montant,
      });

      const txs = this.getTransactions();
      txs.unshift(newTx);
      this.saveTransactions(txs);

      return {
        succes: true,
        message: `Retrait de ${formatFCFA(params.montant)} validé avec succès sans aucun frais.`,
        transaction: newTx,
        coffre,
      };
    } else {
      const txs = this.getTransactions();
      txs.unshift(newTx);
      this.saveTransactions(txs);

      return {
        succes: false,
        message: 'Le décaissement Mobile Money a été rejeté par l’opérateur.',
        transaction: newTx,
        coffre,
      };
    }
  }

  // ===================== GESTION DES COFFRES (CRÉATION, ÉDITION, SUPPRESSION) =====================
  static creerCoffre(donnees: {
    nom: string;
    description?: string;
    montantObjectif: number;
    minimumQuotidien: number;
    dateCible?: string;
  }): { succes: boolean; message: string; coffre?: Coffre } {
    if (!donnees.nom.trim()) {
      return { succes: false, message: 'Le nom du coffre est obligatoire.' };
    }
    if (!donnees.montantObjectif || donnees.montantObjectif <= 0) {
      return { succes: false, message: "L'objectif d'épargne doit être supérieur à zéro." };
    }
    if (!donnees.minimumQuotidien || donnees.minimumQuotidien <= 0) {
      return { succes: false, message: 'Le montant minimum quotidien doit être supérieur à zéro.' };
    }

    const nouveauCoffre: Coffre = {
      id: 'coffre-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nom: donnees.nom.trim(),
      description: donnees.description?.trim(),
      montantObjectif: Math.round(donnees.montantObjectif),
      soldeActuel: 0,
      minimumQuotidien: Math.round(donnees.minimumQuotidien),
      dateCible: donnees.dateCible || undefined,
      statut: 'EN_COURS',
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    };

    const coffres = this.getCoffres();
    // Création 100% gratuite, nombre illimité de coffres !
    coffres.push(nouveauCoffre);
    this.saveCoffres(coffres);

    this.ajouterJournal({
      type: 'CREATION_COFFRE',
      description: `Création du coffre ${nouveauCoffre.nom} (Objectif : ${formatFCFA(nouveauCoffre.montantObjectif)}, Minimum quotidien : ${formatFCFA(nouveauCoffre.minimumQuotidien)})`,
      coffreId: nouveauCoffre.id,
      coffreNom: nouveauCoffre.nom,
    });

    return {
      succes: true,
      message: `Coffre « ${nouveauCoffre.nom} » créé avec succès.`,
      coffre: nouveauCoffre,
    };
  }

  static modifierCoffre(
    id: string,
    modifications: {
      nom?: string;
      description?: string;
      montantObjectif?: number;
      minimumQuotidien?: number;
      dateCible?: string;
    }
  ): { succes: boolean; message: string; coffre?: Coffre } {
    const coffres = this.getCoffres();
    const index = coffres.findIndex((c) => c.id === id);

    if (index === -1) {
      return { succes: false, message: 'Coffre introuvable.' };
    }

    const coffre = coffres[index];
    let descriptionJournal = `Modification du coffre ${coffre.nom}`;

    if (modifications.nom && modifications.nom.trim() !== coffre.nom) {
      coffre.nom = modifications.nom.trim();
    }
    if (modifications.description !== undefined) {
      coffre.description = modifications.description.trim();
    }
    if (modifications.montantObjectif && modifications.montantObjectif > 0) {
      coffre.montantObjectif = Math.round(modifications.montantObjectif);
      // Recalcul du statut
      if (coffre.soldeActuel >= coffre.montantObjectif) {
        coffre.statut = 'OBJECTIF_ATTEINT';
      } else {
        coffre.statut = 'EN_COURS';
      }
    }
    if (modifications.minimumQuotidien && modifications.minimumQuotidien > 0) {
      const oldMin = coffre.minimumQuotidien;
      coffre.minimumQuotidien = Math.round(modifications.minimumQuotidien);
      descriptionJournal = `Modification du minimum quotidien — ${coffre.nom} : ${formatFCFA(coffre.minimumQuotidien)} (précédemment ${formatFCFA(oldMin)})`;
    }
    if (modifications.dateCible !== undefined) {
      coffre.dateCible = modifications.dateCible || undefined;
    }

    coffre.dateModification = new Date().toISOString();
    coffres[index] = coffre;
    this.saveCoffres(coffres);

    this.ajouterJournal({
      type: 'MODIFICATION_COFFRE',
      description: descriptionJournal,
      coffreId: coffre.id,
      coffreNom: coffre.nom,
    });

    return {
      succes: true,
      message: 'Modifications enregistrées avec succès.',
      coffre,
    };
  }

  static supprimerCoffre(id: string): { succes: boolean; message: string } {
    const coffres = this.getCoffres();
    const coffre = coffres.find((c) => c.id === id);

    if (!coffre) {
      return { succes: false, message: 'Coffre introuvable.' };
    }

    const nom = coffre.nom;
    const solde = coffre.soldeActuel;
    const nouveauxCoffres = coffres.filter((c) => c.id !== id);
    this.saveCoffres(nouveauxCoffres);

    this.ajouterJournal({
      type: 'SUPPRESSION_COFFRE',
      description: `Suppression définitive du coffre ${nom} (Solde supprimé : ${formatFCFA(solde)})`,
      coffreNom: nom,
      montant: solde,
    });

    return {
      succes: true,
      message: `Le coffre « ${nom} » a été supprimé.`,
    };
  }

  // Réinitialisation aux données de démonstration
  static reinitialiserDonneesDemo(): void {
    localStorage.setItem(STORAGE_KEYS.COFFRES, JSON.stringify(DEMO_COFFRES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEMO_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(DEMO_JOURNAL));
    localStorage.setItem(STORAGE_KEYS.PROPRIETAIRE, JSON.stringify(DEMO_PROPRIETAIRE));
    localStorage.removeItem(STORAGE_KEYS.IDEMPOTENCY_PROCESSED);
  }
}
