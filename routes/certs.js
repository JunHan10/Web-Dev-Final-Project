const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/certifications/user/:userId
router.get('/user/:userId', (req, res) => {
    // TODO: Get all certs for a user
})

// POST /api/certifications
router.post('/', (req, res) => {
    // TODO: Insert new cert
})

// PUT /api/certifications/:id
router.put('/:id', (req, res) => {
    // TODO: Update cert
})

// DELETE /api/certifications/:id
router.delete('/:id', (req, res) => {
    // TODO: Delete cert
})

module.exports = router