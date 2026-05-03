require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Initialize the database (creates tables if they don't exist)
require('./database/db.js')

// Mount route handlers
app.use('/api/users', require('./routes/users.js'))
app.use('/api/jobs', require('./routes/jobs.js'))
app.use('/api/skills', require('./routes/skills.js'))
app.use('/api/certs', require('./routes/certs.js'))
app.use('/api/awards', require('./routes/awards.js'))
app.use('/api/resumes', require('./routes/resumes.js'))
app.use('/api/ai', require('./routes/ai.js'))

// Default route serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`ResumAi server running on http://localhost:${PORT}`)
})