import Board from './Board.model.js';

// --- @route POST /api/boards ---
// --- @access Private (Must be logged in) ---
export const createBoard = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Create the board. 
        const newBoard = await Board.create({
            title,
            description,
            owner: req.user._id, 
            members: [{ user: req.user._id, role: 'Admin' }]
        });

        res.status(201).json(newBoard);

    } catch (error) {
        res.status(500).json({ message: 'Error creating board', error: error.message });
    }
}; // <-- NOTICE how createBoard completely closes here!

// --- @route GET /api/boards ---
// --- @access Private ---
export const getUserBoards = async (req, res) => {
    try {
        // Find boards where the user is either the owner OR in the members array
        const boards = await Board.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        }).populate('owner', 'name email'); 

        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching boards', error: error.message });
    }
}; // <-- getUserBoards closes here

// --- @route GET /api/boards/:id ---
// --- @access Private ---
export const getBoardById = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('members.user', 'name email');

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching board', error: error.message });
    }
}; // <-- getBoardById closes here