import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { to, subject, employeeName, month, year, netSalary, image, fileName } = body

        // Validate
        if (!to || !image) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
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
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Salary Summary - ${month} ${year}</h2>
                    <p>Dear ${employeeName},</p>
                    <p>Your salary summary is attached.</p>
                    <p><strong>Net Salary: $${netSalary.toLocaleString()}</strong></p>
                </div>
            `,
            attachments: [{
                filename: fileName,
                content: image,
                encoding: 'base64'
            }]
        })

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully'
        })

    } catch (error: any) {
        console.error('Email error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to send email' },
            { status: 500 }
        )
    }
}