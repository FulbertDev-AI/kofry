import React, { useState, useEffect } from 'react';
import { 
  Sidebar, 
  MobileHeader, 
  MobileBottomNav, 
  OngletActif 
} from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { CoffreCard } from './components/CoffreCard';
import { CoffreDetailView } from './components/CoffreDetailView';
import { CoffreModal } from './components/CoffreModal';
import { HistoriqueView } from './components/HistoriqueView';
import { JournalView } from './components/JournalView';
import { ParametresView } from './components/ParametresView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { KofryEngine } from './services/kofryEngine';
import { Coffre, Transaction, JournalEvent, Proprietaire } from './types';
import { Plus, Layers } from 'lucide-react';

export default function App() {
  const [estConnecte, setEstConnecte] = useState(false);
  const [ongletActif, setOngletActif] = useState<OngletActif>('dashboard');
  const [coffreSelectionne, setCoffreSelectionne] = useState<Coffre | null>(null);

  // Données d'état
  const [coffres, setCoffres] = useState<Coffre[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [journal, setJournal] = useState<JournalEvent[]>([]);
  const [proprietaire, setProprietaire] = useState<Proprietaire>(KofryEngine.getProprietaire());

  // Modale création/édition de coffre
  const [modaleCoffreOuverte, setModaleCoffreOuverte] = useState(false);
  const [coffreAEditer, setCoffreAEditer] = useState<Coffre | null>(null);

  // Chargement des données au démarrage
  const rechargerDonnees = () => {
    setCoffres(KofryEngine.getCoffres());
    setTransactions(KofryEngine.getTransactions());
    setJournal(KofryEngine.getJournal());
    setProprietaire(KofryEngine.getProprietaire());

    // Si un coffre était sélectionné, rafraîchir sa version
    if (coffreSelectionne) {
      const maj = KofryEngine.getCoffre(coffreSelectionne.id);
      if (maj) {
        setCoffreSelectionne(maj);
      } else {
        setCoffreSelectionne(null);
      }
    }
  };

  useEffect(() => {
    // Vérifier l'état de connexion privée existant
    const connecte = KofryEngine.isConnecte();
    setEstConnecte(connecte);
    rechargerDonnees();
  }, []);

  const handleConnexionReussie = () => {
    setEstConnecte(true);
    rechargerDonnees();
  };

  const handleDeconnexion = () => {
    KofryEngine.deconnecter();
    setEstConnecte(false);
    setCoffreSelectionne(null);
  };

  const handleOuvrirNouveauCoffre = () => {
    setCoffreAEditer(null);
    setModaleCoffreOuverte(true);
  };

  const handleOuvrirEditerCoffre = (coffre: Coffre) => {
    setCoffreAEditer(coffre);
    setModaleCoffreOuverte(true);
  };

  const handleEnregistrerCoffre = (donnees: {
    nom: string;
    description?: string;
    montantObjectif: number;
    minimumQuotidien: number;
    dateCible?: string;
  }) => {
    if (coffreAEditer) {
      KofryEngine.modifierCoffre(coffreAEditer.id, donnees);
    } else {
      KofryEngine.creerCoffre(donnees);
    }
    setModaleCoffreOuverte(false);
    setCoffreAEditer(null);
    rechargerDonnees();
  };

  const handleSelectionnerCoffre = (coffre: Coffre) => {
    setCoffreSelectionne(coffre);
  };

  const handleDeposerRapide = (coffre: Coffre) => {
    setCoffreSelectionne(coffre);
  };

  // Si non connecté, afficher l'écran de connexion privée (Screen 1)
  if (!estConnecte) {
    return (
      <>
        <LoginView surConnexionReussie={handleConnexionReussie} />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex flex-col lg:flex-row text-[#1F2937]">
      {/* Sidebar Desktop */}
      <Sidebar
        ongletActif={ongletActif}
        surChangerOnglet={(onglet) => {
          setOngletActif(onglet);
          setCoffreSelectionne(null);
        }}
        surOuvrirNouveauCoffre={handleOuvrirNouveauCoffre}
        surDeconnexion={handleDeconnexion}
        proprietaire={proprietaire}
        nombreCoffres={coffres.length}
      />

      {/* Header Mobile */}
      <MobileHeader
        proprietaire={proprietaire}
        surDeconnexion={handleDeconnexion}
        surOuvrirNouveauCoffre={handleOuvrirNouveauCoffre}
      />

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
        {coffreSelectionne ? (
          <CoffreDetailView
            coffre={coffreSelectionne}
            transactions={transactions}
            proprietaire={proprietaire}
            surRetour={() => setCoffreSelectionne(null)}
            surCoffreModifie={rechargerDonnees}
            surOuvrirEditer={handleOuvrirEditerCoffre}
          />
        ) : (
          <>
            {ongletActif === 'dashboard' && (
              <DashboardView
                coffres={coffres}
                transactions={transactions}
                proprietaire={proprietaire}
                surOuvrirNouveauCoffre={handleOuvrirNouveauCoffre}
                surSelectionnerCoffre={handleSelectionnerCoffre}
                surDeposerDansCoffre={handleDeposerRapide}
                surVoirTousLesCoffres={() => setOngletActif('coffres')}
                surVoirHistorique={() => setOngletActif('historique')}
              />
            )}

            {ongletActif === 'coffres' && (
              <div className="space-y-6 pb-16 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
                        Mes Coffres d'épargne
                      </h1>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F2EE] text-[#1C4A3E]">
                        {coffres.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
                      Nombre illimité de coffres · Aucun frais d'ouverture · Minimum quotidien personnalisable.
                    </p>
                  </div>

                  <button
                    onClick={handleOuvrirNouveauCoffre}
                    className="flex items-center gap-2 rounded-xl bg-[#1C4A3E] hover:bg-[#0F2E26] text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#D9E9E2]" />
                    <span>Nouveau coffre</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {coffres.map((c) => (
                    <CoffreCard
                      key={c.id}
                      coffre={c}
                      surSelectionner={handleSelectionnerCoffre}
                      surDeposerRapide={handleDeposerRapide}
                    />
                  ))}
                </div>
              </div>
            )}

            {ongletActif === 'historique' && (
              <HistoriqueView
                transactions={transactions}
                surSelectionnerCoffreParId={(id) => {
                  const c = coffres.find((item) => item.id === id);
                  if (c) setCoffreSelectionne(c);
                }}
              />
            )}

            {ongletActif === 'journal' && (
              <JournalView journal={journal} />
            )}

            {ongletActif === 'parametres' && (
              <ParametresView
                proprietaire={proprietaire}
                coffres={coffres}
                surMettreAJour={rechargerDonnees}
              />
            )}
          </>
        )}
      </main>

      {/* Navigation Mobile Inférieure */}
      <MobileBottomNav
        ongletActif={ongletActif}
        surChangerOnglet={(onglet) => {
          setOngletActif(onglet);
          setCoffreSelectionne(null);
        }}
      />

      {/* Modale de création ou modification de coffre */}
      <CoffreModal
        ouvert={modaleCoffreOuverte}
        surFermer={() => {
          setModaleCoffreOuverte(false);
          setCoffreAEditer(null);
        }}
        surEnregistrer={handleEnregistrerCoffre}
        coffreAEditer={coffreAEditer}
      />

      {/* Indicateur de mode hors ligne */}
      <OfflineIndicator />
    </div>
  );
}
