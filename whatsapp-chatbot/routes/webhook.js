const express = require('express');
const router  = express.Router();
const { handleIncoming } = require('../controllers/webhookController');

router.get('/', (req, res) => {
    res.status(200).send('Webhook is up and running!');
});

router.post('/', handleIncoming);

module.exports = router