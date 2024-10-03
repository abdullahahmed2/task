const express = require("express");
const fs = require("fs");
require("dotenv").config()
const axios = require("axios");
const app = express();
app.use(express.json());

let tasks = [];

const loadTasks = () => {
    if (fs.existsSync('./task.json')) {
        const data = fs.readFileSync('./task.json', 'utf-8');
        tasks = JSON.parse(data);
    }
};

const saveTasks = () => {
    fs.writeFileSync('./task.json', JSON.stringify(tasks, null, 2));
};

const sendNotification = (message) => {
    axios.post('http://localhost:8090/notify', { message })
};

app.post('/tasks', (req, res) => {
    const { title, priority, dueDate } = req.body;
    const task = { id: tasks.length + 1, title, priority, dueDate, completed: false };
    tasks.push(task);
    saveTasks();
    sendNotification(`You created this task: ${task.title}`);
    res.status(201).json(task);
});

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, priority, dueDate, completed } = req.body;

    const task = tasks.find(t => t.id == id);
    if (task) {
        task.title = title || task.title;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        task.completed = completed !== undefined ? completed : task.completed;
        saveTasks();
        sendNotification(`You updated this task: ${task.title}`);
        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskToDelete = tasks.find(t => t.id == id);
    tasks = tasks.filter(t => t.id != id);
    saveTasks();
    if (taskToDelete) {
        sendNotification(`You deleted this task: ${taskToDelete.title}`);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

loadTasks();

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Task service is running on port ${PORT}`);
});s