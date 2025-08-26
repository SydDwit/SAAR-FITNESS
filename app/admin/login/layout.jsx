export const metadata = {
  title: 'Admin Login | SAAR FITNESS',
  description: 'Administrative access for SAAR FITNESS management system',
}

export default function AdminLoginLayout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  )
}
