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
  
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`
      );
  
      const data = await response.json();
      const anime = data.data?.[0];
  
      if (!anime) {
        return res.json({
          response_type: "ephemeral",
          text: "❌ No anime found."
        });
      }
  
      const genres = anime.genres?.map(g => g.name).join(", ") || "N/A";
  
      return res.json({
        response_type: "ephemeral",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
  `*🎬 ${anime.title}*
  
  ⭐ *Rating:* ${anime.score || "N/A"}
  📺 *Episodes:* ${anime.episodes || "?"}
  📅 *Aired:* ${anime.aired?.string || "N/A"}
  🔥 *Status:* ${anime.status || "N/A"}
  🎭 *Genres:* ${genres}`
            },
            accessory: {
              type: "image",
              image_url: anime.images?.jpg?.image_url,
              alt_text: anime.title
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "📺 MyAnimeList"
                },
                url: anime.url
              }
            ]
          }
        ]
      });
  
    } catch (err) {
      console.error(err);
  
      return res.json({
        response_type: "ephemeral",
        text: "❌ Error fetching anime data."
      });
    }
  });
app.post("/slack/character-search", (req, res) => {
    const text = req.body.text;
  
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