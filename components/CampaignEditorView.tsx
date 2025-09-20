import React, { useState, useEffect, useMemo } from 'react';
import type { EmailCampaign, ScheduleEvent, Person } from '../types';
import { ArrowLeftIcon, TargetIcon, Edit3Icon, MailIcon } from './IconComponents';

interface CampaignEditorViewProps {
    campaign: EmailCampaign;
    tourSchedule: ScheduleEvent[];
    people: Person[];
    onClose: () => void;
    onUpdateCampaign: (campaign: EmailCampaign) => void;
}

export const CampaignEditorView: React.FC<CampaignEditorViewProps> = ({ campaign, tourSchedule, people, onClose, onUpdateCampaign }) => {
    const [editedCampaign, setEditedCampaign] = useState<EmailCampaign>(campaign);

    useEffect(() => {
        setEditedCampaign(campaign);
    }, [campaign]);

    const handleContentChange = (field: string, value: string) => {
        setEditedCampaign(prev => ({
            ...prev,
            content: { ...prev.content, [field]: value }
        }));
    };

    const handleSettingChange = (field: string, value: string) => {
        setEditedCampaign(prev => ({ ...prev, [field]: value }));
    };

    const handleSegmentationChange = (locationId: string) => {
        const currentSelection = editedCampaign.segmentation?.locationIds || [];
        const newSelection = currentSelection.includes(locationId)
            ? currentSelection.filter(id => id !== locationId)
            : [...currentSelection, locationId];
        
        setEditedCampaign(prev => ({
            ...prev,
            segmentation: { ...prev.segmentation, locationIds: newSelection }
        }));
    };
    
    const uniqueLocations = useMemo(() => {
        const locations = new Set(tourSchedule.map(event => event.location));
        return Array.from(locations);
    }, [tourSchedule]);

    const segmentedAudience = useMemo(() => {
        const selectedLocations = editedCampaign.segmentation?.locationIds;
        if (!selectedLocations || selectedLocations.length === 0) {
            return people; // No filter, return everyone
        }
        const personIdsInSegment = new Set<string>();
        tourSchedule.forEach(event => {
            if (selectedLocations.includes(event.location)) {
                event.assignedTo.forEach(assignment => personIdsInSegment.add(assignment.personId));
            }
        });
        return people.filter(p => personIdsInSegment.has(p.id));
    }, [editedCampaign.segmentation, tourSchedule, people]);

    const sampleRecipient = useMemo(() => {
        if (segmentedAudience.length > 0) return segmentedAudience[0];
        if (people.length > 0) return people[0];
        return null;
    }, [segmentedAudience, people]);

    const getSampleEventLocation = (person: Person | null): string => {
        if (!person) return 'the event';
        const event = tourSchedule.find(e => e.assignedTo.some(a => a.personId === person.id));
        return event?.location || 'the event';
    };

    const replacePlaceholders = (text: string | undefined): string => {
        if (!text) return '';
        let processedText = text;
        if (sampleRecipient) {
            processedText = processedText.replace(/{{user_name}}/g, sampleRecipient.name);
            const location = getSampleEventLocation(sampleRecipient);
            processedText = processedText.replace(/{{event_city}}/g, location);
        }
        return processedText;
    };

    const handleSaveChanges = () => {
        onUpdateCampaign(editedCampaign);
        alert('Campaign saved!');
    };

    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm px-3 py-2";

    return (
        <div className="bg-slate-50 -m-6 p-6 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-600 font-semibold hover:text-slate-900">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Campaigns
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        editedCampaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                        editedCampaign.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-200 text-slate-800'
                    }`}>{editedCampaign.status}</span>
                    <button onClick={handleSaveChanges} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Editor */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-3"><MailIcon className="w-5 h-5" />Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">From Name</label>
                                <input type="text" value={editedCampaign.fromName || ''} onChange={e => handleSettingChange('fromName', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Subject</label>
                                <input type="text" value={editedCampaign.subject || ''} onChange={e => handleSettingChange('subject', e.target.value)} className={inputBaseClasses} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-3"><TargetIcon className="w-5 h-5" />Audience</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600">Target users assigned to events in specific locations. Select none to send to all crew.</p>
                            <div className="flex flex-wrap gap-2">
                                {uniqueLocations.map(location => (
                                    <button
                                        key={location}
                                        onClick={() => handleSegmentationChange(location)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                            (editedCampaign.segmentation?.locationIds || []).includes(location)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {location}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 pt-2">Estimated reach: <strong>{segmentedAudience.length}</strong> people</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-3"><Edit3Icon className="w-5 h-5" />Content</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Headline</label>
                                <input type="text" value={editedCampaign.content?.headline || ''} onChange={e => handleContentChange('headline', e.target.value)} className={inputBaseClasses} />
                            </div>
                             <div>
                                <label className="text-sm font-medium">Body</label>
                                <textarea value={editedCampaign.content?.body || ''} onChange={e => handleContentChange('body', e.target.value)} rows={6} className={inputBaseClasses}></textarea>
                                <p className="text-xs text-slate-500 mt-1">Use placeholders like <code className="bg-slate-100 p-0.5 rounded">{'{{user_name}}'}</code> or <code className="bg-slate-100 p-0.5 rounded">{'{{event_city}}'}</code> for dynamic content.</p>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Button Text</label>
                                <input type="text" value={editedCampaign.content?.ctaButtonText || ''} onChange={e => handleContentChange('ctaButtonText', e.target.value)} className={inputBaseClasses} />
                            </div>
                             <div>
                                <label className="text-sm font-medium">Button URL</label>
                                <input type="url" value={editedCampaign.content?.ctaButtonUrl || ''} onChange={e => handleContentChange('ctaButtonUrl', e.target.value)} className={inputBaseClasses} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Preview */}
                 <div className="sticky top-24">
                     <h3 className="font-bold text-lg text-slate-800 mb-2">Live Preview</h3>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b">
                            <p className="text-sm text-slate-500">To: {sampleRecipient ? sampleRecipient.email : 'sample@email.com'}</p>
                            <p className="text-sm text-slate-500">From: {editedCampaign.fromName || 'Your Name'}</p>
                            <p className="font-semibold mt-1">{replacePlaceholders(editedCampaign.subject) || 'Subject Line'}</p>
                        </div>
                        <div className="p-8 text-center bg-slate-800 text-white">
                            <h1 className="text-3xl font-bold">{replacePlaceholders(editedCampaign.content?.headline) || 'Headline'}</h1>
                        </div>
                        <div className="p-8">
                             <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{replacePlaceholders(editedCampaign.content?.body) || 'Email body content will appear here...'}</p>
                             {(editedCampaign.content?.ctaButtonText || editedCampaign.content?.ctaButtonUrl) && (
                                <div className="text-center mt-8">
                                    <a href={editedCampaign.content?.ctaButtonUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                                        {editedCampaign.content?.ctaButtonText || 'Click Here'}
                                    </a>
                                </div>
                             )}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">Previewing with data for: <strong>{sampleRecipient ? sampleRecipient.name : 'Sample User'}</strong></p>
                </div>
            </div>
        </div>
    );
};