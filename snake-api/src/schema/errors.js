import mongoose from 'mongoose';

const errorsSchema = new mongoose.Schema({
    error: {
        type: String
    },
    location: {
        type: String
    },
    time: {
        type: Date
    }
});

export default errorsSchema;