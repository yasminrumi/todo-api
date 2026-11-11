import express from 'express'

import indexRouter from './routes/index.js'
import todosRouter from './routes/todos.js'

const app = express()

// support for json
app.use(express.json())

// define handlers for various routes
app.use('/', indexRouter)
app.use('/todos', todosRouter)

// malformed JSON body => 400 Bad Request
app.use((err, req, res, next) => {
    res.status(400).json({ error: "Malformed JSON" })
})

// export the app object to server.js where we referred to this
export default app