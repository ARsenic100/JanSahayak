const express = require('express');
const router = express.Router();

const { getAllIssues, getIssueById, getIssueStats, getAllIssueOfEmployee, assignIssue, updateIssue } = require('../controllers/issueController');

// Get all issues
router.get('/', getAllIssues);


// Get issue statistics
router.get('/stats', getIssueStats);

// Assign issue to employee
router.post('/assign', assignIssue);

// Get all issues of an employee
router.get('/employee/:employeeId', getAllIssueOfEmployee);

// Get issue by ticketId
router.get('/:ticketId', getIssueById);

// Update issue by ticketId
router.patch('/:ticketId', updateIssue);

module.exports = router;
