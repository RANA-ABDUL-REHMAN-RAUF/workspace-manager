export const day = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function seedData() {
  const users = [
    { id: 'demo-user', name: 'Alex Morgan', email: 'alex@workspace.com', avatar: '', role: 'admin' },
    { id: 'maya', name: 'Maya Chen', email: 'maya@workspace.com', avatar: '', role: 'member' },
    { id: 'james', name: 'James Wilson', email: 'james@workspace.com', avatar: '', role: 'member' },
    { id: 'sara', name: 'Sara Ahmed', email: 'sara@workspace.com', avatar: '', role: 'viewer' },
  ]
  const workspaces = [{ id: 'acme', name: 'Acme Corp', icon: 'AC', color: '#7266df', defaultView: 'board', members: [{ userId: 'demo-user', role: 'owner' }, { userId: 'maya', role: 'admin' }, { userId: 'james', role: 'member' }, { userId: 'sara', role: 'viewer' }] }]
  const projects = [
    { id: 'website', name: 'Website Redesign', description: 'Crafting a fresh, intuitive experience for our customers.', color: '#7c6ee6', icon: 'W' },
    { id: 'mobile', name: 'Customer Engagement', description: 'Build stronger relationships through thoughtful product experiences.', color: '#4e9fe9', icon: 'C' },
    { id: 'brand', name: 'Brand Refresh', description: 'A new visual identity that reflects who we are.', color: '#d99b4a', icon: 'B' },
  ].map((p) => ({ ...p, workspaceId: 'acme', members: users.map(u => u.id), columns: ['To do', 'In progress', 'In review', 'Done'], archived: false, view: 'board' }))
  const titles = ['Design dashboard wireframes', 'Update landing page content', 'Review onboarding flow', 'Build reusable UI components', 'Prepare brand guidelines', 'Write product release notes', 'Audit accessibility', 'Create customer survey', 'Explore new color palette', 'Plan usability sessions', 'Ship navigation improvements', 'Document design tokens']
  const tasks = titles.map((title, i) => ({ id: `task-${i + 1}`, title, projectId: projects[i % 3].id, description: 'Collaborate with the team to deliver a clear and thoughtful experience.', status: ['In progress', 'To do', 'In review', 'Done'][i % 4], priority: ['High', 'Medium', 'Low'][i % 3], dueDate: day(i - 3), assignee: users[i % 4].id, labels: [i % 2 ? 'Product' : 'Design'], parentId: null, attachments: [], createdAt: new Date().toISOString() }))
  return { users, workspaces, projects, tasks, comments: [], activities: [{ id: 'initial', workspaceId: 'acme', projectId: 'website', taskId: 'task-1', userId: 'maya', action: 'created', text: 'Created the workspace and project plan', at: new Date().toISOString() }], notifications: [], presets: [] }
}
