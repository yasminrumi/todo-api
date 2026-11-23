// OpenAPI description (OAD) of the Todo API.
// Shown as a Swagger page at http://localhost:3000/doc

const id = { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Todo id (UUID)' }
const error = { content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
const todo = { content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } }
const states = ['todo', 'doing', 'done']

export default {
    openapi: '3.0.3',
    info: {
        title: 'Todo REST API',
        version: '1.0.0',
        description: 'A REST API for a Todo list, built with Node.js and Express.'
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [{ name: 'Todos', description: 'Operations on Todo items' }],
    paths: {
        '/todos': {
            get: {
                tags: ['Todos'],
                summary: 'Get all todos',
                description: 'Returns JSON by default, or CSV when the request has the header Accept: text/csv.',
                parameters: [{
                    name: 'state', in: 'query', required: false,
                    description: 'Filter todos by state',
                    schema: { type: 'string', enum: states }
                }],
                responses: {
                    200: {
                        description: 'List of todos',
                        content: {
                            'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Todo' } } },
                            'text/csv': {
                                schema: { type: 'string' },
                                example: 'id,title,description,state,dueDate,createdAt,updatedAt\n' +
                                    '3f1c...,"Study REST APIs","Read a dissertation",todo,,1794615838639,1794615838639'
                            }
                        }
                    },
                    400: { description: 'Invalid state filter', ...error },
                    406: { description: 'Requested format is not supported', ...error }
                }
            },
            post: {
                tags: ['Todos'],
                summary: 'Create a todo',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/NewTodo' } } }
                },
                responses: {
                    201: { description: 'Todo created. The Location header has the URL of the new todo.', ...todo },
                    400: { description: 'Invalid input or malformed JSON', ...error },
                    413: { description: 'Request body is bigger than 100 kB', ...error },
                    415: { description: 'Unsupported charset or content encoding', ...error }
                }
            }
        },
        '/todos/{id}': {
            get: {
                tags: ['Todos'],
                summary: 'Get one todo',
                parameters: [id],
                responses: {
                    200: { description: 'The todo', ...todo },
                    404: { description: 'Todo not found', ...error }
                }
            },
            put: {
                tags: ['Todos'],
                summary: 'Update a todo (only the given fields are changed)',
                parameters: [id],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTodo' } } }
                },
                responses: {
                    200: { description: 'The updated todo', ...todo },
                    400: { description: 'Invalid input', ...error },
                    404: { description: 'Todo not found', ...error }
                }
            },
            delete: {
                tags: ['Todos'],
                summary: 'Delete a todo',
                parameters: [id],
                responses: {
                    204: { description: 'Todo deleted' },
                    404: { description: 'Todo not found', ...error }
                }
            }
        }
    },
    components: {
        schemas: {
            Todo: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '3f1c2b9e-1a2b-4c3d-9e8f-123456789abc' },
                    title: { type: 'string', example: 'Study REST APIs' },
                    description: { type: 'string', example: 'Read a dissertation by Roy Fielding' },
                    state: { type: 'string', enum: states, example: 'todo' },
                    dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31' },
                    createdAt: { type: 'integer', example: 1794615838639 },
                    updatedAt: { type: 'integer', example: 1794615838639 }
                }
            },
            NewTodo: {
                type: 'object',
                required: ['title'],
                properties: {
                    title: { type: 'string', example: 'Write API documentation' },
                    description: { type: 'string', example: 'OpenAPI + README examples' },
                    state: { type: 'string', enum: states, default: 'todo' },
                    dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31' }
                }
            },
            UpdateTodo: {
                type: 'object',
                properties: {
                    title: { type: 'string', example: 'New title' },
                    description: { type: 'string' },
                    state: { type: 'string', enum: states, example: 'doing' },
                    dueDate: { type: 'string', format: 'date', nullable: true }
                }
            },
            Error: {
                type: 'object',
                properties: { error: { type: 'string', example: 'Todo not found' } }
            }
        }
    }
}
