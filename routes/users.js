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

        // TODO: Add server-side validation here (length checks, regex)

        const strPasswordHash = hashPassword(strPassword)
        
        const stmt = objDb.prepare(`
            INSERT INTO users (strFirstName, strLastName, strEmail, strPasswordHash,
                               strPhone, strStreet1, strStreet2, strCity, strState, strZIP)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
            strFirstName, strLastName, strEmail, strPasswordHash,
            strPhone, strStreet2 || '', strStreet1, strCity, strState, strZIP
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
    // TODO: Fetch user by intUserId, exclude password hash from response
})

// PUT /api/users/:id - Update user info (including Gemini API key)
router.put('/:id', (req, res) => {
    // TODO: Update fields - especially strGeminiApiKey for AI feature
})

module.exports = router