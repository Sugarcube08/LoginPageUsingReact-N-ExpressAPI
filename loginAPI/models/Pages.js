const mongoose = require('mongoose');

const Page = new mongoose.Schema({
    itemsID: { type: mongoose.Schema.Types.ObjectId, ref: 'Items', required: true },
    title: { type: String },
    content: { type: mongoose.mongoose.Mixed },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Pages', Page);