const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getKpis } = require('../controllers/dashboardController');
const { getFleetReport, exportFleetReportCsv } = require('../controllers/reportController');

router.use(protect);

router.get('/dashboard/kpis', getKpis);
router.get('/reports/fleet', getFleetReport);
router.get('/reports/fleet/export/csv', exportFleetReportCsv);

module.exports = router;
