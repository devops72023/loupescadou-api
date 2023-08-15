import Order, { CartItem } from "../Models/orders.js";

async function list (req, res){
    try {
        const orders = await Order.find({})
                                .populate({
                                    path: 'products',
                                    populate: {
                                        path: 'product',
                                        model: 'Product',
                                    }
                                })
                                .populate('user')
        res.json(orders)
    } catch (error) {
        return res.status(500).json({error:'Something went wrong!' + error.message})
    }
}

async function countMonth (req, res){
    const year = req.body.year;// Note: month is zero-indexed in JavaScript Dates
    const month = req.body.month - 1;
    
    try {
        // Find orders within the specified date range
        const orders = await Order.find()
        const nOrders = orders.filter(item => {
            const cyear = new Date(item.createdAt).getFullYear();
            const cmonth = new Date(item.createdAt).getMonth(); 
            return cyear == year && cmonth == month
        })
        return res.status(200).json(nOrders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return res.status(500).json({error: 'Something went wrong!'})
    };
};

async function findOrderById (req, res, next, id){
    try {
        // Find orders within the specified date range
        const order = await Order.findOne({ _id: id })
        // console.log(order);
        req.order = order
        next();
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return res.status(500).json({error: 'Something went wrong!' + error.message})
    }
}

async function deleteOrder(req, res){
    try {
        // Find orders within the specified date range
        const order = await Order.findOneAndDelete({ _id: req.order._id })
        const orders = await Order.find({})
                                .populate({
                                    path: 'products',
                                    populate: {
                                        path: 'product',
                                        model: 'Product',
                                    }
                                })
                                .populate('user');
        res.status(200).json({'success': 'Deleted successfully!', orders: orders})
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return res.status(500).json({error: 'Something went wrong!' + error.message})
    }
}
async function updateStatus(req, res){
    try {
        // Find orders within the specified date range
        const order = await Order.findOneAndUpdate({ _id: req.order._id }, {$set: req.body}, {new:true})
        res.status(200).json({'success': 'Updated successfully!'})
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return res.status(500).json({error: 'Something went wrong!' + error.message})
    }
}

export { list, countMonth, deleteOrder, findOrderById, updateStatus }