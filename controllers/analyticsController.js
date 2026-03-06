const Application = require('../models/Application');
const Jobs = require('../models/Job');


const getTrend = (current, previous) => {
    if(previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

exports.getEmployerAnalytics = async (req, res) => {
    try{
        if(req.user.role !== "employer"){
            return res.status(403).json({message: "Access denied"});
        }

        const companyId = req.user._id;

        const now = new Date();
        const last7days = new Date();
        last7days.setDate(now.getDate() - 7);
        const previous7days = new Date();
        previous7days.setDate(now.getDate() - 14);

        const totalActiveJobs = await Jobs.countDocuments({company: companyId, isClosed: false});

        const jobs = await Jobs.find({company: companyId}).select("_id").lean();

        const jobsId = jobs.map(job => job._id);

        const totalApplications = await Application.countDocuments({job: {$in: jobsId}})

        const totalHired = await Application.countDocuments({
            job: {$in: jobsId}, 
            status: "Accepted"
        });

        // Active Job Posts trend
        const activeJobsLast7 = await Jobs.countDocuments({
            company: companyId, 
            createdAt: {$gte: last7days, $lte: now}
        })

        const activeJobsPrevious7 = await Jobs.countDocuments({
            company: companyId, 
            createdAt: {$gte: previous7days, $lte: last7days}
        })

        const ActiveJobTrend = getTrend(activeJobsLast7, activeJobsPrevious7);

         // Applications trend
        const applicationsLast7 = await Application.countDocuments({job: {$in: jobsId }, createdAt: {$gte: last7days, $lt: now}});
        const applicationsPrevious7 = await Application.countDocuments({job: {$in: jobsId}, createdAt: {$gte: previous7days, $lte: last7days}})

        const ApplicationsTrend = getTrend(applicationsLast7, applicationsPrevious7);

        // Hired Applicants trend
        const hiredLast7 = await Application.countDocuments({job: {$in: jobsId}, status: "Accepted", createdAt: {$gt: last7days, $lte: now}});
        const hiredPrev7 = await Application.countDocuments({job: {$in: jobsId}, status: "Accepted", createdAt: {$gte: previous7days, $lte: last7days}})

        const getHiredTrend = getTrend(hiredLast7, hiredPrev7);

        // === DATA ===
        const recentJobs = await Jobs.find({company: companyId}).sort({createdAt: -1}).limit(5).select("title location type createdAt isClosed");
        const recentApplications = await Application.find({ job: { $in: jobsId } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("applicant", "name email avatar")
            .populate("job", "title");

        res.json({
            counts: {
                totalActiveJobs,
                totalApplications,
                totalHired,
                trends: {
                    activeJobs: ActiveJobTrend,
                    totalApplicants: ApplicationsTrend,
                    totalHired: getHiredTrend
                }
            },
            data: {
                recentJobs,
                recentApplications
            }
        })

    }catch(error){
        res.status(500).json({message: error.message})
    }
}