# FitFest Fitness Tracker

A modern fitness tracking application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- User authentication and profile management
- Activity tracking and logging
- Progress visualization
- Social features (following users, public/private activities)
- Real-time error monitoring with Sentry

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Monitoring:** Sentry
- **Testing:** Jest, React Testing Library
- **Code Coverage:** Codecov

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- PostgreSQL database (Vercel Postgres recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd fitfest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   SENTRY_AUTH_TOKEN="your-sentry-auth-token"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Code Style

This project uses ESLint and Prettier for code formatting. To format your code:

```bash
npm run format
```

### Testing

Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Project Structure

```
src/
├── app/              # App Router pages and layouts
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
├── styles/          # Global styles and Tailwind config
├── types/           # TypeScript type definitions
└── tests/           # Test files
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## License

[License Type] - See LICENSE file for details
