const { Router } = require('express');
const {
  comicUpdateGet,
  comicGet,
  comicUpdatePost,
  comicAddGet,
  comicAddPost,
  comicDeleteGet,
} = require('../controllers/comicController');

const comicRouter = Router({ mergeParams: true });

comicRouter.get('/add', comicAddGet);
comicRouter.post('/add', comicAddPost);


comicRouter.get('/delete/:comicid', comicDeleteGet);

comicRouter.get('/:comicid', comicGet);
comicRouter.get('/update/:comicid', comicUpdateGet);
comicRouter.post('/update/:comicid', comicUpdatePost);

module.exports = comicRouter;
