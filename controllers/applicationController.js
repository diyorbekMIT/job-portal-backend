const Application = require('../models/Application');
const Job =  require('../models/Job');

exports.applyToJob = async (req, res) => {
    try{
        if (req.user.role !== 'jobseeker'){
            return res.status(403).json({message: "Only job seekers can apply to jobs"})
        };

        const existing = await Application.findOne({job: req.params.jobId, applicant: req.user._id});

        if(existing) {
            return res.status(400).json({message: "You have already applied to ths job"});
        }

        const application = await Application.create({
            job: req.params.jobId,
            applicant: req.user._id,
            resume: req.user.resume
        })

        res.status(201).json(application);

    }catch(error){
        res.status(500).json({message: error.message})
    }
};


exports.getMyApplications = async (req, res) => {
    try{
        const applications = await Application.find({
            applicant: req.user._id
        }).populate("job", "title company location type").sort({createdAt: -1});

        res.json(applications);
    }catch(error){
        res.status(500).json({message: error.message})
    }
};

exports.getApplicationsForJob = async (req, res) => {
    try{
        const job = await Job.findById(req.params.jobId);

        if(!job) {
            return res.status(404).json({message: "Job not found"});
        }

        if(job.company.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Access denied"});
        };

        const applications = await Application.find({
            job: req.params.jobId
        })
            .populate("job", "title company location category type")
            .populate("applicant", "name email resume")

        res.json(applications);

    }catch(error){
        res.status(500).json({message: error.message})
    }
};


exports.getApplicationById = async (req, res) => {
    try{
        const application = await Application.findById(req.params.id)
            .populate("job", "title")
            .populate("applicant", "name email avatar resume");

        if(!application) {
            return res.status(404).json({message: "Application not found", id: req.params.id});
        }

        const isOwner = 
        application.applicant._id.toString() === req.user._id.toString() || 
        application.job.company.toString() === req.user._id.toString();

        if(!isOwner){
            return res.status(403).json({message: "Access denied"});
        }

        res.json(application);

    }catch(error){
        res.status(500).json({message: error.message})
    }
};


exports.updateStatus = async (req, res) => {
    try{
        const {status} = req.body;

        const application = await Application.findById(req.params.id)
            .populate("job");

        if(!application) {
            return res.status(404).json({message: "Application not found"});
        };

        if(application.job._id.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Access denied"});
        };

        application.status = status;
        await application.save();

        res.status(200).json(application);
    }catch(error){
        res.status(500).json({message: error.message})
    }
};

