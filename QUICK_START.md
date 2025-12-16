# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Prerequisites
- Node.js 16+ and npm 8+
- Modern browser with ES6+ support
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd tottrots-game-refactored

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands
```bash
npm run dev      # Start Vite dev server (http://localhost:3000)
npm run build    # Build for production
npm test         # Run all tests
npm run lint     # Run linting
npm run test:e2e # Run Playwright smoke tests
```

### Project Structure
```
src/
├── GameLoop/           # Core game loop management
├── Spawner/            # Entity spawning and management
├── CollisionSystem/    # Collision detection and response
├── InputSystem/        # Input handling and mapping
├── AudioSystem/        # Audio management and playback
├── core/               # Core utilities (EventBus, ConfigManager, etc.)
├── managers/           # Feature managers (Achievements, Challenges, etc.)
├── systems/            # Game systems (Combat, Audio, UI, etc.)
└── styles/             # CSS files for styling and mobile controls
```

### Development Workflow
1. **Start development**: `npm run dev`
2. **Make changes** to source files
3. **Run tests**: `npm test`
4. **Check linting**: `npm run lint`
5. **Build for production**: `npm run build`

### Unity Development
See `docs/UNITY_BOOTSTRAP.md` for Unity setup instructions.

### Contributing
See `CONTRIBUTING.md` for detailed contribution guidelines.

### Project Management
See `github-projects-report.md` for project board setup and issue tracking.

---

**That's it! You're ready to start developing.** 🎮