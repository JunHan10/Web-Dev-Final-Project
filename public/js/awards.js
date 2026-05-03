// Load awards for the current user and render the list as Bootstrap cards
async function loadAwards() {
    if (!objCurrentUser) return
    const divList = document.querySelector('#divAwardsList')
    divList.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const result = await fetch(`${strApiBase}/awards/user/${objCurrentUser.intUserId}`)
        const data = await result.json()

        if (!data.success) {
            divList.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }
        if (data.awards.length === 0) {
            divList.innerHTML = '<p class="text-muted">No awards yet. Click "+ Add Award" to get started.</p>'
            return
        }

        divList.innerHTML = data.awards.map(a => `
            <div class="card mb-3" data-award-id="${a.intAwardId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">${escHtml(a.strAwardName)}</h5>
                            <p class="text-muted mb-2">
                                ${escHtml(a.strGranter || '')}
                                ${a.strGranter && a.datReceived ? '&middot;' : ''}
                                ${escHtml(a.datReceived || '')}
                            </p>
                            ${a.strDescription ? `<p class="mb-0">${escHtml(a.strDescription)}</p>` : ''}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-info btn-ai-feedback">Get AI Feedback</button>
                            <button class="btn btn-sm btn-outline-primary btn-edit-award">Edit</button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-award">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (err) {
        divList.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

function openAwardModalForAdd() {
    document.querySelector('#awardModalLabel').innerText = 'Add Award'
    document.querySelector('#hidAwardId').value = ''
    document.querySelector('#frmAward').reset()
    new bootstrap.Modal(document.querySelector('#awardModal')).show()
}

async function openAwardModalForEdit(intAwardId) {
    const result = await fetch(`${strApiBase}/awards/user/${objCurrentUser.intUserId}`)
    const data = await result.json()
    const a = data.awards.find(x => x.intAwardId === intAwardId)
    if (!a) return

    document.querySelector('#awardModalLabel').innerText = 'Edit Award'
    document.querySelector('#hidAwardId').value = intAwardId
    document.querySelector('#txtAwardName').value = a.strAwardName || ''
    document.querySelector('#txtAwardGranter').value = a.strGranter || ''
    document.querySelector('#txtAwardReceived').value = a.datReceived || ''
    document.querySelector('#txtAwardDescription').value = a.strDescription || ''
    new bootstrap.Modal(document.querySelector('#awardModal')).show()
}

async function saveAward() {
    const intAwardId = document.querySelector('#hidAwardId').value
    const objAward = {
        intUserId: objCurrentUser.intUserId,
        strAwardName: document.querySelector('#txtAwardName').value.trim(),
        strGranter: document.querySelector('#txtAwardGranter').value.trim(),
        datReceived: document.querySelector('#txtAwardReceived').value,
        strDescription: document.querySelector('#txtAwardDescription').value.trim()
    }

    if (!objAward.strAwardName) {
        Swal.fire({ title: 'Missing info', text: 'Award name is required', icon: 'error' })
        return
    }

    try {
        const strUrl = intAwardId ? `${strApiBase}/awards/${intAwardId}` : `${strApiBase}/awards`
        const strMethod = intAwardId ? 'PUT' : 'POST'
        const result = await fetch(strUrl, {
            method: strMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objAward)
        })
        const data = await result.json()

        if (data.success) {
            bootstrap.Modal.getInstance(document.querySelector('#awardModal')).hide()
            loadAwards()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

async function deleteAward(intAwardId) {
    const confirmation = await Swal.fire({
        title: 'Delete this award?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d9534f'
    })
    if (!confirmation.isConfirmed) return

    try {
        const result = await fetch(`${strApiBase}/awards/${intAwardId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadAwards()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

document.querySelector('#btnAddAward').addEventListener('click', openAwardModalForAdd)
document.querySelector('#btnSaveAward').addEventListener('click', saveAward)

document.querySelector('#divAwardsList').addEventListener('click', (evt) => {
    const card = evt.target.closest('[data-award-id]')
    if (!card) return
    const intAwardId = parseInt(card.dataset.awardId, 10)

    if (evt.target.classList.contains('btn-edit-award')) {
        openAwardModalForEdit(intAwardId)
    } else if (evt.target.classList.contains('btn-delete-award')) {
        deleteAward(intAwardId)
    } else if (evt.target.classList.contains('btn-ai-feedback')) {
        const strName = card.querySelector('.card-title').innerText
        const strDesc = card.querySelector('p.mb-0')?.innerText || ''
        getFeedback(`${strName}${strDesc ? ': ' + strDesc : ''}`, 'award')
    }
})
