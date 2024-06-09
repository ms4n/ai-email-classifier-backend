
# ai-email-classifier-backend

This is the backend for [ai-email-classifier](https://github.com/ms4n/ai-email-classifier)


## Installation

Clone this repository and navigate to the project folder:

```bash
  git clone https://github.com/ms4n/ai-email-classifier-backend.git
  cd ai-email-classifier-backend
```

Install dependencies and run the development server:

```bash
  npm install
  npm run dev
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

You can get free Redis Serverless by [upstash](https://upstash.com/)

`PORT=8000`

`CORS_ORIGIN=http://localhost:3000,https://your-hosted-domain.app`

`SESSION_SECRET=`

`GOOGLE_CLIENT_ID=`

`GOOGLE_CLIENT_SECRET=`

`GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback`

`REDIS_URL=`

`FRONTEND_URL=http://localhost:3000/`

`OPENAI_API_KEY=`
## API Reference

#### Initiate Google OAuth
This endpoint initiates the Google OAuth authentication process.

```http
  GET /auth/google
```

#### Google OAuth Callback
This endpoint handles the callback after successful authentication with Google OAuth. It redirects the user to the email dashboard page.
```http
  GET /auth/google/callback
```

#### OAuth Log Out route
This endpoint logs out the user from the application.
```http
  GET /auth/logout
```

#### Get User Information
This endpoint retrieves information about the authenticated user.
```http
  GET /auth/user
```

#### Get Emails
This endpoint retrieves emails from the server.
```http
  GET /get-emails
```

#### Classify Emails
This endpoint retrieves emails from the server.
```http
  POST /classify-emails
```

```json
Request Body:
{
  "emails": [
    {
      "emailSnippet": "Lorem ipsum dolor sit amet...",
      "emailSubject": "Lorem ipsum"
    },
    ...
  ]
}
```

```json
Response:
{
  "labeledEmails": [
    {
      "label": "Important"
    },
    ...
  ]
}
```
