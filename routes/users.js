const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')
const crypto = require('crypto')

// Helper function to hash passwords
// TODO: Consider using bcrypt for production - SHA-256 is simple but not ideal
function hashPassword(strPassword) {
    return crypto.createHash('sha256').update(strPassword).digest('hex')
}

// POST /api/users/register - Create a new user
router.post('/register', (req, res) => {
    try {
        const {
            strFirstName, strLastName, strEmail, strPassword,
            strPhone, strStreet1, strStreet2, strCity, strState, strZIP
        } = req.body

        if (!strFirstName || !strLastName || !strEmail || !strPassword) {
            return res.status(400).json({ success: false, error: 'First name, last name, email, and password are required' })
        }
        if (strPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
        }
        const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regEmail.test(strEmail)) {
            return res.status(400).json({ success: false, error: 'Invalid email address' })
        }

        const strPasswordHash = hashPassword(strPassword)

        const stmt = objDb.prepare(`
            INSERT INTO users (strFirstName, strLastName, strEmail, strPasswordHash,
                               strPhone, strStreet1, strStreet2, strCity, strState, strZIP)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
            strFirstName, strLastName, strEmail, strPasswordHash,
            strPhone || '', strStreet1 || '', strStreet2 || '', strCity || '', strState || '', strZIP || ''
        )
        
        res.json({ success: true, intUserId: result.lastInsertRowid })
    } catch (err) {
        console.error(err)
        res.status(400).json({ success: false, error: err.message })
    }
})

// POST /api/users/login - Authenticate a user
router.post('/login', (req, res) => {
    try {
        const { strEmail, strPassword } = req.body
        const strPasswordHash = hashPassword(strPassword)
        
        const objUser = objDb.prepare(
            'SELECT intUserId, strFirstName, strLastName, strEmail FROM users WHERE strEmail = ? AND strPasswordHash = ?'
        ).get(strEmail, strPasswordHash)
        
        if (objUser) {
            res.json({ success: true, user: objUser })
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// GET /api/users/:id - Get user info
router.get('/:id', (req, res) => {
    try {
        const objUser = objDb.prepare(
            'SELECT intUserId, strFirstName, strLastName, strEmail, strPhone, strStreet1, strStreet2, strCity, strState, strZIP FROM users WHERE intUserId = ?'
        ).get(req.params.id)

        if (objUser) {
            res.json({ success: true, user: objUser })
        } else {
            res.status(404).json({ success: false, error: 'User not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// PUT /api/users/:id - Update user info (including Gemini API key)
router.put('/:id', (req, res) => {
    try {
        const {
            strFirstName, strLastName, strPhone,
            strStreet1, strStreet2, strCity, strState, strZIP,
            strGeminiApiKey
        } = req.body

        const result = objDb.prepare(`
            UPDATE users SET
                strFirstName     = COALESCE(?, strFirstName),
                strLastName      = COALESCE(?, strLastName),
                strPhone         = COALESCE(?, strPhone),
                strStreet1       = COALESCE(?, strStreet1),
                strStreet2       = COALESCE(?, strStreet2),
                strCity          = COALESCE(?, strCity),
                strState         = COALESCE(?, strState),
                strZIP           = COALESCE(?, strZIP),
                strGeminiApiKey  = COALESCE(?, strGeminiApiKey)
            WHERE intUserId = ?
        `).run(
            strFirstName ?? null, strLastName ?? null, strPhone ?? null,
            strStreet1 ?? null, strStreet2 ?? null, strCity ?? null,
            strState ?? null, strZIP ?? null,
            strGeminiApiKey ?? null, req.params.id
        )

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'User not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router