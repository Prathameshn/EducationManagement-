const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('@utils/APIError');

var courseSchema = new Schema({
   name:{
        type:String,
        trim:true,
        unique:true,
        required: true
   },
   university:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'University'
   },
   teacherName:{
      type:String,
      required: true
   },
   isDeleted:{
      type:Boolean,
      default: false
   }
},
   { timestamps: true }
)

courseSchema.index({ name: 1,university:1 }, { unique: true });

courseSchema.method({
   transform() {
      const transformed = {};
      const fields = ['id','name','university','teacherName','isDeleted','updatedAt','createdAt'];

      fields.forEach((field) => {
         transformed[field] = this[field];
      });

      return transformed;
   },
})

courseSchema.statics = {
   /**
      * Get course Type
      *
      * @param {ObjectId} id - The objectId of course Type.
      * @returns {Promise<User, APIError>}
      */
   async get(id) {
      try {
         let course;
         if (mongoose.Types.ObjectId.isValid(id)) {
            course = await this.findById(id).populate('university').exec();
         }
         if (course) {
            return course;
         }

         throw new APIError({
            message: 'Course does not exist',
            status: httpStatus.NOT_FOUND,
         });
      } catch (error) {
         throw error;
      }
   },

   /**
      * List course Types in descending order of 'createdAt' timestamp.
      *
      * @param {number} skip - Number of course types to be skipped.
      * @param {number} limit - Limit number of course types to be returned.
      * @returns {Promise<Subject[]>}
      */
   async list({ page = 1, perPage = 100, search ,university,isDeleted=false }) {
      let options = omitBy({ university,search,isDeleted }, isNil);
      if(search && search.length > 0){
         let queryArr = []
         queryArr.push({ "name": { $regex: search, $options: 'i' } })
         queryArr.push({ "teacherName": { $regex: search, $options: 'i' } })
         options = { $and: [options, { $or: queryArr }] }
      }
      let courses = await this.find(options).populate('university')
         .sort({ createdAt: -1 })
         .skip(perPage * (page * 1 - 1))
         .limit(perPage * 1)
         .exec();
      courses = courses.map(course => course.transform())
      var count = await this.find(options).exec();
      count = count.length;
      var pages = Math.ceil(count / perPage);

      return { courses, count, pages }

   },
};


module.exports = mongoose.model('Course', courseSchema);
