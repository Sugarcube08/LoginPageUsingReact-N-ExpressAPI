const Section = require('../models/Sections');
const responseService = require('../services/responseService');
const Page = require('../models/Pages');
const Notebook = require('../models/Notebooks');

exports.createSection = async (req, res) => {
  try {
    const { title, notebookID } = req.body;

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

    // create a new section with a unique name
    const newTitle = await generateUniqueSectionTitle(notebookID, title);

    const data = await Section.create({
      title: newTitle,
      notebookID
    });

    return res.status(201).json(responseService.createResponse({
      statusCode: 201,
      data,
      meta: { hasMany: false }
    }));

  } catch (err) {
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to create section',
      data: err
    }));
  }
};

exports.updateSection = async (req, res) => {
  try{
    const { title, notebookID } = req.body;
    const sectionId = req.params.sectionId;
    // update section whatever comes in 
    const data = await Section.findByIdAndUpdate(sectionId, { 
      title: title, 
      notebookID: notebookID 
    });
    return res.status(200).json(responseService.createResponse({
      statusCode: 200,
      data,
      meta: { hasMany: false }
    }));
  }catch(err){
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to update section',
      data: err
    }));  
  }
}

exports.deleteSection = async (req, res) => {
  try{
    const sectionId = req.params.sectionId;
    // delete section and all pages under it
    const data = await Section.findByIdAndDelete(sectionId);
    const pages = await Page.find({ sectionID: sectionId });
    if (pages.length > 0) {
      const pageIds = pages.map(page => page._id);
      await Page.deleteMany({ _id: { $in: pageIds } });
    }
    return res.status(200).json(responseService.createResponse({
      statusCode: 200,
      data,
      meta: { hasMany: false }
    }));
  }catch(err){
    return res.status(500).json(responseService.createResponse({
      statusCode: 500,
      message: 'Failed to delete section',
      data: err
    }));
  }
}