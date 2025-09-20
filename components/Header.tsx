import React, { useState, useRef, useEffect } from 'react';
import { MusicNoteIcon, ChevronDownIcon, UsersIcon, LogOutIcon } from './IconComponents';
import type { Person } from '../types';

interface HeaderProps {
    currentUser: Person;
    onLogout: () => void;
    onShowAllCrew: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onShowAllCrew }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-900/10 sticky top-0 z-50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <MusicNoteIcon className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-800">ShowRunner</span>
                    </div>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                            <span className="font-semibold text-slate-700">{currentUser.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200">
                                <div className="p-2">
                                    <div className="px-3 py-2">
                                        <p className="font-bold text-slate-800 truncate">{currentUser.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{currentUser.email}</p>
                                    </div>
                                    <div className="border-t border-slate-200 my-1"></div>
                                    {currentUser.role === 'Tour Manager' && (
                                        <button
                                            onClick={() => {
                                                onShowAllCrew();
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
                                        >
                                            <UsersIcon className="w-5 h-5" />
                                            All Crew
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
                                    >
                                        <LogOutIcon className="w-5 h-5" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};