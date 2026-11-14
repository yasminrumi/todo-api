// Validation functions for todos.
// Moved out of routes/todos.js so they can be unit tested without Express.

export const states = ['todo', 'doing', 'done']

// true if value is a real date in format YYYY-MM-DD, e.g. "2026-12-31"
export function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false
    const date = new Date(value)
    // "2026-02-30" becomes March 2, so it does not match the original text
    return !isNaN(date) && date.toISOString().slice(0, 10) === value
}

// true if value is one of the allowed states
export function isValidState(value) {
    return states.includes(value)
}

// returns an error message, or null if the data is valid
// isNew = true for POST (title required), false for PUT (all fields optional)
export function validate(data, isNew) {
    if (!data || typeof data !== 'object' || Array.isArray(data))
        return "Body must be a JSON object"
    if ((isNew || data.title !== undefined) && (typeof data.title !== 'string' || data.title.trim() === ''))
        return "title is required and must be a non-empty string"
    if (data.description !== undefined && typeof data.description !== 'string')
        return "description must be a string"
    if (data.state !== undefined && !isValidState(data.state))
        return "state must be todo, doing or done"
    if (data.dueDate !== undefined && data.dueDate !== null && !isValidDate(data.dueDate))
        return "dueDate must be a valid date in format YYYY-MM-DD"
    return null
}
