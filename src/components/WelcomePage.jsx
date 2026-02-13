import { X, Folder, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';
import TemplateCard from './TemplateCard';

const WelcomePage = ({ onSelectTemplate, onCreateNew, onClose, onViewAll }) => {
    const { t } = useLanguage();

    const templates = [
        { id: 1, name: `${t('watchTray')} 2:3`, color: 'bg-[#d4a373]', dims: { rows: 2, cols: 3 } },
        { id: 2, name: `${t('watchTray')} 2:2`, color: 'bg-[#4a4e69]', dims: { rows: 2, cols: 2 } },
        { id: 3, name: `${t('watchTray')} 2:1`, color: 'bg-[#22223b]', dims: { rows: 1, cols: 2 } },
        { id: 4, name: `${t('watchTray')} 2:1`, color: 'bg-[#22223b]', dims: { rows: 1, cols: 2 } },
        { id: 5, name: `${t('watchTray')} 2:3`, color: 'bg-[#d4a373]', dims: { rows: 2, cols: 3 } },
        { id: 6, name: `${t('watchTray')} 2:2`, color: 'bg-[#4a4e69]', dims: { rows: 2, cols: 2 } },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#000000] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors z-10"
                >
                    <X size={18} strokeWidth={3} />
                </button>

                <div className="px-12 pt-16 pb-10 flex flex-col items-center text-center">
                    {/* Official Logo Asset */}
                    <div className="flex items-center justify-center mb-8">
                        <img src={logo} alt="Mooqs Logo" className="h-20 w-auto" />
                    </div>

                    <h1 className="text-[34px] font-medium text-white mb-3 tracking-wide">{t('Welcome to Mooqs')}</h1>
                    <p className="text-[13px] text-white/45 max-w-md leading-relaxed font-light">
                        {t('Where modular design, refined materials, and personal style converge.')}
                    </p>
                </div>

                <div className="px-12 flex-1 overflow-y-auto no-scrollbar pb-12">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-[14px] font-medium text-white/70 mb-8 text-left">{t('Mooqs Tray Template')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onClick={onSelectTemplate}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Sticky at bottom of modal */}
                <div className="px-12 py-8 flex justify-between items-center bg-[#000000] border-t border-white/5">
                    <button
                        onClick={onViewAll}
                        className="flex items-center gap-2 px-5 py-2 border border-white/20 rounded-full text-[12px] font-medium text-white/60 hover:bg-white/5 transition-all text-left"
                    >
                        <Folder size={12} />
                        {t('View All')}
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="bg-white text-black px-6 py-2 rounded-full flex items-center gap-3 font-bold text-[12px] hover:bg-white/90 transition-all shadow-lg text-left"
                    >
                        <PlusSquare size={14} strokeWidth={2.5} />
                        {t('Create New Tray')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
