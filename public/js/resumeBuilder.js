// Show the resume builder view (checkboxes for selecting items)
async function showResumeBuilder() {
    // TODO: Fetch all jobs+details, skills, certs, awards for current user
    // TODO: Render each as a checkbox the user can toggle
    // TODO: Add a "Resume Name" text input
    // TODO: Add a "Generate" button that collects checked IDs and POSTs to /api/resumes
}

async function saveResume(strResumeName, arrSelections) {
    // TODO: POST to /api/resumes with all the selected ID arrays
}

async function loadResumesList() {
    // TODO: GET /api/resumes/user/:userId and show clickable cards
}

// TODO: Wire up #btnNewResume