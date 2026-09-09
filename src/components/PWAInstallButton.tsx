import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si déjà installé en mode autonome, ne rien afficher
  if (isInstalled) {
    return null;
  }

  // Si installable sur Chromium / Android / Desktop
  if (isInstallable) {
    return (
      <button
        id="btn-installer-pwa"
        onClick={install}
        className={`flex items-center gap-2 rounded-lg bg-[#1C4A3E] px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#0F2E26] transition-colors ${className}`}
        title="Installer Kofry sur cet appareil"
      >
        <Download className="w-4 h-4 text-[#D9E9E2]" />
        {!compact && <span>Installer l'application</span>}
      </button>
    );
  }

  // Sur iOS Safari (beforeinstallprompt n'existe pas sous WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="btn-installer-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-lg border border-[#D9E9E2] bg-[#E8F2EE] px-3.5 py-2 text-xs font-medium text-[#1C4A3E] hover:bg-[#D9E9E2] transition-colors ${className}`}
          title="Installer sur iPhone ou iPad"
        >
          <Smartphone className="w-4 h-4 text-[#1C4A3E]" />
          {!compact && <span>Installer sur iOS</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#E8F2EE]">
                    <Smartphone className="w-5 h-5 text-[#1C4A3E]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1F2937]">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#4B5563]">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F2EE] text-xs font-semibold text-[#1C4A3E]">1</span>
                  <p>Touchez le bouton <strong>Partager</strong> dans la barre d'outils de Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F2EE] text-xs font-semibold text-[#1C4A3E]">2</span>
                  <p>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F2EE] text-xs font-semibold text-[#1C4A3E]">3</span>
                  <p>Validez en touchant <strong>Ajouter</strong> en haut à droite.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#1C4A3E] py-2.5 text-xs font-medium text-white hover:bg-[#0F2E26] transition-colors"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
