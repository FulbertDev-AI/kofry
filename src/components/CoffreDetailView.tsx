import React, { useState } from 'react';
import { 
  Lock, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Smartphone,
  Info,
  Clock,
  Check
} from 'lucide-react';
import { Coffre, Transaction, Proprietaire } from '../types';
import { formatFCFA, formatDateFr, KofryEngine } from '../services/kofryEngine';

interface CoffreDetailViewProps {
  coffre: Coffre;
  transactions: Transaction[];
  proprietaire: Proprietaire;
  surRetour: () => void;
  surCoffreModifie: () => void;
  surOuvrirEditer: (coffre: Coffre) => void;
}

export const CoffreDetailView: React.FC<CoffreDetailViewProps> = ({
  coffre,
  transactions,
  proprietaire,
  surRetour,
  surCoffreModifie,
  surOuvrirEditer,
}) => {
  // États pour Dépôt
  const [montantDepot, setMontantDepot] = useState('');
  const [operateurDepot, setOperateurDepot] = useState<'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'>(proprietaire.operateurDefaut);
  const [numeroDepot, setNumeroDepot] = useState(proprietaire.numeroMobileMoney);
  const [erreurDepot, setErreurDepot] = useState<string | null>(null);
  const [succesDepot, setSuccesDepot] = useState<string | null>(null);
  const [enCoursDepot, setEnCoursDepot] = useState(false);

  // États pour Retrait
  const [montantRetrait, setMontantRetrait] = useState('');
  const [operateurRetrait, setOperateurRetrait] = useState<'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'>(proprietaire.operateurDefaut);
  const [numeroRetrait, setNumeroRetrait] = useState(proprietaire.numeroMobileMoney);
  const [erreurRetrait, setErreurRetrait] = useState<string | null>(null);
  const [succesRetrait, setSuccesRetrait] = useState<string | null>(null);
  const [modaleConfirmationRetrait, setModaleConfirmationRetrait] = useState(false);
  const [enCoursRetrait, setEnCoursRetrait] = useState(false);

  // États pour Suppression
  const [modaleSuppression, setModaleSuppression] = useState(false);

  const pourcentage = Math.min(
    100,
    Math.round((coffre.soldeActuel / coffre.montantObjectif) * 100) || 0
  );
  const estAtteint = coffre.statut === 'OBJECTIF_ATTEINT' || coffre.soldeActuel >= coffre.montantObjectif;

  // Filtrer les transactions de ce coffre
  const transactionsDuCoffre = transactions.filter((t) => t.coffreId === coffre.id);

  // Gestion du Dépôt
  const handleDepot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErreurDepot(null);
    setSuccesDepot(null);

    const montant = parseFloat(montantDepot);

    if (isNaN(montant) || montant <= 0) {
      setErreurDepot('Veuillez saisir un montant de dépôt valide.');
      return;
    }

    // RÈGLE STRICTE DU MINIMUM QUOTIDIEN
    if (montant < coffre.minimumQuotidien) {
      setErreurDepot(
        `Le montant est inférieur au minimum quotidien de ce coffre : ${formatFCFA(coffre.minimumQuotidien)}.`
      );
      return;
    }

    setEnCoursDepot(true);

    // Simulation paiement Mobile Money avec vérification serveur
    setTimeout(() => {
      const res = KofryEngine.executerDepot({
        coffreId: coffre.id,
        montant,
        numeroMobileMoney: numeroDepot,
        operateur: operateurDepot,
      });

      setEnCoursDepot(false);

      if (res.succes) {
        setSuccesDepot(res.message);
        setMontantDepot('');
        surCoffreModifie();
      } else {
        setErreurDepot(res.message);
      }
    }, 400);
  };

  // Sélecteur rapide de dépôt
  const handleSelecteurRapide = (montant: number) => {
    setMontantDepot(montant.toString());
    setErreurDepot(null);
    setSuccesDepot(null);
  };

  // Gestion du Retrait - Déclenchement de la confirmation
  const handleInitierRetrait = (e: React.FormEvent) => {
    e.preventDefault();
    setErreurRetrait(null);
    setSuccesRetrait(null);

    const montant = parseFloat(montantRetrait);

    if (isNaN(montant) || montant <= 0) {
      setErreurRetrait('Veuillez saisir un montant de retrait valide.');
      return;
    }

    if (montant > coffre.soldeActuel) {
      setErreurRetrait(
        `Solde insuffisant dans ce coffre. Solde disponible : ${formatFCFA(coffre.soldeActuel)}.`
      );
      return;
    }

    setModaleConfirmationRetrait(true);
  };

  // Confirmation finale du retrait sans frais
  const handleConfirmerRetrait = () => {
    setEnCoursRetrait(true);
    const montant = parseFloat(montantRetrait);

    setTimeout(() => {
      const res = KofryEngine.executerRetrait({
        coffreId: coffre.id,
        montant,
        numeroMobileMoney: numeroRetrait,
        operateur: operateurRetrait,
      });

      setEnCoursRetrait(false);
      setModaleConfirmationRetrait(false);

      if (res.succes) {
        setSuccesRetrait(res.message);
        setMontantRetrait('');
        surCoffreModifie();
      } else {
        setErreurRetrait(res.message);
      }
    }, 400);
  };

  // Confirmation de suppression
  const handleSupprimer = () => {
    KofryEngine.supprimerCoffre(coffre.id);
    surCoffreModifie();
    surRetour();
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Barre supérieure de retour */}
      <div className="flex items-center justify-between">
        <button
          onClick={surRetour}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C4A3E] hover:text-[#0F2E26] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F5] px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes coffres</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => surOuvrirEditer(coffre)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#1F2937] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F5] px-3 py-2 rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier le coffre</span>
          </button>
          <button
            onClick={() => setModaleSuppression(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#EF4444] bg-white border border-[#FCA5A5]/60 hover:bg-[#FEE2E2] px-3 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {/* CARTE PRINCIPALE DU COFFRE */}
      <div className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-xs ${estAtteint ? 'border-[#D4AF37]/60 ring-1 ring-[#D4AF37]/30' : 'border-[#E5E7EB]'}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                estAtteint ? 'bg-[#FFFBEB] text-[#D4AF37]' : 'bg-[#E8F2EE] text-[#1C4A3E]'
              }`}
            >
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F2E26]">
                  {coffre.nom}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    estAtteint
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      : 'bg-[#E8F2EE] text-[#1C4A3E]'
                  }`}
                >
                  {estAtteint && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  {estAtteint ? 'Objectif atteint' : 'En cours'}
                </span>
              </div>
              {coffre.description && (
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B7280]">
                  {coffre.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>Créé le {formatDateFr(coffre.dateCreation)}</span>
          </div>
        </div>

        {/* Chiffres clés : Solde sur Objectif */}
        <div className="mt-6 pt-6 border-t border-[#F3F4F6] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <p className="text-xs text-[#6B7280] font-medium">Épargne actuelle</p>
            <p className="text-2xl font-bold text-[#0F2E26] mt-1">
              {formatFCFA(coffre.soldeActuel)}
            </p>
            <p className="text-[11px] text-[#10B981] font-medium mt-0.5">Solde disponible sans frais</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <p className="text-xs text-[#6B7280] font-medium">Montant objectif</p>
            <p className="text-2xl font-bold text-[#1F2937] mt-1">
              {formatFCFA(coffre.montantObjectif)}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              {estAtteint
                ? 'Objectif 100% complété'
                : `Reste ${formatFCFA(Math.max(0, coffre.montantObjectif - coffre.soldeActuel))}`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F2EE] border border-[#D9E9E2]">
            <p className="text-xs text-[#1C4A3E] font-semibold">Minimum quotidien</p>
            <p className="text-2xl font-bold text-[#0F2E26] mt-1">
              {formatFCFA(coffre.minimumQuotidien)}
            </p>
            <p className="text-[11px] text-[#1C4A3E] mt-0.5">Règle propre à ce coffre</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#1F2937]">Progression de l'objectif</span>
            <span className="text-base font-bold text-[#1C4A3E]">{pourcentage} %</span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                estAtteint ? 'bg-[#D4AF37]' : 'bg-[#1C4A3E]'
              }`}
              style={{ width: `${pourcentage}%` }}
            />
          </div>
        </div>

        {/* Date cible si définie */}
        {coffre.dateCible && (
          <div className="mt-5 flex items-center gap-2 text-xs text-[#4B5563] bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
            <Calendar className="w-4 h-4 text-[#1C4A3E]" />
            <span>
              Date cible prévue : <strong>{formatDateFr(coffre.dateCible)}</strong> (Objectif personnel sans pénalité à l'échéance)
            </span>
          </div>
        )}
      </div>

      {/* GRILLE : DÉPÔT ET RETRAIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1 : AJOUTER À MON ÉPARGNE (DÉPÔT) */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E8F2EE] text-[#1C4A3E]">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2E26]">Ajouter à mon épargne</h2>
                  <p className="text-xs text-[#6B7280]">Alimentation par Mobile Money</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#1C4A3E] bg-[#E8F2EE] px-2.5 py-1 rounded-full">
                Min. {formatFCFA(coffre.minimumQuotidien)}
              </span>
            </div>

            {/* Notification de rejet du dépôt si < minimum */}
            {erreurDepot && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#EF4444] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Dépôt refusé</p>
                  <p>{erreurDepot}</p>
                </div>
              </div>
            )}

            {/* Notification de succès */}
            {succesDepot && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#E8F2EE] border border-[#A7F3D0] text-xs text-[#065F46] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Opération réussie</p>
                  <p>{succesDepot}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleDepot} className="mt-5 space-y-4">
              {/* Sélecteurs rapides */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                  Montants rapides suggérés
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[2000, 5000, 10000, 25000].map((val) => {
                    const estInferieur = val < coffre.minimumQuotidien;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelecteurRapide(val)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                          montantDepot === val.toString()
                            ? 'bg-[#1C4A3E] text-white border-[#1C4A3E]'
                            : estInferieur
                            ? 'bg-[#F9FAFB] text-[#9CA3AF] border-gray-200 hover:border-gray-300'
                            : 'bg-[#F4F6F5] text-[#1F2937] border-gray-200 hover:border-[#1C4A3E]/40'
                        }`}
                      >
                        {formatFCFA(val)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Champ personnalisé */}
              <div>
                <label htmlFor="input-montant-depot" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                  Montant à déposer (FCFA)
                </label>
                <div className="relative">
                  <input
                    id="input-montant-depot"
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={montantDepot}
                    onChange={(e) => {
                      setMontantDepot(e.target.value);
                      setErreurDepot(null);
                      setSuccesDepot(null);
                    }}
                    placeholder={`Minimum : ${coffre.minimumQuotidien}`}
                    className="w-full rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-bold text-[#6B7280]">
                    FCFA
                  </div>
                </div>
                {montantDepot && !isNaN(Number(montantDepot)) && (
                  <p className="mt-1 text-[11px] font-medium text-[#1C4A3E]">
                    Montant sélectionné : {formatFCFA(Number(montantDepot))}
                  </p>
                )}
              </div>

              {/* Paramètres Mobile Money */}
              <div className="p-3 bg-[#F9FAFB] rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F2937]">Canal de dépôt :</span>
                  <div className="flex items-center gap-1 text-[#1C4A3E] font-medium">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Money</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['ORANGE', 'MTN', 'MOOV', 'WAVE'] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperateurDepot(op)}
                      className={`py-1 text-[10px] font-bold rounded-md border transition-all ${
                        operateurDepot === op
                          ? 'bg-[#1C4A3E] text-white border-[#1C4A3E]'
                          : 'bg-white text-[#4B5563] border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-valider-depot"
                type="submit"
                disabled={enCoursDepot}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1C4A3E] hover:bg-[#0F2E26] text-white py-3 px-4 text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 text-[#D9E9E2]" />
                <span>{enCoursDepot ? 'Traitement sécurisé...' : 'Ajouter à mon épargne'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 2 : RETIRER DE MON ÉPARGNE */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#EF4444]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2E26]">Retirer de mon épargne</h2>
                  <p className="text-xs text-[#6B7280]">Décaissement vers votre Mobile Money</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#10B981] bg-[#E8F2EE] px-2.5 py-1 rounded-full">
                0 FCFA de frais
              </span>
            </div>

            {/* Reassurance sans frais */}
            <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#4B5563] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>
                Retrait libre et immédiat. <strong>Aucun frais, aucune pénalité, 0% d'intérêt</strong>.
              </span>
            </div>

            {erreurRetrait && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#EF4444] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{erreurRetrait}</p>
              </div>
            )}

            {succesRetrait && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#E8F2EE] border border-[#A7F3D0] text-xs text-[#065F46] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
                <p>{succesRetrait}</p>
              </div>
            )}

            <form onSubmit={handleInitierRetrait} className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-montant-retrait" className="block text-xs font-semibold text-[#1F2937]">
                    Montant à retirer (FCFA)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMontantRetrait(coffre.soldeActuel.toString())}
                    className="text-xs font-semibold text-[#1C4A3E] hover:underline"
                  >
                    Tout retirer ({formatFCFA(coffre.soldeActuel)})
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="input-montant-retrait"
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={montantRetrait}
                    onChange={(e) => {
                      setMontantRetrait(e.target.value);
                      setErreurRetrait(null);
                      setSuccesRetrait(null);
                    }}
                    placeholder={`Solde disponible : ${coffre.soldeActuel}`}
                    className="w-full rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-bold text-[#6B7280]">
                    FCFA
                  </div>
                </div>
                {montantRetrait && !isNaN(Number(montantRetrait)) && (
                  <p className="mt-1 text-[11px] font-medium text-[#1C4A3E]">
                    Montant demandé : {formatFCFA(Number(montantRetrait))}
                  </p>
                )}
              </div>

              {/* Compte Mobile Money de destination */}
              <div className="p-3 bg-[#F9FAFB] rounded-xl border border-gray-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1F2937]">Destination :</span>
                  <span className="font-mono text-[#1C4A3E] font-medium">{proprietaire.numeroMobileMoney}</span>
                </div>
                <div className="flex items-center justify-between text-[#6B7280]">
                  <span>Frais de retrait prélevés :</span>
                  <span className="font-bold text-[#10B981]">0 FCFA</span>
                </div>
              </div>

              <button
                id="btn-demander-retrait"
                type="submit"
                disabled={coffre.soldeActuel <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1F2937] hover:bg-[#111827] text-white py-3 px-4 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4 text-white" />
                <span>Retirer</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* HISTORIQUE SPÉCIFIQUE À CE COFFRE */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0F2E26] mb-4">
          Historique des opérations de ce coffre
        </h3>

        {transactionsDuCoffre.length === 0 ? (
          <p className="text-xs text-[#6B7280] py-4 text-center">
            Aucun dépôt ou retrait enregistré dans ce coffre pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {transactionsDuCoffre.map((tx) => {
              const estDepot = tx.type === 'DEPOT';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        estDepot ? 'bg-[#E8F2EE] text-[#1C4A3E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {estDepot ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">
                        {estDepot ? 'Dépôt Mobile Money' : 'Retrait Mobile Money'}
                      </p>
                      <p className="text-[11px] text-[#6B7280] font-mono">
                        {tx.referenceInterne} · {formatDateFr(tx.dateCreation)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        estDepot ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {estDepot ? '+' : '-'} {formatFCFA(tx.montant)}
                    </p>
                    <span className="text-[10px] text-[#6B7280]">0 FCFA de frais</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALE DE CONFIRMATION DE RETRAIT SANS FRAIS */}
      {modaleConfirmationRetrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-[#FEE2E2] text-[#EF4444]">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Confirmer le retrait</h3>
                <p className="text-xs text-[#6B7280]">Opération de décaissement Mobile Money</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#4B5563]">
              <p className="text-sm font-semibold text-[#1F2937]">
                Vous êtes sur le point de retirer {formatFCFA(Number(montantRetrait))} de ce coffre.
              </p>
              <div className="p-3 bg-[#F4F6F5] rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Coffre débité :</span>
                  <span className="font-semibold text-[#1F2937]">{coffre.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compte destinataire :</span>
                  <span className="font-mono text-[#1F2937]">{proprietaire.numeroMobileMoney}</span>
                </div>
                <div className="flex justify-between font-bold text-[#10B981] pt-1 border-t border-gray-200">
                  <span>Frais et pénalités :</span>
                  <span>0 FCFA</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Cette opération sera traitée de manière sécurisée et idempotente.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModaleConfirmationRetrait(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#4B5563] hover:bg-gray-100 rounded-xl transition"
              >
                Annuler
              </button>
              <button
                id="btn-confirmer-retrait-final"
                type="button"
                disabled={enCoursRetrait}
                onClick={handleConfirmerRetrait}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1C4A3E] hover:bg-[#0F2E26] rounded-xl shadow-xs transition disabled:opacity-60"
              >
                {enCoursRetrait ? 'Validation...' : 'Confirmer le retrait'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DE SUPPRESSION DU COFFRE */}
      {modaleSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-[#FEE2E2] text-[#EF4444]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Supprimer ce coffre ?</h3>
                <p className="text-xs text-[#6B7280]">Action irréversible</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#4B5563]">
              <p className="leading-relaxed font-semibold text-[#1F2937]">
                Cette action supprimera le coffre de votre espace. Vérifiez votre solde avant de continuer.
              </p>
              <div className="p-3 bg-[#FEE2E2]/60 rounded-xl border border-[#FCA5A5] text-xs text-[#991B1B]">
                Solde actuel dans ce coffre : <strong>{formatFCFA(coffre.soldeActuel)}</strong>
              </div>
              {coffre.soldeActuel > 0 && (
                <p className="text-[11px] text-[#DC2626]">
                  Attention : Vous avez encore des fonds dans ce coffre. Pensez à effectuer un retrait au préalable si nécessaire.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModaleSuppression(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#4B5563] hover:bg-gray-100 rounded-xl transition"
              >
                Annuler
              </button>
              <button
                id="btn-confirmer-suppression"
                type="button"
                onClick={handleSupprimer}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl shadow-xs transition"
              >
                Supprimer le coffre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
