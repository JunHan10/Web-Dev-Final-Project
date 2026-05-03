const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/skills/user/:userId - Get all skill categories with their skills
router.get('/user/:userId', (req, res) => {
    // TODO: Fetch categories where intUserId matches, attach arrSkills to each
})

// POST /api/skills/categories - Create a new skill category
router.post('/categories', (req, res) => {
    // TODO: Insert into skillCategories
})

// DELETE /api/skills/categories/:id - Delete a category and its skills
router.delete('/categories/:id', (req, res) => {
    // TODO: Delete from skillCategories
})

// POST /api/skills - Add a skill to a category
router.post('/', (req, res) => {
    // TODO: Insert into skills table
})

// DELETE /api/skills/:id - Remove a skill
router.delete('/:id', (req, res) => {
    // TODO: Delete from skills
})

module.exports = router