const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Venix is running 🚀");
});

app.post("/slack/anime-search", async (req, res) => {
  const text = req.body.text;

  return res.json({
    response_type: "ephemeral",
    text: `Searching anime: *${text}*`
  });
});

app.post("/slack/character-search", (req, res) => {
    const text = req.body.text;
  
    // IMMER sofort antworten!
    return res.json({
      response_type: "ephemeral",
      text: `👤 Character search received: ${text || "no input"}`
    });
  });

app.post("/slack/random", async (req, res) => {
  return res.json({
    response_type: "ephemeral",
    text: "Random anime feature coming soon!"
  });
});

app.listen(PORT, () => {
  console.log(`Venix running on port ${PORT}`);
});