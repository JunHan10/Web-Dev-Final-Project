// Global state - holds the currently logged-in user
let objCurrentUser = null
const strApiBase = 'http://localhost:3000/api'

// Show one view (login/register/app), hide the others
function showView(strViewId) {
    document.querySelectorAll('.view').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector(`#${strViewId}`).style.display = 'block'
}

// Show one section within the main app, hide the others
function showSection(strSectionName) {
    document.querySelectorAll('#divApp .section').forEach(div => {
        div.style.display = 'none'
    })
    const strDivId = '#div' + strSectionName.charAt(0).toUpperCase() + strSectionName.slice(1)
    document.querySelector(strDivId).style.display = 'block'

    if (strSectionName === 'jobs') loadJobs()
    else if (strSectionName === 'skills') loadSkills()
    else if (strSectionName === 'certs') loadCerts()
    else if (strSectionName === 'awards') loadAwards()
    else if (strSectionName === 'resumes') loadResumesList()
    else if (strSectionName === 'dashboard') loadDashboard()
}

// Fetch each item type for the user and drop a count into the dashboard cards.
// Skills count adds up the skills inside every category.
async function loadDashboard() {
    if (!objCurrentUser) return
    const intUserId = objCurrentUser.intUserId

    const setCount = (strId, n) => {
        document.querySelector(strId).innerText = (typeof n === 'number') ? n : '?'
    }

    try {
        const [resJobs, resSkills, resCerts, resAwards, resResumes] = await Promise.all([
            fetch(`${strApiBase}/jobs/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/skills/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/certs/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/awards/user/${intUserId}`).then(r => r.json()),
            fetch(`${strApiBase}/resumes/user/${intUserId}`).then(r => r.json())
        ])

        setCount('#spnJobsCount',    resJobs.success    ? resJobs.jobs.length       : null)
        setCount('#spnCertsCount',   resCerts.success   ? resCerts.certs.length     : null)
        setCount('#spnAwardsCount',  resAwards.success  ? resAwards.awards.length   : null)
        setCount('#spnResumesCount', resResumes.success ? resResumes.resumes.length : null)

        const intSkillTotal = resSkills.success
            ? resSkills.categories.reduce((sum, cat) => sum + cat.arrSkills.length, 0)
            : null
        setCount('#spnSkillsCount', intSkillTotal)
    } catch (err) {
        console.error('Dashboard load failed:', err)
    }
}

// Wire up nav buttons
document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
        showSection(btn.dataset.section)
    })
})

// About modal
document.querySelector('#btnAbout').addEventListener('click', () => {
    const objModal = new bootstrap.Modal(document.querySelector('#aboutModal'))
    objModal.show()
})

// Logout
document.querySelector('#btnLogout').addEventListener('click', () => {
    objCurrentUser = null
    showView('divLogin')
})

// On page load, show the login view
showView('divLogin')