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
  const responseUrl = req.body.response_url;

  res.json({
    response_type: "ephemeral",
    text: `🔍 Searching anime: ${text}...`
  });

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=5`
    );

    const data = await response.json();
    const results = data.data;

    if (!results || results.length === 0) return;

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🎯 Top results for:* ${text}\nClick a button to view details 👇`
        }
      },
      { type: "divider" }
    ];

    results.forEach((anime, index) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
`*🎬 ${anime.title}*
⭐ ${anime.score || "N/A"} | 📺 ${anime.episodes || "?"} eps`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "View"
          },
          value: anime.mal_id.toString(),
          action_id: "anime_select"
        }
      });
    });

    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replace_original: true,
        response_type: "ephemeral",
        blocks
      })
    });

  } catch (err) {
    console.error(err);
  }
});

app.post("/slack/interactions", async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  if (payload.type === "block_actions") {
    const action = payload.actions[0];
    const animeId = action.value;
    const responseUrl = payload.response_url;

    res.send();

    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
      const data = await response.json();
      const anime = data.data;

      const genres = anime.genres?.map(g => g.name).join(", ") || "N/A";

      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
`*🎬 ${anime.title}*

⭐ *Rating:* ${anime.score || "N/A"}
📺 *Episodes:* ${anime.episodes || "?"}
🔥 *Status:* ${anime.status}
📅 *Aired:* ${anime.aired?.string}
🎭 *Genres:* ${genres}`
          },
          accessory: {
            type: "image",
            image_url: anime.images.jpg.image_url,
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
      ];

      await fetch(responseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replace_original: true,
          response_type: "ephemeral",
          blocks
        })
      });

    } catch (err) {
      console.error(err);
    }
  }
});

app.post("/slack/character-search", (req, res) => {
  const text = req.body.text;

  return res.json({
    response_type: "ephemeral",
    text: `👤 Character search received: ${text}`
  });
});
post("/slack/random", (req, res) => {
  return res.json({
    response_type: "ephemeral",
    text: "Random anime feature coming soon!"
  });
});

app.listen(PORT, () => {
  console.log(`Venix running on port ${PORT}`);
});