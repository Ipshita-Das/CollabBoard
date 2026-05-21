import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'A board must have a title'],
            trim: true,
            maxlength: [50, 'Board title cannot exceed 50 characters']
        },
        description: {
            type: String,
            trim: true
        },
        // The person who created the board
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // This explicitly links to your User model!
            required: true
        },
        // The people allowed to view/edit this specific board
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                role: {
                    type: String,
                    enum: ['Admin', 'Editor', 'Viewer'],
                    default: 'Editor'
                }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model('Board', boardSchema);