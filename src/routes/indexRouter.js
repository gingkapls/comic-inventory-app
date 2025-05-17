const { Router } = require('express');
const { getIndex } = require('../controllers/indexController');

const indexRouter = Router({ mergeParams: true });

indexRouter.get('/', getIndex);

module.exports = indexRouter;
