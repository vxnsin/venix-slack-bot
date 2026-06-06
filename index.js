require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/anime-search", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text;

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`
    );

    const data = await response.json();
    const anime = data.data?.[0];

    if (!anime) return respond("❌ No anime found.");

    const genres =
      anime.genres?.map((g) => g.name).join(", ") || "N/A";

    await respond({
      response_type: "ephemeral",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
`*🎬 ${anime.title}*

⭐ Rating: ${anime.score || "N/A"}
📺 Episodes: ${anime.episodes || "?"}
📅 Aired: ${anime.aired?.string || "N/A"}
🔥 Status: ${anime.status || "N/A"}
🎭 Genres: ${genres}`
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
    await respond("❌ Error fetching anime.");
  }
});


app.command("/character-search", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text;

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(text)}&limit=10`
    );

    const data = await response.json();
    let results = data.data;

    if (!results || results.length === 0) {
      return respond("❌ No characters found.");
    }

    results = results.sort(
      (a, b) => (b.favorites || 0) - (a.favorites || 0)
    );

    const top = results.slice(0, 5);

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*👤 Top Characters for:* ${text}\nSorted by popularity 🔥`
        }
      },
      { type: "divider" }
    ];

    top.forEach((char) => {
      const animeName =
        char.anime
          ?.map(a => a.anime?.title)
          .filter(Boolean)
          .slice(0, 2)
          .join(", ") || "Unknown";

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
`*👤 ${char.name}*
🔥 Favorites: ${char.favorites || 0}`
        },
        accessory: {
          type: "image",
          image_url: char.images?.jpg?.image_url,
          alt_text: char.name
        }
      });

      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "👀 View"
            },
            value: String(char.mal_id),
            action_id: "char_select"
          }
        ]
      });
    });

    await respond({
      response_type: "ephemeral",
      blocks
    });

  } catch (err) {
    console.error(err);
    await respond("❌ Error fetching characters.");
  }
});


app.action("char_select", async ({ ack, body, client }) => {
  await ack();

  const id = body.actions?.[0]?.value;

  const channel = body.channel?.id;
  const ts = body.message?.ts;

  if (!channel) {
    console.log("No channel found in interaction");
    return;
  }

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/characters/${id}/full`
    );

    const data = await response.json();
    const char = data?.data;

    if (!char) return;

    const animeList =
      char.anime?.map((a) => a.anime?.title).slice(0, 3).join(", ") || "N/A";

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
`*👤 ${char.name}*

🎭 Kanji: ${char.name_kanji || "N/A"}
🎬 Anime: ${animeList}

📝 About:
${char.about ? char.about.substring(0, 500) + "..." : "N/A"}`
        },
        accessory: {
          type: "image",
          image_url: char.images?.jpg?.image_url,
          alt_text: char.name
        }
      }
    ];

    // 🔥 DIFFERENT BEHAVIOR DEPENDING ON CONTEXT
    if (ts) {
      // update original message
      await client.chat.update({
        channel,
        ts,
        blocks
      });
    } else {
      // fallback: post new message
      await client.chat.postMessage({
        channel,
        blocks,
        text: "Character details"
      });
    }

  } catch (err) {
    console.error(err);
  }
});

app.command("/random-anime", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/random/anime`
    );

    const data = await response.json();
    const anime = data.data;

    if (!anime) {
      return respond("❌ No anime found.");
    }

    const genres =
      anime.genres?.map((g) => g.name).join(", ") || "N/A";

    await respond({
      response_type: "ephemeral",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
`🎲 *Random Anime*

*🎬 ${anime.title}*

⭐ Rating: ${anime.score || "N/A"}
📺 Episodes: ${anime.episodes || "?"}
🔥 Status: ${anime.status || "N/A"}
🎭 Genres: ${genres}
📅 Year: ${anime.year || "N/A"}`
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
    await respond("❌ Error fetching random anime.");
  }
});

(async () => {
  await app.start();
  console.log("⚡ Venix Slack Bot running in Socket Mode");
})();