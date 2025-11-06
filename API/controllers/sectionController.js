const Section = require('../models/Sections');
const responseService = require('../services/responseService');
const Page = require('../models/Pages');

exports.createSection = async (req, res) => {
  try {
    const { title, notebookID, order } = req.body;

    if (!title) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        message: 'Section title is required'
      }));
    }

    if (!notebookID) {
      return res.status(400).json(responseService.createResponse({
        statusCode: 400,
        message: 'Notebook ID is required'
      }));
    }
    
    const regex = new RegExp(`^${title}( \\((\\d+)\\))?$`, "i");

    const existing = await Section
      .find({ notebookID, title: regex })
      .select('title')
      .lean();

    const used = new Set(existing.map(x => x.title.toLowerCase()));

    let newTitle = title;
    let counter = 1;

    while (used.has(newTitle.toLowerCase())) {
      newTitle = `${title} (${counter})`;
      counter++
    }
    
    const data = await Section.create({
      title: newTitle,
      notebookID,
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
      message: 'Failed to create section',
      data: err
    }));
  }
};

exports.updateSection = async (req, res) => {
  try{
    const { title, notebookID, order } = req.body;
    const sectionId = req.params.sectionId;
    // update section whatever comes in 
    const data = await Section.findByIdAndUpdate(sectionId, { title: title, notebookID: notebookID, order: order });
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