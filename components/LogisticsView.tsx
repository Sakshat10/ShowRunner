import React, { useMemo } from 'react';
import type { ScheduleEvent } from '../types';
import { PlaneIcon, TruckIcon, AlertTriangleIcon, CheckCircleIcon } from './IconComponents';

interface LogisticsViewProps {
    schedule: ScheduleEvent[];
}

// Mock function to simulate real-time status
const getMockStatus = (eventId: string) => {
    // Simple pseudo-random status based on event ID hash
    const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 10 === 0) return { status: 'Delayed', color: 'text-red-600', icon: <AlertTriangleIcon className="w-5 h-5" /> };
    if (hash % 10 === 1) return { status: 'Boarding', color: 'text-yellow-600', icon: <PlaneIcon className="w-5 h-5" /> };
    return { status: 'On Time', color: 'text-green-600', icon: <CheckCircleIcon className="w-5 h-5" /> };
};

export const LogisticsView: React.FC<LogisticsViewProps> = ({ schedule }) => {
    const travelEvents = useMemo(() => {
        return schedule
            .filter(event => event.type === 'Travel')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [schedule]);

    if (travelEvents.length === 0) {
        return <div className="text-center py-16 text-slate-500">No travel events scheduled.</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Real-Time Logistics</h2>
            <div className="space-y-4">
                {travelEvents.map(event => {
                    const mockStatus = getMockStatus(event.id);
                    return (
                        <div key={event.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
                            <div className={`p-3 rounded-full ${event.title.toLowerCase().includes('fly') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                {event.title.toLowerCase().includes('fly') ? <PlaneIcon className="w-6 h-6" /> : <TruckIcon className="w-6 h-6" />}
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-slate-800">{event.title}</p>
                                <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })} at {event.startTime}</p>
                                <p className="text-sm text-slate-500">{event.notes}</p>
                            </div>
                            <div className={`flex items-center gap-2 font-semibold text-sm ${mockStatus.color}`}>
                                {mockStatus.icon}
                                <span>{mockStatus.status}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};