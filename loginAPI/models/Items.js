const mongoose = require('mongoose');

const Items = new mongoose.Schema({
    notebookID: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebooks', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['section', 'page'], required: true },
    parentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Items', default: null },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Items', Items);