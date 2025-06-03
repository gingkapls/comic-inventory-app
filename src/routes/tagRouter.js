const { Router } = require('express');
const { tagsGet } = require('../controllers/tagController');
const tagRouter = Router({ mergeParams: true });

tagRouter.get('/:tagname', tagsGet);

module.exports = tagRouter;
