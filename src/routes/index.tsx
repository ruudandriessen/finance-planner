import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div>
      <h1>Finance Planner</h1>
      <p>Welcome to your personal finance planning application!</p>
    </div>
  )
}