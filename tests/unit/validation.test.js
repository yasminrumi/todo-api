// Unit tests for src/validation.js
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { isValidDate, isValidState, validate } from '../../src/validation.js'

describe('isValidDate', () => {
    test('accepts a real date in format YYYY-MM-DD', () => {
        assert.equal(isValidDate('2026-12-31'), true)
        assert.equal(isValidDate('2028-02-29'), true) // leap year
    })

    test('rejects impossible dates', () => {
        assert.equal(isValidDate('2026-02-30'), false)
        assert.equal(isValidDate('2026-02-29'), false) // not a leap year
        assert.equal(isValidDate('2026-13-01'), false)
    })

    test('rejects text in the wrong format', () => {
        assert.equal(isValidDate('abc'), false)
        assert.equal(isValidDate('2026-1-5'), false)
        assert.equal(isValidDate('31.12.2026'), false)
        assert.equal(isValidDate(''), false)
    })

    test('rejects values that are not strings', () => {
        assert.equal(isValidDate(0), false)
        assert.equal(isValidDate(false), false)
        assert.equal(isValidDate(null), false)
        assert.equal(isValidDate(undefined), false)
    })
})

describe('isValidState', () => {
    test('accepts todo, doing and done', () => {
        assert.equal(isValidState('todo'), true)
        assert.equal(isValidState('doing'), true)
        assert.equal(isValidState('done'), true)
    })

    test('rejects other values', () => {
        assert.equal(isValidState('finished'), false)
        assert.equal(isValidState(''), false)
        assert.equal(isValidState('TODO'), false)
        assert.equal(isValidState(undefined), false)
    })
})

describe('validate for a new todo (POST)', () => {
    test('returns null for valid data with all fields', () => {
        const data = { title: 'Test', description: 'Text', state: 'doing', dueDate: '2026-12-31' }
        assert.equal(validate(data, true), null)
    })

    test('returns null when only title is given', () => {
        assert.equal(validate({ title: 'Test' }, true), null)
    })

    test('returns null when dueDate is null', () => {
        assert.equal(validate({ title: 'Test', dueDate: null }, true), null)
    })

    test('returns an error when body is not an object', () => {
        assert.equal(validate([], true), 'Body must be a JSON object')
        assert.equal(validate(null, true), 'Body must be a JSON object')
        assert.equal(validate('text', true), 'Body must be a JSON object')
    })

    test('returns an error when title is missing or blank', () => {
        const message = 'title is required and must be a non-empty string'
        assert.equal(validate({}, true), message)
        assert.equal(validate({ title: '   ' }, true), message)
        assert.equal(validate({ title: 123 }, true), message)
    })

    test('returns an error when description is not a string', () => {
        assert.equal(validate({ title: 'Test', description: 123 }, true), 'description must be a string')
    })

    test('returns an error when state is not allowed', () => {
        assert.equal(validate({ title: 'Test', state: 'finished' }, true), 'state must be todo, doing or done')
    })

    test('returns an error when dueDate is invalid', () => {
        const message = 'dueDate must be a valid date in format YYYY-MM-DD'
        assert.equal(validate({ title: 'Test', dueDate: 'abc' }, true), message)
        assert.equal(validate({ title: 'Test', dueDate: '2026-02-30' }, true), message)
        assert.equal(validate({ title: 'Test', dueDate: false }, true), message)
    })
})

describe('validate for an update (PUT)', () => {
    test('title is not required', () => {
        assert.equal(validate({ state: 'done' }, false), null)
        assert.equal(validate({}, false), null)
    })

    test('title must still be a non-empty string if it is given', () => {
        assert.equal(validate({ title: '' }, false), 'title is required and must be a non-empty string')
    })

    test('returns an error for invalid fields', () => {
        assert.equal(validate({ state: 'finished' }, false), 'state must be todo, doing or done')
        assert.equal(validate({ dueDate: 0 }, false), 'dueDate must be a valid date in format YYYY-MM-DD')
        assert.equal(validate([], false), 'Body must be a JSON object')
    })
})
