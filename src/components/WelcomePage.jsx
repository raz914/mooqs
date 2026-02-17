import { X, Folder, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';
import TemplateCard from './TemplateCard';
import img1 from '../assets/23.png';
import img2 from '../assets/60778f3eecc82deef9f3bde4bd9e8e47f7de01cb.jpg';
import img3 from '../assets/6bd9631aadf0dd9aa28bd96e84140f9823ab3979.jpg';
import img4 from '../assets/6e84a76d4ca3107eeb89114b5de640c46fe33a29.jpg';
import img5 from '../assets/e2bb20bf174169276637b7cb1a0553608d300664.jpg';
import img6 from '../assets/fc205cf7b6c93228345935e25f835f744058788b.png';

const WelcomePage = ({ onSelectTemplate, onCreateNew, onClose, onViewAll }) => {
    const { t } = useLanguage();

    const templates = [
        {
            id: 1,
            name: `${t('watchTray')} 1:1`,
            image: img1,
            dims: { width: 1590, height: 210, depth: 630, rows: 1, cols: 1, horizontalDividers: [], verticalDividers: [1160] }
        },
        {
            id: 2,
            name: `${t('watchTray')} 1:4`,
            image: img2,
            dims: { width: 1590, height: 210, depth: 630, rows: 1, cols: 1, horizontalDividers: [], verticalDividers: [240, 540, 900, 1230] }
        },
        {
            id: 3,
            name: `${t('watchTray')} 2:4`,
            image: img3,
            dims: {
                width: 1000, height: 100, depth: 600, rows: 2, cols: 5,
                verticalDividers: [200, 400, 600, 800],
                horizontalDividers: [
                    { pos: 300, start: 200, end: 400 },
                    { pos: 300, start: 400, end: 600 },
                    { pos: 300, start: 600, end: 800 }
                ]
            }
        },
        {
            id: 4,
            name: `${t('watchTray')} 2:2`,
            image: img4,
            dims: {
                width: 1000, height: 100, depth: 500, rows: 2, cols: 3,
                verticalDividers: [333, 666],
                horizontalDividers: [{ pos: 250, start: 333, end: 666 }]
            }
        },
        {
            id: 5,
            name: `${t('watchTray')} 2:4`,
            image: img5,
            dims: {
                width: 1000, height: 100, depth: 600, rows: 2, cols: 5,
                verticalDividers: [200, 400, 600, 800],
                horizontalDividers: [
                    { pos: 300, start: 200, end: 400 },
                    { pos: 300, start: 400, end: 600 },
                    { pos: 300, start: 600, end: 800 }
                ]
            }
        },

    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors z-10"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>

                <div className="px-8 pt-8 pb-4 flex flex-col items-center text-center">
                    {/* Official Logo Asset */}
                    <div className="flex items-center justify-center mb-4">
                        <img src={logo} alt="Mooqs Logo" className="h-10 w-auto" />
                    </div>

                    <h1 className="text-[22px] font-medium text-white mb-1.5 tracking-wide">{t('Welcome to Mooqs')}</h1>
                    <p className="text-[11px] text-white/45 max-w-sm leading-relaxed font-light">
                        {t('Where modular design, refined materials, and personal style converge.')}
                    </p>
                </div>

                <div className="px-8 flex-1 overflow-y-auto no-scrollbar pb-4">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-[11px] font-medium text-white/50 mb-4 text-left uppercase tracking-wider">{t('Mooqs Tray Template')}</h2>

                        <div className="grid grid-cols-3 gap-3">
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
                <div className="px-8 py-5 flex justify-between items-center bg-[#0a0a0a] border-t border-white/5">
                    <button
                        onClick={onViewAll}
                        className="flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded-full text-[11px] font-medium text-white/60 hover:bg-white/5 transition-all text-left"
                    >
                        <Folder size={11} />
                        {t('View All')}
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="bg-white text-black px-5 py-1.5 rounded-full flex items-center gap-2 font-bold text-[11px] hover:bg-white/90 transition-all shadow-lg text-left"
                    >
                        <PlusSquare size={12} strokeWidth={2.5} />
                        {t('Create New Tray')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
