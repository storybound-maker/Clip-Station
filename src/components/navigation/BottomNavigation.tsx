import React from 'react';
import { Home, FolderOpen, Plus, SlidersHorizontal, Settings } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { NavigationTab } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useProject();

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; isAction?: boolean }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'new_project', label: 'New', icon: <Plus className="w-5 h-5 stroke-[3]" />, isAction: true },
    { id: 'editor', label: 'Editor', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#0A0A0A] border-t border-[#1A1A1A] backdrop-blur-md px-4 flex items-center justify-around z-40 select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative -top-3 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="New Project"
            >
              {item.icon}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-all active:scale-95 cursor-pointer ${
              isActive ? 'text-white' : 'text-[#666666] hover:text-zinc-300'
            }`}
          >
            <div className={`p-0.5 transition-all ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider ${
                isActive ? 'text-white font-extrabold' : 'text-[#666666]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

