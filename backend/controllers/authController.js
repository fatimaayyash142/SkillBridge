const User = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");


const signToken = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
  return token;
};


const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
 
  const userDataToSend = user.toObject();
  delete userDataToSend.password;
  
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: userDataToSend
    }
  });
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, role, phone, website, description } = req.body;

   
    if (!name || !email || !password || !passwordConfirm || !role) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, password, passwordConfirm, and role"
      });
    }

    if (!["Candidate", "Organization"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'Candidate' or 'Organization'"
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      });
    }

   
    if (password !== passwordConfirm) {
      return res.status(400).json({
        message: "Password and password confirmation do not match"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Please use a different email."
      });
    }

    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      role: role,
      phone: (role === "Candidate" || role === "Organization") ? phone : undefined,
      website: role === "Organization" ? website : undefined,
      description: role === "Organization" ? description : undefined
    });

    console.log("New user registered:", newUser.email, "Role:", newUser.role);

    createSendToken(newUser, 201, res);

  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

 
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password"
      });
    }


    const currentUser = await User.findOne({ email: email.toLowerCase() }).select("+password");


    if (!currentUser) {
      console.log("Login attempt failed: User not found -", email);
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

  
    const isPasswordCorrect = await currentUser.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log("Login attempt failed: Wrong password for -", email);
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

  
    if (currentUser.status === "Suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support."
      });
    }

    console.log("User logged in successfully:", currentUser.email);
    createSendToken(currentUser, 200, res);

  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({
        message: "Admin must provide email and password"
      });
    }

    const adminUser = await User.findOne({
      email: email.toLowerCase(),
      role: "Admin"
    }).select("+password");

   
    if (!adminUser) {
      console.log("Admin login failed: User not found or not admin -", email);
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    
    const isPasswordCorrect = await adminUser.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log("Admin login failed: Wrong password -", email);
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    
    if (adminUser.status === "Suspended") {
      return res.status(403).json({
        message: "Admin account is suspended"
      });
    }

    console.log("Admin logged in:", adminUser.email);
    createSendToken(adminUser, 200, res);

  } catch (err) {
    console.log("Admin login error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please log in to access this resource."
      });
    }

    let decodedToken = null;

   
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
   
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Your session has expired. Please log in again."
        });
      }
      return res.status(401).json({
        message: "Invalid or malformed token"
      });
    }

  
    const currentUser = await User.findById(decodedToken.id);

    
    if (!currentUser) {
      return res.status(401).json({
        message: "User no longer exists in the database"
      });
    }

   
    if (currentUser.status === "Suspended") {
      return res.status(403).json({
        message: "Your account is suspended. Please contact support."
      });
    }

    
    if (currentUser.changedPasswordAfter(decodedToken.iat)) {
      return res.status(401).json({
        message: "Password was recently changed. Please log in again."
      });
    }

    req.user = currentUser;

    next();

  } catch (err) {
    console.log("Protection middleware error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Authentication error occurred"
    });
  }
};


exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
   
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to access this resource"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: `Only ${allowedRoles.join(" or ")} can access this resource. You are a ${req.user.role}.`
      });
    }

    
    next();
  };
};


exports.getMe = async (req, res) => {
  try {
    
    const userObject = req.user.toObject();
    delete userObject.password;

    res.status(200).json({
      status: "success",
      data: {
        user: userObject
      }
    });

  } catch (err) {
    console.log("Get current user error:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve current user information"
    });
  }
};