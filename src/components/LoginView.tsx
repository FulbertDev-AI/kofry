import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { KofryEngine } from '../services/kofryEngine';

interface LoginViewProps {
  surConnexionReussie: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ surConnexionReussie }) => {
  const [identifiant, setIdentifiant] = useState('kofry');
  const [motDePasse, setMotDePasse] = useState('kofry2026');
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [modaleAide, setModaleAide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    setTimeout(() => {
      const res = KofryEngine.connecter(identifiant, motDePasse);
      if (res.succes) {
        surConnexionReussie();
      } else {
        setErreur(res.message);
      }
      setChargement(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F4F6F5]">
      {/* Conteneur de carte de connexion */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 sm:p-8">
        {/* En-tête / Logo institutionnel */}
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#1C4A3E] flex items-center justify-center text-white shadow-xs mb-4">
            <Lock className="w-7 h-7 text-[#D9E9E2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
            Bienvenue sur Kofry
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Votre espace personnel d'épargne par objectifs.
          </p>
        </div>

        {/* Message d'avertissement espace strictement privé */}
        <div className="mt-6 flex items-start gap-2.5 p-3 rounded-lg bg-[#E8F2EE] border border-[#D9E9E2] text-xs text-[#1C4A3E]">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#1C4A3E]" />
          <p className="leading-relaxed">
            Cet espace est privé et réservé à son propriétaire.
          </p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{erreur}</p>
          </div>
        )}

        {/* Formulaire de connexion privée */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-identifiant" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              Identifiant propriétaire
            </label>
            <div className="relative">
              <input
                id="login-identifiant"
                type="text"
                required
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Ex: kofry"
                className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#1F2937]">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setModaleAide(true)}
                className="text-xs font-medium text-[#1C4A3E] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E] transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-se-connecter"
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1C4A3E] py-3 px-4 text-sm font-semibold text-white hover:bg-[#0F2E26] shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#D9E9E2]" />
              <span>{chargement ? 'Vérification...' : 'Se connecter'}</span>
            </button>
          </div>
        </form>

      </div>

      {/* Modal d'information mot de passe oublié */}
      {modaleAide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#E8F2EE]">
                  <HelpCircle className="w-5 h-5 text-[#1C4A3E]" />
                </div>
                <h3 className="text-base font-semibold text-[#1F2937]">Récupération d'accès</h3>
              </div>
              <button
                onClick={() => setModaleAide(false)}
                className="text-[#6B7280] hover:text-[#1F2937] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#4B5563] leading-relaxed">
              <p>
                Kofry est un espace strictement privé et autonome conçu pour son propriétaire unique (<strong>Nanga</strong>).
              </p>
              <p>
                Il n'y a pas de serveur public ni d'inscription ouverte. Vos clés de sécurité par défaut sont :
              </p>
              <div className="p-3 bg-[#F4F6F5] rounded-lg font-mono text-xs text-[#1C4A3E] space-y-1">
                <div>Identifiant : <strong>kofry</strong></div>
                <div>Mot de passe : <strong>kofry2026</strong></div>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Vous pourrez également réinitialiser vos paramètres depuis l'onglet Paramètres une fois connecté.
              </p>
            </div>

            <button
              onClick={() => setModaleAide(false)}
              className="mt-5 w-full rounded-lg bg-[#1C4A3E] py-2.5 text-xs font-medium text-white hover:bg-[#0F2E26] transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Footer minimaliste */}
      <footer className="mt-8 text-center text-xs text-[#6B7280]">
        <p>Kofry · Coffre-fort numérique personnel d'épargne · FCFA</p>
      </footer>
    </div>
  );
};
