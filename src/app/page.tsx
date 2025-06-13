import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">SHIFT</h1>
        <p className="text-gray-600 mb-8">
          Manage your work shifts and export to your calendar
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/auth/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          
          <Link 
            href="/auth/signup"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>✓ Track day and night shifts</p>
          <p>✓ Export to calendar apps</p>
          <p>✓ Secure and private</p>
        </div>
      </div>
    </div>
  )
}
