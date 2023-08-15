
import { Router } from 'express';
import { create, read, list, update, remove, findCategoryById, deleteMultiple, productsByCategory, productByName } from '../Controllers/category.js';
import {findUserById} from '../Controllers/users.js';
import {requireSignIn, isAuth, isAdmin} from '../Controllers/auth.js';
import { multerCategory } from '../Controllers/multer-config.js';

const categoryRouter = Router();

categoryRouter.get('/:categoryId', read);
categoryRouter.get('/', list);
categoryRouter.post('/', requireSignIn, isAuth, isAdmin, multerCategory.single('image'), create);
categoryRouter.put('/:categoryId', requireSignIn, isAuth, isAdmin, multerCategory.single('image'), update);
categoryRouter.delete('/:categoryId', requireSignIn, isAuth, isAdmin, remove);
categoryRouter.delete('/:userId/multiple', requireSignIn, isAuth, isAdmin, deleteMultiple);

// Product by category
categoryRouter.get('/:categoryId/products', productsByCategory);
categoryRouter.post('/:categoryId/productsByName', productByName);

categoryRouter.param('categoryId', findCategoryById);
categoryRouter.param('userId', findUserById);

export default categoryRouter;