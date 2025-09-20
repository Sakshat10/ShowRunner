import React from 'react';
import { type FormFieldType, formFieldTypes } from '../types';
import { XIcon } from './IconComponents';

interface AddFormFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddField: (type: FormFieldType) => void;
}

export const AddFormFieldModal: React.FC<AddFormFieldModalProps> = ({ isOpen, onClose, onAddField }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Add Form Field</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formFieldTypes.map(type => (
                        <button key={type} onClick={() => onAddField(type)} className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 text-center">
                            <span className="font-semibold capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};