const Courses = require("../models/courses")

module.exports = async (req, res) => {
    const courseDetails = await Courses.findById(req.params.id).populate('userid');
    console.log(courseDetails)
    res.render('course-details',{
        courseDetails
    });    
}