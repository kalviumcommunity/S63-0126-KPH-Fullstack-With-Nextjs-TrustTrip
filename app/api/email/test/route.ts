import { NextRequest, NextResponse } from "next/server";
import { sendEmail, testEmailConfiguration } from "@/lib/email";

/**
 * GET /api/email/test
 * Test email configuration by sending a test email
 *
 * This endpoint helps verify that the email service is properly configured
 * and can successfully send emails.
 */
export async function GET() {
  try {
    console.log("Testing email configuration...");

    const result = await testEmailConfiguration();

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Email test successful",
          data: {
            messageId: result.messageId,
            developmentMode: result.developmentMode || false,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Email test failed",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/test
 * Send a custom test email
 *
 * Request body:
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Test Subject",
 *   "text": "Test message",
 *   "html": "<p>Test <strong>HTML</strong> message</p>"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: 'Both "to" and "subject" fields are required',
        },
        { status: 400 }
      );
    }

    // Ensure at least text or html content
    if (!text && !html) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing content",
          error: 'Either "text" or "html" content must be provided',
        },
        { status: 400 }
      );
    }

    console.log(`Sending custom test email to: ${to}`);

    const result = await sendEmail({
      to,
      subject,
      text,
      html,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Custom test email sent successfully",
          data: {
            messageId: result.messageId,
            developmentMode: result.developmentMode || false,
            to,
            subject,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send custom test email",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Custom test email error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send custom test email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
