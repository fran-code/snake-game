import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    email: {
        type: String, unique: true, lowercase: true
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    experience: {
        type: Number
    },
});

export default usersSchema;
