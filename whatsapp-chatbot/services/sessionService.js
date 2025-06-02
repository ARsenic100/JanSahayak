const sessions = {};

const getSession = (userId) => {
  if (!sessions[userId]) sessions[userId] = {};
  return sessions[userId];
};

const clearSession = (userId) => {
  delete sessions[userId];
};

module.exports = { getSession, clearSession };