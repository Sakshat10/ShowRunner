
import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { XIcon } from './IconComponents';

interface ExpenseEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expenseData: Omit<Expense, 'id' | 'status' | 'rejectionReason'> & { id?: string }) => void;
    expenseToEdit?: Expense | null;
    categories: string[];
    currentUserId: string;
}

export const ExpenseEditorModal: React.FC<ExpenseEditorModalProps> = ({ isOpen, onClose, onSave, expenseToEdit, categories, currentUserId }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(String(expenseToEdit.amount));
            setCategory(expenseToEdit.category);
            setDate(expenseToEdit.date);
            setReceiptUrl(expenseToEdit.receiptUrl);
        } else {
            setDescription('');
            setAmount('');
            setCategory(categories[0] || '');
            setDate(new Date().toISOString().split('T')[0]);
            setReceiptUrl(undefined);
        }
    }, [expenseToEdit, categories]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !amount || !category) {
            alert('Please fill out all required fields.');
            return;
        }
        onSave({
            ...(expenseToEdit && { id: expenseToEdit.id }),
            description,
            amount: parseFloat(amount),
            category,
            date,
            submittedById: expenseToEdit ? expenseToEdit.submittedById : currentUserId,
            receiptUrl,
        });
    };

    if (!isOpen) return null;

    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm p-2";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className={inputBaseClasses} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className={inputBaseClasses} placeholder="$0.00" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} required className={inputBaseClasses}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                             </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputBaseClasses} />
                         </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Receipt</label>
                             <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                            {receiptUrl && (
                                <div className="mt-2">
                                    <img src={receiptUrl} alt="Receipt preview" className="max-h-24 rounded-lg border border-slate-200" />
                                </div>
                            )}
                         </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                            {expenseToEdit ? 'Save Changes' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
