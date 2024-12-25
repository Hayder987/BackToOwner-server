# BackToOwner - Server

This is the server-side codebase for the **BackToOwner** application, which supports the Find-and-Lost item website. The server is built using **Express.js** and connects to a **MongoDB** database without using Mongoose. It provides RESTful APIs for authentication, item management, and other backend functionalities.

---

## 🛠️ Key Features

1. **User Authentication**:
   - Secure authentication using **JSON Web Tokens (JWT)**.
   - Token-based user verification and route protection.

2. **Environment Configuration**:
   - Manage sensitive configurations using **dotenv**.

3. **Cross-Origin Requests**:
   - Enable **CORS** for secure API requests from the frontend.

4. **Cookie Management**:
   - Use **cookie-parser** to handle and parse cookies for authentication.

5. **Database**:
   - Direct interaction with **MongoDB** (without using Mongoose).

6. **Developer Friendly**:
   - Auto-restart server during development using **nodemon**.

---

## 📦 NPM Packages Used

| Package           | Purpose                                                                 |
|--------------------|-------------------------------------------------------------------------|
| **cookie-parser**  | For parsing and managing cookies in HTTP requests.                    |
| **cors**           | To enable cross-origin resource sharing between frontend and backend. |
| **dotenv**         | To securely manage environment variables.                             |
| **express**        | To create and manage the server with RESTful API support.             |
| **jsonwebtoken**   | To generate and verify JSON Web Tokens for authentication.            |
| **mongodb**        | To directly interact with the MongoDB database.                      |
| **nodemon**        | To auto-restart the server during development for efficiency.         |

---


