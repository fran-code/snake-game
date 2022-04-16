import Users from './../models/usersModel';
import { saveError } from './../models/errorsModel';

const usersController = {

    getDataUser: async (req, res) => {
        try {
            const user = await Users.findById(req.dataToken._id, { password: 0 })

            if (!user) {
                return res.status(404).send({ message: "The user doesn't exists" })
            }

            return res.json({ message: 'success', user });

        } catch (error) {
            saveError(error, "usersController/getDataUser")
            res.status(500).json({ message: "Internal Error" })
        }
    },
};

export default usersController;
