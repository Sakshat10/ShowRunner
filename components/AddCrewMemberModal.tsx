import React, { useState, useEffect } from 'react';
import { type Person, type UserRole, userRoles } from '../types';
import { XIcon } from './IconComponents';

interface AddCrewMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (personData: Omit<Person, 'avatarUrl' | 'password' | 'status'> & { id?: string }) => void;
    personToEdit?: Person | null;
}

export const AddCrewMemberModal: React.FC<AddCrewMemberModalProps> = ({ isOpen, onClose, onSave, personToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('Crew');

    useEffect(() => {
        if (personToEdit) {
            setName(personToEdit.name);
            setEmail(personToEdit.email);
            setRole(personToEdit.role);
        } else {
            setName('');
            setEmail('');
            setRole('Crew');
        }
    }, [personToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            alert('Please enter a name and email.');
            return;
        }
        onSave({ ...(personToEdit && { id: personToEdit.id }), name, email, role });
    };

    if (!isOpen) return null;

    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{personToEdit ? 'Edit Crew Member' : 'Invite New Member'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={`${inputBaseClasses} px-3 py-2`} />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!personToEdit} className={`${inputBaseClasses} px-3 py-2 disabled:bg-slate-100`} />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className={`${inputBaseClasses} px-3 py-2.5`}>
                                {userRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                            {personToEdit ? 'Save Changes' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
