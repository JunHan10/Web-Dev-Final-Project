const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/skills/user/:userId - Get all skill categories with their skills
router.get('/user/:userId', (req, res) => {
    try {
        const arrCategories = objDb.prepare(
            'SELECT * FROM skillCategories WHERE intUserId = ?'
        ).all(req.params.userId)

        arrCategories.forEach(objCat => {
            objCat.arrSkills = objDb.prepare(
                'SELECT * FROM skills WHERE intCategoryId = ?'
            ).all(objCat.intCategoryId)
        })

        res.json({ success: true, categories: arrCategories })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/skills/categories - Create a new skill category
router.post('/categories', (req, res) => {
    try {
        const { intUserId, strCategoryName } = req.body

        if (!intUserId || !strCategoryName) {
            return res.status(400).json({ success: false, error: 'User and category name are required' })
        }

        const result = objDb.prepare(
            'INSERT INTO skillCategories (intUserId, strCategoryName) VALUES (?, ?)'
        ).run(intUserId, strCategoryName)

        res.json({ success: true, intCategoryId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// PUT /api/skills/categories/:id - Rename a category
router.put('/categories/:id', (req, res) => {
    try {
        const { strCategoryName } = req.body

        const result = objDb.prepare(
            'UPDATE skillCategories SET strCategoryName = COALESCE(?, strCategoryName) WHERE intCategoryId = ?'
        ).run(strCategoryName ?? null, req.params.id)

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Category not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/skills/categories/:id - Delete a category and its skills
router.delete('/categories/:id', (req, res) => {
    try {
        const result = objDb.prepare(
            'DELETE FROM skillCategories WHERE intCategoryId = ?'
        ).run(req.params.id)

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Category not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/skills - Add a skill to a category
router.post('/', (req, res) => {
    try {
        const { intCategoryId, strSkillName } = req.body

        if (!intCategoryId || !strSkillName) {
            return res.status(400).json({ success: false, error: 'Category and skill name are required' })
        }

        const result = objDb.prepare(
            'INSERT INTO skills (intCategoryId, strSkillName) VALUES (?, ?)'
        ).run(intCategoryId, strSkillName)

        res.json({ success: true, intSkillId: result.lastInsertRowid })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/skills/:id - Remove a skill
router.delete('/:id', (req, res) => {
    try {
        const result = objDb.prepare('DELETE FROM skills WHERE intSkillId = ?').run(req.params.id)
        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Skill not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router
