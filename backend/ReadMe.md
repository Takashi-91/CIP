
2. **Install dependencies:**

```bash
npm install
```
---

### ▶️ Running the Server

To run the server in production mode:

```bash
npm start
```

To run the server in development mode (with auto-restart using `nodemon`):

```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## 🔐 Backend API Endpoints

### 🔑 Auth
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| POST   | `/api/auth/register` | Register user     |
| POST   | `/api/auth/login`    | Login user        |

### 💳 Payments
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/payments/create`    | Make a payment (auth)    |
| GET    | `/api/payments/history`   | Get user's payment history (auth) |

**All protected routes require an `Authorization` header with a Bearer JWT token.**

---

## 🌐 Connecting the Frontend

To connect your React frontend to this backend:

1. **Set the backend base URL** in your React app (`axios` or `fetch`):

```js
const BASE_URL = "http://localhost:5000/api";
```

2. **Send requests to endpoints:**

```js
// Example: Register
await axios.post(`${BASE_URL}/auth/register`, {
  name: "John Doe",
  email: "john@example.com",
  password: "Password123!"
});
```

3. **Use the token in protected routes:**

```js
const token = localStorage.getItem("token");

await axios.get(`${BASE_URL}/payments/history`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🛡️ Security Features

- Password hashing with **bcrypt**
- Token-based authentication with **JWT**
- Input validation using **RegEx whitelisting**
- Request throttling with **express-rate-limit**
- Security headers via **helmet**
- CORS enabled for frontend integration

---



-