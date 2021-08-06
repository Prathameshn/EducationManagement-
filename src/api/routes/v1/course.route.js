const express = require('express');
const controller = require('@controllers/course.controller');
const router = express.Router();

router.param('courseId', controller.load);

router
   .route('/')
   .get(controller.list)
   .post(controller.create)

router
   .route('/:courseId')
   .get(controller.get)
   .patch(controller.update)
   .delete(controller.remove);
   
module.exports = router;
