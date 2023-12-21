const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tc98zmm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("TaskManager").collection("users");
    const taskCollection = client.db("TaskManager").collection("tasks");


 // <---------------- Users ---------------->
    //set User data
    app.post("/users", async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "User already exists!", insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });
  
      app.get("/users", async (req, res) => {
        const email = req.query.email;
        
        if (email) {
          console.log("Received a request to /users?email", email);
          const query = { email: email };
          const result = await userCollection.findOne(query);
          return res.send(result);
        }
      
        console.log("Received a request to /users (all users)");
        const allUsers = await userCollection.find().toArray();
        res.send(allUsers);
      });


// <----------------- Tickets ------------------>
app.post("/tasks", async (req, res) => {
    console.log("Received a request to /tasks");
    const item = req.body;
    const result = await taskCollection.insertOne(item);
    res.send(result);
  });
  app.get("/tasks", async (req, res) => {
    console.log("Received a request to /tasks");
  
    const email = req.query.userEmail;
  
    if (email) {
      console.log("Received a request to /tasks?userEmail", email);
      const query = { userEmail: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    } else {
      // If userEmail is not provided, retrieve all tickets
      const allTickets = await taskCollection.find().toArray();
      res.send(allTickets);
    }
  });
  
  app.get("/tasks/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      console.log("Fetching ticket by ID:", id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
  
      if (result) {
        console.log("Task found:", result);
        res.send(result);
      } else {
        console.log("Task not found");
        res.status(404).send("Task not found");
      }
    } catch (error) {
      console.error("Error fetching Task by ID:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.put('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedTask = req.body;
    const taskUpdated = {
      $set: {
        title: updatedTask.title,
        deadline: updatedTask.deadline,
        priority: updatedTask.priority,
        state: updatedTask.state,
        note: updatedTask.note,
        userEmail: updatedTask.userEmail,
      }
    };
    try {
      const result = await taskCollection.updateOne(filter, taskUpdated);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating task');
    }
  });
  app.delete('/tasks/:id', async(req, res) => {
    const id = req.params.id;
    console.log("Requested Id to delete: ", id);
    const query = {_id: new ObjectId (id)};
    console.log("Requested query to delete: ", query);
    const result = await taskCollection.deleteOne(query)
    res.send(result)
   
   })
























    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (rwq, res)=>{
    res.send("TaskManager is online");
})
app.listen(port, ()=>{
    console.log(`Task Manager is online on port- ${port}`);
})