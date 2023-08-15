import User from "../Models/user.js";
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import Order from "../Models/orders.js";



const qeuryAllUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

const findUserById = async (req, res, next, id) => {
    const user = await User.findById(id)
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    } else {
      req.profile = user;
      next();
    }
  };

const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
  };

const update = async (req, res) => {
  let newUser = { 
    name: req.body.nom,
    email: req.body.email,
    role: Number(req.body.role),
    about: req.body.description,
    }
  if(req.body.image!='null'){
    newUser.image = req.body.image
  }
  const user = await User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: newUser },
    { new: true }
  );
  if(user) {
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } else {
    return res.status(400).json({
      error: `User with ID ${req.profile._id} does not exist`,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { _id, name, phone, address, about } = req.body;
    console.log(address)
    if (!name || name.length < 4 || name.length > 30 ) {
      return res.status(200).json({
        type:'error',
        message: "Le nom doit être entre 4 et 30 characters",
      });
    }
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(200).json({
        type:'error',
        message: "L'utilisateur est introuvable",
      });
    }
    const reg = /^\+?(\d{1,3})?-?(\d{3})?-?\d{3}-?\d{4}$/;
    if (!reg.test(phone)) {
      return res.status(200).json({
        type:'error',
        message: "Le numero de telephone est incorrect.",
      });
    }
    const upd_user = await User.findOneAndUpdate({ _id },{ name, location: address, phone, about },{ new: true })
    return res.status(200).json({type:'success', message: "Les données sont modifier avec succes.", user: upd_user});

  } catch (error) {
    console.log(error);
    return res.status(400).json({'type': 'error', 'message': error.message});
  }
};

const updateCurrentUser = async (req, res) => {
  let USER = { 
    name: req.body.name,
    email: req.body.email,
    about: req.body.about,
  };
  if (req.body.image !== 'null') {
    USER.image = req.body.image;
  }
  console.log(USER)
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: USER },
      { new: true }
    ).select('-hashed_password -salt');

    if (user) {
      res.json(user);
    } else {
      return res.status(400).json({
        error: `User with ID ${req.profile._id} does not exist`,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

async function updatePassword(req, res){
  try {
    let user = await User.findOne({_id : req.profile._id });
    const cpwd = user.encryptPassword(req.body.cpwd);
    if (cpwd == user.hashed_password) {
      if(req.body.npwd == req.body.rpwd){
        await user.updatePassword(req.body.npwd) // update
        res.status(200).json({success: "Password updated successfully"});
      }else{
        return res.status(400).json({'unmatch_password': true})
      }
    }else{
      return res.status(400).json({'incorrect_password': true})
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const create = async (req, res) => {
  try {
    let newUser = { 
      name: req.body.nom,
      email: req.body.email,
      role: Number(req.body.role),
      about: req.body.description,
      }
    if(req.body.image!='null'){
      newUser.image = req.body.image
    }

    const user = await new User(newUser);
    user.password = Math.random().toString(36).slice(-8); // new Date.now();

    await user.save();
    res.status(200).json({message: "new user created successfully"})

  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Something went wrong creating the user', err: err.messages}); 
  }
}

async function deleteUser(req, res) {
  try {
    const result = await User.deleteOne({ _id: req.profile._id });
    if (result.deletedCount === 1) {
      try{
        const users = await User.find();
        res.status(200).json({message: "User deleted successfully", users: users});
      }catch(err){
          res.status(500).json({error: err.message});
      }
    } else {
      res.status(404).json({error: "User not found"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Error deleting user: ' + error.message});
  }
}

async function deleteMultiple(req, res){
  try {
    let users = req.body;
    await User.deleteMany({ _id: { $in: users }})
    users = await User.find()
    return res.status(200).json({success: 'Usere deleted successfully', users: users})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

const getOrders = async (req, res) => {
  try {
    let orders = await Order.find({
      user : req.data._id,
    }).populate({
        path: 'products',
        model: 'CartItem',
        populate: {
          path: 'product',
          model: 'Product',
        },
      }).populate('user').sort({ createdAt : 'desc' });
  
    res.json({ orders })
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
};

export { 
  qeuryAllUsers, 
  findUserById, 
  read, 
  update, 
  create, 
  deleteUser, 
  updateCurrentUser, 
  updatePassword, 
  deleteMultiple,
  updateUser,
  getOrders
}