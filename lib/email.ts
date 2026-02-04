/**
 * Email Service Utility
 *
 * Centralized email service using Nodemailer for sending transactional emails.
 * Supports environment-based configuration with fallback to console logging
 * for development when email credentials are not configured.
 *
 * Features:
 * - SMTP transport configuration via environment variables
 * - HTML and plain text email support
 * - Error handling and logging
 * - Development mode fallback (console logging)
 * - Support for attachments and CC/BCC
 *
 * Usage:
 * ```typescript
 * import { sendEmail } from '@/lib/email';
 *
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to TrustTrip',
 *   text: 'Welcome to our platform!',
 *   html: '<h1>Welcome to our platform!</h1>'
 * });
 * ```
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

// Email response interface
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  developmentMode?: boolean;
}

/**
 * Get email configuration from environment variables
 */
function getEmailConfig(): EmailConfig | null {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Return null if essential config is missing
  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  };
}

/**
 * Create and configure the email transporter
 */
function createTransporter(): Transporter<SMTPTransport.SentMessageInfo> | null {
  const config = getEmailConfig();

  if (!config) {
    return null;
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      // Additional options for better reliability
      pool: true, // use pooled connections
      maxConnections: 5, // limit concurrent connections
      maxMessages: 100, // limit messages per connection
      rateDelta: 1000, // limit send rate
      rateLimit: 5, // max 5 messages per rateDelta
    });

    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    return null;
  }
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email addresses (single or array)
 */
function validateEmailAddresses(emails: string | string[]): boolean {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  return emailArray.every((email) => isValidEmail(email.trim()));
}

/**
 * Send email using configured transporter
 *
 * @param options - Email options (to, subject, text, html, etc.)
 * @returns Promise<EmailResponse> - Success/failure response with details
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // Validate required fields
    if (!options.to || !options.subject) {
      return {
        success: false,
        error: "Missing required fields: to and subject are required",
      };
    }

    // Validate email addresses
    if (!validateEmailAddresses(options.to)) {
      return {
        success: false,
        error: 'Invalid email address format in "to" field',
      };
    }

    if (options.cc && !validateEmailAddresses(options.cc)) {
      return {
        success: false,
        error: 'Invalid email address format in "cc" field',
      };
    }

    if (options.bcc && !validateEmailAddresses(options.bcc)) {
      return {
        success: false,
        error: 'Invalid email address format in "bcc" field',
      };
    }

    // Ensure either text or html content is provided
    if (!options.text && !options.html) {
      return {
        success: false,
        error: "Either text or html content must be provided",
      };
    }

    // Create transporter
    const transporter = createTransporter();

    // If no transporter (missing config), fallback to development mode
    if (!transporter) {
      const isDevelopment = process.env.NODE_ENV === "development";

      if (isDevelopment) {
        // Development mode: log email to console instead of sending
        console.log("\n=== EMAIL (Development Mode) ===");
        console.log(
          `To: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`
        );
        console.log(
          `From: ${options.from || process.env.EMAIL_FROM || "noreply@trusttrip.com"}`
        );
        console.log(`Subject: ${options.subject}`);

        if (options.cc) {
          console.log(
            `CC: ${Array.isArray(options.cc) ? options.cc.join(", ") : options.cc}`
          );
        }
        if (options.bcc) {
          console.log(
            `BCC: ${Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc}`
          );
        }

        console.log("\n--- Content ---");
        if (options.text) {
          console.log("Text:", options.text);
        }
        if (options.html) {
          console.log("HTML:", options.html);
        }
        console.log("===============================\n");

        return {
          success: true,
          messageId: `dev-${Date.now()}`,
          developmentMode: true,
        };
      } else {
        // Production mode: return error if email is not configured
        return {
          success: false,
          error:
            "Email service not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS environment variables.",
        };
      }
    }

    // Prepare mail options
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || "noreply@trusttrip.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Failed to send email:", {
      error: error instanceof Error ? error.message : "Unknown error",
      to: options.to,
      subject: options.subject,
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while sending email",
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<EmailResponse> {
  return sendEmail({
    to: userEmail,
    subject: "Welcome to TrustTrip!",
    text: `Hi ${userName},\n\nWelcome to TrustTrip! We're excited to have you on board.\n\nTrustTrip is your trusted companion for transparent intercity bus ticket management. You can now:\n\n- Book trips with confidence\n- Track your bookings\n- Manage refunds transparently\n- Leave reviews for your experiences\n\nGet started by exploring our platform and planning your next adventure!\n\nBest regards,\nThe TrustTrip Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Welcome to TrustTrip!</h1>
        
        <p>Hi <strong>${userName}</strong>,</p>
        
        <p>Welcome to TrustTrip! We're excited to have you on board.</p>
        
        <p>TrustTrip is your trusted companion for transparent intercity bus ticket management. You can now:</p>
        
        <ul style="line-height: 1.6;">
          <li>📅 Book trips with confidence</li>
          <li>📍 Track your bookings</li>
          <li>💰 Manage refunds transparently</li>
          <li>⭐ Leave reviews for your experiences</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
        
        <p>Get started by exploring our platform and planning your next adventure!</p>
        
        <p>Best regards,<br>
        <strong>The TrustTrip Team</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  userEmail: string,
  userName: string,
  bookingDetails: {
    id: string;
    projectTitle: string;
    destination: string;
    quantity: number;
    totalPrice: number;
    bookingDate: Date;
  }
): Promise<EmailResponse> {
  const { id, projectTitle, destination, quantity, totalPrice, bookingDate } =
    bookingDetails;

  return sendEmail({
    to: userEmail,
    subject: `Booking Confirmation - ${projectTitle}`,
    text: `Hi ${userName},\n\nYour booking has been confirmed!\n\nBooking Details:\n- Booking ID: ${id}\n- Trip: ${projectTitle}\n- Destination: ${destination}\n- Quantity: ${quantity} ticket(s)\n- Total: $${totalPrice}\n- Booking Date: ${bookingDate.toLocaleDateString()}\n\nYou will receive further updates about your trip. Have a great journey!\n\nBest regards,\nThe TrustTrip Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669; text-align: center;">Booking Confirmed! ✅</h1>
        
        <p>Hi <strong>${userName}</strong>,</p>
        
        <p>Your booking has been confirmed! Here are your trip details:</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${id}</p>
          <p><strong>Trip:</strong> ${projectTitle}</p>
          <p><strong>Destination:</strong> ${destination}</p>
          <p><strong>Quantity:</strong> ${quantity} ticket(s)</p>
          <p><strong>Total Amount:</strong> $${totalPrice}</p>
          <p><strong>Booking Date:</strong> ${bookingDate.toLocaleDateString()}</p>
        </div>
        
        <p>You will receive further updates about your trip. Have a great journey!</p>
        
        <p>Best regards,<br>
        <strong>The TrustTrip Team</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<EmailResponse> {
  return sendEmail({
    to: process.env.EMAIL_USER || "test@example.com",
    subject: "TrustTrip Email Test",
    text: "This is a test email from TrustTrip to verify email configuration.",
    html: "<p>This is a <strong>test email</strong> from TrustTrip to verify email configuration.</p>",
  });
}
