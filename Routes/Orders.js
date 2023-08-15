import { Router } from 'express';
import { list, countMonth, deleteOrder, findOrderById, updateStatus } from '../Controllers/orders.js'
import { isAdmin, isAuth, requireSignIn } from '../Controllers/auth.js';

const ordersRoute = Router();

ordersRoute.param('id', findOrderById)
ordersRoute.get('/', requireSignIn, isAuth, list)
ordersRoute.post('/month', requireSignIn, isAuth, isAdmin, countMonth)
ordersRoute.delete('/:id', requireSignIn, isAuth, isAdmin, deleteOrder)
ordersRoute.put('/:id/update-status', requireSignIn, isAuth, isAdmin, updateStatus)

export default ordersRoute;