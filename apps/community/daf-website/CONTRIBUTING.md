# Contributing to Dr. Dibya Arfianda Website

Thank you for your interest in contributing to this healthcare website! This document provides guidelines for contributing to this patient consultation platform.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork:**

   ```bash
   git clone https://github.com/your-username/abyss-monorepo.git
   cd abyss-monorepo/app/daf-website
   ```

3. **Set up development environment:**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow all linting rules
- **Prettier**: Code formatting
- **Component Structure**: Functional components with hooks

### Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all inputs
- Follow healthcare data privacy guidelines

### Testing

- Test components with React Testing Library
- Test API endpoints
- Ensure database operations are safe

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 📁 Project Structure

```
daf-website/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── globals.css       # Global styles
│   └── page.tsx          # Main page
├── lib/
│   ├── prisma.ts         # Database client
│   ├── schemas.ts        # Validation schemas
│   └── utils.ts          # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── types/                # Type definitions
```

## 🐛 Bug Reports

When reporting bugs, include:

- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## 💡 Feature Requests

For new features:

- Clear description of the feature
- Use case and benefits
- Implementation suggestions
- Mockups if applicable

## 📝 Commit Message Format

```
type(scope): description

[optional body]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

## 🤝 Code Review

All changes require review before merging. Ensure:

- Code follows style guidelines
- Tests pass
- Security considerations addressed
- Documentation updated

## 📞 Communication

- **Issues:** Bug reports and feature requests
- **Discussions:** General questions
- **Pull Requests:** Code review

## 📄 License

This project is part of the Abyss monorepo. See root LICENSE file.

---

**Thank you for contributing to healthcare technology! 🏥**

**Architected and built by Claudesy.**
