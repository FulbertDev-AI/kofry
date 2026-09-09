import React from 'react';
import { 
  Plus, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Clock, 
  Lock,
  Calendar
} from 'lucide-react';
import { Coffre, Transaction, Proprietaire } from '../types';
import { CoffreCard } from './CoffreCard';
import { formatFCFA, formatDateFr } from '../services/kofryEngine';

interface DashboardViewProps {
  coffres: Coffre[];
  transactions: Transaction[];
  proprietaire: Proprietaire;
  surOuvrirNouveauCoffre: () => void;
  surSelectionnerCoffre: (coffre: Coffre) => void;
  surDeposerDansCoffre: (coffre: Coffre) => void;
  surVoirTousLesCoffres: () => void;
  surVoirHistorique: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  coffres,
  transactions,
  proprietaire,
  surOuvrirNouveauCoffre,
  surSelectionnerCoffre,
  surDeposerDansCoffre,
  surVoirTousLesCoffres,
  surVoirHistorique,
}) => {
  // Calculs financiers consolidés
  const totalEpargne = coffres.reduce((acc, c) => acc + c.soldeActuel, 0);
  const totalObjectifs = coffres.reduce((acc, c) => acc + c.montantObjectif, 0);
  const progressionGlobale = totalObjectifs > 0 
    ? Math.min(100, Math.round((totalEpargne / totalObjectifs) * 100)) 
    : 0;

  const nombreCoffresActifs = coffres.filter((c) => c.statut === 'EN_COURS').length;
  const nombreObjectifsAtteints = coffres.filter(
    (c) => c.statut === 'OBJECTIF_ATTEINT' || c.soldeActuel >= c.montantObjectif
  ).length;

  const transactionsRecentes = transactions.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête : Salutations & Statut sécurisé */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
              Bonjour, {proprietaire.nomComplet}
            </h1>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F2EE] text-[#1C4A3E] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1C4A3E]" />
              <span>Espace sécurisé</span>
            </div>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Suivi et organisation de votre épargne personnelle par coffres indépendants.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-dashboard-nouveau-coffre"
            onClick={surOuvrirNouveauCoffre}
            className="flex items-center gap-2 rounded-xl bg-[#1C4A3E] hover:bg-[#0F2E26] text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#D9E9E2]" />
            <span>Nouveau coffre</span>
          </button>
        </div>
      </div>

      {/* Grande Carte d'Épargne Totale */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1C4A3E] via-[#153B32] to-[#0F2E26] p-6 sm:p-8 text-white shadow-md">
        {/* Motifs géométriques subtils */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#E8F2EE]/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#D9E9E2] text-xs font-medium uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Épargne totale consolidée</span>
            </div>
            <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {formatFCFA(totalEpargne)}
            </div>
            <div className="mt-2 text-xs text-[#D9E9E2]">
              Objectif cumulé de tous vos coffres : <span className="font-semibold text-white">{formatFCFA(totalObjectifs)}</span>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="w-full md:max-w-xs bg-black/20 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#D9E9E2]">Progression globale</span>
              <span className="font-bold text-[#D4AF37]">{progressionGlobale} %</span>
            </div>
            <div className="w-full bg-white/15 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#D4AF37] transition-all duration-500"
                style={{ width: `${progressionGlobale}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Métriques clés */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left">
          <div>
            <p className="text-[11px] text-[#D9E9E2]">Coffres actifs</p>
            <p className="text-base sm:text-lg font-bold mt-0.5">{nombreCoffresActifs}</p>
          </div>
          <div className="border-l border-white/10 pl-2 sm:pl-4">
            <p className="text-[11px] text-[#D9E9E2]">Objectifs atteints</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 text-[#D4AF37]">{nombreObjectifsAtteints}</p>
          </div>
          <div className="border-l border-white/10 pl-2 sm:pl-4">
            <p className="text-[11px] text-[#D9E9E2]">Coffres au total</p>
            <p className="text-base sm:text-lg font-bold mt-0.5">{coffres.length}</p>
          </div>
        </div>
      </div>

      {/* SECTION : MES COFFRES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#1C4A3E]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#0F2E26]">Mes Coffres</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1C4A3E]">
              {coffres.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {coffres.length > 3 && (
              <button
                onClick={surVoirTousLesCoffres}
                className="text-xs font-semibold text-[#1C4A3E] hover:underline"
              >
                Tout voir ({coffres.length})
              </button>
            )}
            <button
              id="btn-section-nouveau-coffre"
              onClick={surOuvrirNouveauCoffre}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1C4A3E] bg-[#E8F2EE] hover:bg-[#D9E9E2] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau coffre</span>
            </button>
          </div>
        </div>

        {coffres.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-[#E8F2EE] text-[#1C4A3E] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F2937]">Aucun coffre pour le moment</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              Créez votre premier coffre d'épargne dès aujourd'hui pour organiser vos objectifs personnels. C'est 100% gratuit et sans limite.
            </p>
            <button
              onClick={surOuvrirNouveauCoffre}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1C4A3E] text-white px-4 py-2 text-xs font-semibold hover:bg-[#0F2E26] transition"
            >
              <Plus className="w-4 h-4 text-[#D9E9E2]" />
              <span>Créer mon premier coffre</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {coffres.map((coffre) => (
              <CoffreCard
                key={coffre.id}
                coffre={coffre}
                surSelectionner={surSelectionnerCoffre}
                surDeposerRapide={surDeposerDansCoffre}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION : ACTIVITÉS & HISTORIQUE RÉCENT */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1C4A3E]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F2E26]">Dernières opérations</h2>
          </div>
          <button
            onClick={surVoirHistorique}
            className="text-xs font-semibold text-[#1C4A3E] hover:underline"
          >
            Voir tout l'historique
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F3F4F6] overflow-hidden shadow-xs">
          {transactionsRecentes.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7280]">
              Aucune opération enregistrée pour le moment.
            </div>
          ) : (
            transactionsRecentes.map((tx) => {
              const estDepot = tx.type === 'DEPOT';
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        estDepot ? 'bg-[#E8F2EE] text-[#1C4A3E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {estDepot ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">
                        {estDepot ? 'Dépôt' : 'Retrait'} — {tx.coffreNom}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                        <span className="font-mono">{tx.referenceInterne}</span>
                        <span>·</span>
                        <span>{formatDateFr(tx.dateCreation)}</span>
                      </div>
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
                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1C4A3E] mt-0.5">
                      Succès
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
