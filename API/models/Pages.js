const mongoose = require('mongoose')

const PageSchema = new mongoose.Schema({
    notebookID: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebooks', required: true },
    sectionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Sections', default: null },
    title: { type: String, default: '' },
    orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

PageSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

module.exports = mongoose.model('Pages', PageSchema)
