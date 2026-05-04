// Load jobs for the current user and render the list as Bootstrap cards
async function loadJobs() {
    if (!objCurrentUser) return
    const divList = document.querySelector('#divJobsList')
    divList.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const result = await fetch(`${strApiBase}/jobs/user/${objCurrentUser.intUserId}`)
        const data = await result.json()

        if (!data.success) {
            divList.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }
        if (data.jobs.length === 0) {
            divList.innerHTML = '<p class="text-muted">No jobs yet. Click "+ Add Job" to get started.</p>'
            return
        }

        divList.innerHTML = data.jobs.map(job => `
            <div class="card mb-3" data-job-id="${job.intJobId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">${escHtml(job.strTitle)} <span class="text-muted">@ ${escHtml(job.strCompany)}</span></h5>
                            <p class="text-muted mb-2">
                                ${escHtml(job.strLocation || '')}
                                ${job.strLocation ? '&middot;' : ''}
                                ${escHtml(fmtJobDate(job.datStartDate))} &ndash; ${escHtml(fmtJobDate(job.datEndDate))}
                            </p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary btn-edit-job">Edit</button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-job">Delete</button>
                        </div>
                    </div>

                    <h6 class="mt-3">Responsibilities</h6>
                    <ul class="list-group list-group-flush">
                        ${job.arrDetails.map(d => `
                            <li class="list-group-item d-flex justify-content-between align-items-center" data-detail-id="${d.intDetailId}">
                                <span class="flex-grow-1">${escHtml(d.strDetail)}</span>
                                <span>
                                    <button class="btn btn-sm btn-outline-info btn-ai-feedback">Get AI Feedback</button>
                                    <button class="btn btn-sm btn-outline-danger btn-delete-detail">&times;</button>
                                </span>
                            </li>
                        `).join('')}
                    </ul>

                    <div class="input-group mt-2">
                        <input type="text" class="form-control txt-add-detail" placeholder="Add a responsibility...">
                        <button class="btn btn-outline-success btn-add-detail" type="button">Add</button>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (err) {
        divList.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

// Open modal for adding a new job (clears form)
function openJobModalForAdd() {
    document.querySelector('#jobModalLabel').innerText = 'Add Job'
    document.querySelector('#hidJobId').value = ''
    document.querySelector('#frmJob').reset()
    new bootstrap.Modal(document.querySelector('#jobModal')).show()
}

// Open modal pre-populated for editing
async function openJobModalForEdit(intJobId) {
    const result = await fetch(`${strApiBase}/jobs/user/${objCurrentUser.intUserId}`)
    const data = await result.json()
    const job = data.jobs.find(j => j.intJobId === intJobId)
    if (!job) return

    document.querySelector('#jobModalLabel').innerText = 'Edit Job'
    document.querySelector('#hidJobId').value = intJobId
    document.querySelector('#txtJobCompany').value = job.strCompany || ''
    document.querySelector('#txtJobTitle').value = job.strTitle || ''
    document.querySelector('#txtJobLocation').value = job.strLocation || ''
    document.querySelector('#txtJobStart').value = job.datStartDate || ''
    document.querySelector('#txtJobEnd').value = job.datEndDate || ''
    new bootstrap.Modal(document.querySelector('#jobModal')).show()
}

// Save handler (create or update depending on hidden id)
async function saveJob() {
    const intJobId = document.querySelector('#hidJobId').value
    const objJob = {
        intUserId: objCurrentUser.intUserId,
        strCompany: document.querySelector('#txtJobCompany').value.trim(),
        strTitle: document.querySelector('#txtJobTitle').value.trim(),
        strLocation: document.querySelector('#txtJobLocation').value.trim(),
        datStartDate: document.querySelector('#txtJobStart').value,
        datEndDate: document.querySelector('#txtJobEnd').value
    }

    if (!objJob.strCompany || !objJob.strTitle) {
        Swal.fire({ title: 'Missing info', text: 'Company and title are required', icon: 'error' })
        return
    }

    try {
        const strUrl = intJobId ? `${strApiBase}/jobs/${intJobId}` : `${strApiBase}/jobs`
        const strMethod = intJobId ? 'PUT' : 'POST'
        const result = await fetch(strUrl, {
            method: strMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objJob)
        })
        const data = await result.json()

        if (data.success) {
            bootstrap.Modal.getInstance(document.querySelector('#jobModal')).hide()
            loadJobs()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

// Delete a job after confirming
async function deleteJob(intJobId) {
    const confirmation = await Swal.fire({
        title: 'Delete this job?',
        text: 'This also deletes its responsibilities. This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d9534f'
    })
    if (!confirmation.isConfirmed) return

    try {
        const result = await fetch(`${strApiBase}/jobs/${intJobId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadJobs()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

// Add a responsibility to a job
async function addJobDetail(intJobId, strDetail) {
    if (!strDetail) return
    try {
        const result = await fetch(`${strApiBase}/jobs/${intJobId}/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strDetail })
        })
        const data = await result.json()
        if (data.success) {
            loadJobs()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

// Delete a single responsibility
async function deleteJobDetail(intDetailId) {
    try {
        const result = await fetch(`${strApiBase}/jobs/details/${intDetailId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadJobs()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

// Wire up "+ Add Job" button and modal save button
document.querySelector('#btnAddJob').addEventListener('click', openJobModalForAdd)
document.querySelector('#btnSaveJob').addEventListener('click', saveJob)

// Delegated listener on the jobs list for per-card actions
document.querySelector('#divJobsList').addEventListener('click', (evt) => {
    const card = evt.target.closest('[data-job-id]')
    if (!card) return
    const intJobId = parseInt(card.dataset.jobId, 10)

    if (evt.target.classList.contains('btn-edit-job')) {
        openJobModalForEdit(intJobId)
    } else if (evt.target.classList.contains('btn-delete-job')) {
        deleteJob(intJobId)
    } else if (evt.target.classList.contains('btn-add-detail')) {
        const input = card.querySelector('.txt-add-detail')
        addJobDetail(intJobId, input.value.trim())
    } else if (evt.target.classList.contains('btn-delete-detail')) {
        const li = evt.target.closest('[data-detail-id]')
        deleteJobDetail(parseInt(li.dataset.detailId, 10))
    } else if (evt.target.classList.contains('btn-ai-feedback')) {
        const li = evt.target.closest('[data-detail-id]')
        const strDetail = li.querySelector('.flex-grow-1').innerText
        getFeedback(strDetail, 'job_responsibility')
    }
})

// Allow Enter key to add a responsibility
document.querySelector('#divJobsList').addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' && evt.target.classList.contains('txt-add-detail')) {
        evt.preventDefault()
        const card = evt.target.closest('[data-job-id]')
        addJobDetail(parseInt(card.dataset.jobId, 10), evt.target.value.trim())
    }
})
