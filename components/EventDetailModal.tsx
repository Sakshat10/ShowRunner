import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ScheduleEvent, Person, Comment, Task, PermissionLevel, EventType } from '../types';
import { XIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ClipboardListIcon, PlusIcon, TrashIcon, Edit3Icon, PlaneIcon, TruckIcon, SoundIcon, MicIcon, CoffeeIcon, ChevronDownIcon } from './IconComponents';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: ScheduleEvent;
    people: Person[];
    currentUser: Person;
    onAddComment: (text: string) => void;
    onAddTask: (taskData: Omit<Task, 'id' | 'completed'>) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
}

// Reusable component for selecting an assignee with search functionality
const AssigneeSelector: React.FC<{
    options: Person[];
    selectedId: string;
    onSelect: (id: string) => void;
    align?: 'left' | 'right';
    isCompact?: boolean;
}> = ({ options, selectedId, onSelect, align = 'left', isCompact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedPerson = useMemo(() => options.find(p => p.id === selectedId), [options, selectedId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onSelect(id);
        setIsOpen(false);
        setSearch('');
    };
    
    const filteredOptions = options.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const dropdownClasses = `absolute z-20 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 ${align === 'right' ? 'right-0' : 'left-0'}`;
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className={`flex items-center gap-2 text-left transition-colors ${isCompact ? 'p-1 rounded-md hover:bg-slate-200' : 'w-full p-2 bg-slate-100 rounded-lg border border-slate-200'}`}
            >
                {selectedPerson ? (
                    <>
                        <img src={selectedPerson.avatarUrl} alt={selectedPerson.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                        <span className={`flex-grow font-medium ${isCompact ? 'text-xs text-slate-500' : 'text-slate-800'}`}>{selectedPerson.name}</span>
                    </>
                ) : (
                    <span className="flex-grow text-slate-500">Select Assignee</span>
                )}
                <ChevronDownIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>
            {isOpen && (
                <div className={dropdownClasses}>
                    <div className="p-2">
                         <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name..."
                            className="w-full text-sm bg-white rounded-md border border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm px-2 py-1"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? filteredOptions.map(person => (
                            <button
                                type="button"
                                key={person.id}
                                onClick={() => handleSelect(person.id)}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-sm"
                            >
                                <img src={person.avatarUrl} alt={person.name} className="w-6 h-6 rounded-full" />
                                <span className="font-medium text-slate-800">{person.name}</span>
                            </button>
                        )) : (
                            <p className="px-3 py-2 text-sm text-slate-500">No results found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TaskItem: React.FC<{
    task: Task;
    canManage: boolean;
    assignablePeople: Person[];
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
}> = ({ task, canManage, assignablePeople, onUpdate, onDelete }) => {
    
    const handleToggle = () => {
        onUpdate({ ...task, completed: !task.completed });
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100">
            <div className="flex items-center flex-grow">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleToggle}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    aria-label={task.text}
                />
                <p className={`ml-3 text-slate-700 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.text}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                 {canManage ? (
                     <AssigneeSelector
                        options={assignablePeople}
                        selectedId={task.assignedTo}
                        onSelect={(newAssigneeId) => onUpdate({ ...task, assignedTo: newAssigneeId })}
                        align="right"
                        isCompact
                     />
                 ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <img src={assignablePeople.find(p => p.id === task.assignedTo)?.avatarUrl} className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{assignablePeople.find(p => p.id === task.assignedTo)?.name}</span>
                    </div>
                 )}
                {canManage && (
                    <button onClick={() => onDelete(task.id)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

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


export const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, onClose, event, people, currentUser, onAddComment, onAddTask, onUpdateTask, onDeleteTask }) => {
    const [newComment, setNewComment] = useState('');
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');
    
    const peopleMap = useMemo(() => {
        return people.reduce((acc, person) => {
            acc[person.id] = person;
            return acc;
        }, {} as { [key: string]: Person });
    }, [people]);

    const currentUserEventPermission = useMemo(() => {
        return event.assignedTo.find(a => a.personId === currentUser.id)?.permission || 'read';
    }, [event.assignedTo, currentUser.id]);

    const hasTaskWriteAccess = currentUserEventPermission === 'write';

    const assignedPeopleForTask = useMemo(() => event.assignedTo.map(a => peopleMap[a.personId]).filter(Boolean), [event.assignedTo, peopleMap]);

    useEffect(() => {
        // Reset state when modal opens or event changes
        if (isOpen) {
            setNewTaskText('');
            setNewComment('');
            const defaultAssignee = assignedPeopleForTask.find(p => p.id === currentUser.id)
                ? currentUser.id
                : assignedPeopleForTask[0]?.id || '';
            setNewTaskAssignee(defaultAssignee);
        }
    }, [isOpen, event, assignedPeopleForTask, currentUser.id]);


    const userTasks = useMemo(() => event.tasks?.filter(task => task.assignedTo === currentUser.id) || [], [event.tasks, currentUser.id]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const handleTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim() && newTaskAssignee) {
            onAddTask({ text: newTaskText.trim(), assignedTo: newTaskAssignee });
            setNewTaskText('');
        } else {
            alert('Please enter task text and select an assignee.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">{event.title}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Event Details */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <EventIcon type={event.type} className="w-6 h-6 text-slate-500" />
                            <span className="text-lg font-semibold text-slate-800 capitalize">{event.type}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                            <CalendarIcon className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" />
                            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                            <ClockIcon className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" />
                            <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                            <MapPinIcon className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" />
                            <span>{event.location}</span>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {event.notes && (
                        <div>
                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800 border-t border-slate-200 pt-4 mt-4">
                                <Edit3Icon className="w-5 h-5" />
                                <h3>Notes</h3>
                            </div>
                            <p className="mt-2 text-slate-700 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">{event.notes}</p>
                        </div>
                    )}
                    
                    {/* Assigned Crew Section */}
                    <div>
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-800 border-t border-slate-200 pt-4 mt-4">
                            <UsersIcon className="w-5 h-5" />
                            <h3>Assigned Crew</h3>
                        </div>
                        <div className="mt-3 space-y-3">
                            {event.assignedTo.map(assignment => {
                                const person = peopleMap[assignment.personId];
                                if (!person) return null;
                                return (
                                    <div key={person.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <img src={person.avatarUrl} alt={person.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{person.name}</p>
                                                <p className="text-sm text-slate-500">{person.role}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            assignment.permission === 'write'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {assignment.permission === 'write' ? 'Write Access' : 'Read Only'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {/* Tasks Section */}
                    {(hasTaskWriteAccess || userTasks.length > 0) && (
                        <div>
                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800 border-t border-slate-200 pt-4 mt-4">
                                <ClipboardListIcon className="w-5 h-5" />
                                <h3>Tasks</h3>
                            </div>
                            <div className="mt-2 space-y-1">
                                {(hasTaskWriteAccess ? (event.tasks || []) : userTasks).map(task => (
                                    <TaskItem key={task.id} task={task} canManage={hasTaskWriteAccess} assignablePeople={assignedPeopleForTask} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
                                ))}
                                {hasTaskWriteAccess && (!event.tasks || event.tasks.length === 0) && <p className="text-sm text-slate-400 px-2">No tasks created yet.</p>}
                            </div>
                            {hasTaskWriteAccess && (
                                 <div className="mt-2 pt-2 border-t border-slate-200">
                                    <form onSubmit={handleTaskSubmit} className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            placeholder="Add a new task..."
                                            className="flex-grow text-base bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition p-2"
                                        />
                                        <div className="w-48">
                                            <AssigneeSelector
                                                options={assignedPeopleForTask}
                                                selectedId={newTaskAssignee}
                                                onSelect={setNewTaskAssignee}
                                            />
                                        </div>
                                        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                            <PlusIcon className="w-5 h-5"/>
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Comments Section */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 border-t border-slate-200 pt-4 mt-4">Discussion</h3>
                        <div className="mt-4 space-y-4">
                            {event.comments && event.comments.length > 0 ? (
                                event.comments.map(comment => (
                                    <div key={comment.id} className="flex items-start gap-3">
                                        <img src={peopleMap[comment.authorId]?.avatarUrl} alt={peopleMap[comment.authorId]?.name} className="w-8 h-8 rounded-full mt-1" />
                                        <div className="flex-1 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-semibold text-slate-800">{peopleMap[comment.authorId]?.name}</p>
                                                <p className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="text-slate-700">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">No comments yet.</p>
                            )}
                        </div>
                         <div className="mt-4 pt-4 border-t border-slate-200">
                            <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                                 <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full mt-1" />
                                <div className="flex-1">
                                    <textarea 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full text-base bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition p-2"
                                        rows={2}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm">
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};