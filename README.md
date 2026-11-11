# Todo REST API

- Student: Mst Yasmin Akter
- Student ID: 2310637
- Course: API Programming
- Assignment: 4. Create a server using node.js and express

A REST API for a Todo list, built with Node.js and Express.
Each todo has a state: `todo`, `doing` or `done`. Data is kept in an array (no database).

## How to run

    npm install
    npm run dev

Server: `http://localhost:3000`

## Project structure

    src/
      server.js          starts the server
      app.js             express app, routes, malformed JSON handler
      routes/
        index.js         GET /
        todos.js         all /todos endpoints
    requests.http        test requests (VS Code REST Client)

## Data model

| Field | Type | Notes |
|---|---|---|
| id | string | UUID, created by the server |
| title | string | Required |
| description | string | Optional |
| state | string | `todo`, `doing` or `done` (default `todo`) |
| dueDate | string | Optional, a valid date e.g. `2026-12-31` |
| createdAt | number | Set by the server (`Date.now()`) |
| updatedAt | number | Set by the server, changes on update |

## Endpoints

| Method | Path | Success |
|---|---|---|
| POST | /todos | 201 + Location header |
| GET | /todos | 200 |
| GET | /todos?state=todo\|doing\|done | 200 |
| GET | /todos/{id} | 200 |
| PUT | /todos/{id} | 200 |
| DELETE | /todos/{id} | 204 |

## Validation and client errors

| Status | When |
|---|---|
| 400 | Malformed JSON, missing title, invalid state, invalid dueDate, invalid `?state=` filter |
| 404 | Todo with the given id does not exist |

## Tests

Open `requests.http` in VS Code with the REST Client extension and click **Send Request**.
Run request 1 first, because later requests use the id it creates.

- Requests 1–6: happy paths
- Requests 7–15: client errors

## Report and reflection

I started from the example project shown in class and used the same structure:
`server.js`, `app.js` and a separate router file. I replaced the users router with
a todos router and added POST, PUT and DELETE endpoints.

After the happy paths worked, I added input validation. The most difficult part was
handling malformed JSON, because Express throws an error before the route runs.
I solved it with an error handler in `app.js` that returns 400.

I tested every endpoint with the VS Code REST Client. I learned how to use
variables in `.http` files, so the id from the POST response can be reused
in later requests.

I learned how REST endpoints map to CRUD operations and how status codes such as
201, 204, 400 and 404 tell the client what happened.

Next time I would use a real database instead of an array, so the data
would not disappear when the server restarts.