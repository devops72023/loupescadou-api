import { Router} from 'express';
import {
    create,
    remove,
    update,
    read,
    list,
    deleteMultiple,
    popular,
    findProductById
} from '../Controllers/products.js';
import {findUserById} from '../Controllers/users.js';
import {requireSignIn, isAuth, isAdmin} from '../Controllers/auth.js';
import { multerProducts } from '../Controllers/multer-config.js';

const productsRouter = Router();

productsRouter.post('/', requireSignIn, isAuth, isAdmin, multerProducts.single('image'), create); // create a new product
productsRouter.get('/', list); // list by product
productsRouter.get('/popular', popular); // list by product
productsRouter.get('/:productId', read);
productsRouter.put('/:productId', requireSignIn, isAuth, isAdmin, multerProducts.single('image'), update);
productsRouter.delete('/:productId', requireSignIn, isAuth, isAdmin, remove); // remove the product
productsRouter.delete('/:userId/multiple', requireSignIn, isAuth, isAdmin, deleteMultiple);


productsRouter.param('productId', findProductById); // fine one
productsRouter.param('userId', findUserById); // finde one

export default productsRouter;