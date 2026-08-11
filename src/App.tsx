import React, { useState } from 'react';
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
import { SplashScreen } from './components/common/SplashScreen';

const AppContent: React.FC = () => {
  const { activeTab } = useProject();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <PhoneFrame>
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#08090C]">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

        {/* Render Active Screen */}
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'projects' && <ProjectsScreen />}
        {activeTab === 'new_project' && <NewProjectScreen />}
        {activeTab === 'editor' && <VideoEditor />}
        {activeTab === 'export' && <ExportScreen />}
        {activeTab === 'settings' && <SettingsScreen />}

        {/* Global Bottom Navigation */}
        <BottomNavigation />

        {/* Permissions Modal */}
        <PermissionsModal />
      </div>
    </PhoneFrame>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
