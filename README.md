# Dev Gigs

A platform connecting freelancers and clients for project collaboration.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Dev Gigs is a platform designed to connect freelancers with clients for project collaboration. The platform provides features for both freelancers and clients to manage their profiles, post and find projects, and collaborate effectively.

## Features

- **User Authentication**: Secure login and registration for both freelancers and clients
- **Profile Management**: 
  - Freelancers can create and manage their professional profiles
  - Clients can create and manage company profiles
- **Project Management**:
  - Clients can post and manage projects
  - Freelancers can browse and apply for projects
- **Job Postings**:
  - Detailed job listings with requirements and preferences
  - Advanced filtering and search capabilities

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js (v14 or higher)
- Docker
- Homebrew (for macOS/Linux)
- Supabase CLI

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd dev-gigs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase locally (see [Supabase Setup Guide](docs/supabase-setup.md))

4. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Development Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start Supabase services:
   ```bash
   supabase start
   ```

3. Access the application at `http://localhost:5173`

## Database Schema

The application uses the following main tables:
- `freelancer_profiles`
- `client_profiles`
- `projects`
- `jobs`

For detailed schema information, refer to the [Supabase Setup Guide](docs/supabase-setup.md).

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run test`: Run tests
- `npm run lint`: Run linter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.