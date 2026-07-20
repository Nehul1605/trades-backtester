# Workspace Rules for Antigravity

- **Frontend & Backend Logic Integrity**: 
  Never hardcode state, mock data, or business logic inside the frontend components. Any interactive feature, user access control, database action, or dashboard state modification must be backed by a proper backend route, controller logic, and Mongoose database model inside the `backend/` codebase. Ensure that frontend actions retrieve or mutate state strictly via API requests to the Node.js Express server.
