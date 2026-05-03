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
    // TODO: Insert into jobs table, return intJobId
})

// PUT /api/jobs/:id - Update a job
router.put('/:id', (req, res) => {
    // TODO: Update job fields
})

// DELETE /api/jobs/:id - Delete a job (cascade deletes its details)
router.delete('/:id', (req, res) => {
    // TODO: Delete job by intJobId
})

// POST /api/jobs/:jobId/details - Add a responsibility/detail to a job
router.post('/:jobId/details', (req, res) => {
    // TODO: Insert into jobDetails table
})

// DELETE /api/jobs/details/:detailId - Remove a responsibility
router.delete('/details/:detailId', (req, res) => {
    // TODO: Delete from jobDetails
})

module.exports = router