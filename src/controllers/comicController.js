const {
  getComicById,
  getAllTags,
  updateComic,
  addComic,
  deleteComicById,
} = require('../../db/queries');
const { formatDateAsHTML } = require('../lib/dateUtils');

exports.comicAddGet = async (req, res, next) => {
  const tags = await getAllTags();
  res.render('partials/comicForm', { formatDateAsHTML, tags });
};

exports.comicAddPost = async (req, res, next) => {
  const {
    name,
    publishdate,
    description,
    artistfirstname,
    artistlastname,
    authorfirstname,
    authorlastname,
    publishername,
    tags,
  } = req.body;

  await addComic({
    name,
    publishdate,
    description,
    artistfirstname,
    artistlastname,
    authorfirstname,
    authorlastname,
    publishername,
    tags,
  });

  res.redirect('/');
};

exports.comicGet = async (req, res, next) => {
  const { comicid } = req.params;
  const comic = await getComicById(comicid);
  res.render('comicDetails', { comic, formatDateAsHTML });
};

exports.comicDeleteGet = async (req, res, next) => {
  const { comicid } = req.params;
  await deleteComicById({ comicid });
  res.redirect('/');
};

exports.comicUpdateGet = async (req, res, next) => {
  const { comicid } = req.params;
  const comic = await getComicById(comicid);
  const tags = await getAllTags();
  res.render('partials/comicForm', { comic, tags, formatDateAsHTML });
};

exports.comicUpdatePost = async (req, res, next) => {
  const {
    name,
    publishdate,
    authorfirstname,
    authorlastname,
    artistfirstname,
    artistlastname,
    publishername,
    description,
    tags,
  } = req.body;

  const { comicid } = req.params;
  await updateComic({
    comicid,
    name,
    publishdate,
    authorfirstname,
    authorlastname,
    artistfirstname,
    artistlastname,
    publishername,
    description,
    tags,
  });
  res.redirect('/');
};
