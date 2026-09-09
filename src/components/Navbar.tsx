import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  History, 
  FileText, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Lock
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { Proprietaire } from '../types';

export type OngletActif = 'dashboard' | 'coffres' | 'historique' | 'journal' | 'parametres';

interface SidebarProps {
  ongletActif: OngletActif;
  surChangerOnglet: (onglet: OngletActif) => void;
  surOuvrirNouveauCoffre: () => void;
  surDeconnexion: () => void;
  proprietaire: Proprietaire;
  nombreCoffres: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  ongletActif,
  surChangerOnglet,
  surOuvrirNouveauCoffre,
  surDeconnexion,
  proprietaire,
  nombreCoffres,
}) => {
  const elementsNav = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'coffres' as const, label: 'Mes Coffres', icon: Layers, badge: nombreCoffres },
    { id: 'historique' as const, label: 'Historique', icon: History },
    { id: 'journal' as const, label: "Journal d'activité", icon: FileText },
    { id: 'parametres' as const, label: 'Paramètres & Tests', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#E5E7EB] bg-white h-screen sticky top-0 z-30 shrink-0">
      {/* Marque Kofry */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1C4A3E] flex items-center justify-center text-white shadow-sm">
              <Lock className="w-5 h-5 text-[#D9E9E2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F2E26]">Kofry</h1>
              <p className="text-[11px] font-medium text-[#6B7280]">Épargne privée par objectifs</p>
            </div>
          </div>
        </div>

        {/* Badge Espace Privé */}
        <div className="mt-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F2EE] text-[#1C4A3E] text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1C4A3E]" />
          <span>Espace propriétaire sécurisé</span>
        </div>
      </div>

      {/* Action rapide : Nouveau Coffre */}
      <div className="p-4">
        <button
          id="btn-sidebar-nouveau-coffre"
          onClick={surOuvrirNouveauCoffre}
          className="w-full flex items-center justify-center gap-2 bg-[#1C4A3E] hover:bg-[#0F2E26] text-white py-2.5 px-4 rounded-lg font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D9E9E2]" />
          <span>Nouveau coffre</span>
        </button>
      </div>

      {/* Liens de navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {elementsNav.map((item) => {
          const Icon = item.icon;
          const actif = ongletActif === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => surChangerOnglet(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                actif
                  ? 'bg-[#E8F2EE] text-[#1C4A3E] font-semibold'
                  : 'text-[#4B5563] hover:bg-[#F4F6F5] hover:text-[#1F2937]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${actif ? 'text-[#1C4A3E]' : 'text-[#6B7280]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    actif ? 'bg-[#1C4A3E] text-white' : 'bg-gray-100 text-[#4B5563]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pied de sidebar : Profil & Déconnexion */}
      <div className="p-4 border-t border-[#E5E7EB] space-y-3 bg-[#FAFAFA]">
        <PWAInstallButton className="w-full justify-center" />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#1C4A3E] font-semibold text-xs border border-[#D9E9E2]">
              {proprietaire.nomComplet.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1F2937] leading-tight">{proprietaire.nomComplet}</p>
              <p className="text-[11px] text-[#6B7280]">Propriétaire unique</p>
            </div>
          </div>
          <button
            id="btn-sidebar-deconnexion"
            onClick={surDeconnexion}
            className="p-1.5 text-[#6B7280] hover:text-[#EF4444] rounded-lg hover:bg-[#FEE2E2] transition-colors"
            title="Se déconnecter de l'espace privé"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface MobileHeaderProps {
  proprietaire: Proprietaire;
  surDeconnexion: () => void;
  surOuvrirNouveauCoffre: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  proprietaire,
  surDeconnexion,
  surOuvrirNouveauCoffre,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#1C4A3E] flex items-center justify-center text-white">
          <Lock className="w-4 h-4 text-[#D9E9E2]" />
        </div>
        <div>
          <span className="text-base font-bold text-[#0F2E26] tracking-tight">Kofry</span>
          <span className="ml-2 text-[10px] bg-[#E8F2EE] text-[#1C4A3E] font-medium px-2 py-0.5 rounded-sm">
            Privé
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="btn-mobile-header-nouveau-coffre"
          onClick={surOuvrirNouveauCoffre}
          className="p-2 rounded-lg bg-[#1C4A3E] text-white hover:bg-[#0F2E26] transition-colors"
          title="Nouveau coffre"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="btn-mobile-header-deconnexion"
          onClick={surDeconnexion}
          className="p-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

interface MobileBottomNavProps {
  ongletActif: OngletActif;
  surChangerOnglet: (onglet: OngletActif) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  ongletActif,
  surChangerOnglet,
}) => {
  const elements = [
    { id: 'dashboard' as const, label: 'Accueil', icon: LayoutDashboard },
    { id: 'coffres' as const, label: 'Coffres', icon: Layers },
    { id: 'historique' as const, label: 'Historique', icon: History },
    { id: 'journal' as const, label: 'Journal', icon: FileText },
    { id: 'parametres' as const, label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E7EB] px-2 py-1.5 flex items-center justify-around safe-bottom shadow-lg">
      {elements.map((item) => {
        const Icon = item.icon;
        const actif = ongletActif === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => surChangerOnglet(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              actif ? 'text-[#1C4A3E]' : 'text-[#6B7280]'
            }`}
          >
            <div className={`p-1 rounded-md ${actif ? 'bg-[#E8F2EE]' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-[10px] mt-0.5 ${actif ? 'font-semibold text-[#1C4A3E]' : 'font-normal'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
