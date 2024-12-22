require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7ya1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const postCollection = client.db("lostDB").collection('postCollection');

    app.post('/addItems', async(req, res)=>{
        const body = req.body
        const result = await postCollection.insertOne(body)
        res.send(result) 
    })

    app.get('/getItems', async(req, res)=>{
        const result = await postCollection.find().toArray()
        res.send(result)
    })

    app.get('/recentPost', async(req, res)=>{
        const result = await postCollection.find().sort({ postedDate: -1 }).limit(6).toArray()
        res.send(result)
    })

   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Hello world BackToOwner server Running')
})

app.listen(port, ()=>{
    console.log(`BackToOwner Server Running PORT: ${port}`)
})