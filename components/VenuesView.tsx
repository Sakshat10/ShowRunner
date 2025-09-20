import React, { useState } from 'react';
import type { Tour, Venue } from '../types';
import { MapIcon, MapPinIcon, LayoutIcon } from './IconComponents';

interface VenuesViewProps {
    tour: Tour;
}

export const VenuesView: React.FC<VenuesViewProps> = ({ tour }) => {
    const { venues } = tour;
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venues?.[0] || null);
    const [viewMode, setViewMode] = useState<'map' | 'floor_plan'>('map');

    if (!venues || venues.length === 0) {
        return <div className="text-center py-16 text-slate-500">No venues have been added for this tour.</div>;
    }

    const handleSelectVenue = (venue: Venue) => {
        setSelectedVenue(venue);
        setViewMode('map'); // Default to map view when switching venues
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 bg-slate-50 p-4 rounded-lg overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Tour Venues</h2>
                <div className="space-y-2">
                    {venues.map(venue => (
                        <button 
                            key={venue.id} 
                            onClick={() => handleSelectVenue(venue)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedVenue?.id === venue.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                        >
                            <p className="font-semibold">{venue.name}</p>
                            <p className="text-sm">{venue.location}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2">
                {selectedVenue ? (
                    <div className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                        {/* View Toggles */}
                        <div className="absolute top-4 right-4 z-10 bg-white/50 backdrop-blur-sm p-1 rounded-lg flex gap-1">
                           <button onClick={() => setViewMode('map')} className={`px-2 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-white shadow' : 'hover:bg-white/50'}`}>
                               <MapIcon className="w-4 h-4" /> Map
                           </button>
                           {selectedVenue.floorPlanUrl && (
                             <button onClick={() => setViewMode('floor_plan')} className={`px-2 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 ${viewMode === 'floor_plan' ? 'bg-white shadow' : 'hover:bg-white/50'}`}>
                               <LayoutIcon className="w-4 h-4" /> Floor Plan
                             </button>
                           )}
                        </div>
                        
                        {viewMode === 'map' && (
                            <>
                                <img src={selectedVenue.mapImageUrl} alt={selectedVenue.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20"></div>
                                <h3 className="absolute top-4 left-4 text-2xl font-bold text-white bg-black/50 p-2 rounded-lg">{selectedVenue.name}</h3>
                                {selectedVenue.pins.map(pin => (
                                    <div 
                                        key={pin.id} 
                                        className="absolute group"
                                        style={{ top: `${pin.y}%`, left: `${pin.x}%`, transform: 'translate(-50%, -100%)' }}
                                    >
                                        <div className="absolute bottom-full mb-2 w-max bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap -translate-x-1/2 left-1/2">
                                            {pin.label}
                                        </div>
                                        <MapPinIcon className="w-8 h-8 text-red-500 drop-shadow-lg cursor-pointer" />
                                    </div>
                                ))}
                            </>
                        )}

                        {viewMode === 'floor_plan' && selectedVenue.floorPlanUrl && (
                             <img src={selectedVenue.floorPlanUrl} alt={`${selectedVenue.name} Floor Plan`} className="w-full h-full object-contain bg-white" />
                        )}

                         {viewMode === 'floor_plan' && !selectedVenue.floorPlanUrl && (
                            <div className="flex items-center justify-center h-full bg-white">
                                <div className="text-center text-slate-500">
                                    <LayoutIcon className="w-12 h-12 mx-auto" />
                                    <p className="mt-2 font-semibold">No floor plan available for this venue.</p>
                                </div>
                            </div>
                         )}

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-slate-100 rounded-lg">
                        <div className="text-center text-slate-500">
                            <MapIcon className="w-12 h-12 mx-auto" />
                            <p className="mt-2 font-semibold">Select a venue to see the map</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};