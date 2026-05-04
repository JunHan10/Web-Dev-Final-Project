// ===== Per-section render helpers (checkbox UI for the resume builder) =====

function renderJobsCheckboxes(arrJobs) {
    if (arrJobs.length === 0) return '<p class="text-muted">No jobs yet.</p>'

    return arrJobs.map(job => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title mb-1">
                    ${escHtml(job.strTitle)}
                    <span class="text-muted">@ ${escHtml(job.strCompany)}</span>
                </h5>
                <p class="text-muted mb-2">
                    ${escHtml(fmtJobDate(job.datStartDate))} &ndash; ${escHtml(fmtJobDate(job.datEndDate))}
                </p>
                ${renderJobDetailCheckboxes(job.arrDetails)}
            </div>
        </div>
    `).join('')
}

function renderJobDetailCheckboxes(arrDetails) {
    if (arrDetails.length === 0) {
        return '<p class="text-muted small mb-0">No responsibilities to choose from.</p>'
    }
    return arrDetails.map(d => `
        <div class="form-check">
            <input class="form-check-input chk-detail" type="checkbox"
                   id="chkDetail${d.intDetailId}" value="${d.intDetailId}">
            <label class="form-check-label" for="chkDetail${d.intDetailId}">
                ${escHtml(d.strDetail)}
            </label>
        </div>
    `).join('')
}

function renderSkillsCheckboxes(arrCategories) {
    if (arrCategories.length === 0) return '<p class="text-muted">No skills yet.</p>'

    return arrCategories.map(cat => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${escHtml(cat.strCategoryName)}</h5>
                ${cat.arrSkills.length === 0
                    ? '<p class="text-muted small mb-0">No skills in this category.</p>'
                    : cat.arrSkills.map(s => `
                        <div class="form-check form-check-inline">
                            <input class="form-check-input chk-skill" type="checkbox"
                                   id="chkSkill${s.intSkillId}" value="${s.intSkillId}">
                            <label class="form-check-label" for="chkSkill${s.intSkillId}">
                                ${escHtml(s.strSkillName)}
                            </label>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `).join('')
}

function renderCertsCheckboxes(arrCerts) {
    if (arrCerts.length === 0) return '<p class="text-muted">No certifications yet.</p>'

    return arrCerts.map(c => `
        <div class="form-check">
            <input class="form-check-input chk-cert" type="checkbox"
                   id="chkCert${c.intCertId}" value="${c.intCertId}">
            <label class="form-check-label" for="chkCert${c.intCertId}">
                ${escHtml(c.strCertName)}
                ${c.strIssuer ? `<span class="text-muted">&mdash; ${escHtml(c.strIssuer)}</span>` : ''}
            </label>
        </div>
    `).join('')
}

function renderAwardsCheckboxes(arrAwards) {
    if (arrAwards.length === 0) return '<p class="text-muted">No awards yet.</p>'

    return arrAwards.map(a => `
        <div class="form-check">
            <input class="form-check-input chk-award" type="checkbox"
                   id="chkAward${a.intAwardId}" value="${a.intAwardId}">
            <label class="form-check-label" for="chkAward${a.intAwardId}">
                ${escHtml(a.strAwardName)}
                ${a.strGranter ? `<span class="text-muted">&mdash; ${escHtml(a.strGranter)}</span>` : ''}
            </label>
        </div>
    `).join('')
}

// ===== Main builder flow =====

// Show the resume builder view: fetches every item type for the user and
// renders a checkbox grid so the user can pick what goes onto a resume.
async function showResumeBuilder() {
    if (!objCurrentUser) return

    document.querySelector('#divResumesList').style.display = 'none'
    document.querySelector('#divResumePreview').style.display = 'none'
    document.querySelector('#divResumeBuilder').style.display = 'block'

    const intUserId = objCurrentUser.intUserId
    const divBuilder = document.querySelector('#divResumeBuilder')
    divBuilder.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const [resJobs, resSkills, resCerts, resAwards] = await Promise.all([
            fetch(`${strApiBase}/jobs/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/skills/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/certs/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/awards/user/${intUserId}`).then(r => r.json())
        ])

        divBuilder.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Build a Resume</h3>
                <div>
                    <button id="btnGenerateResume" class="btn btn-primary">Generate</button>
                    <button id="btnCancelBuilder" class="btn btn-secondary">Cancel</button>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label" for="txtResumeName">Resume Name</label>
                <input class="form-control" id="txtResumeName" type="text"
                       placeholder="e.g. Software Engineer - Acme Corp">
            </div>

            <h4 class="mt-4">Experience</h4>
            ${renderJobsCheckboxes(resJobs.jobs || [])}

            <h4 class="mt-4">Skills</h4>
            ${renderSkillsCheckboxes(resSkills.categories || [])}

            <h4 class="mt-4">Certifications</h4>
            ${renderCertsCheckboxes(resCerts.certs || [])}

            <h4 class="mt-4">Awards</h4>
            ${renderAwardsCheckboxes(resAwards.awards || [])}
        `

        document.querySelector('#btnGenerateResume').addEventListener('click', collectAndSaveResume)
        document.querySelector('#btnCancelBuilder').addEventListener('click', cancelBuilder)
    } catch (err) {
        divBuilder.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

function cancelBuilder() {
    document.querySelector('#divResumeBuilder').style.display = 'none'
    document.querySelector('#divResumeBuilder').innerHTML = ''
    document.querySelector('#divResumesList').style.display = 'block'
}

// Read every checked checkbox in the builder and POST the new resume
async function collectAndSaveResume() {
    const strResumeName = document.querySelector('#txtResumeName').value.trim()
    if (!strResumeName) {
        Swal.fire({ title: 'Missing info', text: 'Resume name is required', icon: 'error' })
        return
    }

    const collect = (strSelector) =>
        Array.from(document.querySelectorAll(strSelector + ':checked'))
             .map(el => parseInt(el.value, 10))

    const objBody = {
        intUserId: objCurrentUser.intUserId,
        strResumeName,
        arrSelectedDetailIds: collect('.chk-detail'),
        arrSelectedSkillIds:  collect('.chk-skill'),
        arrSelectedCertIds:   collect('.chk-cert'),
        arrSelectedAwardIds:  collect('.chk-award')
    }

    try {
        const result = await fetch(`${strApiBase}/resumes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objBody)
        })
        const data = await result.json()
        if (!data.success) {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
            return
        }

        document.querySelector('#divResumeBuilder').style.display = 'none'
        document.querySelector('#divResumeBuilder').innerHTML = ''
        renderResume(data.intResumeId)
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

// ===== Resume list (cards on the Resumes tab) =====

async function loadResumesList() {
    if (!objCurrentUser) return
    const divList = document.querySelector('#divResumesList')

    document.querySelector('#divResumeBuilder').style.display = 'none'
    document.querySelector('#divResumePreview').style.display = 'none'
    divList.style.display = 'block'
    divList.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const result = await fetch(`${strApiBase}/resumes/user/${objCurrentUser.intUserId}`)
        const data = await result.json()

        if (!data.success) {
            divList.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }
        if (data.resumes.length === 0) {
            divList.innerHTML = '<p class="text-muted">No resumes yet. Click "+ New Resume" to build one.</p>'
            return
        }

        divList.innerHTML = data.resumes.map(r => `
            <div class="card mb-2" data-resume-id="${r.intResumeId}">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${escHtml(r.strResumeName)}</h5>
                        <p class="text-muted small mb-0">
                            Created ${escHtml((r.datCreated || '').slice(0, 10))}
                        </p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary btn-view-resume">View</button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-resume">Delete</button>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (err) {
        divList.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

async function deleteResume(intResumeId) {
    const confirmation = await Swal.fire({
        title: 'Delete this resume?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d9534f'
    })
    if (!confirmation.isConfirmed) return

    try {
        const result = await fetch(`${strApiBase}/resumes/${intResumeId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadResumesList()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

document.querySelector('#btnNewResume').addEventListener('click', showResumeBuilder)

document.querySelector('#divResumesList').addEventListener('click', (evt) => {
    const card = evt.target.closest('[data-resume-id]')
    if (!card) return
    const intResumeId = parseInt(card.dataset.resumeId, 10)

    if (evt.target.classList.contains('btn-view-resume')) {
        renderResume(intResumeId)
    } else if (evt.target.classList.contains('btn-delete-resume')) {
        deleteResume(intResumeId)
    }
})
