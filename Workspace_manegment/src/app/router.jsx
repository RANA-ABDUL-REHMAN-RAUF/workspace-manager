import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../store/hooks'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import LoginPage from '../pages/Login/LoginPage'
import SignupPage from '../pages/Signup/SignupPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import WorkspacePage from '../pages/Workspace/WorkspacePage'
import ProjectsPage from '../pages/Projects/ProjectsPage'
import ProjectPage from '../pages/Project/ProjectPage'
import MyTasksPage from '../pages/MyTasks/MyTasksPage'
import MembersPage from '../pages/Members/MembersPage'
import ActivityPage from '../pages/Activity/ActivityPage'
import SearchPage from '../pages/Search/SearchPage'
import SettingsPage from '../pages/Settings/SettingsPage'
import EmptyState from '../components/common/EmptyState'

function HomeRedirect() {
  const { session } = useAuth()
  return <Navigate to={session ? ROUTES.dashboard : ROUTES.signup} replace />
}

function NotFound() {
  return <main className="grid min-h-svh place-items-center bg-[#f8f9fe] p-6 font-sans">
    <EmptyState title="Page not found" description="This address does not match a page.">
      <Link className="text-[#6963d8] underline" to={ROUTES.home}>Go home</Link>
    </EmptyState>
  </main>
}

export default function AppRouter() {
  return <Routes>
    <Route path={ROUTES.home} element={<HomeRedirect />} />
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.signup} element={<SignupPage />} />
    </Route>
    <Route element={<AppLayout />}>
      <Route path={ROUTES.dashboard} element={<DashboardPage />} />
      <Route path={ROUTES.workspaces} element={<WorkspacePage />} />
      <Route path={ROUTES.workspace} element={<WorkspacePage />} />
      <Route path={ROUTES.workspaceMembers} element={<MembersPage />} />
      <Route path={ROUTES.workspaceSettings} element={<SettingsPage />} />
      <Route path={ROUTES.workspaceActivity} element={<ActivityPage />} />
      <Route path={ROUTES.projects} element={<ProjectsPage />} />
      <Route path={ROUTES.workspaceProjects} element={<ProjectsPage />} />
      <Route path={ROUTES.project} element={<ProjectPage />}>
        <Route index element={<Navigate to="board" replace />} />
        <Route path="board" element={<EmptyState title="Project board" description="The Kanban board is coming soon." />} />
        <Route path="list" element={<EmptyState title="Project list" description="The task list is coming soon." />} />
        <Route path="calendar" element={<EmptyState title="Project calendar" description="The task calendar is coming soon." />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path={ROUTES.task} element={<EmptyState title="Task details" description="Task details, subtasks, and comments are coming soon." />} />
      <Route path={ROUTES.myTasks} element={<MyTasksPage />} />
      <Route path={ROUTES.members} element={<MembersPage />} />
      <Route path={ROUTES.activity} element={<ActivityPage />} />
      <Route path={ROUTES.search} element={<SearchPage />} />
      <Route path={ROUTES.notifications} element={<EmptyState title="Notifications" />} />
      <Route path={ROUTES.profile} element={<EmptyState title="Your profile" />} />
      <Route path={ROUTES.settings} element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
}
