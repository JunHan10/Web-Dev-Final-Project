const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/resumes/user/:userId - List all resumes for a user
router.get('/user/:userId', (req, res) => {
    // TODO: SELECT from resumes WHERE intUserId
})

// POST /api/resumes - Create a new resume with selected items
router.post('/', (req, res) => {
    try {
        const {
            intUserId, strResumeName,
            arrSelectedDetailIds, arrSelectedSkillIds,
            arrSelectedCertIds, arrSelectedAwardIds
        } = req.body
        
        // Use a transaction to keep all inserts atomic
        const transaction = objDb.transaction(() => {
            const result = objDb.prepare(
                'INSERT INTO resumes (intUserId, strResumeName, datCreated) VALUES (?, ?, ?)'
            ).run(intUserId, strResumeName, new Date().toISOString())
            
            const intResumeId = result.lastInsertRowid
            
            // TODO: Loop through arrSelectedDetailIds and insert into resumeJobDetails
            // TODO: Loop through arrSelectedSkillIds and insert into resumeSkills
            // TODO: Loop through arrSelectedCertIds and insert into resumecerts
            // TODO: Loop through arrSelectedAwardIds and insert into resumeAwards
            
            return intResumeId
        })
        
        const intNewId = transaction()
        res.json({ success: true, intResumeId: intNewId })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// GET /api/resumes/:id - Get the full resume with all selected items joined
router.get('/:id', (req, res) => {
    // TODO: This is the big query - join across all tables to get
    //       user info + selected jobs/details + skills + certs + awards
    //       Return everything needed to render the resume on screen
})

// DELETE /api/resumes/:id
router.delete('/:id', (req, res) => {
    // TODO: Delete resume (cascades to junction tables)
})

module.exports = router