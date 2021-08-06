const University = require("@models/university.model")
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const { omit } = require('lodash');


/**
 * Load University and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
    try {
        const university = await University.get(id);
        if(university.isDeleted){
            return next(new APIError({message:"Sorry University deleted"}));
        }else{
            req.locals = { university };
            return next();
        }
    } catch (error) {
        return next(new APIError(error));
    }
 };

 /**
 * Get university obj
 * @public
 */
exports.get = (req, res) => res.json(req.locals.university);


/**
 * Update existing university
 * @public
 */
exports.update = (req, res, next) => {
    const updatedUniversity = omit(req.body);
    const university_ = Object.assign(req.locals.university, updatedUniversity);

    university_.save()
       .then(savedUniversity => res.json(savedUniversity))
       .catch(e => next(new APIError(e)));
 };

/**
 * Create new university obj
 * @public
 */
exports.create = async (req, res, next) => {
    try {        
        const university = new University(req.body);
        const saveduniversity = await university.save();
        res.status(httpStatus.CREATED);
        return res.json(saveduniversity.transform());
    } catch (error) {
        return next(new APIError(error));
    }
 };



/**
 * remove new university obj
 * @public
 */
exports.remove = async (req, res, next) => {
    //permanant delete procust
    const { university } = req.locals;

    university.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));

    //vertual deleted university
    // const updatedUniversity = omit({isDeleted:true});
    // const university_ = Object.assign(req.locals.university, updatedUniversity);

    // university_.save()
    //    .then(savedUniversity => res.json(savedUniversity))
    //    .catch(e => next(new APIError(e)));
};

  /**
 * Get feed list
 * @public
 */
exports.list = async (req, res, next) => {
    try {
        let { isDeleted } = req.query
        req.query.isDeleted = isDeleted ? isDeleted: false
        let universitys = await University.list(req.query);
        return res.json(universitys)
    } catch (error) { 
       next(new APIError(error));
    }
 };


 exports.filterCourse = async (req, res, next) => {
    try {
        let { GPA, GRE, country } = req.query
        let query = {}
        if(GPA){
            query.minimum_gpa = {$lte:GPA}
        }
        if(GRE){
            query.minimum_gre_score = {$lte:GRE}
        }
        if(country){
            query.country = { $regex: country, $options: 'i' }
        }
        let universities = await University.find(query,{_id:1})
        universities = universities.map((u)=>{
            return u._id
        })
        req.locals = {universities}
        return next()
    } catch (error) { 
       next(new APIError(error));
    }
 }