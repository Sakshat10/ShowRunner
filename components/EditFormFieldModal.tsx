import React, { useState } from 'react';
import type { FormField } from '../types';
import { XIcon, PlusIcon, TrashIcon } from './IconComponents';

interface EditFormFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    field: FormField;
    onSave: (field: FormField) => void;
}

export const EditFormFieldModal: React.FC<EditFormFieldModalProps> = ({ isOpen, onClose, field, onSave }) => {
    const [editedField, setEditedField] = useState<FormField>(field);

    const handleChange = (prop: keyof FormField, value: any) => {
        setEditedField(prev => ({ ...prev, [prop]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(editedField.options || [])];
        newOptions[index] = value;
        handleChange('options', newOptions);
    };

    const handleAddOption = () => {
        const newOptions = [...(editedField.options || []), `Option ${(editedField.options?.length || 0) + 1}`];
        handleChange('options', newOptions);
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = (editedField.options || []).filter((_, i) => i !== index);
        handleChange('options', newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedField);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold capitalize">Edit {field.type} Field</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Label</label>
                        <input type="text" value={editedField.label} onChange={e => handleChange('label', e.target.value)} required className="w-full bg-slate-100 rounded-md p-2 border-slate-200" />
                    </div>
                    {['text', 'email', 'tel', 'number', 'textarea', 'select'].includes(editedField.type) && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Placeholder</label>
                            <input type="text" value={editedField.placeholder || ''} onChange={e => handleChange('placeholder', e.target.value)} className="w-full bg-slate-100 rounded-md p-2 border-slate-200" />
                            {editedField.type === 'select' && (
                                <p className="text-xs text-slate-500 mt-1">This text appears as the first, default option in the dropdown.</p>
                            )}
                        </div>
                    )}
                    {['select', 'radio', 'checkbox'].includes(editedField.type) && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Options</label>
                            <div className="space-y-2">
                                {(editedField.options || []).map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={option} onChange={e => handleOptionChange(index, e.target.value)} className="flex-grow bg-slate-100 rounded-md p-2 border-slate-200" />
                                        <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddOption} className="w-full flex items-center justify-center gap-2 p-2 text-sm font-semibold text-blue-600 border-2 border-dashed rounded-lg hover:bg-blue-50">
                                    <PlusIcon className="w-4 h-4" /> Add Option
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center">
                        <input type="checkbox" id="required" checked={editedField.required} onChange={e => handleChange('required', e.target.checked)} className="h-4 w-4 rounded" />
                        <label htmlFor="required" className="ml-2 text-sm font-medium">This field is required</label>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">Save Changes</button>
                </div>
            </form>
        </div>
    );
};