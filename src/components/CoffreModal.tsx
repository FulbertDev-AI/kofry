import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { Coffre } from '../types';
import { formatFCFA } from '../services/kofryEngine';

interface CoffreModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surEnregistrer: (donnees: {
    nom: string;
    description?: string;
    montantObjectif: number;
    minimumQuotidien: number;
    dateCible?: string;
  }) => void;
  coffreAEditer?: Coffre | null;
}

export const CoffreModal: React.FC<CoffreModalProps> = ({
  ouvert,
  surFermer,
  surEnregistrer,
  coffreAEditer,
}) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [montantObjectif, setMontantObjectif] = useState('');
  const [minimumQuotidien, setMinimumQuotidien] = useState('2000');
  const [dateCible, setDateCible] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (coffreAEditer) {
      setNom(coffreAEditer.nom);
      setDescription(coffreAEditer.description || '');
      setMontantObjectif(coffreAEditer.montantObjectif.toString());
      setMinimumQuotidien(coffreAEditer.minimumQuotidien.toString());
      setDateCible(coffreAEditer.dateCible || '');
    } else {
      setNom('');
      setDescription('');
      setMontantObjectif('');
      setMinimumQuotidien('2000');
      setDateCible('');
    }
    setErreur(null);
  }, [coffreAEditer, ouvert]);

  if (!ouvert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    const obj = parseFloat(montantObjectif);
    const minQ = parseFloat(minimumQuotidien);

    if (!nom.trim()) {
      setErreur('Le nom du coffre est requis.');
      return;
    }
    if (isNaN(obj) || obj <= 0) {
      setErreur("L'objectif d'épargne doit être un montant supérieur à 0 FCFA.");
      return;
    }
    if (isNaN(minQ) || minQ <= 0) {
      setErreur('Le montant minimum quotidien doit être supérieur à 0 FCFA.');
      return;
    }
    if (minQ > obj) {
      setErreur("Le montant minimum quotidien ne peut pas dépasser l'objectif total du coffre.");
      return;
    }

    surEnregistrer({
      nom: nom.trim(),
      description: description.trim() || undefined,
      montantObjectif: obj,
      minimumQuotidien: minQ,
      dateCible: dateCible || undefined,
    });
  };

  const estEdition = Boolean(coffreAEditer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-8">
        {/* En-tête */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E8F2EE] text-[#1C4A3E]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F2E26]">
                {estEdition ? 'Modifier le coffre' : 'Créer un nouveau coffre'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {estEdition ? 'Ajustez les paramètres de votre objectif' : 'Définissez votre nouvel objectif personnel d’épargne'}
              </p>
            </div>
          </div>
          <button
            onClick={surFermer}
            className="text-[#6B7280] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge 100% Gratuit / Sans Quota */}
        {!estEdition && (
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-[#E8F2EE] text-[#1C4A3E] text-xs font-medium border border-[#D9E9E2]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>Création 100% gratuite · Nombre illimité de coffres · Aucun frais d'activation</span>
          </div>
        )}

        {erreur && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{erreur}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nom du coffre */}
          <div>
            <label htmlFor="input-nom-coffre" className="block text-xs font-semibold text-[#1F2937] mb-1">
              Nom du coffre <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="input-nom-coffre"
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Achat Ordinateur, Fonds d'urgence, Voyage..."
              className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
            />
          </div>

          {/* Description facultative */}
          <div>
            <label htmlFor="input-desc-coffre" className="block text-xs font-semibold text-[#1F2937] mb-1">
              Description <span className="text-[#6B7280] font-normal">(Facultative)</span>
            </label>
            <textarea
              id="input-desc-coffre"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisions sur ce projet ou motivation personnelle..."
              className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Montant Objectif */}
            <div>
              <label htmlFor="input-objectif-coffre" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Objectif d'épargne (FCFA) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                id="input-objectif-coffre"
                type="number"
                min="1000"
                step="500"
                required
                value={montantObjectif}
                onChange={(e) => setMontantObjectif(e.target.value)}
                placeholder="Ex: 350000"
                className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
              />
              {montantObjectif && !isNaN(Number(montantObjectif)) && (
                <p className="mt-1 text-[11px] font-medium text-[#1C4A3E]">
                  {formatFCFA(Number(montantObjectif))}
                </p>
              )}
            </div>

            {/* Minimum quotidien propre au coffre */}
            <div>
              <label htmlFor="input-minimum-quotidien" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Minimum quotidien (FCFA) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                id="input-minimum-quotidien"
                type="number"
                min="500"
                step="500"
                required
                value={minimumQuotidien}
                onChange={(e) => setMinimumQuotidien(e.target.value)}
                placeholder="Ex: 2000"
                className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
              />
              {minimumQuotidien && !isNaN(Number(minimumQuotidien)) && (
                <p className="mt-1 text-[11px] font-medium text-[#1C4A3E]">
                  {formatFCFA(Number(minimumQuotidien))}
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#6B7280] leading-snug">
            Montant minimum à épargner lors de chaque dépôt quotidien pour ce coffre.
          </p>

          {/* Date cible facultative */}
          <div>
            <label htmlFor="input-date-cible" className="block text-xs font-semibold text-[#1F2937] mb-1">
              Date cible / Échéance <span className="text-[#6B7280] font-normal">(Facultative)</span>
            </label>
            <div className="relative">
              <input
                id="input-date-cible"
                type="date"
                value={dateCible}
                onChange={(e) => setDateCible(e.target.value)}
                className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Cette date est uniquement un repère personnel. Aucun frais ni pénalité n'y sera jamais associé.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={surFermer}
              className="px-4 py-2.5 text-xs font-medium text-[#4B5563] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-valider-coffre"
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1C4A3E] hover:bg-[#0F2E26] rounded-lg shadow-xs transition-colors"
            >
              {estEdition ? 'Enregistrer les modifications' : 'Créer le coffre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
