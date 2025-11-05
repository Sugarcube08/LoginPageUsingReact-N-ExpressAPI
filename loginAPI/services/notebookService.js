const Notebook = require('../models/Notebooks');

exports.getNBs = async ({userID, limit, skip, search, page, sortBy, sortOrder}) => {
//  notebook of only userID user
  let notebooks = {}
  try {
    if (search) {
      notebooks = await Notebook.find().where({ userID: userID }).limit(limit).skip(skip || page * limit).or([
        { title: { $regex: search, $options: 'i' } },
        { userID: { $regex: search, $options: 'i' } },
      ])
    } else {
      notebooks = await Notebook.find().where({ userID: userID }).limit(limit).skip(skip || page * limit).sort({ [sortBy]: (sortOrder === 'asc' ? 1 : -1) })
    }

    const totalNotebooks = search ? await Notebook.find().where({ userID: userID }).or([
      { title: { $regex: search, $options: 'i' } },
      { userID: { $regex: search, $options: 'i' } },
    ]).countDocuments() : await Notebook.find().where({ userID: userID }).countDocuments();
    let data;
    if (notebooks.length === 0) {
      data = {
        data: [],
        meta: {
          total: totalNotebooks,
          currentPage: (skip / limit) + 1,
          limit: limit || 10,
          skip: skip || 0,
          pages: Math.ceil(skip / limit) + 1,
          totalPages: Math.ceil(totalNotebooks - skip / (limit || 10))
        }
      }
      return data;
    } else {
      data = {
        data: notebooks,
        meta: {
          total: totalNotebooks,
          currentPage: (skip / limit) + 1,
          limit: limit || 10,
          skip: skip || 0,
          pages: Math.ceil(skip / limit) + 1,
          totalPages: Math.ceil(totalNotebooks / (limit || 10))
        }
      }
      return data;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};