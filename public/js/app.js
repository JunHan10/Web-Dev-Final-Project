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