import React, { useState } from 'react';
import { X, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

const NewDesignModal = ({ onCreate, onClose }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(title);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-lg bg-[#000000] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-8 pt-12">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors z-10"
                >
                    <X size={18} strokeWidth={3} />
                </button>

                {/* Logo */}
                <div className="flex items-center justify-center mb-10">
                    <img src={logo} alt="Mooqs Logo" className="h-10 w-auto" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[12px] font-medium text-white/50 mb-3 uppercase tracking-wider">
                            Design Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Watch tray 2:1"
                            className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-4 text-white text-[14px] focus:outline-none focus:border-white/20 transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="bg-white text-black px-6 py-2.5 rounded-full flex items-center gap-3 font-bold text-[11px] hover:bg-white/90 transition-all uppercase tracking-[0.15em] shadow-lg"
                        >
                            <PlusSquare size={14} strokeWidth={2.5} />
                            Create New Tray
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewDesignModal;
