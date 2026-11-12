# Todo REST API

- **Student:** Mst Yasmin Akter
- **Student ID:** 
- **Course:** API Programming
- **Assignment:** 4. Create a server using node.js and express

A REST API for a Todo list, built with Node.js and Express.
Each todo has a state: `todo`, `doing` or `done`. Data is kept in an array (no database).

## How to run

    npm install
    npm run dev

Server: `http://localhost:3000`

## Project structure

    src/
      server.js          starts the server
      app.js             express app, routes, error handler
      routes/
        index.js         GET /
        todos.js         all /todos endpoints
    requests.http        test requests (VS Code REST Client)
    tests/
      large-body.json    over 100 kB body, used by test 24

## Data model

| Field | Type | Notes |
|---|---|---|
| id | string | UUID, created by the server |
| title | string | Required |
| description | string | Optional |
| state | string | `todo`, `doing` or `done` (default `todo`) |
| dueDate | string | Optional, a real date in format `YYYY-MM-DD`, e.g. `2026-12-31` |
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
| 400 | Malformed JSON, body is not a JSON object (e.g. an array) |
| 400 | Missing or blank `title`, `description` is not a string |
| 400 | `state` is not `todo`, `doing` or `done` |
| 400 | `dueDate` is not a real date in format `YYYY-MM-DD` (e.g. `abc`, `2026-02-30`, `false`, `0`) |
| 400 | `?state=` filter is empty or not `todo`, `doing` or `done` |
| 404 | Todo with the given id does not exist |
| 413 | Request body is bigger than 100 kB |
| 415 | Unsupported charset (e.g. `latin1`) or content encoding (e.g. `compress`) |
| 500 | Unexpected server error |

Errors are returned as JSON: `{ "error": "message" }`.

## Tests

Open `requests.http` in VS Code with the REST Client extension and click **Send Request**.
Run the requests from top to bottom. Request 1 creates a todo, and later requests use its id.
The todo is deleted only at the end.

- Requests 1–6: happy paths (create, list, filter, get one, update)
- Requests 7–21: client errors (400 and 404)
- Requests 22–24: client errors (415 and 413)
- Requests 25–26: delete, then delete again (404)

`tests/large-body.json` is a test file with a very long description. It can be created again with:

    node -e "require('fs').mkdirSync('tests',{recursive:true});require('fs').writeFileSync('tests/large-body.json',JSON.stringify({title:'Large body',description:'a'.repeat(200000)}))"

## Report and reflection

I started from the example project shown in class and used the same structure:
`server.js`, `app.js` and a separate router file. I replaced the users router with
a todos router and added POST, PUT and DELETE endpoints.

After the happy paths worked, I added input validation. The most difficult part was
handling malformed JSON, because Express throws an error before the route runs.
I solved it with an error handler in `app.js` that returns 400 for malformed JSON,
413 for a too large body, 415 for an unsupported charset or encoding, and 500 for
other errors.

When I tested more edge cases, I found that `Date.parse` accepted impossible dates
such as `2026-02-30`, and that an array body was accepted in PUT. I fixed the
validation so that `dueDate` must be a real date in `YYYY-MM-DD` format and the
body must be a JSON object, and I added test requests for these cases.

I tested every endpoint with the VS Code REST Client. I learned how to use
variables in `.http` files, so the id from the POST response can be reused
in later requests.

I learned how REST endpoints map to CRUD operations and how status codes such as
201, 204, 400 and 404 tell the client what happened.

Next time I would use a real database instead of an array, so the data
would not disappear when the server restarts.