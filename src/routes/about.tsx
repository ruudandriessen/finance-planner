import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div>
      <h1>About</h1>
      <p>This is a simple finance planner built with TanStack Router, Vite, and TypeScript.</p>
    </div>
  )
}