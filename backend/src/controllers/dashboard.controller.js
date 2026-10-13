const dashboardService = require('../services/dashboard.service');

async function stats(req, res) {
  res.json(await dashboardService.getStats());
}

module.exports = { stats };
