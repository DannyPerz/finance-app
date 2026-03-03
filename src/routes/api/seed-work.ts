import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/seed-work')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/seed-work"!</div>
}
