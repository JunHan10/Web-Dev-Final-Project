// Send content to the AI review endpoint and show the feedback
async function getFeedback(strContent, strContentType) {
    Swal.fire({
        title: 'Getting AI feedback...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    })
    
    try {
        const result = await fetch(`${strApiBase}/ai/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                intUserId: objCurrentUser.intUserId,
                strContent: strContent,
                strContentType: strContentType
            })
        })
        const data = await result.json()
        
        if (data.success) {
            Swal.fire({
                title: 'AI Suggestion',
                text: data.feedback,
                icon: 'info'
            })
        } else {
            Swal.fire({
                title: 'AI Error',
                text: data.error,
                icon: 'error'
            })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
}