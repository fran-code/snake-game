import jwt from 'jsonwebtoken';
import { API_KEY } from '../env';

export const verifyToken = async (req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }
        // Decode the Token 
        req.dataToken = await jwt.verify(token, API_KEY);
        next();
    } catch (error) {
        console.log("Error verifyToken::", error)
        res.clearCookie('token');
        return res.status(401).send({ message: 'Error validating token' });
    }
}


export const verifyTokenSocket = async (token) => {
    try {
        await jwt.verify(token, API_KEY);
        return true
    } catch (error) {
        console.log("Error verifyTokenSocket::", error)
        return false
    }
}