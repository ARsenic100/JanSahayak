import { get, post, patch } from '../api/apiService';

export const fetchIssues = () => get('/');
export const fetchIssueById = (ticketId) => get(`/issues/${ticketId}`);
export const fetchIssueStats = () => get('/issues/stats');
export const fetchAllIssuesOfEmployee = (employeeId) => get(`/issues/employee/${employeeId}`);
export const assignIssue = (assignData) => post('/issues/assign', assignData);
export const updateIssue = (ticketId, updateData) => patch(`/issues/${ticketId}`, updateData);