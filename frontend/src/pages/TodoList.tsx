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
  // Structured payload inputs for create form
  const [newTagsCsv, setNewTagsCsv] = useState('');
  const [newPriority, setNewPriority] = useState(''); // e.g., high | medium | low
  const [newAttachmentsCsv, setNewAttachmentsCsv] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchPayload, setSearchPayload] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTagsCsv, setEditTagsCsv] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAttachmentsCsv, setEditAttachmentsCsv] = useState('');
  const [editNotes, setEditNotes] = useState('');

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
      // Build payload object from structured optional fields
      const composedPayload: any = {};
      if (newTagsCsv.trim()) {
        composedPayload.tags = newTagsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (newPriority.trim()) {
        composedPayload.priority = newPriority.trim();
      }
      if (newAttachmentsCsv.trim()) {
        composedPayload.attachments = newAttachmentsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (newNotes.trim()) {
        composedPayload.notes = newNotes.trim();
      }

      const response = await createTodo({
        description: newTodoDescription,
        due_date: newTodoDueDate,
        payload: Object.keys(composedPayload).length > 0 ? composedPayload : undefined,
      });
      setTodos([...todos, response.data]);
      setNewTodoDescription('');
      setNewTodoDueDate('');
      setNewTagsCsv('');
      setNewPriority('');
      setNewAttachmentsCsv('');
      setNewNotes('');
    } catch (err: any) {
      console.error('Failed to create todo:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to create todo');
    }
  };

  const toInputDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditDescription(todo.description);
    try {
      setEditDueDate(toInputDateTime(todo.due_date));
    } catch {
      setEditDueDate('');
    }
    const payload = todo.payload || {};
    setEditTagsCsv(Array.isArray(payload.tags) ? payload.tags.join(', ') : '');
    setEditPriority(payload.priority || '');
    setEditAttachmentsCsv(Array.isArray(payload.attachments) ? payload.attachments.join(', ') : '');
    setEditNotes(payload.notes || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription('');
    setEditDueDate('');
    setEditTagsCsv('');
    setEditPriority('');
    setEditAttachmentsCsv('');
    setEditNotes('');
  };

  const saveEdits = async (id: number) => {
    try {
      const update: any = {};
      if (editDescription.trim()) update.description = editDescription.trim();
      if (editDueDate.trim()) update.due_date = editDueDate; // backend parses ISO/local

      const payload: any = {};
      if (editTagsCsv.trim()) payload.tags = editTagsCsv.split(',').map((s) => s.trim()).filter(Boolean);
      if (editPriority.trim()) payload.priority = editPriority.trim();
      if (editAttachmentsCsv.trim()) payload.attachments = editAttachmentsCsv.split(',').map((s) => s.trim()).filter(Boolean);
      if (editNotes.trim()) payload.notes = editNotes.trim();
      if (Object.keys(payload).length > 0) update.payload = payload;

      const response = await updateTodo(id, update);
      setTodos(todos.map((t) => (t.id === id ? response.data : t)));
      cancelEditing();
    } catch (err: any) {
      console.error('Failed to save edits:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to save edits');
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
          <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="design, planning"
                value={newTagsCsv}
                onChange={(e) => setNewTagsCsv(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Attachments (comma-separated)</label>
              <input
                type="text"
                placeholder="report.pdf, design.png"
                value={newAttachmentsCsv}
                onChange={(e) => setNewAttachmentsCsv(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                placeholder="Request final review from Manager Yang"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
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
            {editingId === todo.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="datetime-local"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                    <input
                      type="text"
                      value={editTagsCsv}
                      onChange={(e) => setEditTagsCsv(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Attachments</label>
                    <input
                      type="text"
                      value={editAttachmentsCsv}
                      onChange={(e) => setEditAttachmentsCsv(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveEdits(todo.id)}
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="inline-flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-gray-900 ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.description}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(todo.due_date).toLocaleString()}</p>
                                  {todo.payload && (
                  <div className="mt-2 space-y-1">
                    {todo.payload.tags && todo.payload.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-medium text-gray-600">Tags:</span>
                        {todo.payload.tags.map((tag: string, index: number) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {todo.payload.priority && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-600">Priority:</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          todo.payload.priority === 'high' ? 'bg-red-100 text-red-800' :
                          todo.payload.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {todo.payload.priority.charAt(0).toUpperCase() + todo.payload.priority.slice(1)}
                        </span>
                      </div>
                    )}
                    {todo.payload.attachments && todo.payload.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-medium text-gray-600">Attachments:</span>
                        {todo.payload.attachments.map((attachment: string, index: number) => (
                          <span key={index} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            📎 {attachment}
                          </span>
                        ))}
                      </div>
                    )}
                    {todo.payload.notes && (
                      <div className="mt-1">
                        <span className="text-xs font-medium text-gray-600">Notes:</span>
                        <p className="text-xs text-gray-700 mt-0.5">{todo.payload.notes}</p>
                      </div>
                    )}
                  </div>
                )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(todo.id, todo.completed)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => startEditing(todo)}
                    className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;