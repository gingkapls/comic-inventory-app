const { getComicById, getAllTags, updateComic } = require('../../db/queries');

exports.comicGet = async (req, res, next) => {
  const { comicId } = req.params;
  const comic = await getComicById(comicId);
  res.render('partials/comicCard', { comic });
};

exports.comicUpdateGet = async (req, res, next) => {
  const { comicId } = req.params;
  const comic = await getComicById(comicId);
  const tags = await getAllTags();
  console.log('GET route', comic);
  res.render('partials/updateForm', { comic, tags });
};

exports.comicUpdatePost = async (req, res, next) => {
  const {
    name,
    publishdate,
    authorFirstName,
    authorLastName,
    artistFirstName,
    artistLastName,
    publisherName,
    tags,
  } = req.body;
  
  const { comicid: comicId } = req.params;
  await updateComic({
    comicId,
    name,
    publishdate,
    authorFirstName,
    authorLastName,
    artistFirstName,
    artistLastName,
    publisherName,
    tags,
  });
  res.redirect('/');
};
