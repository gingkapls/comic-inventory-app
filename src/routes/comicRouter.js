const { Router } = require('express');
const { comicUpdateGet, comicGet, comicUpdatePost } = require('../controllers/comicController');

const comicRouter = Router({ mergeParams: true });

comicRouter.get('/:comicId', comicGet);
comicRouter.get('/update/:comicId', comicUpdateGet);
comicRouter.post('/update/:comicId', comicUpdatePost);

module.exports = comicRouter;
