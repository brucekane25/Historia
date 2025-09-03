"use client"
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const EventsByYearRange = () => {
    const [startYear, setStartYear] = useState(1900);
    const [endYear, setEndYear] = useState(1950);
    const [events, setEvents] = useState([]);
  
    const fetchYearRangeEvents = async () => {
      try {
        const response = await apiClient.get('/yearrange', {
          params: { startYear, endYear, limit: 10 },
        });
        setEvents(response.data.events);
      } catch (error) {
        console.error('Error fetching events by year range:', error);
      }
    };
  
    useEffect(() => {
      fetchYearRangeEvents();
    }, [startYear, endYear]);
    
    
    return (<div>
        <h1>Events from {startYear} to {endYear}</h1>
        <input
          type="number"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
          placeholder="Start Year"
        />
        <input
          type="number"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
          placeholder="End Year"
        />
        <button onClick={fetchYearRangeEvents}>Fetch Events</button>
        
        <ul>
          {events.map(event => (
            <li key={event._id}>{event.title} ({event.year})</li>
          ))}
        </ul>
      </div>
    );
  };

export default EventsByYearRange
