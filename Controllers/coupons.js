import Coupon from '../Models/Coupon.js';


const list = async (req, res) => {
    try{
        const coupon = await Coupon.find()
        res.status(200).json(coupon)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const create = async (req, res) => {
    let data = {
        label: req.body.label,
        discount: req.body.discount
    }
    if ( req.body.code != '' ){
        data.code = req.body.code
    }
    try {
        let coupon = await new Coupon(data)
        coupon = await coupon.save();
        res.status(200).json({ message: 'New coupon created successfully !'});
    }catch(err){
        console.log(err)
        res.status(500).json({error: err.message})
    }
}

const findCouponById = async (req, res, next, id) => {
    try {
        const coupon = await Coupon.findOne({ _id : id })
        if (!coupon){
            return res.status(404).json({error: `No coupon with ID ${id} found!`})
        }
        req.coupon = coupon;
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
    next()
}

const read = (req, res) => {
    console.log(req.coupon)
    const coupon = req.coupon;
    if ( coupon ) {
        return res.status(200).json(coupon)
    }
    return res.status(404).json({error: `No coupon was found!`})
}

const update = async (req, res) => {
    try {
        const coupon = await Coupon
                            .findOneAndUpdate(
                                { _id : req.coupon._id },
                                { $set : req.body },
                                { new : true }
                            )
        return res.status(200).json(coupon)
    } catch (error) {
        return res.status(500).json({error: 'Something went wrong.'})
                            
    }
}
const remove = async (req, res) => {
    try {
        const coupon = await Coupon.deleteOne(
                                                { _id : req.coupon._id }
                                            )
        try {
            const coupons = await Coupon.find()
            if (!coupons){
                return res.status(200).json([]);
            }
            res.status(200).json({
                // deletedProduct,
                message: "Coupon removed successfully!",
                coupons: coupons
            });
            
        }catch (err){
            console.log(err)
            res.status(500).json({ error: "Une erreur s'est produite." });
        }
    } catch (error) {
        return res.status(500).json({error: 'Something went wrong.'})
                            
    }
}
async function deleteMultiple(req, res){
    try {
      let coupons = req.body;
      await Coupon.deleteMany({ _id: { $in: coupons }})
      coupons = await Coupon.find()
      return res.status(200).json({success: 'Coupons deleted successfully', coupons: coupons})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
  }

export { read, create, findCouponById, list, update, remove, deleteMultiple }