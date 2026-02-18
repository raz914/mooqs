import React from 'react';
import { Edit3 } from 'lucide-react';

const TemplateCard = ({ template, onClick }) => {
    return (
        <div
            onClick={() => onClick(template)}
            className="group bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all cursor-pointer"
        >
            <div className="h-32 lg:h-36 relative overflow-hidden flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                <img
                    src={template.image}
                    alt={template.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="p-4 bg-[#0a0a0a] flex justify-between items-center border-t border-white/5">
                <span className="text-[13px] font-bold text-white/90 tracking-tight">{template.name}</span>
                <div className="p-2 border border-white/10 rounded-lg text-white/30 group-hover:bg-white group-hover:text-black transition-all">
                    <Edit3 size={14} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
