import React, { useState } from 'react';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../types';
import { formatFCFA, formatDateFr, formatDateTimeFr } from '../services/kofryEngine';

interface HistoriqueViewProps {
  transactions: Transaction[];
  surSelectionnerCoffreParId?: (coffreId: string) => void;
}

export const HistoriqueView: React.FC<HistoriqueViewProps> = ({
  transactions,
  surSelectionnerCoffreParId,
}) => {
  const [filtreType, setFiltreType] = useState<'TOUS' | 'DEPOT' | 'RETRAIT'>('TOUS');
  const [recherche, setRecherche] = useState('');

  const transactionsFiltrees = transactions.filter((tx) => {
    const correspondType = filtreType === 'TOUS' || tx.type === filtreType;
    const correspondRecherche =
      tx.coffreNom.toLowerCase().includes(recherche.toLowerCase()) ||
      tx.referenceInterne.toLowerCase().includes(recherche.toLowerCase()) ||
      (tx.numeroMobileMoney && tx.numeroMobileMoney.includes(recherche));
    return correspondType && correspondRecherche;
  });

  const totalDepots = transactions
    .filter((t) => t.type === 'DEPOT' && t.statut === 'REUSSI')
    .reduce((acc, t) => acc + t.montant, 0);

  const totalRetraits = transactions
    .filter((t) => t.type === 'RETRAIT' && t.statut === 'REUSSI')
    .reduce((acc, t) => acc + t.montant, 0);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
              Historique des opérations
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F2EE] text-[#1C4A3E]">
              {transactions.length}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Traçabilité complète de l'ensemble de vos dépôts et retraits Mobile Money.
          </p>
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Total des dépôts
            </span>
            <p className="text-2xl font-bold text-[#10B981] mt-1">
              +{formatFCFA(totalDepots)}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Vers vos coffres personnels</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8F2EE] text-[#1C4A3E]">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Total des retraits
            </span>
            <p className="text-2xl font-bold text-[#EF4444] mt-1">
              -{formatFCFA(totalRetraits)}
            </p>
            <p className="text-[11px] text-[#10B981] font-medium mt-0.5">0 FCFA de frais appliqués</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#FEE2E2] text-[#EF4444]">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Filtres par type */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFiltreType('TOUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtreType === 'TOUS'
                ? 'bg-[#1C4A3E] text-white'
                : 'bg-[#F4F6F5] text-[#4B5563] hover:bg-[#E8F2EE]'
            }`}
          >
            Toutes ({transactions.length})
          </button>
          <button
            onClick={() => setFiltreType('DEPOT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtreType === 'DEPOT'
                ? 'bg-[#1C4A3E] text-white'
                : 'bg-[#F4F6F5] text-[#4B5563] hover:bg-[#E8F2EE]'
            }`}
          >
            Dépôts
          </button>
          <button
            onClick={() => setFiltreType('RETRAIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtreType === 'RETRAIT'
                ? 'bg-[#1C4A3E] text-white'
                : 'bg-[#F4F6F5] text-[#4B5563] hover:bg-[#E8F2EE]'
            }`}
          >
            Retraits
          </button>
        </div>

        {/* Recherche textuelle */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par coffre ou référence..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
          />
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-xs divide-y divide-[#F3F4F6]">
        {transactionsFiltrees.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Aucune opération ne correspond à vos critères de recherche.
          </div>
        ) : (
          transactionsFiltrees.map((tx) => {
            const estDepot = tx.type === 'DEPOT';
            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                      estDepot ? 'bg-[#E8F2EE] text-[#1C4A3E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                    }`}
                  >
                    {estDepot ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1F2937]">
                        {estDepot ? 'Dépôt' : 'Retrait'} — {tx.coffreNom}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2EE] text-[#1C4A3E]">
                        {tx.statut === 'REUSSI' ? 'Succès' : tx.statut}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6B7280]">
                      <span className="font-mono text-[#1F2937] font-semibold">{tx.referenceInterne}</span>
                      <span>·</span>
                      <span>{formatDateTimeFr(tx.dateCreation)}</span>
                      {tx.operateur && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563]">
                            <Smartphone className="w-3 h-3" />
                            {tx.operateur}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <span
                    className={`text-base sm:text-lg font-bold ${
                      estDepot ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {estDepot ? '+' : '-'} {formatFCFA(tx.montant)}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    {estDepot ? 'Crédité sur le coffre' : 'Sans frais ni retenue'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
