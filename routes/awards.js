const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/awards/user/:userId
router.get('/user/:userId', (req, res) => {
    // TODO: Get all awards for a user
})

// POST /api/awards
router.post('/', (req, res) => {
    // TODO: Insert new award
})

// PUT /api/awards/:id
router.put('/:id', (req, res) => {
    // TODO: Update award
})

// DELETE /api/awards/:id
router.delete('/:id', (req, res) => {
    // TODO: Delete award
})

module.exports = router