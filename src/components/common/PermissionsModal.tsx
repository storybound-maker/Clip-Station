import React from 'react';
import { ShieldAlert, Image, Video, Mic } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const PermissionsModal: React.FC = () => {
  const { permissionsGranted, setPermissionsGranted } = useProject();

  if (permissionsGranted) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white mb-1">
            Allow Clip Station access?
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Clip Station requires access to photos, videos, and media files on your device to import and edit video clips.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-zinc-400 py-1">
          <Video className="w-5 h-5" />
          <Image className="w-5 h-5" />
          <Mic className="w-5 h-5" />
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => setPermissionsGranted(true)}
            className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-xs shadow-lg hover:bg-zinc-200"
          >
            While using the app (Allow)
          </button>
          <button
            onClick={() => setPermissionsGranted(true)}
            className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700"
          >
            Only this time
          </button>
        </div>
      </div>
    </div>
  );
};
