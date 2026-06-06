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

  app.post("/slack/character-search", async (req, res) => {
    const text = req.body.text;
    const responseUrl = req.body.response_url;
  
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(text)}&limit=5`
      );
  
      const data = await response.json();
      const results = data.data;
  
      if (!results || results.length === 0) {
        return res.json({
          response_type: "ephemeral",
          text: "❌ No characters found."
        });
      }
  
      res.json({
        response_type: "ephemeral",
        text: `🔍 Searching characters: ${text}...`
      });
  
      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*👤 Top Characters for:* ${text}\nClick to view details 👇`
          }
        },
        { type: "divider" }
      ];
  
      results.forEach((char) => {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text:
  `*👤 ${char.name}*
  🔥 Favorites: ${char.favorites || "N/A"}`
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "View"
            },
            value: char.mal_id.toString(),
            action_id: "char_select"
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
  
      return res.json({
        response_type: "ephemeral",
        text: "❌ Error fetching characters."
      });
    }
  });

  app.post("/slack/interactions", async (req, res) => {
    const payload = JSON.parse(req.body.payload);
  
    res.send();
  
    if (payload.type === "block_actions") {
      const action = payload.actions[0];
  
      if (action.action_id === "char_select") {
        const id = action.value;
        const responseUrl = payload.response_url;
  
        try {
          const response = await fetch(
            `https://api.jikan.moe/v4/characters/${id}/full`
          );
  
          const data = await response.json();
          const char = data.data;
  
          const animeList =
            char.anime?.map(a => a.anime.title).slice(0, 3).join(", ") || "N/A";
  
          const blocks = [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
  `*👤 ${char.name}*
  
  🎭 Kanji: ${char.name_kanji || "N/A"}
  🔥 Favorites: ${char.favorites || "N/A"}
  🎬 Anime: ${animeList}
  
  📝 About:
  ${char.about ? char.about.substring(0, 500) + "..." : "N/A"}`
              },
              accessory: {
                type: "image",
                image_url: char.images.jpg.image_url,
                alt_text: char.name
              }
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
    }
  });

app.post("/slack/random-anime", async (req, res) => {
  try {
    const page = Math.floor(Math.random() * 20) + 1;

    const response = await fetch(
      `https://api.jikan.moe/v4/anime?order_by=popularity&sort=desc&limit=1&page=${page}`
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
`🎲 *Random Anime Pick*

*🎬 ${anime.title}*

⭐ *Rating:* ${anime.score || "N/A"}
📺 *Episodes:* ${anime.episodes || "?"}
🔥 *Status:* ${anime.status || "N/A"}
🎭 *Genres:* ${genres}
📅 *Aired:* ${anime.aired?.string || "N/A"}`
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
      text: "❌ Error fetching random anime."
    });
  }
});
app.listen(PORT, () => {
  console.log(`Venix running on port ${PORT}`);
});