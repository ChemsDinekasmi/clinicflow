const router = require('express').Router();
const controller = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { idParamSchema } = require('../validators/common.validator');
const {
  createAppointmentSchema,
  updateStatusSchema,
  listAppointmentsQuerySchema,
} = require('../validators/appointment.validator');

router.use(authenticate);

router.get('/', validate(listAppointmentsQuerySchema, 'query'), asyncHandler(controller.list));
router.post('/', validate(createAppointmentSchema), asyncHandler(controller.create));
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.getById));
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  asyncHandler(controller.updateStatus),
);

module.exports = router;
