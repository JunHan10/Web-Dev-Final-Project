// Load jobs for the current user and render the list
async function loadJobs() {
    // TODO: fetch from /api/jobs/user/:userId
    // TODO: build HTML for each job card with edit/delete buttons
    // TODO: list each job's responsibilities with a "Get AI Feedback" button
}

// Create a new job
async function createJob(objJob) {
    // TODO: POST to /api/jobs
}

// Add a responsibility to a job
async function addJobDetail(intJobId, strDetail) {
    // TODO: POST to /api/jobs/:jobId/details
}

// Delete a job
async function deleteJob(intJobId) {
    // TODO: confirm with SweetAlert, then DELETE /api/jobs/:id
}

// TODO: Wire up "Add Job" button to show a form/modal
// TODO: Wire up "Get AI Feedback" buttons to call aiHelper.getFeedback()