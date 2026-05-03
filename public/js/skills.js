// Load skill categories with their skills, render as cards
async function loadSkills() {
    if (!objCurrentUser) return
    const divList = document.querySelector('#divSkillsList')
    divList.innerHTML = '<p class="text-muted">Loading...</p>'

    try {
        const result = await fetch(`${strApiBase}/skills/user/${objCurrentUser.intUserId}`)
        const data = await result.json()

        if (!data.success) {
            divList.innerHTML = `<p class="text-danger">${escHtml(data.error)}</p>`
            return
        }
        if (data.categories.length === 0) {
            divList.innerHTML = '<p class="text-muted">No skill categories yet. Click "+ Add Category" to get started.</p>'
            return
        }

        divList.innerHTML = data.categories.map(cat => `
            <div class="card mb-3" data-category-id="${cat.intCategoryId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title mb-0">${escHtml(cat.strCategoryName)}</h5>
                        <button class="btn btn-sm btn-outline-danger btn-delete-category">Delete Category</button>
                    </div>

                    <div class="mt-2">
                        ${cat.arrSkills.map(s => `
                            <span class="badge bg-secondary me-1 mb-1" data-skill-id="${s.intSkillId}">
                                ${escHtml(s.strSkillName)}
                                <button class="btn-close btn-close-white ms-1 align-middle btn-delete-skill"
                                        style="font-size:0.6rem"
                                        aria-label="Remove"></button>
                            </span>
                        `).join('')}
                    </div>

                    <div class="input-group mt-2">
                        <input type="text" class="form-control txt-add-skill" placeholder="Add a skill...">
                        <button class="btn btn-outline-success btn-add-skill" type="button">Add</button>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (err) {
        divList.innerHTML = `<p class="text-danger">${escHtml(err.message)}</p>`
    }
}

function openCategoryModalForAdd() {
    document.querySelector('#categoryModalLabel').innerText = 'Add Skill Category'
    document.querySelector('#hidCategoryId').value = ''
    document.querySelector('#frmCategory').reset()
    new bootstrap.Modal(document.querySelector('#categoryModal')).show()
}

async function saveCategory() {
    const intCategoryId = document.querySelector('#hidCategoryId').value
    const strCategoryName = document.querySelector('#txtCategoryName').value.trim()

    if (!strCategoryName) {
        Swal.fire({ title: 'Missing info', text: 'Category name is required', icon: 'error' })
        return
    }

    try {
        const strUrl = intCategoryId
            ? `${strApiBase}/skills/categories/${intCategoryId}`
            : `${strApiBase}/skills/categories`
        const strMethod = intCategoryId ? 'PUT' : 'POST'
        const objBody = intCategoryId
            ? { strCategoryName }
            : { intUserId: objCurrentUser.intUserId, strCategoryName }

        const result = await fetch(strUrl, {
            method: strMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objBody)
        })
        const data = await result.json()

        if (data.success) {
            bootstrap.Modal.getInstance(document.querySelector('#categoryModal')).hide()
            loadSkills()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

async function deleteCategory(intCategoryId) {
    const confirmation = await Swal.fire({
        title: 'Delete this category?',
        text: 'This also deletes its skills. This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d9534f'
    })
    if (!confirmation.isConfirmed) return

    try {
        const result = await fetch(`${strApiBase}/skills/categories/${intCategoryId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadSkills()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

async function addSkill(intCategoryId, strSkillName) {
    if (!strSkillName) return
    try {
        const result = await fetch(`${strApiBase}/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intCategoryId, strSkillName })
        })
        const data = await result.json()
        if (data.success) {
            loadSkills()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

async function deleteSkill(intSkillId) {
    try {
        const result = await fetch(`${strApiBase}/skills/${intSkillId}`, { method: 'DELETE' })
        const data = await result.json()
        if (data.success) {
            loadSkills()
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

document.querySelector('#btnAddCategory').addEventListener('click', openCategoryModalForAdd)
document.querySelector('#btnSaveCategory').addEventListener('click', saveCategory)

document.querySelector('#divSkillsList').addEventListener('click', (evt) => {
    const card = evt.target.closest('[data-category-id]')
    if (!card) return
    const intCategoryId = parseInt(card.dataset.categoryId, 10)

    if (evt.target.classList.contains('btn-delete-category')) {
        deleteCategory(intCategoryId)
    } else if (evt.target.classList.contains('btn-add-skill')) {
        const input = card.querySelector('.txt-add-skill')
        addSkill(intCategoryId, input.value.trim())
    } else if (evt.target.classList.contains('btn-delete-skill')) {
        const badge = evt.target.closest('[data-skill-id]')
        deleteSkill(parseInt(badge.dataset.skillId, 10))
    }
})

document.querySelector('#divSkillsList').addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' && evt.target.classList.contains('txt-add-skill')) {
        evt.preventDefault()
        const card = evt.target.closest('[data-category-id]')
        addSkill(parseInt(card.dataset.categoryId, 10), evt.target.value.trim())
    }
})
