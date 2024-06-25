
const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()
const dbresponse = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

const dbresponses = dbObject => {
  return {
    diectorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//Get movies API
app.get('/movies/', async (request, response) => {
  const moviesQuery = `
    select movie_name From movie
    ;`
  const moviesArray = await db.all(moviesQuery)
  response.send(moviesArray.map(each => dbresponse(each)))
})

//add movie
app.post('/movies/', async (request, response) => {
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const moviesQuery = `
            INSERT INTO 
                movie(director_id,movie_name,lead_actor)
            VALUES(
            ${directorId},
            '${movieName}',
            '${leadActor}'
            );`

  const dbResponse = await db.run(moviesQuery)
  response.send('Movie Successfully Added')
})

//update movies
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getBody = request.body
  const {directorId, movieName, leadActor} = getBody
  const updatemoviesQuery = `
  UPDATE
    movie
  SET 
    director_id = ${directorId},
    movie_name ='${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`
  await db.run(updatemoviesQuery)
  response.send('Movie Details Updated')
})
//Get movies using movieId
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviequery = `
    SELECT * FROM movie
        WHERE movie_id = ${movieId}`
  const result = await db.get(moviequery)
  response.send(result)
})
///delete movies
app.delete('movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviequery = `
    DELETE 
        FROM
            movie
      WHERE 
      movie_id= ${movieId};`
  const dbresponse = await db.run(moviequery)
  response.send('Movie Removed')
})
// get directors list

app.get('/directors/', async (request, response) => {
  const moviesQuery = `
    select director_id,director_name From director
    ;`
  const moviesArray = await db.all(moviesQuery)
  response.send(moviesArray.map(each => dbresponses(each)))
})
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `select movie_name from movie where director_id = ${directorId}
   

  `
  const results = await db.get(query)
  response.send(results)
})
module.exports = app
