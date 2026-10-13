const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./auth.routes'));
router.use('/patients', require('./patient.routes'));
router.use('/appointments', require('./appointment.routes'));
router.get('/dashboard/stats', authenticate, asyncHandler(dashboardController.stats));

module.exports = router;
