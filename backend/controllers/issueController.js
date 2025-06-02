const Issue = require("../models/Issue");
const User = require("../models/User");
const mongoose = require("mongoose");

// GET all issues /api/issues
getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ timestamp: -1 }).populate("assignedTo", "name");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching issues." });
  }
};

// GET all issue of employee
const getAllIssueOfEmployee = async (req, res) => {
  const { employeeId } = req.params;

  // Validate employeeId format
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID format" });
  }

  try {
    const issues = await Issue.find({ assignedTo: employeeId }).populate("assignedTo", "name");

    if (!issues.length) {
      return res
        .status(404)
        .json({ message: "No issues found for this employee" });
    }

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error fetching issues for employee:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET particular issue /api/issues/:ticketId
getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findOne({ ticketId: req.params.ticketId }).populate("assignedTo", "name");
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: "Error fetching issue." });
  }
};

const getIssueStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const assigned = await Issue.countDocuments({ status: "Assigned" });
    const pending = await Issue.countDocuments({ status: "Pending" });
    const closed = await Issue.countDocuments({ status: "Closed" });
    const resolved = await Issue.countDocuments({ resolution: "Resolved" });
    const unresolved = await Issue.countDocuments({ resolution: "Unresolved" });

    // Get counts by urgency
    const highUrgency = await Issue.countDocuments({ urgency: "High" });
    const mediumUrgency = await Issue.countDocuments({ urgency: "Medium" });
    const lowUrgency = await Issue.countDocuments({ urgency: "Low" });

    const byDepartmentRaw = await Issue.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    const byDepartment = {};
    byDepartmentRaw.forEach((dep) => {
      byDepartment[dep._id] = dep.count;
    });

    res.json({
      total,
      assigned,
      pending,
      resolved,
      unresolved,
      byDepartment,
      closed,
      byUrgency: {
        high: highUrgency,
        medium: mediumUrgency,
        low: lowUrgency
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

const assignIssue = async (req, res) => {
  try {
    const { issueId, employeeId } = req.body;

    if (!issueId) {
      return res.status(400).json({ error: "Issue ID is required" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (!employeeId) {
      // Unassign the issue and set status to Pending
      issue.assignedTo = null;
      issue.status = "Pending";
    } else {
      const employee = await User.findById(employeeId);
      if (!employee || employee.role !== "employee") {
        return res.status(404).json({ error: "Employee not found or invalid" });
      }

      issue.assignedTo = employee._id;
      issue.status = "Assigned";
    }

    await issue.save();
    await issue.populate('assignedTo', 'name _id');

    res.status(200).json({
      message: employeeId ? "Issue assigned successfully" : "Issue unassigned successfully",
      issueId: issue._id,
      status: issue.status,
      assignedTo: issue.assignedTo,
    });
  } catch (error) {
    console.error("Error assigning issue:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateIssue = async (req, res) => {
  try {
    let {
      status,
      urgency,
      comments,
      department,
      resolution,
      resolutionDate,
    } = req.body;

    const updates = {};

    if (status) {
      updates.status = status;

      // If status is being set to "Pending", clear assignedTo
      if (status === "Pending") {
        updates.assignedTo = null;
      }
    }

    if (urgency) updates.urgency = urgency;
    if (comments) updates.comments = comments;
    if (department) updates.department = department;
    if (resolution) updates.resolution = resolution;
    if (resolutionDate) updates.resolutionDate = resolutionDate;

    const issue = await Issue.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { $set: updates },
      { new: true }
    ).populate("assignedTo", "name _id");

    if (!issue) return res.status(404).json({ error: "Issue not found." });
    res.json(issue);
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(500).json({ error: "Error updating issue." });
  }
};

module.exports = {
  getAllIssues,
  getIssueById,
  getAllIssueOfEmployee,
  assignIssue,
  updateIssue,
  getIssueStats,
};
