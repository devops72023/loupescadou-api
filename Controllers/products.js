import formidable from 'formidable'
import _ from 'lodash';
import fs from 'fs';
import Product from '../Models/product.js'
import Category from '../Models/category.js'
import bodyParser from 'body-parser';
import errorHandler from "../helpers/dbErrorHandler.js";

const create = async (req, res) => {
  try {
    let newProduct = { 
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      quantity: Number(req.body.quantity),
      sold: Number(req.body.sold),
      about: req.body.description,
      photo : req.body.image
      }

    const product = await new Product(newProduct);

    await product.save();
    res.status(200).json({message: "new product created successfully"})

  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Something went wrong creating the product', err: err.messages}); 
  }
};

const findProductById = async (req, res, next, id) => {
  const product = await Product.findById(id)
                          .populate("category")
  if (!product) {
    res.status(400).json({
      error: `Product with ID ${id} not found`,
    });
  } else {
    req.product = product;
  }

  next();
};

const read = (req, res) => {
  let product = req.product;

  if (product) {
    return res.json({
      product,
    });
  }
};

const remove = async (req, res) => {
  let product = req.product;

  try {
    const product = req.product;
    const deletedUser = await Product.deleteOne({ _id : product._id })
    try {
      const products = await Product.find()
                                .populate('category')
      if (!products){
        return res.status(200).json([]);
      }
      res.status(200).json({
        // deletedProduct,
        message: "Product successfully deleted",
        products: products
      });
  
    }catch (err){
      console.log(err)
      res.status(500).json({ error: "Une erreur s'est produite." });
    }
  
    
  } catch (err) {
    console.log(err)
    res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// just for testing purpose
const removeAllProducts = (req, res) => {
  Product.deleteMany({}, (err) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      });
    } else {
      res.status(200).json({
        message: "All products were successfully deleted",
      });
    }
  });
};

const update = async (req, res) => {
  try {
    let newProduct = { 
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      quantity: Number(req.body.quantity),
      sold: Number(req.body.sold),
      about: req.body.description,
      }
    if(req.body.image!='null'){
      newProduct.photo = req.body.image
    }

    const product = await Product.findOneAndUpdate(
                              {_id : req.product._id},
                              { $set: newProduct },
                              { new: true }
                            );

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Something went wrong creating the product', err: err.messages}); 
  }
};

const list = async (req, res) => {
  try {
    const products = await Product.find()
                              .populate('category')
    if (!products){
      return res.status(200).json([]);
    }
    let productsList = [];
    products.forEach(product => {

    });
    return res.status(200).json(products);

  }catch (err){
    res.status(500).json({ error: "Une erreur s'est produite." });
  }

};

const listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({
    // this means 'except this product on request' (reference product)
    _id: { $ne: req.product },
    category: req.product.category,
  })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      } else {
        res.json(products);
      }
    });
};

const listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    } else {
      res.json(categories);
    }
  });
};

const listBySearch = (req, res) => {
  var order = req.body.order ? req.body.order : "desc";
  var sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  var limit = req.body.limit ? parseInt(req.body.limit) : 100;
  var skip = parseInt(req.body.skip);
  var findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          // gte - greater than price [0-10]
          // lte - less than
          // MongoDB notation
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  console.log("findArgs:", findArgs);

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      } else {
        res.json({
          size: data.length,
          products: data,
        });
      }
    });
};

const getPhoto = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);

    return res.send(req.product.photo.data);
  }

  next();
};

const listSearch = (req, res) => {
  // create query object to handle incoming search
  // and category value, from params
  const query = {};

  // assign search value to query.name filter
  if (req.query.search) {
    query.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  // assign category value to query.category
  if (req.query.category && req.query.category != "All") {
    query.category = req.query.category;
  }

  if (query.name || query.category) {
    console.log("here 2", query);

    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      } else {
        res.json(products);
      }
    }).select("-photo");
  }
};

const decreaseProductQuantity = (req, res, next) => {
  try {
    let bulkOps = req.body.data.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: {
            $inc: {
              quantity: -item.count,
              sold: +item.count,
            },
          },
        },
      };
    });

    Product.bulkWrite(bulkOps, {}, (error, products) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update product",
        });
      }

      next();
    });
  } catch (error) {
    console.log(error);
  }
};
const popular = async (req, res)=>{
  try {
    const products = await Product.find()
                              .populate('category')
                              .limit(4)
    return res.status(200).json({'success': products})
  } catch (error) {
    return res.status(400).json({'error': error.message });
  }
}
async function deleteMultiple(req, res){
  try {
    let products = req.body;
    await Product.deleteMany({ _id: { $in: products }})
    products = await Product.find()
    return res.status(200).json({success: 'Products deleted successfully', products: products})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

export {
  create,
  remove,
  update,
  read,
  list,
  findProductById,
  popular,
  deleteMultiple}