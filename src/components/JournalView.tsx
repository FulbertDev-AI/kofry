import React, { useState } from 'react';
import { 
  FileText, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  Edit, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  CheckCircle2, 
  Sliders,
  Calendar,
  Search
} from 'lucide-react';
import { JournalEvent, TypeJournal } from '../types';
import { formatDateFr, formatDateTimeFr } from '../services/kofryEngine';

interface JournalViewProps {
  journal: JournalEvent[];
}

export const JournalView: React.FC<JournalViewProps> = ({ journal }) => {
  const [recherche, setRecherche] = useState('');

  const getIconEtCouleur = (type: TypeJournal) => {
    switch (type) {
      case 'CONNEXION':
      case 'DECONNEXION':
        return { icon: LogIn, bg: 'bg-[#E8F2EE]', text: 'text-[#1C4A3E]' };
      case 'CREATION_COFFRE':
        return { icon: PlusCircle, bg: 'bg-[#E8F2EE]', text: 'text-[#1C4A3E]' };
      case 'MODIFICATION_COFFRE':
      case 'CHANGEMENT_MINIMUM':
      case 'CHANGEMENT_OBJECTIF':
      case 'CHANGEMENT_DATE':
        return { icon: Sliders, bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]' };
      case 'DEPOT':
        return { icon: ArrowDownLeft, bg: 'bg-[#E8F2EE]', text: 'text-[#10B981]' };
      case 'RETRAIT':
        return { icon: ArrowUpRight, bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' };
      case 'SUPPRESSION_COFFRE':
        return { icon: Trash2, bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' };
      case 'OBJECTIF_ATTEINT':
        return { icon: CheckCircle2, bg: 'bg-[#FEF3C7]', text: 'text-[#D4AF37]' };
      default:
        return { icon: FileText, bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]' };
    }
  };

  const journalFiltre = journal.filter((evt) =>
    evt.description.toLowerCase().includes(recherche.toLowerCase()) ||
    (evt.coffreNom && evt.coffreNom.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E26]">
              Journal d'activité
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F2EE] text-[#1C4A3E]">
              {journal.length} événements
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Audit chronologique immuable des actions effectuées sur votre espace Kofry.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher dans le journal..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] focus:border-[#1C4A3E] focus:outline-hidden focus:ring-1 focus:ring-[#1C4A3E]"
          />
        </div>
      </div>

      {/* Liste chronologique */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
        {journalFiltre.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Aucun événement enregistré dans le journal.
          </div>
        ) : (
          <div className="relative border-l-2 border-[#E8F2EE] ml-4 sm:ml-6 pl-5 sm:pl-7 space-y-6 py-2">
            {journalFiltre.map((evt) => {
              const { icon: Icon, bg, text } = getIconEtCouleur(evt.type);
              return (
                <div key={evt.id} className="relative group">
                  {/* Point sur la timeline */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-0.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full ${bg} ${text} border-2 border-white flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Contenu de l'événement */}
                  <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100 hover:border-[#1C4A3E]/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#6B7280] mb-1">
                      <span className="font-semibold text-[#1C4A3E] uppercase tracking-wider text-[10px]">
                        {evt.type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[11px]">
                        {formatDateTimeFr(evt.date)}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1F2937] mt-1">
                      {formatDateFr(evt.date)} — {evt.description}
                    </p>

                    {evt.coffreNom && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2EE] text-[#1C4A3E]">
                          Coffre : {evt.coffreNom}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
