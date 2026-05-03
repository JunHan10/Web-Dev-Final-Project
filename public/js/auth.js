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


// Registration form submission
document.querySelector('#btnRegister').addEventListener('click', async () => {
    const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const strFirstName = document.querySelector('#txtRegFirstName').value.trim()
    const strLastName  = document.querySelector('#txtRegLastName').value.trim()
    const strEmail     = document.querySelector('#txtRegEmail').value.trim()
    const strPassword  = document.querySelector('#txtRegPassword').value.trim()
    const strPhone     = document.querySelector('#txtRegPhone').value.trim()
    const strStreet1   = document.querySelector('#txtRegStreet1').value.trim()
    const strStreet2   = document.querySelector('#txtRegStreet2').value.trim()
    const strCity      = document.querySelector('#txtRegCity').value.trim()
    const strState     = document.querySelector('#txtRegState').value.trim()
    const strZIP       = document.querySelector('#txtRegZIP').value.trim()

    let blnError = false
    let strMessage = ''

    if (!strFirstName) { blnError = true; strMessage += '<p>First name is required</p>' }
    if (!strLastName)  { blnError = true; strMessage += '<p>Last name is required</p>' }
    if (!regEmail.test(strEmail)) { blnError = true; strMessage += '<p>Enter a valid email</p>' }
    if (strPassword.length < 6)  { blnError = true; strMessage += '<p>Password must be at least 6 characters</p>' }

    if (blnError) {
        Swal.fire({ title: 'Oh no!', html: strMessage, icon: 'error' })
        return
    }

    try {
        const result = await fetch(`${strApiBase}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                strFirstName, strLastName, strEmail, strPassword,
                strPhone, strStreet1, strStreet2, strCity, strState, strZIP
            })
        })
        const data = await result.json()

        if (data.success) {
            Swal.fire({ title: 'Account Created!', text: 'You can now log in.', icon: 'success' })
            showView('divLogin')
        } else {
            Swal.fire({ title: 'Registration Failed', text: data.error, icon: 'error' })
        }
    } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' })
    }
})

// Back to login from registration
document.querySelector('#btnBackToLogin').addEventListener('click', () => {
    showView('divLogin')
})