const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/awards/user/:userId
router.get('/user/:userId', (req, res) => {
    try {
        const arrAwards = objDb.prepare(
            'SELECT * FROM awards WHERE intUserId = ?'
        ).all(req.params.userId)
        res.json({ success: true, awards: arrAwards })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/awards
router.post('/', (req, res) => {
    try {
        const { intUserId, strAwardName, strGranter, datReceived, strDescription } = req.body

        if (!intUserId || !strAwardName) {
            return res.status(400).json({ success: false, error: 'User and award name are required' })
        }

        const result = objDb.prepare(
            `
            INSERT INTO awards (intUserId, strAwardName, strGranter, datReceived, strDescription)
            VALUES (?, ?, ?, ?, ?)
            `
        ).run(
            intUserId, strAwardName,
            strGranter || '', datReceived || '', strDescription || ''
        )

        res.json({ success: true, intAwardId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// PUT /api/awards/:id
router.put('/:id', (req, res) => {
    try {
        const { strAwardName, strGranter, datReceived, strDescription } = req.body

        const result = objDb.prepare(`
            UPDATE awards SET
                strAwardName   = COALESCE(?, strAwardName),
                strGranter     = COALESCE(?, strGranter),
                datReceived    = COALESCE(?, datReceived),
                strDescription = COALESCE(?, strDescription)
            WHERE intAwardId = ?
        `).run(
            strAwardName ?? null, strGranter ?? null,
            datReceived ?? null, strDescription ?? null, req.params.id
        )

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Award not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/awards/:id
router.delete('/:id', (req, res) => {
    try {
        const result = objDb.prepare('DELETE FROM awards WHERE intAwardId = ?').run(req.params.id)
        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Award not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router