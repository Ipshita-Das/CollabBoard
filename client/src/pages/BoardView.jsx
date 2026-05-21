import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosSetup';

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [addingTaskToList, setAddingTaskToList] = useState(null); 
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [suggestingForList, setSuggestingForList] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const [boardRes, listsRes, tasksRes] = await Promise.all([
          api.get(`/boards/${id}`),
          api.get(`/lists/${id}`),
          api.get(`/tasks/${id}`)
        ]);
        setBoard(boardRes.data);
        setLists(listsRes.data);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading board:", err);
        setError(err.response?.data?.message || err.message || "Failed to load board data from backend");
        setLoading(false);
      }
    };
    fetchBoardData();
  }, [id]);

  // --- Handlers ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const response = await api.post('/lists', { title: newListTitle, boardId: id });
      setLists([...lists, response.data]);
      setNewListTitle('');
      setIsAddingList(false);
    } catch (err) {
      alert("Failed to create list.");
    }
  };

  const handleCreateTask = async (e, listId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const response = await api.post('/tasks', {
        title: newTaskTitle,
        listId: listId,
        boardId: id
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      setAddingTaskToList(null);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task.");
    }
  };

  const handleAIGenerate = async (e) => {
    e.preventDefault(); 
    if (!newTaskTitle) return alert("Type a task title first!");
    setIsAiThinking(true);
    try {
      const response = await api.post('/tasks/ai-breakdown', { title: newTaskTitle });
      const generatedList = response.data.subtasks.join('\n- ');
      alert(`Local ML Suggests:\n- ${generatedList}`);
    } catch (err) {
      console.error("AI Error:", err);
      alert("Local ML Engine is offline. Did you start the Python server?");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSuggestTasks = async (list) => {
    setSuggestingForList(list._id);
    try {
      const res = await api.post('/tasks/ai-suggest-tasks', { 
        listName: list.title, 
        boardTitle: board.title 
      });
      const suggestions = res.data.tasks.join('\n- ');
      alert(`AI Suggests for ${list.title}:\n- ${suggestions}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestingForList(null);
    }
  };

  if (loading) return <h2 style={{ padding: '60px' }}>Loading Data...</h2>;
  
  if (error) return (
    <div style={{ padding: '60px', color: '#ff4c4c' }}>
      <h1>Crash Report</h1>
      <h3>{error}</h3>
      <button onClick={() => navigate('/')} className="primary-button" style={{ marginTop: '20px' }}>Go Back</button>
    </div>
  );

  return (
    <div className="kanban-layout">
      
      <div className="kanban-nav">
        {/* --- NEW LOGO HEADER --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-cb.png" alt="CollabBoard Logo" style={{ height: '30px', width: 'auto' }} />
          <h2 style={{ margin: 0 }}>{board.title}</h2>
        </div>
        
        <button onClick={() => navigate('/')} className="secondary-button">
          Back to Command Center
        </button>
      </div>

      <div className="kanban-canvas">
        {lists.map(list => (
          <div key={list._id} className="kanban-column">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaea', marginBottom: '20px', paddingBottom: '10px' }}>
              <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>{list.title}</h3>
              <button 
                onClick={() => handleSuggestTasks(list)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#8b5cf6' }}
              >
                {suggestingForList === list._id ? '⏳' : '✨ Suggest'}
              </button>
            </div>
            
            {/* Scrollable Tasks Area */}
            <div className="tasks-container">
              {tasks.filter(task => task.list === list._id).map(task => (
                <div key={task._id} className="task-card">
                  <h4>{task.title}</h4>
                </div>
              ))}
            </div>

            <div className="add-task-container">
              {addingTaskToList === list._id ? (
                <form onSubmit={(e) => handleCreateTask(e, list._id)} className="add-task-form">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Enter task title..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="clean-input" 
                    style={{ width: '100%', marginBottom: '10px' }} 
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="primary-button">Add Task</button>
                    <button 
                      onClick={handleAIGenerate} 
                      type="button" 
                      className="primary-button" 
                      style={{ backgroundColor: '#8b5cf6' }} 
                      disabled={isAiThinking}
                    >
                      {isAiThinking ? 'Model Processing...' : '✨ Local AI Breakdown'}
                    </button>
                    <button type="button" onClick={() => setAddingTaskToList(null)} className="secondary-button">Cancel</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => {
                    setAddingTaskToList(list._id);
                    setNewTaskTitle('');
                  }} 
                  className="add-task-toggle"
                >
                  + Add a card
                </button>
              )}
            </div>

          </div>
        ))}

        {isAddingList ? (
          <form onSubmit={handleCreateList} className="add-list-form">
            <input 
              autoFocus
              type="text" 
              placeholder="Enter list title..." 
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="clean-input" 
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-button">Add List</button>
              <button type="button" onClick={() => setIsAddingList(false)} className="secondary-button">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAddingList(true)} className="add-list-toggle">
            + Add another list
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardView;