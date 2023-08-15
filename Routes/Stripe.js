import { Router } from 'express';
import Product from './../Models/product.js';
import Order, { CartItem } from '../Models/orders.js';
import Stripe from 'stripe';
import { config } from "dotenv";
config();

const router = new Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body;
    try {
        // Unanderstand code !!!
        const transformedItems = products.map(item => {
            return {
                quantity : item.quantity,
                price_data: {
                    currency: 'eur',
                    unit_amount: item.product.price * 100,
                    product_data: {
                        name: item.product.title,
                        images : [ `${process.env.VITE_ASSETS}/Products-images/${item.product.photo}`]
                    }
                }
            }

        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: transformedItems,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries : [ "FR" ]
            },
            success_url:`${process.env.VITE_DOMAINE}/success`,
            cancel_url: `${process.env.VITE_DOMAINE}/`,
        });

        // console.log(' \n\n', session, '\n\n' );
        
        const items = await Promise.all(products.map(async item => {
            const product = await Product.findOne({ _id: item.product._id })
            product.quantity = product.quantity - item.quantity;
            product.sold = product.sold + item.quantity;
            await product.save()
            return {
                product: item.product._id,
                quantity: item.quantity
            }
        }))
        console.log('items ', items)
        const cartItems = await CartItem.insertMany(items);

        const order = await Order.create({
            transaction_id: session.id,
            amount: session.amount_total / 100,
            products: cartItems.map(item => item._id)
        })

        res.status(200).json({
            id:session.id
        })

    } catch (error) {
        console.log(error.message);
        res.status(200).json({
            error : error.message,
            status : -1
        })
    }
})

export default router