// Data access for todos (simulates a database).
// Moved out of routes/todos.js so the logic can be unit tested
// and the data can be reset between tests.
import { v4 as uuidv4 } from 'uuid'

let todos = []

// the starting data of the application
function seed() {
    return [
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
}

// put the data back to the starting state (used by the tests)
export function reset() {
    todos = seed()
}

// returns all todos, or only the todos with the given state
export function getAll(state) {
    if (state === undefined)
        return todos
    return todos.filter(anItem => anItem.state === state)
}

// returns the todo, or undefined if it does not exist
export function getById(id) {
    return todos.find(anItem => anItem.id === id)
}

// creates a new todo from valid data and returns it
export function create(data) {
    const todo = {
        id: uuidv4(),
        title: data.title.trim(),
        description: data.description || '',
        state: data.state || 'todo',
        dueDate: data.dueDate || null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
    todos.push(todo)
    return todo
}

// updates the given fields and returns the todo, or null if it does not exist
export function update(id, data) {
    const todo = getById(id)
    if (!todo)
        return null
    const { title, description, state, dueDate } = data
    if (title !== undefined) todo.title = title.trim()
    if (description !== undefined) todo.description = description
    if (state !== undefined) todo.state = state
    if (dueDate !== undefined) todo.dueDate = dueDate
    todo.updatedAt = Date.now()
    return todo
}

// deletes the todo, returns true if it was deleted, false if it did not exist
export function remove(id) {
    const fid = todos.findIndex(anItem => anItem.id === id)
    if (fid === -1)
        return false
    todos.splice(fid, 1)
    return true
}

reset()
