/**
 * Overview Routes
 */

import { Router } from 'express';
import * as overviewController from '../controllers/overview.controller.js';

const router = Router();

// GET /api/overview - Get all overview data
router.get('/', overviewController.getOverview);

// GET /api/overview/balance - Get current balance only
router.get('/balance', overviewController.getBalance);

export default router;
