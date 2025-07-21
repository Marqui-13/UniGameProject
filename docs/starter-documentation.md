# Game Development Starter Documentation

## Project Overview
This document outlines the initial plan for a 3D game developed for a Databases and Information Management course. The game features a user authentication system, a 3D environment built with Three.js, custom shaders using OpenGL/GLSL or WebGPU, and a SQL database for storing user and game data. The frontend will be built using React or Next.js, and the application will be hosted on a platform compatible with the technical stack.

---

## Must-Have Features

1. **User Interface (UI) for Authentication**
   - Users choose a username and password to register or log in.
   - Successful authentication grants access to the game system.
   - UI built with **React** or **Next.js** for a responsive experience.

2. **Registration with Authentication**
   - Secure user registration and login system.
   - Store credentials (username, hashed password) in a SQL database.
   - Use secure practices (e.g., bcrypt for password hashing, JWT or session-based authentication).

3. **SQL Database for Data Storage**
   - Store user data (username, hashed password, registration date) in a relational SQL database (e.g., PostgreSQL or MySQL).
   - Store game data (e.g., player progress, scores) as needed.
   - Use parameterized queries to prevent SQL injection.

4. **Querying Functionality**
   - Implement queries for:
     - User authentication.
     - Retrieving game data (e.g., scores, progress).
     - Future queries (e.g., leaderboards, statistics).
   - Ensure efficient database interactions.

5. **3D Game Environment**
   - Build a 3D environment using **Three.js** (WebGL-based).
   - Include interactive elements (e.g., objects, characters, scenes).
   - Ensure compatibility with React/Next.js frontend.

6. **Custom Shaders**
   - Implement shaders using **OpenGL/GLSL** (preferred) or **WebGPU**.
   - Use cases: lighting effects, texture manipulation, particle systems.
   - Integrate shaders with Three.js.

7. **Hosting**
   - Host on a platform supporting Node.js, SQL, WebGL, and React/Next.js.
   - Options:
     - **Vercel**: Ideal for Next.js, supports serverless functions.
     - **Render**: Supports Node.js, PostgreSQL, and static sites.
     - **Heroku**: Flexible for Node.js and SQL, may need WebGL configuration.
     - **AWS/GCP**: Custom setups for full control.

---

## Technical Stack

- **Frontend**: React or Next.js
- **3D Rendering**: Three.js (WebGL-based)
- **Shaders**: OpenGL/GLSL or WebGPU (WGSL)
- **Backend**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL or MySQL
- **Authentication**: JWT or session-based with bcrypt
- **Hosting**: Vercel, Render, Heroku, or AWS/GCP
- **Version Control**: Git (GitHub)

---

## System Architecture

### Frontend (React/Next.js)
- **Components**:
  - `LoginForm`: Inputs for username, password, and login button.
  - `RegisterForm`: Inputs for username, password, confirmation, and register button.
  - `GameCanvas`: Three.js canvas for 3D game rendering.
- **State Management**:
  - React hooks (`useState`, `useEffect`) or Redux for session/game state.
- **Routing** (Next.js):
  - `/login`: Login page.
  - `/register`: Registration page.
  - `/game`: Main game interface (protected route).

### Backend (Node.js/Express or Next.js API Routes)
- **Endpoints**:
  - `POST /api/register`: Create user (store username, hashed password).
  - `POST /api/login`: Authenticate user, return JWT/session token.
  - `GET /api/user`: Fetch user data (profile, progress).
  - `POST /api/game`: Save game data (scores, progress).
- **Authentication Middleware**:
  - Validate JWT/session tokens for protected routes.
- **Database Connection**:
  - Use ORM (Sequelize, TypeORM) or raw SQL (`pg`, `mysql2`).

### Database (SQL)
- **Tables**:
  - `Users`:
    - `id`: Primary key, auto-incremented.
    - `username`: Unique, string.
    - `password`: Hashed, string.
    - `created_at`: Timestamp.
  - `GameData`:
    - `id`: Primary key, auto-incremented.
    - `user_id`: Foreign key referencing `Users(id)`.
    - `score`: Integer.
    - `progress`: JSON/text for game state.
- **Sample Queries**:
  - Register: `INSERT INTO Users (username, password) VALUES (?, ?)`.
  - Login: `SELECT * FROM Users WHERE username = ?`.
  - Save Game: `INSERT INTO GameData (user_id, score, progress) VALUES (?, ?, ?)`.

### 3D Game Environment (Three.js)
- **Scene Setup**:
  - Basic scene with camera, renderer, and objects (e.g., cubes, spheres).
  - Add ambient/directional lighting.
- **Interaction**:
  - Implement controls (keyboard/mouse) for navigation.
  - Use Three.js event handlers for interactivity.
- **Shaders**:
  - Write GLSL vertex/fragment shaders for effects (e.g., glowing objects).
  - Explore WebGPU/WGSL if chosen.
  - Use Three.js `ShaderMaterial` for integration.

### Hosting Considerations
- Ensure support for:
  - Node.js backend.
  - SQL database (e.g., PostgreSQL).
  - WebGL for Three.js.
- Optimize for low latency and smooth rendering.

---

## Development Plan

### Phase 1: Setup and Authentication
- Set up React/Next.js project.
- Create `LoginForm` and `RegisterForm`.
- Implement backend API for registration/login.
- Configure SQL database and connect to backend.
- Test authentication flow.

### Phase 2: 3D Game Environment
- Integrate Three.js with React/Next.js.
- Create basic 3D scene with objects and controls.
- Test rendering performance.

### Phase 3: Shaders
- Write GLSL shaders for visual effects.
- Integrate with Three.js materials.
- (Optional) Explore WebGPU/WGSL.

### Phase 4: Database Integration
- Implement queries for game data storage/retrieval.
- Ensure secure database interactions.
- Test data persistence.

### Phase 5: Hosting and Deployment
- Deploy frontend/backend to hosting platform.
- Configure database hosting.
- Test end-to-end functionality.

---

## Potential Challenges

1. **WebGL Performance**:
   - Optimize Three.js scenes for various devices.
   - Test on low-end hardware.
2. **Shader Complexity**:
   - Debug GLSL/WebGPU shaders for browser compatibility.
   - Use Three.js abstractions for simplicity.
3. **Database Security**:
   - Use parameterized queries to prevent SQL injection.
   - Secure password storage and session management.
4. **Hosting Limitations**:
   - Verify platform compatibility with WebGL and database.

---

## Future Considerations

- **Scalability**:
  - Plan for multiplayer features (e.g., leaderboards).
  - Use WebSocket/serverless functions for dynamic updates.
- **Game Features**:
  - Define mechanics (levels, challenges).
  - Implement scoring system tied to database.
- **UI/UX**:
  - Add loading screens, error messages, feedback.
  - Ensure mobile responsiveness.

## Next Steps
- 1	Finalize Framework:
	◦	Choose React or Next.js.
	◦	Select PostgreSQL or MySQL.
- 2	Prototype Authentication:
	◦	Build and test login/register system.
- 3	Set Up Three.js:
	◦	Create minimal 3D scene.
- 4	Explore Hosting:
	◦	Test deployment on Vercel/Render.
- 5	Plan Game Mechanics:
	◦	Define objectives and database integration.

This documentation serves as a foundation for the game project. Expand on physics, mechanics, UI, and queries as development progresses.
