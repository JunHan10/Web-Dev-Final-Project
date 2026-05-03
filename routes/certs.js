const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/certs/user/:userId
router.get('/user/:userId', (req, res) => {
    try {
        const arrCerts = objDb.prepare(
            'SELECT * FROM certs WHERE intUserId = ?'
        ).all(req.params.userId)
        res.json({ success: true, certs: arrCerts })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/certs
router.post('/', (req, res) => {
    try {
        const { intUserId, strCertName, strIssuer, datEarned } = req.body

        if (!intUserId || !strCertName) {
            return res.status(400).json({ success: false, error: 'User and cert name are required' })
        }

        const result = objDb.prepare(`
            INSERT INTO certs (intUserId, strCertName, strIssuer, datEarned)
            VALUES (?, ?, ?, ?)
        `).run(
            intUserId, strCertName,
            strIssuer || '', datEarned || ''
        )

        res.json({ success: true, intCertId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// PUT /api/certs/:id
router.put('/:id', (req, res) => {
    try {
        const { strCertName, strIssuer, datEarned } = req.body

        const result = objDb.prepare(`
            UPDATE certs SET
                strCertName = COALESCE(?, strCertName),
                strIssuer   = COALESCE(?, strIssuer),
                datEarned   = COALESCE(?, datEarned)
            WHERE intCertId = ?
        `).run(
            strCertName ?? null, strIssuer ?? null,
            datEarned ?? null, req.params.id
        )

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Cert not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/certs/:id
router.delete('/:id', (req, res) => {
    try {
        const result = objDb.prepare('DELETE FROM certs WHERE intCertId = ?').run(req.params.id)
        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Cert not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router
