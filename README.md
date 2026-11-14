# Todo REST API

- **Student:** Mst Yasmin Akter
- **Student ID:** 2310637
- **Course:** API Programming
- **Assignment:** 5. Unit tests and integration tests (continues Assignment 4)

A REST API for a Todo list, built with Node.js and Express.
Each todo has a state: `todo`, `doing` or `done`. Data is kept in an array (no database).

## How to run

    npm install
    npm run dev

Server: `http://localhost:3000`

## How to run the tests

    npm test

The tests use the Node.js built-in test runner (`node:test` and `node:assert`)
and [supertest](https://github.com/ladjs/supertest) for HTTP requests.
The server does not need to be running, supertest uses the Express app directly.

## Project structure

    src/
      server.js          starts the server
      app.js             express app, routes, error handler
      validation.js      validation functions (isValidDate, isValidState, validate)
      todoStore.js       todo data and functions (getAll, getById, create, update, remove, reset)
      routes/
        index.js         GET /
        todos.js         all /todos endpoints (HTTP only)
    requests.http        manual test requests (VS Code REST Client)
    tests/
      unit/
        validation.test.js   unit tests for validation.js
        todoStore.test.js    unit tests for todoStore.js
      integration/
        todos.test.js        integration tests for the API endpoints
      large-body.json    over 100 kB body, used by manual request 24

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

## Refactoring for testability

In Assignment 4, I placed all logic in `routes/todos.js`. This approach made testing challenging.

- I did not export `isValidDate` and `validate`, which prevented me from testing these functions individually.
- The `todos` array was defined within the router file, which prevented tests from resetting it. Consequently, one test could affect the data used by another.
- The routes combined HTTP request handling and data logic, resulting in tightly coupled code.

Below are the changes I implemented. The API's functionality remains unchanged as a result of these modifications.

- I moved the validation functions to `src/validation.js` and exported them. Additionally, I added `isValidState`, which is now used by both `validate` and the `?state=` filter.
- I moved the data and CRUD logic to `src/todoStore.js`. This file now includes a `reset()` function, ensuring that every test starts with the same data.
- Now, `routes/todos.js` is responsible only for processing requests, interacting with the store, and sending responses.
- `app.js` and `server.js` were already separated, which allows tests to import the app without starting the server.

## Automated tests

**Unit tests** (in `tests/unit/`) verify individual functions with both valid and invalid inputs:

- `isValidDate`: real dates, impossible dates (`2026-02-30`), wrong formats, non-strings
- `isValidState`: allowed and not allowed states
- `validate`: valid data, non-object bodies, missing or blank titles, incorrect types, invalid state and dueDate, and differences between POST and PUT
- `todoStore`: creation with default values, getById, filtering, updating, removal, and handling non-existent ids

**Integration tests** (in `tests/integration/`) send HTTP requests to the API and verify status codes and response data:

| Endpoint | Success | Errors |
|---|---|---|
| GET / | 200 | |
| POST /todos | 201 with Location header | 400 for malformed JSON, missing or blank title, incorrect types, invalid state or dueDate; 413; 415 |
| GET /todos | 200, filter by state | 400 for invalid or empty state filter |
| GET /todos/{id} | 200 | 404 |
| PUT /todos/{id} | 200, change is saved | 400 for invalid state or dueDate, or array body; 404 |
| DELETE /todos/{id} | 204 | 404 if deleted again |

Result: 56 tests (15 suites), all passing.

## Manual tests

Open `requests.http` in VS Code using the REST Client extension and click **Send Request**.
Run the requests sequentially. Request 1 creates a todo, and subsequent requests use its id.
The todo is deleted only at the end of the sequence.

- Requests 1 to 6: normal cases (create, list, filter, get one, update)
- Requests 7 to 21: client errors (400 and 404 responses)
- Requests 22 to 24: client errors (415 and 413 responses)
- Requests 25 and 26: delete, then try to delete again (404 response)

`tests/large-body.json` is a test file containing a very long description. You can recreate it with:

    node -e "require('fs').mkdirSync('tests',{recursive:true});require('fs').writeFileSync('tests/large-body.json',JSON.stringify({title:'Large body',description:'a'.repeat(200000)}))"

## Report and reflection

### Assignment 5: Testing

In this assignment, I added automated tests to the Todo API from Assignment 4.

When I reviewed my code, I realized it was difficult to test. The validation functions were inside the router file and not exported, so I could not test them separately. The todos array was also inside the router, so tests could not reset the data, and one test could affect the data for another.

I refactored the code by moving the validation functions to `validation.js` and the data logic to `todoStore.js`. I added a `reset()` function so every test starts with the same data. Now, the router only handles HTTP requests and responses. I did not rewrite the application, so the API still works as before. Having `app.js` and `server.js` separate from Assignment 4 was helpful, as tests can import the app without starting the server.

I wrote unit tests for the validation and store functions using both valid and invalid inputs, such as real dates, impossible dates like `2026-02-30`, and non-string values. I also wrote integration tests with supertest for all endpoints, verifying status codes and response data for both successful requests and errors (400, 404, 413, and 415).

In Assignment 4, I tested the API manually with `requests.http` and had to run the requests in the correct order. Now, I can run all 56 tests with a single command, `npm test`, and immediately determine if any issues arise after a change.

I learned that writing testable code requires separating logic from routes. Automated tests also make future code modifications safer.

### Assignment 4: REST API

I started with the example project from class and used the same structure: `server.js`, `app.js`, and a separate router file. I replaced the users router with a todos router and added POST, PUT, and DELETE endpoints to support full CRUD functionality.

After the normal cases worked, I added input validation. The most challenging aspect was handling malformed JSON, as Express throws an error before the route executes. I addressed this by implementing an error handler in `app.js` that returns 400 for malformed JSON, 413 for bodies that are too large, 415 for unsupported charset or encoding, and 500 for other errors.

When I tested additional edge cases, I discovered that `Date.parse` accepted impossible dates such as `2026-02-30`, and that PUT accepted an array as the body. I updated the validation so `dueDate` must be a real date in `YYYY-MM-DD` format and the body must be a JSON object. I also added test requests for these scenarios.

I tested every endpoint with the VS Code REST Client. I learned to use variables in `.http` files, which allowed me to reuse the id from the POST response in subsequent requests.

I learned how REST endpoints correspond to CRUD operations and how status codes such as 201, 204, 400, and 404 inform the client of the outcome.

In the future, I would use a real database instead of an array to ensure data persists after server restarts.
