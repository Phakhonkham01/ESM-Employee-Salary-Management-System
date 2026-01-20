import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserById, UserData } from '@/services/User_Page/user_api'
import { useFullUser } from '@/components/template/useFullUser'
import UserProfile from './UserProfile'

const MainComponent = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  
  // ✅ Use the hook to get user ID
  const { userId } = useFullUser()

  useEffect(() => {
    // ✅ If no user ID, don't navigate - just show error
    if (!userId) {
      setLoading(false)
      setError(true)
      return
    }

    // ✅ Fetch user data
    getUserById(userId)
      .then(res => {
        setUser(res.user)
        setError(false)
      })
      .catch((err) => {
        console.error('Error fetching user:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [userId]) // ✅ Only depend on userId

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    )
  }

  // Error state - user not logged in
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Unable to Load Profile
          </h2>
          <p className="text-gray-600 mb-6">
            {!userId 
              ? "You are not logged in. Please log in to view your profile."
              : "Failed to load user data. Please try again."}
          </p>
          <button
            onClick={() => navigate('/sign-in')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="p-8 max-w-5xl min-h-screen bg-gray-100">
      <UserProfile user={user} />
    </div>
  )
}

export default MainComponent