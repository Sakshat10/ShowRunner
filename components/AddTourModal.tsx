
import React, { useState, useEffect } from 'react';
import type { Tour } from '../types';
import { XIcon, CalendarIcon } from './IconComponents';

interface AddTourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tourData: Omit<Tour, 'id' | 'status' | 'imageUrl'>) => void;
    tourToEdit?: Tour | null;
}

export const AddTourModal: React.FC<AddTourModalProps> = ({ isOpen, onClose, onSave, tourToEdit }) => {
    const [artistName, setArtistName] = useState('');
    const [tourName, setTourName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (tourToEdit) {
            setArtistName(tourToEdit.artistName);
            setTourName(tourToEdit.tourName);
            setStartDate(tourToEdit.startDate);
            setEndDate(tourToEdit.endDate);
        } else {
            setArtistName('');
            setTourName('');
            setStartDate('');
            setEndDate('');
        }
    }, [tourToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!artistName.trim() || !tourName.trim() || !startDate || !endDate) {
            alert('Please fill out all fields.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('End date must be after start date.');
            return;
        }
        onSave({ artistName, tourName, startDate, endDate });
    };

    if (!isOpen) return null;

    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm px-3 py-2";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{tourToEdit ? 'Edit Tour' : 'Add New Tour'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="artistName" className="block text-sm font-medium text-slate-700 mb-1">Artist Name</label>
                            <input type="text" id="artistName" value={artistName} onChange={e => setArtistName(e.target.value)} required className={inputBaseClasses} />
                        </div>
                        <div>
                            <label htmlFor="tourName" className="block text-sm font-medium text-slate-700 mb-1">Tour Name</label>
                            <input type="text" id="tourName" value={tourName} onChange={e => setTourName(e.target.value)} required className={inputBaseClasses} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className={`${inputBaseClasses} pr-10`} />
                                <CalendarIcon className="absolute right-3 top-9 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required min={startDate} className={`${inputBaseClasses} pr-10`} />
                                <CalendarIcon className="absolute right-3 top-9 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                            {tourToEdit ? 'Save Changes' : 'Save Tour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
