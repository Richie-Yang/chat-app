# chat-app

Chat-app, the web service which provides realtime conversation service.

You can visit the dmeo website here:
https://chat-app-vlwbiireva-de.a.run.app/login

## Motivation

This app is built for testing websocket purpose only. I used to build other type of chat app with firestore and related listener kit, but this time I wanted to try websocket, and most time will mainly spent on backend side, so the frontend is not that fancy.

main components:

- Koa.js
- Websocket
- GCP Firestore
- GCP Cloud Run

## Screenshots

### App View

<p float="left">
  <img src="/public/images/login_view.jpg" width="30%">
  <img src="/public/images/conversation_view.jpg" width="30%">
</p>

<!-- ![<Login Page](/public/images/login_view.jpg) -->

<!-- ![Conversation Page](/public/images/conversation_view.jpg) -->

## Features

1. User can register an account and login to chat.
2. All users are listed, and you can talk to them.

## Prerequisites

1. Node.js (v21 is recommended)
2. GitBash or CMder (for Windows) / terminal (for MacOS)

## Installation

1. Open your terminal, then clone the repo to your local.

```
git clone https://github.com/Richie-Yang/chat-app.git
```

2. Move to repo directory.

```
cd chat-app
```

3. Run the command below to start installing dependencies.

```
npm install
```

4. Move to /env directory.

```
cd /env
```

5. Create .env file at project root directory

```
touch .env
```

or

```
cp .env.example .env
```

6. Fill out valid string referring to .env.example

7. add GCP service account JSON file to /env directory

8. change name to service_account.local.json

9. if you're running on local, make sure below env variables are correct:

```
NODE_ENV=local
SERVICE_ACCOUNT_ENV=local
PORT=5001
```

## Execution

1. Start Koa server in Node.js env.

```
npm run dev
```

## Usage

1. Open your browser and go to http://127.0.0.1:5001/login.
2. Click SignUp button to create new account.
3. Go back to Login page to use the account you just created.
4. Choose whatever user you like to talk to.
5. Enjoy the conversation!

## Contributor

[Richie](https://github.com/Richie-Yang) :wink:
