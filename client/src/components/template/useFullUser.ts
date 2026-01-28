// src/hooks/useFullUser.ts
// Helper hook to get full database user object from localStorage

export interface FullDbUser {
    _id: string
    email: string
    role: 'Admin' | 'Supervisor' | 'Employee'
    userName: string
    first_name_en: string
    last_name_en: string
    first_name_la: string
    last_name_la: string
    nickname_en: string
    nickname_la: string
    gender: string
    date_of_birth: string
    department_id: string
    position_id: string
    base_salary: number
    vacation_days: number
    start_work: string
    status: 'Active' | 'Inactive'
    created_at: string
    __v: number
}

export const useFullUser = () => {
    const getFullUser = (): FullDbUser | null => {
        try {
            const authData = localStorage.getItem('auth')
            if (!authData) return null

            const parsed = JSON.parse(authData)
            return parsed?.user || null  // ✅ access .user directly
        } catch (error) {
            console.error('Error getting full user data:', error)
            return null
        }
    }

    const fullUser = getFullUser()

    return {
        fullUser,
        userId: fullUser?._id,
        role: fullUser?.role,
        departmentId: fullUser?.department_id,
        positionId: fullUser?.position_id,
        baseSalary: fullUser?.base_salary,
        vacationDays: fullUser?.vacation_days,
    }
}

export default useFullUser


