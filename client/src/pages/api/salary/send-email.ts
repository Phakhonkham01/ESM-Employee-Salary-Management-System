// src/pages/api/salary/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

// ตั้งค่าขนาด payload
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // เพิ่มขนาด limit
        },
        responseLimit: '10mb',
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // ตั้งค่า CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // รับเฉพาะ POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed. Only POST is supported.' 
        })
    }

    try {
        console.log('📧 Salary Email API Called')
        console.log('Request body size:', req.headers['content-length'], 'bytes')

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
            workingDays,
            remainingVacationDays,
            otHours,
            image,
            fileName,
            fileSizeMB
        } = req.body

        // Validate required fields
        if (!to) {
            console.error('Validation failed: No recipient email')
            return res.status(400).json({
                success: false,
                message: 'Recipient email (to) is required'
            })
        }

        console.log(`Preparing to send email to: ${to}`)

        // ตรวจสอบ environment variables
        if (!process.env.EMAIL_USER) {
            console.error('❌ EMAIL_USER is not set in environment variables')
            return res.status(500).json({
                success: false,
                message: 'Email service configuration error: EMAIL_USER is missing',
                help: 'Please set EMAIL_USER in .env.local file'
            })
        }

        if (!process.env.EMAIL_PASSWORD) {
            console.error('❌ EMAIL_PASSWORD is not set in environment variables')
            return res.status(500).json({
                success: false,
                message: 'Email service configuration error: EMAIL_PASSWORD is missing',
                help: 'Please set EMAIL_PASSWORD in .env.local file'
            })
        }

        console.log('✅ Email credentials found in environment')

        // Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            // เพิ่ม options สำหรับ reliability
            pool: true,
            maxConnections: 1,
            maxMessages: 10,
        })

        // Verify transporter configuration
        try {
            await transporter.verify()
            console.log('✅ Email transporter verified successfully')
        } catch (verifyError) {
            console.error('❌ Email transporter verification failed:', verifyError)
            return res.status(500).json({
                success: false,
                message: 'Email service authentication failed',
                error: process.env.NODE_ENV === 'development' ? (verifyError as Error).message : undefined
            })
        }

        // Calculate image size if provided
        let imageInfo = ''
        if (image) {
            const sizeKB = Math.round((image.length * 3) / 4) / 1024
            imageInfo = ` (Image: ${sizeKB.toFixed(2)}KB)`
        }

        // สร้าง email content
        const emailContent = {
            from: `"HR Department" <${process.env.EMAIL_USER}>`,
            to,
            subject: subject || `Salary Summary - ${month} ${year}`,
            html: buildEmailTemplate({
                employeeName: employeeName || 'Employee',
                month,
                year,
                baseSalary,
                totalIncome,
                totalDeductions,
                netSalary,
                workingDays,
                remainingVacationDays,
                otHours
            }),
            attachments: image ? [
                {
                    filename: fileName || `salary-summary-${month}-${year}.jpg`,
                    content: image,
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                }
            ] : []
        }

        console.log(`Sending email to ${to}${imageInfo}`)

        // Send email with timeout
        const sendPromise = transporter.sendMail(emailContent)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000)
        })

        const result = await Promise.race([sendPromise, timeoutPromise]) as nodemailer.SentMessageInfo

        console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`)

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            data: {
                to,
                subject: emailContent.subject,
                messageId: result.messageId,
                timestamp: new Date().toISOString()
            }
        })

    } catch (error: any) {
        console.error('❌ Email sending failed:', error)
        
        let errorMessage = 'Failed to send email'
        let errorDetails = process.env.NODE_ENV === 'development' ? error.message : undefined
        
        // แยก error message ตามประเภท
        if (error.message.includes('timeout')) {
            errorMessage = 'Email sending timeout. Please try again.'
        } else if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
            errorMessage = 'Email authentication failed. Please check email credentials.'
        } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'Network connection error. Please check your internet connection.'
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Email service connection refused. Please try again later.'
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            help: 'Check your email credentials in .env.local file'
        })
    }
}

// Helper function to build email template
function buildEmailTemplate(data: {
    employeeName: string
    month: string
    year: number
    baseSalary?: number
    totalIncome?: number
    totalDeductions?: number
    netSalary?: number
    workingDays?: number
    remainingVacationDays?: number
    otHours?: number
}): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Salary Summary</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }
                .header {
                    background-color: #1F3A5F;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 10px 0 0 0;
                    opacity: 0.9;
                }
                .content {
                    padding: 30px;
                }
                .greeting {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .summary-box {
                    background-color: #f8f9fa;
                    border-left: 4px solid #1F3A5F;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 4px 4px 0;
                }
                .salary-details {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .salary-details td {
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .salary-details .label {
                    color: #666;
                }
                .salary-details .value {
                    text-align: right;
                    font-weight: 600;
                }
                .net-salary {
                    background-color: #1F3A5F;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 4px;
                    margin: 30px 0;
                }
                .net-salary .amount {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #eee;
                    margin-top: 30px;
                }
                .note {
                    font-style: italic;
                    color: #666;
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Salary Summary</h1>
                    <p>${data.month} ${data.year}</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${data.employeeName}</strong>,</p>
                        <p>Your salary summary for <strong>${data.month} ${data.year}</strong> is attached to this email.</p>
                    </div>
                    
                    <div class="summary-box">
                        <h3 style="margin-top: 0; color: #1F3A5F;">Salary Overview</h3>
                        
                        <table class="salary-details">
                            ${data.baseSalary ? `
                            <tr>
                                <td class="label">Base Salary</td>
                                <td class="value">$${data.baseSalary.toLocaleString()}</td>
                            </tr>
                            ` : ''}
                            
                            ${data.totalIncome ? `
                            <tr>
                                <td class="label">Total Income</td>
                                <td class="value">$${data.totalIncome.toLocaleString()}</td>
                            </tr>
                            ` : ''}
                            
                            ${data.totalDeductions ? `
                            <tr>
                                <td class="label">Total Deductions</td>
                                <td class="value">$${data.totalDeductions.toLocaleString()}</td>
                            </tr>
                            ` : ''}
                            
                            ${data.workingDays ? `
                            <tr>
                                <td class="label">Working Days</td>
                                <td class="value">${data.workingDays} days</td>
                            </tr>
                            ` : ''}
                            
                            ${data.otHours ? `
                            <tr>
                                <td class="label">Overtime Hours</td>
                                <td class="value">${data.otHours} hours</td>
                            </tr>
                            ` : ''}
                            
                            ${data.remainingVacationDays ? `
                            <tr>
                                <td class="label">Vacation Days Remaining</td>
                                <td class="value">${data.remainingVacationDays} days</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    
                    ${data.netSalary ? `
                    <div class="net-salary">
                        <h3 style="margin: 0; font-size: 18px;">NET SALARY</h3>
                        <div class="amount">$${data.netSalary.toLocaleString()}</div>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment for ${data.month} ${data.year}</p>
                    </div>
                    ` : ''}
                    
                    <div class="note">
                        <p>Please find the detailed salary summary attached as a PDF/image file.</p>
                        <p>If you have any questions regarding your salary, please contact the HR department.</p>
                    </div>
                    
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>HR Department</strong>
                    </p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
}