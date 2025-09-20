import React, { useMemo } from 'react';
import type { RFP, Proposal, Supplier } from '../types';
import { XIcon, TrophyIcon, StarIcon } from './IconComponents';

interface ProposalComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    rfp: RFP;
    proposals: Proposal[];
    supplierMap: { [key: string]: Supplier };
    onAward: (rfpId: string) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const ProposalComparisonModal: React.FC<ProposalComparisonModalProps> = ({ isOpen, onClose, rfp, proposals, supplierMap, onAward }) => {

    const lowestCost = useMemo(() => {
        if (proposals.length === 0) return 0;
        return Math.min(...proposals.map(p => p.totalCost));
    }, [proposals]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Compare Proposals</h2>
                        <p className="text-slate-500">For RFP: <span className="font-semibold">{rfp.title}</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="p-3 text-left font-bold text-slate-600 uppercase text-sm tracking-wider">Supplier</th>
                                    <th className="p-3 text-left font-bold text-slate-600 uppercase text-sm tracking-wider">Total Cost</th>
                                    <th className="p-3 text-left font-bold text-slate-600 uppercase text-sm tracking-wider">Key Notes</th>
                                    <th className="p-3 text-left font-bold text-slate-600 uppercase text-sm tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.sort((a,b) => a.totalCost - b.totalCost).map(proposal => {
                                    const supplier = supplierMap[proposal.supplierId];
                                    const isLowestCost = proposal.totalCost === lowestCost;
                                    return (
                                        <tr key={proposal.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                            <td className="p-3 align-top">
                                                <p className="font-semibold text-slate-800">{supplier?.name}</p>
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <StarIcon className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                    {supplier?.rating.toFixed(1)}
                                                </div>
                                            </td>
                                            <td className={`p-3 align-top font-bold ${isLowestCost ? 'text-green-600' : 'text-slate-800'}`}>
                                                {currencyFormatter.format(proposal.totalCost)}
                                                {isLowestCost && <span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Best Price</span>}
                                            </td>
                                            <td className="p-3 align-top text-sm text-slate-600 max-w-sm whitespace-pre-wrap">{proposal.notes}</td>
                                            <td className="p-3 align-top">
                                                <button 
                                                    onClick={() => onAward(rfp.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 text-sm transition-colors"
                                                >
                                                    <TrophyIcon className="w-4 h-4"/>
                                                    Award
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};