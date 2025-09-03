"use client"
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const PaginatedEvents = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/paginate', {
          params: { page, limit: 10 },
        });
        setEvents(response.data.events);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [page]);

  return (
    <div>
      <h1>Events (Page {page})</h1>
      <ul>
        {events.map(event => (
          <li key={event._id}>{event.title} ({event.year})</li>
        ))}
      </ul>
      <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
        Next
      </button>
    </div>
  );
};

export default PaginatedEvents;
