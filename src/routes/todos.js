import express from 'express'
// requires npm install uuid
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

const states = ['todo', 'doing', 'done']

// simulate the database
let todos = [
    {
        id: uuidv4(),
        title: 'Study REST APIs',
        description: 'Read a dissertation by Roy Fielding',
        state: 'todo',
        dueDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
]

// true if value is a real date in format YYYY-MM-DD, e.g. "2026-12-31"
function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false
    const date = new Date(value)
    // "2026-02-30" becomes March 2, so it does not match the original text
    return !isNaN(date) && date.toISOString().slice(0, 10) === value
}

// returns an error message, or null if the data is valid
function validate(data, isNew) {
    if (!data || typeof data !== 'object' || Array.isArray(data))
        return "Body must be a JSON object"
    if ((isNew || data.title !== undefined) && (typeof data.title !== 'string' || data.title.trim() === ''))
        return "title is required and must be a non-empty string"
    if (data.description !== undefined && typeof data.description !== 'string')
        return "description must be a string"
    if (data.state !== undefined && !states.includes(data.state))
        return "state must be todo, doing or done"
    if (data.dueDate !== undefined && data.dueDate !== null && !isValidDate(data.dueDate))
        return "dueDate must be a valid date in format YYYY-MM-DD"
    return null
}

// GET /todos and GET /todos?state=doing
router.get('/', (req, res) => {
    const state = req.query.state
    if (state === undefined)
        return res.json(todos)
    if (!states.includes(state))
        return res.status(400).json({ error: "state must be todo, doing or done" })
    res.json(todos.filter(anItem => anItem.state === state))
})

// GET /todos/:id
router.get('/:id', (req, res) => {
    const todo = todos.find(anItem => anItem.id === req.params.id)
    if (!todo)
        return res.status(404).json({ error: "Todo not found" })
    res.json(todo)
})

// POST /todos
router.post('/', (req, res) => {
    const error = validate(req.body, true)
    if (error)
        return res.status(400).json({ error })

    const todo = {
        id: uuidv4(),
        title: req.body.title.trim(),
        description: req.body.description || '',
        state: req.body.state || 'todo',
        dueDate: req.body.dueDate || null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
    todos.push(todo)
    res.status(201).location(`/todos/${todo.id}`).json(todo)
})

// PUT /todos/:id
router.put('/:id', (req, res) => {
    const fid = todos.findIndex(anItem => anItem.id === req.params.id)
    if (fid === -1)
        return res.status(404).json({ error: "Todo not found" })

    const error = validate(req.body, false)
    if (error)
        return res.status(400).json({ error })

    const { title, description, state, dueDate } = req.body
    if (title !== undefined) todos[fid].title = title.trim()
    if (description !== undefined) todos[fid].description = description
    if (state !== undefined) todos[fid].state = state
    if (dueDate !== undefined) todos[fid].dueDate = dueDate
    todos[fid].updatedAt = Date.now()

    res.json(todos[fid])
})

// DELETE /todos/:id
router.delete('/:id', (req, res) => {
    const fid = todos.findIndex(anItem => anItem.id === req.params.id)
    if (fid === -1)
        return res.status(404).json({ error: "Todo not found" })

    todos.splice(fid, 1)
    res.status(204).send()
})

export default router