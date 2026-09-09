import React from 'react';
import { Lock, Calendar, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Coffre } from '../types';
import { formatFCFA, formatDateFr } from '../services/kofryEngine';

interface CoffreCardProps {
  coffre: Coffre;
  surSelectionner: (coffre: Coffre) => void;
  surDeposerRapide?: (coffre: Coffre) => void;
}

export const CoffreCard: React.FC<CoffreCardProps> = ({
  coffre,
  surSelectionner,
  surDeposerRapide,
}) => {
  const pourcentage = Math.min(
    100,
    Math.round((coffre.soldeActuel / coffre.montantObjectif) * 100) || 0
  );
  const estAtteint = coffre.statut === 'OBJECTIF_ATTEINT' || coffre.soldeActuel >= coffre.montantObjectif;

  return (
    <div
      id={`coffre-card-${coffre.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
        estAtteint ? 'border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30' : 'border-[#E5E7EB] hover:border-[#1C4A3E]/30'
      }`}
    >
      <div>
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl flex items-center justify-center ${
                estAtteint ? 'bg-[#FFFBEB] text-[#D4AF37]' : 'bg-[#E8F2EE] text-[#1C4A3E]'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F2937] leading-snug">
                {coffre.nom}
              </h3>
              {coffre.description && (
                <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                  {coffre.description}
                </p>
              )}
            </div>
          </div>

          {/* Badge de statut */}
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
              estAtteint
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                : 'bg-[#E8F2EE] text-[#1C4A3E]'
            }`}
          >
            {estAtteint && <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />}
            {estAtteint ? 'Objectif atteint' : 'En cours'}
          </span>
        </div>

        {/* Montants : Solde actuel / Objectif */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#0F2E26]">
              {formatFCFA(coffre.soldeActuel)}
            </span>
            <span className="text-xs font-medium text-[#6B7280]">
              sur {formatFCFA(coffre.montantObjectif)}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mt-2.5">
            <div className="w-full bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  estAtteint ? 'bg-[#D4AF37]' : 'bg-[#1C4A3E]'
                }`}
                style={{ width: `${pourcentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="font-semibold text-[#1C4A3E]">{pourcentage} %</span>
              <span className="text-[11px] text-[#6B7280]">
                {estAtteint
                  ? 'Objectif complété'
                  : `Reste ${formatFCFA(Math.max(0, coffre.montantObjectif - coffre.soldeActuel))}`}
              </span>
            </div>
          </div>
        </div>

        {/* Règle du minimum quotidien et Date cible */}
        <div className="mt-4 pt-3 border-t border-[#F3F4F6] space-y-1.5 text-xs text-[#4B5563]">
          <div className="flex items-center justify-between text-[#1F2937]">
            <span className="text-[#6B7280]">Minimum quotidien :</span>
            <span className="font-semibold text-[#1C4A3E]">{formatFCFA(coffre.minimumQuotidien)}</span>
          </div>

          {coffre.dateCible ? (
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Date cible :</span>
              <span className="font-medium text-[#1F2937] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                {formatDateFr(coffre.dateCible)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span>Date cible :</span>
              <span>Non définie (sans échéance)</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA principal */}
      <div className="mt-5 pt-3 border-t border-[#F3F4F6] flex items-center gap-2">
        <button
          id={`btn-voir-${coffre.id}`}
          onClick={() => surSelectionner(coffre)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#F4F6F5] hover:bg-[#E8F2EE] text-[#1C4A3E] hover:text-[#0F2E26] py-2.5 px-3 text-xs font-semibold transition-colors"
        >
          <span>Voir le coffre</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {surDeposerRapide && (
          <button
            id={`btn-deposer-rapide-${coffre.id}`}
            onClick={() => surDeposerRapide(coffre)}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-[#1C4A3E] hover:bg-[#0F2E26] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            title="Ajouter à mon épargne"
          >
            Déposer
          </button>
        )}
      </div>
    </div>
  );
};
