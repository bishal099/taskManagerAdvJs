const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs/promises');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let tasks = [];

// Node server starts here
app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager Api Server'
    });
});
// REST api endpoints for tasks
// Rest api for getting all tasks
app.get('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile('tasks.json', 'utf8');
        tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        console.error('Error reading tasks.json:', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

// Rest api for creating a new task
app.post('/tasks', async (req, res) => {
    const newTask = req.body;

    if (newTask) {
        newTask.id = Date.now();
        tasks.push(newTask);
        await saveTasksToFile();
        res.json(newTask);
    } else {
        res.status(400).json({
            message: 'Invalid task data'
        });
    }
});

// Rest api for getting a single task
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
        res.json(task);
    } else {
        res.status(404).json({
            message: 'Task not found'
        });
    }
});

// Rest api for updating a task
app.put('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const updatedTask = req.body;

    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updatedTask
        };
        await saveTasksToFile();
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({
            message: 'Task not found'
        });
    }
});

// Rest api for deleting a task
app.delete('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    const initialLength = tasks.length;
    tasks = tasks.filter((task) => task.id !== taskId);

    if (tasks.length < initialLength) {
        await saveTasksToFile();
        res.json({
            message: 'Task deleted successfully'
        });
    } else {
        res.status(404).json({
            message: 'Task not found'
        });
    }
});

// Function to save tasks to file
async function saveTasksToFile() {
    try {
        await fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing tasks to file:', error.message);
    }
}

// Start the server
app.listen(port, async () => {
    try {
        const data = await fs.readFile('tasks.json', 'utf8');
        tasks = JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks.json:', error.message);
    }

    console.log(`Server is running at http://localhost:${port}`);
});