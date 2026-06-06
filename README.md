# Venix Anime Search Bot for Slack

Venix is a Slack bot built with Node.js and Slack Bolt (Socket Mode).  
It allows users to search for anime and characters using the Jikan API and get detailed, structured results directly inside Slack.

## Features

- `/anime-search`  
  Search for anime by name and get rating, episodes, status, genres, and image.

- `/character-search`  
  Search for anime characters, sorted by popularity (favorites).  
  Includes character image, anime origin, and a detailed view button.

- `/random-anime`  
  Get a randomly selected anime with basic details and MyAnimeList link.

- Interactive buttons  
  Clickable “View” buttons to load full character details inside Slack.

## Tech Stack

- Node.js
- Slack Bolt (Socket Mode)
- Express-style command handling (via Bolt)
- Jikan API (MyAnimeList unofficial API)
- Slack Block Kit UI

## Setup

1. Install dependencies:
   ```bash
   npm install
````

2. Create a `.env` file:

   ```
   SLACK_BOT_TOKEN=your-token
   SLACK_APP_TOKEN=your-app-token
   ```

3. Run the bot:

   ```bash
   node index.js
   ```

## Notes

This project uses AI-assisted development for debugging and improving API handling.

The project was created as part of the Hack Club Stardance event:
[Hack Club Stardance Project Page](https://stardance.hackclub.com/projects/9798?utm_source=chatgpt.com)

## Author

Built by @vxnsin
Portfolio: [https://venisn.dev](https://venisn.dev)