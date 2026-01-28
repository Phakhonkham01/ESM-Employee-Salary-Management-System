import { useState, useCallback } from 'react'
import { sendSalaryEmail } from './sendSalaryEmail'

interface UseSendSalaryEmailReturn {
    sendEmail: (data: any) => Promise<void>
    isLoading: boolean
    isSuccess: boolean
    error: string | null
    reset: () => void
}

export function useSendSalaryEmail(): UseSendSalaryEmailReturn {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sendEmail = useCallback(async (data: any) => {
        setIsLoading(true)
        setError(null)
        setIsSuccess(false)

        try {
            const result = await sendSalaryEmail(data)
            
            if (result.success) {
                setIsSuccess(true)
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setIsLoading(false)
        setIsSuccess(false)
        setError(null)
    }, [])

    return {
        sendEmail,
        isLoading,
        isSuccess,
        error,
        reset
    }
}