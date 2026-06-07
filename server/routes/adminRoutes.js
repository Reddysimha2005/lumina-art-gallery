const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminUserController = require('../controllers/adminUserController');
const adminSettingsController = require('../controllers/adminSettingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../utils/upload');

// All admin routes require auth and admin role
router.use(authMiddleware, adminMiddleware);

// --- Dashboard Routes ---
router.get('/dashboard-stats', adminController.getDashboardStats);

// --- Painting Routes ---
router.post('/paintings', upload.single('image'), adminController.addPainting);
router.put('/paintings/:id', upload.single('image'), adminController.updatePainting);
router.delete('/paintings/bulk', adminController.bulkDeletePaintings);
router.delete('/paintings/:id', adminController.deletePainting);

// --- Order Routes ---
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// --- User Management Routes ---
router.get('/users', adminUserController.getAllUsers);
router.put('/users/:id/ban', adminUserController.toggleBanUser);
router.put('/users/:id/promote', adminUserController.promoteUser);
router.delete('/users/:id', adminUserController.deleteUser);

// --- Site Settings Routes ---
router.get('/settings', adminSettingsController.getSettings);
router.put('/settings', adminSettingsController.updateSettings);

// --- Category & Tag Routes ---
router.get('/categories', adminSettingsController.getCategories);
router.post('/categories', adminSettingsController.addCategory);
router.delete('/categories/:id', adminSettingsController.deleteCategory);

router.get('/tags', adminSettingsController.getTags);
router.post('/tags', adminSettingsController.addTag);
router.delete('/tags/:id', adminSettingsController.deleteTag);

// --- Cart Monitoring ---
router.get('/carts', adminSettingsController.getAllCarts);
router.post('/carts/remind', adminSettingsController.sendCartReminder);

// --- Chatbot & FAQs ---
router.get('/chatlogs', adminSettingsController.getChatLogs);
router.get('/faqs', adminSettingsController.getFaqs);
router.post('/faqs', adminSettingsController.addFaq);
router.delete('/faqs/:id', adminSettingsController.deleteFaq);

module.exports = router;
