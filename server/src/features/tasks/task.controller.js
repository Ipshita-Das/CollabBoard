import axios from 'axios';
import Task from './Task.model.js';
import List from '../lists/List.model.js';

// --- @route POST /api/tasks ---
// --- @access Private ---
export const createTask = async (req, res) => {
    try {
        const { title, description, listId, boardId } = req.body;

        // 1. Verify the List actually exists before putting a task inside it
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // 2. Figure out the order number (Put the new card at the very bottom of the column)
        const existingTasks = await Task.find({ list: listId });
        const newOrder = existingTasks.length;

        // 3. Create the Task
        const newTask = await Task.create({
            title,
            description,
            list: listId,
            board: boardId,
            order: newOrder
        });

        res.status(201).json(newTask);

    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

// --- @route GET /api/tasks/:boardId ---
// --- @access Private ---
export const getTasksForBoard = async (req, res) => {
    try {
        const { boardId } = req.params;

        // Fetch all tasks for this entire board, sorted by their order
        const tasks = await Task.find({ board: boardId }).sort({ order: 1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
export const generateLocalSubtasks = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Task title is required." });
  }

  try {
    const pythonResponse = await axios.post('http://localhost:8000/generate-subtasks', {
      title: title
    });
    res.status(200).json({ subtasks: pythonResponse.data.subtasks });
  } catch (error) {
    console.error("Local ML Engine Error:", error.message);
    res.status(500).json({ message: "Failed to connect to Python ML Microservice." });
  }
};
export const generateBoardDescription = async (req, res) => {
  try {
    const pythonResponse = await axios.post('http://localhost:8000/generate-description', {
      board_title: req.body.title
    });
    res.status(200).json(pythonResponse.data);
  } catch (error) {
    res.status(500).json({ message: "ML Engine offline." });
  }
};

export const suggestTasksByList = async (req, res) => {
  try {
    const pythonResponse = await axios.post('http://localhost:8000/suggest-tasks', {
      list_name: req.body.listName,
      board_title: req.body.boardTitle
    });
    res.status(200).json(pythonResponse.data);
  } catch (error) {
    res.status(500).json({ message: "ML Engine offline." });
  }
};