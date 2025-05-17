require('dotenv').config();
const pool = require('./pool');

async function insertPublisher({ name }) {
  const { rows } = await pool.query(
    'INSERT INTO Publishers (Name) values ($1) RETURNING PublisherId, Name',
    [name]
  );
  return rows[0];
}

async function insertAuthor({ firstName, lastName }) {
  const { rows } = await pool.query(
    'INSERT INTO Authors (FirstName, LastName) values ($1, $2) RETURNING AuthorId, FirstName, LastName',
    [firstName, lastName]
  );
  return rows[0];
}

async function insertArtist({ firstName, lastName }) {
  const { rows } = await pool.query(
    'INSERT INTO Artists (FirstName, LastName) values ($1, $2) RETURNING ArtistId, FirstName, LastName',
    [firstName, lastName]
  );
  return rows[0];
}

async function insertComic({ name, publishdate, description }) {
  const { rows } = await pool.query(
    `INSERT INTO Comics (Name, PublishDate, Description) values ($1, $2, $3) RETURNING ComicId, Name, PublishDate, Description`,
    [name, publishdate, description]
  );
  return rows[0];
}

async function getAuthorId({ firstName, lastName }) {
  const { rows } = await pool.query(
    'SELECT AuthorId from Authors WHERE ($1) = Authors.FirstName AND ($2) = Authors.LastName',
    [firstName, lastName]
  );
  return rows[0];
}

async function getArtistId({ firstName, lastName }) {
  const { rows } = await pool.query(
    'SELECT ArtistId from Artists WHERE ($1) = Artists.FirstName AND ($2) = Artists.LastName',
    [firstName, lastName]
  );
  return rows[0];
}

async function getPublisherId({ name }) {
  const { rows } = await pool.query(
    'SELECT PublisherId from Publishers WHERE ($1) = Publishers.Name',
    [name]
  );
  return rows[0];
}

async function getComicByName({ name }) {
  const { rows } = await pool.query('SELECT * from Comics WHERE name = $1', [
    name,
  ]);
  return rows[0];
}

async function addOrGetPublisher({ name }) {
  try {
    return await insertPublisher({ name });
  } catch (e) {
    console.error('There was an error', e);
    return await getPublisherId({ name });
  }
}

async function addOrGetAuthor({ firstName, lastName }) {
  try {
    return await insertAuthor({ firstName, lastName });
  } catch (e) {
    console.error('There was an error', e);
    return await getAuthorId({ firstName, lastName });
  }
}

async function addOrGetArtist({ firstName, lastName }) {
  try {
    return await insertArtist({ firstName, lastName });
  } catch (e) {
    console.error('There was an error', e);
    return await getArtistId({ firstName, lastName });
  }
}

async function linkArtistComic({ artistId, comicId }) {
  const { rows } = await pool.query(
    'INSERT INTO Artists_Draw_Comics (ArtistId, ComicId) VALUES ($1, $2)',
    [artistId, comicId]
  );
  return rows[0];
}

async function linkAuthorComic({ authorId, comicId }) {
  const { rows } = await pool.query(
    'INSERT INTO Authors_Write_Comics (AuthorId, ComicId) VALUES ($1, $2)',
    [authorId, comicId]
  );
  return rows[0];
}

async function linkPublisherComic({ publisherId, comicId }) {
  const { rows } = await pool.query(
    'INSERT INTO Publisher_Publishes_Comics (PublisherId, ComicId) VALUES ($1, $2)',
    [publisherId, comicId]
  );
  return rows[0];
}

async function linkComicTags({ comicId, tagName }) {
  const { rows } = await pool.query(
    `INSERT INTO Comics_Tags (ComicId, TagId) VALUES ($1, (SELECT TagId from Tags WHERE TagName = ($2))) RETURNING ComicId, TagId`,
    [comicId, tagName]
  );
  return rows[0];
}

async function updateAuthorById({ authorId, firstName, lastName }) {
  await pool.query(
    'UPDATE Authors SET FirstName = ($2), LastName = ($3) WHERE AuthorID = ($1)',
    [authorId, firstName, lastName]
  );

  return;
}

async function updateArtistById({ artistId, firstName, lastName }) {
  await pool.query(
    'UPDATE Artists SET FirstName = ($2), LastName = ($3) WHERE ArtistId = ($1)',
    [artistId, firstName, lastName]
  );

  return;
}

async function updatePublisherById({ publisherId, name }) {
  await pool.query(
    'UPDATE Publishers SET Name = ($2) WHERE PublisherId = ($1)',
    [publisherId, name]
  );

  return;
}

async function updateComicById({ comicId, name, publishdate, description }) {
  await pool.query(
    'UPDATE Comics SET NAME = ($2), PublishDate = ($3), DESCRIPTION = ($4) where ComicId = ($1)',
    [comicId, name, publishdate, description]
  );
}

async function removeComicTags({ comicId }) {
  const { rows } = await pool.query(
    `
    DELETE FROM Comics_Tags WHERE ComicId = ($1) RETURNING ComicId`,
    [comicId]
  );

  return rows[0];
}

async function addComic({
  name,
  publishdate,
  description,
  artistFirstName,
  artistLastName,
  authorFirstName,
  authorLastName,
  publisherName,
  tags,
}) {
  try {
    const { comicid: comicId } = await insertComic({
      name,
      description,
      publishdate,
    });

    const { authorid: authorId } = await addOrGetAuthor({
      firstName: authorFirstName,
      lastName: authorLastName,
    });

    const { artistid: artistId } = await addOrGetArtist({
      firstName: artistFirstName,
      lastName: artistLastName,
    });

    const { publisherid: publisherId } = await addOrGetPublisher({
      name: publisherName,
    });

    linkArtistComic({ artistId, comicId });
    linkAuthorComic({ authorId, comicId });
    linkPublisherComic({ publisherId, comicId });

    tags.forEach((tagName) => {
      linkComicTags({ comicId, tagName });
    });
  } catch (e) {
    console.error('there was an error', e);
  }
}

async function getComicWorkerIds({ comicid }) {
  const { rows } = await pool.query(
    `SELECT AuthorId, ComicId, PublisherId, ArtistId
    FROM DeepComicDetails
    WHERE ComicId = ($1)`
  );

  const {
    comicid: comicId,
    authorId: authorId,
    artistId: artistId,
    publisherid: publisherId,
  } = rows[0];

  return {
    comicId,
    authorId,
    artistId,
    publisherId,
  };
}

async function updateComic({
  comicId,
  name,
  publishdate,
  description,
  artistFirstName,
  artistLastName,
  authorFirstName,
  authorLastName,
  publisherName,
  tags,
}) {
  try {
    const { authorId, artistId, publisherId } = await getComicWorkerIds({
      comicId,
    });

    updateComicById({ comicId, name, publishdate, description });
    updateArtistById({
      artistId,
      firstName: artistFirstName,
      lastName: artistLastName,
    });
    updateAuthorById({
      authorId,
      firstName: authorFirstName,
      lastName: authorLastName,
    });
    updatePublisherById({ publisherId, publisherName });

    removeComicTags({ comicId });

    for (const tagName of tags) {
      await linkComicTags({ comicId, tagName });
    }
  } catch (e) {
    console.error('there was an error', e);
  }
}

async function getAllTags() {
  const { rows } = await pool.query(`SELECT TagName from Tags`);
  return rows.map((row) => row.tagname);
}

async function getTagsByComidId(comicId) {
  const { rows } = await pool.query(
    `SELECT TagName from Tags WHERE TagId IN (SELECT TagId FROM Comics_Tags WHERE ComicId = ($1))`,
    [comicId]
  );

  return rows.map((row) => row.tagname);
}

async function getAllComics() {
  const { rows } = await pool.query(`SELECT * FROM DeepComicDetails`);
  return rows;
}

async function getComicsByTagName(tagname) {
  const { rows } = await pool.query(
    `SELECT Comics.* from DeepComicDetails
      WHERE ComicId IN
        (SELECT ComicID
          FROM Comics_Tags
          WHERE TagId IN
            (SELECT TagId
              FROM TAGS
              WHERE TagName = ($1)))`,
    [tagname]
  );

  return rows;
}

async function getComicById(comicId) {
  const { rows } = await pool.query(
    'SELECT * from DeepComicDetails WHERE ComicId = $1',
    [comicId]
  );
  const tags = await getTagsByComidId(comicId);

  return { ...rows[0], tags };
}

module.exports = {
  addComic,
  updateComic,
  getAllTags,
  getComicsByTagName,
  getComicByName,
  getComicById,
  getAllComics,
};
