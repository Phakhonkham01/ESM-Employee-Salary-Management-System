// email-service.ts
interface EmailPayload {
  to: string
  subject: string
  htmlContent: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

export const sendEmailWithPayslip = async (
  email: string,
  pdfBlob: Blob,
  userName: string,
  month: number,
  year: number,
  netSalary: number
): Promise<boolean> => {
  try {
    // Convert Blob to Base64
    const base64Pdf = await blobToBase64(pdfBlob)
    
    const payload: EmailPayload = {
      to: email,
      subject: `Payslip for ${getMonthName(month)} ${year}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .header { background: #1F3A5F; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                .salary { font-size: 24px; color: #1F3A5F; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Salary Payslip</h1>
            </div>
            <div class="content">
                <p>Dear ${userName},</p>
                <p>Your payslip for <strong>${getMonthName(month)} ${year}</strong> is ready.</p>
                <p>Net Salary: <span class="salary">$${netSalary.toLocaleString()}</span></p>
                <p>Please find your detailed payslip attached as a PDF document.</p>
                <p>If you have any questions regarding your payslip, please contact the HR department.</p>
            </div>
            <div class="footer">
                <p>This is an automatically generated email. Please do not reply.</p>
                <p>Company Name • HR Department</p>
            </div>
        </body>
        </html>
      `,
      attachments: [{
        filename: `payslip-${userName.toLowerCase().replace(/\s+/g, '-')}-${month}-${year}.pdf`,
        content: base64Pdf.split(',')[1], // Remove data URL prefix
        contentType: 'application/pdf'
      }]
    }

    // Call your email API endpoint
    const response = await fetch('/api/email/send-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}