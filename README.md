# TrustTrip

## Project Title & Problem Statement

**TrustTrip** is a web-based transparency system designed to address the lack of clarity in intercity bus ticket cancellation and refund processes.

Currently, passengers often do not understand how refund amounts are calculated or why deductions occur, which leads to confusion and mistrust. TrustTrip focuses on **explainability** by simulating a rule-based refund system that clearly shows *how* and *why* a refund amount is generated.

---

## Folder Structure & Explanation

trusttrip/
├── app/
│   ├── page.tsx          # Main landing page (UI entry point)
│   ├── layout.tsx        # Root layout shared across pages
│   └── api/
│       └── refund/
│           └── route.ts  # Backend API route for refund logic
├── public/               # Static assets (kept minimal)
├── README.md             # Project documentation
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration

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

⸻
