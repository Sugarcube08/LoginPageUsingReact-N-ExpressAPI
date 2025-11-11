const Notebook = require('../models/Notebooks');
const Page = require('../models/Pages');
const Section = require('../models/Sections');
const responseService = require('../services/responseService');

const generateUniquePageTitle = async (notebookID, sectionID, baseTitle) => {
  // build query filter
  const filter = { notebookID };

  if (sectionID) {
    filter.sectionID = sectionID;
  } else {
    // explicitly match null pages
    filter.sectionID = null;
  }

  // regex: baseTitle or baseTitle (n)
  const regex = new RegExp(`^${baseTitle}( \\(\\d+\\))?$`, 'i');

  const existing = await Page.find({
    ...filter,
    title: regex
  }).select('title');

  if (existing.length === 0) return baseTitle;

  let maxN = 0;

  existing.forEach(doc => {
    const m = doc.title.match(/\((\d+)\)$/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxN) maxN = num;
    } else {
      // raw title exists → counts as 0
      if (doc.title.toLowerCase() === baseTitle.toLowerCase()) {
        if (maxN === 0) maxN = 0;
      }
    }
  });

  return `${baseTitle} (${maxN + 1})`;
}


exports.createPage = async (req, res) => {
  try {
    const { title, notebookID, sectionID } = req.body;

    if (!title) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        status: 'error',
        message: 'Title is required'
      }));
    }

    if (!notebookID) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        status: 'error',
        message: 'Notebook ID is required'
      }));
    }

    const notebook = await Notebook.findById(notebookID);
    if (!notebook) {
      return res.status(404).json(responseService.createResponse({
        statusCode: 404,
        status: 'error',
        message: 'Notebook not found'
      }));
    }

    if (sectionID) {
      const section = await Section.findById(sectionID);
      if (!section) {
        return res.status(404).json(responseService.createResponse({
          statusCode: 404,
          status: 'error',
          message: 'Section not found'
        }));
      }
    }
    
    const newTitle = await generateUniquePageTitle(notebookID, sectionID || null, title);
    const data = await Page.create({
      title: newTitle,
      notebookID: notebookID,
      sectionID: sectionID || null,
    });

    return res.status(201).json(responseService.createResponse({
      statusCode: 201,
      data,
      meta: { hasMany: false }
    }));

  } catch (err) {
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to create page',
      data: err
    }));
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { title, content, notebookID, sectionID } = req.body;
    const pageId = req.params.pageId;
    const data = await Page.findByIdAndUpdate(pageId, { 
      title: title, 
      content: content, 
      notebookID: notebookID, 
      sectionID: sectionID 
    });
    return res.status(200).json(responseService.createResponse({
      statusCode: 200,
      data,
      meta: { hasMany: false }
    }));
  } catch (err) {
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to update page',
      data: err
    }));
  }
}

exports.deletePage = async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const data = await Page.findByIdAndDelete(pageId);
    return res.status(200).json(responseService.createResponse({
      statusCode: 200,
      data,
      meta: { hasMany: false }
    }));
  } catch (err) {
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to delete page',
      data: err
    }));
  }
}