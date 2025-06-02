const express = require("express");
const router = express.Router();
const { getMedia } = require("../controllers/mediaController");

router.get("/", getMedia);

module.exports = router;
