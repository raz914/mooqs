import React from 'react';
import { ChevronDown, Plus, Trash2, FileText, Maximize, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ dimensions, setDimensions, setShowOverview, colors, selectedColor, setSelectedColor, onRequestQuote }) => {
    const { t } = useLanguage();
    const handleChange = (key, value) => {
        const val = parseInt(value);
        if (key === 'rows') {
            const count = val - 1;
            const spacing = dimensions.depth / val;
            const newDividers = Array.from({ length: count }, (_, i) => Math.round((i + 1) * spacing));
            setDimensions(prev => ({ ...prev, [key]: val, horizontalDividers: newDividers }));
        } else if (key === 'cols') {
            const count = val - 1;
            const spacing = dimensions.width / val;
            const newDividers = Array.from({ length: count }, (_, i) => Math.round((i + 1) * spacing));
            setDimensions(prev => ({ ...prev, [key]: val, verticalDividers: newDividers }));
        } else {
            setDimensions(prev => ({ ...prev, [key]: val }));
        }
    };

    return (
        <div className="bg-[#0d0d0d] text-white flex flex-col select-none no-scrollbar">
            <div className="p-4 pb-12 space-y-6 bg-[#171717]">
                {/* Tray Size Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/50">{t('traySize')}</h3>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-[10px]">
                            {t('millimeter')} <ChevronDown size={12} className="text-white/40" />
                        </div>
                    </div>

                    <div className="bg-black p-4">
                        {[
                            { label: t('width'), key: 'width', min: 400, max: 2000, desc: t('widthDesc') },
                            { label: t('depth'), key: 'depth', min: 300, max: 1200, desc: t('depthDesc') },
                            { label: t('height'), key: 'height', min: 20, max: 500, desc: t('heightDesc') },
                            { label: t('gridRows'), key: 'rows', min: 1, max: 6, desc: t('rowsDesc') },
                            { label: t('gridCols'), key: 'cols', min: 1, max: 6, desc: t('colsDesc') },
                        ].map((item, index) => {
                            const progress = ((dimensions[item.key] - item.min) / (item.max - item.min)) * 100;
                            return (
                                <div key={item.key} className={index !== 0 ? "mt-6" : ""}>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[14px] font-normal text-white/90">{item.label}</label>
                                        <div className="bg-[#1a1a1a] px-3 py-1 rounded border border-white/10 text-[13px] font-medium min-w-[36px] text-center">
                                            {dimensions[item.key]}
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={dimensions[item.key]}
                                        onChange={(e) => handleChange(item.key, e.target.value)}
                                        className="custom-range"
                                        style={{ '--range-progress': `${progress}%` }}
                                    />
                                    <p className="text-[11px] text-white/30 mt-2 font-normal">{item.desc}</p>
                                    <hr className="border-white/5 mt-4" />
                                </div>
                            );
                        })}

                        <div className="pt-6 border-white/5">
                            <p className="text-[11px] text-white/50 mb-3 uppercase tracking-wider font-bold">{t('trayFinish')}</p>
                            <div className="flex gap-1 p-1 bg-white/5 rounded-full overflow-hidden">
                                <button className="flex-1 text-[11px] py-1.5 px-3 rounded-full bg-white text-black font-semibold">{t('leatherWithVelvet')}</button>
                                <button className="flex-1 text-[11px] py-1.5 px-3 rounded-full text-white/40 font-medium">{t('fullLeather')}</button>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Top Cover */}
                <div className="flex justify-between items-center">
                    <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/50">{t('topCover')}</h3>
                    <div className="w-8 h-4 bg-white/20 rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white/40 rounded-full"></div>
                    </div>
                </div>

                <hr className="border-white/5" />

                {/* Horizontal Dividers */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/50">{t('horizontalDividers')}</h3>
                        <button
                            onClick={() => {
                                setDimensions(prev => ({
                                    ...prev,
                                    horizontalDividers: [...(prev.horizontalDividers || []), prev.depth / 2]
                                }));
                            }}
                            className="p-1 bg-white rounded-sm hover:bg-white/90 transition-colors"
                        >
                            <Plus size={14} className="text-black" />
                        </button>
                    </div>

                    <div className="bg-black p-4">
                        {(dimensions.horizontalDividers || []).map((pos, index) => (
                            <div key={index} className={index !== 0 ? "mt-6 pt-6 border-t border-white/5" : ""}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[15px] font-normal text-white/90">{t('yDivider')} {(index + 1).toString().padStart(2, '0')}</span>
                                    <div className="flex items-center gap-3">
                                        <Trash2
                                            size={16}
                                            className="text-white/30 cursor-pointer hover:text-white/50 transition-colors"
                                            onClick={() => {
                                                setDimensions(prev => ({
                                                    ...prev,
                                                    horizontalDividers: prev.horizontalDividers.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        />
                                        <div className="bg-[#1a1a1a] px-3 py-1 rounded border border-white/10 text-[13px] font-medium min-w-[50px] text-center">
                                            {pos}mm
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={dimensions.depth}
                                    value={pos}
                                    onChange={(e) => {
                                        const newVal = parseInt(e.target.value);
                                        setDimensions(prev => {
                                            const newDividers = [...prev.horizontalDividers];
                                            newDividers[index] = newVal;
                                            return { ...prev, horizontalDividers: newDividers };
                                        });
                                    }}
                                    className="custom-range"
                                    style={{ '--range-progress': `${(pos / dimensions.depth) * 100}%` }}
                                />
                                <p className="text-[12px] text-white/30 mt-3 font-normal">{t('fromFront')}</p>
                            </div>
                        ))}
                        {(dimensions.horizontalDividers || []).length === 0 && (
                            <p className="text-[12px] text-white/30 text-center py-2 italic">No horizontal dividers</p>
                        )}
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Vertical Dividers */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/50">{t('verticalDividers')}</h3>
                        <button
                            onClick={() => {
                                setDimensions(prev => ({
                                    ...prev,
                                    verticalDividers: [...(prev.verticalDividers || []), prev.width / 2]
                                }));
                            }}
                            className="p-1 bg-white rounded-sm hover:bg-white/90 transition-colors"
                        >
                            <Plus size={14} className="text-black" />
                        </button>
                    </div>
                    <div className="bg-black p-4">
                        {(dimensions.verticalDividers || []).map((pos, index) => (
                            <div key={index} className={index !== 0 ? "mt-6 pt-6 border-t border-white/5" : ""}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[11px] text-white/70">{t('xDivider')} {(index + 1).toString().padStart(2, '0')}</span>
                                    <div className="flex gap-2">
                                        <Trash2
                                            size={12}
                                            className="text-white/30 cursor-pointer hover:text-white/50 transition-colors"
                                            onClick={() => {
                                                setDimensions(prev => ({
                                                    ...prev,
                                                    verticalDividers: prev.verticalDividers.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        />
                                        <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] ">{pos}mm</div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={dimensions.width}
                                    value={pos}
                                    onChange={(e) => {
                                        const newVal = parseInt(e.target.value);
                                        setDimensions(prev => {
                                            const newDividers = [...prev.verticalDividers];
                                            newDividers[index] = newVal;
                                            return { ...prev, verticalDividers: newDividers };
                                        });
                                    }}
                                    className="custom-range"
                                    style={{ '--range-progress': `${(pos / dimensions.width) * 100}%` }}
                                />
                                <p className="text-[11px] text-white/30 mt-2">{t('fromLeft')}</p>
                            </div>
                        ))}
                        {(dimensions.verticalDividers || []).length === 0 && (
                            <p className="text-[12px] text-white/30 text-center py-2 italic">No vertical dividers</p>
                        )}
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Modules */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/50">{t('modules')}</h3>
                        <button className="p-1 bg-white rounded-sm"><Plus size={14} className="text-black" /></button>
                    </div>
                    <div className="bg-black p-3 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] text-white/90">{t('glasses')} 01 <Maximize size={10} className="inline ml-1 opacity-40" /></span>
                            <ChevronDown size={14} className="opacity-40" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] text-white/30">{t('finish')}</span>
                            <div className="flex gap-1 p-0.5 bg-black/40 rounded-full border border-white/5">
                                <span className="text-[8px] px-2 py-0.5 bg-white text-black rounded-full font-bold">{t('leatherWithVelvet')}</span>
                                <span className="text-[8px] px-2 py-0.5 text-white/40 rounded-full font-bold">{t('fullLeather')}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-white/30 uppercase tracking-wider">
                            <div className="flex items-center gap-1">{t('size')} <span className="text-white/60 ml-1">W</span> <span className="bg-white/10 px-1 rounded text-white">02</span> <span className="text-white/60 ml-1">H</span> <span className="bg-white/10 px-1 rounded text-white ">02</span> <span className="text-white/60 ml-1">D</span> <span className="bg-white/10 px-1 rounded text-white ">02</span></div>
                            <RotateCcw size={10} />
                        </div>
                    </div>
                </section>

                {/* Color Palette */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <p className="text-[13px] font-bold tracking-wider text-white/90 uppercase">{t('selectColor')}</p>
                        <p className="text-[15px] text-white font-medium">{selectedColor?.name || t('gray')}</p>
                    </div>
                    <div className="bg-black p-5 rounded-2xl">
                        <div className="grid grid-cols-5 gap-3">
                            {colors?.map((colorObj, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (selectedColor?.name === colorObj.name) {
                                            setSelectedColor(null);
                                        } else {
                                            setSelectedColor(colorObj);
                                        }
                                    }}
                                    className={`w-10 h-10 rounded-xl shadow-inner cursor-pointer transition-all border-2 ${colorObj.class} ${selectedColor?.name === colorObj.name
                                        ? 'border-[4px] border-white shadow-[0_0_10px_rgba(255,255,255,0.2)] scale-110'
                                        : 'border-white/5 hover:border-white/20'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Request Quote Button */}
                <div className="mt-8">
                    <button
                        onClick={() => {
                            onRequestQuote();
                            setShowOverview(true);
                        }}
                        className="w-full bg-white text-black font-semibold py-4 rounded-full flex items-center justify-center gap-3 text-[18px] hover:bg-white/90 transition-colors"
                    >
                        <FileText size={24} /> {t('requestQuote')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
