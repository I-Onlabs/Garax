## Contributing to Garax

Thank you for your interest in contributing to Garax! This project is a **reference architecture** and **starter framework**, so we prioritize architectural clarity, documentation, and maintainability over feature quantity.

## Development Workflow

### Getting Started

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Run tests**: `npm test`
5. **Run linting**: `npm run lint`

### Development Process

1. **Create a feature branch** from `main` or `develop`
2. **Make your changes** following the coding standards
3. **Write tests** for new functionality
4. **Run the test suite** to ensure everything passes
5. **Run linting** to check code quality
6. **Commit your changes** with descriptive messages
7. **Push to your fork** and create a pull request

### Code Standards

- **ESLint**: All code must pass ESLint checks
- **Prettier**: Code should be formatted with Prettier
- **Tests**: New features must include tests (unit tests required, integration optional but recommended)
- **Documentation**: Update documentation as needed. Since this is a reference project, comments and docs are critical.
- **Type Safety**: Use JSDoc for type annotations

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(gameplay): add new power-up system
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
```

## Project Structure

### Web Canvas Prototype
- `src/` - Main source code
- `tests/` - Test files
- `public/` - Static assets
- `docs/` - Documentation

### Unity Scripts
- `Unity/` - Unity project (when created)
- `docs/UNITY_BOOTSTRAP.md` - Unity setup guide

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Test Guidelines

- Write unit tests for all new functions
- Write integration tests for system interactions
- Write end-to-end tests for critical user flows
- Aim for high test coverage
- Use descriptive test names

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Run linting**: `npm run lint`
3. **Check formatting**: `npm run format:check`
4. **Build successfully**: `npm run build`
5. **Update documentation** if needed

### PR Template

When creating a pull request, please include:

- **Description**: What changes were made and why
- **Testing**: How the changes were tested
- **Screenshots**: If applicable, include screenshots
- **Breaking Changes**: Any breaking changes
- **Related Issues**: Link to related issues

### Review Process

1. **Automated Checks**: CI will run tests, linting, and builds
2. **Code Review**: At least one maintainer will review
3. **Testing**: Manual testing may be required
4. **Approval**: Changes must be approved before merging

## Issue Management

### Labels

We use the following label system:

#### Phase Labels
- `phase:1` - Phase 1 (Immediate stabilization)
- `phase:2` - Phase 2 (Scaffolding & structure)
- `phase:3` - Phase 3 (Advanced features)

#### Area Labels
- `area:web` - Web Canvas Prototype
- `area:unity` - Unity Scripts
- `area:docs` - Documentation
- `area:ci` - CI/CD

#### Type Labels
- `kind:bug` - Bug report
- `kind:feature` - Feature request
- `kind:enhancement` - Enhancement
- `kind:tooling` - Tooling/Infrastructure
- `kind:qa` - Quality Assurance
- `kind:docs` - Documentation

#### Priority Labels
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

### Issue Templates

Use the appropriate issue template:
- Bug Report
- Feature Request
- Enhancement
- Documentation

## Triage Cadence

### Weekly Triage
- Review new issues and PRs
- Assign appropriate labels
- Prioritize based on impact and effort
- Update project board status

### Monthly Review
- Review project progress
- Update roadmap and priorities
- Assess technical debt
- Plan next phase work

## Development Environment

### Prerequisites
- Node.js 16+ and npm 8+
- Modern browser with ES6+ support
- Git

### Optional
- Unity LTS 2022.3.x (for Unity development)
- Visual Studio Code with recommended extensions

### Recommended VS Code Extensions
- ESLint
- Prettier
- Jest
- GitLens
- Thunder Client (for API testing)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or inappropriate comments
- Personal attacks or political discussions
- Public or private harassment
- Publishing private information without permission
- Other unprofessional conduct

## Getting Help

### Documentation
- Check the `docs/` directory
- Read the README.md
- Review existing issues and PRs

### Community
- Create an issue for questions
- Use discussions for general topics
- Tag maintainers for urgent issues

### Maintainers
- @maintainer1 - Project lead
- @maintainer2 - Technical lead
- @maintainer3 - Documentation lead

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to TotTrots Game Refactored! 🎮