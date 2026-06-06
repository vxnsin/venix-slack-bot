const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Venix is running 🚀");
});

app.post("/slack/anisearch", async (req, res) => {
  const text = req.body.text;

  return res.json({
    response_type: "ephemeral",
    text: `Searching anime: *${text}*`
  });
});

app.post("/slack/charsearch", async (req, res) => {
  const text = req.body.text;

  return res.json({
    response_type: "ephemeral",
    text: `Searching character: *${text}*`
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