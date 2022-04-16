import usersController from './controller/usersController';
import authController from './controller/authController';
import { verifyToken } from './auth/verifyToken';

const routes = route => {
    route.get('/', (req, res) => {
        res.send(`Api server in running (${new Date()})`);
    });

    route.route('/auth/register').post(authController.register);

    route.route('/auth/login').post(authController.login);

    route.route('/auth/logout').post(authController.logout);

    route.route('/users').get(verifyToken, usersController.getDataUser);
};

export default routes;
