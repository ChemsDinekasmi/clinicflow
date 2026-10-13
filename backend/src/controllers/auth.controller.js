const authService = require('../services/auth.service');

async function login(req, res) {
  const { email, password } = req.valid.body;
  res.json(await authService.login(email, password));
}

async function me(req, res) {
  res.json({ user: await authService.getById(req.user.id) });
}

module.exports = { login, me };
