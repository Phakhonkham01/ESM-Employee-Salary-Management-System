// services/pdf-service.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { SalaryFormData, PrefillData } from '../interfaces';

interface PDFOptions {
  user: any;
  month: number;
  year: number;
  prefillData: PrefillData;
  formData: SalaryFormData;
  manualOTDetails: any[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
}

// Add declaration for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generatePayslipPDF = async (options: PDFOptions): Promise<Blob> => {
  const {
    user,
    month,
    year,
    prefillData,
    formData,
    manualOTDetails,
    totalIncome,
    totalDeductions,
    netSalary
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Add Company Logo and Header
  doc.setFillColor(31, 58, 95);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('PAYSLIP', pageWidth / 2, 30, { align: 'center' });
  
  // Company Info
  doc.setFontSize(10);
  doc.text('XYZ Company Ltd.', pageWidth / 2, 42, { align: 'center' });
  doc.text('123 Business Street, City, Country', pageWidth / 2, 47, { align: 'center' });

  // Employee Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Employee: ${user.first_name_en} ${user.last_name_en}`, margin, 70);
  doc.text(`Email: ${user.email}`, margin, 80);
  doc.text(`Period: ${getMonthName(month)} ${year}`, margin, 90);
  doc.text(`Employee ID: ${user.employee_id || 'N/A'}`, margin, 100);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 100, { align: 'right' });

  // Income Table
  doc.setFontSize(14);
  doc.setTextColor(31, 58, 95);
  doc.text('INCOME DETAILS', margin, 120);
  
  const manualOTTotal = manualOTDetails.reduce((sum, d) => sum + d.amount, 0);
  const totalOT = prefillData.calculated.ot_amount + manualOTTotal;
  
  const incomeData = [
    ['Base Salary', `$${prefillData.user.base_salary.toLocaleString()}`],
    ['OT Amount (System)', `$${prefillData.calculated.ot_amount.toLocaleString()}`],
    ['OT Amount (Manual)', `$${manualOTTotal.toLocaleString()}`],
    ['Fuel Costs', `$${prefillData.calculated.fuel_costs.toLocaleString()}`],
    ['Bonus', `$${formData.bonus.toLocaleString()}`],
    ['Commission', `$${formData.commission.toLocaleString()}`],
    ['Holiday Allowance', `$${formData.money_not_spent_on_holidays.toLocaleString()}`],
    ['Other Income', `$${formData.other_income.toLocaleString()}`],
  ];

  (doc as any).autoTable({
    startY: 125,
    head: [['Description', 'Amount']],
    body: incomeData,
    theme: 'striped',
    headStyles: { fillColor: [31, 58, 95], textColor: [255, 255, 255] },
    margin: { left: margin, right: margin },
  });

  // Deductions Table
  let finalY = (doc as any).lastAutoTable.finalY || 160;
  doc.setFontSize(14);
  doc.setTextColor(220, 53, 69);
  doc.text('DEDUCTIONS', margin, finalY + 10);
  
  const deductionsData = [
    ['Office Expenses', `$${formData.office_expenses.toLocaleString()}`],
    ['Social Security', `$${formData.social_security.toLocaleString()}`],
  ];

  (doc as any).autoTable({
    startY: finalY + 15,
    head: [['Description', 'Amount']],
    body: deductionsData,
    theme: 'striped',
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
    margin: { left: margin, right: margin },
  });

  // Summary Section
  finalY = (doc as any).lastAutoTable.finalY || 200;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('SUMMARY', margin, finalY + 15);

  const summaryData = [
    ['Total Income', `$${totalIncome.toLocaleString()}`],
    ['Total Deductions', `$${totalDeductions.toLocaleString()}`],
  ];

  (doc as any).autoTable({
    startY: finalY + 20,
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 12, fontStyle: 'bold' },
    margin: { left: margin, right: margin },
  });

  // Net Salary
  finalY = (doc as any).lastAutoTable.finalY || 240;
  doc.setFillColor(31, 58, 95);
  doc.rect(margin, finalY + 10, pageWidth - 2 * margin, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('NET SALARY', margin + 10, finalY + 25);
  doc.setFontSize(24);
  doc.text(`$${netSalary.toLocaleString()}`, pageWidth - margin - 10, finalY + 25, { align: 'right' });

  // Additional Information
  finalY += 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('Additional Information:', margin, finalY);
  
  const totalOTHours = prefillData.calculated.ot_hours + 
    manualOTDetails.filter(d => d.ot_type === 'weekday').reduce((sum, d) => sum + (d.total_hours || 0), 0);
  
  const totalOTDays = manualOTDetails.filter(d => d.ot_type === 'weekend')
    .reduce((sum, d) => sum + (d.days || 0), 0);

  const infoLines = [
    `Working Days: ${formData.working_days}`,
    `Day Off Days: ${prefillData.calculated.day_off_days}`,
    `Vacation Days Left: ${prefillData.calculated.remaining_vacation_days}`,
    `Total OT Hours: ${totalOTHours}`,
    `Total OT Days: ${totalOTDays}`,
  ];

  infoLines.forEach((line, index) => {
    doc.text(`• ${line}`, margin + 10, finalY + 15 + (index * 10));
  });

  if (formData.notes) {
    finalY += 60;
    doc.text('Notes:', margin, finalY);
    const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - 2 * margin - 20);
    doc.text(splitNotes, margin + 10, finalY + 10);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This is an official payslip document.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('Confidential - For employee use only', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Return PDF as Blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};