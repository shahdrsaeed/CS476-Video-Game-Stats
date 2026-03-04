const PORT = process.env.PORT || 8080;

import express from "express";
const app = express();
import cors from "cors";
const corsOptions = {
    origin: 'http://localhost:5173'
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({"fruits": ["apple", "orange", "banana"]});
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 