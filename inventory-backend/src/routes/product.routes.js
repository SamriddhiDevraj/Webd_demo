import { Router } from 'express';
import multer from 'multer';
import { getAll, getOne, create, update, remove, importCSV } from '../controllers/product.controller.js';
import { upload } from '../config/cloudinary.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireOwner } from '../middleware/requireOwner.js';

const csvUpload = multer({ storage: multer.memoryStorage() });
const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership);

// IMPORTANT: import route must come before /:id to avoid conflict
router.post('/:shopId/products/import', requireOwner, csvUpload.single('csv'), importCSV);

router.get('/:shopId/products', getAll);
router.get('/:shopId/products/:id', getOne);
router.post('/:shopId/products', requireOwner, upload.single('image'), create);
router.put('/:shopId/products/:id', requireOwner, upload.single('image'), update);
router.delete('/:shopId/products/:id', requireOwner, remove);

export default router;
