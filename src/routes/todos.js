import express from 'express'
import { validate, isValidState } from '../validation.js'
import * as store from '../todoStore.js'

// The routes only handle HTTP: read the request, call the store,
// and send the response. Validation and data logic are in their own modules.
const router = express.Router()

// GET /todos and GET /todos?state=doing
router.get('/', (req, res) => {
    const state = req.query.state
    if (state !== undefined && !isValidState(state))
        return res.status(400).json({ error: "state must be todo, doing or done" })
    res.json(store.getAll(state))
})

// GET /todos/:id
router.get('/:id', (req, res) => {
    const todo = store.getById(req.params.id)
    if (!todo)
        return res.status(404).json({ error: "Todo not found" })
    res.json(todo)
})

// POST /todos
router.post('/', (req, res) => {
    const error = validate(req.body, true)
    if (error)
        return res.status(400).json({ error })

    const todo = store.create(req.body)
    res.status(201).location(`/todos/${todo.id}`).json(todo)
})

// PUT /todos/:id
router.put('/:id', (req, res) => {
    if (!store.getById(req.params.id))
        return res.status(404).json({ error: "Todo not found" })

    const error = validate(req.body, false)
    if (error)
        return res.status(400).json({ error })

    res.json(store.update(req.params.id, req.body))
})

// DELETE /todos/:id
router.delete('/:id', (req, res) => {
    if (!store.remove(req.params.id))
        return res.status(404).json({ error: "Todo not found" })
    res.status(204).send()
})

export default router
