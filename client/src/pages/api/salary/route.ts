import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        console.log('📧 Received email request')
        
        const { 
            to, 
            subject, 
            employeeName, 
            month, 
            year, 
            netSalary,
            image,
            fileName
        } = body

        // Validate
        if (!to) {
            return NextResponse.json(
                { success: false, message: 'Recipient email is required' },
                { status: 400 }
            )
        }

        console.log(`Sending email to: ${to}`)

        // ตรวจสอบ environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('❌ Email credentials not configured')
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Email service not configured' 
                },
                { status: 500 }
            )
        }

        // Setup transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })

        // Send email
        await transporter.sendMail({
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
                filename: fileName || 'salary-summary.jpg',
                content: image,
                encoding: 'base64'
            }] : []
        })

        console.log(`✅ Email sent successfully to ${to}`)

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully'
        })

    } catch (error: any) {
        console.error('❌ Email sending error:', error)
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to send email',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}