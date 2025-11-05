const Users = require('../models/Users');

exports.getUsers = async ({ limit, skip, search, page, sortBy, sortOrder }) => {
  let users = {}
  if (search) {
    users = await Users.find().limit(limit).skip(skip || page * limit).or([
      { username: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ])
  } else {
    users = await Users.find().limit(limit).skip(skip || page * limit).sort({ [sortBy]: (sortOrder === 'asc' ? 1 : -1) })
  }

  const totalUsers = search ? await Users.find().or([
    { username: { $regex: search, $options: 'i' } },
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ]).countDocuments() : await Users.countDocuments();
  let data;
  if (users.length === 0) {
    data = {
      data: [],
      meta: {
        total: totalUsers,
        currentPage: (skip / limit) + 1,
        limit: limit || 10,
        skip: skip || 0,
        pages: Math.ceil(skip / limit) + 1,
        totalPages: Math.ceil(totalUsers - skip / (limit || 10))
      }
    }
    return data;
  } else {
    data = {
      data: users,
      meta: {
        total: totalUsers,
        currentPage: (skip / limit) + 1,
        limit: limit || 10,
        skip: skip || 0,
        pages: Math.ceil(skip / limit) + 1,
        totalPages: Math.ceil(totalUsers / (limit || 10))
      }
    }
    return data;
  }
};

exports.getUser = async ({ id = '', username = '', name = '', email = '' }) => {
  const conditions = [];

  if (id) {
    conditions.push({ _id: id });
  }
  if (username) {
    conditions.push({ username: username });
  }
  if (name) {
    conditions.push({ name: name });
  }
  if (email) {
    conditions.push({ email: email });
  }
  const user = await Users.findOne({
    $or: conditions
  });


  const responseData = {
    data: user,
    meta: {
      hasMore: false
    },
    success: true
  };

  return responseData;
}

exports.createUser = async ({ username, email, password, name }) => {
  const newUser = {};
  if (username) {
    newUser.username = username;
  }
  if (email) {
    newUser.email = email;
  }
  if (password) {
    newUser.password = password;
  }
  if (name) {
    newUser.name = name;
  }
  const user = await Users.create(newUser);
  if (user) {
    const responseData = {
      data: {
        ...user,
      },
      meta: {
        hasMore: false
      },
      success: true
    };
    return responseData;
  } else {
    throw new Error('Failed to create user');
  }
}

exports.updateUser = async ({ id, data }) => {
  const user = await Users.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const updatedUser = await Users.findOneAndUpdate({ _id: id }, data);
  return updatedUser._doc;
}

exports.updatePassword = async ({ id, hashedPassword }) => {
  const user = await Users.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const updatedUser = await Users.findOneAndUpdate({ _id: id }, { password: hashedPassword });
  return updatedUser._doc;
}

exports.deleteUser = async ({ id }) => {
  const user = await Users.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const deletedUser = await Users.findOneAndDelete({ _id: id });
  return deletedUser._doc;
}