const mongoose = require('mongoose');
const Schema = mongoose.Schema

const CourseSchema = new Schema ({
    title: String,
    description: String,
    image: String,
    isPublic: false,
    datePosted: {
       type: Date,
       default: new Date(),
    },
    creatorID: {
       type: Schema.Types.ObjectId,
       ref: "Users",
    }
})

const Courses = mongoose.model("Courses", CourseSchema);
module.exports = Courses;


