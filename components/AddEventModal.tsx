import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ScheduleEvent, EventType, Person, EventAssignment, PermissionLevel } from '../types';
import { eventTypes } from '../types';
import { CalendarIcon, ClockIcon, XIcon } from './IconComponents';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveEvent: (eventData: Omit<ScheduleEvent, 'id' | 'comments' | 'tasks'>) => void;
    tourStartDate: string;
    tourEndDate: string;
    people: Person[];
    eventToEdit?: ScheduleEvent | null;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSaveEvent, tourStartDate, tourEndDate, people, eventToEdit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('Travel');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    
    // --- NEW ASSIGNMENT LOGIC ---
    const [assignedTo, setAssignedTo] = useState<EventAssignment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const peopleMap = useMemo(() => people.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Person }), [people]);

    const availablePeople = useMemo(() => {
        const assignedIds = new Set(assignedTo.map(a => a.personId));
        return people.filter(p => !assignedIds.has(p.id));
    }, [people, assignedTo]);

    const filteredPeople = useMemo(() => {
        if (!searchQuery) return availablePeople;
        return availablePeople.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, availablePeople]);

    const handleAddAssignee = (personId: string) => {
        setAssignedTo(prev => [...prev, { personId, permission: 'read' }]);
        setSearchQuery('');
        // Keep dropdown open and focus the input for rapid adding
        searchInputRef.current?.focus();
    };

    const handleRemoveAssignee = (personId: string) => {
        setAssignedTo(prev => prev.filter(a => a.personId !== personId));
    };

    const handlePermissionChange = (personId: string, permission: PermissionLevel) => {
        setAssignedTo(prev => prev.map(a => a.personId === personId ? { ...a, permission } : a));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // --- END NEW ASSIGNMENT LOGIC ---
    
    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title);
            setType(eventToEdit.type);
            setDate(eventToEdit.date);
            setStartTime(eventToEdit.startTime);
            setEndTime(eventToEdit.endTime);
            setLocation(eventToEdit.location);
            setNotes(eventToEdit.notes || '');
            setAssignedTo(eventToEdit.assignedTo);
        } else {
            setTitle('');
            setType('Travel');
            setDate(tourStartDate);
            setStartTime('12:00');
            setEndTime('');
            setLocation('');
            setNotes('');
            setAssignedTo([]);
        }
        setSearchQuery('');
        setIsSearchFocused(false);
    }, [eventToEdit, tourStartDate]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date.trim() || !startTime.trim() || !location.trim()) {
            alert('Please fill out all required fields.');
            return;
        }
        onSaveEvent({ title, type, date, startTime, endTime, location, notes, assignedTo });
    };

    if (!isOpen) return null;
    
    const inputBaseClasses = "w-full text-base bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{eventToEdit ? 'Edit Event' : 'Add New Event'}</h2>
                         <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={`${inputBaseClasses} px-3 py-2`}/>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                                <select id="type" value={type} onChange={e => setType(e.target.value as EventType)} className={`${inputBaseClasses} px-3 py-2.5`}>
                                    {eventTypes.map(et => <option key={et} value={et}>{et}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required min={tourStartDate} max={tourEndDate} className={`${inputBaseClasses} pl-3 pr-10 py-2`}/>
                                <CalendarIcon className="absolute right-3 top-9 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className={`${inputBaseClasses} pl-3 pr-10 py-2`}/>
                                <ClockIcon className="absolute right-3 top-9 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                             <div className="relative">
                                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">End Time (Optional)</label>
                                <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className={`${inputBaseClasses} pl-3 pr-10 py-2`}/>
                                <ClockIcon className="absolute right-3 top-9 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className={`${inputBaseClasses} px-3 py-2`}/>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                            <div className="space-y-2">
                                {assignedTo.map((assignment) => (
                                    <div key={assignment.personId} className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                                        <img src={peopleMap[assignment.personId]?.avatarUrl} alt={peopleMap[assignment.personId]?.name} className="w-6 h-6 rounded-full" />
                                        <span className="flex-grow font-medium text-slate-800">{peopleMap[assignment.personId]?.name}</span>
                                        <div className="flex rounded-lg border border-slate-200 bg-white">
                                            <button type="button" onClick={() => handlePermissionChange(assignment.personId, 'read')} className={`px-2 py-1 text-xs rounded-l-md ${assignment.permission === 'read' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600'}`}>Read</button>
                                            <button type="button" onClick={() => handlePermissionChange(assignment.personId, 'write')} className={`px-2 py-1 text-xs rounded-r-md ${assignment.permission === 'write' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Write</button>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveAssignee(assignment.personId)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                
                                <div className="relative" ref={searchContainerRef}>
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        placeholder={availablePeople.length > 0 ? "Search to add people..." : "All people assigned"}
                                        disabled={availablePeople.length === 0}
                                        className={`${inputBaseClasses} w-full px-3 py-2`}
                                    />
                                    {isSearchFocused && filteredPeople.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredPeople.map(person => (
                                                <button 
                                                    type="button" 
                                                    key={person.id}
                                                    onClick={() => handleAddAssignee(person.id)}
                                                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                                                >
                                                    <img src={person.avatarUrl} alt={person.name} className="w-6 h-6 rounded-full" />
                                                    <div>
                                                        <p className="font-medium text-slate-800">{person.name}</p>
                                                        <p className="text-xs text-slate-500">{person.role}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${inputBaseClasses} px-3 py-2`}></textarea>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Save Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
