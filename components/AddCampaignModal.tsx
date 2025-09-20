import React, { useState } from 'react';
import type { EmailCampaign } from '../types';
import { XIcon } from './IconComponents';

interface AddCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCampaign: (campaignData: Omit<EmailCampaign, 'id'>) => void;
    scheduledDate?: string;
}

export const AddCampaignModal: React.FC<AddCampaignModalProps> = ({ isOpen, onClose, onAddCampaign, scheduledDate }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter a campaign name.');
            return;
        }
        onAddCampaign({
            name,
            status: scheduledDate ? 'Scheduled' : 'Draft',
            ...(scheduledDate && { scheduledDate }),
            stats: { openRate: 0, clickRate: 0 },
            content: { headline: '', body: '', ctaButtonText: '', ctaButtonUrl: '' },
            subject: 'New Campaign Subject',
            fromName: 'Your Team',
        });
        setName('');
        onClose();
    };

    if (!isOpen) return null;

    const inputBaseClasses = "w-full text-base bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition px-3 py-2";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{scheduledDate ? 'Schedule New Campaign' : 'Create New Email Campaign'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required autoFocus placeholder="e.g., 'Pre-sale Announcement'" className={inputBaseClasses} />
                        </div>
                        <p className="text-sm text-slate-500">
                           {scheduledDate 
                                ? `This will create a new 'Scheduled' campaign for ${new Date(scheduledDate).toLocaleDateString()}. You can add content later.`
                                : `This will create a new 'Draft' campaign. You can add content and schedule it later.`
                            }
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                            {scheduledDate ? 'Schedule Campaign' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
