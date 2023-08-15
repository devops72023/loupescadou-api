import { Router } from 'express';
import { isAdmin, isAuth, requireSignIn } from '../Controllers/auth.js';
import { create, findCouponById, read, list, update, remove, deleteMultiple } from '../Controllers/coupons.js';
import { findUserById } from '../Controllers/users.js';

const couponRouter = Router();

couponRouter.get('/' , requireSignIn, isAuth, isAdmin, list)
couponRouter.get('/:couponId' , requireSignIn, isAuth, isAdmin, read)
couponRouter.post('/' , requireSignIn, isAuth, isAdmin, create)
couponRouter.put('/:couponId' , requireSignIn, isAuth, isAdmin, update)
couponRouter.delete('/:couponId' , requireSignIn, isAuth, isAdmin, remove)
couponRouter.delete('/:userId/multiple', requireSignIn, isAuth, isAdmin, deleteMultiple);

couponRouter.param('couponId',findCouponById)
couponRouter.param('userId', findUserById);

export default couponRouter;