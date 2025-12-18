import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
const fetchTasks = useCallback(async () => {
  try {
    const response = await API.get('/tasks');
    setTasks(response.data);
    setLoading(false);
  } catch {
    setError('Failed to fetch tasks');
    setLoading(false);
  }
}, []); // Empty array means function doesn't change

useEffect(() => {
  fetchTasks();
}, [fetchTasks]); // Now this is safe



  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await API.post('/tasks', newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
    } catch {
      setError('Failed to create task');
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const response = await API.put(`/tasks/${taskId}`, {
        completed: !currentStatus
      });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Welcome, {user.name}!</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTask} style={{ marginBottom: '30px' }}>
        <h3>Create New Task</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Task description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '80px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add Task
        </button>
      </form>

      <h3>Your Tasks ({tasks.length})</h3>
      
      {tasks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>
          No tasks yet. Create your first task above!
        </p>
      ) : (
        <div>
          {tasks.map((task) => (
            <div
              key={task._id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '4px',
                backgroundColor: task.completed ? '#f0f0f0' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 5px 0',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#666' : '#000'
                  }}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {task.description}
                    </p>
                  )}
                  <small style={{ color: '#999' }}>
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleComplete(task._id, task.completed)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: task.completed ? '#ff9800' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;