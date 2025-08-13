import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/api';

interface Todo {
  id: number;
  description: string;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  payload: any;
}

const TodoList = () => {
  const { token } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchPayload, setSearchPayload] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setError(null);
      const params: any = {};
      if (searchDescription) params.desc_search = searchDescription;
      if (searchPayload) params.payload_search = searchPayload;

      const response = await getTodos(params);
      setTodos(response.data);
    } catch (err: any) {
      console.error('Failed to fetch todos:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to fetch todos');
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, searchDescription, searchPayload]); // Refetch when token or search terms change

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newTodoDescription || !newTodoDueDate) {
      setError('Description and Due Date are required.');
      return;
    }
    try {
      const response = await createTodo({
        description: newTodoDescription,
        due_date: newTodoDueDate,
      });
      setTodos([...todos, response.data]);
      setNewTodoDescription('');
      setNewTodoDueDate('');
    } catch (err: any) {
      console.error('Failed to create todo:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to create todo');
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      const response = await updateTodo(id, { completed: !completed });
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (err: any) {
      console.error('Failed to update todo:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err: any) {
      console.error('Failed to delete todo:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to delete todo');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">Your Todos</h2>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Search Form */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-medium text-gray-900">Search Todos</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search by description"
            value={searchDescription}
            onChange={(e) => setSearchDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="Search by payload (JSON)"
            value={searchPayload}
            onChange={(e) => setSearchPayload(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="mt-3">
          <button
            onClick={fetchTodos}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Create Todo Form */}
      <form onSubmit={handleCreateTodo} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-medium text-gray-900">Add New Todo</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Description"
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="datetime-local"
            value={newTodoDueDate}
            onChange={(e) => setNewTodoDueDate(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="mt-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Add Todo
          </button>
        </div>
      </form>

      {/* Todo List */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li key={todo.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-gray-900 ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.description}</p>
                <p className="text-sm text-gray-500">Due: {new Date(todo.due_date).toLocaleString()}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleToggleComplete(todo.id, todo.completed)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;