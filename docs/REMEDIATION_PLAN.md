# Remediation Plan - TotTrots Game Refactored

## Overview

This remediation plan addresses the critical issues identified in the codebase audit, focusing on establishing modern tooling, CI/CD pipelines, and improved documentation to create a solid foundation for continued development.

## Phase 1: Immediate Stabilization (Week 0-2)

### A. Documentation Updates
**Priority: High | Effort: Low | Risk: Low**

#### Tasks
- [ ] Update `README.md` to clearly split scopes:
  - "Web Canvas Prototype" section with local setup instructions
  - "Unity Scripts" section with Unity version and setup requirements
  - Add CI status badges and links to project board
  - Create "What lives where" section mapping files to systems
- [ ] Create `Docs/UNITY_BOOTSTRAP.md` with Unity setup instructions
- [ ] Cross-link documentation files for better navigation

#### Acceptance Criteria
- README clearly separates Web and Unity scopes
- Setup instructions work for new developers
- All documentation files are cross-linked
- CI badges show current status

### B. Tooling Modernization
**Priority: High | Effort: Medium | Risk: Low**

#### Tasks
- [ ] Introduce Vite bundling system:
  - Create `vite.config.ts` with optimized configuration
  - Replace manual HTML entry with Vite dev server
  - Update `package.json` scripts for `dev`, `build`, `test`, `lint`
- [ ] Enhance ESLint/Prettier integration:
  - Update `.eslintrc.cjs` for browser ES modules
  - Create `.prettierrc` and `.editorconfig`
  - Add pre-commit hooks for formatting
- [ ] Remove dependency on manual server setup

#### Acceptance Criteria
- `npm run dev` starts Vite dev server
- `npm run build` creates optimized production build
- `npm run lint` passes with zero errors
- `npm run test` runs all tests successfully

### C. CI/CD Pipeline
**Priority: High | Effort: Medium | Risk: Medium**

#### Tasks
- [ ] Create `.github/workflows/ci-web.yml`:
  - Node.js matrix testing (LTS versions)
  - Install dependencies with `npm ci`
  - Run linting, testing, and build steps
  - Publish status badges
- [ ] Create `.github/workflows/ci-unity.yml`:
  - Unity LTS version pinning
  - Edit-mode test execution
  - Graceful failure if Unity runner unavailable
- [ ] Add status badges to README

#### Acceptance Criteria
- Web CI runs on all PRs and pushes
- Unity CI runs when Unity files change
- Status badges reflect current build status
- CI fails fast on linting or test errors

### D. Quality Assurance
**Priority: High | Effort: Medium | Risk: Low**

#### Tasks
- [ ] Add Playwright smoke testing:
  - Create `playwright.config.ts`
  - Implement `tests/smoke.spec.ts` for HUD counter verification
  - Test game loop startup and basic functionality
  - Ensure tests run in CI environment
- [ ] Optimize test performance:
  - Target <5 second test execution
  - Use headless browser for CI
  - Add retry logic for flaky tests

#### Acceptance Criteria
- Smoke test verifies HUD counter increments
- Tests run successfully in CI
- Test execution time <5 seconds
- Tests are resilient to timing issues

### E. Repository Hygiene
**Priority: Medium | Effort: Low | Risk: Low**

#### Tasks
- [ ] Ensure all linting passes:
  - Fix any existing linting errors
  - Add missing ESLint rules for consistency
  - Update `.editorconfig` for team consistency
- [ ] Verify build process:
  - `npm run build` produces minified artifacts
  - Build output is optimized for production
  - Source maps are generated for debugging

#### Acceptance Criteria
- Zero linting errors across codebase
- Build produces optimized, minified output
- All scripts in package.json work correctly

## Phase 2: Scaffolding & Structure (Week 3-6)

### A. Module Extraction
**Priority: Medium | Effort: High | Risk: Medium**

#### Tasks
- [ ] Create module stubs under `src/`:
  - `GameLoop/` - Core game loop management
  - `Spawner/` - Entity spawning and management
  - `CollisionSystem/` - Collision detection and response
  - `InputSystem/` - Input handling and mapping
  - `AudioSystem/` - Audio management and playback
- [ ] Move current monolith code behind thin facades
- [ ] Add TODO comments for future extraction points
- [ ] Create unit test placeholders for each module

#### Acceptance Criteria
- Module structure is established
- Current functionality remains unchanged
- Each module has basic test coverage
- Clear TODOs mark extraction points

### B. Unity Integration
**Priority: Low | Effort: Medium | Risk: Low**

#### Tasks
- [ ] Create Unity project structure:
  - Document Unity LTS version requirements
  - List required packages and dependencies
  - Create minimal scene setup instructions
  - Define edit-mode test structure
- [ ] Add Unity CI configuration:
  - Self-hosted runner setup instructions
  - Edit-mode test execution
  - Build verification steps

#### Acceptance Criteria
- Unity setup is clearly documented
- CI can run Unity tests when available
- Unity project structure is established

## Phase 3: Advanced Features (Week 7+)

### A. Enhanced Testing
**Priority: Medium | Effort: High | Risk: Low**

#### Tasks
- [ ] Add integration tests:
  - Test system interactions
  - Verify event flow between modules
  - Test configuration changes
- [ ] Implement performance testing:
  - Add performance regression detection
  - Monitor memory usage and FPS
  - Create performance benchmarks
- [ ] Add visual regression testing:
  - Screenshot comparison tests
  - UI component testing
  - Responsive design validation

### B. Developer Experience
**Priority: Low | Effort: Medium | Risk: Low**

#### Tasks
- [ ] Enhance development tools:
  - Add hot module replacement
  - Improve debugging capabilities
  - Add development mode features
- [ ] Create contribution guidelines:
  - Code style guidelines
  - PR template
  - Issue templates
- [ ] Add automated dependency updates

## Tracking & Reporting

### GitHub Projects Board
**Priority: High | Effort: Low | Risk: Low**

#### Tasks
- [ ] Create "Angry Dogs Remediation" project board
- [ ] Set up columns: Phase 1, Phase 2, Phase 3, Blocked, Done
- [ ] Create issues for each major task
- [ ] Add labels: `phase:1`, `phase:2`, `area:web`, `area:unity`, `kind:tooling`, `kind:docs`, `kind:qa`
- [ ] Link issues to specific files and line numbers

#### Acceptance Criteria
- Project board is created and populated
- All issues have clear acceptance criteria
- Issues are properly labeled and categorized
- Progress is visible and trackable

### Reporting
**Priority: Medium | Effort: Low | Risk: Low**

#### Tasks
- [ ] Create `CONTRIBUTING.md` with:
  - Triage cadence and process
  - Label usage guidelines
  - PR review process
- [ ] Set up automated reporting:
  - Weekly progress summaries
  - CI status notifications
  - Test coverage reports

## Risk Mitigation

### High-Risk Items
- **Unity CI**: May require self-hosted runner; implement graceful fallback
- **Vite Migration**: Could break existing functionality; test thoroughly
- **Module Extraction**: Risk of breaking existing code; use facade pattern

### Mitigation Strategies
- Implement changes incrementally
- Maintain comprehensive test coverage
- Use feature flags for risky changes
- Create rollback plans for each phase

## Success Metrics

### Phase 1 Success Criteria
- [ ] All CI pipelines are green
- [ ] Smoke tests pass consistently
- [ ] Documentation is complete and accurate
- [ ] Development setup takes <5 minutes
- [ ] Zero linting errors across codebase

### Phase 2 Success Criteria
- [ ] Module structure is established
- [ ] Unity integration is documented
- [ ] All tests continue to pass
- [ ] Code is ready for future refactoring

### Overall Success Metrics
- **Development Velocity**: 50% reduction in setup time
- **Code Quality**: 100% linting compliance
- **Test Coverage**: Maintain 100% test success rate
- **Documentation**: Complete setup and architecture docs
- **CI/CD**: Fully automated testing and building

## Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Week 0-2 | Tooling, CI, Smoke Tests, Docs |
| Phase 2 | Week 3-6 | Module Scaffolding, Unity Setup |
| Phase 3 | Week 7+ | Advanced Testing, Developer Experience |

## Next Steps

1. **Immediate**: Begin Phase 1 implementation with documentation updates
2. **Week 1**: Complete tooling modernization and CI setup
3. **Week 2**: Add smoke tests and finalize Phase 1
4. **Week 3**: Begin Phase 2 module scaffolding
5. **Ongoing**: Track progress and adjust timeline as needed

---

*This remediation plan provides a structured approach to addressing the identified issues while maintaining the existing functionality and improving the overall development experience.*