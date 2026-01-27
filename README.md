# TrustTrip

## Project Title & Problem Statement

**TrustTrip** is a web-based transparency system designed to address the lack of clarity in intercity bus ticket cancellation and refund processes.

Currently, passengers often do not understand how refund amounts are calculated or why deductions occur, which leads to confusion and mistrust. TrustTrip focuses on **explainability** by simulating a rule-based refund system that clearly shows _how_ and _why_ a refund amount is generated.

---

## Folder Structure & Explanation

trusttrip/
├── app/
│ ├── page.tsx # Main landing page (UI entry point)
│ ├── layout.tsx # Root layout shared across pages
│ └── api/
│ └── refund/
│ └── route.ts # Backend API route for refund logic
├── public/ # Static assets (kept minimal)
├── README.md # Project documentation
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
└── next.config.js # Next.js configuration

**Explanation:**

- `app/` contains both frontend pages and backend API routes using the Next.js App Router.
- `app/api/refund/route.ts` serves as the backend entry point for refund-related operations.
- `public/` is reserved for static assets if required in later sprints.
- Configuration files ensure consistency and scalability as the project grows.

---

## Setup Instructions

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd trusttrip
npm install


Reflection

This project follows Next.js best practices by combining frontend and backend logic in a single codebase.
This structure helps the team scale the application in future sprints by:
	•	Enabling parallel development of UI and API layers
	•	Reducing context switching between multiple repositories
	•	Making it easier to integrate databases, caching, and authentication later
	•	Keeping the codebase modular, clean, and maintainable

By starting with a minimal but structured foundation, TrustTrip is well-prepared for iterative feature additions.

---

## GitHub Workflow

This project follows a standardized GitHub branching and pull-request workflow to ensure smoother collaboration, consistent code quality, and clear version control practices.

### Branching Strategy

We follow a consistent naming convention for branches:

- `feature/<feature-name>` - For new features (e.g., `feature/login-auth`)
- `fix/<bug-name>` - For bug fixes (e.g., `fix/navbar-alignment`)
- `chore/<task-name>` - For maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/<update-name>` - For documentation updates (e.g., `docs/readme-improvements`)

### Pull Request Process

All changes must go through a pull request review process:

1. Create a branch following the naming convention above
2. Make your changes and commit them
3. Push your branch to the repository
4. Create a pull request using our template
5. Request review from team members
6. Address any feedback
7. Merge after approval (protected branch rules apply)

### Code Review Checklist

All reviewers must verify these points before approving a PR:

- [ ] Lint and build pass successfully
- [ ] No console errors or warnings
- [ ] Functionality tested locally
- [ ] Code follows naming conventions and style guidelines
- [ ] Code follows security best practices
- [ ] Documentation updated (if applicable)
- [ ] Tests added/updated (if applicable)

### Branch Protection Rules

The `main` branch is protected with the following rules:

- Required reviews before merge (at least 1 approval)
- Required passing checks (lint, test, build)
- Disallowing direct pushes to main

These rules ensure code quality and prevent accidental breaking changes to the main branch.

⸻
```
