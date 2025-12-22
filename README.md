# Garax

> **Repository Metadata**
>
> *   **Description:** Vite-based web game architecture reference: modular systems, DI/event bus, accessibility, performance + mobile UX patterns.
> *   **Topics:** game-architecture, vite, javascript, accessibility, performance, mobile, canvas

Garax is a **reference game architecture and starter framework** demonstrating modular JavaScript game design, ARPG-style systems, accessibility patterns, performance monitoring, and mobile UX.

It is intended for learning, forking, and integration. It is **not** a finished commercial ARPG. Many systems are illustrative, scaffolded, or prototype-level.

## 🚀 New to Garax? Start Here!

**Want to build your first game in 30 minutes?**

👉 **[Your First Game Tutorial](docs/TUTORIAL_YOUR_FIRST_GAME.md)** - Step-by-step guide building a working space shooter

**What you'll learn:**
- Creating game entities (Player, Enemies)
- Using Garax's input system
- Implementing collision detection
- Working with the EventBus
- Following best practices

**Already know what you're doing?**
- Browse [example games](src/examples/) for reference code
- Check the [Quick Start](QUICK_START.md) for installation
- Review [architecture docs](docs/CODEBASE_AUDIT.md) for deep dive

## Intended Use

*   **Reference Architecture**: Explore advanced patterns like Dependency Injection, Event Bus, and System-based architecture in a game context.
*   **Learning Resource**: Detailed examples of accessibility implementation, performance monitoring, and mobile responsiveness.
*   **Starting Point**: A solid foundation for building your own web-based canvas games.
*   **Prototype Base**: Quickly scaffold ideas using the existing systems.

## Project Status

This project serves as a comprehensive example. Features are at varying levels of completeness:

### ✅ Implemented (Core & Infrastructure)
*   **Core Architecture**: Event-driven design with Dependency Injection Container.
*   **Game Loop & Lifecycle**: Robust state management (Start, Pause, Resume, Stop).
*   **Input System**: Unified handling for Keyboard, Mouse, Gamepad, and Touch (Virtual Joystick).
*   **Performance Monitoring**: Real-time FPS, Frame Time, and Memory usage tracking (`PerformanceMonitor`).
*   **Accessibility**: High Contrast, Screen Reader support, Text Scaling, and Motion Reduction (`AccessibilitySystem`).
*   **Audio System**: Context management and volume control.
*   **Mobile UX**: Touch gestures (Swipe, Pinch, Tap), adaptive controls, and orientation handling.

### 🧪 Prototype / Demonstration
*   **Gameplay Systems**: Basic ARPG combat, movement, and collision detection.
*   **UI Framework**: HUD, Settings menus, and flexible overlay system.
*   **Content Systems**: Inventory, Achievements, and Daily Challenges (functional logic, basic UI).
*   **Procedural Generation**: Basic area generation scaffold.

### 🧱 Planned / Scaffolded / Aspirational
*   **Multiplayer / Backend**: `server.js` provides a basic entry point, but full state synchronization and authority are not implemented.
*   **Advanced Content**: Quests, narrative systems, and complex economy are scaffolded but not fully fleshed out.
*   **Production Assets**: The project uses placeholder assets for demonstration.

## Quick Start

### Prerequisites
*   Node.js 16+ and npm 8+
*   Modern browser with ES6+ support
*   Git

### Installation
```bash
# Clone the repository
git clone https://github.com/I-Onlabs/Garax.git
cd Garax

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands
*   `npm run dev`: Start Vite dev server (http://localhost:5173 or similar)
*   `npm run build`: Build for production (outputs to `dist/`)
*   `npm test`: Run unit tests (Jest)
*   `npm run test:e2e`: Run end-to-end tests (Playwright)
*   `npm run lint`: Run linting

### Test Status
The project includes a comprehensive test suite (`npm test`).
> **Note**: Some tests may require specific environment configurations (like `jsdom`) or may have pending updates to match the latest architectural changes. We recommend using the tests as a reference for how to test game systems.

## Architecture Overview

The project follows a modular system-based architecture:
*   `src/core/`: Core utilities (EventBus, ConfigManager, InputManager).
*   `src/systems/`: Game logic modules (Combat, Audio, UI, etc.).
*   `src/managers/`: High-level state managers (GameManager, AchievementManager).
*   `src/objects/`: Game entities (Player, Enemies).
*   `src/Spawner/`: Entity spawning and lifecycle management.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
Since this is a reference project, we prioritize clarity, documentation, and architectural purity over feature quantity.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
