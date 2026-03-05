# Stick RPG Game with ElevenLabs Voice NPCs

A browser-based RPG inspired by StickRPG, featuring voice-acted NPCs powered by the ElevenLabs Text-to-Speech API.

## Project Structure

```
Eleven/
├── frontend/              # Phaser 3 game (React not needed)
│   ├── src/
│   │   ├── scenes/        # Phaser scenes (Menu, Game, Dialogue)
│   │   ├── main.js        # Game entry point
│   │   └── config.js      # Game configuration
│   ├── assets/            # Images, audio, sprites
│   ├── index.html         # HTML entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite build configuration
│
├── backend/               # Node.js/Express API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   │   ├── voice.js   # Voice generation endpoints
│   │   │   └── saveGame.js # Save/load game endpoints
│   │   ├── cache/         # Voice audio cache
│   │   ├── saves/         # Game save files
│   │   ├── secretManager.js    # GCP Secret Manager integration
│   │   └── elevenlabs.js  # ElevenLabs API client
│   ├── server.js          # Express server entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Secret Manager enabled
- ElevenLabs API key

### Backend Setup

1. **Install dependencies:**

      ```bash
      cd backend
      npm install
      ```

2. **Create `.env` file:**

      ```bash
      cp .env.example .env
      ```

3. **Configure environment variables:**
   Edit `backend/.env` and add:
      - `GCP_PROJECT_ID`: Your Google Cloud project ID
      - `GCP_SECRET_ID`: Name of the secret in Secret Manager (default: `elevenlabs-api-key`)
      - `ELEVENLABS_API_KEY`: (Optional) Fallback API key if Secret Manager is unavailable

4. **Create ElevenLabs API Secret in GCP:**

      ```bash
      # Using gcloud CLI
      gcloud secrets create elevenlabs-api-key \
        --replication-policy="automatic" \
        --data-file=- <<< "your-elevenlabs-api-key"
      ```

5. **Grant permissions:**
   Ensure your service account or local credentials have `roles/secretmanager.secretAccessor` permission.

6. **Start the server:**

      ```bash
      npm run dev
      # or for production:
      npm start
      ```

      The backend will be available at `http://localhost:3000`

### Frontend Setup

1. **Install dependencies:**

      ```bash
      cd frontend
      npm install
      ```

2. **Start the dev server:**

      ```bash
      npm run dev
      ```

      The game will be available at `http://localhost:5173`

3. **Build for production:**
      ```bash
      npm run build
      ```

## API Endpoints

### Voice Generation

- **POST** `/api/voice/generate` - Generate speech from text

     ```json
     {
     	"text": "Hello, welcome to the gym!",
     	"voiceId": "21m00Tcm4TlvDq8ikWAM"
     }
     ```

- **GET** `/api/voice/voices` - List available voices

- **GET** `/api/voice/cache-stats` - Get cache statistics

- **DELETE** `/api/voice/cache` - Clear voice cache

### Game Save/Load

- **POST** `/api/save/game` - Save game state
- **GET** `/api/save/game/:saveSlot` - Load game state
- **GET** `/api/save/list` - List all saves
- **DELETE** `/api/save/game/:saveSlot` - Delete a save

### Health Check

- **GET** `/health` - Server health status

## Game Features (Phase 1: Complete)

✅ Project structure and tooling  
✅ Express backend with Secret Manager integration  
✅ ElevenLabs voice generation API  
✅ Voice caching system  
✅ Phaser 3 game boilerplate  
✅ Save/load game system

## Coming Soon (Phases 2-7)

- Core game mechanics (stats, money, time)
- City exploration and buildings
- Jobs and progression
- NPC system with dialogue
- Voice-acted NPCs
- Story and endings
- Sound, music, and polish

## Environment Variables

### Backend (.env)

```env
PORT=3000                                # Server port
GCP_PROJECT_ID=your-gcp-project-id       # Google Cloud project ID
GCP_SECRET_ID=elevenlabs-api-key         # Secret Manager secret name
ELEVENLABS_API_KEY=sk-...                # Fallback API key (optional)
NODE_ENV=development                     # Environment: development or production
```

### Frontend (src/config.js)

- `gameConfig.api.baseUrl` - Backend API URL
- `gameConfig.voice.enabled` - Enable/disable voice
- `gameConfig.voice.cacheExpiry` - Cache expiration time in milliseconds

## Development Notes

- **Voice Caching**: Common dialogues are cached locally to reduce API costs and improve responsiveness
- **Security**: API keys are stored in GCP Secret Manager, never exposed to the frontend
- **CORS**: Enabled on backend for local development; configure for production
- **Game State**: Saved to backend filesystem (upgradeable to database)

## Troubleshooting

### Backend won't start

- Ensure `GCP_PROJECT_ID` is set in `.env`
- Verify your GCP credentials are configured (`gcloud auth login`)
- Check if port 3000 is available

### Voice generation fails

- Verify ElevenLabs API key is correct
- Check cache directory has write permissions
- Ensure network connectivity to api.elevenlabs.io

### Frontend can't connect to backend

- Verify backend is running on port 3000
- Check CORS settings if using different domain
- Review browser console for specific errors

## Deployment

### Backend

- Docker: Create Dockerfile and deploy to Cloud Run, Heroku, or your server
- Environment variables must be set in your deployment platform

### Frontend

- Static hosting: Netlify, Vercel, GitHub Pages
- Build: `npm run build`, deploy `dist/` folder
- Update API base URL for production in `src/config.js`

## License

MIT

## Support

Found a bug or have a feature request? Please open an issue on GitHub.

Help support the developer:

- [Ko-fi](https://ko-fi.com)
- [Patreon](https://patreon.com)
