# Channel-Based Posting Platform

A full-stack forum-style platform designed for structured programming discussions. Users can post issues and solutions in dedicated channels, reply in threads, and rate contributions. Built with a modern MERN-like stack using MySQL and fully containerized with Docker.

---

## Features

* **User Authentication:** JWT-secured login/register flow
* **Channel Management:** Create, update, and delete discussion channels
* **Message Board:** Post questions with optional screenshots and tags
* **Replies & Threading:** Nested replies for structured discussions
* **Rating System:** Upvote/downvote messages and replies
* **Search:** Powerful filtering by keyword, username, post count, and rating
* **Admin Tools:** Admin routes for user and content moderation
* **Responsive UI:** React-based frontend with React Router & Context API

---

## Tech Stack

### Frontend:

* React
* React Router
* Formik + Yup (form handling and validation)
* Axios

### Backend:

* Node.js + Express
* JWT Authentication
* Sequelize ORM
* Multer (for file uploads)

### Database:

* MySQL

### DevOps:

* Docker + Docker Compose

---

## Database Schema

Entities:

* **Users**: id, username, email, password, avatar, level, isAdmin
* **Channels**: id, name, description, userId
* **Messages**: id, title, content, screenshot, userId, channelId, tags
* **Replies**: id, content, screenshot, userId, messageId, parentReplyId
* **Ratings**: id, value (-1/1), userId, targetType, targetId

---

## Security

* Passwords hashed with bcrypt
* JWTs with expiration and secure middleware
* File uploads limited by type and size
* Form validation on both frontend and backend

---

## Testing Highlights

* Auth, Channels, Messages, Replies, and Ratings fully tested
* Edge cases covered (duplicate registration, invalid logins, nested replies)
* Performance: average API response time < 150ms
* Security: passed JWT, XSS, and CSRF test cases

---

## Component Structure

```
App
├── Layout (Navbar, Footer)
├── Pages (Landing, Auth, Channels, Messages, Profile, Search)
├── Components
│   ├── Message (Form, Item)
│   ├── Reply (Form, Item, Thread)
│   ├── Rating (Buttons)
│   └── Form Elements (Inputs, Textareas, FileUpload)
```

---

## Search System

* `/search/keyword?query=`
* `/search/user?username=`
* `/search/users/most-posts`
* `/search/users/highest-ratings`

---

## Running Tests

* Manual testing across Chrome, Firefox, Edge
* Containerized testing with Docker Compose
* Test cases cover UI, API, validation, and edge scenarios

---

## Docker Setup

```bash
docker-compose up --build
```

* React app served on port 3000
* Node.js backend on port 5000
* MySQL database exposed on 3306

---

## Future Enhancements

* Email verification & password reset
* WebSocket for real-time replies
* Notification system
* Public user profiles and stats

---

## Contact

Obaleye Ademola
[zyq049@usask.ca](mailto:zyq049@usask.ca)
[LinkedIn](https://www.linkedin.com/in/ademola-obaleye-8633242a9)
