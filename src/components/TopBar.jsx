import React from 'react';
import { Globe, User, ChevronDown, Layout, Cloud, Box, RotateCcw } from 'lucide-react';
import logo from '../assets/logo.png';
import { useLanguage } from '../context/LanguageContext';

const TopBar = () => {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const { language, setLanguage, t } = useLanguage();

    const languages = [
        { code: 'sa', label: 'Arabic' },
        { code: 'nl', label: 'Dutch' },
        { code: 'gb', label: 'English' },
        { code: 'fr', label: 'French' },
        { code: 'de', label: 'German' },
        { code: 'it', label: 'Italian' },
        { code: 'pt', label: 'Portuguese' },
        { code: 'ru', label: 'Russian' },
        { code: 'es', label: 'Spanish' },
    ];

    const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

    return (
        <div className="h-[60px] bg-[#171717] border-black border-b-8 flex items-center justify-between px-8 select-none relative z-50">
            <div className="flex items-center gap-2">
                <img src={logo} alt="mooos logo" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <div
                        onClick={() => {
                            setIsLangOpen(!isLangOpen);
                            setIsProfileOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-white cursor-pointer hover:text-white transition-colors"
                    >
                        <Globe size={18} />
                        <span className="text-[12px] font-medium hidden md:block">{currentLangLabel}</span>
                        <ChevronDown size={14} className="opacity-40" />
                    </div>

                    {isLangOpen && (
                        <div className="absolute right-0 top-full mt-4 w-[160px] bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl z-50 py-1">
                            {languages.map((lang, i) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsLangOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left font-medium"
                                >
                                    <img
                                        src={`https://flagcdn.com/w40/${lang.code}.png`}
                                        alt={lang.label}
                                        className="w-5 h-auto object-contain"
                                    />
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div
                        onClick={() => {
                            setIsProfileOpen(!isProfileOpen);
                            setIsLangOpen(false);
                        }}
                        className="flex items-center gap-2 text-white/80 cursor-pointer bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                            <User size={14} className="text-white" />
                        </div>
                        <ChevronDown size={14} className="opacity-40" />
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                            {[
                                { icon: <Layout size={14} />, label: t('dashboard'), key: 'dashboard' },
                                { icon: <User size={14} />, label: t('profileSettings'), key: 'profileSettings' },
                                { icon: <Cloud size={14} />, label: t('designHistory'), key: 'designHistory' },
                                { icon: <Box size={14} />, label: t('templates'), key: 'templates' },
                            ].map((item, i) => (
                                <button key={i} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-white/60 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 text-left">
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-red-500 hover:bg-red-500/10 transition-colors text-left">
                                <RotateCcw size={14} /> {t('logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
