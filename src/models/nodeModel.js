const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    pageTitle: {
        type: String,
        required:true
    },
    pageUrl: {
        type: String,
        required: true,
        unique:true
    },
    nodeChildren: [{
        link:{type:String,required:true},
        node:{type:Object, default: {}}
    }]
});


const Node = mongoose.model('Node', nodeSchema);

module.exports = Node;