// client side js for task manager

document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const searchFilter = document.getElementById("searchFilter");
    let editIndex = -1;

    // base url for the node server
    const baseURL = 'http://localhost:3000';

    // function to fetch data from the node server
    function fetchTasks() {
        fetch(`${baseURL}/tasks`)
            .then(response => response.json())
            .then(data => {
                tasks = data;
                displayTasks();
            })
            .catch(error => {
                console.error('Error fetching tasks:', error.message);
            });
    }

    // function to save data to the node server
    function saveTask(description, assignedTo, dueDate, priority, status) {
        const task = {
            description,
            assignedTo,
            dueDate,
            priority,
            status
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        };

        fetch(`${baseURL}/tasks`, options)
            .then(response => response.json())
            .then(newTask => {
                tasks.push(newTask);
                displayTasks();
                taskForm.reset();
            })
            .catch(error => {
                console.error('Error saving task:', error.message);
            });
    }

    // function to edit data in the node server
    function editTask(index, description, assignedTo, dueDate, priority, status) {
        const taskId = tasks[index].id;
        const updatedTask = {
            description,
            assignedTo,
            dueDate,
            priority,
            status
        };

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        };

        // fetch the data from the node server
        fetch(`${baseURL}/tasks/${taskId}`, options)
            .then(response => response.json())
            .then(updatedTask => {
                tasks[index] = updatedTask;
                displayTasks();
                taskForm.reset();
                editIndex = -1;
            })
            .catch(error => {
                console.error('Error updating task:', error.message);
            });
    }

    // function to delete data from the node server
    function deleteTask(index) {
        const taskId = tasks[index].id;

        const options = {
            method: 'DELETE'
        };

        fetch(`${baseURL}/tasks/${taskId}`, options)
            .then(response => response.json())
            .then(() => {
                tasks.splice(index, 1);
                displayTasks();
            })
            .catch(error => {
                console.error('Error deleting task:', error.message);
            });
    }

    // function to display data dynamically in the table
    function displayTasks(filteredTasks) {
        taskList.innerHTML = "";

        // if no tasks are found, display a message
        const tasksToDisplay = filteredTasks || tasks;

        // display the tasks in the table
        tasksToDisplay.forEach((task, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.description || ""}</td>
        <td>${task.assignedTo || ""}</td>
        <td>${task.dueDate || ""}</td>
        <td class="${(task.priority || "").toLowerCase()}">${task.priority || ""}</td>
        <td>${task.status || ""}</td>
        <td>
          <button class="edit-button" data-index="${index}">Edit</button>
          <button class="delete-button" data-index="${index}">Delete</button>
        </td>
      `;
            taskList.appendChild(row);
        });

        const editButtons = taskList.querySelectorAll(".edit-button");
        const deleteButtons = taskList.querySelectorAll(".delete-button");

        // add event listeners to the edit and delete buttons
        editButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                editIndex = e.target.getAttribute("data-index");
                populateFormForEdit(editIndex);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        });

        // add event listeners to the edit and delete buttons
        deleteButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                if (confirm("Are you sure you want to delete this task?")) {
                    deleteTask(index);
                }
            });
        });
    }

    // display data in the same form while edit
    function populateFormForEdit(index) {
        const task = tasks[index];
        document.getElementById("taskDescription").value = task.description || "";
        document.getElementById("assignedTo").value = task.assignedTo || "";
        document.getElementById("dueDate").value = task.dueDate || "";
        document.getElementById("taskPriority").value = task.priority || "task-priority";
        document.getElementById("taskStatus").value = task.status || "task-status";
    }

    // add event listener to the form
    document.getElementById("btnAddTask").addEventListener("click", function (e) {
        e.preventDefault();
        const description = document.getElementById("taskDescription").value;
        const assignedTo = document.getElementById("assignedTo").value;
        const dueDate = document.getElementById("dueDate").value;
        const priority = document.getElementById("taskPriority").value;
        const status = document.getElementById("taskStatus").value;

        if (editIndex !== -1) {
            editTask(editIndex, description, assignedTo, dueDate, priority, status);
        } else {
            saveTask(description, assignedTo, dueDate, priority, status);
        }
    });

    // add event listener to the search filter
    searchFilter.addEventListener("input", function () {
        const searchText = searchFilter.value.toLowerCase();
        const filteredTasks = tasks.filter((task) => {
            return (
                (task.description || "").toLowerCase().includes(searchText) ||
                (task.assignedTo || "").toLowerCase().includes(searchText) ||
                (task.dueDate || "").toLowerCase().includes(searchText) ||
                (task.priority || "").toLowerCase().includes(searchText) ||
                (task.status || "").toLowerCase().includes(searchText)
            );
        });

        displayTasks(filteredTasks);
    });

    // fetch data from the node server
    fetchTasks();
});