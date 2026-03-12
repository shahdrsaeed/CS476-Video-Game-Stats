const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:5173', // Adjust this to your frontend's URL
};

// test comment
app.use(cors(corsOptions));

app.get('/api', (req, res) => {
    res.json({"fruits": ["apple", "banana", "orange"]});
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});