# Unity Bootstrap Guide

## Overview

This document provides setup instructions for the Unity components of the TotTrots game project. The Unity integration is designed to work alongside the web-based prototype, providing additional platform-specific features and testing capabilities.

## Prerequisites

### Unity Version
- **Unity LTS 2022.3.x** or later
- **Unity Hub** for project management
- **Visual Studio** or **Visual Studio Code** with C# extension

### Required Packages
Install the following packages via Package Manager:

```
- Unity Test Framework (com.unity.test-framework) - 1.3.x
- Unity Input System (com.unity.inputsystem) - 1.6.x
- Unity UI (com.unity.ugui) - 1.0.x
- Unity Analytics (com.unity.analytics) - 4.4.x
- Unity Cloud Build (com.unity.cloud.build) - 0.4.x
```

## Project Setup

### 1. Create Unity Project
```bash
# Using Unity Hub
1. Open Unity Hub
2. Click "New Project"
3. Select "2D Core" template
4. Name: "TotTrots-Unity"
5. Location: Create in project root as "Unity/" folder
```

### 2. Project Structure
```
Unity/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── GameManager.cs
│   │   │   ├── EventBus.cs
│   │   │   └── ConfigManager.cs
│   │   ├── Systems/
│   │   │   ├── InputSystem.cs
│   │   │   ├── AudioSystem.cs
│   │   │   └── CollisionSystem.cs
│   │   └── Tests/
│   │       ├── EditMode/
│   │       │   ├── GameManagerTests.cs
│   │       │   └── InputSystemTests.cs
│   │       └── PlayMode/
│   │           └── IntegrationTests.cs
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── GamePlay.unity
│   │   └── TestScene.unity
│   ├── Prefabs/
│   │   ├── Player.prefab
│   │   └── GameUI.prefab
│   └── Resources/
│       └── Config/
│           └── GameConfig.asset
├── Packages/
│   └── manifest.json
└── ProjectSettings/
    └── ProjectSettings.asset
```

### 3. Package Configuration
Update `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.unity.test-framework": "1.3.9",
    "com.unity.inputsystem": "1.6.3",
    "com.unity.ugui": "1.0.0",
    "com.unity.analytics": "4.4.2",
    "com.unity.cloud.build": "0.4.0"
  }
}
```

## Scene Setup

### Main Menu Scene
1. Create empty GameObject named "GameManager"
2. Add `GameManager` script component
3. Create Canvas with UI elements:
   - Start Game button
   - Settings button
   - Quit button
4. Configure button event handlers

### Game Play Scene
1. Create GameManager GameObject
2. Add Player prefab to scene
3. Set up camera follow script
4. Configure input system
5. Add audio sources for background music and SFX

### Test Scene
1. Create minimal scene for testing
2. Add test-specific GameObjects
3. Configure test data and mock objects
4. Set up test environment variables

## Script Templates

### Core GameManager
```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    [Header("Game Configuration")]
    public GameConfig config;
    
    [Header("Systems")]
    public InputSystem inputSystem;
    public AudioSystem audioSystem;
    public CollisionSystem collisionSystem;
    
    private EventBus eventBus;
    private bool isGameRunning = false;
    
    void Start()
    {
        InitializeSystems();
        StartGame();
    }
    
    private void InitializeSystems()
    {
        eventBus = new EventBus();
        // Initialize all systems
    }
    
    private void StartGame()
    {
        isGameRunning = true;
        eventBus.Emit("game:started");
    }
    
    public void PauseGame()
    {
        isGameRunning = false;
        Time.timeScale = 0f;
        eventBus.Emit("game:paused");
    }
    
    public void ResumeGame()
    {
        isGameRunning = true;
        Time.timeScale = 1f;
        eventBus.Emit("game:resumed");
    }
}
```

### Input System
```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class InputSystem : MonoBehaviour
{
    private InputActionAsset inputActions;
    private InputAction moveAction;
    private InputAction jumpAction;
    
    void Awake()
    {
        inputActions = Resources.Load<InputActionAsset>("InputActions");
        moveAction = inputActions.FindAction("Move");
        jumpAction = inputActions.FindAction("Jump");
    }
    
    void OnEnable()
    {
        inputActions.Enable();
    }
    
    void OnDisable()
    {
        inputActions.Disable();
    }
    
    public Vector2 GetMoveInput()
    {
        return moveAction.ReadValue<Vector2>();
    }
    
    public bool GetJumpInput()
    {
        return jumpAction.WasPressedThisFrame();
    }
}
```

## Testing Framework

### Edit-Mode Tests
Create tests in `Assets/Scripts/Tests/EditMode/`:

```csharp
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class GameManagerTests
{
    private GameManager gameManager;
    private GameObject gameManagerObject;
    
    [SetUp]
    public void Setup()
    {
        gameManagerObject = new GameObject("GameManager");
        gameManager = gameManagerObject.AddComponent<GameManager>();
    }
    
    [TearDown]
    public void TearDown()
    {
        Object.DestroyImmediate(gameManagerObject);
    }
    
    [Test]
    public void GameManager_InitializesCorrectly()
    {
        Assert.IsNotNull(gameManager);
        Assert.IsTrue(gameManager.IsGameRunning);
    }
    
    [Test]
    public void GameManager_PauseResumeWorks()
    {
        gameManager.PauseGame();
        Assert.IsFalse(gameManager.IsGameRunning);
        
        gameManager.ResumeGame();
        Assert.IsTrue(gameManager.IsGameRunning);
    }
}
```

### Play-Mode Tests
Create tests in `Assets/Scripts/Tests/PlayMode/`:

```csharp
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using System.Collections;

public class IntegrationTests
{
    [UnityTest]
    public IEnumerator GameStartsAndRuns()
    {
        // Load test scene
        yield return UnityEngine.SceneManagement.SceneManager.LoadSceneAsync("TestScene");
        
        // Wait for game to initialize
        yield return new WaitForSeconds(1f);
        
        // Verify game is running
        var gameManager = Object.FindObjectOfType<GameManager>();
        Assert.IsNotNull(gameManager);
        Assert.IsTrue(gameManager.IsGameRunning);
    }
}
```

## CI/CD Integration

### GitHub Actions Workflow
The Unity CI workflow (`.github/workflows/ci-unity.yml`) will:

1. **Checkout code** and set up Unity
2. **Install required packages** via Package Manager
3. **Run edit-mode tests** using Unity Test Runner
4. **Run play-mode tests** in headless mode
5. **Build project** for target platforms
6. **Upload artifacts** for testing

### Local Testing
```bash
# Run edit-mode tests
Unity -batchmode -quit -projectPath ./Unity -runTests -testPlatform editmode

# Run play-mode tests
Unity -batchmode -quit -projectPath ./Unity -runTests -testPlatform playmode

# Build project
Unity -batchmode -quit -projectPath ./Unity -buildTarget StandaloneWindows64 -executeMethod BuildScript.Build
```

## Configuration

### Game Config ScriptableObject
Create `Assets/Resources/Config/GameConfig.asset`:

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "GameConfig", menuName = "Game/Config")]
public class GameConfig : ScriptableObject
{
    [Header("Game Settings")]
    public float gameSpeed = 1.0f;
    public int maxLives = 3;
    public float respawnDelay = 2.0f;
    
    [Header("Audio Settings")]
    public float masterVolume = 1.0f;
    public float musicVolume = 0.8f;
    public float sfxVolume = 1.0f;
    
    [Header("Input Settings")]
    public float inputSensitivity = 1.0f;
    public bool invertYAxis = false;
}
```

## Troubleshooting

### Common Issues

1. **Package Installation Fails**
   - Check Unity version compatibility
   - Clear Package Manager cache
   - Restart Unity Editor

2. **Tests Don't Run**
   - Verify Test Framework package is installed
   - Check test script compilation
   - Ensure test methods are public

3. **Build Fails**
   - Check target platform settings
   - Verify all required packages are installed
   - Check for compilation errors

### Debug Commands
```bash
# Check Unity version
Unity -version

# List installed packages
Unity -batchmode -quit -projectPath ./Unity -executeMethod PackageManager.List

# Run specific test
Unity -batchmode -quit -projectPath ./Unity -runTests -testPlatform editmode -testName "GameManagerTests.GameManager_InitializesCorrectly"
```

## Next Steps

1. **Set up Unity project** following this guide
2. **Create initial scripts** using provided templates
3. **Write basic tests** for core functionality
4. **Configure CI pipeline** for automated testing
5. **Integrate with web prototype** for shared functionality

## Resources

- [Unity Test Framework Documentation](https://docs.unity3d.com/Packages/com.unity.test-framework@latest/)
- [Unity Input System Guide](https://docs.unity3d.com/Packages/com.unity.inputsystem@latest/)
- [Unity CI/CD Best Practices](https://docs.unity3d.com/Manual/ContinuousIntegration.html)

---

*This guide provides the foundation for Unity integration. Update as the project evolves and new requirements emerge.*