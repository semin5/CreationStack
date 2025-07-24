import axios from 'axios';

export const getJobs = async () => {
  return axios.get('http://localhost:8080/api/jobs');
};
