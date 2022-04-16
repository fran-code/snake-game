import mongoose from 'mongoose';
import usersSchema from './../schema/users';

const Users = mongoose.model('Users', usersSchema);

export default Users;

/**
 * Checks if param already exists
 * @param {param} param
 * @returns {(boolean|Object)} True if doc existing, false otherwise
 */
export async function checkExisting(param) {
    const match = await Users.findOne( param );
    return match;
}
