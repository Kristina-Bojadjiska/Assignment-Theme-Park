const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Confirm the database path 
const db = new sqlite3.Database(
    path.join(__dirname, 'src', 'database', 'theme_park.db'),
    (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        } else {
            console.log('Connected to the theme_park database.');
        }
    }
);

// Setting up the view engine and paths
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.urlencoded({ extended: true }));

// Route for the home page
app.get('/', (req, res) => {
    res.render('index', { title: 'Sunny Smiles Family Park' });
});

// Route for the areas page
app.get('/areas', (req, res) => {
    // Fetch data from the database
    db.all("SELECT * FROM areas", (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving areas from database");
        } else {
            // Render the 'areas.ejs' view, passing the retrieved data
            res.render('areas', { areas: rows });
        }
    });
});

// Route for displaying attractions of a specific area dynamically
app.get('/areas/:id/attractions', (req, res) => {
    const areaId = req.params.id;
    const areaQuery = 'SELECT * FROM areas WHERE id = ?';
    const attractionsQuery = 'SELECT * FROM attractions WHERE area_id = ?';

    db.get(areaQuery, [areaId], (err, area) => {
        if (err) {
            console.error('Error fetching area data:', err.message);
            return res.status(500).send('Error fetching area data');
        }
        db.all(attractionsQuery, [areaId], (err, attractions) => {
            if (err) {
                console.error('Error fetching attractions data:', err.message);
                return res.status(500).send('Error fetching attractions data');
            }
            res.render('attractions', {
                area: area,
                attractions: attractions
            });
        });
    });
});

// Route for a specific attraction
app.get('/attractions/details/:attraction_id', (req, res) => {
    const attractionId = req.params.attraction_id;
    const query = 'SELECT * FROM attractions WHERE id = ?';

    db.get(query, [attractionId], (err, attraction) => {
        if (err) {
            console.error('Error fetching attraction details:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('attraction_details', { attraction: attraction });
        }
    });
});

// Route for the FAQ page
app.get('/faq', (req, res) => {
    res.render('faq', { title: 'Frequently Asked Questions', bodyClass: 'faq-page' });
});

// Route for the contact page
app.get('/contact', (req, res) => {
    res.render('contact');
});

// Route for the special events page
app.get('/special-events', (req, res) => {
    db.all('SELECT * FROM special_events', [], (err, rows) => {
        if (err) {
            console.error('Error fetching special events:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('special_events', { events: rows });
        }
    });
});

// Route for Event 1 - Jungle Party
app.get('/events/jungle-party', (req, res) => {
    res.render('jungle_party', {
        title: 'Jungle Party',
        description: 'Experience the exuberant ambiance of Adventure Jungle by hosting a memorable party amid lush foliage and a sense of exoticism...'
    });
});

// Route for Event 2 - Adventure Week in Space
app.get('/events/adventure-week-in-space', (req, res) => {
    res.render('week_space', {
        title: 'Adventure Week in Space',
        description: 'Take off for a weeklong cosmic celebration filled with exhilarating space-themed events and activities. Immerse yourself in the wonders of the universe with everything...'
    });
});

// Route for Event 3 - Hunt for Pirate Treasure
app.get('/events/hunt-for-pirate-treasure', (req, res) => {
    res.render('treasure_hunt', {
        title: 'Hunt for Pirate Treasure',
        description: 'Set out on a fantastic journey through Pirate Bay to find hidden riches! Discover hidden clues, solve difficult puzzles, and navigate through enigmatic coves...'
    });
});

// Route to handle form submissions from the contact page
app.post('/contact', (req, res) => {
    console.log('Form submission received:', req.body);

    const { name, email, message } = req.body;
    const sql = 'INSERT INTO ContactSubmissions (name, email, message) VALUES (?, ?, ?)';

    db.run(sql, [name, email, message], (err) => {
        if (err) {
            console.error('Error storing contact submission:', err.message);
            return res.status(500).send('Error submitting form.');
        }
        console.log('Data successfully inserted into the ContactSubmissions table.');
        res.send('Thank you for contacting us!');
    });
});

// Route to handle question submissions from the FAQ page
app.post('/submit-question', (req, res) => {
    console.log('Question submission received:', req.body);

    const { email, question } = req.body;
    const sql = 'INSERT INTO questions (email, question) VALUES (?, ?)';

    db.run(sql, [email, question], (err) => {
        if (err) {
            console.error('Error storing question:', err.message);
            return res.status(500).send('Error submitting question.');
        }
        console.log('Question successfully inserted into the questions table.');
        res.send('Thank you for your question! We will reply to you as soon as possible.');
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Gracefully close the database on exit
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});