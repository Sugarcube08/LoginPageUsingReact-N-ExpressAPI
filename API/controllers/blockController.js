const Block = require('../models/Blocks');
const responseService = require('../services/responseService');

exports.createBlock = async (req, res) => {
    try{
        const pageId = req.params.pageId;
        const block = req.body;
        // first find all the blocks with no content or just spaces and delete them
        const emptyBlocks = await Block.find({ pageId: pageId, content: { $regex: /^\s*$/ } });
        await Promise.all(emptyBlocks.map(block => Block.findByIdAndDelete(block._id)));
        // create the new block
        const data = await Block.create({ ...block, pageId: pageId });
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to create block',
            data: err
        }));
    }
}

exports.getBlocks = async (req, res) => {
    try{
        const pageId = req.params.pageId;
        const data = await Block.find({ pageId: pageId});
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to get blocks',
            data: err
        }));
    }
}

exports.deleteBlock = async (req, res) => {
    try{
        const blockId = req.params.blockId;
        const data = await Block.findByIdAndDelete(blockId);
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to delete block',
            data: err
        }));
    }
}

exports.updateBlock = async (req, res) => {
    try{
        const blockId = req.params.blockId;
        const { content, position } = req.body;
        const data = await Block.findByIdAndUpdate(blockId, { content: content, position: position });
        return res.status(200).json(responseService.createResponse({
            statusCode: 200,
            data,
            meta: { hasMany: false }
        }));    
    }catch(err){
        return res.status(500).json(responseService.createResponse({
            statusCode: 500,
            message: 'Failed to update block',
            data: err
        }));
    }
}

exports.bulkUpdateBlocks = async (req, res) => {
    try{
        const blocks = req.body.blocks;
        // block is an array of objects, each with an id and content
        if (!blocks || !Array.isArray(blocks)) return res.status(400).json(responseService.createResponse({
            statusCode: 400,
            message: 'No blocks provided'
        }));
        const data = await blocks.map(async b => {
            const block = await Block.findByIdAndUpdate(b.id, { content: b.content, position: b.position });
            return block;
        });
        return res.status(200).json(responseService.createResponse({ statusCode: 200, data, meta: { hasMany: false } }));
    } catch (err) {
        return res.status(500).json(responseService.createResponse({ statusCode: 500, message: 'Failed to update blocks', data: err }));
    }
}