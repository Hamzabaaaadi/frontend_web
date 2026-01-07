import React, { useState, useEffect } from 'react'
import AuditeurLayout from './AuditeurLayout'
import Dashboard from './Dashboard'
import Tasks from './Tasks'
import Profile from './Profile'

export default function AuditeurRoutes() {
  const [hash, setHash] = useState(window.location.hash || '#dashboard')

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#dashboard')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  let content = <Dashboard />
  if (hash === '#tasks') content = <Tasks />
  if (hash === '#profile') content = <Profile />

  return <AuditeurLayout>{content}</AuditeurLayout>
}
