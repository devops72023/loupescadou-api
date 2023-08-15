import { Router } from 'express'
import User from '../Models/user.js';
import Order from '../Models/orders.js';
import Product from '../Models/product.js';
import Category from '../Models/category.js';
import { isAdmin, isAuth, requireSignIn } from '../Controllers/auth.js';


const adminRouter = Router();

adminRouter.get('/all', requireSignIn, isAuth, isAdmin, async (req, res)=>{
    try {
        const users = await User.countDocuments({});
        const orders = await Order.countDocuments({});
        const products = await Product.countDocuments({});
        const categories = await Category.countDocuments({});
        res.status(200).json({'orders': orders,'products':products,'users':users,'categories':categories})
    } catch (error) {
        res.status(500).json({error: 'something went wrong!'})
    }
})

adminRouter.get('/countProductsByCategory', requireSignIn, isAuth, isAdmin, async (req, res)=>{
    try{
        let arr = []
        const categories = await Category.find({})
        await Promise.all(categories.map(async cat => {
            const products = await Product.find({ category: cat._id })
            arr.push({
                name: cat.name,
                "Nombre des produit": products.length
            })
        }))
        res.status(200).json(arr)
    }catch(err){
        res.status(500).json({error: 'Something went wrong! '+err.message})
    }
})
adminRouter.get('/countRevenueByMonth', requireSignIn, isAuth, isAdmin, async (req, res)=>{
    try{
        let arr = []
        const monthArray = ['janvier',  'février',  'mars',  'avril',  'mai',  'juin',  'juillet',  'août',  'septembre',  'octobre',  'novembre',  'décembre'];
        const year = new Date().getFullYear()
        await Promise.all(monthArray.map(async (month, index) => {
            const orders = await Order.find()
            const nOrders = orders.filter(item => {
                const cyear = new Date(item.createdAt).getFullYear();
                const cmonth = new Date(item.createdAt).getMonth(); 
                return cyear == year && cmonth == index
            })
            let totalAmount = 0;
            nOrders.map(item=>{
                if(item.status == "Shipped" || item.status == 'Delivered'){
                    totalAmount += item.amount
                }
            })
            arr.push({
                month: monthArray[index],
                "Nous avons gagné": totalAmount
            })
        }))
        let sortedArr = []
        monthArray.map((month, index)=>{
            arr.map((m,i) => {
                if(month == m.month) sortedArr.push(m)
            })
        })
        res.status(200).json(sortedArr)
    }catch(err){
        res.status(500).json({error: 'Something went wrong! '+err.message})
    }
})

export default adminRouter;