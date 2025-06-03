const { getAllComics, getAllTags } = require("../../db/queries");

async function getIndex (req, res, next) {
    const comics = await getAllComics();
    const tags = await getAllTags();
    console.log(tags);
    res.render('index', { comics, tags });
}

module.exports = { getIndex} ;