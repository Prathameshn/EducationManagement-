const express = require('express');
const controller = require('@controllers/university.controller');
const courseService = require("@services/course.service")
const router = express.Router();

router.param('universityId', controller.load);

router
   .route('/')
   .get(controller.list)
   .post(controller.create)

router 
   .route('/filter')
   .get(controller.filterCourse,courseService.getFilterCourses)

router
   .route('/:universityId')
   .get(controller.get)
   .patch(controller.update)
   .delete(controller.remove);

module.exports = router;
