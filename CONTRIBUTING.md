# Contributing to AI Email Assistant

Thank you for your interest in contributing to AI Email Assistant! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

### Suggesting Features

Feature requests are welcome! Please provide:

- Clear and descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for new features or bug fixes
5. **Run tests**: `npm test`
6. **Run linter**: `npm run lint`
7. **Commit your changes** with clear commit messages
8. **Push to your fork** and submit a pull request

#### Commit Message Guidelines

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(ai): add support for Gemini AI provider
fix(gmail): handle token refresh edge case
docs(readme): update installation instructions
```

## Development Setup

1. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/ai-email-assistent.git
cd ai-email-assistent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Start database** (using Docker)
```bash
docker-compose up -d postgres redis
```

5. **Run migrations**
```bash
npm run db:migrate
```

6. **Start development server**
```bash
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type when possible
- Define proper interfaces and types
- Use strict mode

### Code Style

- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React/Next.js

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use Next.js features appropriately (SSR, SSG, etc.)

### Database

- Use Sequelize models for database operations
- Add proper indexes for performance
- Write migrations for schema changes
- Never commit raw database credentials

## Testing

- Write unit tests for new features
- Maintain or improve code coverage
- Test edge cases and error handling
- Run full test suite before submitting PR

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Document environment variables in .env.example
- Update API documentation for new endpoints

## Project Structure

```
ai-email-assistant/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Core libraries and utilities
├── models/          # Database models
├── migrations/      # Database migrations
└── tests/           # Test files
```

## Pull Request Process

1. Ensure your PR addresses a specific issue or feature
2. Update documentation as needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Request review from maintainers
6. Address review feedback
7. Wait for approval and merge

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord community (link)
- Email: dev@yourdomain.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
