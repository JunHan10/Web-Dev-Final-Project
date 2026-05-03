// Login button handler
document.querySelector('#btnLogin').addEventListener('click', async () => {
    const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    const strEmail = document.querySelector('#txtEmail').value.trim()
    const strPassword = document.querySelector('#txtPassword').value.trim()
    
    let blnError = false
    let strMessage = ''
    
    if (!regEmail.test(strEmail)) {
        blnError = true
        strMessage += '<p>You must enter a valid email</p>'
    }
    if (strPassword.length < 1) {
        blnError = true
        strMessage += '<p>You must enter a password</p>'
    }
    
    if (blnError) {
        Swal.fire({ title: 'Oh no!', html: strMessage, icon: 'error' })
        return
    }
    
    try {
        const result = await fetch(`${strApiBase}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strEmail, strPassword })
        })
        const data = await result.json()
        
        if (data.success) {
            objCurrentUser = data.user
            document.querySelector('#txtUserName').innerText = data.user.strFirstName
            showView('divApp')
            showSection('dashboard')
        } else {
            Swal.fire({ title: 'Login Failed', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
})

// Show registration view
document.querySelector('#btnShowSignup').addEventListener('click', () => {
    showView('divRegister')
})

// TODO: Handle registration form submission
// TODO: Handle "Back to Login" button