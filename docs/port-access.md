# Port Access Documentation

This document outlines all the ports used in the Dev Gigs application and their respective purposes.

## Development Ports

### Frontend Application
- **Port**: 5173
- **URL**: http://localhost:5173
- **Purpose**: Vite development server for the React application
- **Access**: Local development environment
- **Notes**: Default Vite port, can be changed if needed

### Supabase Services

1. **API Service**
   - **Port**: 54321
   - **URL**: http://127.0.0.1:54321
   - **Purpose**: Main Supabase API endpoint
   - **Access**: Local development environment
   - **Notes**: Handles all API requests to Supabase

2. **Database**
   - **Port**: 54322
   - **URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   - **Purpose**: PostgreSQL database instance
   - **Access**: Local development environment
   - **Notes**: Direct database access for development and debugging

3. **Studio**
   - **Port**: 54323
   - **URL**: http://127.0.0.1:54323
   - **Purpose**: Supabase Studio dashboard
   - **Access**: Local development environment
   - **Notes**: Web interface for managing database, authentication, and storage

4. **Inbucket (Email Service)**
   - **Port**: 54324
   - **URL**: http://127.0.0.1:54324
   - **Purpose**: Email testing service
   - **Access**: Local development environment
   - **Notes**: Captures and displays emails sent during development

5. **Storage API**
   - **Port**: 54321 (shared with main API)
   - **URL**: http://127.0.0.1:54321/storage/v1/s3
   - **Purpose**: File storage service
   - **Access**: Local development environment
   - **Notes**: Handles file uploads and storage

## Production Ports

### Frontend Application
- **Port**: 80/443
- **URL**: https://[your-domain]
- **Purpose**: Production application
- **Access**: Public access
- **Notes**: Standard HTTP/HTTPS ports

### Supabase Services
- **Port**: 443
- **URL**: https://[your-project].supabase.co
- **Purpose**: Production Supabase services
- **Access**: Public access with authentication
- **Notes**: All Supabase services are accessed through the main API endpoint

## Port Configuration

### Environment Variables
```env
# Frontend
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Changing Default Ports

1. **Vite Development Server**
   ```bash
   npm run dev -- --port 3000
   ```

2. **Supabase Services**
   ```bash
   supabase start --port 54321
   ```

## Security Considerations

1. **Development Environment**
   - All ports are accessible only on localhost
   - No external access required
   - Use environment variables for configuration

2. **Production Environment**
   - Use HTTPS for all external access
   - Implement proper authentication
   - Configure CORS appropriately
   - Use environment variables for sensitive information

## Troubleshooting Port Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :PORT_NUMBER
   
   # Kill process
   kill -9 PROCESS_ID
   ```

2. **Firewall Issues**
   - Ensure local firewall allows the required ports
   - Check if antivirus software is blocking ports

3. **Docker Port Conflicts**
   ```bash
   # Stop all containers
   docker stop $(docker ps -a -q)
   
   # Start Supabase
   supabase start
   ```

## Port Forwarding (if needed)

For remote development or testing:
```bash
# Forward Supabase API
ssh -L 54321:localhost:54321 user@remote-host

# Forward Database
ssh -L 54322:localhost:54322 user@remote-host
``` 