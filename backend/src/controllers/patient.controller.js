const patientService = require('../services/patient.service');

async function list(req, res) {
  res.json(await patientService.list(req.valid.query));
}

async function getById(req, res) {
  res.json(await patientService.getById(req.valid.params.id));
}

async function create(req, res) {
  res.status(201).json(await patientService.create(req.valid.body));
}

async function update(req, res) {
  res.json(await patientService.update(req.valid.params.id, req.valid.body));
}

async function remove(req, res) {
  await patientService.remove(req.valid.params.id);
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
