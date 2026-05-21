import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true 
        },
        password: { 
            type: String, 
            required: true 
        },
        role: { 
            type: String, 
            enum: ['Admin', 'Member', 'Viewer'], 
            default: 'Member' 
        }
    }, 
    { timestamps: true } // Automatically creates 'createdAt' and 'updatedAt' fields
);

// --- Pre-Save Hook: Hash the password before saving to the database ---
// --- Pre-Save Hook: Hash the password before saving to the database ---
userSchema.pre('save', async function () {
    // Check if the password field has been modified (or is new)
    if (!this.isModified('password')) {
        return; // Just return normally, no next() needed!
    }

    // Generate a secure "salt" and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- Instance Method: Compare incoming password with the hashed password ---
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);