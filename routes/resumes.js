const express = require('express')
const router = express.Router()
const objDb = require('../database/db.js')

// GET /api/resumes/user/:userId - List all resumes for a user
router.get('/user/:userId', (req, res) => {
    try {
        const arrResumes = objDb.prepare(
            'SELECT * FROM resumes WHERE intUserId = ? ORDER BY datCreated DESC'
        ).all(req.params.userId)
        res.json({ success: true, resumes: arrResumes })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// POST /api/resumes - Create a new resume with selected items
router.post('/', (req, res) => {
    try {
        const {
            intUserId, strResumeName,
            arrSelectedDetailIds, arrSelectedSkillIds,
            arrSelectedCertIds, arrSelectedAwardIds
        } = req.body

        if (!intUserId || !strResumeName) {
            return res.status(400).json({ success: false, error: 'User and resume name are required' })
        }

        // Use a transaction to keep all inserts atomic
        const transaction = objDb.transaction(() => {
            const result = objDb.prepare(
                'INSERT INTO resumes (intUserId, strResumeName, datCreated) VALUES (?, ?, ?)'
            ).run(intUserId, strResumeName, new Date().toISOString())

            const intResumeId = result.lastInsertRowid

            const stmtDetail = objDb.prepare(
                'INSERT INTO resumeJobDetails (intResumeId, intDetailId) VALUES (?, ?)'
            )
            const stmtSkill = objDb.prepare(
                'INSERT INTO resumeSkills (intResumeId, intSkillId) VALUES (?, ?)'
            )
            const stmtCert = objDb.prepare(
                'INSERT INTO resumeCerts (intResumeId, intCertId) VALUES (?, ?)'
            )
            const stmtAward = objDb.prepare(
                'INSERT INTO resumeAwards (intResumeId, intAwardId) VALUES (?, ?)'
            );

            (arrSelectedDetailIds || []).forEach(id => stmtDetail.run(intResumeId, id));
            (arrSelectedSkillIds  || []).forEach(id => stmtSkill.run(intResumeId, id));
            (arrSelectedCertIds   || []).forEach(id => stmtCert.run(intResumeId, id));
            (arrSelectedAwardIds  || []).forEach(id => stmtAward.run(intResumeId, id))

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
    try {
        const intResumeId = req.params.id

        const objResume = objDb.prepare(
            'SELECT * FROM resumes WHERE intResumeId = ?'
        ).get(intResumeId)

        if (!objResume) {
            return res.status(404).json({ success: false, error: 'Resume not found' })
        }

        const objUser = objDb.prepare(`
            SELECT intUserId, strFirstName, strLastName, strEmail, strPhone,
                   strStreet1, strStreet2, strCity, strState, strZIP
            FROM users WHERE intUserId = ?
        `).get(objResume.intUserId)

        // Pull every selected job-detail along with its parent job in one shot,
        // then group rows by job in JS so the renderer gets a clean nested shape.
        const arrDetailRows = objDb.prepare(`
            SELECT jd.intDetailId, jd.strDetail,
                   j.intJobId, j.strCompany, j.strTitle, j.strLocation,
                   j.datStartDate, j.datEndDate
            FROM resumeJobDetails rjd
            JOIN jobDetails jd ON jd.intDetailId = rjd.intDetailId
            JOIN jobs       j  ON j.intJobId    = jd.intJobId
            WHERE rjd.intResumeId = ?
            ORDER BY j.datStartDate DESC, j.intJobId, jd.intDetailId
        `).all(intResumeId)

        const arrJobs = []
        const mapJobs = new Map()
        for (const row of arrDetailRows) {
            if (!mapJobs.has(row.intJobId)) {
                const objJob = {
                    intJobId: row.intJobId,
                    strCompany: row.strCompany,
                    strTitle: row.strTitle,
                    strLocation: row.strLocation,
                    datStartDate: row.datStartDate,
                    datEndDate: row.datEndDate,
                    arrDetails: []
                }
                mapJobs.set(row.intJobId, objJob)
                arrJobs.push(objJob)
            }
            mapJobs.get(row.intJobId).arrDetails.push({
                intDetailId: row.intDetailId,
                strDetail: row.strDetail
            })
        }

        // Selected skills, joined back to their category for grouping
        const arrSkillRows = objDb.prepare(`
            SELECT s.intSkillId, s.strSkillName,
                   sc.intCategoryId, sc.strCategoryName
            FROM resumeSkills rs
            JOIN skills          s  ON s.intSkillId    = rs.intSkillId
            JOIN skillCategories sc ON sc.intCategoryId = s.intCategoryId
            WHERE rs.intResumeId = ?
            ORDER BY sc.strCategoryName, s.strSkillName
        `).all(intResumeId)

        const arrSkillCategories = []
        const mapCats = new Map()
        for (const row of arrSkillRows) {
            if (!mapCats.has(row.intCategoryId)) {
                const objCat = {
                    intCategoryId: row.intCategoryId,
                    strCategoryName: row.strCategoryName,
                    arrSkills: []
                }
                mapCats.set(row.intCategoryId, objCat)
                arrSkillCategories.push(objCat)
            }
            mapCats.get(row.intCategoryId).arrSkills.push({
                intSkillId: row.intSkillId,
                strSkillName: row.strSkillName
            })
        }

        const arrCerts = objDb.prepare(`
            SELECT c.* FROM resumeCerts rc
            JOIN certs c ON c.intCertId = rc.intCertId
            WHERE rc.intResumeId = ?
            ORDER BY c.datEarned DESC
        `).all(intResumeId)

        const arrAwards = objDb.prepare(`
            SELECT a.* FROM resumeAwards ra
            JOIN awards a ON a.intAwardId = ra.intAwardId
            WHERE ra.intResumeId = ?
            ORDER BY a.datReceived DESC
        `).all(intResumeId)

        res.json({
            success: true,
            resume: objResume,
            user: objUser,
            jobs: arrJobs,
            skillCategories: arrSkillCategories,
            certs: arrCerts,
            awards: arrAwards
        })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// DELETE /api/resumes/:id - cascades to junction tables
router.delete('/:id', (req, res) => {
    try {
        const result = objDb.prepare(
            'DELETE FROM resumes WHERE intResumeId = ?'
        ).run(req.params.id)

        if (result.changes > 0) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Resume not found' })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router
