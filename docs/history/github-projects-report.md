# GitHub Projects Setup Report

## Project Board: Angry Dogs Remediation

### Columns
- **Phase 1**: Immediate stabilization tasks
- **Phase 2**: Scaffolding and structure tasks
- **Phase 3**: Advanced features and optimization
- **Blocked**: Tasks blocked by dependencies
- **Done**: Completed tasks

### Issues Created (12 total)

#### Phase 1 Issues (5)
- [ ] Update README.md with scope separation and badges
- [ ] Set up Vite bundling and modern tooling
- [ ] Add GitHub Actions CI/CD pipelines
- [ ] Add Playwright smoke tests
- [ ] Create Unity bootstrap documentation

#### Phase 2 Issues (5)
- [ ] Create GameLoop module scaffolding
- [ ] Create Spawner module scaffolding
- [ ] Create CollisionSystem module scaffolding
- [ ] Create InputSystem module scaffolding
- [ ] Create AudioSystem module scaffolding

#### Phase 3 Issues (2)
- [ ] Add comprehensive integration tests
- [ ] Implement advanced CI/CD features

## Commands to Run

```bash
# Create GitHub Project Board
gh project create --title "Angry Dogs Remediation" --body "Project board for tracking codebase remediation progress"

# Get project number (replace PROJECT_NUMBER with actual number)
PROJECT_NUMBER=$(gh project list --limit 1 --json number --jq '.[0].number')

# Create project columns
gh project column-create $PROJECT_NUMBER --title "Phase 1" --description "Immediate stabilization tasks"
gh project column-create $PROJECT_NUMBER --title "Phase 2" --description "Scaffolding and structure tasks"
gh project column-create $PROJECT_NUMBER --title "Phase 3" --description "Advanced features and optimization"
gh project column-create $PROJECT_NUMBER --title "Blocked" --description "Tasks blocked by dependencies"
gh project column-create $PROJECT_NUMBER --title "Done" --description "Completed tasks"

# Create issues
gh issue create --title "Update README.md with scope separation and badges" --body "## Description
Update the README.md to clearly separate Web Canvas Prototype and Unity Scripts scopes, add CI status badges, and create a "What lives where" section.

## Acceptance Criteria
- [ ] README clearly separates Web and Unity scopes
- [ ] CI status badges are added and functional
- [ ] "What lives where" section maps files to systems
- [ ] Setup instructions work for new developers

## Definition of Done
- [ ] README is updated with all required sections
- [ ] Badges show current CI status
- [ ] Documentation is cross-linked
- [ ] Changes are reviewed and approved

## Files to Touch
- README.md
- .github/workflows/ci-web.yml
- .github/workflows/ci-unity.yml" --label "phase:1 --label area:docs --label kind:docs --label priority:high"
gh issue create --title "Set up Vite bundling and modern tooling" --body "## Description
Replace Rollup with Vite for modern bundling, update package.json scripts, and ensure ESLint/Prettier integration works properly.

## Acceptance Criteria
- [ ] Vite configuration is set up
- [ ] npm run dev starts Vite dev server
- [ ] npm run build creates optimized production build
- [ ] ESLint and Prettier are properly configured
- [ ] All scripts work correctly

## Definition of Done
- [ ] Vite config is created and working
- [ ] Package.json scripts are updated
- [ ] Build process is optimized
- [ ] Linting passes with warnings only
- [ ] Tests pass

## Files to Touch
- vite.config.ts
- package.json
- .eslintrc.cjs
- .prettierrc
- .editorconfig" --label "phase:1 --label area:web --label kind:tooling --label priority:high"
gh issue create --title "Add GitHub Actions CI/CD pipelines" --body "## Description
Create GitHub Actions workflows for web CI and Unity CI with proper testing, linting, and building.

## Acceptance Criteria
- [ ] Web CI runs on all PRs and pushes
- [ ] Unity CI runs when Unity files change
- [ ] Status badges are functional
- [ ] CI fails fast on errors
- [ ] Build artifacts are uploaded

## Definition of Done
- [ ] ci-web.yml workflow is created
- [ ] ci-unity.yml workflow is created
- [ ] Badges are added to README
- [ ] CI runs successfully
- [ ] Artifacts are properly uploaded

## Files to Touch
- .github/workflows/ci-web.yml
- .github/workflows/ci-unity.yml
- README.md" --label "phase:1 --label area:ci --label kind:tooling --label priority:high"
gh issue create --title "Add Playwright smoke tests" --body "## Description
Implement Playwright smoke tests to verify HUD counter increments and basic game functionality.

## Acceptance Criteria
- [ ] Smoke test verifies HUD counter increments
- [ ] Tests run successfully in CI
- [ ] Test execution time <5 seconds
- [ ] Tests are resilient to timing issues
- [ ] Accessibility tests are included

## Definition of Done
- [ ] Playwright config is created
- [ ] Smoke tests are implemented
- [ ] Tests pass in CI
- [ ] Performance requirements are met
- [ ] Tests are documented

## Files to Touch
- playwright.config.ts
- tests/smoke.spec.ts
- package.json" --label "phase:1 --label area:web --label kind:qa --label priority:high"
gh issue create --title "Create Unity bootstrap documentation" --body "## Description
Create comprehensive Unity setup documentation with version requirements, package dependencies, and testing instructions.

## Acceptance Criteria
- [ ] Unity LTS version is specified
- [ ] Required packages are listed
- [ ] Setup instructions are clear
- [ ] Test structure is documented
- [ ] CI integration is explained

## Definition of Done
- [ ] UNITY_BOOTSTRAP.md is created
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] Troubleshooting section included
- [ ] Cross-referenced with main README

## Files to Touch
- Docs/UNITY_BOOTSTRAP.md
- README.md" --label "phase:1 --label area:unity --label kind:docs --label priority:medium"
gh issue create --title "Create GameLoop module scaffolding" --body "## Description
Extract game loop logic from GameRefactored.js into a dedicated GameLoopManager module with proper interfaces and TODOs.

## Acceptance Criteria
- [ ] GameLoopManager class is created
- [ ] Core game loop logic is extracted
- [ ] Proper interfaces are defined
- [ ] TODOs mark extraction points
- [ ] Unit tests are created

## Definition of Done
- [ ] Module structure is established
- [ ] Current functionality is preserved
- [ ] Tests pass
- [ ] Documentation is updated
- [ ] Integration points are identified

## Files to Touch
- src/GameLoop/GameLoopManager.js
- tests/GameLoop.test.js
- src/GameRefactored.js" --label "phase:2 --label area:web --label kind:refactor --label priority:medium"
gh issue create --title "Create Spawner module scaffolding" --body "## Description
Create EntitySpawner module for managing entity creation, object pooling, and spawn patterns.

## Acceptance Criteria
- [ ] EntitySpawner class is created
- [ ] Entity creation logic is extracted
- [ ] Object pooling is implemented
- [ ] Spawn patterns are defined
- [ ] Unit tests are created

## Definition of Done
- [ ] Module structure is established
- [ ] Entity management is centralized
- [ ] Pooling system is functional
- [ ] Tests pass
- [ ] Performance is optimized

## Files to Touch
- src/Spawner/EntitySpawner.js
- tests/Spawner.test.js
- src/systems/" --label "phase:2 --label area:web --label kind:refactor --label priority:medium"
gh issue create --title "Create CollisionSystem module scaffolding" --body "## Description
Extract collision detection logic into a dedicated CollisionDetector module with spatial partitioning.

## Acceptance Criteria
- [ ] CollisionDetector class is created
- [ ] Collision detection logic is extracted
- [ ] Spatial partitioning is implemented
- [ ] Collision response is handled
- [ ] Unit tests are created

## Definition of Done
- [ ] Module structure is established
- [ ] Collision detection is optimized
- [ ] Spatial queries are efficient
- [ ] Tests pass
- [ ] Performance is measured

## Files to Touch
- src/CollisionSystem/CollisionDetector.js
- tests/CollisionSystem.test.js
- src/systems/" --label "phase:2 --label area:web --label kind:refactor --label priority:medium"
gh issue create --title "Create InputSystem module scaffolding" --body "## Description
Extract input handling logic into a dedicated InputHandler module with input mapping and buffering.

## Acceptance Criteria
- [ ] InputHandler class is created
- [ ] Input handling logic is extracted
- [ ] Input mapping is implemented
- [ ] Input buffering is added
- [ ] Unit tests are created

## Definition of Done
- [ ] Module structure is established
- [ ] Input handling is centralized
- [ ] Mobile controls are supported
- [ ] Tests pass
- [ ] Accessibility is maintained

## Files to Touch
- src/InputSystem/InputHandler.js
- tests/InputSystem.test.js
- src/core/InputManager.js" --label "phase:2 --label area:web --label kind:refactor --label priority:medium"
gh issue create --title "Create AudioSystem module scaffolding" --body "## Description
Extract audio management logic into a dedicated AudioManager module with audio pooling and 3D audio support.

## Acceptance Criteria
- [ ] AudioManager class is created
- [ ] Audio management logic is extracted
- [ ] Audio pooling is implemented
- [ ] 3D audio support is added
- [ ] Unit tests are created

## Definition of Done
- [ ] Module structure is established
- [ ] Audio management is centralized
- [ ] Performance is optimized
- [ ] Tests pass
- [ ] Features are documented

## Files to Touch
- src/AudioSystem/AudioManager.js
- tests/AudioSystem.test.js
- src/systems/AudioSystem.js" --label "phase:2 --label area:web --label kind:refactor --label priority:medium"
gh issue create --title "Add comprehensive integration tests" --body "## Description
Create comprehensive integration tests to verify system interactions and data flow between modules.

## Acceptance Criteria
- [ ] Integration tests are created
- [ ] System interactions are tested
- [ ] Event flow is verified
- [ ] Configuration changes are tested
- [ ] Performance is measured

## Definition of Done
- [ ] Test suite is comprehensive
- [ ] All systems are covered
- [ ] Tests are reliable
- [ ] Performance benchmarks are established
- [ ] Documentation is updated

## Files to Touch
- tests/integration/
- tests/performance/
- jest.config.js" --label "phase:3 --label area:web --label kind:qa --label priority:low"
gh issue create --title "Implement advanced CI/CD features" --body "## Description
Add advanced CI/CD features including automated deployment, monitoring, and performance regression testing.

## Acceptance Criteria
- [ ] Automated deployment is set up
- [ ] Performance regression testing is added
- [ ] Monitoring is implemented
- [ ] Notifications are configured
- [ ] Rollback procedures are documented

## Definition of Done
- [ ] Deployment pipeline is complete
- [ ] Monitoring is functional
- [ ] Performance tracking is active
- [ ] Alerts are configured
- [ ] Documentation is updated

## Files to Touch
- .github/workflows/deploy.yml
- .github/workflows/performance.yml
- monitoring/" --label "phase:3 --label area:ci --label kind:tooling --label priority:low"

# Move issues to appropriate columns
# Note: This requires the project API which may not be available in all GitHub CLI versions
# You may need to manually move issues to columns in the GitHub UI

```

## Next Steps

1. Run the commands above to create the project board and issues
2. Update the project number in the commands if needed
3. Manually move issues to appropriate columns in the GitHub UI
4. Assign issues to team members
5. Set up project automation rules if desired

## Labels Used

### Phase Labels
- `phase:1` - Phase 1 (Immediate stabilization)
- `phase:2` - Phase 2 (Scaffolding & structure)  
- `phase:3` - Phase 3 (Advanced features)

### Area Labels
- `area:web` - Web Canvas Prototype
- `area:unity` - Unity Scripts
- `area:docs` - Documentation
- `area:ci` - CI/CD

### Type Labels
- `kind:bug` - Bug report
- `kind:feature` - Feature request
- `kind:enhancement` - Enhancement
- `kind:tooling` - Tooling/Infrastructure
- `kind:qa` - Quality Assurance
- `kind:docs` - Documentation
- `kind:refactor` - Code refactoring

### Priority Labels
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority
