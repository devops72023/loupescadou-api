import { Router } from 'express';
import { requireSignIn, isAuth, isAdmin } from '../Controllers/auth.js';
import { read, create } from '../Controllers/setting.js';
import { multerSetting } from '../Controllers/multer-config.js';

const settingRouter = Router();

settingRouter.get('/', read);
settingRouter
    .post(
        '/', 
        requireSignIn, 
        isAuth, 
        isAdmin, 
        multerSetting.fields([
            { name: 'favicon', maxCount: 1 },
            { name: 'logo', maxCount: 1 }
        ]), 
        create);


export default settingRouter