

import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { Tour, ScheduleEvent, EventType, Person, Financials, WebsiteSection, EmailCampaign, RegistrationForm, FormField, Supplier, Expense, Attendee } from '../types';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, PlaneIcon, TruckIcon, SoundIcon, MicIcon, CoffeeIcon, PlusIcon, UsersIcon, MoreVerticalIcon, EditIcon, TrashIcon, MessageSquareIcon, DollarSignIcon, FileImportIcon, PrinterIcon, MapIcon, TrendingUpIcon, MegaphoneIcon, ClipboardCheckIcon, BriefcaseIcon, ListTodoIcon } from './IconComponents';
import { CrewManifest } from './CrewManifest';
import { FinancesView } from './FinancesView';
import { LogisticsView } from './LogisticsView';
import { VenuesView } from './VenuesView';
import { MarketingView } from './MarketingView';
import { RegistrationView } from './RegistrationView';
import { SourcingView } from './SourcingView';
import { TasksView, type TourTask } from './TasksView';

interface TourDetailProps {
    tour: Tour;
    schedule: ScheduleEvent[];
    people: Person[];
    suppliers: Supplier[];
    currentUser: Person;
    onBack: () => void;
    onAddEventClick: () => void;
    onEditEvent: (event: ScheduleEvent) => void;
    onDeleteEvent: (eventId: string) => void;
    onViewEventDetails: (event: ScheduleEvent) => void;
    onImportRiderClick: () => void;
    onGenerateDaySheet: (user: Person, date: string) => void;
    onAddCrewMemberClick: () => void;
    onEditCrewMember: (person: Person) => void;
    onRemoveCrewMember: (personId: string) => void;
    onEditTour: () => void;
    // Finances
    onAddExpenseClick: () => void;
    onEditExpenseClick: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    onUpdateExpenseStatus: (expenseId: string, status: 'approved' | 'rejected') => void;
    // Marketing
    onUpdateWebsite: (website: WebsiteSection[]) => void;
    onToggleWebsiteDeployment: () => void;
    onAddCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
    onDeleteCampaign: (campaignId: string) => void;
    onViewPublicSite: () => void;
    selectedCampaign: EmailCampaign | null;
    onSelectCampaign: (campaign: EmailCampaign) => void;
    onDeselectCampaign: () => void;
    onUpdateCampaign: (campaign: EmailCampaign) => void;
    // Registration
    onAddRegistrationForm: () => void;
    onUpdateRegistrationForm: (form: RegistrationForm) => void;
    onDeleteRegistrationForm: (formId: string) => void;
    onAddFormField: (formId: string, field: Omit<FormField, 'id'>) => void;
    onUpdateFormField: (formId: string, field: FormField) => void;
    onDeleteFormField: (formId: string, fieldId: string) => void;
    onDeleteAttendee: (attendeeId: string) => void;
    onViewPublicForm: (form: RegistrationForm) => void;
    // Sourcing
    onAwardProposal: (rfpId: string) => void;
    // Tasks
    onBulkUpdateTasksStatus: (tasksToUpdate: { eventId: string; taskId: string }[], completed: boolean) => void;
    onBulkDeleteTasks: (tasksToDelete: { eventId: string; taskId: string }[]) => void;
}

const EventIcon: React.FC<{ type: EventType, className?: string }> = ({ type, className }) => {
    const icons: { [key in EventType]: React.ReactNode } = {
        'Travel': <PlaneIcon className={className} />,
        'Load-in': <TruckIcon className={className} />,
        'Soundcheck': <SoundIcon className={className} />,
        'Performance': <MicIcon className={className} />,
        'Load-out': <TruckIcon className={className} />,
        'Day Off': <CoffeeIcon className={className} />,
        'Interview': <MicIcon className={className} />,
    };
    return icons[type] || <CalendarIcon className={className} />;
};

const EventActions: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="absolute top-1 right-1" ref={dropdownRef}>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded-full hover:bg-slate-200">
                <MoreVerticalIcon className="w-5 h-5 text-slate-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                        <EditIcon className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export const TourDetail: React.FC<TourDetailProps> = (props) => {
    const { 
        tour, schedule, people, suppliers, currentUser, onBack, onAddEventClick, onEditEvent, 
        onDeleteEvent, onViewEventDetails, onImportRiderClick, onGenerateDaySheet, 
        onAddCrewMemberClick, onEditCrewMember, onRemoveCrewMember, onEditTour, onUpdateWebsite, onToggleWebsiteDeployment, 
        onAddCampaign, onDeleteCampaign, onViewPublicSite,
        selectedCampaign, onSelectCampaign, onDeselectCampaign, onUpdateCampaign,
        onAddRegistrationForm, onUpdateRegistrationForm, onDeleteRegistrationForm, onAddFormField, onUpdateFormField, onDeleteFormField,
        onDeleteAttendee, onAwardProposal, onViewPublicForm, onBulkUpdateTasksStatus, onBulkDeleteTasks,
        onAddExpenseClick, onEditExpenseClick, onDeleteExpense, onUpdateExpenseStatus,
    } = props;
    const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'crew' | 'finances' | 'sourcing' | 'logistics' | 'venues' | 'marketing' | 'registration'>('schedule');
    
    const hasScheduleWriteAccess = currentUser.role === 'Tour Manager';

    const filteredSchedule = useMemo(() => {
        if (hasScheduleWriteAccess) {
            return schedule;
        }
        return schedule.filter(event => 
            event.assignedTo.some(assignment => assignment.personId === currentUser.id)
        );
    }, [schedule, currentUser, hasScheduleWriteAccess]);

    const groupedSchedule = useMemo(() => {
        return filteredSchedule.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) { acc[date] = []; }
            acc[date].push(event);
            return acc;
        }, {} as { [key: string]: ScheduleEvent[] });
    }, [filteredSchedule]);
    
    const allTasks: TourTask[] = useMemo(() => {
        return schedule.flatMap(event =>
            (event.tasks || []).map(task => ({
                ...task,
                eventId: event.id,
                eventTitle: event.title,
                eventDate: event.date
            }))
        );
    }, [schedule]);

    const sortedDates = Object.keys(groupedSchedule).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const tourCrew = useMemo(() => {
        if (!schedule || schedule.length === 0) {
            return [];
        }
        const personIdsInSchedule = new Set(
            schedule.flatMap(event => event.assignedTo.map(assignment => assignment.personId))
        );
        return people.filter(person => personIdsInSchedule.has(person.id));
    }, [schedule, people]);

    const TABS = [
        { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
        { id: 'tasks', label: 'Tasks', icon: ListTodoIcon },
        { id: 'crew', label: `Crew (${tourCrew.length})`, icon: UsersIcon },
        { id: 'finances', label: 'Finances', icon: DollarSignIcon },
        { id: 'logistics', label: 'Logistics', icon: TrendingUpIcon },
        { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
        { id: 'registration', label: 'Registration', icon: ClipboardCheckIcon },
        { id: 'venues', label: 'Venues & Maps', icon: MapIcon },
        { id: 'sourcing', label: 'Sourcing', icon: BriefcaseIcon },
    ];
    
    const orderedTabs = [
        ...TABS.filter(t => t.id !== 'sourcing' && t.id !== 'venues'),
        TABS.find(t => t.id === 'venues')!,
        TABS.find(t => t.id === 'sourcing')!,
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-2">
                <div className="flex items-start gap-4">
                    <button onClick={onBack} className="p-2 mt-1 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{tour.artistName}</h1>
                        <p className="text-lg text-slate-500">{tour.tourName}</p>
                    </div>
                </div>
                {hasScheduleWriteAccess && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={onEditTour} className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                            <EditIcon className="w-5 h-5" />
                            <span>Edit Tour</span>
                        </button>
                        {activeTab === 'schedule' && (
                            <>
                                <button onClick={() => onGenerateDaySheet(currentUser, sortedDates[0])} className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                                    <PrinterIcon className="w-5 h-5" />
                                </button>
                                <button onClick={onImportRiderClick} className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                                    <FileImportIcon className="w-5 h-5" />
                                    <span>Import</span>
                                </button>
                                <button onClick={onAddEventClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Add Event</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="border-b border-slate-200">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {orderedTabs.map(tab => {
                         const isDisabled = tab.id === 'sourcing' || tab.id === 'venues';
                         return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (isDisabled) {
                                        alert('Feature coming soon!');
                                    } else {
                                        setActiveTab(tab.id as any);
                                    }
                                }}
                                className={`group inline-flex items-center py-2 px-4 font-semibold text-sm rounded-lg transition-colors ${
                                    activeTab === tab.id ? 'bg-blue-600 text-white' :
                                    isDisabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                                title={isDisabled ? "Feature coming soon!" : ""}
                            >
                               <tab.icon className="mr-2 w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-grow overflow-y-auto pt-6">
                {activeTab === 'schedule' && (
                     <>
                        {sortedDates.length > 0 ? sortedDates.map(date => (
                            <div key={date} className="mb-8">
                                <h2 className="text-xl font-bold text-slate-700 mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-sm py-2 z-10">
                                    {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h2>
                                <div className="space-y-4 border-l-2 border-slate-200/80 ml-4 pl-10">
                                    {groupedSchedule[date].map(event => (
                                        <div 
                                            key={event.id} 
                                            onClick={() => onViewEventDetails(event)}
                                            className="relative p-4 -ml-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200"
                                            aria-label={`View details for ${event.title}`}
                                        >
                                            <div className="absolute -left-[50px] top-5 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-slate-50">
                                                <EventIcon type={event.type} className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="relative">
                                                <p className="font-bold text-slate-800">{event.title}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                                                    <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {event.location}</span>
                                                </div>
                                                {event.notes && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-md">{event.notes}</p>}
                                                {event.assignedTo && event.assignedTo.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Assigned Crew</h4>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                            {event.assignedTo.map(assignment => {
                                                                const person = people.find(p => p.id === assignment.personId);
                                                                if (!person) return null;
                                                                return (
                                                                    <div key={person.id} className="flex items-center gap-2">
                                                                        <img src={person.avatarUrl} alt={person.name} className="w-6 h-6 rounded-full" />
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-slate-700">{person.name}</p>
                                                                            <p className="text-xs text-slate-500">{person.role}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                {event.comments && event.comments.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mt-2">
                                                        <MessageSquareIcon className="w-4 h-4" />
                                                        <span>{event.comments.length} {event.comments.length === 1 ? 'comment' : 'comments'}</span>
                                                    </div>
                                                )}
                                                {hasScheduleWriteAccess && (
                                                    <EventActions 
                                                        onEdit={() => onEditEvent(event)} 
                                                        onDelete={() => onDeleteEvent(event.id)} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16">
                                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="mt-2 text-lg font-semibold text-slate-600">No Schedule Available</h3>
                                <p className="mt-1 text-sm text-slate-400">{hasScheduleWriteAccess ? 'The itinerary for this tour is empty.' : 'You have no events assigned for this tour.'}</p>
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'tasks' && <TasksView tasks={allTasks} people={people} onBulkUpdateStatus={onBulkUpdateTasksStatus} onBulkDelete={onBulkDeleteTasks} />}
                {activeTab === 'crew' && <CrewManifest people={tourCrew} currentUser={currentUser} onAddCrewMemberClick={onAddCrewMemberClick} onEditCrewMember={onEditCrewMember} onRemoveCrewMember={onRemoveCrewMember} />}
                {activeTab === 'finances' && <FinancesView tour={tour} people={people} currentUser={currentUser} onAddExpenseClick={onAddExpenseClick} onEditExpenseClick={onEditExpenseClick} onDeleteExpense={onDeleteExpense} onUpdateExpenseStatus={onUpdateExpenseStatus} />}
                {activeTab === 'sourcing' && <SourcingView tour={tour} suppliers={suppliers} onAwardProposal={onAwardProposal} />}
                {activeTab === 'logistics' && <LogisticsView schedule={schedule} />}
                {activeTab === 'venues' && <VenuesView tour={tour} />}
                {activeTab === 'marketing' && <MarketingView 
                    tour={tour}
                    schedule={schedule}
                    people={people}
                    onUpdateWebsite={onUpdateWebsite}
                    onToggleWebsiteDeployment={onToggleWebsiteDeployment}
                    onAddCampaign={onAddCampaign} 
                    onDeleteCampaign={onDeleteCampaign}
                    onViewPublicSite={onViewPublicSite}
                    selectedCampaign={selectedCampaign}
                    onSelectCampaign={onSelectCampaign}
                    onDeselectCampaign={onDeselectCampaign}
                    onUpdateCampaign={onUpdateCampaign}
                />}
                {activeTab === 'registration' && <RegistrationView 
                    tour={tour}
                    registration={tour.registration}
                    onAddForm={onAddRegistrationForm}
                    onUpdateForm={onUpdateRegistrationForm}
                    onDeleteForm={onDeleteRegistrationForm}
                    onAddFormField={onAddFormField}
                    onUpdateFormField={onUpdateFormField}
                    onDeleteFormField={onDeleteFormField}
                    onDeleteAttendee={onDeleteAttendee}
                    onViewPublicForm={onViewPublicForm}
                />}
            </div>
        </div>
    );
};