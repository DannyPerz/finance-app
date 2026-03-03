import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/work/payrolls')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/work/payrolls"!</div>
}
