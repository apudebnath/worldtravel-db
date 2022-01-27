const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const res = require('express/lib/response');
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mthak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('worldtravel');
        const usersCollection = database.collection('users');
        const postsCollection = database.collection('posts');
        const reviewsCollection = database.collection('reviews')
      // User ui to database
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
      // User update amd insert
        app.put('/users', async(req, res) => {
          const user = req.body;
          const filter =  {email: user.email};
          const options = { upsert: true};
          const updateDoc ={$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })
      // Make admin
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          console.log('put', user);
          const filter =  {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })
      // Find Admin
        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email:email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin=true;
          }
          res.json({admin: isAdmin});
        })

      //Add post to database
        app.post('/posts', async(req, res) => {
          const post = req.body;
          const result = await postsCollection.insertOne(post);
          res.json(result);
        })
      // post database to ui
        app.get('/posts', async(req, res) => {
          const cursor = postsCollection.find({});
          const posts = await cursor.toArray();
          res.json(posts);
      })
      // search and get product by id
        app.get('/posts/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await postsCollection.findOne(query);
          res.json(result);
        })

      // Update status Data
      app.put('/statusUpdate/:id', async(req, res) => {
        const id = req.params.id;
        const updatedStatus = req.body.status;
        console.log(updatedStatus)
        const filter = {_id: ObjectId(id)};
        const result = await postsCollection.updateOne(filter, {
          $set: {status: updatedStatus}
        } )
        res.json(result);
        console.log(result)
      })
    // Delete order
      app.delete('/deletePost/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await postsCollection.deleteOne(query);
        res.json(result);
      })
/*     // Order data find by query and send db to ui
      app.get('/Orders', async(req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const cursor = ordersCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
      }) */
    //Users review ui to database
      app.post('/reviews', async(req, res) => {
        const review = req.body;
        console.log(review);
        const result = await reviewsCollection.insertOne(review)
        res.json(result);
      })
    // Review show in db to ui
      app.get('/reviews', async(req, res) => {
        const cursor = reviewsCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      })
    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('WorldTravel server running')
  })
  
  app.listen(port, () => {
    console.log(`My WorldTravel server running on : ${port}`)
  })