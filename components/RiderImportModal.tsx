import React, { useState } from 'react';
import { RiderParseResult } from '../services/geminiService';
import { XIcon, FileImportIcon, ClipboardListIcon, DollarSignIcon } from './IconComponents';

interface RiderImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcessRider: (riderText: string) => Promise<RiderParseResult>;
    onApply: (data: RiderParseResult) => void;
}

export const RiderImportModal: React.FC<RiderImportModalProps> = ({ isOpen, onClose, onProcessRider, onApply }) => {
    const [riderText, setRiderText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RiderParseResult | null>(null);

    const handleProcess = async () => {
        if (!riderText.trim()) {
            alert('Please paste the rider text.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const parsedResult = await onProcessRider(riderText);
            setResult(parsedResult);
        } catch (error) {
            console.error("Processing failed:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setRiderText('');
        setIsLoading(false);
        setResult(null);
        onClose();
    };
    
    const handleApply = () => {
        if (result) {
            onApply(result);
            handleClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileImportIcon className="w-6 h-6" /> AI Rider Import
                    </h2>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    {!result ? (
                        <>
                            <p className="text-slate-600">Paste the full text from the artist's technical or hospitality rider below. The AI assistant will extract actionable tasks and budget items.</p>
                            <textarea
                                value={riderText}
                                onChange={(e) => setRiderText(e.target.value)}
                                placeholder="e.g., 'Stage requires a 16-channel mixing console. Artist requires 12 bottles of Fiji water...'"
                                className="w-full h-48 text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm p-3"
                                disabled={isLoading}
                            />
                        </>
                    ) : (
                        <div>
                            <h3 className="font-bold text-lg mb-2">Review Extracted Items</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2"><ClipboardListIcon className="w-5 h-5"/> Tasks</h4>
                                    <ul className="list-disc list-inside bg-slate-50 p-2 rounded-md mt-1">
                                        {result.tasks.map((task, i) => <li key={i}>{task.text} (to {task.assignedTo})</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold flex items-center gap-2"><DollarSignIcon className="w-5 h-5"/> Budget Items</h4>
                                     <ul className="list-disc list-inside bg-slate-50 p-2 rounded-md mt-1">
                                        {result.budgetItems.map((item, i) => <li key={i}>{item.category} - ${item.amount}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                        Cancel
                    </button>
                    {!result ? (
                         <button onClick={handleProcess} disabled={isLoading} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
                            {isLoading ? 'Processing...' : 'Process with AI'}
                        </button>
                    ) : (
                        <button onClick={handleApply} className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700">
                            Apply Items to Tour
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};