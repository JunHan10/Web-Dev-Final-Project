// Shared utility functions used across the front-end.
// Loaded before any other app script in index.html so every file can rely on
// these being defined.

// Escape HTML so user-provided strings can't break out of attributes/markup
function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// Format a "YYYY-MM" or "YYYY-MM-DD" string for display
function fmtJobDate(str) {
    if (!str) return 'Present'
    return str
}
