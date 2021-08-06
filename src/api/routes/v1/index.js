const express = require('express');
const courseRoute = require('./course.route')
const universityRoute = require('./university.route')

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));


router.use('/course', courseRoute);
router.use('/university', universityRoute);

module.exports = router;
