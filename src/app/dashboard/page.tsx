import AuthGuard from '../../../components/AuthGuard'

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Welcome to SHIFT! You have successfully logged in.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 