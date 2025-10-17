import axios from 'axios';
const apiClient = axios.create({
  
  baseURL: 'https://api.excelassignmentsolver.com/api/events',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
