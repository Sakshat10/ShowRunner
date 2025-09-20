import React, { useState, useMemo } from 'react';
import type { Person } from '../types';
import { PlusIcon, TrashIcon, EditIcon } from './IconComponents';

interface CrewManifestProps {
    people: Person[];
    currentUser: Person;
    onAddCrewMemberClick: () => void;
    onEditCrewMember: (person: Person) => void;
    onRemoveCrewMember: (personId: string) => void;
}

export const CrewManifest: React.FC<CrewManifestProps> = ({ people, currentUser, onAddCrewMemberClick, onEditCrewMember, onRemoveCrewMember }) => {
    const canManageCrew = currentUser.role === 'Tour Manager';
    const [sortBy, setSortBy] = useState<'name' | 'role'>('name');

    const sortedPeople = useMemo(() => {
        return [...people].sort((a, b) => {
            if (sortBy === 'role') {
                if (a.role < b.role) return -1;
                if (a.role > b.role) return 1;
                // if roles are the same, sort by name
                return a.name.localeCompare(b.name);
            }
            // default sort by name
            return a.name.localeCompare(b.name);
        });
    }, [people, sortBy]);
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {canManageCrew ? (
                    <button 
                        onClick={onAddCrewMemberClick}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add New Member
                    </button>
                ) : <div />}

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setSortBy('name')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${sortBy === 'name' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                        Sort by Name
                    </button>
                    <button 
                        onClick={() => setSortBy('role')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${sortBy === 'role' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                        Sort by Role
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                {sortedPeople.map(person => (
                    <div key={person.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <img src={person.avatarUrl} alt={person.name} className="w-12 h-12 rounded-full mr-4" />
                            <div>
                                <p className="font-bold text-slate-800">{person.name}</p>
                                <p className="text-sm text-slate-500">{person.role}</p>
                            </div>
                        </div>
                        {canManageCrew && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onEditCrewMember(person)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Edit member details"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                {person.id !== currentUser.id && (
                                    <button
                                        onClick={() => onRemoveCrewMember(person.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remove from tour"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
