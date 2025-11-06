const Notebook = require('../models/Notebooks');
const Page = require('../models/Pages');
const responseService = require('../services/responseService');

exports.createPage = async (req, res) => {
  try {
    const { title, content, notebookID, sectionID, order } = req.body;

    if (!title) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        message: 'Page title is required'
      }));
    }

    if (!notebookID) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        message: 'Notebook ID is required'
      }));
    }

    const regex = new RegExp(`^${title}( \\((\\d+)\\))?$`, "i");

    // ✅ search only inside this section for duplicates
    const existing = await Page
      .find({ notebookID, sectionID, title: regex })
      .select('title')
      .lean();

    const used = new Set(existing.map(x => x.title.toLowerCase()));

    let newTitle = title;
    let counter = 1;

    while (used.has(newTitle.toLowerCase())) {
      newTitle = `${title} (${counter})`;
      counter++;
    }

    const data = await Page.create({
      title: newTitle,
      content,
      notebookID,
      sectionID,
      order
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
    const { title, content, notebookID, sectionID, order } = req.body;
    const pageId = req.params.pageId;
    const data = await Page.findByIdAndUpdate(pageId, { title: title, content: content, notebookID: notebookID, sectionID: sectionID, order: order });
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