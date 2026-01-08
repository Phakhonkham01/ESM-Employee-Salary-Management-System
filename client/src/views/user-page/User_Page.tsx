import { useEffect, useState } from 'react'
import { getUserById, UserData } from '@/services/User_Page/api'
import { useNavigate } from 'react-router-dom'

const User = () => {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem('auth') || 'null')
        const loggedUser = auth?.user

        if (!loggedUser?._id) {
            navigate('/login')
            return
        }

        getUserById(loggedUser._id)
            .then((res) => setUser(res.user))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false))
    }, [navigate])

    if (loading) {
        return (
            <div className="p-8 text-gray-500 text-sm">
                Loading user data...
            </div>
        )
    }

    if (!user) {
        return <div className="p-8 text-red-500 text-sm">No user data</div>
    }

    return (
        <div className="p-8">
            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    User Profile
                </h1>
                <p className="text-sm text-gray-500">Personal information</p>
            </div>

            {/* Profile layout */}
            <div className="max-w-4xl">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        <ProfileField label="Email" value={user.email} />
                        <ProfileField label="Role" value={user.role} />

                        <ProfileField
                            label="Name (EN)"
                            value={`${user.first_name_en} ${user.last_name_en}`}
                        />

                        <ProfileField
                            label="Nickname"
                            value={user.nickname_en}
                        />

                        {/* 🔥 NEW FIELDS */}
                        <ProfileField
                            label="Department"
                            value={user.department_id?.department_name}
                        />

                        <ProfileField
                            label="Position"
                            value={user.position_id?.position_name}
                        />
                        <ProfileField
                            label="Base Salary"
                            value={
                                user.base_salary !== undefined
                                    ? `${user.base_salary.toLocaleString()}`
                                    : undefined
                            }
                        />
                        <ProfileField label="Status" value={user.status} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProfileField = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            {label}
        </div>
        <div className="text-sm font-medium text-gray-900">{value || '-'}</div>
    </div>
)

export default User
