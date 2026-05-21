import List from './List.model.js';
import Board from '../boards/Board.model.js';

// --- @route POST /api/lists ---
// --- @access Private ---
export const createList = async (req, res) => {
    try {
        const { title, boardId } = req.body;

        // 1. Verify the board actually exists
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // 2. Figure out the order number (Put it at the end of the lists)
        const existingLists = await List.find({ board: boardId });
        const newOrder = existingLists.length; 

        // 3. Create the List
        const newList = await List.create({
            title,
            board: boardId,
            order: newOrder
        });

        res.status(201).json(newList);

    } catch (error) {
        res.status(500).json({ message: 'Error creating list', error: error.message });
    }
};

// --- @route GET /api/lists/:boardId ---
// --- @access Private ---
export const getListsForBoard = async (req, res) => {
    try {
        const { boardId } = req.params;

        // Fetch all lists for this specific board and sort them by their 'order' field!
        const lists = await List.find({ board: boardId }).sort({ order: 1 });

        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lists', error: error.message });
    }
};