const apiServices = require('../services/apiServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const search = req.query.search;
    const page = parseInt(req.query.page);
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;
    const data = await apiServices.getUsers({ limit: limit, skip: skip, search: search, page: page, sortBy: sortBy, sortOrder: sortOrder });

    res.json(data);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await apiServices.getUser({ email: email });
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!data.data.email || !data.data.password) {
      return res.status(401).json({ "message": "Data not Provided" });
    }
    if (!data.data.email.match(emailRegex)) {
      return res.status(401).json({ "message": "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, data.data.password);
    if (!isMatch) { return res.status(401).json({ "message": "Invalid password" }); }

    // Create a clean user object for the token
    const userForToken = {
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      name: data.data.name
    };

    const token = jwt.sign(userForToken, process.env.APP_KEY, { expiresIn: '1h' });

    const responseData = {
      data: {
        ...userForToken,
        token: "Bearer " + token,
      },
      meta: {
        hasMore: false
      },
      success: true
    };

    res.json(responseData);

  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
}

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const passwordRegex = /^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ "message": "Missing required fields" });
    }

    if (!email.match(emailRegex)) {
      return res.status(401).json({ "message": "Invalid email" });
    }

    const isUsernameTaken = await apiServices.getUser({ username: username });

    if (isUsernameTaken.data) {
      return res.status(400).json({ "message": "Username already taken" });
    }

    const isEmailTaken = await apiServices.getUser({ email: email });

    if (isEmailTaken.data) {
      return res.status(400).json({ "message": "Email already taken" });
    }
    if (!password.match(passwordRegex)) {
      return res.status(400).json({ "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
    }
    const user = await apiServices.createUser({ username: username, email: email, password: password, name: name });
    return res.json(user);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const user = await apiServices.deleteUser({ username: req.user.username });
    const responseData = {
      data: {
        ...user,
      },
      meta: {
        hasMore: false
      },
      success: true
    };
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
}

exports.updateUser = async (req, res) => {
  try {
    const recievdData = {};
    for (const key in req.body) {
      if (req.body[key]) {
        recievdData[key] = req.body[key];
      }
    }

    const user = req.user;
    const initalData = await apiServices.getUser({ id: user._id });
    if (recievdData.username && recievdData.username !== initalData.data.username) {
      const isUsernameTaken = await apiServices.getUser({ username: recievdData.username });
      if (isUsernameTaken.data) {
        return res.status(400).json({ "message": "Username already taken" });
      }
    }
    if (recievdData.email && recievdData.email !== initalData.data.email) {
      const isEmailTaken = await apiServices.getUser({ email: recievdData.email });
      if (isEmailTaken.data) {
        return res.status(400).json({ "message": "Email already taken" });
      }
    }
    if (!initalData) {
      return res.status(401).json({ "message": "User not found" });
    }
    // update the user data
    const updatedData = await apiServices.updateUser({ id: user.id, data: recievdData });
    const responseData = {
      data: {
        ...updatedData,
      },
      meta: {
        hasMore: false
      },
      success: true
    };
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
}

exports.updatePassword = async (req, res) => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    const user = await apiServices.getUser({ username: req.user.username });
    if (!user) {
      return res.status(401).json({ data: { "message": "User not found" }, meta: { hasMore: false }, success: false });
    }
    const compare = await bcrypt.compare(password, user.data.password);
    if (compare) {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ data: { "message": "New passwords do not match" }, meta: { hasMore: false }, success: false });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await apiServices.updatePassword({ id: user.data.id, hashedPassword: hashedPassword });
      const responseData = {
        data: {
          ...updatedUser,
        },
        meta: {
          hasMore: false
        },
        success: true
      };
      res.json(responseData);
    } else {
      return res.status(401).json({ data: { "message": "Current password is incorrect" }, meta: { hasMore: false }, success: false });
    }
  } catch (err) {
    res.status(500).json({ data: { "message": err.message }, meta: { hasMore: false }, success: false });
  }
}