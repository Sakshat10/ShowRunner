

import React, { useState, useMemo } from 'react';
import type { Tour, EmailCampaign, WebsiteSection, WebsiteSectionType, ScheduleEvent, Person, EventType } from '../types';
import { PlusIcon, MailIcon, CalendarDaysIcon, LayoutTemplateIcon, ArrowDownIcon, ArrowUpIcon, EditIcon, TrashIcon, MonitorIcon, EyeIcon, GlobeIcon, VideoIcon, TicketIcon, TypeIcon, ImageIcon, QuoteIcon, PointerIcon, NavigationIcon, PanelBottomIcon, ArrowLeftIcon, ArrowRightIcon, LinkIcon, CheckCircleIcon, PaletteIcon, PlaneIcon, TruckIcon, SoundIcon, MicIcon, CoffeeIcon, CalendarIcon } from './IconComponents';
import { AddCampaignModal } from './AddCampaignModal';
import { EditSectionModal } from './EditSectionModal';
import { AddSectionModal } from './AddSectionModal';
import { CampaignEditorView } from './CampaignEditorView';
import { Header, HeroSection, AboutSection, VideoSection, TicketsSection, GallerySection, TestimonialsSection, CtaSection, Footer } from './PublicWebsiteView';


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

const getStatusDotClass = (status: 'Sent' | 'Scheduled' | 'Draft') => {
    switch (status) {
        case 'Sent': return 'bg-green-500';
        case 'Scheduled': return 'bg-yellow-500';
        case 'Draft': return 'bg-slate-400';
        default: return 'bg-slate-400';
    }
};

const EmailMarketingView: React.FC<{
    campaigns: EmailCampaign[];
    onSelectCampaign: (campaign: EmailCampaign) => void;
    onAddCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
    onDeleteCampaign: (campaignId: string) => void;
}> = ({ campaigns, onSelectCampaign, onAddCampaign, onDeleteCampaign }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Email Campaigns</h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create Campaign
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-slate-600">
                            <th className="p-2 w-8"></th>
                            <th className="p-2">Campaign Name</th>
                            <th className="p-2">Scheduled Date</th>
                            <th className="p-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map(campaign => (
                            <tr
                                key={campaign.id}
                                className="border-b last:border-b-0 group"
                            >
                                <td onClick={() => onSelectCampaign(campaign)} className="p-3 cursor-pointer"><span className={`w-3 h-3 block rounded-full ${getStatusDotClass(campaign.status)}`} title={campaign.status}></span></td>
                                <td onClick={() => onSelectCampaign(campaign)} className="p-3 font-semibold text-slate-800 cursor-pointer">{campaign.name}</td>
                                <td onClick={() => onSelectCampaign(campaign)} className="p-3 text-slate-500 cursor-pointer">{campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : 'Unscheduled'}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onDeleteCampaign(campaign.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isAddModalOpen && (
                <AddCampaignModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddCampaign={onAddCampaign}
                />
            )}
        </div>
    );
};


const PromotionalCalendar: React.FC<{
    tour: Tour;
    campaigns: EmailCampaign[];
    schedule: ScheduleEvent[];
    onSelectCampaign: (campaign: EmailCampaign) => void;
}> = ({ tour, campaigns, schedule, onSelectCampaign }) => {
    const [currentDate, setCurrentDate] = useState(new Date(tour.startDate ? `${tour.startDate}T00:00:00` : new Date()));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startingDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const campaignsByDate = useMemo(() => {
        return campaigns.reduce((acc, campaign) => {
            if (campaign.scheduledDate) {
                (acc[campaign.scheduledDate] = acc[campaign.scheduledDate] || []).push(campaign);
            }
            return acc;
        }, {} as { [key: string]: EmailCampaign[] });
    }, [campaigns]);

    const scheduleByDate = useMemo(() => {
        return schedule.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as { [key: string]: ScheduleEvent[] });
    }, [schedule]);
    
    const renderCalendarGrid = () => {
        const days = [];
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`blank-${i}`} className="border-r border-b border-slate-200 bg-slate-50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const fullDateString = dayDate.toISOString().split('T')[0];
            const isToday = dayDate.getTime() === today.getTime();
            const dayCampaigns = campaignsByDate[fullDateString] || [];
            const daySchedule = scheduleByDate[fullDateString] || [];

            days.push(
                <div key={day} className="relative border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col">
                    <time dateTime={fullDateString} className={`font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-slate-700'}`}>
                        {day}
                    </time>
                    <div className="flex-grow mt-2 space-y-1 overflow-hidden">
                         {daySchedule.map(event => (
                             <div key={event.id} title={`${event.title} at ${event.startTime}`} className="w-full text-left flex items-center p-1.5 rounded-md bg-slate-50">
                                <EventIcon type={event.type} className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                                <span className="text-xs font-medium text-slate-600 truncate">{event.startTime} - {event.title}</span>
                            </div>
                        ))}
                        {dayCampaigns.map(campaign => (
                             <button 
                                key={campaign.id} 
                                onClick={() => onSelectCampaign(campaign)} 
                                title={campaign.name}
                                className="w-full text-left flex items-center p-1.5 rounded-md bg-blue-50 hover:bg-blue-100"
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${getStatusDotClass(campaign.status)}`}></span>
                                <span className="text-xs font-medium text-blue-800 truncate">{campaign.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeftIcon className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold text-slate-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-slate-100"><ArrowRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 border-t border-b border-l border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2 border-r border-slate-200">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 border-l border-slate-200">
                {renderCalendarGrid()}
            </div>
        </div>
    );
};

interface WebsiteEditorProps {
    website: WebsiteSection[];
    tour: Tour;
    onUpdateWebsite: (website: WebsiteSection[]) => void;
    onToggleWebsiteDeployment: () => void;
    onViewPublicSite: () => void;
}

const WebsiteEditor: React.FC<WebsiteEditorProps> = ({ website, tour, onUpdateWebsite, onToggleWebsiteDeployment, onViewPublicSite }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sectionToEdit, setSectionToEdit] = useState<WebsiteSection | null>(null);
    const [copied, setCopied] = useState(false);
    
    const handleEditClick = (section: WebsiteSection) => {
        setSectionToEdit(section);
        setIsEditModalOpen(true);
    };

    const handleSaveSection = (updatedSection: WebsiteSection) => {
        onUpdateWebsite(website.map(s => s.id === updatedSection.id ? updatedSection : s));
        setIsEditModalOpen(false);
        setSectionToEdit(null);
    };

    const handleDeleteSection = (sectionIdToDelete: string) => {
        if (window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
            // By creating a new array with filter, we ensure an immutable update,
            // which is necessary for React's change detection to work correctly.
            const newWebsite = (website || []).filter(section => section.id !== sectionIdToDelete);
            onUpdateWebsite(newWebsite);
        }
    };
    
    const handleAddSection = (type: WebsiteSectionType) => {
        const newSection: WebsiteSection = {
            id: `ws-${Date.now()}`,
            type: type,
            content: {},
        };
        onUpdateWebsite([...website, newSection]);
        setIsAddModalOpen(false);
    };

    const handleMoveSection = (index: number, direction: 'up' | 'down') => {
        const newWebsite = [...website];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= website.length) return;
        [newWebsite[index], newWebsite[targetIndex]] = [newWebsite[targetIndex], newWebsite[index]]; // Swap
        onUpdateWebsite(newWebsite);
    };
    
    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const SECTION_ICONS: { [key in WebsiteSectionType]: React.ReactNode } = {
        hero: <EyeIcon className="w-5 h-5"/>,
        about: <TypeIcon className="w-5 h-5"/>,
        video: <VideoIcon className="w-5 h-5"/>,
        tickets: <TicketIcon className="w-5 h-5"/>,
        gallery: <ImageIcon className="w-5 h-5"/>,
        testimonials: <QuoteIcon className="w-5 h-5"/>,
        cta: <PointerIcon className="w-5 h-5"/>,
        header: <NavigationIcon className="w-5 h-5"/>,
        footer: <PanelBottomIcon className="w-5 h-5"/>,
    };
    
    const shareableLink = `${window.location.origin}${window.location.pathname}?view=website&tourId=${tour.id}`;

    const websiteSections = website || [];
    const headerSection = websiteSections.find(s => s.type === 'header');
    const footerSection = websiteSections.find(s => s.type === 'footer');
    const mainSections = websiteSections.filter(s => s.type !== 'header' && s.type !== 'footer');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Website Sections</h3>
                    <button onClick={onViewPublicSite} className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 text-sm">
                        <GlobeIcon className="w-4 h-4" />
                        Open Full Preview
                    </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-bold text-slate-800 mb-2">Deployment</h4>
                    {tour.isWebsiteDeployed ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Your Site is Live!
                            </div>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={shareableLink} className="flex-grow bg-slate-100 rounded-md p-2 border-slate-200 text-sm" />
                                <button onClick={() => handleCopyLink(shareableLink)} className="px-3 py-2 w-28 text-center rounded-lg font-semibold flex items-center justify-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors">
                                    {copied ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <LinkIcon className="w-5 h-5" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <button onClick={onToggleWebsiteDeployment} className="w-full text-center py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                                Take Offline
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">Your website is currently a draft and not visible to the public.</p>
                            <button onClick={onToggleWebsiteDeployment} className="w-full text-center py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                Deploy Site
                            </button>
                        </div>
                    )}
                </div>

                {website.map((section, index) => (
                    <div key={section.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <button onClick={() => handleMoveSection(index, 'up')} disabled={index === 0} className="p-0.5 rounded-full hover:bg-slate-100 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleMoveSection(index, 'down')} disabled={index === website.length - 1} className="p-0.5 rounded-full hover:bg-slate-100 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button>
                            </div>
                            {SECTION_ICONS[section.type]}
                            <span className="font-semibold text-slate-800 capitalize">{section.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center">
                            <button onClick={() => handleEditClick(section)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><EditIcon className="w-5 h-5"/></button>
                            <button 
                                type="button"
                                onClick={() => handleDeleteSection(section.id)} 
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Delete Section"
                                aria-label={`Delete ${section.type} section`}
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
                 <button onClick={() => setIsAddModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50">
                    <PlusIcon className="w-5 h-5" /> Add Website Section
                </button>
            </div>
             <div className="lg:col-span-2 bg-slate-200 p-2 rounded-lg aspect-[4/3] flex flex-col">
                <div className="flex-shrink-0 p-2 bg-slate-100 flex items-center gap-2 rounded-t-md">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-white flex-grow overflow-y-auto transform scale-[0.9] origin-top">
                    <div className="bg-white min-h-full">
                        {headerSection && <Header header={headerSection} navSections={mainSections} tourName={tour.tourName} />}
                        <main>
                            {mainSections.map((section, index) => {
                                const Wrapper = ({ children }: {children: React.ReactNode}) => (
                                    <div className={index % 2 === 1 && !['tickets', 'cta'].includes(section.type) ? 'bg-slate-50' : 'bg-white'}>{children}</div>
                                );
                                let content = null;
                                switch(section.type) {
                                    case 'hero': content = <HeroSection key={section.id} section={section} tour={tour} />; break;
                                    case 'about': content = <AboutSection key={section.id} section={section} />; break;
                                    case 'video': content = <VideoSection key={section.id} section={section} />; break;
                                    case 'tickets': content = <TicketsSection key={section.id} section={section} />; break;
                                    case 'gallery': content = <GallerySection key={section.id} section={section} />; break;
                                    case 'testimonials': content = <TestimonialsSection key={section.id} section={section} />; break;
                                    case 'cta': content = <CtaSection key={section.id} section={section} />; break;
                                }
                                if (section.type === 'hero') return content;
                                return <Wrapper key={section.id}>{content}</Wrapper>;
                            })}
                        </main>
                        {footerSection && <Footer footer={footerSection} />}
                    </div>
                </div>
            </div>
             {isEditModalOpen && sectionToEdit && (
                <EditSectionModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    section={sectionToEdit}
                    onSave={handleSaveSection}
                />
            )}
            {isAddModalOpen && (
                <AddSectionModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddSection={handleAddSection}
                />
            )}
        </div>
    );
};

interface MarketingViewProps {
    tour: Tour;
    schedule: ScheduleEvent[];
    people: Person[];
    onUpdateWebsite: (website: WebsiteSection[]) => void;
    onToggleWebsiteDeployment: () => void;
    onAddCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
    onDeleteCampaign: (campaignId: string) => void;
    onViewPublicSite: () => void;
    selectedCampaign: EmailCampaign | null;
    onSelectCampaign: (campaign: EmailCampaign) => void;
    onDeselectCampaign: () => void;
    onUpdateCampaign: (campaign: EmailCampaign) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({ tour, schedule, people, onUpdateWebsite, onToggleWebsiteDeployment, onAddCampaign, onDeleteCampaign, onViewPublicSite, selectedCampaign, onSelectCampaign, onDeselectCampaign, onUpdateCampaign }) => {
    const [activeTab, setActiveTab] = useState<'email' | 'calendar' | 'website'>('email');

    if (selectedCampaign) {
        return <CampaignEditorView 
            campaign={selectedCampaign}
            tourSchedule={schedule}
            people={people}
            onClose={onDeselectCampaign}
            onUpdateCampaign={onUpdateCampaign}
        />
    }

    return (
        <div>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('email')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'email' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                       <MailIcon className="mr-2 w-5 h-5" />
                        <span>Email Marketing</span>
                    </button>
                    <button onClick={() => setActiveTab('calendar')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                       <CalendarDaysIcon className="mr-2 w-5 h-5" />
                        <span>Promotional Calendar</span>
                    </button>
                     <button onClick={() => setActiveTab('website')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'website' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                       <LayoutTemplateIcon className="mr-2 w-5 h-5" />
                        <span>Public Website</span>
                    </button>
                </nav>
            </div>
             {activeTab === 'email' && (
                <EmailMarketingView
                    campaigns={tour.campaigns || []}
                    onSelectCampaign={onSelectCampaign}
                    onAddCampaign={onAddCampaign}
                    onDeleteCampaign={onDeleteCampaign}
                />
            )}
            {activeTab === 'calendar' && (
                <PromotionalCalendar 
                    tour={tour}
                    campaigns={tour.campaigns || []} 
                    schedule={schedule}
                    onSelectCampaign={onSelectCampaign}
                />
            )}
            {activeTab === 'website' && (
                <WebsiteEditor 
                    website={tour.website || []}
                    tour={tour}
                    onUpdateWebsite={onUpdateWebsite}
                    onToggleWebsiteDeployment={onToggleWebsiteDeployment}
                    onViewPublicSite={onViewPublicSite}
                />
            )}
        </div>
    );
};
