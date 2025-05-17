const { getAllComics } = require("../../db/queries");

async function getIndex (req, res, next) {
    const comics = await getAllComics();
    res.render('index', { comics });
}

module.exports = { getIndex} ;