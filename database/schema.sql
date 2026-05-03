-- Users table
CREATE TABLE IF NOT EXISTS users (
    intUserId INTEGER PRIMARY KEY AUTOINCREMENT,
    strFirstName TEXT NOT NULL,
    strLastName TEXT NOT NULL,
    strEmail TEXT UNIQUE NOT NULL,
    strPasswordHash TEXT NOT NULL,
    strPhone TEXT,
    strStreet1 TEXT,
    strStreet2 TEXT,
    strCity TEXT,
    strState TEXT,
    strZIP TEXT,
    strGeminiApiKey TEXT
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    intJobId INTEGER PRIMARY KEY AUTOINCREMENT,
    intUserId INTEGER NOT NULL,
    strCompany TEXT NOT NULL,
    strTitle TEXT NOT NULL,
    strLocation TEXT,
    datStartDate TEXT,
    datEndDate TEXT,
    FOREIGN KEY (intUserId) REFERENCES users(intUserId) ON DELETE CASCADE
);

-- Job responsibilities/details
CREATE TABLE IF NOT EXISTS jobDetails (
    intDetailId INTEGER PRIMARY KEY AUTOINCREMENT,
    intJobId INTEGER NOT NULL,
    strDetail TEXT NOT NULL,
    FOREIGN KEY (intJobId) REFERENCES jobs(intJobId) ON DELETE CASCADE
);

-- Skill categories
CREATE TABLE IF NOT EXISTS skillCategories (
    intCategoryId INTEGER PRIMARY KEY AUTOINCREMENT,
    intUserId INTEGER NOT NULL,
    strCategoryName TEXT NOT NULL,
    FOREIGN KEY (intUserId) REFERENCES users(intUserId) ON DELETE CASCADE
);

-- Individual skills within categories
CREATE TABLE IF NOT EXISTS skills (
    intSkillId INTEGER PRIMARY KEY AUTOINCREMENT,
    intCategoryId INTEGER NOT NULL,
    strSkillName TEXT NOT NULL,
    FOREIGN KEY (intCategoryId) REFERENCES skillCategories(intCategoryId) ON DELETE CASCADE
);

-- certs
CREATE TABLE IF NOT EXISTS certs (
    intCertId INTEGER PRIMARY KEY AUTOINCREMENT,
    intUserId INTEGER NOT NULL,
    strCertName TEXT NOT NULL,
    strIssuer TEXT,
    datEarned TEXT,
    FOREIGN KEY (intUserId) REFERENCES users(intUserId) ON DELETE CASCADE
);

-- Awards
CREATE TABLE IF NOT EXISTS awards (
    intAwardId INTEGER PRIMARY KEY AUTOINCREMENT,
    intUserId INTEGER NOT NULL,
    strAwardName TEXT NOT NULL,
    strGranter TEXT,
    datReceived TEXT,
    strDescription TEXT,
    FOREIGN KEY (intUserId) REFERENCES users(intUserId) ON DELETE CASCADE
);

-- Resumes (a saved selection of items)
CREATE TABLE IF NOT EXISTS resumes (
    intResumeId INTEGER PRIMARY KEY AUTOINCREMENT,
    intUserId INTEGER NOT NULL,
    strResumeName TEXT NOT NULL,
    datCreated TEXT,
    FOREIGN KEY (intUserId) REFERENCES users(intUserId) ON DELETE CASCADE
);

-- Junction tables: which items belong to which resume
CREATE TABLE IF NOT EXISTS resumeJobDetails (
    intResumeId INTEGER,
    intDetailId INTEGER,
    PRIMARY KEY (intResumeId, intDetailId),
    FOREIGN KEY (intResumeId) REFERENCES resumes(intResumeId) ON DELETE CASCADE,
    FOREIGN KEY (intDetailId) REFERENCES jobDetails(intDetailId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumeSkills (
    intResumeId INTEGER,
    intSkillId INTEGER,
    PRIMARY KEY (intResumeId, intSkillId),
    FOREIGN KEY (intResumeId) REFERENCES resumes(intResumeId) ON DELETE CASCADE,
    FOREIGN KEY (intSkillId) REFERENCES skills(intSkillId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumecerts (
    intResumeId INTEGER,
    intCertId INTEGER,
    PRIMARY KEY (intResumeId, intCertId),
    FOREIGN KEY (intResumeId) REFERENCES resumes(intResumeId) ON DELETE CASCADE,
    FOREIGN KEY (intCertId) REFERENCES certs(intCertId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumeAwards (
    intResumeId INTEGER,
    intAwardId INTEGER,
    PRIMARY KEY (intResumeId, intAwardId),
    FOREIGN KEY (intResumeId) REFERENCES resumes(intResumeId) ON DELETE CASCADE,
    FOREIGN KEY (intAwardId) REFERENCES awards(intAwardId) ON DELETE CASCADE
);