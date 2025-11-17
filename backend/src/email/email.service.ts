import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configure email transporter
    // For production, use environment variables for SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });
  }

  async sendProjectAssignmentEmail(
    email: string,
    projectName: string,
    deadline: string,
    budget: number,
  ) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@superbudget.com',
      to: email,
      subject: `You've been assigned to a new project: ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Project Assignment Notification</h2>
          <p>Hello,</p>
          <p>You have been assigned to a new project:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project Name:</strong> ${projectName}</p>
            <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
            <p><strong>Budget:</strong> $${budget.toLocaleString()}</p>
          </div>
          <p>Please log in to the dashboard to view more details and start working on this project.</p>
          <p>Best regards,<br>Super Budget Team</p>
        </div>
      `,
    };

    try {
      // Only send email if SMTP is configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email} for project ${projectName}`);
      } else {
        console.log(`Email would be sent to ${email} for project ${projectName} (SMTP not configured)`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw error - email failure shouldn't break project creation
    }
  }
}

