require('dotenv').config()
const express = require('express')
const app = express()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const cors = require('cors')

const port = process.env.PORT || 5000

app.use(cors())
const jwt = require('jsonwebtoken')
const { query } = require('express')
//for body parsing
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, server working')
})

// AUTH
app.post('/login', async (req, res) => {
  const user = req.body
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: '1d',
  })
  res.send({ accessToken })
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ka5da.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    await client.connect()

    const seatCollection = client.db('busTicket').collection('Seats')
    const busCollection = client.db('busTicket').collection('Buses')
    const bookingCollection = client.db('busTicket').collection('bookings')

    // Home items
    app.get('/getHomeItems', async (req, res) => {
      const query = {}
      const limit = 6
      const cursor = productCollection.find(query).limit(limit)
      const items = await cursor.toArray()
      res.send(items)
    })

    // single item
    app.get('/getInventory/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const cursor = await productCollection.findOne(query)
      res.send(cursor)
    })

    // index for buses
    app.get('/buses', async (req, res) => {
      const query = {}
      const cursor = busCollection.find(query)
      const buses = await cursor.toArray()
      res.send(buses)
    })
    // index for seats
    app.get('/seats', async (req, res) => {
      const query = {}
      const cursor = seatCollection.find(query)
      const seats = await cursor.toArray()
      res.send(seats)
    })

    // create seat
    app.post('/addSeat', async (req, res) => {
      const newSeat = req.body
      const result = await seatCollection.insertOne(newSeat)
      res.send(result)
    })
    // create bus
    app.post('/addBus', async (req, res) => {
      const newBus = req.body
      const result = await busCollection.insertOne(newBus)
      res.send(result)
    })

    // booking or reserve seats
    app.post('/bookingSeat', async (req, res) => {
      const bookingSeat = req.body
      const result = await bookingCollection.insertOne(bookingSeat)
      res.send(result)
    })
    // find all reserved seats
    app.post('/reservedSeat', async (req, res) => {
      const date = req.body.date
      const query = { date: date }
      const cursor = bookingCollection.find(query)
      const arr = await cursor.toArray()
      res.send(arr)
    })
    // delete
    app.delete('/item/:itemId', async (req, res) => {
      // const id = req.body;
      const id = req.params.itemId

      const query = { _id: ObjectId(id) }

      const result = await productCollection.deleteOne(query)
      if (result.deletedCount === 1) {
        console.log('Successfully deleted one document.')
      } else {
        console.log('No documents matched the query. Deleted 0 documents.')
      }
      // res.send(result);
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Running my mongo db')
})
app.listen(port, () => {
  console.log('listening server to port', port)
})
