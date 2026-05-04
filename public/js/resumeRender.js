// ===== Per-section render helpers (printable resume HTML) =====

function renderResumeHeader(objUser) {
    const u = objUser || {}
    const arrAddrParts = [
        [u.strStreet1, u.strStreet2].filter(Boolean).join(', '),
        [u.strCity, u.strState].filter(Boolean).join(', '),
        u.strZIP
    ].filter(Boolean).map(escHtml)
    const strContactLine = [u.strEmail, u.strPhone]
        .filter(Boolean).map(escHtml).join(' &middot; ')

    return `
        <header class="text-center mb-4">
            <h1 class="mb-1">${escHtml(u.strFirstName || '')} ${escHtml(u.strLastName || '')}</h1>
            ${strContactLine ? `<p class="mb-1">${strContactLine}</p>` : ''}
            ${arrAddrParts.length ? `<p class="text-muted mb-0">${arrAddrParts.join(' &middot; ')}</p>` : ''}
        </header>
        <hr>
    `
}

function renderExperienceSection(arrJobs) {
    if (arrJobs.length === 0) return ''

    return `
        <section class="mb-4">
            <h3 class="border-bottom pb-1">Experience</h3>
            ${arrJobs.map(job => `
                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <strong>${escHtml(job.strTitle)} &mdash; ${escHtml(job.strCompany)}</strong>
                        <span class="text-muted">
                            ${escHtml(fmtJobDate(job.datStartDate))} &ndash; ${escHtml(fmtJobDate(job.datEndDate))}
                        </span>
                    </div>
                    ${job.strLocation ? `<div class="text-muted">${escHtml(job.strLocation)}</div>` : ''}
                    <ul class="mt-1 mb-0">
                        ${job.arrDetails.map(d => `<li>${escHtml(d.strDetail)}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </section>
    `
}

function renderSkillsSection(arrCategories) {
    if (arrCategories.length === 0) return ''

    return `
        <section class="mb-4">
            <h3 class="border-bottom pb-1">Skills</h3>
            ${arrCategories.map(cat => `
                <p class="mb-1">
                    <strong>${escHtml(cat.strCategoryName)}:</strong>
                    ${cat.arrSkills.map(s => escHtml(s.strSkillName)).join(', ')}
                </p>
            `).join('')}
        </section>
    `
}

function renderCertsSection(arrCerts) {
    if (arrCerts.length === 0) return ''

    return `
        <section class="mb-4">
            <h3 class="border-bottom pb-1">Certifications</h3>
            <ul class="mb-0">
                ${arrCerts.map(c => `
                    <li>
                        <strong>${escHtml(c.strCertName)}</strong>
                        ${c.strIssuer ? ` &mdash; ${escHtml(c.strIssuer)}` : ''}
                        ${c.datEarned ? `<span class="text-muted"> (${escHtml(c.datEarned)})</span>` : ''}
                    </li>
                `).join('')}
            </ul>
        </section>
    `
}

function renderAwardsSection(arrAwards) {
    if (arrAwards.length === 0) return ''

    return `
        <section class="mb-4">
            <h3 class="border-bottom pb-1">Awards</h3>
            <ul class="mb-0">
                ${arrAwards.map(a => `
                    <li>
                        <strong>${escHtml(a.strAwardName)}</strong>
                        ${a.strGranter ? ` &mdash; ${escHtml(a.strGranter)}` : ''}
                        ${a.datReceived ? `<span class="text-muted"> (${escHtml(a.datReceived)})</span>` : ''}
                        ${a.strDescription ? `<div>${escHtml(a.strDescription)}</div>` : ''}
                    </li>
                `).join('')}
            </ul>
        </section>
    `
}

// ===== Main entry: fetch a complete resume and render it for viewing/printing =====

async function renderResume(intResumeId) {
    document.querySelector('#divResumesList').style.display = 'none'
    document.querySelector('#divResumeBuilder').style.display = 'none'

    const divPreview = document.querySelector('#divResumePreview')
    divPreview.style.display = 'block'

    // Build the preview shell, then drop content into #divResumeContent so
    // the print button (and the "Back" button) survive every refresh.
    divPreview.innerHTML = `
        <div class="mb-3 no-print">
            <button id="btnBackToResumes" class="btn btn-secondary">&larr; Back</button>
            <button id="btnPrintResume" class="btn btn-primary">Print / Save as PDF</button>
        </div>
        <div id="divResumeContent"><p class="text-muted">Loading...</p></div>
    `

    document.querySelector('#btnBackToResumes').addEventListener('click', loadResumesList)
    document.querySelector('#btnPrintResume').addEventListener('click', () => window.print())

    const divContent = document.querySelector('#divResumeContent')

    try {
        const result = await fetch(`${strApiBase}/resumes/${intResumeId}`)
        const data = await result.json()

        if (!data.success) {
            divContent.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }

        divContent.innerHTML =
            renderResumeHeader(data.user) +
            renderExperienceSection(data.jobs) +
            renderSkillsSection(data.skillCategories) +
            renderCertsSection(data.certs) +
            renderAwardsSection(data.awards)
    } catch (err) {
        divContent.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}
