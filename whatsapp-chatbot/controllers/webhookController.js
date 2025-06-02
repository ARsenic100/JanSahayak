const twilio = require('twilio');
const Issue = require("../models/Issue");
const Counter = require("../models/Counter");
const { getSession, clearSession } = require("../services/sessionService");
const { classifyUrgency } = require("../services/urgencyService");

const MessagingResponse = twilio.twiml.MessagingResponse;

// ticket ID generation function
async function generateTicketId(cityName, deptCode) {
  const cityCode = cityName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const key = `${cityCode}-${deptCode}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${key}-${String(counter.seq).padStart(3, "0")}`;
}

// function to create department code
const makeDeptCode = (dept) => {
  return dept.replace(/\s+/g, "").slice(0, 2).toUpperCase();
};

// function to send reply in TwiML format
function sendReply(res, msg) {
  const twiml = new MessagingResponse();
  twiml.message(msg);
  res.set("Content-Type", "text/xml");
  res.send(twiml.toString());
}

const deptMap = {
  1: "Water",
  2: "Electricity",
  3: "Roads",
  4: "Sanitation",
  5: "Garbage Collection",
  6: "Street Lights",
  7: "Drainage",
  8: "Public Toilets",
  9: "Other",
};

const STEPS = {
  START: 1,
  DEPT: 2,
  ASK_CITY: 3,
  ASK_STREETDETAILS: 4,
  ASK_LANDMARK: 5,
  PINCODE: 6,
  DESCRIPTION: 7,
  PHOTO_OPT: 8,
  PHOTO: 9,
  COMPLETE: 10,
};

exports.handleIncoming = async (req, res) => {
  const from = req.body.From;
  const textRaw = (req.body.Body || "").trim();
  const text = textRaw.toUpperCase();
  const mediaQty = parseInt(req.body.NumMedia, 10);
  const mediaUrl = mediaQty > 0 ? req.body.MediaUrl0 : null;

  const session = getSession(from);

  // handling TRACK command
  const trackMatch = text.match(/^TRACK\s+([A-Z]{3}-[A-Z]{2}-\d{3})$/);
  if (trackMatch) {
    const ticketId = trackMatch[1];
    const issue = await Issue.findOne({ ticketId });
    const reply = issue
      ? `Status of ${ticketId}: ${issue.status || "Under Review"}.`
      : `No complaint found with ID ${ticketId}.`;
    return sendReply(res, reply);
  }

  if (session.step == null) {
    session.step = STEPS.START;
    return sendReply(
      res,
      `Thank you for contacting Municipal System.\n` +
        `Type *REPORT* to file a new issue, or *TRACK <Issue-ID>* to check an existing one.`
    );
  }

  if (text === "RESET") {
    session.step = STEPS.START;
    return sendReply(
      res,
      `Type *REPORT* to file a new issue, or *TRACK <Issue-ID>* to check status.`
    );
  }

  if (text === "BACK" && session.history?.length > 1) {
    session.history.pop();
    session.step = session.history.pop();
  }

  // record this step in history (unless resetting)
  session.history = session.history || [];
  if (session.history[session.history.length - 1] !== session.step) {
    session.history.push(session.step);
  }

  let reply;

  switch (session.step) {
    case STEPS.START:
      if (text === "REPORT") {
        session.step = STEPS.DEPT;
        return sendReply(
          res,
          "Great! Please select the type of issue:\n" +
            Object.entries(deptMap)
              .map(([k, v]) => `${k}. ${v}`)
              .join("\n")
        );
      } else {
        return sendReply(
          res,
          `Type *REPORT* to file an issue, or *TRACK <Issue-ID>* to check status.`
        );
      }

    case STEPS.DEPT:
      if (deptMap[textRaw]) {
        session.department = deptMap[textRaw];
        session.step = STEPS.ASK_CITY;
        reply = "Which city is this in?";
      } else {
        reply = `Sorry, that's not valid. Please enter a number from 1 to 9 :\n${Object.entries(
          deptMap
        )
          .map(([k, v]) => `${k}. ${v}`)
          .join("\n")}`;
      }
      break;

    case STEPS.ASK_CITY:
      if (textRaw.length < 3) {
        reply = "Please enter a valid city name (at least 3 characters).";
      } else {
        session.location = { city: textRaw };
        session.step = STEPS.ASK_STREETDETAILS;
        reply = "Street number and name, or reply SKIP to skip.";
      }
      break;

    case STEPS.ASK_STREETDETAILS:
      if (text === "SKIP" || textRaw.length <= 50) {
        session.location.streetDetails = text === "SKIP" ? "" : textRaw;
        session.step = STEPS.ASK_LANDMARK;
        reply = "Please specify a landmark (e.g., Near Main Road).";
      } else {
        reply = "Too long—please send just the number and street, or SKIP.";
      }
      break;

    case STEPS.ASK_LANDMARK:
      if (textRaw.length < 3) {
        reply = "Please enter a valid landmark (at least 3 characters).";
      } else {
        session.location.landmark = textRaw;
        session.step = STEPS.PINCODE;
        reply = "Please share Pin Code.";
      }
      break;

    case STEPS.PINCODE:
      if (/^\d{6}$/.test(textRaw)) {
        session.location.pincode = textRaw;
        session.step = STEPS.DESCRIPTION;
        reply = "Please describe your issue briefly.";
      } else {
        reply = "That doesn't look right. Enter a 6-digit PIN code.";
      }
      break;

    case STEPS.DESCRIPTION:
      if (textRaw.length < 5) {
        reply = "Please describe your issue in at least 5 characters.";
      } else {
        session.description = textRaw;
        session.step = STEPS.PHOTO_OPT;
        reply = "Would you like to add a photo? Reply 1 for Yes, 2 for No.";
      }
      break;

    case STEPS.PHOTO_OPT:
      if (text === "1") {
        session.step = STEPS.PHOTO;
        reply = "Please send the photo now.";
      } else if (text === "2") {
        const deptCode = makeDeptCode(session.department);
        const ticket = await generateTicketId(session.location.city, deptCode);
        session.lastTicket = ticket;
        const urgency = await classifyUrgency(session.description);
        await Issue.create({
          phone: from,
          department: session.department,
          location: session.location,
          description: session.description,
          ticketId: ticket,
          urgency
        });
        session.step = STEPS.COMPLETE;
        reply = `Registered!\n🎫 Ticket ID: ${ticket}\nReply TRACK ${ticket} to check status.`;
      } else {
        reply = "Please reply 1 for Yes or 2 for No.";
      }
      break;

    case STEPS.PHOTO:
      if (mediaUrl) {
        const deptCode = makeDeptCode(session.department);
        const ticket = await generateTicketId(session.location.city, deptCode);
        session.lastTicket = ticket;
        const urgency = await classifyUrgency(session.description);
        await Issue.create({
          phone: from,
          department: session.department,
          location: session.location,
          description: session.description,
          imageUrl: mediaUrl,
          ticketId: ticket,
          urgency
        });
        session.step = STEPS.COMPLETE;
        reply = `Registered with photo!\n🎫 Ticket ID: ${ticket}\nReply TRACK ${ticket} to check status.`;
      } else {
        reply = "No photo detected. Send an image or reply BACK.";
      }
      break;

    case STEPS.COMPLETE:
      return sendReply(
        res,
        `You've already filed your complaint (ID: ${session.lastTicket}).\n` +
          `Reply TRACK ${session.lastTicket} to check status, or RESET to file a new complaint.`
      );

    default:
      clearSession(from);
      reply =
        "Something went wrong. Type *REPORT* to start a new issue or *TRACK <ID>* to check status.";
  }

  sendReply(res, reply);
};
