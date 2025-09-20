

export type EventType = 'Travel' | 'Load-in' | 'Soundcheck' | 'Performance' | 'Load-out' | 'Day Off' | 'Interview';
export const eventTypes: EventType[] = ['Travel', 'Load-in', 'Soundcheck', 'Performance', 'Load-out', 'Day Off', 'Interview'];

export type UserRole = 'Tour Manager' | 'Artist' | 'Production' | 'Crew' | 'Driver' | 'Vendor';
export const userRoles: UserRole[] = ['Tour Manager', 'Artist', 'Production', 'Crew', 'Driver', 'Vendor'];

export type PermissionLevel = 'read' | 'write';

export interface Person {
    id: string;
    name: string;
    email: string;
    password?: string;
    status: 'active' | 'pending_invitation';
    role: UserRole;
    avatarUrl: string;
}

export interface Comment {
    id: string;
    authorId: string;
    timestamp: string;
    text: string;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    assignedTo: string; // Single Person ID
}

export interface BudgetItem {
    id: string;
    category: string;
    amount: number;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    submittedById: string;
    receiptUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export interface Financials {
    budget: BudgetItem[];
    expenses: Expense[];
}

export interface MapPin {
    id: string;
    x: number; // percentage
    y: number; // percentage
    label: string;
}

export interface Venue {
    id: string;
    name: string;
    location: string;
    mapImageUrl: string;
    floorPlanUrl?: string;
    pins: MapPin[];
}

export type WebsiteSectionType = 'hero' | 'about' | 'video' | 'tickets' | 'gallery' | 'testimonials' | 'cta' | 'header' | 'footer';
export const websiteSectionTypes: WebsiteSectionType[] = ['hero', 'about', 'video', 'tickets', 'gallery', 'testimonials', 'cta', 'header', 'footer'];

export interface GalleryImage {
    url: string;
    caption?: string;
}

export interface Testimonial {
    quote: string;
    author: string;
    imageUrl?: string;
}

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'youtube';
export const socialPlatforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'youtube'];

export interface SocialLink {
    platform: SocialPlatform;
    url: string;
}

export interface WebsiteSection {
    id: string;
    type: WebsiteSectionType;
    content: {
        // Hero
        headline?: string;
        subheadline?: string;
        imageUrl?: string;
        // Header
        logoUrl?: string;
        // About & Tickets & Gallery & Testimonials & CTA
        title?: string;
        body?: string;
        // Video
        videoUrl?: string; // YouTube or Vimeo URL
        // Tickets
        ticketUrl?: string;
        buttonText?: string;
        // Gallery
        images?: GalleryImage[];
        // Testimonials
        testimonials?: Testimonial[];
        // CTA
        ctaTitle?: string;
        ctaBody?: string;
        ctaButtonText?: string;
        ctaButtonUrl?: string;
        // Footer
        copyrightText?: string;
        socialLinks?: SocialLink[];
    };
}

export interface EmailContent {
    headline?: string;
    body?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
}

export interface EmailSegmentation {
    locationIds?: string[]; // Use event location as the filter
}

export interface EmailCampaign {
    id: string;
    name: string;
    status: 'Sent' | 'Scheduled' | 'Draft';
    scheduledDate?: string;
    stats?: {
        openRate: number;
        clickRate: number;
    };
    subject?: string;
    fromName?: string;
    content?: EmailContent;
    segmentation?: EmailSegmentation;
}

// --- Registration Types ---
export type FormFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
export const formFieldTypes: FormFieldType[] = ['text', 'email', 'tel', 'number', 'textarea', 'select', 'radio', 'checkbox'];

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select, radio, checkbox
}

export interface RegistrationForm {
    id: string;
    name: string;
    status: 'open' | 'closed';
    fields: FormField[];
}

export interface RegistrationResponse {
    fieldId: string;
    value: string | string[];
}

export interface Attendee {
    id: string;
    formId: string;
    registrationDate: string;
    responses: RegistrationResponse[];
}

export interface Registration {
    forms: RegistrationForm[];
    attendees: Attendee[];
}

// --- Sourcing Types ---
export type SupplierCategory = 'Venue' | 'Hotel' | 'Catering' | 'Lighting' | 'Sound' | 'Transportation' | 'Security';
export const supplierCategories: SupplierCategory[] = ['Venue', 'Hotel', 'Catering', 'Lighting', 'Sound', 'Transportation', 'Security'];

export interface Supplier {
    id: string;
    name: string;
    category: SupplierCategory;
    location: string;
    contactEmail: string;
    rating: number; // 1-5 stars
}

export type RFPStatus = 'Draft' | 'Sent' | 'Responded' | 'Awarded' | 'Declined';

export interface RFP {
    id: string;
    title: string;
    sentDate: string;
    dueDate: string;
    status: RFPStatus;
    details: string; // The content of the RFP
}

export interface Proposal {
    id: string;
    rfpId: string;
    supplierId: string;
    receivedDate: string;
    totalCost: number;
    notes: string;
    fileUrl?: string; // Link to a PDF proposal
}

export interface RoomBlock {
    id: string;
    hotelSupplierId: string;
    checkInDate: string;
    checkOutDate: string;
    roomCount: number;
    negotiatedRate: number; // per night
    confirmationCode?: string;
}

export interface Tour {
    id: string;
    artistName: string;
    tourName: string;
    status: 'Active' | 'Upcoming' | 'Completed';
    startDate: string;
    endDate: string;
    imageUrl: string;
    financials?: Financials;
    venues?: Venue[];
    website?: WebsiteSection[];
    isWebsiteDeployed?: boolean;
    campaigns?: EmailCampaign[];
    registration?: Registration;
    rfps?: RFP[];
    proposals?: Proposal[];
    roomBlocks?: RoomBlock[];
}

export interface EventAssignment {
    personId: string;
    permission: PermissionLevel;
}

export interface ScheduleEvent {
    id: string;
    date: string;
    type: EventType;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    notes?: string;
    assignedTo: EventAssignment[]; // Array of EventAssignment objects
    comments?: Comment[];
    tasks?: Task[];
}
