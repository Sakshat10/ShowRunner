
import React, { useState, useMemo, useEffect } from 'react';
import type { Task, Person } from '../types';
import { ListTodoIcon, ClipboardCheckIcon, TrashIcon } from './IconComponents';

export interface TourTask extends Task {
    eventId: string;
    eventTitle: string;
    eventDate: string;
}

interface TasksViewProps {
    tasks: TourTask[];
    people: Person[];
    onBulkUpdateStatus: (tasksToUpdate: { eventId: string, taskId: string }[], completed: boolean) => void;
    onBulkDelete: (tasksToDelete: { eventId: string, taskId: string }[]) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, people, onBulkUpdateStatus, onBulkDelete }) => {
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

    const peopleMap = useMemo(() => people.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Person }), [people]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'completed' && task.completed) ||
                (filterStatus === 'pending' && !task.completed);
            return matchesAssignee && matchesStatus;
        });
    }, [tasks, filterAssignee, filterStatus]);
    
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    }, [filteredTasks]);

    useEffect(() => {
        setSelectedTasks(new Set());
    }, [filterAssignee, filterStatus]);

    const areAllSelectedTasksCompleted = useMemo(() => {
        if (selectedTasks.size === 0) return false;
        const selectedTaskDetails = tasks.filter(t => selectedTasks.has(t.id));
        if (selectedTaskDetails.length === 0) return false;
        return selectedTaskDetails.every(t => t.completed);
    }, [selectedTasks, tasks]);

    const handleSelectTask = (taskId: string) => {
        setSelectedTasks(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(taskId)) {
                newSelection.delete(taskId);
            } else {
                newSelection.add(taskId);
            }
            return newSelection;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTasks(new Set(sortedTasks.map(t => t.id)));
        } else {
            setSelectedTasks(new Set());
        }
    };
    
    const isAllSelected = selectedTasks.size > 0 && selectedTasks.size === sortedTasks.length;

    const getSelectedTaskDetails = () => {
        return tasks.filter(t => selectedTasks.has(t.id)).map(t => ({ eventId: t.eventId, taskId: t.id }));
    };

    const handleBulkStatusUpdate = () => {
        const tasksToUpdate = getSelectedTaskDetails();
        if (tasksToUpdate.length > 0) {
            onBulkUpdateStatus(tasksToUpdate, !areAllSelectedTasksCompleted);
            setSelectedTasks(new Set());
        }
    };

    const handleBulkDelete = () => {
        const tasksToDelete = getSelectedTaskDetails();
        if (tasksToDelete.length > 0) {
            onBulkDelete(tasksToDelete);
            setSelectedTasks(new Set());
        }
    };

    return (
        <div className="space-y-4">
            {selectedTasks.size > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center sticky top-0 z-10">
                    <span className="font-semibold text-blue-800">{selectedTasks.size} task(s) selected</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleBulkStatusUpdate} 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            <ClipboardCheckIcon className="w-4 h-4" />
                            {areAllSelectedTasksCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                        </button>
                        <button 
                            onClick={handleBulkDelete} 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-lg border items-center">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={sortedTasks.length === 0}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label="Select all tasks"
                    />
                </div>
                <select 
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm bg-white"
                >
                    <option value="all">All Assignees</option>
                    {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select 
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm bg-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div className="space-y-3">
                {sortedTasks.length > 0 ? sortedTasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={() => handleSelectTask(task.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between transition-colors cursor-pointer ${selectedTasks.has(task.id) ? 'bg-blue-100 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedTasks.has(task.id)}
                                readOnly
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                            />
                            <div className="ml-4">
                                <p className={`font-medium text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.text}</p>
                                <p className="text-sm text-slate-500">For: <span className="font-semibold">{task.eventTitle}</span> on {new Date(task.eventDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <img src={peopleMap[task.assignedTo]?.avatarUrl} alt={peopleMap[task.assignedTo]?.name} className="w-6 h-6 rounded-full" />
                            <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{peopleMap[task.assignedTo]?.name}</span>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-16 text-slate-500">
                        <ListTodoIcon className="w-12 h-12 mx-auto text-slate-300" />
                        <h3 className="mt-2 font-semibold">No tasks found</h3>
                        <p className="text-sm">No tasks match the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
