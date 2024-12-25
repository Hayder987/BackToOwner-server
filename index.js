require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials:true
}));

app.use(express.json());
app.use(cookieParser());

const verifyToken=(req, res, next)=>{
  const token = req.cookies.token
  
  if(!token){
  return  res.status(401).send('UnAuthorized: Authentication credentials are missing')
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded)=>{
    if(err){
      return  res.status(401).send('UnAuthorized: Authentication credentials are inValid') 
    }

    req.user = decoded
    next()
  })

}

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

   //create jwt token
    app.post('/jwt', (req, res)=>{
       const user = req.body
       const token =jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {expiresIn:'1d'})
       
       res.cookie('token', token, {
    
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
       }).send({status:true})
    })

    //remove jwt token
    app.post('/logOut', (req, res)=>{
      res.clearCookie('token', {
    
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
      }).send({status:'token Cleared'})
    })


    // post post data
    app.post("/addItems",verifyToken, async (req, res) => {
      const body = req.body;
      const result = await postCollection.insertOne(body);
      res.send(result);
    });

   // search api and get post data api
    app.get("/getItems", async (req, res) => {
      const search = req.query.search 
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size)
  
      let option = {}
      if(search){
        option = {
          $or: [
            { location: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
          ]
        };
      }
       
      const result = await postCollection.find(option).skip(page*size).limit(size).toArray()

      res.send(result); 
    });

    // pagination count
    app.get('/pages', async(req, res)=>{
      const count = await postCollection.estimatedDocumentCount()
      res.send({count})
    })

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
    app.get("/userData",verifyToken, async (req, res) => {
      const email = req.query.email;
      if(req.user.email !== email){
        return res.status(403).send("UnAuthorized: Access Denied!")
      }
      const query = { email: email };
      const result = await postCollection.find(query).toArray();
      res.send(result);
    });

    //  find post Data by id
    app.get("/item/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send(result);
    });

    //update post Data by id
    app.patch('/updateItems/:id', verifyToken, async(req, res)=>{
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
    app.get('/allRecovered',verifyToken, async(req, res)=>{
      const email = req.query.email
      if(req.user.email !== email){
        return res.status(403).send("UnAuthorized: Access Denied!")
      }
      const query = {recoveredEmail:email}
      const result = await dataCollection.find(query).toArray()
      res.send(result)
    })
    
    //delete post by id
    app.delete('/postId/:id', verifyToken, async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await postCollection.deleteOne(query)
      res.send(result)
    })

    // add find Lost Data and Update status
    app.post("/addData", verifyToken, async (req, res) => {
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
