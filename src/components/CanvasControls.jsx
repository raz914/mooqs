import React from 'react';
import { RotateCcw, RotateCw, Cloud, Plus, Box, Layout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CanvasControls = ({ viewMode, setViewMode, onNewDesign, isSaving }) => {
    const { t } = useLanguage();

    return (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between select-none">
            <div className="flex justify-between items-start pointer-events-auto">
                <div className="flex gap-2">
                    <div className="flex bg-white/95 backdrop-blur-md rounded-full p-1 border border-black/10 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                        <button className="p-2 text-black/40 hover:text-black transition-colors"><RotateCcw size={18} /></button>
                        <div className="w-[1px] bg-black/10 mx-1 self-stretch"></div>
                        <button className="p-2 text-black/40 hover:text-black transition-colors"><RotateCw size={18} /></button>
                    </div>

                    <button className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 text-[11px] font-bold text-black/60 shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all">
                        {isSaving ? (
                            <>
                                <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Cloud size={14} className="text-green-500/70" /> {t('saved')}
                            </>
                        )}
                    </button>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all backdrop-blur-md ${viewMode === '2d'
                            ? 'bg-black text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
                            : 'bg-white/95 text-black/70 border border-black/10 hover:bg-white'}`}
                    >
                        <Layout size={16} /> {t('topView')}
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all backdrop-blur-md ${viewMode === '3d'
                            ? 'bg-black text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
                            : 'bg-white/95 text-black/70 border border-black/10 hover:bg-white'}`}
                    >
                        <Box size={16} /> {t('threeDView')}
                    </button>
                </div>

                <button
                    onClick={onNewDesign}
                    className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-black/10 text-[11px] font-bold text-black hover:bg-white transition-all pointer-events-auto shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
                >
                    <Plus size={16} /> {t('newDesign')}
                </button>
            </div>

        </div>
    );
};

export default CanvasControls;
