const Course = require("@models/course.model")
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const { omit } = require('lodash');


/**
 * Load Course and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
    try {
        const course = await Course.get(id);
        if(course.isDeleted){
            return next(new APIError({message:"Sorry Course deleted"}));
        }else{
            req.locals = { course };
            return next();
        }
    } catch (error) {
        return next(new APIError(error));
    }
 };

 /**
 * Get course obj
 * @public
 */
exports.get = (req, res) => res.json(req.locals.course);


/**
 * Update existing course
 * @public
 */
exports.update = (req, res, next) => {
    const updatedCourse = omit(req.body);
    const course_ = Object.assign(req.locals.course, updatedCourse);

    course_.save()
       .then(savedCourse => res.json(savedCourse))
       .catch(e => next(new APIError(e)));
 };

/**
 * Create new course obj
 * @public
 */
exports.create = async (req, res, next) => {
    try {
        req.body.history = [{
            action :"AVAILABLE",
            executeAt:new Date()
        }]
        const course = new Course(req.body);
        const savedcourse = await course.save();
        res.status(httpStatus.CREATED);
        return res.json(savedcourse.transform());
    } catch (error) {
        return next(new APIError(error));
    }
 };



/**
 * remove new course obj
 * @public
 */
exports.remove = async (req, res, next) => {
    //permanant delete procust
    // const { course } = req.locals;

    // course.remove()
    //   .then(() => res.status(httpStatus.NO_CONTENT).end())
    //   .catch(e => next(new APIError(error)));

    //vertual deleted course
    const updatedCourse = omit({isDeleted:true});
    const course_ = Object.assign(req.locals.course, updatedCourse);

    course_.save()
       .then(savedCourse => res.json(savedCourse))
       .catch(e => next(new APIError(e)));
};

  /**
 * Get feed list
 * @public
 */
exports.list = async (req, res, next) => {
    try {
        let { isDeleted } = req.query
        req.query.isDeleted = isDeleted ? isDeleted: false
        let courses = await Course.list(req.query);
        return res.json(courses)
    } catch (error) { 
       next(new APIError(error));
    }
 };
 