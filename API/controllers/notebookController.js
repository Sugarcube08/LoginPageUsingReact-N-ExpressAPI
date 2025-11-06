const Notebook = require('../models/Notebooks');
const responseService = require('../services/responseService');
const notebookService = require('../services/notebookService');

exports.createNotebook = async (req, res) => {
    try{
        const title = req.body.title;
        const userID = req.user.data.id;
        if (!title) {
            response = responseService.createResponse({statusCode: 400, message: 'Notebook title is required'});
            return res.status(400).json(response);
        }
        if (!userID) {
            response = responseService.createResponse({statusCode: 401, message: 'User not found'});
            return res.status(401).json(response);
        }
        const newNotebook = {
            title: title,
            userID: userID
        }
        const data = await Notebook.create(newNotebook);
        const notebook = responseService.createResponse({statusCode: 201, data: data, meta: {hasMany: false}});
        res.json(notebook);
    }catch(err){

    }
}

exports.getNotebooks = async (req, res) => {
    try{
        const userID = req.user.data.id;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const search = req.query.search;
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy;
        const sortOrder = req.query.sortOrder;
        const data = await notebookService.getNBs({ userID: userID, limit: limit, skip: skip, search: search, page: page, sortBy: sortBy, sortOrder: sortOrder });

        res.json(data);
    }catch(err){

    }
}

exports.getNotebook = async (req, res) => {
    try{
        const notebookId = req.params.notebookId;
        const data = await notebookService.getNBData({ notebookId: notebookId });
        res.json(data);
        
    }catch{

    }
}

exports.deleteNotebook = async (req, res) => {
    try{
        const noteboookId = req.params.notebookId;
        const data = await Notebook.findByIdAndDelete(noteboookId);
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to delete notebook',
            data: err
        }));
    }
}

exports.updateNotebook = async (req, res) => {
    try{
        const { title, userID } = req.body;
        const noteboookId = req.params.notebookId;
        const data = await Notebook.findByIdAndUpdate(noteboookId, { title: title, userID: userID });
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to update notebook',
            data: err
        }));
    }
}