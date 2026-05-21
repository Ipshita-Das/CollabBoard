import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'A task must have a title'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        list: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List',
            required: true
        },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        order: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model('Task', taskSchema);