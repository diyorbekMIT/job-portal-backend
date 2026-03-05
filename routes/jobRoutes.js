const express = require("express");
const {
    createJob,
    getJobs,
    getJobsEmployer,
    getJobsById,
    updateJob,
    deleteJob,
    toggleCloseJob
} = require("../controllers/jobController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get('/', getJobs);
router.post('/', protect, createJob);
router.get('/get-jobs-employer', protect, getJobsEmployer);
router.get('/:id', getJobsById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.put('/:id/toggle-close', protect, toggleCloseJob);

module.exports = router;
