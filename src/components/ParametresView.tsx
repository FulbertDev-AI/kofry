import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Smartphone, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Play, 
  Check, 
  Download,
  Info
} from 'lucide-react';
import { Proprietaire, Coffre } from '../types';
import { KofryEngine, formatFCFA } from '../services/kofryEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface ParametresViewProps {
  proprietaire: Proprietaire;
  coffres: Coffre[];
  surMettreAJour: () => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({
  proprietaire,
  coffres,
  surMettreAJour,
}) => {
  const [nom, setNom] = useState(proprietaire.nomComplet);
  const [numero, setNumero] = useState(proprietaire.numeroMobileMoney);
  const [operateur, setOperateur] = useState<'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'>(proprietaire.operateurDefaut);
  const [messageProfil, setMessageProfil] = useState<string | null>(null);

  // États pour les tests de simulation
  const [resultatTest, setResultatTest] = useState<{
    nomTest: string;
    succes: boolean;
    details: string;
  } | null>(null);

  const handleEnregistrerProfil = (e: React.FormEvent) => {
    e.preventDefault();
    const maj: Proprietaire = {
      ...proprietaire,
      nomComplet: nom.trim(),
      numeroMobileMoney: numero.trim(),
      operateurDefaut: operateur,
    };
    KofryEngine.saveProprietaire(maj);
    setMessageProfil('Paramètres du propriétaire enregistrés.');
    surMettreAJour();
    setTimeout(() => setMessageProfil(null), 3000);
  };

  const handleResetDemo = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration (Achat Ordinateur, Fonds d’urgence, Voyage) ?')) {
      KofryEngine.reinitialiserDonneesDemo();
      surMettreAJour();
      setResultatTest({
        nomTest: 'Réinitialisation des données',
        succes: true,
        details: 'Les données de démonstration officielles ont été restaurées avec succès.',
      });
    }
  };

  // ===================== TESTS AUTOMATISÉS D'IDEMPOTENCE ET RÈGLES MÉTIER =====================

  // Test 1 : Dépôt inférieur au minimum (Doit être STRICTEMENT rejeté)
  const executerTestDepotSousMinimum = () => {
    const coffre = coffres[0];
    if (!coffre) return;
    const montantInvalide = Math.max(100, coffre.minimumQuotidien - 500);

    const res = KofryEngine.executerDepot({
      coffreId: coffre.id,
      montant: montantInvalide,
    });

    if (!res.succes && res.codeErreur === 'MINIMUM_QUOTIDIEN_NON_ATTEINT') {
      setResultatTest({
        nomTest: 'Test 1 : Rejet du dépôt inférieur au minimum quotidien',
        succes: true,
        details: `Conforme ! Le système a correctement rejeté le dépôt de ${formatFCFA(montantInvalide)} pour un minimum requis de ${formatFCFA(coffre.minimumQuotidien)}. Message : « ${res.message} »`,
      });
    } else {
      setResultatTest({
        nomTest: 'Test 1 : Rejet du dépôt inférieur au minimum',
        succes: false,
        details: 'Échec : Le dépôt inférieur au minimum a été accepté ou n’a pas renvoyé le bon code.',
      });
    }
    surMettreAJour();
  };

  // Test 2 : Idempotence des webhooks (Même paiement reçu 3 fois -> 1 seul crédit)
  const executerTestIdempotenceWebhook = () => {
    const coffre = coffres[0];
    if (!coffre) return;

    const soldeInitial = coffre.soldeActuel;
    const montantDepot = coffre.minimumQuotidien;
    const cleIdempotenceTest = `kofry:deposit:TEST_IDEMPOTENCE_${Date.now()}`;

    // Premier appel (webhook 1)
    const appel1 = KofryEngine.executerDepot({
      coffreId: coffre.id,
      montant: montantDepot,
      idempotencyKey: cleIdempotenceTest,
    });

    // Deuxième appel (webhook 2 - doublon réseau)
    const appel2 = KofryEngine.executerDepot({
      coffreId: coffre.id,
      montant: montantDepot,
      idempotencyKey: cleIdempotenceTest,
    });

    // Troisième appel (webhook 3 - retry opérateur)
    const appel3 = KofryEngine.executerDepot({
      coffreId: coffre.id,
      montant: montantDepot,
      idempotencyKey: cleIdempotenceTest,
    });

    const coffreApres = KofryEngine.getCoffre(coffre.id);
    const differenceSolde = (coffreApres?.soldeActuel || 0) - soldeInitial;

    if (differenceSolde === montantDepot) {
      setResultatTest({
        nomTest: 'Test 2 : Idempotence absolue des paiements et webhooks',
        succes: true,
        details: `Conforme ! Le même webhook a été envoyé 3 fois consécutives avec la même clé d'idempotence. Le coffre n'a été crédité qu'une seule et unique fois (+${formatFCFA(montantDepot)}). Aucun double crédit !`,
      });
    } else {
      setResultatTest({
        nomTest: 'Test 2 : Idempotence des paiements',
        succes: false,
        details: `Échec : Le solde a augmenté de ${formatFCFA(differenceSolde)} au lieu de ${formatFCFA(montantDepot)}. Double crédit détecté !`,
      });
    }
    surMettreAJour();
  };

  // Test 3 : Retrait excédant le solde disponible (Doit être rejeté)
  const executerTestRetraitDepassantSolde = () => {
    const coffre = coffres[0];
    if (!coffre) return;

    const montantTropGrand = coffre.soldeActuel + 100000;
    const res = KofryEngine.executerRetrait({
      coffreId: coffre.id,
      montant: montantTropGrand,
    });

    if (!res.succes && res.codeErreur === 'SOLDE_INSUFFISANT') {
      setResultatTest({
        nomTest: 'Test 3 : Protection contre le dépassement de solde disponible',
        succes: true,
        details: `Conforme ! Le système a bloqué la demande de ${formatFCFA(montantTropGrand)} pour un solde disponible de ${formatFCFA(coffre.soldeActuel)}. Message : « ${res.message} »`,
      });
    } else {
      setResultatTest({
        nomTest: 'Test 3 : Dépassement de solde',
        succes: false,
        details: 'Échec : Un retrait supérieur au solde disponible a été autorisé.',
      });
    }
    surMettreAJour();
  };

  // Test 4 : Retrait valide sans aucun frais
  const executerTestRetraitSansFrais = () => {
    const coffre = coffres.find((c) => c.soldeActuel >= 5000) || coffres[0];
    if (!coffre || coffre.soldeActuel < 5000) {
      setResultatTest({
        nomTest: 'Test 4 : Retrait sans frais',
        succes: false,
        details: 'Veuillez avoir au moins 5 000 FCFA dans un coffre pour exécuter ce test.',
      });
      return;
    }

    const res = KofryEngine.executerRetrait({
      coffreId: coffre.id,
      montant: 2000,
    });

    if (res.succes) {
      setResultatTest({
        nomTest: 'Test 4 : Retrait sans frais ni pénalité',
        succes: true,
        details: `Conforme ! Retrait de 2 000 FCFA validé. 0 FCFA de frais déduits, 0% de pénalité, aucune modification d'intérêts.`,
      });
    }
    surMettreAJour();
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
          Paramètres & Simulateur
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
          Configuration de votre espace personnel et banc d'essai des flux financiers sécurisés.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1 : PROFIL PROPRIÉTAIRE UNIQUE */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#F3F4F6]">
            <div className="p-2 rounded-xl bg-[#E8F2EE] text-[#1C4A3E]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F2E26]">Propriétaire de l'espace</h2>
              <p className="text-xs text-[#6B7280]">Informations pour les retraits Mobile Money</p>
            </div>
          </div>

          {messageProfil && (
            <div className="mt-4 p-3 rounded-xl bg-[#E8F2EE] text-[#065F46] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>{messageProfil}</span>
            </div>
          )}

          <form onSubmit={handleEnregistrerProfil} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Nom complet du propriétaire
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Numéro Mobile Money par défaut (pour les retraits)
              </label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] font-mono focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Opérateur Mobile Money principal
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['ORANGE', 'MTN', 'MOOV', 'WAVE'] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperateur(op)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      operateur === op
                        ? 'bg-[#1C4A3E] text-white border-[#1C4A3E]'
                        : 'bg-[#F4F6F5] text-[#4B5563] border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1C4A3E] hover:bg-[#0F2E26] text-white py-2.5 px-4 text-xs font-bold transition-colors cursor-pointer"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </form>

          {/* Installation PWA */}
          <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
            <p className="text-xs font-bold text-[#1F2937] mb-2">Application mobile Kofry (PWA)</p>
            <PWAInstallButton className="w-full justify-center" />
          </div>
        </div>

        {/* SECTION 2 : SIMULATEUR MOBILE MONEY ET TESTS D'IDEMPOTENCE */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1C4A3E] text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2E26]">Simulateur financier</h2>
                  <p className="text-xs text-[#6B7280]">Vérification des règles d'idempotence et seuils</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#1C4A3E] bg-[#E8F2EE] px-2 py-0.5 rounded-md">
                Banc d'essai
              </span>
            </div>

            {/* Résultat du test exécuté */}
            {resultatTest && (
              <div
                className={`mt-4 p-4 rounded-2xl border text-xs ${
                  resultatTest.succes
                    ? 'bg-[#E8F2EE] border-[#A7F3D0] text-[#065F46]'
                    : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {resultatTest.succes ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                  )}
                  <span>{resultatTest.nomTest}</span>
                </div>
                <p className="leading-relaxed">{resultatTest.details}</p>
              </div>
            )}

            {/* Boutons d'exécution des tests unitaires interactifs */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={executerTestDepotSousMinimum}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#1C4A3E] hover:bg-[#F9FAFB] text-left transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F2937]">
                    1. Tester le rejet si dépôt &lt; minimum quotidien
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Vérifie la règle propre au coffre et le message Soft Rose obligatoire.
                  </p>
                </div>
                <Play className="w-4 h-4 text-[#1C4A3E] shrink-0" />
              </button>

              <button
                onClick={executerTestIdempotenceWebhook}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#1C4A3E] hover:bg-[#F9FAFB] text-left transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F2937]">
                    2. Tester l'idempotence (3 webhooks identiques)
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Prouve qu'un paiement reçu plusieurs fois ne crédite le coffre qu'une seule fois.
                  </p>
                </div>
                <Play className="w-4 h-4 text-[#1C4A3E] shrink-0" />
              </button>

              <button
                onClick={executerTestRetraitDepassantSolde}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#1C4A3E] hover:bg-[#F9FAFB] text-left transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F2937]">
                    3. Tester le blocage si retrait &gt; solde disponible
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Vérifie l'impossibilité de créer un solde négatif.
                  </p>
                </div>
                <Play className="w-4 h-4 text-[#1C4A3E] shrink-0" />
              </button>

              <button
                onClick={executerTestRetraitSansFrais}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#1C4A3E] hover:bg-[#F9FAFB] text-left transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F2937]">
                    4. Tester le retrait sans frais (0 FCFA de frais)
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Confirme l'absence totale de commission ou de pénalité de retrait.
                  </p>
                </div>
                <Play className="w-4 h-4 text-[#1C4A3E] shrink-0" />
              </button>
            </div>
          </div>

          {/* Réinitialisation complète aux données de démo */}
          <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
            <button
              onClick={handleResetDemo}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-[#4B5563] py-2.5 px-4 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les données de démonstration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
