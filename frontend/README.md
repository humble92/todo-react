## How to Run the Todo React Frontend

This guide assumes you have Node.js and npm installed.

### 1. Backend Setup (if not already running)

Ensure your FastAPI backend is running and accessible at `http://localhost:8000`. Refer to the `cf-backend/main.py` file for instructions on how to set up and run the backend, including environment variables (`.env` file).

### 2. Navigate to the Frontend Directory

Open your terminal or command prompt and navigate to the `frontend` directory:

```bash
cd frontend
```

### 3. Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

### 4. Start the Development Server

Start the Vite development server:

```bash
npm run dev
```

### 5. Access the Application

Once the development server starts, it will typically provide a URL like `http://localhost:5173` (the port might vary). Open this URL in your web browser.

### 6. Interact with the Application

*   **Register:** If you don't have an account, register a new user.
*   **Login:** Log in with your registered credentials.
*   **Manage Todos:** After logging in, you can create, view, update (mark complete/incomplete), and delete your todo items. You can also search for todos by description or payload.