const mongoose = require('mongoose');
const projectmembers = new mongoose.Schema(
    {
        user :
            {
                type:mongoose.Schema.Types.ObjectId,
                ref : 'User',
                required : true
            },
        project : { type:mongoose.Schema.Types.ObjectId, ref:'Project' , required: true},
        role : {type:String , default:"Member" , enum :['Admin','Member'] , required:true}
    }
)
const Project_Members = mongoose.model('Project_members',projectmembers);
module.exports = Project_Members;