import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
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
        } = body

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // หรือใช้บริการอื่นเช่น SendGrid, AWS SES
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #1F3A5F; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
                        .salary-item { margin-bottom: 10px; }
                        .salary-value { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Salary Summary - ${month} ${year}</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${employeeName},</p>
                            <p>Your salary summary for ${month} ${year} is attached to this email.</p>
                            
                            <h3>Salary Overview:</h3>
                            <div class="salary-item">
                                <span>Base Salary:</span>
                                <span class="salary-value">$${baseSalary.toLocaleString()}</span>
                            </div>
                            <div class="salary-item">
                                <span>Total Income:</span>
                                <span class="salary-value">$${totalIncome.toLocaleString()}</span>
                            </div>
                            <div class="salary-item">
                                <span>Total Deductions:</span>
                                <span class="salary-value">$${totalDeductions.toLocaleString()}</span>
                            </div>
                            <div class="salary-item">
                                <span>Net Salary:</span>
                                <span class="salary-value" style="color: #1F3A5F;">$${netSalary.toLocaleString()}</span>
                            </div>
                            
                            <p style="margin-top: 20px;">Please find the detailed salary summary attached as a PNG file.</p>
                            <p>If you have any questions, please contact the HR department.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>© ${new Date().getFullYear()} Your Company Name</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [
                {
                    filename: fileName,
                    content: image,
                    encoding: 'base64'
                }
            ]
        }

        // Send email
        await transporter.sendMail(mailOptions)

        return NextResponse.json(
            { success: true, message: 'Email sent successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Email sending error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to send email' },
            { status: 500 }
        )
    }
}