const express = require("express");
const router = express.Router();
const jobController = require("../controller/jobController");

router.post("/", jobController.createJob);
router.get("/", jobController.getJobs);
router.get("/applications/:jobId", jobController.getApplicationsForJob);
router.delete("/:jobId", jobController.deleteJob);

module.exports = router;
