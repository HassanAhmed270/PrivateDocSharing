import express from 'express';
import {
  createDocument,
  getDocument,
  listDocuments,
  requestDocumentAccess,
  reviewAccessRequest,
} from '../controllers/documentController.js';

const router = express.Router();

router.get('/', listDocuments);
router.post('/', createDocument);
router.get('/:id', getDocument);
router.post('/:id/requests', requestDocumentAccess);
router.patch('/:id/requests/:requestId', reviewAccessRequest);

export default router;
