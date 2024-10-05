const express = require('express');
const path = require('path');
const { url } = require('inspector');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();


const static_dir = path.join(__dirname, 'static');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(static_dir));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array()); 
app.use(express.static('public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


let db;
(async () => {
  db = await open({
    filename: 'habit.sqlite',
    driver: sqlite3.Database
  });
})();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
  return `${year}-${month}-${day}`; // Return formatted date
}

// Example usage:
const date = new Date(); // Get the current date
const formattedDate = formatDate(date); // Format the date

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.post('/habit', async (req, res) => {
  const { habit_name, total_days, description } = req.body; // Ensure you have the correct variable names
  console.log(req.body);
  const createdAt = formatDate(new Date());
  
  // Insert the new habit into the database
  await db.run("INSERT INTO habit(habit_name, total_days, description, created_at) VALUES(?,?,?,?)", [habit_name, total_days, description, createdAt]);
  
  // Fetch the last inserted habit (assuming there's an id column)
  const result = await db.get("SELECT * FROM habit WHERE habit_name = ?", [habit_name]);

  console.log("SUCCESS");
  res.json(result); // Send back the created habit as a JSON response
});


app.get('/habit', async (req, res) => {
  const habits = await db.all("SELECT * FROM habit");
  console.log(habits);
  res.render('index', {
    habits:habits
  });
});

app.get('/habits', async (req, res) => {
  const habits = await db.all("SELECT * FROM habit");
  res.json(habits);
});


app.get('/time', (req, res) => {
  res.render('time', {
      times:currentDateTime
  });
});

// Start the server on port 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

