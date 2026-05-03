const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/jobs/user/:userId - Get all jobs for a user with their details
router.get('/user/:userId', (req, res) => {
    try {
        const arrJobs = objDb.prepare(
            'SELECT * FROM jobs WHERE intUserId = ?'
        ).all(req.params.userId)
        
        // Attach details to each job
        arrJobs.forEach(objJob => {
            objJob.arrDetails = objDb.prepare(
                'SELECT * FROM jobDetails WHERE intJobId = ?'
            ).all(objJob.intJobId)
        })
        
        res.json({ success: true, jobs: arrJobs })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/jobs - Create a new job
router.post('/', (req, res) => {
    try {
        const { intUserId, strCompany, strTitle, strLocation, datStartDate, datEndDate } = req.body

        if (!intUserId || !strCompany || !strTitle) {
            return res.status(400).json({ success: false, error: 'User, company, and title are required' })
        }

        const result = objDb.prepare(`
            INSERT INTO jobs (intUserId, strCompany, strTitle, strLocation, datStartDate, datEndDate)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            intUserId, strCompany, strTitle,
            strLocation || '', datStartDate || '', datEndDate || ''
        )

        res.json({ success: true, intJobId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// PUT /api/jobs/:id - Update a job
router.put('/:id', (req, res) => {
    try {
        const { strCompany, strTitle, strLocation, datStartDate, datEndDate } = req.body

        const result = objDb.prepare(`
            UPDATE jobs SET
                strCompany    = COALESCE(?, strCompany),
                strTitle      = COALESCE(?, strTitle),
                strLocation   = COALESCE(?, strLocation),
                datStartDate  = COALESCE(?, datStartDate),
                datEndDate    = COALESCE(?, datEndDate)
            WHERE intJobId = ?
        `).run(
            strCompany ?? null, strTitle ?? null, strLocation ?? null,
            datStartDate ?? null, datEndDate ?? null, req.params.id
        )

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Job not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/jobs/:id - Delete a job (cascade deletes its details)
router.delete('/:id', (req, res) => {
    try {
        const result = objDb.prepare('DELETE FROM jobs WHERE intJobId = ?').run(req.params.id)
        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Job not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/jobs/:jobId/details - Add a responsibility/detail to a job
router.post('/:jobId/details', (req, res) => {
    try {
        const { strDetail } = req.body
        if (!strDetail) {
            return res.status(400).json({ success: false, error: 'Detail text is required' })
        }

        const result = objDb.prepare(
            'INSERT INTO jobDetails (intJobId, strDetail) VALUES (?, ?)'
        ).run(req.params.jobId, strDetail)

        res.json({ success: true, intDetailId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/jobs/details/:detailId - Remove a responsibility
router.delete('/details/:detailId', (req, res) => {
    try {
        const result = objDb.prepare(
            'DELETE FROM jobDetails WHERE intDetailId = ?'
        ).run(req.params.detailId)

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Detail not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router