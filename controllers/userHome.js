const Courses = require("../models/courses")

module.exports = async (req, res) => {
        const courses = await Courses.find({});
        console.log(courses);
        res.render("user-home", {
            courses
        });
}