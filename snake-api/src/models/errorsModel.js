import mongoose from 'mongoose';
import errorsSchema from './../schema/errors';
import { logger } from '../middlewares';

const Errors = mongoose.model('Errors', errorsSchema);

export default Errors;


/**
 * Save error
 * @param {error} error
 * @param {location} location
 */
export async function saveError(error, location) {
    try{
        const newError = new Errors({ error, location, time: new Date() });
        await newError.save();
    }catch(e){
        logger.error("Error saving error: ", e)
    }
}
