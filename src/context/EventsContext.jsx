import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import apiService from '../services/api';

const EventsContext = createContext();

const EVENT_TYPES = ['All', 'Hackathon', 'Ideathon', 'Coding Contest', 'Technical Fest', 'Workshop', 'Paper Presentation'];
const EVENT_MODES = ['All', 'Online', 'Offline', 'Hybrid'];

export function EventsProvider({ children }) {
  const { showToast } = useToast();

  const [colleges, setColleges] = useState([]);
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const [eventsRes, collegesRes] = await Promise.all([
        apiService.getEvents(),
        apiService.getColleges ? apiService.getColleges().catch(() => ({ success: true, data: [] })) : Promise.resolve({ success: true, data: [] })
      ]);

      if (eventsRes.success) {
        setEvents(eventsRes.events || []);
      }
      if (collegesRes.success) {
        setColleges(collegesRes.data || []);
      }
    } catch (err) {
      console.warn('Events sync error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const addEvent = async (eventData) => {
    try {
      const payload = {
        title: eventData.name,
        organizer: eventData.organizer || eventData.collegeName || 'Placement Cell',
        event_date: eventData.eventDate,
        location: eventData.venue || 'Campus',
        event_url: eventData.regUrl || '',
        description: eventData.description || ''
      };
      const res = await apiService.createEvent(payload);
      if (res.success) {
        showToast(`Event "${eventData.name}" created successfully!`, 'success');
        fetchEventsData();
        return res.event;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    }
  };

  const addCollege = async (collegeData) => {
    try {
      const res = await apiService.createCollege(collegeData);
      if (res.success) {
        showToast(`College "${collegeData.name}" created successfully!`, 'success');
        fetchEventsData();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create college', 'error');
    }
  };

  const toggleSaveEvent = (eventId) => {
    if (savedEventIds.includes(eventId)) {
      setSavedEventIds(prev => prev.filter(id => id !== eventId));
      showToast('Removed event from Saved', 'info');
    } else {
      setSavedEventIds(prev => [...prev, eventId]);
      showToast('Event saved to your list!', 'success');
    }
  };

  const isEventSaved = (eventId) => savedEventIds.includes(eventId);

  return (
    <EventsContext.Provider
      value={{
        colleges,
        events,
        savedEventIds,
        addEvent,
        addCollege,
        toggleSaveEvent,
        isEventSaved,
        eventTypes: EVENT_TYPES,
        eventModes: EVENT_MODES,
        loading
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
