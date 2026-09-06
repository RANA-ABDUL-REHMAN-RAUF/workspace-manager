# Workspace Management

A client-only workspace/project/task manager (Jira/Asana-style) built with React 19, Redux Toolkit, and Vite. All data lives in the browser (`localStorage`) — there is no backend.

## Stack

- React 19 + React Router 7
- Redux Toolkit (single store, command-based updates with rollback + undo)
- Tailwind CSS 4
- react-toastify for notifications
- Playwright for e2e tests

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run lint      # eslint
npm run preview   # preview production build
```

## Structure

```
src/
  app/            App-level providers and the router (react-router route table)
  pages/          Route-level screens (Dashboard, Workspace, Project, MyTasks, Members, Activity, Search, Settings, Login, Signup, Profile)
  layouts/        AppLayout, AuthLayout, Header, Sidebar, DevControls (debug tools)
  features/       Feature-specific components (projects, tasks, workspaces, search) grouped by domain
  components/
    ui/           Reusable UI primitives (Button, Modal, Dropdown, Toast, Tabs, ...)
    common/       Shared building blocks (EmptyState, ConfirmDialog, ErrorBoundary, LoadingSkeleton)
  store/          Redux store, root reducer, and workspaceModel (command/reducer logic for the domain data)
  services/       localStorage/IndexedDB persistence, import/export, mock realtime socket, Cloudinary upload
  data/           Seed/mock data (users, workspaces, projects, tasks, comments, notifications)
  hooks/          useDebounce, useLocalStorage, useOnlineStatus, useKeyboardShortcut
  constants/      Route paths, roles, status, priorities
  utils/          date, ids, validation, notify, helpers
```

## Data model & persistence

All domain data (`users`, `workspaces`, `projects`, `tasks`, ...) lives in one Redux slice. Changes go through `execute(command)` ([src/store/store.js](src/store/store.js)), which:

1. Applies the command via `applyCommand` in [src/store/workspaceModel.js](src/store/workspaceModel.js)
2. Commits it optimistically, simulates a save delay, and rolls back on simulated failure
3. Shows a toast with an **Undo** action
4. Persists the whole state to `localStorage` on every change

Workspaces can be exported/imported as JSON via [src/services/importExport/](src/services/importExport/).

## Routing

Route paths are centralized in [src/constants/routes.js](src/constants/routes.js) and wired up in [src/app/router.jsx](src/app/router.jsx). Authenticated routes render inside `AppLayout`; login/signup render inside `AuthLayout`.
