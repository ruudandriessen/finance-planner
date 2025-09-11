import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
            Home
          </Link>
          <Link to="/about" style={{ textDecoration: 'none', color: '#007bff' }}>
            About
          </Link>
        </nav>
      </div>
      <div style={{ padding: '1rem' }}>
        <Outlet />
      </div>
    </>
  ),
})