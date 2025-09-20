import React from 'react';
import type { WebsiteSectionType } from '../types';
import { XIcon, EyeIcon, TypeIcon, VideoIcon, TicketIcon, ImageIcon, QuoteIcon, PointerIcon, NavigationIcon, PanelBottomIcon } from './IconComponents';

interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSection: (type: WebsiteSectionType) => void;
}

const sectionOptions: {type: WebsiteSectionType, title: string, description: string, icon: React.ReactNode}[] = [
    { type: 'header', title: 'Header', description: 'Site logo and navigation links.', icon: <NavigationIcon className="w-8 h-8"/> },
    { type: 'hero', title: 'Hero Banner', description: 'A large, full-width banner image with a headline.', icon: <EyeIcon className="w-8 h-8"/> },
    { type: 'about', title: 'About', description: 'A text block for tour descriptions or artist info.', icon: <TypeIcon className="w-8 h-8"/> },
    { type: 'video', title: 'Video', description: 'Embed a video from YouTube or Vimeo.', icon: <VideoIcon className="w-8 h-8"/> },
    { type: 'tickets', title: 'Tickets', description: 'A call-to-action block to link to tickets.', icon: <TicketIcon className="w-8 h-8"/> },
    { type: 'gallery', title: 'Image Gallery', description: 'Display a grid of photos.', icon: <ImageIcon className="w-8 h-8"/> },
    { type: 'testimonials', title: 'Testimonials', description: 'Showcase quotes from fans or critics.', icon: <QuoteIcon className="w-8 h-8"/> },
    { type: 'cta', title: 'Call To Action', description: 'A block to drive user engagement.', icon: <PointerIcon className="w-8 h-8"/> },
    { type: 'footer', title: 'Footer', description: 'Copyright and social media links.', icon: <PanelBottomIcon className="w-8 h-8"/> },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ isOpen, onClose, onAddSection }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl m-4">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Add New Section</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionOptions.map(option => (
                        <button 
                            key={option.type}
                            onClick={() => onAddSection(option.type)}
                            className="text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-100 rounded-lg text-blue-600">
                                    {option.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{option.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                 <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};