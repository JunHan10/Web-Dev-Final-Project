// Load certifications for the current user and render the list
async function loadCerts() {
    if (!objCurrentUser) return
    const divList = document.querySelector('#divCertsList')
    divList.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const result = await fetch(`${strApiBase}/certs/user/${objCurrentUser.intUserId}`)
        const data = await result.json()

        if (!data.success) {
            divList.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }
        if (data.certs.length === 0) {
            divList.innerHTML = '<p class="text-muted">No certifications yet. Click "+ Add Cert" to get started.</p>'
            return
        }

        divList.innerHTML = data.certs.map(c => `
            <div class="card mb-3" data-cert-id="${c.intCertId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">${escHtml(c.strCertName)}</h5>
                            <p class="text-muted mb-0">
                                ${escHtml(c.strIssuer || '')}
                                ${c.strIssuer && c.datEarned ? '&middot;' : ''}
                                ${escHtml(c.datEarned || '')}
                            </p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary btn-edit-cert">Edit</button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-cert">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (err) {
        divList.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

function openCertModalForAdd() {
    document.querySelector('#certModalLabel').innerText = 'Add Certification'
    document.querySelector('#hidCertId').value = ''
    document.querySelector('#frmCert').reset()
    new bootstrap.Modal(document.querySelector('#certModal')).show()
}

async function openCertModalForEdit(intCertId) {
    const result = await fetch(`${strApiBase}/certs/user/${objCurrentUser.intUserId}`)
    const data = await result.json()
    const c = data.certs.find(x => x.intCertId === intCertId)
    if (!c) return

    document.querySelector('#certModalLabel').innerText = 'Edit Certification'
    document.querySelector('#hidCertId').value = intCertId
    document.querySelector('#txtCertName').value = c.strCertName || ''
    document.querySelector('#txtCertIssuer').value = c.strIssuer || ''
    document.querySelector('#txtCertEarned').value = c.datEarned || ''
    new bootstrap.Modal(document.querySelector('#certModal')).show()
}

async function saveCert() {
    const intCertId = document.querySelector('#hidCertId').value
    const objCert = {
        intUserId: objCurrentUser.intUserId,
        strCertName: document.querySelector('#txtCertName').value.trim(),
        strIssuer: document.querySelector('#txtCertIssuer').value.trim(),
        datEarned: document.querySelector('#txtCertEarned').value
    }

    if (!objCert.strCertName) {
        Swal.fire({ title: 'Missing info', text: 'Cert name is required', icon: 'error' })
        return
    }

    try {
        const strUrl = intCertId ? `${strApiBase}/certs/${intCertId}` : `${strApiBase}/certs`
        const strMethod = intCertId ? 'PUT' : 'POST'
        const result = await fetch(strUrl, {
            method: strMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objCert)
        })
        const data = await result.json()

        if (data.success) {
            bootstrap.Modal.getInstance(document.querySelector('#certModal')).hide()
            loadCerts()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

async function deleteCert(intCertId) {
    const confirmation = await Swal.fire({
        title: 'Delete this cert?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d9534f'
    })
    if (!confirmation.isConfirmed) return

    try {
        const result = await fetch(`${strApiBase}/certs/${intCertId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadCerts()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

document.querySelector('#btnAddCert').addEventListener('click', openCertModalForAdd)
document.querySelector('#btnSaveCert').addEventListener('click', saveCert)

document.querySelector('#divCertsList').addEventListener('click', (evt) => {
    const card = evt.target.closest('[data-cert-id]')
    if (!card) return
    const intCertId = parseInt(card.dataset.certId, 10)

    if (evt.target.classList.contains('btn-edit-cert')) {
        openCertModalForEdit(intCertId)
    } else if (evt.target.classList.contains('btn-delete-cert')) {
        deleteCert(intCertId)
    }
})
