import React, { useState, useMemo } from 'react';
import type { Person } from '../types';
import { XIcon, SearchIcon } from './IconComponents';

interface AllCrewModalProps {
    isOpen: boolean;
    onClose: () => void;
    people: Person[];
}

export const AllCrewModal: React.FC<AllCrewModalProps> = ({ isOpen, onClose, people }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPeople = useMemo(() => {
        if (!searchTerm) {
            return people;
        }
        return people.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [people, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">All Crew Members</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 border-b border-slate-200">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or role..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm pl-10 pr-4 py-2"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-3">
                    {filteredPeople.length > 0 ? (
                        filteredPeople.map(person => (
                            <div key={person.id} className="flex items-center p-3 bg-slate-50 border border-transparent rounded-lg">
                                <img src={person.avatarUrl} alt={person.name} className="w-10 h-10 rounded-full mr-4" />
                                <div>
                                    <p className="font-bold text-slate-800">{person.name}</p>
                                    <p className="text-sm text-slate-500">{person.role}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-8">No crew members match your search.</p>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
