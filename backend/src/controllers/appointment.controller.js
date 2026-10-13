const appointmentService = require('../services/appointment.service');

async function list(req, res) {
  res.json(await appointmentService.list(req.valid.query));
}

async function getById(req, res) {
  res.json(await appointmentService.getById(req.valid.params.id));
}

async function create(req, res) {
  res.status(201).json(await appointmentService.create(req.valid.body, req.user.id));
}

async function updateStatus(req, res) {
  res.json(await appointmentService.updateStatus(req.valid.params.id, req.valid.body.status));
}

module.exports = { list, getById, create, updateStatus };
