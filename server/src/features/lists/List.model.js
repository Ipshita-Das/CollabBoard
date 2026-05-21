import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'A list must have a title (e.g., "To Do")'],
            trim: true
        },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true
        },
        order: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model('List', listSchema);