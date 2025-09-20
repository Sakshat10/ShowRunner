import React, { useState, useMemo } from 'react';
import { type Tour, type Supplier, type RFP, type Proposal, type RoomBlock, supplierCategories, type SupplierCategory } from '../types';
import { StarIcon, MailIcon, MapPinIcon, BriefcaseIcon, ClipboardListIcon, BedIcon, BuildingIcon } from './IconComponents';
import { ProposalComparisonModal } from './ProposalComparisonModal';

interface SourcingViewProps {
    tour: Tour;
    suppliers: Supplier[];
    onAwardProposal: (rfpId: string) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-500">{rating.toFixed(1)}</span>
    </div>
);

const getStatusChipClass = (status: string) => {
    switch (status) {
        case 'Awarded': return 'bg-green-100 text-green-800';
        case 'Responded': return 'bg-blue-100 text-blue-800';
        case 'Sent': return 'bg-yellow-100 text-yellow-800';
        case 'Draft':
        case 'Declined':
        default: return 'bg-slate-100 text-slate-700';
    }
};

export const SourcingView: React.FC<SourcingViewProps> = ({ tour, suppliers, onAwardProposal }) => {
    const [activeTab, setActiveTab] = useState<'directory' | 'rfps' | 'room_blocks'>('directory');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SupplierCategory | 'All'>('All');
    const [comparingRfp, setComparingRfp] = useState<RFP | null>(null);

    const supplierMap = useMemo(() => suppliers.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as { [key: string]: Supplier }), [suppliers]);

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            const matchesCategory = selectedCategory === 'All' || supplier.category === selectedCategory;
            const matchesSearch = searchTerm === '' || 
                                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [suppliers, searchTerm, selectedCategory]);

    const TABS = [
        { id: 'directory', label: 'Supplier Directory', icon: BriefcaseIcon },
        { id: 'rfps', label: 'RFPs & Proposals', icon: ClipboardListIcon },
        { id: 'room_blocks', label: 'Room Blocks', icon: BedIcon },
    ];
    
    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    
    const proposalsForComparison = useMemo(() => {
        if (!comparingRfp) return [];
        return (tour.proposals || []).filter(p => p.rfpId === comparingRfp.id);
    }, [comparingRfp, tour.proposals]);

    const handleAward = (rfpId: string) => {
        onAwardProposal(rfpId);
        setComparingRfp(null);
    };

    return (
        <div>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                           <tab.icon className="mr-2 w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'directory' && (
                <div>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-1/3 p-2 border border-slate-300 rounded-md shadow-sm"
                        />
                         <select 
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value as any)}
                            className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm bg-white"
                        >
                            <option value="All">All Categories</option>
                            {supplierCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSuppliers.map(supplier => (
                            <div key={supplier.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800">{supplier.name}</h3>
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{supplier.category}</span>
                                </div>
                                <div className="text-sm text-slate-500 mt-2 space-y-1">
                                    <p className="flex items-center gap-2"><MapPinIcon className="w-4 h-4"/> {supplier.location}</p>
                                    <p className="flex items-center gap-2"><MailIcon className="w-4 h-4"/> {supplier.contactEmail}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <StarRating rating={supplier.rating} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'rfps' && (
                <div className="space-y-4">
                    {(tour.rfps || []).map(rfp => {
                        const relatedProposals = (tour.proposals || []).filter(p => p.rfpId === rfp.id);
                        return (
                            <div key={rfp.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800">RFP: {rfp.title}</h3>
                                        <p className="text-sm text-slate-500">Sent: {rfp.sentDate} &bull; Due: {rfp.dueDate}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(rfp.status)}`}>{rfp.status}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-md">{rfp.details}</p>
                                
                                {relatedProposals.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                        <h4 className="font-semibold text-slate-700 text-sm">Proposals Received ({relatedProposals.length})</h4>
                                        {relatedProposals.map(proposal => {
                                             const supplier = supplierMap[proposal.supplierId];
                                             return (
                                                <div key={proposal.id} className="text-sm text-slate-600 bg-blue-50/50 p-3 rounded-md">
                                                    <p><strong>From:</strong> {supplier?.name || 'Unknown'}</p>
                                                    <p><strong>Cost:</strong> <span className="font-bold">{currencyFormatter.format(proposal.totalCost)}</span></p>
                                                </div>
                                             );
                                        })}
                                        {relatedProposals.length > 1 && rfp.status !== 'Awarded' && (
                                            <div className="text-right">
                                                <button onClick={() => setComparingRfp(rfp)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 text-sm">
                                                    Compare Proposals
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {(!tour.rfps || tour.rfps.length === 0) && <p className="text-center text-slate-500 py-8">No RFPs created for this tour yet.</p>}
                </div>
            )}
            
            {activeTab === 'room_blocks' && (
                 <div className="space-y-4">
                    {(tour.roomBlocks || []).map(block => {
                        const hotel = supplierMap[block.hotelSupplierId];
                        return (
                            <div key={block.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 items-center">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <BuildingIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{hotel?.name}</h3>
                                    <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <span><strong>Dates:</strong> {block.checkInDate} to {block.checkOutDate}</span>
                                        <span><strong>Rooms:</strong> {block.roomCount}</span>
                                        <span><strong>Rate:</strong> {currencyFormatter.format(block.negotiatedRate)}/night</span>
                                        {block.confirmationCode && <span><strong>Conf #:</strong> {block.confirmationCode}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                     {(!tour.roomBlocks || tour.roomBlocks.length === 0) && <p className="text-center text-slate-500 py-8">No hotel room blocks have been set up.</p>}
                 </div>
            )}
            
            {comparingRfp && (
                <ProposalComparisonModal
                    isOpen={!!comparingRfp}
                    onClose={() => setComparingRfp(null)}
                    rfp={comparingRfp}
                    proposals={proposalsForComparison}
                    supplierMap={supplierMap}
                    onAward={handleAward}
                />
            )}
        </div>
    );
};