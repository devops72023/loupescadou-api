import multer from "multer";
import path from 'path'


const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  };
  
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './Assets/Profile-Pictures/');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const newName = name + Date.now() + '.' + extension;
    req.body.image = newName;
    callback(null, newName);
  }
});
const storage2 = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './Assets/Products-images/');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const newName = name + Date.now() + '.' + extension;
    req.body.image = newName;
    callback(null, newName);
  }
});
const storage3 = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './Assets/Category-images/');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const newName = name + Date.now() + '.' + extension;
    req.body.image = newName;
    callback(null, newName);
  }
});

const storage4 = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder dynamically based on the file type
    let destinationFolder = '';
    
    if (file.fieldname === 'favicon') {
      destinationFolder = './Assets/favicon/';
    } else if (file.fieldname === 'logo') {
      destinationFolder = './Assets/images/';
    }
    
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    // Customize the filename if needed
    const ext = path.extname(file.originalname)
    const name = file.fieldname + '-' + Date.now() + ext
    if (file.fieldname === 'favicon') {
      req.body.favicon = name;
    } else if (file.fieldname === 'logo') {
      req.body.logo = name;
    }
    cb(null, name);
  },
});

const multerUsers =  multer({storage: storage})
const multerProducts =  multer({storage: storage2 })
const multerCategory =  multer({storage: storage3 })
const multerSetting =  multer({storage: storage4 })

export { multerUsers, multerProducts, multerCategory, multerSetting };