import React, { useState, useEffect } from 'react';
import { LayoutGrid, User, Cloud, Box, RefreshCcw, LayoutDashboard, Eye, Clock, Edit3, LogOut, Trash2, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import TemplateCard from './TemplateCard';
import img1 from '../assets/23.png';
import img2 from '../assets/60778f3eecc82deef9f3bde4bd9e8e47f7de01cb.jpg';
import img3 from '../assets/6bd9631aadf0dd9aa28bd96e84140f9823ab3979.jpg';
import img4 from '../assets/6e84a76d4ca3107eeb89114b5de640c46fe33a29.jpg';
import img5 from '../assets/e2bb20bf174169276637b7cb1a0553608d300664.jpg';
import img6 from '../assets/fc205cf7b6c93228345935e25f835f744058788b.png';

const DesignCard = ({ design, onEdit }) => (
    <div
        onClick={onEdit}
        className={`group bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col h-full ${onEdit ? 'active:scale-[0.98]' : ''}`}
    >
        <div className="h-48 bg-[#050505] relative flex items-center justify-center group-hover:bg-[#080808] transition-colors overflow-hidden">
            {/* Simplified Tray Preview */}
            <div className="grid grid-cols-2 gap-1 w-24 h-16 opacity-40 group-hover:opacity-60 transition-opacity">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/20 rounded-sm border border-white/10"></div>
                ))}
            </div>
            {/* View/Edit Icon Overlay */}
            <div className="absolute top-4 right-4 p-2 bg-black/60 border border-white/5 rounded-lg text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {design.status === 'Complete' ? <Eye size={16} /> : <Edit3 size={16} />}
            </div>
        </div>
        <div className="p-5 flex flex-col gap-1 border-t border-white/5">
            <h3 className="text-[14px] font-medium text-white/90">{design.name}</h3>
            <div className="flex items-center gap-2 text-[11px] text-white/30">
                <Clock size={12} />
                <span>Last edit: {design.lastEdit}</span>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Draft: 'bg-[#262626] text-white/90',
        Pending: 'bg-[#3b2a1a] text-[#d4a373]',
        Processing: 'bg-[#1f2937] text-[#60a5fa]',
        Complete: 'bg-[#143324] text-[#4ade80]'
    };
    return (
        <span className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${styles[status] || styles.Draft}`}>
            {status}
        </span>
    );
};

const ProfileField = ({ label, value, name, onChange, isEditing, type = 'text' }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider font-sans">{label}</label>
        {isEditing ? (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-3.5 text-[14px] text-white outline-none focus:border-white/30 transition-colors font-sans"
            />
        ) : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-3.5 text-[14px] text-white/90 font-medium font-sans">
                {type === 'password' ? '•'.repeat(12) : value}
            </div>
        )}
    </div>
);

const Dashboard = ({ onSelectTemplate, onLogout, onEditProject, onDeleteDesign, onEditDesign, currentProject, designHistory = [], initialTab = 'templates' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEditing, setIsEditing] = useState(false);

    // Sync activeTab with prop changes from TopBar
    useEffect(() => {
        setActiveTab(initialTab);
        if (isEditing) handleCancel();
    }, [initialTab]);

    const [profileData, setProfileData] = useState({
        name: 'Nafis Rayan',
        company: 'Layerin 3D',
        address: 'Dhaka, Bangladesh',
        coc: '09625337652',
        phone: '017625337652',
        email: 'nafis@rayan.com',
        password: 'password'
    });

    const [tempData, setTempData] = useState({ ...profileData });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setProfileData({ ...tempData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempData({ ...profileData });
        setIsEditing(false);
    };

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
            dims: { width: 1000, height: 100, depth: 500, rows: 2, cols: 4 }
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
        {
            id: 6,
            name: `${t('watchTray')} 2:4`,
            image: img6,
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

    const mockDesigns = [
        { id: 1, name: 'Watch tray 2:1', lastEdit: '23 Jun, 25', status: 'Complete' },
        { id: 2, name: 'Watch tray 2:3', lastEdit: '23 Jun, 25', status: 'Pending' },
        { id: 3, name: 'Watch tray 2:2', lastEdit: '23 Jun, 25', status: 'Draft' },
        { id: 4, name: 'Watch tray 2:3', lastEdit: '23 Jun, 25', status: 'Draft' },
        { id: 5, name: 'Watch tray 2:2', lastEdit: '23 Jun, 25', status: 'Complete' },
        { id: 6, name: 'Watch tray 2:1', lastEdit: '23 Jun, 25', status: 'Complete' },
    ];

    const recentDesigns = currentProject
        ? [currentProject, ...mockDesigns.slice(0, 5)]
        : mockDesigns;

    const stats = [
        { label: 'TOTAL DRAFT', value: '42', color: 'bg-[#262626]' },
        { label: 'PENDING DESIGN', value: '23', color: 'bg-[#3b2a1a]' },
        { label: 'PROCESSING DESIGN', value: '83', color: 'bg-[#1f2937]' },
        { label: 'INQUIRY COMPLETE', value: '130', color: 'bg-[#143324]' },
    ];

    const sidebarItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
        { id: 'profileSettings', label: t('profileSettings'), icon: <User size={18} /> },
        { id: 'designHistory', label: t('designHistory'), icon: <Cloud size={18} /> },
        { id: 'templates', label: t('templates'), icon: <Box size={18} /> },
    ];

    return (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col font-sans text-white pt-[60px]">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 bg-black">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 px-4 font-sans">
                        Accounts
                    </span>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isEditing) handleCancel();
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-all ${activeTab === item.id
                                ? 'bg-white text-black shadow-lg'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-12 bg-black">
                    <div className="max-w-6xl mx-auto flex flex-col gap-12">
                        {activeTab === 'dashboard' && (
                            <>
                                <section>
                                    <h1 className="text-[28px] font-medium mb-1 tracking-tight font-sans">Dashboard</h1>
                                    <p className="text-[13px] text-white/40 mb-8 font-sans">Manage your all design and Inquiry information here.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {stats.map((stat, i) => (
                                            <div key={i} className={`${stat.color} rounded-lg p-6 flex flex-col gap-4 border border-white/5`}>
                                                <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase font-sans">{stat.label}</span>
                                                <span className="text-[32px] font-medium text-white tracking-tighter leading-none font-sans">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-[20px] font-medium mb-6 tracking-tight font-sans">Recent Design</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 text-left">
                                        {recentDesigns.map((design) => (
                                            <DesignCard
                                                key={design.id}
                                                design={design}
                                                onEdit={design.isCurrent ? onEditProject : undefined}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === 'profileSettings' && (
                            <section className="max-w-4xl">
                                <h1 className="text-[28px] font-medium mb-1 tracking-tight font-sans">Account Information</h1>
                                <p className="text-[13px] text-white/40 mb-10 font-sans">Manage your profile information here.</p>

                                <div className="bg-[#050505] rounded-2xl border border-white/5 p-8 flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 p-0.5 relative group">
                                                <User size={40} className="text-white opacity-80" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit3 size={18} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 text-left">
                                                <h2 className="text-[20px] font-medium text-white">{profileData.name}</h2>
                                                <p className="text-[13px] text-white/40">{profileData.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (isEditing) handleCancel();
                                                onLogout?.();
                                            }}
                                            className="flex items-center gap-2 px-6 py-2.5 border border-white/10 rounded-full text-[12px] font-medium hover:bg-white/5 transition-all text-white/60"
                                        >
                                            <LogOut size={14} />
                                            Log Out
                                        </button>
                                    </div>

                                    <div className="bg-[#000000] border border-white/5 rounded-xl p-8 flex flex-col gap-8 text-left">
                                        <div className="flex flex-col gap-6">
                                            <span className="text-[11px] font-bold text-white/30 tracking-[0.1em] uppercase">PROFILE INFO</span>

                                            <div className="grid grid-cols-1 gap-6">
                                                <ProfileField label="Name" name="name" value={tempData.name} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Company Name" name="company" value={tempData.company} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Address" name="address" value={tempData.address} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Chamber of Commerce number" name="coc" value={tempData.coc} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Phone Number" name="phone" value={tempData.phone} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Email" name="email" value={tempData.email} onChange={handleInputChange} isEditing={isEditing} />
                                                <ProfileField label="Password" name="password" value={tempData.password} onChange={handleInputChange} isEditing={isEditing} type="password" />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-4">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg text-[12px] font-bold hover:bg-white/90 transition-all font-sans"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-lg text-[12px] font-bold hover:bg-white/5 transition-all text-white/60 font-sans"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg text-[12px] font-bold hover:bg-white/5 transition-all text-white/80 font-sans"
                                                >
                                                    <Edit3 size={14} />
                                                    Change Profile Info
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'designHistory' && (
                            <section>
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-[28px] font-medium tracking-tight font-sans">Design History</h1>
                                        <p className="text-[13px] text-white/40 font-sans">Manage your design inquiry history here.</p>
                                    </div>
                                    <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-[12px] font-bold hover:bg-white/90 transition-all font-sans">
                                        <SlidersHorizontal size={14} />
                                        Filter
                                    </button>
                                </div>

                                <div className="bg-[#050505] rounded-2xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">ID</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Tray Name</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Amount</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {designHistory.map((row, i) => (
                                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-6 text-[13px] text-white/40 font-sans font-medium">{row.id}</td>
                                                    <td className="px-8 py-6 text-[13px] text-white/90 font-sans font-medium">{row.name}</td>
                                                    <td className="px-8 py-6 text-[13px] text-white/40 font-sans font-medium">{row.date}</td>
                                                    <td className="px-8 py-6">
                                                        <StatusBadge status={row.status} />
                                                    </td>
                                                    <td className="px-8 py-6 text-[13px] text-white/90 font-sans font-medium tracking-tight">
                                                        {row.amount}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => onDeleteDesign?.(row.id)}
                                                                className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => onEditDesign?.(row)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111111] border border-white/10 text-white/40 hover:bg-white hover:text-black hover:border-white transition-all"
                                                            >
                                                                {row.status === 'Draft' ? <Edit3 size={14} /> : <Eye size={14} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeTab === 'templates' && (
                            <section>
                                <h1 className="text-[28px] font-medium mb-1 tracking-tight font-sans">Mooqs Tray Template</h1>
                                <p className="text-[13px] text-white/40 mb-10 font-sans">Your can easily customize design using template</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                    {templates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            onClick={onSelectTemplate}
                                        />
                                    ))}
                                </div>

                                <div className="flex justify-center pb-12">
                                    <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-xl font-sans">
                                        <RefreshCcw size={14} className="stroke-[3]" />
                                        Load More
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab !== 'dashboard' && activeTab !== 'templates' && activeTab !== 'profileSettings' && activeTab !== 'designHistory' && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
                                <LayoutGrid size={64} className="mb-4 opacity-10" />
                                <p className="text-xl font-medium uppercase tracking-tighter font-sans">Content coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
