// Save the Gemini API key on the current user's record. We never read the key
// back from the server (GET /users/:id intentionally omits it), so the field
// stays blank on every visit and an empty submission is treated as "no change".
async function saveGeminiKey() {
    if (!objCurrentUser) return

    const strGeminiApiKey = document.querySelector('#txtGeminiKey').value.trim()
    if (!strGeminiApiKey) {
        Swal.fire({ title: 'Missing info', text: 'Paste your Gemini API key first.', icon: 'error' })
        return
    }

    try {
        const result = await fetch(`${strApiBase}/users/${objCurrentUser.intUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strGeminiApiKey })
        })
        const data = await result.json()

        if (data.success) {
            document.querySelector('#txtGeminiKey').value = ''
            Swal.fire({ title: 'Key saved', icon: 'success', timer: 1500, showConfirmButton: false })
        } else {
            Swal.fire({ title: 'Error', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}

document.querySelector('#btnSaveKey').addEventListener('click', saveGeminiKey)
