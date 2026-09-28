import { Router } from 'express';
import authRoutes from './auth.routes.js';
import breakdownRoutes from './breakdown.routes.js';
import equipmentRoutes from './equipment.routes.js';
import healthRoutes from './health.routes.js';
import logisticServiceRoutes from './logisticService.routes.js';
import requestRoutes from './request.routes.js';
import submissionRoutes from './submission.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/breakdowns', breakdownRoutes);
router.use('/requests', requestRoutes);
router.use('/logistic-services', logisticServiceRoutes);
router.use('/submissions', submissionRoutes);

export default router;
