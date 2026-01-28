import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { getEntryPathByRole } from '@/utils/getEntryPathByRole'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props

    const roleMatched = useAuthority(userAuthority, authority)

    if (roleMatched) {
        return <>{children}</>
    }

    // 👇 assume first role is primary role
    const role = userAuthority[0]

    return (
        <Navigate
            replace
            to={getEntryPathByRole(role)}
        />
    )
}

export default AuthorityGuard
