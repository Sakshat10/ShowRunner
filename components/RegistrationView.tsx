

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Registration, RegistrationForm, FormField, FormFieldType, Tour, Attendee } from '../types';
import { PlusIcon, EditIcon, TrashIcon, LinkIcon, CheckCircleIcon, XIcon, DownloadIcon } from './IconComponents';
import { AddFormFieldModal } from './AddFormFieldModal';
import { EditFormFieldModal } from './EditFormFieldModal';

interface RegistrationViewProps {
    tour: Tour;
    registration: Registration | undefined;
    onAddForm: () => void;
    onUpdateForm: (form: RegistrationForm) => void;
    onDeleteForm: (formId: string) => void;
    onAddFormField: (formId: string, field: Omit<FormField, 'id'>) => void;
    onUpdateFormField: (formId: string, field: FormField) => void;
    onDeleteFormField: (formId: string, fieldId: string) => void;
    onDeleteAttendee: (attendeeId: string) => void;
    onViewPublicForm: (form: RegistrationForm) => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ tour, registration, onAddForm, onUpdateForm, onDeleteForm, onAddFormField, onUpdateFormField, onDeleteFormField, onDeleteAttendee, onViewPublicForm }) => {
    const [activeTab, setActiveTab] = useState<'forms' | 'attendees' | 'settings'>('forms');
    const [selectedFormId, setSelectedFormId] = useState<string | null>(registration?.forms[0]?.id || null);
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [copied, setCopied] = useState(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [editingForm, setEditingForm] = useState<{ id: string; name: string } | null>(null);

    // Auto-select a newly created form
    const prevFormsCountRef = useRef(registration?.forms.length ?? 0);
    useEffect(() => {
        const currentFormsCount = registration?.forms.length ?? 0;
        if (currentFormsCount > prevFormsCountRef.current) {
            const lastForm = registration?.forms[registration.forms.length - 1];
            if (lastForm) {
                setSelectedFormId(lastForm.id);
                setActiveTab('forms'); // Switch to form editor
            }
        }
        prevFormsCountRef.current = currentFormsCount;
    }, [registration?.forms]);

    // This effect handles the case where the currently selected form is deleted
    useEffect(() => {
        if (selectedFormId && !registration?.forms.find(f => f.id === selectedFormId)) {
            setSelectedFormId(registration?.forms[0]?.id || null);
        }
    }, [registration?.forms, selectedFormId]);

    const selectedForm = useMemo(() => {
        return registration?.forms.find(f => f.id === selectedFormId);
    }, [registration, selectedFormId]);

    const handleFilterChange = (fieldId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleResetFilters = () => {
        setFilters({});
    };

    const attendeesForForm = useMemo(() => {
        if (!registration || !selectedFormId) return [];

        const baseAttendees = registration.attendees.filter(a => a.formId === selectedFormId);
        const activeFilters = Object.entries(filters).filter(([, value]) => value && value !== 'all');

        if (activeFilters.length === 0) {
            return baseAttendees;
        }

        const formFieldsById = selectedForm?.fields.reduce((acc, field) => {
            acc[field.id] = field;
            return acc;
        }, {} as { [key: string]: FormField });

        if (!formFieldsById) return baseAttendees;

        return baseAttendees.filter(attendee => {
            return activeFilters.every(([fieldId, filterValue]) => {
                const response = attendee.responses.find(r => r.fieldId === fieldId);
                const field = formFieldsById[fieldId];

                if (!response || !field) {
                    return false;
                }

                const responseValue = Array.isArray(response.value) ? response.value.join(' ') : String(response.value);

                switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'tel':
                    case 'number':
                    case 'textarea':
                        return responseValue.toLowerCase().includes(filterValue.toLowerCase());
                    case 'select':
                    case 'radio':
                        return responseValue === filterValue;
                    case 'checkbox':
                        if (Array.isArray(response.value)) {
                            return response.value.includes(filterValue);
                        }
                        return responseValue === filterValue;
                    default:
                        return false;
                }
            });
        });
    }, [registration, selectedFormId, filters, selectedForm]);


    const handleFormStatusToggle = (form: RegistrationForm) => {
        onUpdateForm({ ...form, status: form.status === 'open' ? 'closed' : 'open' });
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownloadReport = () => {
        if (!selectedForm || attendeesForForm.length === 0) {
            alert('No attendee data to download for this form.');
            return;
        }

        const headers = ['Registration Date', ...selectedForm.fields.map(f => f.label)];
        
        const csvRows = [headers.join(',')];

        for (const attendee of attendeesForForm) {
            const row = [
                new Date(attendee.registrationDate).toLocaleString()
            ];
            for (const field of selectedForm.fields) {
                const response = attendee.responses.find(r => r.fieldId === field.id);
                // Handle potential multi-value responses (like checkboxes) and escape commas
                let value = Array.isArray(response?.value) ? response.value.join('; ') : response?.value || '';
                value = `"${String(value).replace(/"/g, '""')}"`; // Escape double quotes
                row.push(value);
            }
            csvRows.push(row.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const fileName = `${tour.tourName.replace(/\s/g, '_')}_${selectedForm.name.replace(/\s/g, '_')}_attendees.csv`;
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleStartEdit = (form: RegistrationForm) => {
        setEditingForm({ id: form.id, name: form.name });
    };

    const handleCancelEdit = () => {
        setEditingForm(null);
    };

    const handleSaveEdit = () => {
        if (editingForm && editingForm.name.trim()) {
            const formToUpdate = registration?.forms.find(f => f.id === editingForm.id);
            if (formToUpdate) {
                onUpdateForm({ ...formToUpdate, name: editingForm.name.trim() });
            }
        }
        setEditingForm(null);
    };


    const renderFieldType = (field: FormField) => {
        switch (field.type) {
            case 'text': return <input type="text" placeholder={field.placeholder} disabled className="w-full bg-slate-100 rounded-md p-2 border-slate-200" />;
            case 'email': return <input type="email" placeholder={field.placeholder} disabled className="w-full bg-slate-100 rounded-md p-2 border-slate-200" />;
            case 'textarea': return <textarea placeholder={field.placeholder} disabled rows={2} className="w-full bg-slate-100 rounded-md p-2 border-slate-200" />;
            case 'select': return (
                <select disabled className="w-full bg-slate-100 rounded-md p-2 border-slate-200">
                    <option>{field.placeholder || `Select an option...`}</option>
                    {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                </select>
            );
            default: return <div className="p-2 bg-slate-100 rounded-md text-sm text-slate-500">Preview not available</div>;
        }
    };

    const getAttendeeResponse = (attendee: Attendee, fieldId: string) => {
        const response = attendee.responses.find((r) => r.fieldId === fieldId);
        if (!response) return 'N/A';
        return Array.isArray(response.value) ? response.value.join(', ') : String(response.value);
    };

    const filterableFields = useMemo(() => 
        selectedForm?.fields.filter(f => ['text', 'email', 'tel', 'number', 'select', 'radio'].includes(f.type)) || [],
        [selectedForm]
    );

    return (
        <div>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('forms')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'forms' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Forms</button>
                    <button onClick={() => setActiveTab('attendees')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendees' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Attendees</button>
                    <button onClick={() => setActiveTab('settings')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Settings</button>
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <h3 className="font-bold text-slate-800 mb-2">Registration Forms</h3>
                    <div className="space-y-2">
                        {registration?.forms.map(form => (
                            <div key={form.id} className={`group relative w-full text-left p-3 rounded-lg transition-colors ${selectedFormId === form.id ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-slate-50 border'}`}>
                                {editingForm?.id === form.id ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={editingForm.name}
                                            onChange={e => setEditingForm({ ...editingForm, name: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleSaveEdit();
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            autoFocus
                                            className="w-full text-sm font-semibold bg-white border border-blue-400 rounded-md p-1 -m-1"
                                        />
                                         <div className="flex items-center gap-1 mt-2">
                                            <button onClick={handleSaveEdit} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md">Save</button>
                                            <button onClick={handleCancelEdit} className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-md">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div onClick={() => setSelectedFormId(form.id)} className="cursor-pointer">
                                            <p className="font-semibold pr-12">{form.name}</p>
                                            <div className="flex items-center text-xs mt-1">
                                                <span className={`w-2 h-2 rounded-full mr-1.5 ${form.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="capitalize">{form.status}</span>
                                            </div>
                                        </div>
                                        <div className={`absolute top-1/2 -translate-y-1/2 right-2 flex items-center bg-white/50 rounded-full transition-opacity ${selectedFormId === form.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <button onClick={() => handleStartEdit(form)} title="Edit name" className="p-1.5 text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onDeleteForm(form.id)} title="Delete form" className="p-1.5 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                     <button
                        onClick={onAddForm}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create New Form
                    </button>
                </div>

                <div className="md:col-span-3">
                    {activeTab === 'forms' && selectedForm && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">{selectedForm.name} - Form Builder</h2>
                            <div className="space-y-3">
                                {selectedForm.fields.map((field, index) => (
                                    <div key={field.id} className="bg-white p-4 rounded-lg border flex items-start gap-4">
                                        <div className="flex-grow">
                                            <label className="font-semibold">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                            <div className="mt-2">{renderFieldType(field)}</div>
                                        </div>
                                        <div className="flex items-center">
                                            <button onClick={() => setEditingField(field)} className="p-2 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => onDeleteFormField(selectedForm.id, field.id)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setIsAddFieldModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-blue-50">
                                    <PlusIcon className="w-5 h-5" /> Add Form Field
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendees' && selectedForm && (
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">{selectedForm.name} - Attendees ({attendeesForForm.length})</h2>
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={attendeesForForm.length === 0}
                                    title={attendeesForForm.length === 0 ? "No attendees to download" : "Download attendee report"}
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    <span>Download Report</span>
                                </button>
                            </div>

                            {filterableFields.length > 0 && (
                                <div className="bg-slate-50 p-3 rounded-lg border mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {filterableFields.map(field => (
                                            <div key={field.id}>
                                                <label htmlFor={`filter-${field.id}`} className="text-xs font-medium text-slate-600">{field.label}</label>
                                                {['text', 'email', 'tel', 'number'].includes(field.type) ? (
                                                    <input
                                                        type="text"
                                                        id={`filter-${field.id}`}
                                                        value={filters[field.id] || ''}
                                                        onChange={e => handleFilterChange(field.id, e.target.value)}
                                                        placeholder={`Filter by ${field.label}...`}
                                                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-sm"
                                                    />
                                                ) : ( // select or radio
                                                    <select
                                                        id={`filter-${field.id}`}
                                                        value={filters[field.id] || 'all'}
                                                        onChange={e => handleFilterChange(field.id, e.target.value)}
                                                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm bg-white text-sm"
                                                    >
                                                        <option value="all">All {field.label}</option>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {Object.values(filters).some(v => v && v !== 'all') && (
                                        <button onClick={handleResetFilters} className="mt-2 text-sm text-blue-600 hover:underline font-semibold">
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            )}

                             <div className="bg-white p-4 rounded-lg border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-slate-600">
                                            <th className="p-2">Date</th>
                                            {selectedForm.fields.map(f => <th key={f.id} className="p-2">{f.label}</th>)}
                                            <th className="p-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendeesForForm.length > 0 ? attendeesForForm.map(attendee => (
                                            <tr key={attendee.id} className="border-b last:border-b-0 group hover:bg-slate-50">
                                                <td className="p-2 whitespace-nowrap">{new Date(attendee.registrationDate).toLocaleDateString()}</td>
                                                {selectedForm.fields.map(f => <td key={f.id} className="p-2">{getAttendeeResponse(attendee, f.id)}</td>)}
                                                <td className="p-2 text-right">
                                                    <button onClick={() => onDeleteAttendee(attendee.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={selectedForm.fields.length + 2} className="text-center text-slate-500 py-8">
                                                    {Object.keys(filters).length > 0 ? 'No attendees match the current filters.' : 'No attendees have registered for this form yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}

                    {activeTab === 'settings' && selectedForm && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">{selectedForm.name} - Settings</h2>
                            <div className="bg-white p-6 rounded-lg border space-y-6">
                                {/* Section 1: Registration Status */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Registration Status</h4>
                                        <p className="text-sm text-slate-500">Control whether this form is open for new submissions.</p>
                                    </div>
                                    <button onClick={() => handleFormStatusToggle(selectedForm)} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${selectedForm.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedForm.status === 'open' ? <CheckCircleIcon className="w-5 h-5"/> : <XIcon className="w-5 h-5"/>}
                                        {selectedForm.status === 'open' ? 'Open' : 'Closed'}
                                    </button>
                                </div>
                                
                                <div className="border-t border-slate-200 -mx-6"></div>

                                {/* Section 2: Sharing */}
                                <div>
                                    <h4 className="font-semibold text-slate-800">Shareable Link</h4>
                                    <p className="text-sm text-slate-500 mb-3">Anyone with this link can submit a response. The form must be 'Open' to accept submissions.</p>
                                    {(() => {
                                        const shareableLink = `${window.location.origin}${window.location.pathname}?view=form&tourId=${tour.id}&formId=${selectedForm.id}`;
                                        return (
                                            <>
                                                <div className="flex gap-2">
                                                    <input type="text" readOnly value={shareableLink} className="flex-grow bg-slate-100 rounded-md p-2 border-slate-200 text-sm" />
                                                    <button onClick={() => handleCopyLink(shareableLink)} className="px-4 py-2 w-28 text-center rounded-lg font-semibold flex items-center justify-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors">
                                                        {copied ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <LinkIcon className="w-5 h-5" />}
                                                        {copied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => onViewPublicForm(selectedForm)}
                                                        disabled={selectedForm.status === 'closed'}
                                                        className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                        Open Public Form
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {isAddFieldModalOpen && selectedForm && (
                <AddFormFieldModal
                    isOpen={isAddFieldModalOpen}
                    onClose={() => setIsAddFieldModalOpen(false)}
                    onAddField={(type) => {
                        const defaultField: Omit<FormField, 'id'> = {
                            type,
                            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
                            required: false,
                            ...(type === 'select' && { options: ['Option 1', 'Option 2'] })
                        };
                        onAddFormField(selectedForm.id, defaultField);
                        setIsAddFieldModalOpen(false);
                    }}
                />
            )}
            {editingField && selectedForm && (
                <EditFormFieldModal
                    isOpen={!!editingField}
                    onClose={() => setEditingField(null)}
                    field={editingField}
                    onSave={(updatedField) => {
                        onUpdateFormField(selectedForm.id, updatedField);
                        setEditingField(null);
                    }}
                />
            )}
        </div>
    );
};
