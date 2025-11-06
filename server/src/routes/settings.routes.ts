import { Router } from 'express';
import { getInventorySettings, updateInventorySettings } from '../controllers/settings.controller';

const router = Router();

router.get('/inventory', getInventorySettings);
router.put('/inventory', updateInventorySettings);

export default router;