import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

const app = express();
const port = 3000;



app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Establish a MongoDB connection with Mongoose
mongoose.connect('mongodb://127.0.0.1:27017/todoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a Mongoose Schema and Model for tasks
const taskSchema = new mongoose.Schema({
  title: String,
  checked: Boolean,
});

const unscheduledTaskSchema = new mongoose.Schema({
  title: String,
  checked: Boolean,
});

const Task = mongoose.model('Task', taskSchema);
const UnscheduledTask = mongoose.model('UnscheduledTask', unscheduledTaskSchema);


  

  app.get("/", async (req, res) => {
    try {
      const tasks = await Task.find({});
      res.render("index.ejs", { tasks: tasks });
    } catch (error) {
      console.log(error);
    }
  });
  

  app.get('/unschedule', async (req, res) => {
    // Get unscheduled tasks from the database
    const unscheduledTasks = await UnscheduledTask.find({});
    res.render('unschedule.ejs', { unscheduledTasks: unscheduledTasks });
  });
  

  // SUBMIT TASK
  app.post('/submitTasks', async (req, res) => {
    const newTask = new Task({
      title: req.body.newTaskTitle,
      checked: false
    });
  
    try {
      await newTask.save();
      res.redirect('/');
    } catch (error) {
      console.log('An error occurred while saving the task:', error);
      res.redirect('/');
    }
  });

  // SUBMIT UNCHEDULED TASK
  app.post('/submitUnscheduleTasks', async (req, res) => {
    const newUnscheduledTask = new UnscheduledTask({
      title: req.body.newTaskTitle,
      checked: false
    });
  
    try {
      await newUnscheduledTask.save();
      res.redirect('/unschedule');
    } catch (error) {
      console.log('An error occurred while saving the unscheduled task:', error);
      res.redirect('/unschedule');
    }
  });

  // HANDLE TASK CHECK UPDATE
  app.post('/updateTask/:id', async (req, res) => {
    const taskId = req.params.id;
    const taskStatus = req.body.checked;
    try {
      await Task.findByIdAndUpdate(taskId, { checked: taskStatus });
      res.status(200).send("Task updated");
    } catch (error) {
      res.status(500).send("An error occurred");
      console.log(error);
    }
  });


    // HANDLE UNCHEDULE TASK CHECK UPDATE
    app.post('/updateUncheduledTask/:id', async (req, res) => {
      const taskId = req.params.id;
      const taskStatus = req.body.checked;
      try {
        await UnscheduledTask.findByIdAndUpdate(taskId, { checked: taskStatus });
        res.status(200).send("Task updated");
      } catch (error) {
        res.status(500).send("An error occurred");
        console.log(error);
      }
    });
  

  
// DELETE TASK
app.delete('/deleteTask/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    await Task.findByIdAndDelete(taskId);
    res.status(200).send('Task deleted');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// DELETE UNSCHEDULE TASK
app.delete('/deleteUnscheduleTask/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    await UnscheduledTask.findByIdAndDelete(taskId);
    res.status(200).json({ status: 'success', message: 'Unscheduled task deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
