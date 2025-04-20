# Supabase Local Setup Guide

This guide explains how to set up and use Supabase locally for development.

## Prerequisites

- Linux/macOS/Windows
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Homebrew](https://brew.sh/) (for macOS/Linux)

## Installation Steps

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Add Homebrew to PATH** (Linux only):
   ```bash
   echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
   eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
   ```

3. **Install Supabase CLI**:
   ```bash
   brew install supabase/tap/supabase
   ```

4. **Initialize Supabase**:
   ```bash
   supabase init
   ```

5. **Start Supabase Services**:
   ```bash
   supabase start
   ```

## Environment Configuration

Create a `.env` file in your project root with the following content:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Available Endpoints

- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **Studio URL**: http://127.0.0.1:54323
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Inbucket URL**: http://127.0.0.1:54324
- **Storage URL**: http://127.0.0.1:54321/storage/v1/s3

## Database Schema

The local database includes the following tables:

1. **freelancer_profiles**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `full_name` (text)
   - `professional_title` (text)
   - `hourly_rate` (numeric)
   - `skills` (text[])
   - `created_at` (timestamp)

2. **client_profiles**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `company_name` (text)
   - `industry` (text)
   - `company_size` (text)
   - `created_at` (timestamp)

3. **projects**
   - `id` (uuid, primary key)
   - `client_id` (uuid, references client_profiles)
   - `title` (text)
   - `description` (text)
   - `start_date` (date)
   - `end_date` (date)
   - `budget` (numeric)
   - `status` (text)
   - `created_at` (timestamp)
   - `technologies` (text[])
   - `team_size` (int)
   - `requirements` (text)

4. **jobs**
   - `id` (uuid, primary key)
   - `client_id` (uuid)
   - `title` (text)
   - `description` (text)
   - `project_type` (text)
   - `budget_type` (text)
   - `budget_amount` (numeric)
   - `budget_max_amount` (numeric)
   - `duration` (text)
   - `experience_level` (text)
   - `location` (text)
   - `timezone` (text)
   - `project_scope` (text)
   - `skills_required` (text[])
   - `status` (text)
   - `visibility` (text)
   - `preferences` (jsonb)

## Common Commands

1. **Start Supabase**:
   ```bash
   supabase start
   ```

2. **Stop Supabase**:
   ```bash
   supabase stop
   ```

3. **Reset Database**:
   ```bash
   supabase db reset
   ```

4. **View Logs**:
   ```bash
   supabase logs
   ```

## Accessing Supabase Studio

1. Open your browser and navigate to http://127.0.0.1:54323
2. Use the Studio interface to:
   - Manage database tables
   - View and modify data
   - Manage authentication
   - Monitor API usage
   - Configure storage
   - Test API endpoints

## Security and RLS Policies

The following Row Level Security (RLS) policies are implemented:

1. **Freelancer Profiles**:
   - Users can view/update/insert their own freelancer profile
   - Authentication required for all operations

2. **Client Profiles**:
   - Users can view/update/insert their own client profile
   - Authentication required for all operations

3. **Projects**:
   - Clients can manage their own projects
   - Freelancers can view available (open) projects
   - Authentication required for all operations

4. **Jobs**:
   - Clients can create and manage their own jobs
   - Freelancers can view open jobs
   - Authentication required for all operations

## Troubleshooting

1. **Database Connection Issues**:
   ```bash
   supabase stop
   supabase start
   ```

2. **Reset Environment**:
   ```bash
   supabase stop
   supabase start --reset
   ```

3. **Check Service Status**:
   ```bash
   supabase status
   ```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 