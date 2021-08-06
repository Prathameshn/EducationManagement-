const Course = require("@models/course.model")
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const { omit } = require('lodash');

exports.getFilterCourses = async(req,res,next)=>{
    try{
        let { universities } = req.locals
        let { course } = req.query
        if(!universities.length){
            return res.json([])
        }
        if(course && course.length){
            let courses = await Course.find({ "name": { $regex: course, $options: 'i' },university:{$in:universities} }).populate('university')
            return res.json(courses)
        }else{
            let courses = await Course.find({university:{$in:universities} }).populate('university')
            return res.json(courses)
        }
        search
    }catch(error){
        return next(new APIError(error))
    }
}