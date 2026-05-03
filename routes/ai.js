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
        
        // Build a prompt based on the content type. Each type gets a focused
        // ask so the model doesn't waste tokens on generic resume advice.
        const objPrompts = {
            job_responsibility:
                'Review this resume bullet for a past job. Suggest a stronger rewrite that leads with an action verb and includes a quantifiable result if one is implied. Note any vague phrasing.',
            skill:
                'Review this skill entry. Say whether it is specific enough to belong on a resume; if it is too vague (e.g. "good with computers"), suggest a more concrete phrasing.',
            cert:
                'Review this certification entry. Comment on how to phrase it for a resume (full credential name, issuer, date) and whether it is worth listing for a typical software/engineering role.',
            award:
                'Review this award entry. Suggest a one-line phrasing that names the award, the granter, and what it recognized — concise enough for a resume bullet.'
        }
        const strInstruction = objPrompts[strContentType]
            || `Review this ${strContentType} entry and suggest specific resume-ready improvements.`

        // Quote-safe interpolation: replace " in user content so it can't break the JSON-ish prompt frame
        const strSafeContent = String(strContent).replace(/"/g, '\\"')
        const strPrompt = `You are a resume writing coach. ${strInstruction} Keep feedback under 100 words.\n\nContent: "${strSafeContent}"`
        
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