import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_COLLEGES,
  INITIAL_EVENTS,
  EVENT_TYPES,
  EVENT_MODES
} from '../data/eventsData';
import { useToast } from './ToastContext';

const EventsContext = createContext();

export function EventsProvider({ children }) {
  const { showToast } = useToast();

  // Colleges persistent state
  const [colleges, setColleges] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_colleges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading cp_colleges:', e);
    }
    return INITIAL_COLLEGES;
  });

  // Events persistent state
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading cp_events:', e);
    }
    return INITIAL_EVENTS;
  });

  // Saved Event IDs persistent state
  const [savedEventIds, setSavedEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_saved_events');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist colleges to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_colleges', JSON.stringify(colleges));
    } catch (e) {
      console.error('Error saving cp_colleges:', e);
    }
  }, [colleges]);

  // Persist events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_events', JSON.stringify(events));
    } catch (e) {
      console.error('Error saving cp_events:', e);
    }
  }, [events]);

  // Persist savedEventIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_saved_events', JSON.stringify(savedEventIds));
    } catch (e) {
      console.error('Error saving cp_saved_events:', e);
    }
  }, [savedEventIds]);

  // -------------------------------------------------------------
  // College CRUD
  // -------------------------------------------------------------
  const addCollege = (collegeData) => {
    const slug = (collegeData.name || 'college')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const newCollege = {
      id: `col-${slug}-${Date.now().toString().slice(-4)}`,
      name: collegeData.name.trim(),
      shortName: collegeData.shortName || collegeData.name.split(' ').map(w => w[0]).join('').toUpperCase(),
      logo: collegeData.logo?.trim() || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
      website: collegeData.website?.trim() || 'https://example.edu',
      location: collegeData.location?.trim() || 'Campus Location',
      type: collegeData.type || 'Higher Education Institution',
      badge: collegeData.badge || 'Admin Added College',
      description: collegeData.description?.trim() || `Official campus events and technical activities for ${collegeData.name}.`
    };

    setColleges(prev => [newCollege, ...prev]);
    showToast(`College "${newCollege.name}" added successfully!`, 'success');
    return newCollege;
  };

  const updateCollege = (collegeId, updatedFields) => {
    setColleges(prev =>
      prev.map(c => (c.id === collegeId ? { ...c, ...updatedFields } : c))
    );

    // If college name changed, sync with events
    if (updatedFields.name) {
      setEvents(prev =>
        prev.map(e => (e.collegeId === collegeId ? { ...e, collegeName: updatedFields.name } : e))
      );
    }

    showToast('College details updated!', 'success');
  };

  const deleteCollege = (collegeId) => {
    const target = colleges.find(c => c.id === collegeId);
    setColleges(prev => prev.filter(c => c.id !== collegeId));
    // Also remove associated events
    setEvents(prev => prev.filter(e => e.collegeId !== collegeId));
    showToast(`College "${target?.name || 'Selected'}" and associated events removed.`, 'info');
  };

  // -------------------------------------------------------------
  // Event CRUD
  // -------------------------------------------------------------
  const addEvent = (eventData) => {
    // Find matching college or create fallback college
    let matchedCollege = colleges.find(
      c => c.id === eventData.collegeId || c.name.toLowerCase() === (eventData.collegeName || '').toLowerCase().trim()
    );

    if (!matchedCollege && eventData.collegeName?.trim()) {
      matchedCollege = addCollege({
        name: eventData.collegeName.trim(),
        website: 'https://example.edu',
        location: eventData.venue || 'Campus Location'
      });
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      collegeId: matchedCollege ? matchedCollege.id : 'col-general',
      collegeName: matchedCollege ? matchedCollege.name : (eventData.collegeName || 'Engineering College'),
      name: eventData.name.trim(),
      type: eventData.type || 'Technical Fest',
      description: eventData.description?.trim() || 'Official college technical competition and event.',
      eventDate: eventData.eventDate?.trim() || 'TBA',
      regDeadline: eventData.regDeadline?.trim() || 'TBA',
      venue: eventData.venue?.trim() || (matchedCollege ? `${matchedCollege.name} Campus` : 'Campus Venue'),
      fee: eventData.fee?.trim() || 'Free',
      organizer: eventData.organizer?.trim() || `${matchedCollege?.name || 'College'} Tech Council`,
      eligibility: eventData.eligibility?.trim() || 'Open to all Engineering & Tech Students',
      mode: eventData.mode || 'Offline',
      regUrl: eventData.regUrl?.trim() || 'https://google.com',
      highlights: Array.isArray(eventData.highlights)
        ? eventData.highlights
        : typeof eventData.highlights === 'string' && eventData.highlights.trim()
        ? eventData.highlights.split(',').map(h => h.trim())
        : ['College Event', 'Certificate Provided']
    };

    setEvents(prev => [newEvent, ...prev]);
    showToast(`Event "${newEvent.name}" added successfully!`, 'success');
    return newEvent;
  };

  const updateEvent = (eventId, updatedFields) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          // Check if collegeId changed
          let updatedCollegeName = e.collegeName;
          if (updatedFields.collegeId && updatedFields.collegeId !== e.collegeId) {
            const foundCol = colleges.find(c => c.id === updatedFields.collegeId);
            if (foundCol) updatedCollegeName = foundCol.name;
          }
          return {
            ...e,
            ...updatedFields,
            collegeName: updatedFields.collegeName || updatedCollegeName
          };
        }
        return e;
      })
    );
    showToast('Event details updated successfully!', 'success');
  };

  const deleteEvent = (eventId) => {
    const target = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setSavedEventIds(prev => prev.filter(id => id !== eventId));
    showToast(`Event "${target?.name || 'Selected'}" deleted.`, 'info');
  };

  // -------------------------------------------------------------
  // Student Bookmarking (Save Event)
  // -------------------------------------------------------------
  const toggleSaveEvent = (eventOrId) => {
    const id = typeof eventOrId === 'object' ? eventOrId.id : eventOrId;
    const evt = events.find(e => e.id === id) || (typeof eventOrId === 'object' ? eventOrId : null);
    const eventName = evt?.name || 'Event';

    if (savedEventIds.includes(id)) {
      setSavedEventIds(prev => prev.filter(item => item !== id));
      showToast(`Removed "${eventName}" from Saved Events`, 'info');
    } else {
      setSavedEventIds(prev => [...prev, id]);
      showToast(`"${eventName}" saved to your events!`, 'success');
    }
  };

  const isEventSaved = (eventId) => savedEventIds.includes(eventId);

  const getEventsByCollege = (collegeIdOrName) => {
    return events.filter(
      e => e.collegeId === collegeIdOrName || e.collegeName?.toLowerCase() === collegeIdOrName?.toLowerCase()
    );
  };

  const resetToDefaultData = () => {
    setColleges(INITIAL_COLLEGES);
    setEvents(INITIAL_EVENTS);
    showToast('Reset colleges and events to default catalogue.', 'info');
  };

  return (
    <EventsContext.Provider
      value={{
        colleges,
        events,
        savedEventIds,
        addCollege,
        updateCollege,
        deleteCollege,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleSaveEvent,
        isEventSaved,
        getEventsByCollege,
        resetToDefaultData,
        eventTypes: EVENT_TYPES,
        eventModes: EVENT_MODES
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
