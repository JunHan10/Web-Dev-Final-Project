# AI Usage Documentation

## Overview
- Asked GPT to give a list of concepts and tools that are expected to be used, so that I remember to include them.
- Asked GPT to explain the general structure of the project as well as how to structure the working directory for best navigation.
- Claude gave me a recommended project structure, I named and organized my files accordingly.
- LOTS of misc. debug help from Claude.
- LOTS of prompting Claude for help on syntax, logic, and structure.
- README was heavily AI generated, because why not...

## Models Used
- Claude Opus 4.7
- Claude Sonnet 4.6
- ChatGPT

## MCP Servers Used
None

## Specific Areas Where AI Helped
- Once I completed job.js end-to-end (most complicated out of the rest, creating job, adding job details and responsibilities, deleting job, editing job), Claude was prompted to copy the style and structure and apply to awards, certs, and skills. Since they were extremely similar, by doing so I only needed to change some variable names as well as re-route some endpoints. Making sure those functions are hooked up properly.
- Ran into some formatting errors, pasted consol error to Claude, restarted server and electron app and was fine.
- Gave Claude the TODO list for the resume feature and it gave me a guide to build out routes/resumes.js end-to-end. The POST endpoint wraps the resume insert and the four junction table inserts in a single transaction so a partial save can't leave orphan rows behind. The GET /:id endpoint runs a few smaller JOIN queries (one per section) and groups the rows in JS instead of doing one giant join, which Claude said would be more readable.
- Used Claude's help to build the resume builder UI in resumeBuilder.js. It fetches jobs, skills, certs, and awards in parallel using Promise.all, renders everything as checkboxes, and on Generate it collects the checked IDs and POSTs them. Had to make sure the section IDs in index.html lined up with what the script was looking for.
- Used Claude's help to build resumeRender.js to take the resume bundle from the API and render it as clean printable HTML, broken into Header, Experience, Skills, Certifications, Awards.
- For the print to PDF feature, Claude wrote a print.css that hides the navbar and the no-print buttons, sets letter size with half inch margins via @page, and adds page-break-inside: avoid on sections so a job's bullet list doesn't get split across pages.
- After swapping to the .all build, got "Swal is not defined" in the console. I had changed the script tag but the actual file in public/js/lib/ was still the old name, so the browser was 404ing and the catch-all was serving index.html back as the response. Renamed the file and it worked.
- Claude figured out why the Address line on the rendered resume was showing "&middot;" as literal text instead of a dot. I was running escHtml on the whole joined string, which was escaping the & in &middot; into &amp;middot;. Fix was to escape each part on its own and then join with the raw entity. 
- Relied heavily on Claude to write settings.js to save the Gemini API key from the Settings page. It PUTs to /api/users/:id with the new key. The field stays blank on every visit because the GET endpoint deliberately doesn't return the key (so it doesn't get echoed back over the wire).