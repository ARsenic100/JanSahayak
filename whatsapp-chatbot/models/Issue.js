const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  phone:       { type: String, required: true },
  department:  { type: String, required: true },
  location: {
    city:         { type: String, required: true },
    streetDetails:{ type: String, default: "" },
    landmark:     { type: String, required: true },
    pincode:      { type: String, required: true }
  },
  description: { type: String, required: true },
  imageUrl:    { type: String, default: null },
  ticketId:    { type: String, required: true, unique: true },
  status:      { type: String, default: "Pending" },
  urgency:     { type: String, default: 'Low' },
  assignedTo:  { type: String, default: null },
  resolution:  { type: String, default: 'Unresolved' },
  resolutionDate: { type: Date, default: null },
  comments:    {type: String, default: null },
  timestamp:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
