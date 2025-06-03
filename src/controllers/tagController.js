const { getComicsByTagName, getAllTags } = require('../../db/queries');

exports.tagsGet = async (req, res, next) => {
  const { tagname } = req.params;
  const comics = await getComicsByTagName(tagname);
  const tags = await getAllTags();
  res.render('index', { comics, tags });
};
