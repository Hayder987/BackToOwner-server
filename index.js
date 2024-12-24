require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7ya1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const postCollection = client.db("lostDB").collection("postCollection");
    const dataCollection = client.db("lostDB").collection("dataCollection");

    // post post data
    app.post("/addItems", async (req, res) => {
      const body = req.body;
      const result = await postCollection.insertOne(body);
      res.send(result);
    });

   // search api 
    app.get("/getItems", async (req, res) => {
      const search = req.query.search 
  
      let option = {}
      if(search){
        option = {
          $or: [
            { location: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
          ]
        };
      }
       
      const result = await postCollection.find(option).toArray();
      res.send(result);
      
    });

    //get recent added post
    app.get("/recentPost", async (req, res) => {
      const result = await postCollection
        .find()
        .sort({ postedDate: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // get user Data by email
    app.get("/userData", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await postCollection.find(query).toArray();
      res.send(result);
    });

    //  find post Data by id
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send(result);
    });

    //update post Data by id
    app.patch('/updateItems/:id', async(req, res)=>{
      const id = req.params.id;
      const body = req.body;
      const query = {_id: new ObjectId(id)}
      const {title,status,category,description,location,lostDate,thumbnail} = body
      const updateDoc = {
        $set: {
          title:title,
          status:status,
          category:category,
          description:description,
          location:location,
          lostDate:lostDate,
          thumbnail:thumbnail
        },
      };
      const result = await postCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    //allRecovered post api
    app.get('/allRecovered', async(req, res)=>{
      const email = req.query.email
      const query = {recoveredEmail:email}
      const result = await dataCollection.find(query).toArray()
      res.send(result)
    })
    
    //delete post by id
    app.delete('/postId/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await postCollection.deleteOne(query)
      res.send(result)
    })

    // add find Lost Data and Update status
    app.post("/addData", async (req, res) => {
      const body = req.body;
      const result = await dataCollection.insertOne(body);

      // change Status
      const query = { _id: new ObjectId(body.postId) };
      const updateDoc = {
        $set: {
          status: "recovered",
        },
      };

      const result2 = await postCollection.updateOne(query, updateDoc);
      res.send(result2);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world BackToOwner server Running");
});

app.listen(port, () => {
  console.log(`BackToOwner Server Running PORT: ${port}`);
});
