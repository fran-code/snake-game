import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { API_KEY, SALT_ROUNDS } from '../env';
import Users, { checkExisting } from './../models/usersModel';
import { saveError } from './../models/errorsModel';

const authController = {
    register: async (req, res, next) => {
        try {
            const { email, username, password } = req.body;

            if (email === undefined || username === undefined || password === undefined) {
                return res.status(400).json({ message: "Request Error" })
            }

            const checkEmail = await checkExisting({ email });

            if (checkEmail) {
                return res.status(403).json({ message: "email already exists" })
            }

            const hash = bcrypt.hashSync(password, Number(SALT_ROUNDS));
            const newUser = new Users({ username, password: hash, email, experience: 100 });

            const user = await newUser.save();

            const token = jwt.sign({ _id: user._id }, API_KEY, { expiresIn: 60 * 60 * 24 });
            res.cookie('token', token, { httpOnly: true });
            return res.json({ success: true, token, user });

        } catch (error) {
            saveError(error, "authController/register")
            res.status(500).json({ message: "Internal Error" })
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            console.log("req.body:: ", req.body);

            if (email === undefined || password === undefined) {
                return res.status(400).json({ message: "Request Error" })
            }

            const user = await Users.findOne({ email })

            if (!user) {
                return res.status(404).send({ message: "The email doesn't exists" })
            }

            const match = await bcrypt.compare(password, user.password);

            if (user && match) {
                const token = jwt.sign({ _id: user._id }, API_KEY, { expiresIn: 60 * 60 * 24 });
                res.cookie('token', token, { httpOnly: true });
                return res.json({ message: 'success', token, user });
            }

            return res.status(403).send({ message: 'Wrong password' })
        } catch (error) {
            saveError(error, "authController/login")
            res.status(500).json({ message: "Internal Error" })
        }
    },
    logout: async (req, res, next) => {
        try {
            res.cookie('token', 'none', {
                expires: new Date(Date.now()),
                httpOnly: true,
            })
            res.json({ message: 'User logged out successfully' })
        } catch (error) {
            saveError(error, "authController/logout")
            res.status(500).json({ message: "Internal Error" })
        }
    }

};

export default authController;

const getUserData = async () => await Users.findById(idUser, { password: 0 })
