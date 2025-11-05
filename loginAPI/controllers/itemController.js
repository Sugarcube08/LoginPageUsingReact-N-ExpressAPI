const Items = require('../models/Items');
const responseService = require('../services/responseService');

exports.createItem = async (req, res) => {
    try{
        const title = req.body.title;
        const type = req.body.type;
        const parentID = req.body.parentID;
        const notebookID = req.params.notebookId;
        const order = req.body.order;
        if (!title) {
            response = responseService.createResponse({status: 400, message: 'Item title is required'});
            return res.status(400).json(response);
        }
        if (!type) {
            response = responseService.createResponse({status: 400, message: 'Item type is required'});
            return res.status(400).json(response);
        }
        if (!notebookID) {
            response = responseService.createResponse({status: 401, message: 'Notebook not found'});
            return res.status(401).json(response);
        }
        if (!parentID && !order) {
            response = responseService.createResponse({status: 400, message: 'Item parent or order is required'});
            return res.status(400).json(response);
        }
        const newItem = {
            title: title,
            type: type,
            parentID: parentID,
            notebookID: notebookID,
            order: order
        }
        const data = await Items.create(newItem);
        const item = responseService.createResponse({status: 201, data: data, meta: {hasMany: false}});
    }catch(err){

    }
}