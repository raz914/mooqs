import React from 'react';
import { X } from 'lucide-react';

const ModuleSelector = ({ onClose, onSelect, onDragStart }) => {
    const modules = [
        { id: 'rings', name: 'Rings', width: 150, depth: 100, height: 40, color: '#E11D48' },
        { id: 'glasses', name: 'Glasses', width: 200, depth: 150, height: 60, color: '#7C3AED' },
        { id: 'watch_pad', name: 'Watch pad', width: 120, depth: 120, height: 30, color: '#2563EB' },
        { id: 'glasses_2', name: 'Glasses 2', width: 180, depth: 130, height: 50, color: '#059669' },
        { id: 'watch_pad_2', name: 'Watch pad 2', width: 100, depth: 100, height: 25, color: '#D97706' },
    ];

    const handleDragStart = (e, mod) => {
        e.dataTransfer.setData('application/json', JSON.stringify(mod));
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(mod);
    };

    return (
        <div className="absolute left-[410px] top-1/2 -translate-y-1/2 z-50 w-[280px] bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-white/5">
                <h3 className="text-[13px] font-medium text-white">Add Modules</h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {modules.map((mod) => (
                    <div
                        key={mod.id}
                        className="group cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, mod)}
                        onClick={() => onSelect(mod)}
                    >
                        <div
                            className="aspect-square rounded overflow-hidden mb-2 border border-white/5 group-hover:border-white/20 transition-all relative flex items-center justify-center"
                            style={{ backgroundColor: mod.color + '33' }}
                        >
                            <div
                                className="w-3/4 h-3/4 rounded"
                                style={{ backgroundColor: mod.color }}
                            />
                        </div>
                        <p className="text-[11px] text-center text-white/70 group-hover:text-white transition-colors">{mod.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleSelector;

