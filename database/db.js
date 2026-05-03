const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

// Open or create the database file
const objDb = new Database(path.join(__dirname, 'resume.db'))

// Enable foreign key constraints
objDb.pragma('foreign_keys = ON')

// Run schema.sql to create tables if they don't already exist
const strSchema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
objDb.exec(strSchema)

console.log('Database initialized')

module.exports = objDb