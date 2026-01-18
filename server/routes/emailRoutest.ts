import express, { Request, Response, Router } from 'express'
import nodemailer from 'nodemailer'

const router: Router = express.Router()

// Interface สำหรับ Email Request
interface SalaryEmailRequest {
    to: string
    subject?: string
    employeeName?: string
    month?: string
    year?: number
    baseSalary?: number
    totalIncome?: number
    totalDeductions?: number
    netSalary?: number
    image?: string
    fileName?: string   
}

// Interface สำหรับ Email Response
interface EmailResponse {
    success: boolean
    message: string
    error?: string
}

// เพิ่ม middleware สำหรับเพิ่มขนาด limit
router.use(express.json({ limit: '10mb' }))
router.use(express.urlencoded({ limit: '10mb', extended: true }))

// POST /api/salary/send-email
router.post('/send-email', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            to,
            subject,
            employeeName,
            month,
            year,
            baseSalary,
            totalIncome,
            totalDeductions,
            netSalary,
            image,
            fileName
        }: SalaryEmailRequest = req.body

        console.log('📧 Received email request for:', to)

        // Validate
        if (!to) {
            const response: EmailResponse = {
                success: false,
                message: 'Recipient email is required'
            }
            res.status(400).json(response)
            return
        }

        // Check environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email credentials not configured')
            const response: EmailResponse = {
                success: false,
                message: 'Email service not configured'
            }
            res.status(500).json(response)
            return
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })

        // Verify transporter
        await transporter.verify()
        console.log('✅ Email transporter verified')

        // Prepare email
        const mailOptions = {
            from: `"HR Department" <${process.env.EMAIL_USER}>`,
            to,
            subject: subject || `Salary Summary - ${month} ${year}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1F3A5F;">Salary Summary - ${month} ${year}</h2>
                    <p>Dear ${employeeName || 'Employee'},</p>
                    <p>Your salary summary is attached.</p>
                    ${netSalary ? `<p><strong>Net Salary: $${netSalary.toLocaleString()}</strong></p>` : ''}
                    <p>Best regards,<br>HR Department</p>
                </div>
            `,
            attachments: image ? [{
                filename: fileName || `salary-summary-${month}-${year}.jpg`,
                content: image,
                encoding: 'base64' as const,
                contentType: 'image/jpeg'
            }] : []
        }

        // Send email
        const info = await transporter.sendMail(mailOptions)

        console.log(`✅ Email sent successfully to ${to}`)
        console.log(`📨 Message ID: ${info.messageId}`)

        const response: EmailResponse = {
            success: true,
            message: 'Email sent successfully'
        }
        res.json(response)

    } catch (error: any) {
        console.error('Email error:', error)
        
        const response: EmailResponse = {
            success: false,
            message: error.message || 'Failed to send email',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
        res.status(500).json(response)
    }
})

// GET /api/salary/health - สำหรับตรวจสอบว่า API ทำงานปกติ
router.get('/health', (req: Request, res: Response): void => {
    const response = {
        success: true,
        message: 'Email API is running',
        timestamp: new Date().toISOString(),
        environment: {
            EMAIL_USER: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
            NODE_ENV: process.env.NODE_ENV || 'development'
        }
    }
    res.json(response)
})

export default router