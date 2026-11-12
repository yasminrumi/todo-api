import express from 'express'

import indexRouter from './routes/index.js'
import todosRouter from './routes/todos.js'

const app = express()

// support for json
app.use(express.json())

// define handlers for various routes
app.use('/', indexRouter)
app.use('/todos', todosRouter)

// error handler
app.use((err, req, res, next) => {
    // malformed JSON body => 400 Bad Request
    if (err.type === 'entity.parse.failed')
        return res.status(400).json({ error: "Malformed JSON" })
    // body is bigger than the limit (100 kB) => 413 Payload Too Large
    if (err.type === 'entity.too.large')
        return res.status(413).json({ error: "Request body too large" })
    // unsupported charset or content encoding => 415 Unsupported Media Type
    if (err.type === 'charset.unsupported' || err.type === 'encoding.unsupported')
        return res.status(415).json({ error: "Unsupported charset or content encoding" })
    // any other error => 500 Internal Server Error
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
})

// export the app object to server.js where we referred to this
export default app