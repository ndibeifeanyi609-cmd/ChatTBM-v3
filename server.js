// =====================================
// ChatTBM Backend
// Express Server
// =====================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {

    res.json({

        app: "ChatTBM Backend",

        status: "Running ✅"

    });

});

// Future AI endpoint
app.post("/api/chat", async (req, res) => {

    const { message } = req.body;

    res.json({

        reply: `Backend received: ${message}`

    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(

        `🚀 ChatTBM Backend running on port ${PORT}`

    );

});
