const Notebook = require('../models/Notebooks');
const Items = require('../models/Items');
const Pages = require('../models/Pages');
const responseService = require('../services/responseService');
const { response } = require('express');

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
      data = responseService.createResponse({statusCode: 200, data: [], meta: {
        total: totalNotebooks,
        currentPage: (skip / limit) + 1,
        limit: limit || 10,
        skip: skip || 0,
        pages: Math.ceil(skip / limit) + 1,
        totalPages: Math.ceil(totalNotebooks - skip / (limit || 10))
      }});
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

exports.getNBData = async ({ notebookId }) => {
  try {
    // get all the complete data of the notebook including pages and sections
    const notebook = await Notebook.findById(notebookId);
    const pages = await Pages.find({ notebookID: notebookId });
    const sections = await Items.find({ notebookID: notebookId, type: 'section' });
    const totalPages = await Pages.countDocuments({ notebookID: notebookId });
    const totalSections = await Items.countDocuments({ notebookID: notebookId, type: 'section' });
    const responseData = responseService.createResponse({
      data: {
        notebook: notebook,
        pages: pages,
        sections: sections
      },
      meta: {
        totalPages: totalPages,
        totalSections: totalSections,
        hasMore: (totalPages> pages.length || totalSections > sections.length) ? true : false
      },
      statusCode: 200,

    });
    return responseData;

  }catch(err){

  }
}