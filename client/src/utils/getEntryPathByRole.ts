// utils/getEntryPathByRole.ts
export const getEntryPathByRole = (role?: string) => {
    switch (role) {
        case 'Employee':
            return '/user-profile'
        case 'Admin':
        case 'Supervisor':
            return '/home'
        default:
            return '/sign-in'
    }
}
export default getEntryPathByRole