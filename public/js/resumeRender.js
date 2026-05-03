// Fetch a complete resume and render it for viewing/printing
async function renderResume(intResumeId) {
    // TODO: GET /api/resumes/:id - returns user info + all selected items
    // TODO: Build clean HTML for header (name, contact info)
    // TODO: Section: Experience (jobs with selected bullet points only)
    // TODO: Section: Skills (grouped by category)
    // TODO: Section: certs
    // TODO: Section: Awards
    // TODO: Drop the HTML into #divResumePreview
}

// Trigger browser print dialog (works for "Save as PDF" too)
document.querySelector('#btnPrintResume').addEventListener('click', () => {
    window.print()
})