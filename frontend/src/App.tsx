import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './pages/TodoList';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen font-sans bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-900">Todo</Link>
          <ul className="flex items-center gap-6 list-none">
            {!isAuthenticated && (
              <>
                <li>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-600 hover:text-gray-900">Register</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/todos" className="text-gray-600 hover:text-gray-900">Todos</Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/todos" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/todos" replace /> : <Register />} />
            <Route
              path="/todos"
              element={
                <ProtectedRoute>
                  <TodoList />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={isAuthenticated ? <Navigate to="/todos" replace /> : <Login />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
