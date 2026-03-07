import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, token) => {
    await transporter.sendMail({
        from: `"SevaLink" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your SevaLink account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563EB;">Welcome to SevaLink!</h2>
                <p>Thank you for registering. Please verify your email address to activate your account by using the OTP below.</p>
                <div style="background-color: #F3F4F6; padding: 24px; text-align: center; border-radius: 8px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">
                        ${token}
                    </span>
                </div>
                <p style="color: #6B7280; font-size: 14px;">
                    This code expires in <strong>15 minutes</strong>. If you didn't create an account, you can ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="color: #9CA3AF; font-size: 12px;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        `,
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetURL = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;

    await transporter.sendMail({
        from: `"SevaLink" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your SevaLink password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563EB;">Password Reset Request</h2>
                <p>You requested a password reset. Please click the button below to choose a new password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
                        Reset Password
                    </a>
                </div>
                <p style="text-align: center; color: #6B7280;">Or copy and paste this link into your browser:</p>
                <p style="text-align: center; word-break: break-all; color: #3b82f6;">${resetURL}</p>
                <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                    This link expires in <strong>15 minutes</strong>. If you didn't request a password reset, you can ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="color: #9CA3AF; font-size: 12px;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        `,
    });
};

export const sendPasswordResetOTP = async (email, otp) => {
    await transporter.sendMail({
        from: `"SevaLink" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your SevaLink Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563EB;">Password Reset OTP</h2>
                <p>You requested a password reset for your SevaLink account. Use the OTP below to reset your password.</p>
                <div style="background-color: #F3F4F6; padding: 24px; text-align: center; border-radius: 8px; margin: 24px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1F2937;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #6B7280; font-size: 14px;">
                    This OTP expires in <strong>5 minutes</strong>. Do not share this code with anyone.
                </p>
                <p style="color: #6B7280; font-size: 14px;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="color: #9CA3AF; font-size: 12px;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        `,
    });
};

export const sendWorkerInviteEmail = async (email, token, name) => {
    const inviteURL = `${process.env.CLIENT_URL || "http://localhost:5173"}/accept-invite/${token}`;

    // ALWAYS log the exact token to the terminal so Developers can bypass strict SMTP 535 Email Server drops natively!
    console.log(`\n======================================================`);
    console.log(`📨 WORKER INVITE LINK GENERATED FOR: ${email}`);
    console.log(`👉 ${inviteURL}`);
    console.log(`======================================================\n`);

    await transporter.sendMail({
        from: `"SevaLink" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You have been invited to join SevaLink as a Worker",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563EB;">Welcome to SevaLink, ${name}!</h2>
                <p>An administrator has created a worker account for you. Please click the button below to securely set your password and activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteURL}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
                        Set Your Password
                    </a>
                </div>
                <p style="text-align: center; color: #6B7280;">Or copy and paste this link into your browser:</p>
                <p style="text-align: center; word-break: break-all; color: #3b82f6;">${inviteURL}</p>
                <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                    This invitation link securely expires in <strong>24 hours</strong>.
                </p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="color: #9CA3AF; font-size: 12px;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        `,
    });
};
