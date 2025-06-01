require('dotenv').config();
const pool = require('./pool');

async function insertPublisher({ publishername }) {
  const { rows } = await pool.query(
    'INSERT INTO Publishers (Name) values ($1) RETURNING PublisherId, Name',
    [publishername]
  );
  return rows[0];
}

async function insertAuthor({ authorfirstname, authorlastname }) {
  const { rows } = await pool.query(
    'INSERT INTO Authors (FirstName, LastName) values ($1, $2) RETURNING AuthorId, FirstName, LastName',
    [authorfirstname, authorlastname]
  );
  return rows[0];
}

async function insertArtist({ artistfirstname, artistlastname }) {
  const { rows } = await pool.query(
    'INSERT INTO Artists (FirstName, LastName) values ($1, $2) RETURNING ArtistId, FirstName, LastName',
    [artistfirstname, artistlastname]
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

async function getAuthorId({ authorfirstname, authorlastname }) {
  const { rows } = await pool.query(
    'SELECT AuthorId from Authors WHERE ($1) = Authors.FirstName AND ($2) = Authors.LastName',
    [authorfirstname, authorlastname]
  );
  return rows[0];
}

async function getArtistId({ artistfirstname, artistlastname }) {
  const { rows } = await pool.query(
    'SELECT ArtistId from Artists WHERE ($1) = Artists.FirstName AND ($2) = Artists.LastName',
    [artistfirstname, artistlastname]
  );
  return rows[0];
}

async function getPublisherId({ publishername }) {
  const { rows } = await pool.query(
    'SELECT PublisherId from Publishers WHERE ($1) = Publishers.Name',
    [publishername]
  );
  return rows[0];
}

async function getComicByName({ name }) {
  const { rows } = await pool.query('SELECT * from Comics WHERE name = $1', [
    name,
  ]);
  return rows[0];
}

async function addOrGetPublisher({ publishername }) {
  try {
    return await insertPublisher({ publishername });
  } catch (e) {
    console.error('There was an error', e);
    return await getPublisherId({ publishername });
  }
}

async function addOrGetAuthor({ authorfirstname, authorlastname }) {
  try {
    return await insertAuthor({ authorfirstname, authorlastname });
  } catch (e) {
    console.error('There was an error', e);
    return await getAuthorId({ authorfirstname, authorlastname });
  }
}

async function addOrGetArtist({ artistfirstname, artistlastname }) {
  try {
    return await insertArtist({ artistfirstname, artistlastname });
  } catch (e) {
    console.error('expected: artist already exists', e);
    return await getArtistId({ artistfirstname, artistlastname });
  }
}

async function linkArtistComic({ artistid, comicid }) {
  const { rows } = await pool.query(
    'INSERT INTO Artists_Draw_Comics (ArtistId, ComicId) VALUES ($1, $2)',
    [artistid, comicid]
  );
  return rows[0];
}

async function linkAuthorComic({ authorid, comicid }) {
  const { rows } = await pool.query(
    'INSERT INTO Authors_Write_Comics (AuthorId, ComicId) VALUES ($1, $2)',
    [authorid, comicid]
  );
  return rows[0];
}

async function linkPublisherComic({ publisherid, comicid }) {
  const { rows } = await pool.query(
    'INSERT INTO Publisher_Publishes_Comics (PublisherId, ComicId) VALUES ($1, $2)',
    [publisherid, comicid]
  );
  return rows[0];
}

async function linkComicTags({ comicid, tagname }) {
  const { rows } = await pool.query(
    `INSERT INTO Comics_Tags (ComicId, TagId) VALUES ($1, (SELECT TagId from Tags WHERE TagName = ($2))) RETURNING ComicId, TagId`,
    [comicid, tagname]
  );
  return rows[0];
}

async function updateAuthorById({ authorid, authorfirstname, authorlastname }) {
  await pool.query(
    'UPDATE Authors SET FirstName = ($2), LastName = ($3) WHERE AuthorID = ($1)',
    [authorid, authorfirstname, authorlastname]
  );

  return;
}

async function updateArtistById({ artistid, artistfirstname, artistlastname }) {
  await pool.query(
    'UPDATE Artists SET FirstName = ($2), LastName = ($3) WHERE ArtistId = ($1)',
    [artistid, artistfirstname, artistlastname]
  );

  return;
}

async function updatePublisherById({ publisherid, publishername }) {
  await pool.query(
    'UPDATE Publishers SET Name = ($2) WHERE PublisherId = ($1)',
    [publisherid, publishername]
  );

  return;
}

async function updateComicById({ comicid, name, publishdate, description }) {
  await pool.query(
    'UPDATE Comics SET NAME = ($2), PublishDate = ($3), DESCRIPTION = ($4) where ComicId = ($1)',
    [comicid, name, publishdate, description]
  );
}

async function removeComicTags({ comicid }) {
  const { rows } = await pool.query(
    `
    DELETE FROM Comics_Tags WHERE ComicId = ($1) RETURNING ComicId`,
    [comicid]
  );

  return rows[0];
}

async function deleteComicById({ comicid }) {
  const queries = [
    pool.query(`DELETE FROM Artists_DRAW_Comics WHERE ComicId = ($1)`, [
      comicid,
    ]),
    pool.query(`DELETE FROM Authors_Write_Comics WHERE ComicId = ($1)`, [
      comicid,
    ]),
    pool.query(`DELETE FROM Publishers_Publish_Comics WHERE ComicId = ($1)`, [
      comicid,
    ]),
    pool.query(`DELETE FROM Comics WHERE ComicId = ($1)`, [comicid]),
  ];

  return await Promise.allSettled(queries);
}

async function addComic({
  name,
  publishdate,
  description,
  artistfirstname,
  artistlastname,
  authorfirstname,
  authorlastname,
  publishername,
  tags,
}) {
  try {
    const { comicid } = await insertComic({
      name,
      description,
      publishdate,
    });

    const { authorid } = await addOrGetAuthor({
      authorfirstname,
      authorlastname,
    });

    const { artistid } = await addOrGetArtist({
      artistfirstname,
      artistlastname,
    });

    const { publisherid } = await addOrGetPublisher({
      publishername,
    });

    await linkArtistComic({ artistid, comicid });
    await linkAuthorComic({ authorid, comicid });
    await linkPublisherComic({ publisherid, comicid });

    if (tags?.length === 0) return;

    for (const tagname of tags) {
      await linkComicTags({ comicid, tagname });
    }
  } catch (e) {
    console.error('there was an error', e);
  }
}

async function getComicWorkerIds({ comicid }) {
  const { rows } = await pool.query(
    `SELECT AuthorId, ComicId, PublisherId, ArtistId
    FROM DeepComicDetails
    WHERE ComicId = ($1)`,
    [comicid]
  );

  return rows[0];
}

async function updateComic({
  comicid,
  name,
  publishdate,
  description,
  artistfirstname,
  artistlastname,
  authorfirstname,
  authorlastname,
  publishername,
  tags,
}) {
  try {
    const { authorid, artistid, publisherid } = await getComicWorkerIds({
      comicid,
    });

    updateComicById({ comicid, name, publishdate, description });
    updateArtistById({
      artistid,
      artistfirstname,
      artistlastname,
    });
    updateAuthorById({
      authorid,
      authorfirstname,
      authorlastname,
    });
    updatePublisherById({ publisherid, publishername });

    removeComicTags({ comicid });
    
    if (tags.length === 0) return;

    for (const tagname of tags) {
      await linkComicTags({ comicid, tagname });
    }
  } catch (e) {
    console.error('there was an error', e);
  }
}

async function getAllTags() {
  const { rows } = await pool.query(`SELECT TagName from Tags`);
  return rows.map((row) => row.tagname);
}

async function getTagsByComidId(comicid) {
  const { rows } = await pool.query(
    `SELECT TagName from Tags WHERE TagId IN (SELECT TagId FROM Comics_Tags WHERE ComicId = ($1))`,
    [comicid]
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

async function getComicById(comicid) {
  const { rows } = await pool.query(
    'SELECT * from DeepComicDetails WHERE ComicId = $1',
    [comicid]
  );
  const tags = await getTagsByComidId(comicid);

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
  deleteComicById,
};
