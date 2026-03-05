const SavedJob = require('../models/SavedJob');
const SvedJob = require('../models/SavedJob');

exports.saveJob = async (req, res) => {
    try {
        const existing = await SavedJob.findOne({
            job: req.params.jobId,
            jobSeeker: req.user._id  // ✅ capital S — matches schema
        });

        if (existing) {
            return res.status(400).json({ message: "Job already saved" });
        }

        const savedJob = await SavedJob.create({
            job: req.params.jobId,
            jobSeeker: req.user._id  // ✅ capital S — matches schema
        });

        res.status(201).json(savedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteSavedJob = async (req, res) => {
    try{
        await SavedJob.findOneAndDelete({job: req.params.jobId, jobSeeker: req.user._id})
        res.status(200).json({message: "Job removed from saved list"});
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getMySavedJobs = async (req, res) => {
    try{
        const savedJobs = await SavedJob.find({
            jobSeeker: req.user._id
        }).populate({
            path: "job",
            populate: {
                path: "company",
                select: "name companyName companyLogo"
            }
        })

        res.status(200).json(savedJobs);
    }catch(error){
        res.status(500).json({message: error.message})
    }
}