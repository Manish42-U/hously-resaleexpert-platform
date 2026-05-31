# Hously Finntech Realty - Workspace Instructions

**Project**: Fintech realty application with web admin dashboard, mobile app, and REST API backend  
**Type**: Monorepo (3 independent applications)  
**Node Requirement**: v22.11.0+

---

## Architecture Overview

### Project Structure
```
admin/          → React + Vite web dashboard (property management UI)
client/         → React Native mobile app (iOS/Android)
server/         → Node.js + Express REST API backend
```

### Tech Stack by Module

| Module | Framework | Language | Key Tech |
|--------|-----------|----------|----------|
| **admin** | React 19 | JavaScript | Vite, TailwindCSS, React Router, axios |
| **client** | React Native 0.85 | TypeScript | NativeWind, React Navigation, Jest |
| **server** | Express 5.2 | JavaScript | MySQL2, nodemon, cors |

---

## Development Setup

### Prerequisites
```bash
# Verify Node version
node --version  # Must be >= v22.11.0

# One-time setup for iOS development (client only)
cd client && bundle install && bundle exec pod install && cd ..
```

### Start All Services
```bash
# Terminal 1: Start backend API
cd server && npm run dev

# Terminal 2: Start web admin dashboard
cd admin && npm run dev

# Terminal 3: Start mobile app (requires Metro bundler)
cd client && npm start
# Then run android or ios in another terminal:
#   npm run android  (requires Android Studio/emulator)
#   npm run ios      (requires Xcode/simulator)
```

### Build Commands
```bash
admin/   → npm run build     # Vite static build → admin/dist
client/  → npm run android   # Gradle APK build
         → npm run ios       # Xcode build for iOS
server/  → npm start         # Runs server.js directly (no build step)
```

### Linting & Testing
```bash
admin/   → npm run lint      # ESLint check
client/  → npm run lint      # ESLint check
         → npm run test      # Jest tests (currently minimal)
server/  → No linting or tests configured
```

---

## API Integration Pattern

### Base URLs (Hardcoded - SECURITY ISSUE ⚠️)
```javascript
// admin/src/services/api.js
axios.create({ baseURL: 'http://localhost:5000/api' })

// client/src/services/api.ts (Android emulator)
axios.create({ baseURL: 'http://10.0.2.2:5000/api' })
```

**Action Required**: Convert to environment-based configuration before production.

### Key Endpoints
| Endpoint | Method | Handler | Purpose |
|----------|--------|---------|---------|
| `/properties` | GET/POST | propertyController.js | Fetch/create properties |
| `/blogs` | GET/POST/PUT/DELETE | blogController.js | Blog management |
| `/contact` | POST | contactController.js | Contact form submission |
| *(No auth endpoints)* | — | — | **Missing login/register** |

### Data Models
- **Properties**: title, location, price, property_type, agent (full_name, email, phone)
- **Blogs**: title, content, author, image_url
- **Users**: name, email, password (plain text ⚠️), role
- **Contacts**: name, email, subject, message

**Note**: No foreign key relationships defined in schema.sql.

---

## Critical Security Issues ⚠️ [MUST FIX]

### 1. **No Authentication Middleware**
- Folder: `server/middleware/` is **empty**
- Issue: All API routes are publicly accessible
- Fix: Implement JWT middleware for protected routes

### 2. **Plain Text Passwords**
- Location: `server/models/User.js`
- Issue: User passwords stored without hashing
- Fix: Add bcrypt hashing before storing in DB

### 3. **No Input Validation**
- Location: All controllers lack validation
- Issue: Accepts malformed data; vulnerable to injection
- Fix: Add express-validator or joi for request validation

### 4. **Hardcoded API URLs**
- Issue: localhost/10.0.2.2 won't work in production
- Fix: Use environment variables (`process.env.REACT_APP_API_URL`, etc.)

### 5. **Global CORS**
- Location: `server/server.js`
- Issue: Allows requests from any origin
- Fix: Restrict `cors()` options to specific frontend URLs

### 6. **No Login Logic**
- Files: `admin/src/pages/Login.jsx` is UI-only
- Issue: Form collects credentials but doesn't authenticate
- Fix: Implement `/auth/login` endpoint with JWT generation

---

## Project Conventions

### Code Organization
- **admin/** → Component-based: Pages → Components → Services
- **client/** → Screen-based: Screens → Components → Navigation
- **server/** → MVC pattern: Routes → Controllers → Models

### API Service Layer Pattern
Both admin and client use axios wrapper service pattern:
```javascript
// admin/src/services/api.js
export const propertyService = { getAll(), create(data), ... }

// client/src/services/api.ts (same pattern)
export const propertyService = { getAll(), create(data), ... }
```

### Styling
- **admin**: TailwindCSS + PostCSS (utility-based)
- **client**: NativeWind + Tailwind (React Native utilities)

### No Shared Code
Each module is completely isolated—no shared utilities, types, or components. This is acceptable for now but creates maintenance overhead if code duplication increases.

---

## Environment Configuration

### Server (.env file needed)
Create `server/.env`:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=hously
DB_PORT=3306
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Admin & Client
No .env files currently used. Should add for API base URL:
```bash
# admin/.env
VITE_API_URL=http://localhost:5000/api

# client/.env
REACT_APP_API_URL=http://10.0.2.2:5000/api  # or different for iOS
```

---

## Common Development Tasks

### Adding a New API Endpoint
1. Create route in `server/routes/xxxRoutes.js`
2. Implement controller in `server/controllers/xxxController.js`
3. Model in `server/models/xxx.js` (if needed)
4. Update both admin and client services to call new endpoint
5. **DO NOT FORGET**: Add auth middleware if route should be protected

### Adding a New Page/Screen
**Admin**:
```javascript
// 1. Create in src/pages/NewPage.jsx
// 2. Add route in App.jsx or appropriate router
// 3. Import service from src/services/api.js
```

**Client**:
```javascript
// 1. Create in src/screens/NewScreen.tsx
// 2. Register in src/navigation/AppNavigator.tsx
// 3. Use same service pattern as admin
```

### Debugging Axios Requests
```javascript
// Add request/response logging to api.js:
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});
api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

### Database Queries
Design decisions made in schema:
- Column names use snake_case (e.g., `property_type`, `full_name`)
- No timestamps (created_at, updated_at) tracked
- No soft deletes (isActive flags)
- No audit logs

---

## Performance & Optimization Notes

### Current State
- ✅ Vite dev server with HMR (admin)
- ✅ Metro bundler (client/React Native)
- ✅ Nodemon auto-restart (server)
- ⚠️ No database connection pooling visible
- ⚠️ No API caching strategy
- ⚠️ No pagination on list endpoints

### Recommendations for Future
- Add MySQL connection pooling in `server/config/db.js`
- Implement pagination for properties/blogs lists
- Add response caching headers
- Profile mobile app bundle size (React Native can get bloated)

---

## Troubleshooting

### Metro Bundler Hangs
```bash
cd client
npx react-native start --reset-cache
```

### Database Connection Errors
- Check `server/.env` credentials match MySQL instance
- Verify MySQL is running: `mysql -u root -p`
- Check schema exists: `USE hously; SHOW TABLES;`

### Port Conflicts
- Admin listens on `localhost:5173` (Vite default)
- Server listens on `localhost:5000`
- Metro listens on `localhost:8081`

Use `lsof -i :PORT` to find process using port, then `kill -9 PID`

---

## Next Steps for Full Stack Development

### Priority 1 (Security & Functionality)
- [ ] Implement JWT authentication middleware + protected routes
- [ ] Add password hashing (bcrypt) to User model
- [ ] Create real login/register endpoints and logic
- [ ] Add input validation to all controllers
- [ ] Restrict CORS to specific frontend origins

### Priority 2 (Developer Experience)
- [ ] Create `.env.example` files for each module
- [ ] Convert hardcoded API URLs to environment-based
- [ ] Add database seeding scripts (already have `seedBlogs.js`)
- [ ] Document database setup steps

### Priority 3 (Code Quality)
- [ ] Add TypeScript to admin dashboard (currently JS)
- [ ] Expand Jest test coverage beyond App.test.tsx
- [ ] Add ESLint rules for both admin and server
- [ ] Set up database migrations system (flyway or similar)

### Priority 4 (Architecture)
- [ ] Consider extracting shared types/interfaces to monorepo root
- [ ] Add error boundary components (admin)
- [ ] Implement role-based access control (RBAC) on frontend
- [ ] Add API request/response interceptors for error handling

---

## For AI Agents: Key Context

**When Modifying Code:**
1. Always check if routes need auth middleware (default: add it)
2. Password fields → use bcrypt hashing
3. API URLs → reference `process.env` not hardcoded values
4. Database columns → use snake_case naming
5. Validation → add express-validator before DB operations

**Multi-Module Impact:**
- Changes to server endpoints need corresponding frontend service updates in **both** admin and client
- Both frontends independently define their API base URL—keep them in sync
- No shared component libraries or utilities exist (intentional or oversight?)

**Testing Commands:**
```bash
npm run dev       # All modules support dev mode
npm run build     # Builds admin + client (server doesn't build)
npm run lint      # All modules have eslint (server doesn't)
npm test          # Only client has tests (Jest)
```

---

## File References

**Key files for quick navigation:**
- Backend routes: `server/routes/*.js`
- Backend models: `server/models/*.js`
- Admin pages: `admin/src/pages/*.jsx`
- Admin components: `admin/src/components/*.jsx`
- Client screens: `client/src/screens/*.tsx`
- Database schema: `server/schema.sql` (run this on fresh DB)
- API integration (admin): `admin/src/services/api.js`
- API integration (client): `client/src/services/api.ts`

---

**Last Updated**: 2026-05-07  
**Maintainer**: Development Team  
**Status**: ⚠️ Pre-production (security issues pending)
