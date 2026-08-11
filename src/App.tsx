import React, { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { PhoneFrame } from './components/common/PhoneFrame';
import { HomeScreen } from './components/home/HomeScreen';
import { ProjectsScreen } from './components/projects/ProjectsScreen';
import { NewProjectScreen } from './components/newProject/NewProjectScreen';
import { VideoEditor } from './components/editor/VideoEditor';
import { ExportScreen } from './components/export/ExportScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { PermissionsModal } from './components/common/PermissionsModal';

const LoadingScreen: React.FC = () => <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center"><div className="flex flex-col items-center"><div className="relative w-20 h-20 flex items-center justify-center"><div className="absolute inset-0 rounded-2xl border border-[#1A1A1A] shadow-[0_0_30px_rgba(255,255,255,.08)]" /><Scissors className="w-10 h-10 text-white" /></div><div className="mt-5 text-white text-sm font-black uppercase tracking-[0.35em]">Clip Station</div><div className="mt-2 text-[8px] font-mono uppercase tracking-[0.3em] text-[#555]">Preparing editor</div><div className="mt-5 w-28 h-px bg-[#1A1A1A] overflow-hidden"><div className="h-full w-1/2 bg-white animate-pulse" /></div></div></div>;

const AppContent: React.FC = () => {
  const { activeTab } = useProject();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return <>
    {loading && <LoadingScreen />}
    <PhoneFrame>
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#08090C]">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'projects' && <ProjectsScreen />}
        {activeTab === 'new_project' && <NewProjectScreen />}
        {activeTab === 'editor' && <VideoEditor />}
        {activeTab === 'export' && <ExportScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        <BottomNavigation />
        <PermissionsModal />
      </div>
    </PhoneFrame>
  </>;
};

export default function App() {
  return <ProjectProvider><AppContent /></ProjectProvider>;
}
