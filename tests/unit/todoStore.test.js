// Unit tests for src/todoStore.js
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import * as store from '../../src/todoStore.js'

// start every test from the same data
beforeEach(() => {
    store.reset()
})

describe('reset and getAll', () => {
    test('starts with one todo', () => {
        assert.equal(store.getAll().length, 1)
        assert.equal(store.getAll()[0].title, 'Study REST APIs')
    })

    test('filters todos by state', () => {
        store.create({ title: 'A', state: 'doing' })
        store.create({ title: 'B', state: 'done' })
        assert.equal(store.getAll('doing').length, 1)
        assert.equal(store.getAll('doing')[0].title, 'A')
        assert.equal(store.getAll('todo').length, 1)
    })
})

describe('create', () => {
    test('creates a todo with an id and default values', () => {
        const todo = store.create({ title: 'New' })
        assert.equal(typeof todo.id, 'string')
        assert.equal(todo.title, 'New')
        assert.equal(todo.description, '')
        assert.equal(todo.state, 'todo')
        assert.equal(todo.dueDate, null)
        assert.equal(typeof todo.createdAt, 'number')
        assert.equal(store.getAll().length, 2)
    })

    test('trims the title and keeps the given fields', () => {
        const todo = store.create({ title: '  New  ', description: 'Text', state: 'done', dueDate: '2026-12-31' })
        assert.equal(todo.title, 'New')
        assert.equal(todo.description, 'Text')
        assert.equal(todo.state, 'done')
        assert.equal(todo.dueDate, '2026-12-31')
    })

    test('gives every todo a different id', () => {
        const a = store.create({ title: 'A' })
        const b = store.create({ title: 'B' })
        assert.notEqual(a.id, b.id)
    })
})

describe('getById', () => {
    test('returns the todo with the given id', () => {
        const created = store.create({ title: 'Find me' })
        assert.deepEqual(store.getById(created.id), created)
    })

    test('returns undefined for an id that does not exist', () => {
        assert.equal(store.getById('does-not-exist'), undefined)
    })
})

describe('update', () => {
    test('changes only the given fields', () => {
        const created = store.create({ title: 'Old', description: 'Keep' })
        const updated = store.update(created.id, { state: 'doing' })
        assert.equal(updated.state, 'doing')
        assert.equal(updated.title, 'Old')
        assert.equal(updated.description, 'Keep')
    })

    test('returns null for an id that does not exist', () => {
        assert.equal(store.update('does-not-exist', { state: 'done' }), null)
    })
})

describe('remove', () => {
    test('deletes the todo and returns true', () => {
        const created = store.create({ title: 'Delete me' })
        assert.equal(store.remove(created.id), true)
        assert.equal(store.getById(created.id), undefined)
    })

    test('returns false for an id that does not exist', () => {
        assert.equal(store.remove('does-not-exist'), false)
        assert.equal(store.getAll().length, 1)
    })
})
