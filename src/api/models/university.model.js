const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('@utils/APIError');

var universitySchema = new Schema({
   name:{
        type:String,
        trim:true,
        unique:true,
        required: true
   },
   description:{
        type:String,
        required: true
   },
   country:{
      type:String,
      required: true
   },
   minimum_gpa:{
      type:Number,
      required: true
   },
   minimum_gre_score:{
      type:Number,
      required: true
   },
   isDeleted:{
      type:Boolean,
      default: false
   }
},
   { timestamps: true }
)

universitySchema.index({ name: 1,country:1 }, { unique: true });

universitySchema.method({
   transform() {
      const transformed = {};
      const fields = ['id','name','description','country','minimum_gpa','isDeleted',
      'minimum_gre_score','updatedAt','createdAt'];

      fields.forEach((field) => {
         transformed[field] = this[field];
      });

      return transformed;
   },
})

universitySchema.statics = {
   /**
      * Get university Type
      *
      * @param {ObjectId} id - The objectId of university Type.
      * @returns {Promise<User, APIError>}
      */
   async get(id) {
      try {
         let university;
         if (mongoose.Types.ObjectId.isValid(id)) {
            university = await this.findById(id).exec();
         }
         if (university) {
            return university;
         }

         throw new APIError({
            message: 'University does not exist',
            status: httpStatus.NOT_FOUND,
         });
      } catch (error) {
         throw error;
      }
   },

   /**
      * List university Types in descending order of 'createdAt' timestamp.
      *
      * @param {number} skip - Number of university types to be skipped.
      * @param {number} limit - Limit number of university types to be returned.
      * @returns {Promise<Subject[]>}
      */
   async list({ page = 1, perPage = 100, search ,_id ,isDeleted=false }) {
      let options = omitBy({ _id,isDeleted }, isNil);
      if(search && search.length > 0){
         let queryArr = []
         queryArr.push({ "name": { $regex: search, $options: 'i' } })
         queryArr.push({ "description": { $regex: search, $options: 'i' } })
         queryArr.push({ "city": { $regex: search, $options: 'i' } })
         options = { $and: [options, { $or: queryArr }] }
      }
      let Universities = await this.find(options)
         .sort({ createdAt: -1 })
         .skip(perPage * (page * 1 - 1))
         .limit(perPage * 1)
         .exec();
      Universities = Universities.map(university => university.transform())
      var count = await this.find(options).exec();
      count = count.length;
      var pages = Math.ceil(count / perPage);

      return { Universities, count, pages }

   },
};


module.exports = mongoose.model('University', universitySchema);
