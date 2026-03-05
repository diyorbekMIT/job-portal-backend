const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJobs = require("../models/SavedJob");

exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Only employers can post jobs" });
        }
        const job = await Job.create({ ...req.body, company: req.user._id });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const { keyword, location, category, type, minSalary, maxSalary, userId } = req.query;

        const query = {
            isClosed: false,
            ...(keyword && { title: { $regex: keyword, $options: "i" } }),
            ...(location && { location: { $regex: location, $options: "i" } }),
            ...(category && { category }),
            ...(type && { type }),
        };

        if (minSalary || maxSalary) {
            query.$and = [];
            if (minSalary) query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
            if (maxSalary) query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
            if (query.$and.length === 0) delete query.$and;
        }

        const jobs = await Job.find(query).populate("company", "name companyName companyLogo");

        let savedJobIds = [];
        let appliedJobStatusMap = {};

        if (userId) {
            const savedJobs = await SavedJobs.find({ jobseeker: userId }).select("job");
            savedJobIds = savedJobs.map((s) => String(s.job));

            const applications = await Application.find({ applicant: userId }).select("job status");
            applications.forEach((app) => {
                appliedJobStatusMap[String(app.job)] = app.status;
            });
        }

        const jobsWithExtras = jobs.map((job) => {
            const jobIdStr = String(job._id);
            return {
                ...job.toObject(),
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliedJobStatusMap[jobIdStr] || null,
            };
        });

        res.json(jobsWithExtras);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobsEmployer = async (req, res) => {
    try {
        const { _id: userId, role } = req.user;

        if (role !== "employer") {
            return res.status(403).json({ message: "Access denied" });
        }

        const jobs = await Job.find({ company: userId })
            .populate("company", "name companyName companyLogo")
            .lean();

        const jobsWithApplicationCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({ job: job._id });
                return { ...job, applicationCount };
            })
        );

        res.json(jobsWithApplicationCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getJobsById = async (req, res) => {
    try {
        const { userId } = req.query;

        const job = await Job.findById(req.params.id).populate("company", "name companyName companyLogo");

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        let applicationStatus;

        if (userId) {
            const application = await Application.findOne({ job: job._id, applicant: userId }).select("status");
            if (application) {
                applicationStatus = application.status;
            }
        }

        res.json({ ...job.toObject(), applicationStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" }); // ✅ fixed typo .staus → .status, 403 → 404
        }

        if (String(job.company) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to update this job" });
        }

        Object.assign(job, req.body);
        const updatedJob = await job.save();
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteJob = async (req, res) => {
  try{
      const job = await Job.findById(req.params.id);
      if(!job){
          return res.status(404).json({message: "Job not found"});
      };

      if(String(job.company) !== String(req.user._id)){
          return res.status(403).json({message: "Not authorized to delete this job"});
      }

      await job.deleteOne();
      
      res.status(200).json({message: "Job deleted successfully"});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

exports.toggleCloseJob = async (req, res ) => {
  try{
      const job = await Job.findById(req.params.id);

      if(!job) {
        return res.status(403).json({message: "Job not found"})
      };

      if(String(job.company) !== String(req.user._id)){
        return res.status(403).json({message: "Not authorized to close this job"});
      } 

      job.isClosed = !job.isClosed;
      await job.save();

      res.json({message: "Job toggeled successfully"})
  }catch(error){
    res.status(500).json({error: error.message})
  }
}
