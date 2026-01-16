interface SalaryEmailData {
    to: string
    employeeName: string
    month: string
    year: number
    baseSalary: number
    netSalary: number
    image: string // base64
    fileName: string
}

export async function sendSalaryEmail(data: SalaryEmailData): Promise<{
    success: boolean
    message: string
}> {
    try {
        const response = await fetch('/api/salary/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: data.to,
                subject: `Salary Summary - ${data.month} ${data.year}`,
                employeeName: data.employeeName,
                month: data.month,
                year: data.year,
                baseSalary: data.baseSalary,
                netSalary: data.netSalary,
                image: data.image,
                fileName: data.fileName
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to send email:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}