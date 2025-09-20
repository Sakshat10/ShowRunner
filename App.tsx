

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TourDetail } from './components/ProjectViewer';
import { AddEventModal } from './components/AddEventModal';
import { EventDetailModal } from './components/EventDetailModal';
import { RiderImportModal } from './components/RiderImportModal';
import { DaySheetView } from './components/DaySheetView';
import { AddCrewMemberModal } from './components/AddCrewMemberModal';
import { AddTourModal } from './components/AddTourModal';
import { Auth } from './components/Auth';
import { PublicWebsiteView } from './components/PublicWebsiteView';
import { PublicFormView } from './components/PublicFormView';
import { AllCrewModal } from './components/AllCrewModal';
import { ExpenseEditorModal } from './components/ExpenseEditorModal';
import type { Tour, ScheduleEvent, Person, Comment, Task, Financials, Venue, BudgetItem, EventAssignment, WebsiteSection, EmailCampaign, RegistrationForm, FormField, Supplier, RegistrationResponse, Attendee, Registration, RFPStatus, Expense } from './types';
import { parseRiderWithGemini, type RiderParseResult } from './services/geminiService';

// Custom hook for persistent state
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
        }
    }, [key, state]);

    return [state, setState];
}

// --- MOCK DATA ---
const MOCK_PEOPLE: Person[] = [
    { id: 'person-1', name: 'Alex Johnson', email: 'alex@showrunner.app', password: 'password123', status: 'active', role: 'Tour Manager', avatarUrl: 'https://i.pravatar.cc/150?u=person-1' },
    { id: 'person-2', name: 'Maria Garcia', email: 'maria@showrunner.app', password: 'password123', status: 'active', role: 'Artist', avatarUrl: 'https://i.pravatar.cc/150?u=person-2' },
    { id: 'person-3', name: 'Sam Chen', email: 'sam@showrunner.app', password: 'password123', status: 'active', role: 'Artist', avatarUrl: 'https://i.pravatar.cc/150?u=person-3' },
    { id: 'person-4', name: 'Jordan Davis', email: 'jordan@showrunner.app', password: 'password123', status: 'active', role: 'Production', avatarUrl: 'https://i.pravatar.cc/150?u=person-4' },
    { id: 'person-5', name: 'Casey Lee', email: 'casey@showrunner.app', password: 'password123', status: 'active', role: 'Crew', avatarUrl: 'https://i.pravatar.cc/150?u=person-5' },
    { id: 'person-6', name: 'Taylor Green', email: 'taylor@showrunner.app', password: 'password123', status: 'active', role: 'Driver', avatarUrl: 'https://i.pravatar.cc/150?u=person-6' },
];

const MOCK_VENUES_TOUR1: Venue[] = [
    {
        id: 'venue-1',
        name: 'Red Rocks Amphitheatre',
        location: 'Morrison, CO',
        mapImageUrl: 'https://images.unsplash.com/photo-1596422739504-2d939d75b6f3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        floorPlanUrl: 'https://images.unsplash.com/photo-1588162120334-9a8523a5b6dc?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        pins: [
            { id: 'pin-1', x: 50, y: 50, label: 'Stage' },
            { id: 'pin-2', x: 80, y: 30, label: 'Production Office' },
            { id: 'pin-3', x: 20, y: 70, label: 'Bus Parking' },
        ],
    },
    {
        id: 'venue-2',
        name: 'United Center',
        location: 'Chicago, IL',
        mapImageUrl: 'https://images.unsplash.com/photo-1582215979227-2d2011b714b7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        pins: [
            { id: 'pin-4', x: 60, y: 45, label: 'Stage' },
        ],
    }
];

const MOCK_FINANCIALS_TOUR1: Financials = {
    budget: [
        { id: 'bud-1', category: 'Venue', amount: 20000 },
        { id: 'bud-2', category: 'Travel & Hotels', amount: 15000 },
        { id: 'bud-3', category: 'Production', amount: 25000 },
        { id: 'bud-4', category: 'Catering', amount: 5000 },
        { id: 'bud-5', category: 'Marketing', amount: 10000 },
    ],
    expenses: [
        { id: 'exp-1', description: 'Venue Deposit - Red Rocks', amount: 7500, date: '2024-07-25', category: 'Venue', submittedById: 'person-1', status: 'approved' },
        { id: 'exp-2', description: 'Bus Fuel', amount: 850.25, date: '2024-08-18', category: 'Travel & Hotels', submittedById: 'person-6', status: 'approved' },
        { id: 'exp-3', description: 'Crew Dinner in Denver', amount: 620.50, date: '2024-08-15', category: 'Catering', submittedById: 'person-1', status: 'approved' },
        { id: 'exp-4', description: 'Lighting Rental - Bright Lights Inc.', amount: 8500, date: '2024-08-10', category: 'Production', submittedById: 'person-4', status: 'approved' },
        { id: 'exp-5', description: 'Hotel Block - The Grand Hotel', amount: 9600, date: '2024-08-15', category: 'Travel & Hotels', submittedById: 'person-1', status: 'approved' },
        { id: 'exp-6', description: 'Per Diems (Week 1)', amount: 2100, date: '2024-08-19', category: 'Catering', submittedById: 'person-1', status: 'pending' },
        { id: 'exp-7', description: 'Receiptless expense', amount: 50, date: '2024-08-19', category: 'Catering', submittedById: 'person-5', status: 'pending' },
    ],
};

const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Majestic Theater', category: 'Venue', location: 'Denver, CO', contactEmail: 'booking@majestic.com', rating: 4.5 },
    { id: 'sup-2', name: 'Gourmet Catering Co.', category: 'Catering', location: 'Denver, CO', contactEmail: 'contact@gourmetcatering.co', rating: 5 },
    { id: 'sup-3', name: 'Bright Lights Inc.', category: 'Lighting', location: 'Denver, CO', contactEmail: 'sales@brightlights.com', rating: 4 },
    { id: 'sup-4', name: 'The Grand Hotel', category: 'Hotel', location: 'Denver, CO', contactEmail: 'groupsales@grandhotel.com', rating: 4.8 },
    { id: 'sup-5', name: 'City Arena', category: 'Venue', location: 'Chicago, IL', contactEmail: 'events@cityarena.com', rating: 4.2 },
    { id: 'sup-6', name: 'Rockstar Security', category: 'Security', location: 'Chicago, IL', contactEmail: 'info@rockstarsecurity.net', rating: 4.9 },
    { id: 'sup-7', name: 'TourBus Express', category: 'Transportation', location: 'Nashville, TN', contactEmail: 'charters@tourbusexpress.com', rating: 4.6 },
    { id: 'sup-8', name: 'Hyatt Regency Chicago', category: 'Hotel', location: 'Chicago, IL', contactEmail: 'chicago.regency@hyatt.com', rating: 4.5 },
    { id: 'sup-9', name: 'StageGlow Productions', category: 'Lighting', location: 'Denver, CO', contactEmail: 'contact@stageglow.com', rating: 4.7 },
];


const MOCK_TOURS: Tour[] = [
    {
        id: 'tour-01',
        artistName: 'The Lumineers',
        tourName: 'Brightside World Tour',
        status: 'Active',
        startDate: '2024-08-01',
        endDate: '2024-10-25',
        imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        financials: MOCK_FINANCIALS_TOUR1,
        venues: MOCK_VENUES_TOUR1,
        rfps: [
            { id: 'rfp-1', title: 'Venue Rental - Denver', sentDate: '2024-07-20', dueDate: '2024-08-01', status: 'Responded', details: 'Requesting quote for venue rental on Aug 16, including sound and basic lighting.' },
            { id: 'rfp-2', title: 'Hotel Block - Denver', sentDate: '2024-07-22', dueDate: '2024-08-05', status: 'Awarded', details: 'Requesting quote for 20 king rooms, Aug 15-18.' },
            { id: 'rfp-3', title: 'Catering - Denver', sentDate: '2024-07-25', dueDate: '2024-08-02', status: 'Sent', details: 'Requesting catering options for a crew of 30 people on show day.' },
            { id: 'rfp-4', title: 'Stage Lighting - Denver', sentDate: '2024-07-26', dueDate: '2024-08-03', status: 'Responded', details: 'Requesting proposals for full stage lighting package for Red Rocks show.' },
        ],
        proposals: [
            { id: 'prop-1', rfpId: 'rfp-1', supplierId: 'sup-1', receivedDate: '2024-07-28', totalCost: 15000, notes: 'Includes house sound system, PA, and basic lighting rig. Additional costs for specialized equipment.' },
            { id: 'prop-2', rfpId: 'rfp-2', supplierId: 'sup-4', receivedDate: '2024-07-30', totalCost: 9600, notes: 'Rate of $200/night for 20 rooms for 3 nights. Includes breakfast.' },
            { id: 'prop-3', rfpId: 'rfp-4', supplierId: 'sup-3', receivedDate: '2024-07-29', totalCost: 8500, notes: 'Includes 2 follow spots, 20 PAR cans, and a full LED wash. A lighting director is an additional $800.' },
            { id: 'prop-4', rfpId: 'rfp-4', supplierId: 'sup-9', receivedDate: '2024-07-30', totalCost: 9200, notes: 'Our premium package with moving heads, hazers, and a dedicated lighting tech included in the price.' },
        ],
        roomBlocks: [
            { id: 'rb-1', hotelSupplierId: 'sup-4', checkInDate: '2024-08-15', checkOutDate: '2024-08-18', roomCount: 20, negotiatedRate: 200, confirmationCode: 'GH8823K' }
        ],
        website: [
            { id: 'ws-h', type: 'header', content: {} },
            { id: 'ws-1', type: 'hero', content: { headline: 'The Brightside World Tour', subheadline: 'Join The Lumineers for an unforgettable experience.' } },
            { id: 'ws-2', type: 'about', content: { title: 'About The Tour', body: 'Experience the magic of The Lumineers live as they perform hits from their new album "Brightside" and fan favorites. This world tour brings their signature folk-rock sound to cities across the globe.' } },
            { id: 'ws-3', type: 'hero', content: { headline: 'Second Hero', subheadline: 'Another great section.' } },
            { id: 'ws-f', type: 'footer', content: {copyrightText: `© ${new Date().getFullYear()} The Lumineers`} },
        ],
        isWebsiteDeployed: true,
        campaigns: [
            { id: 'camp-1', name: 'Tour Announcement', status: 'Sent', scheduledDate: '2024-07-15', stats: { openRate: 45.2, clickRate: 12.1 }, subject: 'The Lumineers are coming!', fromName: 'The Lumineers HQ', content: { headline: 'Brightside World Tour', body: 'We are thrilled to announce our new world tour! Get ready for an unforgettable experience.', ctaButtonText: 'View Dates', ctaButtonUrl: '#' } },
            { id: 'camp-2', name: 'Early Bird Tickets', status: 'Sent', scheduledDate: '2024-07-22', stats: { openRate: 38.9, clickRate: 15.5 }, subject: 'Early Bird Tickets Available Now', fromName: 'The Lumineers HQ', content: { headline: 'Get Your Tickets First!', body: 'A special pre-sale is now available for our biggest fans. Don\'t miss out!', ctaButtonText: 'Buy Tickets', ctaButtonUrl: '#' } },
            { id: 'camp-3', name: 'Venue Specific Reminder - Denver', status: 'Scheduled', scheduledDate: '2024-08-10', stats: { openRate: 0, clickRate: 0 }, subject: 'See you in Denver, {{user_name}}!', fromName: 'The Lumineers HQ', content: { headline: 'Red Rocks is Calling!', body: 'We can\'t wait to see you at the show in {{event_city}}. It\'s going to be a magical night.', ctaButtonText: 'Show Details', ctaButtonUrl: '#' }, segmentation: { locationIds: ['Red Rocks Amphitheatre'] } },
            { id: 'camp-4', name: 'Final Ticket Warning', status: 'Draft', stats: { openRate: 0, clickRate: 0 }, subject: 'Last Chance for Tickets!', fromName: 'The Lumineers HQ', content: { headline: 'Tickets are almost gone!', body: 'Don\'t miss your chance to see us live. Grab your tickets before they sell out.', ctaButtonText: 'Get Final Tickets', ctaButtonUrl: '#' } },
        ],
        registration: {
            forms: [
                { id: 'form-1', name: 'General Admission Sign-up', status: 'open', fields: [
                    { id: 'field-1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
                    { id: 'field-2', type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com' },
                    { id: 'field-3', type: 'select', label: 'T-Shirt Size', required: false, options: ['Small', 'Medium', 'Large', 'X-Large'] },
                ]},
                { id: 'form-2', name: 'VIP Meet & Greet', status: 'closed', fields: [] },
            ],
            attendees: [
                { id: 'att-1', formId: 'form-1', registrationDate: '2024-07-20T10:00:00Z', responses: [
                    { fieldId: 'field-1', value: 'Alice Johnson' },
                    { fieldId: 'field-2', value: 'alice@example.com' },
                    { fieldId: 'field-3', value: 'Medium' },
                ]},
                 { id: 'att-2', formId: 'form-1', registrationDate: '2024-07-21T11:30:00Z', responses: [
                    { fieldId: 'field-1', value: 'Bob Williams' },
                    { fieldId: 'field-2', value: 'bob@example.com' },
                 ]},
            ]
        }
    },
    {
        id: 'tour-02',
        artistName: 'Billie Eilish',
        tourName: 'Happier Than Ever, The World Tour',
        status: 'Upcoming',
        startDate: '2024-11-01',
        endDate: '2025-02-15',
        imageUrl: 'https://images.unsplash.com/photo-1608269752319-350a1498b488?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
    },
    {
        id: 'tour-03',
        artistName: 'Foo Fighters',
        tourName: 'Rock Legends Tour',
        status: 'Completed',
        startDate: '2024-05-10',
        endDate: '2024-06-20',
        imageUrl: 'https://images.unsplash.com/photo-1546328636-a1b6d19d6d34?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
    },
];

const MOCK_SCHEDULE_TOUR1: ScheduleEvent[] = [
    { id: 'event-1', date: '2024-08-15', type: 'Travel', title: 'Fly to Denver', startTime: '10:00', endTime: '12:00', location: 'DEN Airport', notes: 'Flight UA123, pick up at baggage claim 4.', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-2', permission: 'read' }, { personId: 'person-3', permission: 'read' }, { personId: 'person-6', permission: 'write' }], comments: [{ id: 'c-1', authorId: 'person-1', timestamp: '2024-08-14T18:00:00Z', text: "Just confirmed the flight details."}] },
    { id: 'event-2', date: '2024-08-15', type: 'Load-in', title: 'Gear Load-in at Red Rocks', startTime: '15:00', endTime: '19:00', location: 'Red Rocks Amphitheatre', notes: 'Meet at the east loading bay. Hard hats required.', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-4', permission: 'write' }, { personId: 'person-5', permission: 'read' }], tasks: [
        { id: 't-1', text: 'Patch front of house snake', completed: true, assignedTo: 'person-5' },
        { id: 't-2', text: 'Set up drum mics', completed: false, assignedTo: 'person-5' },
        { id: 't-3', text: 'Coordinate with local lighting vendor', completed: false, assignedTo: 'person-4' },
    ] },
    { id: 'event-3', date: '2024-08-16', type: 'Soundcheck', title: 'Soundcheck', startTime: '16:00', endTime: '18:00', location: 'Red Rocks Amphitheatre', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-2', permission: 'read' }, { personId: 'person-3', permission: 'read' }, { personId: 'person-4', permission: 'read' }, { personId: 'person-5', permission: 'read' }] },
    { id: 'event-4', date: '2024-08-16', type: 'Performance', title: 'Show at Red Rocks', startTime: '20:00', endTime: '22:30', location: 'Red Rocks Amphitheatre', notes: 'Special guest appearance planned for the encore.', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-2', permission: 'read' }, { personId: 'person-3', permission: 'read' }, { personId: 'person-4', permission: 'read' }, { personId: 'person-5', permission: 'read' }] },
    { id: 'event-5', date: '2024-08-17', type: 'Day Off', title: 'Day Off in Denver', startTime: '', endTime: '', location: 'Denver, CO', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-2', permission: 'read' }, { personId: 'person-3', permission: 'read' }] },
    { id: 'event-6', date: '2024-08-18', type: 'Travel', title: 'Drive to Chicago', startTime: '09:00', endTime: '21:00', location: 'On the road', notes: 'Overnight stop planned in Omaha.', assignedTo: [{ personId: 'person-1', permission: 'write' }, { personId: 'person-6', permission: 'write' }] },
];


const App: React.FC = () => {
    const [tours, setTours] = usePersistentState<Tour[]>('tours', MOCK_TOURS);
    const [people, setPeople] = usePersistentState<Person[]>('people', MOCK_PEOPLE);
    const [schedule, setSchedule] = usePersistentState<{ [tourId: string]: ScheduleEvent[] }>('schedule', { 'tour-01': MOCK_SCHEDULE_TOUR1 });
    const [suppliers, setSuppliers] = usePersistentState<Supplier[]>('suppliers', MOCK_SUPPLIERS);
    
    // --- AUTH ---
    const [currentUser, setCurrentUser] = usePersistentState<Person | null>('currentUser', null);
    
    // --- VIEW STATE ---
    const [selectedTour, setSelectedTour] = usePersistentState<Tour | null>('selectedTour', null);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);
    const [isRiderImportModalOpen, setIsRiderImportModalOpen] = useState(false);
    const [isDaySheetVisible, setIsDaySheetVisible] = useState(false);
    const [daySheetParams, setDaySheetParams] = useState<{ user: Person, date: string } | null>(null);
    const [isAddCrewModalOpen, setIsAddCrewModalOpen] = useState(false);
    const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
    const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
    const [tourToEdit, setTourToEdit] = useState<Tour | null>(null);
    const [publicView, setPublicView] = useState<{ type: 'website' | 'form', tourId: string, formId?: string } | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
    const [isAllCrewModalOpen, setIsAllCrewModalOpen] = useState(false);
    const [isExpenseEditorModalOpen, setIsExpenseEditorModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

     // --- PUBLIC VIEW ROUTING ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const tourId = params.get('tourId');
        const formId = params.get('formId');

        if (view === 'website' && tourId) {
            const tour = tours.find(t => t.id === tourId);
            if (tour?.isWebsiteDeployed) {
                setPublicView({ type: 'website', tourId });
            }
        } else if (view === 'form' && tourId && formId) {
             const tour = tours.find(t => t.id === tourId);
             const form = tour?.registration?.forms.find(f => f.id === formId);
             if (form?.status === 'open') {
                setPublicView({ type: 'form', tourId, formId });
             }
        }
    }, [tours]);

    const handleClosePublicView = () => {
        setPublicView(null);
        window.history.pushState({}, '', window.location.pathname);
    };

    // --- TOUR & PROJECT MANAGEMENT ---
    const handleSelectTour = (tour: Tour) => setSelectedTour(tour);
    const handleBackToDashboard = () => {
        setSelectedTour(null);
        setSelectedCampaign(null);
    };
    
    // Validate that a selected tour still exists on page load
    useEffect(() => {
        if (selectedTour && !tours.find(t => t.id === selectedTour.id)) {
            setSelectedTour(null);
        }
    }, [tours, selectedTour, setSelectedTour]);


    // --- AUTH LOGIC ---
    const handleLogin = useCallback((credentials: Pick<Person, 'email' | 'password'>) => {
        const user = people.find(p => p.email.toLowerCase() === credentials.email?.toLowerCase() && p.password === credentials.password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        alert('Invalid email or password.');
        return false;
    }, [people]);

    const handleLogout = () => setCurrentUser(null);
    
    const handleRegister = (userData: Pick<Person, 'name' | 'email' | 'password'>) => {
        if (people.find(p => p.email.toLowerCase() === userData.email.toLowerCase())) {
            alert("An account with this email already exists.");
            return;
        }
        const newUser: Person = {
            id: `person-${Date.now()}`,
            ...userData,
            role: 'Tour Manager', // First user is always Tour Manager
            status: 'active',
            avatarUrl: `https://i.pravatar.cc/150?u=person-${Date.now()}`
        };
        setPeople(prev => [...prev, newUser]);
        setCurrentUser(newUser);
    };
    
    const handleSetPassword = (data: { email: string; password?: string }) => {
        setPeople(prev => prev.map(p => {
            if (p.email.toLowerCase() === data.email.toLowerCase() && p.status === 'pending_invitation') {
                return { ...p, password: data.password, status: 'active' };
            }
            return p;
        }));
        handleLogin({email: data.email, password: data.password});
    };

    // --- CREW MANAGEMENT ---
    const handleSaveCrewMember = (personData: Omit<Person, 'id' | 'avatarUrl' | 'password' | 'status'> & { id?: string }) => {
        if (personData.id) { // Editing existing person
            setPeople(prev => prev.map(p => p.id === personData.id ? { ...p, ...personData } : p));
        } else { // Adding new person
            if (people.find(p => p.email.toLowerCase() === personData.email.toLowerCase())) {
                alert("A user with this email already exists.");
                return;
            }
            const newPerson: Person = {
                id: `person-${Date.now()}`,
                ...personData,
                status: 'pending_invitation',
                avatarUrl: `https://i.pravatar.cc/150?u=person-${Date.now()}`,
            };
            setPeople(prev => [...prev, newPerson]);
        }
        setIsAddCrewModalOpen(false);
        setPersonToEdit(null);
    };

    const handleRemoveCrewMemberFromTour = (personId: string) => {
        if (!selectedTour || !window.confirm('Are you sure you want to remove this member from the tour? They will be unassigned from all events.')) {
            return;
        }

        setSchedule(prev => {
            const tourSchedule = prev[selectedTour.id] || [];
            const newTourSchedule = tourSchedule.map(event => ({
                ...event,
                assignedTo: event.assignedTo.filter(assignment => assignment.personId !== personId)
            }));
            return { ...prev, [selectedTour.id]: newTourSchedule };
        });
    };

    // --- SCHEDULE MANAGEMENT ---
    const handleSaveEvent = (eventData: Omit<ScheduleEvent, 'id' | 'comments' | 'tasks'>) => {
        if (selectedTour) {
            setSchedule(prev => {
                const tourSchedule = prev[selectedTour.id] || [];
                let newSchedule;
                if (eventToEdit) {
                    newSchedule = tourSchedule.map(e => e.id === eventToEdit.id ? { ...eventToEdit, ...eventData } : e);
                } else {
                    const newEvent: ScheduleEvent = {
                        ...eventData,
                        id: `event-${Date.now()}`,
                        comments: [],
                        tasks: [],
                    };
                    newSchedule = [...tourSchedule, newEvent];
                }
                return { ...prev, [selectedTour.id]: newSchedule };
            });
            setIsAddEventModalOpen(false);
            setEventToEdit(null);
        }
    };
    
    const handleDeleteEvent = (eventId: string) => {
        if (selectedTour && window.confirm('Are you sure you want to delete this event?')) {
            setSchedule(prev => ({
                ...prev,
                [selectedTour.id]: (prev[selectedTour.id] || []).filter(e => e.id !== eventId)
            }));
        }
    };
    
    const handleViewEventDetails = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setIsEventDetailModalOpen(true);
    };
    
    const handleEditEvent = (event: ScheduleEvent) => {
        setEventToEdit(event);
        setIsAddEventModalOpen(true);
    };

    // --- RIDER IMPORT ---
    const handleProcessRider = async (riderText: string): Promise<RiderParseResult> => {
        if (!currentUser) throw new Error("No user logged in");
        try {
            return await parseRiderWithGemini(riderText, people);
        } catch (error: any) {
            // This will catch the error from getAiClient if the API key is missing
            // and display it to the user, preventing a white screen crash.
            alert(error.message);
            // Return an empty result to fulfill the promise and prevent further errors.
            return { tasks: [], budgetItems: [] };
        }
    };
    
    const handleApplyRiderData = (data: RiderParseResult) => {
        if (!selectedTour) return;
        
        // 1. Add budget items to financials
        const newBudgetItems: BudgetItem[] = data.budgetItems.map(item => ({
            ...item,
            id: `bud-${Date.now()}-${Math.random()}`
        }));
        
        // 2. Add tasks to a new "Rider Tasks" schedule event
        const newTasks: Task[] = data.tasks.map(task => ({
            ...task,
            id: `task-${Date.now()}-${Math.random()}`,
            completed: false
        }));

        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                return {
                    ...t,
                    financials: {
                        ...t.financials!,
                        budget: [...(t.financials?.budget || []), ...newBudgetItems]
                    }
                };
            }
            return t;
        }));
        
        const today = new Date().toISOString().split('T')[0];
        const newEvent: ScheduleEvent = {
            id: `event-rider-${Date.now()}`,
            date: selectedTour.startDate || today,
            type: 'Load-in',
            title: 'Action Items from Rider Import',
            startTime: '09:00',
            endTime: '',
            location: 'Various',
            notes: 'These tasks and budget items were automatically generated by the AI Rider Import feature.',
            assignedTo: [{personId: currentUser.id, permission: 'write'}],
            tasks: newTasks
        };

        setSchedule(prev => ({
            ...prev,
            [selectedTour.id]: [...(prev[selectedTour.id] || []), newEvent]
        }));
        
        setIsRiderImportModalOpen(false);
    };
    
    // --- DAY SHEET ---
    const handleGenerateDaySheet = (user: Person, date: string) => {
        setDaySheetParams({ user, date });
        setIsDaySheetVisible(true);
    };

    // --- EVENT DETAILS MODAL ACTIONS (COMMENTS, TASKS) ---
    const handleAddComment = (text: string) => {
        if (!selectedTour || !selectedEvent || !currentUser) return;
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            authorId: currentUser.id,
            timestamp: new Date().toISOString(),
            text,
        };
        const updatedEvent = { ...selectedEvent, comments: [...(selectedEvent.comments || []), newComment] };
        setSelectedEvent(updatedEvent);
        setSchedule(prev => ({
            ...prev,
            [selectedTour.id]: (prev[selectedTour.id] || []).map(e => e.id === selectedEvent.id ? updatedEvent : e),
        }));
    };
    
    const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
        if (!selectedTour || !selectedEvent) return;
        const newTask: Task = { ...taskData, id: `task-${Date.now()}`, completed: false };
        const updatedEvent = { ...selectedEvent, tasks: [...(selectedEvent.tasks || []), newTask] };
        setSelectedEvent(updatedEvent);
        setSchedule(prev => ({
            ...prev,
            [selectedTour.id]: (prev[selectedTour.id] || []).map(e => e.id === selectedEvent.id ? updatedEvent : e),
        }));
    };

    const handleUpdateTask = (updatedTask: Task) => {
         if (!selectedTour || !selectedEvent) return;
        const updatedEvent = { ...selectedEvent, tasks: (selectedEvent.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) };
        setSelectedEvent(updatedEvent);
        setSchedule(prev => ({
            ...prev,
            [selectedTour.id]: (prev[selectedTour.id] || []).map(e => e.id === selectedEvent.id ? updatedEvent : e),
        }));
    };
    
    const handleDeleteTask = (taskId: string) => {
         if (!selectedTour || !selectedEvent) return;
        const updatedEvent = { ...selectedEvent, tasks: (selectedEvent.tasks || []).filter(t => t.id !== taskId) };
        setSelectedEvent(updatedEvent);
        setSchedule(prev => ({
            ...prev,
            [selectedTour.id]: (prev[selectedTour.id] || []).map(e => e.id === selectedEvent.id ? updatedEvent : e),
        }));
    };
    
    // --- FINANCIALS ---
    const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'status' | 'rejectionReason'> & {id?: string}) => {
        if (!selectedTour) return;

        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const financials = t.financials!;
                let newExpenses;
                if (expenseData.id) { // Editing
                    newExpenses = (financials.expenses || []).map(e => e.id === expenseData.id ? { ...e, ...expenseData } : e);
                } else { // Adding
                    const newExpense: Expense = {
                        ...expenseData,
                        id: `exp-${Date.now()}`,
                        status: 'pending',
                    };
                    newExpenses = [...(financials.expenses || []), newExpense];
                }
                return { ...t, financials: { ...financials, expenses: newExpenses } };
            }
            return t;
        }));
        
        setIsExpenseEditorModalOpen(false);
        setExpenseToEdit(null);
    };

    const handleDeleteExpense = (expenseId: string) => {
        if (!selectedTour || !window.confirm('Are you sure you want to delete this expense?')) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                 const financials = t.financials!;
                 const newExpenses = (financials.expenses || []).filter(e => e.id !== expenseId);
                 return { ...t, financials: { ...financials, expenses: newExpenses } };
            }
            return t;
        }));
    };
    
    const handleUpdateExpenseStatus = (expenseId: string, status: 'approved' | 'rejected') => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newExpenses = (t.financials?.expenses || []).map(exp => exp.id === expenseId ? { ...exp, status } : exp);
                return { ...t, financials: { ...t.financials!, expenses: newExpenses } };
            }
            return t;
        }));
    };
    
    // --- TOUR MANAGEMENT ---
    const handleSaveTour = (tourData: Omit<Tour, 'id' | 'status' | 'imageUrl'>) => {
        if (tourToEdit) {
            // Edit existing tour
            setTours(prev => prev.map(t => t.id === tourToEdit.id ? { ...t, ...tourData } : t));
        } else {
            // Add new tour
            const newTour: Tour = {
                ...tourData,
                id: `tour-${Date.now()}`,
                status: new Date(tourData.startDate) > new Date() ? 'Upcoming' : 'Active',
                imageUrl: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600`, // Generic image
            };
            setTours(prev => [...prev, newTour]);
        }
        setIsAddTourModalOpen(false);
        setTourToEdit(null);
    };

    const handleDeleteTour = (tourId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this tour and all its data? This cannot be undone.')) {
            setTours(prev => prev.filter(t => t.id !== tourId));
            setSchedule(prev => {
                const newSchedule = { ...prev };
                delete newSchedule[tourId];
                return newSchedule;
            });
            // If the deleted tour was selected, go back to dashboard
            if (selectedTour?.id === tourId) {
                setSelectedTour(null);
            }
        }
    };

    const handleEditTourClick = () => {
        setTourToEdit(selectedTour);
        setIsAddTourModalOpen(true);
    };

    // --- MARKETING: WEBSITE ---
    const handleUpdateWebsite = (website: WebsiteSection[]) => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => t.id === selectedTour.id ? { ...t, website } : t));
    };

    const handleToggleWebsiteDeployment = () => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => t.id === selectedTour.id ? { ...t, isWebsiteDeployed: !t.isWebsiteDeployed } : t));
    };

    // --- MARKETING: CAMPAIGNS ---
    const handleAddCampaign = (campaign: Omit<EmailCampaign, 'id'>) => {
        if (!selectedTour) return;
        const newCampaign: EmailCampaign = {
            ...campaign,
            id: `camp-${Date.now()}`,
        };
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                return { ...t, campaigns: [...(t.campaigns || []), newCampaign] };
            }
            return t;
        }));
    };

    const handleUpdateCampaign = (updatedCampaign: EmailCampaign) => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                return {
                    ...t,
                    campaigns: (t.campaigns || []).map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
                };
            }
            return t;
        }));
        setSelectedCampaign(updatedCampaign); // Keep the view updated
    };

    const handleDeleteCampaign = (campaignId: string) => {
        if (!selectedTour || !window.confirm('Are you sure you want to delete this campaign?')) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                return { ...t, campaigns: (t.campaigns || []).filter(c => c.id !== campaignId) };
            }
            return t;
        }));
    };
    
    // --- REGISTRATION ---
    const handleAddRegistrationForm = () => {
        if (!selectedTour) return;
        
        const newForm: RegistrationForm = {
            id: `form-${Date.now()}`,
            name: 'New Registration Form',
            status: 'open',
            fields: [],
        };
        
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const registration = t.registration ?? { forms: [], attendees: [] };
                return {
                    ...t,
                    registration: {
                        ...registration,
                        forms: [...registration.forms, newForm]
                    }
                };
            }
            return t;
        }));
    };

    const handleUpdateRegistrationForm = (form: RegistrationForm) => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newForms = (t.registration?.forms || []).map(f => f.id === form.id ? form : f);
                return { ...t, registration: { ...t.registration!, forms: newForms }};
            }
            return t;
        }));
    };
    
    const handleDeleteRegistrationForm = (formId: string) => {
        if (!selectedTour || !window.confirm('Are you sure you want to delete this form and all its attendee data? This cannot be undone.')) return;

        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const registration = t.registration!;
                const newForms = registration.forms.filter(f => f.id !== formId);
                // Also remove attendees associated with this form
                const newAttendees = registration.attendees.filter(a => a.formId !== formId);
                return { 
                    ...t, 
                    registration: { 
                        ...registration, 
                        forms: newForms,
                        attendees: newAttendees 
                    } 
                };
            }
            return t;
        }));
    };

    const handleAddFormField = (formId: string, field: Omit<FormField, 'id'>) => {
        if (!selectedTour) return;
        const newField: FormField = { ...field, id: `field-${Date.now()}` };
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newForms = (t.registration?.forms || []).map(f => {
                    if (f.id === formId) {
                        return { ...f, fields: [...f.fields, newField] };
                    }
                    return f;
                });
                return { ...t, registration: { ...t.registration!, forms: newForms }};
            }
            return t;
        }));
    };

    const handleUpdateFormField = (formId: string, field: FormField) => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newForms = (t.registration?.forms || []).map(f => {
                    if (f.id === formId) {
                        return { ...f, fields: f.fields.map(sf => sf.id === field.id ? field : sf) };
                    }
                    return f;
                });
                return { ...t, registration: { ...t.registration!, forms: newForms }};
            }
            return t;
        }));
    };
    
    const handleDeleteFormField = (formId: string, fieldId: string) => {
         if (!selectedTour) return;
         setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newForms = (t.registration?.forms || []).map(f => {
                    if (f.id === formId) {
                        return { ...f, fields: f.fields.filter(sf => sf.id !== fieldId) };
                    }
                    return f;
                });
                return { ...t, registration: { ...t.registration!, forms: newForms }};
            }
            return t;
        }));
    };
    
    const handlePublicFormSubmit = (tourId: string, formId: string, responses: RegistrationResponse[]) => {
        const newAttendee: Attendee = {
            id: `att-${Date.now()}`,
            formId: formId,
            registrationDate: new Date().toISOString(),
            responses: responses,
        };
        setTours(prev => prev.map(t => {
            if (t.id === tourId) {
                const registration = t.registration || { forms: [], attendees: [] };
                return {
                    ...t,
                    registration: {
                        ...registration,
                        attendees: [...registration.attendees, newAttendee]
                    }
                };
            }
            return t;
        }));
    };

    const handleDeleteAttendee = (attendeeId: string) => {
        if (!selectedTour || !window.confirm('Are you sure you want to remove this attendee?')) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const registration = t.registration!;
                const newAttendees = registration.attendees.filter(a => a.id !== attendeeId);
                return { ...t, registration: { ...registration, attendees: newAttendees } };
            }
            return t;
        }));
    };

    // --- SOURCING ---
    const handleAwardProposal = (rfpId: string) => {
        if (!selectedTour) return;
        setTours(prev => prev.map(t => {
            if (t.id === selectedTour.id) {
                const newRFPs = (t.rfps || []).map(rfp => rfp.id === rfpId ? { ...rfp, status: 'Awarded' as RFPStatus } : rfp);
                return { ...t, rfps: newRFPs };
            }
            return t;
        }));
    };
    
    // --- TASKS VIEW ---
    const handleBulkUpdateTasksStatus = (tasksToUpdate: { eventId: string; taskId: string }[], completed: boolean) => {
        if (!selectedTour) return;
        const taskIdsToUpdate = new Set(tasksToUpdate.map(t => t.taskId));
        setSchedule(prev => {
            const tourSchedule = (prev[selectedTour.id] || []).map(event => {
                const hasTasksToUpdate = event.tasks?.some(t => taskIdsToUpdate.has(t.id));
                if (hasTasksToUpdate) {
                    return {
                        ...event,
                        tasks: event.tasks!.map(task => 
                            taskIdsToUpdate.has(task.id) ? { ...task, completed } : task
                        )
                    };
                }
                return event;
            });
            return { ...prev, [selectedTour.id]: tourSchedule };
        });
    };
    
    const handleBulkDeleteTasks = (tasksToDelete: { eventId: string; taskId: string }[]) => {
        if (!selectedTour || !window.confirm(`Are you sure you want to delete ${tasksToDelete.length} task(s)? This cannot be undone.`)) return;
        const taskIdsToDelete = new Set(tasksToDelete.map(t => t.taskId));
        setSchedule(prev => {
            const tourSchedule = (prev[selectedTour.id] || []).map(event => {
                 const hasTasksToDelete = event.tasks?.some(t => taskIdsToDelete.has(t.id));
                 if (hasTasksToDelete) {
                     // FIX: Changed `t.id` to `task.id` to correctly reference the task object in the filter's scope.
                     return { ...event, tasks: event.tasks!.filter(task => !taskIdsToDelete.has(task.id)) };
                 }
                 return event;
            });
             return { ...prev, [selectedTour.id]: tourSchedule };
        });
    };


    // --- RENDER LOGIC ---
    if (publicView) {
        const tourForView = tours.find(t => t.id === publicView.tourId);
        if (!tourForView) return <div>Tour not found.</div>;

        if (publicView.type === 'website') {
            return <PublicWebsiteView tour={tourForView} onClose={handleClosePublicView} />;
        }
        if (publicView.type === 'form' && publicView.formId) {
            const formForView = tourForView.registration?.forms.find(f => f.id === publicView.formId);
            if (!formForView) return <div>Form not found.</div>;
            return <PublicFormView tour={tourForView} form={formForView} onClose={handleClosePublicView} onSubmit={handlePublicFormSubmit} />;
        }
    }

    if (!currentUser) {
        return <Auth users={people} onLogin={handleLogin} onRegister={handleRegister} onSetPassword={handleSetPassword} />;
    }

    const currentTourSchedule = selectedTour ? (schedule[selectedTour.id] || []) : [];

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header currentUser={currentUser} onLogout={handleLogout} onShowAllCrew={() => setIsAllCrewModalOpen(true)} />
            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                {selectedTour ? (
                    <TourDetail
                        tour={tours.find(t => t.id === selectedTour.id)!}
                        schedule={currentTourSchedule}
                        people={people}
                        suppliers={suppliers}
                        currentUser={currentUser}
                        onBack={handleBackToDashboard}
                        onAddEventClick={() => { setEventToEdit(null); setIsAddEventModalOpen(true); }}
                        onViewEventDetails={handleViewEventDetails}
                        onEditEvent={handleEditEvent}
                        onDeleteEvent={handleDeleteEvent}
                        onImportRiderClick={() => setIsRiderImportModalOpen(true)}
                        onGenerateDaySheet={handleGenerateDaySheet}
                        onAddCrewMemberClick={() => { setPersonToEdit(null); setIsAddCrewModalOpen(true); }}
                        onEditCrewMember={(person) => { setPersonToEdit(person); setIsAddCrewModalOpen(true); }}
                        onRemoveCrewMember={handleRemoveCrewMemberFromTour}
                        onEditTour={handleEditTourClick}
                        // Finances
                        onAddExpenseClick={() => { setExpenseToEdit(null); setIsExpenseEditorModalOpen(true); }}
                        onEditExpenseClick={(expense) => { setExpenseToEdit(expense); setIsExpenseEditorModalOpen(true); }}
                        onDeleteExpense={handleDeleteExpense}
                        onUpdateExpenseStatus={handleUpdateExpenseStatus}
                        // Marketing
                        onUpdateWebsite={handleUpdateWebsite}
                        onToggleWebsiteDeployment={handleToggleWebsiteDeployment}
                        onAddCampaign={handleAddCampaign}
                        onDeleteCampaign={handleDeleteCampaign}
                        onViewPublicSite={() => setPublicView({ type: 'website', tourId: selectedTour.id })}
                        selectedCampaign={selectedCampaign}
                        onSelectCampaign={setSelectedCampaign}
                        onDeselectCampaign={() => setSelectedCampaign(null)}
                        onUpdateCampaign={handleUpdateCampaign}
                        // Registration
                        onAddRegistrationForm={handleAddRegistrationForm}
                        onUpdateRegistrationForm={handleUpdateRegistrationForm}
                        onDeleteRegistrationForm={handleDeleteRegistrationForm}
                        onAddFormField={handleAddFormField}
                        onUpdateFormField={handleUpdateFormField}
                        onDeleteFormField={handleDeleteFormField}
                        onDeleteAttendee={handleDeleteAttendee}
                        onViewPublicForm={(form) => setPublicView({ type: 'form', tourId: selectedTour.id, formId: form.id })}
                        // Sourcing
                        onAwardProposal={handleAwardProposal}
                        // Tasks
                        onBulkUpdateTasksStatus={handleBulkUpdateTasksStatus}
                        onBulkDeleteTasks={handleBulkDeleteTasks}
                    />
                ) : (
                    <Dashboard 
                        tours={tours} 
                        onSelectTour={handleSelectTour} 
                        currentUser={currentUser}
                        onAddCrewMemberClick={() => { setPersonToEdit(null); setIsAddCrewModalOpen(true); }}
                        onAddTourClick={() => { setTourToEdit(null); setIsAddTourModalOpen(true); }}
                        onDeleteTour={handleDeleteTour}
                    />
                )}
            </main>
            {isAddEventModalOpen && selectedTour && (
                <AddEventModal
                    isOpen={isAddEventModalOpen}
                    onClose={() => { setIsAddEventModalOpen(false); setEventToEdit(null); }}
                    onSaveEvent={handleSaveEvent}
                    tourStartDate={selectedTour.startDate}
                    tourEndDate={selectedTour.endDate}
                    people={people}
                    eventToEdit={eventToEdit}
                />
            )}
             {isEventDetailModalOpen && selectedEvent && (
                <EventDetailModal
                    isOpen={isEventDetailModalOpen}
                    onClose={() => setIsEventDetailModalOpen(false)}
                    event={selectedEvent}
                    people={people}
                    currentUser={currentUser}
                    onAddComment={handleAddComment}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}
            {isRiderImportModalOpen && (
                <RiderImportModal 
                    isOpen={isRiderImportModalOpen}
                    onClose={() => setIsRiderImportModalOpen(false)}
                    onProcessRider={handleProcessRider}
                    onApply={handleApplyRiderData}
                />
            )}
            {isDaySheetVisible && daySheetParams && selectedTour && (
                <DaySheetView 
                    tour={selectedTour}
                    schedule={currentTourSchedule}
                    user={daySheetParams.user}
                    date={daySheetParams.date}
                    onClose={() => setIsDaySheetVisible(false)}
                />
            )}
            {isAddCrewModalOpen && (
                <AddCrewMemberModal
                    isOpen={isAddCrewModalOpen}
                    onClose={() => { setIsAddCrewModalOpen(false); setPersonToEdit(null); }}
                    onSave={handleSaveCrewMember}
                    personToEdit={personToEdit}
                />
            )}
            {isAddTourModalOpen && (
                <AddTourModal
                    isOpen={isAddTourModalOpen}
                    onClose={() => { setIsAddTourModalOpen(false); setTourToEdit(null); }}
                    onSave={handleSaveTour}
                    tourToEdit={tourToEdit}
                />
            )}
             {isExpenseEditorModalOpen && selectedTour?.financials && (
                <ExpenseEditorModal
                    isOpen={isExpenseEditorModalOpen}
                    onClose={() => { setIsExpenseEditorModalOpen(false); setExpenseToEdit(null); }}
                    onSave={handleSaveExpense}
                    expenseToEdit={expenseToEdit}
                    categories={selectedTour.financials.budget.map(b => b.category)}
                    currentUserId={currentUser.id}
                />
            )}
            {isAllCrewModalOpen && (
                <AllCrewModal
                    isOpen={isAllCrewModalOpen}
                    onClose={() => setIsAllCrewModalOpen(false)}
                    people={people}
                />
            )}
        </div>
    );
};

export default App;
