const router = require('express').Router();
const controller = require('../controllers/patient.controller');
const validate = require('../middlewares/validate');
const { authenticate, requireRole } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { idParamSchema } = require('../validators/common.validator');
const { patientSchema, listPatientsQuerySchema } = require('../validators/patient.validator');

router.use(authenticate);

router.get('/', validate(listPatientsQuerySchema, 'query'), asyncHandler(controller.list));
router.post('/', validate(patientSchema), asyncHandler(controller.create));
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.getById));
router.put('/:id', validate(idParamSchema, 'params'), validate(patientSchema), asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), validate(idParamSchema, 'params'), asyncHandler(controller.remove));

module.exports = router;
