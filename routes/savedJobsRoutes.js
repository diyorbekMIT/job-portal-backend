const express = require('express');
const {protect} = require('../middlewares/authMiddleware');
const {saveJob, getMySavedJobs, deleteSavedJob} = require('../controllers/savedJobsController');

const router = express.Router();

router.post('/:jobId', protect, saveJob);
router.delete('/:jobId', protect, deleteSavedJob);
router.get('/my', protect, getMySavedJobs);

module.exports = router;