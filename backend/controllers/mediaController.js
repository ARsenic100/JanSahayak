const axios = require("axios");

const getMedia = async (req, res) => {
  try {
    const raw = req.query.url;
    if (!raw) {
      return res.status(400).json({ error: "Missing `url` query parameter" });
    }

    const decodedUrl = decodeURIComponent(raw);

    // Whitelist either the Twilio REST API or the MMS CDN:
    const isApiUrl = decodedUrl.startsWith("https://api.twilio.com/2010-04-01/Accounts/");
    const isCdnUrl = decodedUrl.startsWith("https://mms.twiliocdn.com/");
    if (!isApiUrl && !isCdnUrl) {
      return res.status(400).json({ error: "Invalid media URL" });
    }

    // If you hit the REST API, you need basic auth; CDN does not require it.
    const axiosConfig = {
      responseType: "stream",
      ...(isApiUrl && {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      }),
    };

    const response = await axios.get(decodedUrl, axiosConfig);

    // Forward the content type to the client:
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);

  } catch (err) {
    console.error("Media proxy error:", err.message);
    // Distinguish auth errors vs. other failures if you like:
    res.status(502).json({ error: "Failed to fetch media" });
  }
};

module.exports = { getMedia };
