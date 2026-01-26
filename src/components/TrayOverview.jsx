import React, { useState } from 'react';
import { FileText, Edit3, Download, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TrayOverview = ({ setShowOverview, selectedColor, onRequestQuote }) => {
    const [quantity, setQuantity] = useState(1);
    const { t } = useLanguage();

    const specs = [
        { label: t('trayType'), value: t('standard') },
        { label: t('dividers'), value: t('yesAdjustedSpc') },
        { label: t('modules'), value: t('earringsRings') },
        { label: t('material'), value: t('wood') },
        { label: t('color'), value: selectedColor ? selectedColor.name : t('black') },
    ];

    return (
        <div className="bg-[#111111] text-white flex flex-col select-none no-scrollbar min-h-full">
            <div className="p-8 pb-10 space-y-9 bg-[#111111] min-h-full flex flex-col">
                <div>
                    <h2 className="text-[32px] font-bold leading-tight mb-4 tracking-tight">{t('trayOverview')}</h2>
                    <p className="text-[14px] text-white/40 leading-relaxed max-w-[240px]">
                        {t('overviewDesc')}
                    </p>
                </div>

                <div className="space-y-8">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5">{t('specifications')}</p>
                        <div className="space-y-[1px]">
                            {specs.map((spec, i) => (
                                <div key={i} className="bg-black h-[50px] px-6 flex items-center text-[13px]">
                                    <span className="text-white/50 w-20 shrink-0 font-normal">{spec.label}</span>
                                    <span className="text-white/30 w-4 flex justify-center font-bold">:</span>
                                    <span className="text-white font-medium flex-1 text-right tracking-tight whitespace-nowrap">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5">{t('quantity')}</p>
                        <div className="flex items-center gap-[4px]">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-11 bg-white flex items-center justify-center text-black rounded-[2px] hover:bg-white/90 transition-colors"
                            >
                                <Minus size={20} />
                            </button>
                            <div className="w-20 h-11 bg-[#333333] flex items-center justify-center text-[16px] font-medium rounded-[2px]">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-11 bg-white flex items-center justify-center text-black rounded-[2px] hover:bg-white/90 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-[40px]"></div>

                <div className="space-y-3">
                    <button
                        onClick={onRequestQuote}
                        className="w-full bg-white text-black font-semibold py-4 rounded-full flex items-center justify-center gap-3 text-[16px] hover:bg-white/90 transition-colors"
                    >
                        <FileText size={20} /> {t('requestQuote')}
                    </button>

                    <button
                        onClick={() => setShowOverview(false)}
                        className="w-full bg-transparent text-white border border-white/20 font-semibold py-4 rounded-full flex items-center justify-center gap-3 text-[16px] hover:bg-white/10 transition-colors"
                    >
                        <Edit3 size={20} /> {t('editConfiguration')}
                    </button>

                    <button className="w-full bg-transparent text-white border border-white/20 font-semibold py-4 rounded-full flex items-center justify-center gap-3 text-[16px] hover:bg-white/10 transition-colors">
                        <Download size={20} /> {t('download3DModel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrayOverview;
