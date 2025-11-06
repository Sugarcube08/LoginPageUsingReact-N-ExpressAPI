const mongoose = require('mongoose');
const { create } = require('./Pages');

const Section = new mongoose.Schema({
    title: { type: String, required: true },
    notebookID: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebooks', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Sections', Section);