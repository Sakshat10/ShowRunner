
import React, { useState } from 'react';
import type { WebsiteSection, Testimonial, SocialLink, SocialPlatform } from '../types';
import { XIcon, TrashIcon, PlusIcon } from './IconComponents';
import { socialPlatforms } from '../types';

interface EditSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: WebsiteSection;
    onSave: (section: WebsiteSection) => void;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({ isOpen, onClose, section, onSave }) => {
    const [content, setContent] = useState(section.content);

    const handleChange = (field: string, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (index: number, field: 'url' | 'caption', value: string) => {
        setContent(prev => {
            const newImages = [...(prev.images || [])];
            newImages[index] = { ...newImages[index], [field]: value };
            return { ...prev, images: newImages };
        });
    };

    const handleAddImage = () => {
        setContent(prev => ({
             ...prev,
             images: [...(prev.images || []), { url: '', caption: '' }]
        }));
    };

    const handleRemoveImage = (index: number) => {
        setContent(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
        setContent(prev => {
            const newTestimonials = [...(prev.testimonials || [])];
            newTestimonials[index] = { ...newTestimonials[index], [field]: value };
            return { ...prev, testimonials: newTestimonials };
        });
    };

    const handleAddTestimonial = () => {
        setContent(prev => ({
            ...prev,
            testimonials: [...(prev.testimonials || []), { quote: '', author: '', imageUrl: '' }]
        }));
    };

    const handleRemoveTestimonial = (index: number) => {
        setContent(prev => ({
            ...prev,
            testimonials: (prev.testimonials || []).filter((_, i) => i !== index)
        }));
    };

    const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
        setContent(prev => {
            const newSocialLinks = (prev.socialLinks || []).map((link, i): SocialLink => {
                if (i !== index) {
                    return link;
                }
                if (field === 'platform') {
                    return { ...link, platform: value as SocialPlatform };
                }
                // field is 'url'
                return { ...link, url: value };
            });
            return { ...prev, socialLinks: newSocialLinks };
        });
    };

    const handleAddSocialLink = () => {
        setContent(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), { platform: 'twitter', url: '' }]
        }));
    };

    const handleRemoveSocialLink = (index: number) => {
        setContent(prev => ({
            ...prev,
            socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index)
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...section, content });
    };

    if (!isOpen) return null;

    const inputBaseClasses = "w-full text-base bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition px-3 py-2";

    const renderFormFields = () => {
        switch (section.type) {
            case 'header':
                return (
                     <div>
                        <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700 mb-1">Logo Image URL</label>
                        <input type="url" id="logoUrl" value={content.logoUrl || ''} onChange={e => handleChange('logoUrl', e.target.value)} className={inputBaseClasses} placeholder="https://path-to-your/logo.png" />
                    </div>
                );
            case 'hero':
                return (
                    <>
                        <div>
                            <label htmlFor="headline" className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                            <input type="text" id="headline" value={content.headline || ''} onChange={e => handleChange('headline', e.target.value)} className={inputBaseClasses} />
                        </div>
                        <div>
                            <label htmlFor="subheadline" className="block text-sm font-medium text-slate-700 mb-1">Subheadline</label>
                            <input type="text" id="subheadline" value={content.subheadline || ''} onChange={e => handleChange('subheadline', e.target.value)} className={inputBaseClasses} />
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">Custom Image URL (Optional)</label>
                            <input type="url" id="imageUrl" value={content.imageUrl || ''} onChange={e => handleChange('imageUrl', e.target.value)} className={inputBaseClasses} placeholder="Overrides default tour image" />
                        </div>
                    </>
                );
            case 'about':
                 return (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                            <input type="text" id="title" value={content.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputBaseClasses} />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">Body Text</label>
                            <textarea id="body" value={content.body || ''} onChange={e => handleChange('body', e.target.value)} rows={5} className={inputBaseClasses}></textarea>
                        </div>
                    </>
                );
            case 'video':
                return (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                            <input type="text" id="title" value={content.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputBaseClasses} placeholder="e.g., Watch The Trailer" />
                        </div>
                        <div>
                            <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-700 mb-1">Video URL</label>
                            <input type="url" id="videoUrl" value={content.videoUrl || ''} onChange={e => handleChange('videoUrl', e.target.value)} className={inputBaseClasses} placeholder="https://www.youtube.com/watch?v=..." />
                            <p className="text-xs text-slate-500 mt-1">Paste a link from YouTube or Vimeo.</p>
                        </div>
                    </>
                );
            case 'tickets':
                return (
                     <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input type="text" id="title" value={content.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputBaseClasses} placeholder="e.g., Get Your Tickets!" />
                        </div>
                         <div>
                            <label htmlFor="buttonText" className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                            <input type="text" id="buttonText" value={content.buttonText || ''} onChange={e => handleChange('buttonText', e.target.value)} className={inputBaseClasses} placeholder="e.g., Buy Now" />
                        </div>
                        <div>
                            <label htmlFor="ticketUrl" className="block text-sm font-medium text-slate-700 mb-1">Ticket URL</label>
                            <input type="url" id="ticketUrl" value={content.ticketUrl || ''} onChange={e => handleChange('ticketUrl', e.target.value)} className={inputBaseClasses} placeholder="https://www.ticketprovider.com/..." />
                        </div>
                    </>
                );
            case 'gallery':
                return (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                            <input type="text" id="title" value={content.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputBaseClasses} placeholder="e.g., Photo Gallery" />
                        </div>
                        <div className="space-y-3">
                            {(content.images || []).map((image, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-slate-600">Image {index + 1}</label>
                                        <button type="button" onClick={() => handleRemoveImage(index)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <input type="url" value={image.url} onChange={e => handleImageChange(index, 'url', e.target.value)} placeholder="Image URL" className={inputBaseClasses} />
                                        <input type="text" value={image.caption || ''} onChange={e => handleImageChange(index, 'caption', e.target.value)} placeholder="Optional caption" className={inputBaseClasses} />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddImage} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50">
                                <PlusIcon className="w-4 h-4" /> Add Image
                            </button>
                        </div>
                    </>
                );
            case 'testimonials':
                return (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                            <input type="text" id="title" value={content.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputBaseClasses} placeholder="e.g., What Fans Are Saying" />
                        </div>
                         <div className="space-y-3">
                            {(content.testimonials || []).map((testimonial, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-slate-600">Testimonial {index + 1}</label>
                                        <button type="button" onClick={() => handleRemoveTestimonial(index)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold p-1 rounded-md hover:bg-red-100">
                                            <TrashIcon className="w-4 h-4" /> Remove
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <textarea value={testimonial.quote} onChange={e => handleTestimonialChange(index, 'quote', e.target.value)} placeholder="Quote text..." rows={3} className={inputBaseClasses}></textarea>
                                        <div className="flex items-center gap-3">
                                            {testimonial.imageUrl && (
                                                <img src={testimonial.imageUrl} alt="Author" className="w-10 h-10 rounded-full bg-slate-200 object-cover flex-shrink-0" />
                                            )}
                                            <div className="flex-grow space-y-2">
                                                <input type="text" value={testimonial.author} onChange={e => handleTestimonialChange(index, 'author', e.target.value)} placeholder="Author's name" className={inputBaseClasses} />
                                                <input type="url" value={testimonial.imageUrl || ''} onChange={e => handleTestimonialChange(index, 'imageUrl', e.target.value)} placeholder="Author image URL (optional)" className={inputBaseClasses} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddTestimonial} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50">
                                <PlusIcon className="w-4 h-4" /> Add Testimonial
                            </button>
                        </div>
                    </>
                );
             case 'cta':
                return (
                    <>
                        <div>
                            <label htmlFor="ctaTitle" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input type="text" id="ctaTitle" value={content.ctaTitle || ''} onChange={e => handleChange('ctaTitle', e.target.value)} className={inputBaseClasses} />
                        </div>
                         <div>
                            <label htmlFor="ctaBody" className="block text-sm font-medium text-slate-700 mb-1">Body Text</label>
                            <textarea id="ctaBody" value={content.ctaBody || ''} onChange={e => handleChange('ctaBody', e.target.value)} rows={3} className={inputBaseClasses}></textarea>
                        </div>
                         <div>
                            <label htmlFor="ctaButtonText" className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                            <input type="text" id="ctaButtonText" value={content.ctaButtonText || ''} onChange={e => handleChange('ctaButtonText', e.target.value)} className={inputBaseClasses} />
                        </div>
                        <div>
                            <label htmlFor="ctaButtonUrl" className="block text-sm font-medium text-slate-700 mb-1">Button URL</label>
                            <input type="url" id="ctaButtonUrl" value={content.ctaButtonUrl || ''} onChange={e => handleChange('ctaButtonUrl', e.target.value)} className={inputBaseClasses} />
                        </div>
                    </>
                );
            case 'footer':
                return (
                    <>
                        <div>
                            <label htmlFor="copyrightText" className="block text-sm font-medium text-slate-700 mb-1">Copyright Text</label>
                            <input type="text" id="copyrightText" value={content.copyrightText || ''} onChange={e => handleChange('copyrightText', e.target.value)} className={inputBaseClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">Social Links</label>
                            {(content.socialLinks || []).map((link, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg border flex items-center gap-2">
                                    <select value={link.platform} onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)} className={`${inputBaseClasses} w-1/3`}>
                                        {socialPlatforms.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                    <input type="url" value={link.url} onChange={e => handleSocialLinkChange(index, 'url', e.target.value)} placeholder="Full URL" className={`${inputBaseClasses} flex-grow`} />
                                    <button type="button" onClick={() => handleRemoveSocialLink(index)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddSocialLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50">
                                <PlusIcon className="w-4 h-4" /> Add Social Link
                            </button>
                        </div>
                    </>
                );
            default:
                return <p>No specific fields for this section type.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">Edit {section.type} Section</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        {renderFormFields()}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
