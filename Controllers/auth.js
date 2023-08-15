import jwt from 'jsonwebtoken';
import User from './../Models/user.js';
import errorHandler from './../helpers/dbErrorHandler.js';

const signAdminIn = async (req, res) => {

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(200).json({
      type:'user',
      message: "Utilisateur introuvable. Veuillez entrer une adresse e-mail valide.",
    });
  } else {
    if (user.role != 1) {
      return res.status(200).json({
        type:'user',
        message: "Utilisateur introuvable. Veuillez entrer une adresse e-mail valide.",
      });
    }
    if (!user.authenticate(password)) {
      return res.status(200).json({
        type:'password',
        message: "Le mot de passe incorrect. Veuillez entrer un mot de passe valide.",
      });
    }

    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);

    return res.json({
      accessToken: token,
    });
  }
};

const signUserIn = async (req, res) => {

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(200).json({
      type:'email',
      message: "Invalide email address.",
    });
  } else {
    if (!user.authenticate(password)) {
      return res.status(200).json({
        type:'password',
        message: "Le mot de passe incorrect.",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    user.hashed_password = '';
    user.salt = '';

    return res.json({
      accessToken: token,
      user: user
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!name || name.length < 4 || name.length > 30 ) {
      return res.status(200).json({
        type:'name',
        message: "Le nom doit être entre 4 et 30 characters",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({
        type:'email',
        message: "Address email est deja existe.",
      });
    }
    if (!password || password.length < 6 || password.length > 30 ) {
      return res.status(200).json({
        type:'password',
        message: "Le mot de passe doit être entre 6 et 30 characters",
      });
    }

    const new_user = new User({ name, email });
    new_user.password = password
    await new_user.save();
    new_user.hashed_password = '';
    new_user.salt = '';
    return res.json({
      type: 'success',
      message: 'Votre account est crée avec succès',
      user: new_user
    });
  } catch (error) {
    return res.status(500).json({type: 'error', message: error.message});
  }
};


const requireSignIn = async function authMiddlware(req, res, next) {
  try {
    const Authorization = req.headers.authorization || null;
    if (Authorization) {
      const token = Authorization.split(' ')[1];
      const secretKey = process.env.JWT_SECRET;
      const verificationResponse = jwt.verify(token, secretKey);
      const userId = verificationResponse._id;
      const foundUser = await User.findOne({ _id: userId });

      if (foundUser) {
        foundUser.hashed_password = '';
        foundUser.salt = '';
        req.data = foundUser;
        next();
      } else {
        res.status(401).json({
          error: "Wrong authentication token",
        });
      }
    } else {
      res.status(404).json({
        error: "Authentication token missing",
      });
    }
  } catch (error) {
    res.status(401).json({
      error: "Wrong authentication token",
    });
  }
};

const isAuth = (req, res, next) => {
  let user = req.data;

  if (!user) {
    res.status(403).json({
      error: "Access denied",
    });
  }

  next();
};

const isAdmin = (req, res, next) => {
  if (req.data.role != 1) {
    return res.status(403).json({
      error: "Admin resource! Access denied",
    });
  }

  next();
};

export { signAdminIn, signUserIn, registerUser, requireSignIn, isAuth, isAdmin };