const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.PGCONNECTIONSTRING,
});

const SQL = `
    CREATE TABLE IF NOT EXISTS Authors (
        AuthorId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        FirstName VARCHAR ( 128 ) NOT NULL,
        LastName VARCHAR ( 128 ),
        UNIQUE (FirstName, LastName)
    );

    CREATE TABLE IF NOT EXISTS Artists (
        ArtistId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        FirstName VARCHAR ( 128 ) NOT NULL,
        LastName VARCHAR ( 128 ),
        UNIQUE (FirstName, LastName)
    );

    CREATE TABLE IF NOT EXISTS Publishers (
        PublisherId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        Name VARCHAR ( 256 ) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Comics (
        ComicId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        Name VARCHAR ( 256 ) NOT NULL,
        PublishDate Date NOT NULL,
        Description Text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Tags (
        TagId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        TagName VARCHAR ( 128 ) UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Comics_Tags (
        ComicId INTEGER REFERENCES Comics(ComicId) NOT NULL,
        TagId INTEGER REFERENCES Tags(TagId) NOT NULL,
        PRIMARY KEY (ComicId, TagId)
    );

    CREATE TABLE IF NOT EXISTS Artists_Draw_Comics (
        ArtistId INTEGER REFERENCES Artists(ArtistId) NOT NULL,
        ComicId INTEGER REFERENCES Comics(ComicId) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Publisher_Publishes_Comics (
        PublisherId INTEGER REFERENCES Publishers(PublisherId) NOT NULL,
        ComicId INTEGER REFERENCES Comics(ComicId) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Authors_Write_Comics (
        AuthorId INTEGER REFERENCES Authors(AuthorId) NOT NULL,
        ComicId INTEGER REFERENCES Comics(ComicId) NOT NULL
    );
    
    INSERT INTO Tags (TagName) VALUES  
    ('Action'),
    ('Romance'),
    ('Sci-Fi'),
    ('Thriller'),
    ('Military');
    
    CREATE OR REPLACE VIEW DeepComicDetails AS 
      SELECT Comics.*,
      Authors.AuthorId,
      Authors.FirstName as AuthorFirstName,
      Authors.Lastname as AuthorLastName,
      Publishers.PublisherId,
      Publishers.name as PublisherName,
      Artists.ArtistId,
      Artists.FirstName as ArtistFirstName,
      Artists.LastName as ArtistLastName
      FROM Comics INNER JOIN Authors_Write_Comics as AWC ON Comics.ComicId = AWC.ComicId
      INNER JOIN Authors ON Authors.AuthorId = AWC.AuthorID
      INNER JOIN Publisher_Publishes_Comics AS PPC ON Comics.ComicID = PPC.ComicId
      INNER JOIN Publishers ON Publishers.PublisherId = PPC.PublisherId
      INNER JOIN Artists_Draw_Comics AS ADC On Comics.ComicId = ADC.ComicId
      INNER JOIN Artists ON Artists.ArtistId = ADC.ArtistId
      INNER JOIN Comics_Tags On Comics_Tags.ComicId = Comics.ComicId
      INNER JOIN Tags on Tags.TagId = Comics_Tags.TagId;
      
`;

async function main() {
  try {
    console.log('Seeding...');
    await client.connect();
    await client.query(SQL);
    console.log('Done');
  } catch (e) {
    console.error('There was an error', e);
  } finally {
    await client.end();
  }
}


main();