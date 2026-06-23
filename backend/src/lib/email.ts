import nodemailer from "nodemailer";

// Create transporter configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a notification email to the referrer when a new user registers using their code.
 */
export async function sendReferralEmail(
  referrerEmail: string,
  referrerName: string,
  refereeName: string
) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log(
      `[Email Simulation] SMTP not configured. Referral notification would have been sent to ${referrerEmail}.`
    );
    console.log(
      `Message body: Hey ${referrerName}, ${refereeName} just joined Jugarr using your referral code!`
    );
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Jugarr Team" <no-reply@jugarr.in>`,
    to: referrerEmail,
    subject: `🎉 Someone joined Jugarr using your referral code!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff; color: #1e1e1e;">
        <div style="text-align: center; border-bottom: 2px solid #f1f1f1; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: bold;">Jugarr</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Campus Referral Hustle</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">Hey <strong>${referrerName}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.5;">Great news! <strong>${refereeName}</strong> has just registered on the Jugarr waitlist using your referral code.</p>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
          <span style="font-size: 18px; font-weight: bold; color: #b45309;">🚀 +5 RANK BOOST UNLOCKED!</span>
        </div>
        
        <p style="font-size: 15px; line-height: 1.5;">Your queue position has been updated on the waitlist leaderboard. Keep sharing your custom link with other batchmates to climb the ranks and unlock exclusive goodies like Branded T-Shirts, Premium Soft-Touch Journals, and Founding Member privileges.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "https://jugarr-in.vercel.app"}/success?email=${encodeURIComponent(referrerEmail)}" style="background-color: #1e1e1e; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px; border: 1px solid #1e1e1e;">Check Your Leaderboard Rank</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #f1f1f1; margin: 30px 0;" />
        
        <div style="text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">This is an automated notification from the Jugarr Waitlist platform.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Jugarr India. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Referral notification email successfully sent to ${referrerEmail}`);
  } catch (error) {
    console.error("Error sending referral email:", error);
  }
}
