
![](/images/mockup1.jpg)
# Garden Almanac Server

## Node Express 4.18.1, Mongoose 6.6.1, with MongoDB

## Client Repo: [Garden Almanac Client](https://github.com/daidensacha/almanac-client)

## Summary
This is the server for the Garden Almanac app. It is a full stack app that allows users to create a garden and add plants to it. The app will then keep track of the plants and provide information about them. The app will also provide information about the weather and the best time to plant and harvest.

## API Documentation

### Plants Collection
```js
GET /api/plants
// Returns a list of plants

GET /api/plant/:id
// Returns a single plant

POST /api/plant/create
// Creates a new plant

PUT /api/plant/update/:id
// Updates a plant

PATCH /api/plant/archive/:id
// Archives a plant

DELETE /api/plant/delete/:id
// Deletes a plant
```

### Categories Collection
```js
GET /api/categories
// Returns a list of categories

GET /api/category/:id
// Returns a single category

POST /api/category/create
// Creates a new category

PUT /api/category/update/:id
// Updates a category

PATCH /api/category/archive/:id
// Archives a category

DELETE /api/category/delete/:id
// Deletes a category
```

### Events Collection
```js
GET /api/events
// Returns a list of categories

GET /api/event/:id
// Returns a single category

POST /api/event/create
// Creates a new category

PUT /api/event/update/:id
// Updates a category

PATCH /api/event/archive/:id
// Archives a category

DELETE /api/event/delete/:id
// Deletes a plant
```
## Technologies Used

* Node.js
* Express
* Mongoose
* MongoDB

## Usage

* Clone this repo
* Install dependencies with `npm install`
* Run the development server with `npm run devpc` for PC, `npm run devmac` for Mac

## ENV Variables required for local development

```js
NODE_ENV=development_or_production // development or production
PORT=port_number // default 8000
CLIENT_URL=client_url_react_app // client url for cors
DATABASE_URL=mongo_database_url // for production
EMAIL_TO=email_of_app_gmail_account // for nodemailer
EMAIL_FROM=email_of_app_gmail_account // (same as above)
GMAIL_PASSWORD=gmail_password_for_email // gmail app password for nodemailer
JWT_SECRET=unique_secure_password // used for JWT
JWT_ACCOUNT_ACTIVATION=unique_secure_password // for account activation
JWT_RESET_PASSWORD=unique_secure_password // 10 minutes
GOOGLE_CLIENT_ID=google_api_client_id // for google login
```

## Author
Daiden Sacha
