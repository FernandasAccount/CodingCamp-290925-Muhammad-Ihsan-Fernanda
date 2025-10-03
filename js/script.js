// elements
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterSelect = document.getElementById("filterSelect");
const deleteAllBtn = document.getElementById("deleteAllBtn");

// data store
let todos = []; // each item { id, task, date (yyyy-mm-dd), done:bool }

// add
addBtn.addEventListener("click", () => {
  const task = taskInput.value.trim();
  const date = dateInput.value;

  if (!task || !date) {
    alert("Please enter both task and date.");
    return;
  }

  const id = Date.now() + Math.floor(Math.random() * 1000);
  todos.push({ id, task, date, done: false });

  taskInput.value = "";
  dateInput.value = "";

  render();
});

// delete all
deleteAllBtn.addEventListener("click", () => {
  if (!todos.length) return;
  if (confirm("Delete ALL tasks?")) {
    todos = [];
    render();
  }
});

// filter change
filterSelect.addEventListener("change", render);

// render (applies filter then shows)
function render() {
  const filter = filterSelect.value; // all | week | month | year
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // helper to test if todoDate is in the filter period
function matchesFilter(todoDate) {
  if (filter === "all") return true;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (filter === "week") {
    // cari awal minggu (Senin)
    const dayOfWeek = startOfToday.getDay(); // Minggu=0, Senin=1, dst
    const diffToMonday = (dayOfWeek + 6) % 7; // jarak mundur ke Senin
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - diffToMonday);

    // akhir minggu (Minggu)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return todoDate >= startOfWeek && todoDate <= endOfWeek;
  }

  if (filter === "month") {
    return (
      todoDate.getFullYear() === startOfToday.getFullYear() &&
      todoDate.getMonth() === startOfToday.getMonth()
    );
  }

  if (filter === "year") {
    return todoDate.getFullYear() === startOfToday.getFullYear();
  }

  return true;
}


  // filter array for display (but keep original todos intact)
  const display = todos.filter(t => matchesFilter(new Date(t.date)));

  // build table
  taskList.innerHTML = "";
  if (display.length === 0) {
    taskList.innerHTML = `<tr><td colspan="4" class="empty">No task found</td></tr>`;
    return;
  }

  display.forEach(item => {
    const tr = document.createElement("tr");

    // status badge
    const statusText = item.done ? "Done" : "Pending";
    const statusClass = item.done ? "status done" : "status pending";

    // format date as yyyy-mm-dd (already stored) but we can show user-friendly
    const showDate = item.date;

    // create action buttons that use the unique i
    tr.innerHTML = `
  <td class="task-cell ${item.done ? "done" : ""}">${escapeHtml(item.task)}</td>
  <td>${escapeHtml(showDate)}</td>
  <td><span class="${statusClass}">${statusText}</span></td>
  <td>
    <button class="action-btn mark-btn" data-id="${item.id}">${item.done ? "Undo" : "Mark Done"}</button>
    <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
  </td>
`;


    taskList.appendChild(tr);
  });

  // attach listeners for action buttons (delegation could be used, but simple approach:)
  document.querySelectorAll(".mark-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.getAttribute("data-id"));
      toggleDoneById(id);
    };
  });
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.getAttribute("data-id"));
      deleteById(id);
    };
  });
}

// toggle by id
function toggleDoneById(id) {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return;
  todos[idx].done = !todos[idx].done;
  render();
}

// delete by id
function deleteById(id) {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return;
  if (confirm("Delete this task?")) {
    todos.splice(idx, 1);
    render();
  }
}

// small helper to avoid HTML injection
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// initial render
render();
