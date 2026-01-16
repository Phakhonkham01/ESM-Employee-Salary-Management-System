import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        })
    }

    try {
        const { to, subject, employeeName, month, year, netSalary, image, fileName } = req.body

        // Validate
        if (!to || !image) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        // Check environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email credentials not configured')
        }

        // Create transporter
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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1F3A5F; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                        <h1 style="margin: 0;">Salary Summary - ${month} ${year}</h1>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-top: none;">
                        <p>Dear <strong>${employeeName}</strong>,</p>
                        <p>Your salary summary for <strong>${month} ${year}</strong> is attached to this email.</p>
                        
                        <div style="background-color: #e8f4fd; border-left: 4px solid #1F3A5F; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold;">Net Salary:</p>
                            <p style="margin: 5px 0; font-size: 24px; color: #1F3A5F;">
                                $${netSalary.toLocaleString()}
                            </p>
                        </div>
                        
                        <p>Please review the attached document for complete details.</p>
                        <p>If you have any questions, please contact HR.</p>
                    </div>
                </div>
            `,
            attachments: [{
                filename: fileName,
                content: image,
                encoding: 'base64'
            }]
        })

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        })

    } catch (error: any) {
        console.error('Email error:', error)
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email'
        })
    }
}