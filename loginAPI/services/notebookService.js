const Notebook = require('../models/Notebooks');
const Page = require('../models/Pages');
const Section = require('../models/Sections');
const responseService = require('../services/responseService');

exports.getNBs = async ({ userID, limit, skip, search, page, sortBy, sortOrder }) => {
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
      data = responseService.createResponse({
        statusCode: 200, data: [], meta: {
          total: totalNotebooks,
          currentPage: (skip / limit) + 1,
          limit: limit || 10,
          skip: skip || 0,
          pages: Math.ceil(skip / limit) + 1,
          totalPages: Math.ceil(totalNotebooks - skip / (limit || 10))
        }
      });
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
    const notebook = await Notebook.findById(notebookId).lean();
    const sections = await Section.find({ notebookID: notebookId }).lean();
    const allPages = await Page.find({ notebookID: notebookId }).lean();

    if (!notebook) {
      return { error: 'Notebook not found' };
    }
    const directPages = allPages.filter(page => !page.sectionID);
    const sectionedPages = allPages.filter(page => page.sectionID);

    const nestedSections = sections.map(section => {
      const sectionPages = sectionedPages.filter(
        page => String(page.sectionID) === String(section._id)
      );

      return {
        ...section,
        pages: sectionPages,
      };
    });

    const data = {
      notebook: {
        ...notebook,
        directPages: directPages,
        sections: nestedSections,
      },
    };

    return responseService.createResponse({ statusCode: 200, data: data, meta: { hasMany: true } });

  } catch (err) {
    console.error("Error fetching notebook data:", err);
    return { error: 'Failed to retrieve notebook data' };
  }
};