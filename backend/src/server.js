const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`ClinicFlow API listening on http://localhost:${port}/api`);
});
