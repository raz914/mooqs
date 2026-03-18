import React from 'react';
import { X } from 'lucide-react';
import { MODULE_LIBRARY } from '../config/modules';

const ModuleSelector = ({ onClose, onSelect, onDragStart, onDragEnd }) => {
    const modules = MODULE_LIBRARY;

    const handleDragStart = (e, mod) => {
        e.dataTransfer.setData('application/json', JSON.stringify(mod));
        e.dataTransfer.setData('text/plain', mod.id);
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
                        onDragEnd={onDragEnd}
                        onClick={() => onSelect(mod)}
                    >
                        <div
                            className="aspect-square rounded overflow-hidden mb-2 border border-white/5 group-hover:border-white/20 transition-all relative flex flex-col items-center justify-center px-3"
                            style={{ backgroundColor: mod.color + '24' }}
                        >
                            <div
                                className={`rounded ${mod.renderType === 'model' ? 'w-10 h-10' : 'w-12 h-8'}`}
                                style={{ backgroundColor: mod.color }}
                            />
                            <span className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/50">
                                {mod.renderType === 'model' ? '3D model' : 'Geometry'}
                            </span>
                        </div>
                        <p className="text-[11px] text-center text-white/70 group-hover:text-white transition-colors">{mod.name}</p>
                        <p className="text-[9px] text-center text-white/35 mt-1">
                            {mod.width} x {mod.depth} x {mod.height} mm
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleSelector;
