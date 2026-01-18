import { useRef, useImperativeHandle } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignOut, apiSignUp } from '@/services/AuthService'
<<<<<<< HEAD
import { loginUser } from '@/services/auth/Login' // เพิ่มบรรทัดนี้
=======
import { loginUser } from '@/services/auth/Login'
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()

    const authenticated = Boolean(token && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, user?: User, fullDbUser?: any) => {
        setToken(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }

        // ✅ Save full DB user data to 'auth' localStorage
        if (fullDbUser) {
            const authData = JSON.parse(localStorage.getItem('auth') || '{}')
            localStorage.setItem(
                'auth',
                JSON.stringify({
                    ...authData,
                    state: {
                        ...authData.state,
                        user: fullDbUser, // Full DB user object
                    },
                    token: tokens.accessToken,
                })
            )
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({})
        setSessionSignedIn(false)
<<<<<<< HEAD

        // ✅ CLEAR STORAGE
=======
        
        // ✅ Clear the auth localStorage
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
        localStorage.removeItem('auth')
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await loginUser(values)

            if (resp && resp.user) {
                // Map user data for Zustand state (UI display)
                const userData: User = {
                    email: resp.user.email,
<<<<<<< HEAD
                    userName: `${resp.user} ${resp.user}`,
=======
                    userName: `${resp.user.first_name_en} ${resp.user.last_name_en}`,
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                    authority: [resp.user.role], // ['Admin'], ['Supervisor'], ['Employee']
                    avatar: '', // Add avatar from database if available
                }

                // Create token (or use real token from backend if available)
                const token = 'mock-token-' + resp.user._id

<<<<<<< HEAD
                // ✅ SAVE LOGIN DATA
                localStorage.setItem(
                    'auth',
                    JSON.stringify({
                        token,
                        user: resp.user, // full DB user (id, role, etc.)
                    }),
                )
                handleSignIn({ accessToken: token }, userData)
=======
                // ✅ Pass full DB user object to be saved in localStorage
                handleSignIn({ accessToken: token }, userData, resp.user)
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp) {
                handleSignIn({ accessToken: resp.token }, resp.user)
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider