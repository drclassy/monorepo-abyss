export const metadata = {
  title: 'Dashboard | Claudesy Memory Engine',
  description: 'Claudesy Memory Engine dashboard for memory, health, daemon, and recall operations.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  )
}
