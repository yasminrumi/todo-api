// Integration tests for the REST API.
// supertest sends real HTTP requests to the Express app,
// so the server does not need to be started with npm run dev.
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../../src/app.js'
import * as store from '../../src/todoStore.js'

// start every test from the same data
beforeEach(() => {
    store.reset()
})

// helper: creates a todo through the API and returns the response body
async function createTodo(data = { title: 'Test todo' }) {
    const res = await request(app).post('/todos').send(data)
    return res.body
}

describe('GET /', () => {
    test('returns 200 and status running', async () => {
        const res = await request(app).get('/')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { status: 'running' })
    })
})

describe('POST /todos', () => {
    test('creates a todo => 201 with Location header', async () => {
        const res = await request(app)
            .post('/todos')
            .send({ title: 'Write API documentation', description: 'README', state: 'todo', dueDate: '2026-12-31' })
        assert.equal(res.status, 201)
        assert.match(res.headers['content-type'], /application\/json/)
        assert.equal(res.headers.location, `/todos/${res.body.id}`)
        assert.equal(res.body.title, 'Write API documentation')
        assert.equal(res.body.dueDate, '2026-12-31')
    })

    test('creates a todo with only title, state defaults to todo => 201', async () => {
        const res = await request(app).post('/todos').send({ title: 'Buy groceries' })
        assert.equal(res.status, 201)
        assert.equal(res.body.state, 'todo')
        assert.equal(res.body.description, '')
    })

    test('the new todo can be found with GET', async () => {
        const created = await createTodo()
        const res = await request(app).get(`/todos/${created.id}`)
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, created)
    })

    test('malformed JSON => 400', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Content-Type', 'application/json')
            .send('{ "title": "Missing brace"')
        assert.equal(res.status, 400)
        assert.deepEqual(res.body, { error: 'Malformed JSON' })
    })

    test('missing title => 400', async () => {
        const res = await request(app).post('/todos').send({ description: 'No title' })
        assert.equal(res.status, 400)
        assert.equal(res.body.error, 'title is required and must be a non-empty string')
    })

    test('blank title => 400', async () => {
        const res = await request(app).post('/todos').send({ title: '   ' })
        assert.equal(res.status, 400)
    })

    test('description is not a string => 400', async () => {
        const res = await request(app).post('/todos').send({ title: 'Test', description: 123 })
        assert.equal(res.status, 400)
        assert.equal(res.body.error, 'description must be a string')
    })

    test('invalid state => 400', async () => {
        const res = await request(app).post('/todos').send({ title: 'Test', state: 'finished' })
        assert.equal(res.status, 400)
        assert.equal(res.body.error, 'state must be todo, doing or done')
    })

    test('invalid dueDate => 400', async () => {
        for (const dueDate of ['abc', '2026-02-30', false]) {
            const res = await request(app).post('/todos').send({ title: 'Test', dueDate })
            assert.equal(res.status, 400, `dueDate ${dueDate} should be rejected`)
        }
    })

    test('invalid todo is not saved', async () => {
        await request(app).post('/todos').send({ title: '' })
        const res = await request(app).get('/todos')
        assert.equal(res.body.length, 1)
    })

    test('unsupported charset => 415', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Content-Type', 'application/json; charset=latin1')
            .send('{ "title": "Test" }')
        assert.equal(res.status, 415)
    })

    test('unsupported content encoding => 415', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Content-Type', 'application/json')
            .set('Content-Encoding', 'compress')
            .send('{ "title": "Test" }')
        assert.equal(res.status, 415)
    })

    test('body over 100 kB => 413', async () => {
        const res = await request(app)
            .post('/todos')
            .send({ title: 'Large body', description: 'a'.repeat(200000) })
        assert.equal(res.status, 413)
        assert.deepEqual(res.body, { error: 'Request body too large' })
    })
})

describe('GET /todos', () => {
    test('returns all todos => 200', async () => {
        await createTodo({ title: 'Second' })
        const res = await request(app).get('/todos')
        assert.equal(res.status, 200)
        assert.ok(Array.isArray(res.body))
        assert.equal(res.body.length, 2)
    })

    test('filters by state => 200', async () => {
        await createTodo({ title: 'Doing one', state: 'doing' })
        const res = await request(app).get('/todos?state=doing')
        assert.equal(res.status, 200)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].title, 'Doing one')
    })

    test('invalid state filter => 400', async () => {
        const res = await request(app).get('/todos?state=finished')
        assert.equal(res.status, 400)
    })

    test('empty state filter => 400', async () => {
        const res = await request(app).get('/todos?state=')
        assert.equal(res.status, 400)
    })
})

describe('GET /todos/:id', () => {
    test('returns one todo => 200', async () => {
        const created = await createTodo()
        const res = await request(app).get(`/todos/${created.id}`)
        assert.equal(res.status, 200)
        assert.equal(res.body.id, created.id)
    })

    test('todo does not exist => 404', async () => {
        const res = await request(app).get('/todos/1000')
        assert.equal(res.status, 404)
        assert.deepEqual(res.body, { error: 'Todo not found' })
    })
})

describe('PUT /todos/:id', () => {
    test('updates a todo => 200', async () => {
        const created = await createTodo({ title: 'Old title' })
        const res = await request(app).put(`/todos/${created.id}`).send({ state: 'doing' })
        assert.equal(res.status, 200)
        assert.equal(res.body.state, 'doing')
        assert.equal(res.body.title, 'Old title')
    })

    test('the update is saved', async () => {
        const created = await createTodo()
        await request(app).put(`/todos/${created.id}`).send({ title: 'New title' })
        const res = await request(app).get(`/todos/${created.id}`)
        assert.equal(res.body.title, 'New title')
    })

    test('invalid state => 400', async () => {
        const created = await createTodo()
        const res = await request(app).put(`/todos/${created.id}`).send({ state: 'finished' })
        assert.equal(res.status, 400)
    })

    test('invalid dueDate => 400', async () => {
        const created = await createTodo()
        const res = await request(app).put(`/todos/${created.id}`).send({ dueDate: 0 })
        assert.equal(res.status, 400)
    })

    test('array body => 400', async () => {
        const created = await createTodo()
        const res = await request(app).put(`/todos/${created.id}`).send([])
        assert.equal(res.status, 400)
        assert.equal(res.body.error, 'Body must be a JSON object')
    })

    test('todo does not exist => 404', async () => {
        const res = await request(app).put('/todos/1000').send({ state: 'doing' })
        assert.equal(res.status, 404)
    })
})

describe('DELETE /todos/:id', () => {
    test('deletes a todo => 204, then GET => 404', async () => {
        const created = await createTodo()
        const res = await request(app).delete(`/todos/${created.id}`)
        assert.equal(res.status, 204)
        const after = await request(app).get(`/todos/${created.id}`)
        assert.equal(after.status, 404)
    })

    test('delete the same todo again => 404', async () => {
        const created = await createTodo()
        await request(app).delete(`/todos/${created.id}`)
        const res = await request(app).delete(`/todos/${created.id}`)
        assert.equal(res.status, 404)
    })
})
