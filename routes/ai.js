const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// POST /api/ai/review - Send content to Gemini for feedback
router.post('/review', async (req, res) => {
    try {
        const { intUserId, strContent, strContentType } = req.body
        
        // Get the user's stored Gemini API key (or fall back to env for dev)
        const objUser = objDb.prepare(
            'SELECT strGeminiApiKey FROM users WHERE intUserId = ?'
        ).get(intUserId)
        
        const strApiKey = (objUser && objUser.strGeminiApiKey) || process.env.GEMINI_API_KEY
        
        if (!strApiKey) {
            return res.status(400).json({
                success: false,
                error: 'No Gemini API key configured. Add one in Settings.'
            })
        }
        
        // Build a prompt based on the content type
        // TODO: Customize prompts for jobs, skills, certs, awards
        const strPrompt = `You are a resume writing coach. Review this ${strContentType} entry and suggest specific improvements for clarity, action verbs, and quantifiable results. Keep feedback under 100 words.\n\nContent: "${strContent}"`
        
        // Call Gemini API
        const objResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${strApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: strPrompt }] }]
                })
            }
        )
        
        const objData = await objResponse.json()
        
        if (objData.candidates && objData.candidates[0]) {
            const strFeedback = objData.candidates[0].content.parts[0].text
            res.json({ success: true, feedback: strFeedback })
        } else {
            res.status(500).json({ success: false, error: 'No response from Gemini', details: objData })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router