
import React, { useState } from 'react';
import type { Tour, RegistrationForm, RegistrationResponse } from '../types';
import { MusicNoteIcon, CheckCircleIcon } from './IconComponents';

interface PublicFormViewProps {
    tour: Tour;
    form: RegistrationForm;
    onClose: () => void;
    onSubmit: (tourId: string, formId: string, responses: RegistrationResponse[]) => void;
}

export const PublicFormView: React.FC<PublicFormViewProps> = ({ tour, form, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<{ [key: string]: string | string[] }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (fieldId: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };
    
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        for (const field of form.fields) {
            if (field.required && (!formData[field.id] || (formData[field.id] as string).trim().length === 0)) {
                newErrors[field.id] = `${field.label} is required.`;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const responses: RegistrationResponse[] = form.fields.map(field => ({
            fieldId: field.id,
            value: formData[field.id] || '',
        }));

        onSubmit(tour.id, form.id, responses);
        setIsSubmitted(true);
    };
    
    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm px-3 py-2";

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
                 <div className="w-full max-w-lg text-center bg-white p-12 rounded-2xl shadow-lg border">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800">Registration Submitted!</h1>
                    <p className="text-slate-600 mt-2">Thank you for registering for {tour.tourName}. We've received your information.</p>
                    <button onClick={onClose} className="mt-8 px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">
                        Close
                    </button>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
             <div className="flex items-center space-x-3 mb-8">
                <MusicNoteIcon className="w-10 h-10 text-blue-600" />
                <span className="text-4xl font-bold text-slate-800">{tour.artistName}</span>
            </div>
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <h1 className="text-3xl font-bold text-center text-slate-800">{form.name}</h1>
                <p className="text-center text-slate-500 mb-8">{tour.tourName}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {form.fields.map(field => (
                        <div key={field.id}>
                            <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea id={field.id} value={(formData[field.id] as string) || ''} onChange={e => handleInputChange(field.id, e.target.value)} required={field.required} placeholder={field.placeholder} rows={4} className={inputBaseClasses}></textarea>
                            ) : field.type === 'select' ? (
                                <select 
                                    id={field.id} 
                                    value={(formData[field.id] as string) || ''} 
                                    onChange={e => handleInputChange(field.id, e.target.value)} 
                                    required={field.required} 
                                    className={`${inputBaseClasses} ${!formData[field.id] ? 'text-slate-500' : ''}`}
                                >
                                    <option value="">{field.placeholder || 'Select an option'}</option>
                                    {(field.options || []).map(opt => <option key={opt} value={opt} className="text-slate-800">{opt}</option>)}
                                </select>
                            ) : (
                                <input type={field.type} id={field.id} value={(formData[field.id] as string) || ''} onChange={e => handleInputChange(field.id, e.target.value)} required={field.required} placeholder={field.placeholder} className={inputBaseClasses} />
                            )}
                            {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                        </div>
                    ))}
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                            Submit Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
