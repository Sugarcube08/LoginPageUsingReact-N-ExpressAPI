const Notebook = require('../models/Notebooks');
const Page = require('../models/Pages');
const Section = require('../models/Sections');
const responseService = require('../services/responseService');

exports.createPage = async (req, res) => {
  try {
    const { title, content, notebookID, sectionID } = req.body;

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

    // check if notebook exists
    const notebook = await Notebook.findById(notebookID);
    if (!notebook) {
      return res.status(404).json(responseService.createResponse({
        statusCode: 404,
        status: 'error',
        message: 'Notebook not found'
      }));
    }

    // check if section exists if sectionID is provided
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

    // create a new page with a unique name
    const newTitle = await generateUniquePageTitle(notebookID, sectionID || null, title);

    const data = await Page.create({
      title: newTitle,
      content,
      notebookID,
      sectionID
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