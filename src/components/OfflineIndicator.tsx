import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="indicateur-hors-ligne"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 rounded-lg bg-[#1F2937] text-white px-3.5 py-2.5 text-xs font-medium shadow-lg border border-gray-700"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Mode hors ligne actif — Vos données locales sont préservées</span>
    </div>
  );
};
