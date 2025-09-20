import React, { useState, useRef, useEffect } from 'react';
import type { Person, Tour } from '../types';
import { SignalIcon, AlertTriangleIcon, PlusIcon, MoreVerticalIcon, TrashIcon } from './IconComponents';

interface DashboardProps {
    tours: Tour[];
    onSelectTour: (tour: Tour) => void;
    currentUser: Person;
    onAddCrewMemberClick: () => void;
    onAddTourClick: () => void;
    onDeleteTour: (tourId: string) => void;
}

const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleString('default', { month: 'long' });
    const endMonth = end.toLocaleString('default', { month: 'long' });

    if (start.getFullYear() !== end.getFullYear()) {
        return `${start.getDate()} ${startMonth} ${start.getFullYear()} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }
    if (startMonth !== endMonth) {
        return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }
    return `${start.getDate()} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
};

const TourCard: React.FC<{ 
    tour: Tour; 
    onSelect: () => void;
    onDelete: () => void;
    canDelete: boolean;
}> = ({ tour, onSelect, onDelete, canDelete }) => {
    const financials = tour.financials;
    const budget = financials?.budget.reduce((sum, item) => sum + item.amount, 0) || 0;
    const actual = financials?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0;
    const budgetHealth = budget > 0 ? (actual / budget) * 100 : 0;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onSelect from firing
        onDelete();
        setIsMenuOpen(false);
    };

    const HealthIndicator = () => {
        if (budget === 0 && tour.status !== 'Upcoming') return null;
        if (budgetHealth > 100) {
            return <div className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertTriangleIcon className="w-4 h-4" /> Over Budget</div>;
        }
        return <div className="flex items-center gap-1.5 text-xs font-medium text-green-600"><SignalIcon className="w-4 h-4" /> On Track</div>;
    }

    return (
        <div 
            onClick={onSelect}
            className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative"
        >
             {canDelete && (
                <div ref={menuRef} className="absolute top-2 right-2 z-20">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }} 
                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                        aria-label="More options"
                    >
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200">
                            <button 
                                onClick={handleDeleteClick}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete Tour
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="h-48 overflow-hidden relative">
                <img src={tour.imageUrl} alt={tour.tourName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                 <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        tour.status === 'Active' ? 'bg-green-100 text-green-800' :
                        tour.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                    }`}>{tour.status}</span>
                <h3 className="absolute bottom-4 left-5 text-2xl font-bold text-white tracking-tight">{tour.artistName}</h3>
            </div>
            <div className="p-5">
                <p className="font-bold text-lg text-slate-800">{tour.tourName}</p>
                <p className="text-sm text-slate-500 mb-3">{formatDateRange(tour.startDate, tour.endDate)}</p>
                <div className="flex justify-end items-center pt-3 border-t border-slate-100">
                     <HealthIndicator />
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ tours, onSelectTour, currentUser, onAddCrewMemberClick, onAddTourClick, onDeleteTour }) => {
    const canManage = currentUser.role === 'Tour Manager';
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Global Command Center</h1>
                {canManage && (
                     <div className="flex items-center gap-2">
                         <button 
                            onClick={onAddCrewMemberClick}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Add Crew</span>
                        </button>
                         <button 
                            onClick={onAddTourClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Add Tour</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tours.map(tour => (
                    <TourCard 
                        key={tour.id} 
                        tour={tour} 
                        onSelect={() => onSelectTour(tour)}
                        onDelete={() => onDeleteTour(tour.id)}
                        canDelete={canManage}
                    />
                ))}
            </div>
        </div>
    );
};