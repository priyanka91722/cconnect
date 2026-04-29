const nodemailer = require("nodemailer");

const senderEmail = process.env.EMAIL_USER;
const senderPassword = process.env.EMAIL_PASS;
const senderName =
  process.env.EMAIL_FROM || "Campus Connect <no-reply@campusconnect.com>";

if (!senderEmail || !senderPassword) {
  console.warn(
    "Email notifications are disabled because EMAIL_USER or EMAIL_PASS is not set.",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

const buildEmailHtml = ({ title, body, link, timestamp }) => {
  const sentAt = timestamp
    ? new Date(timestamp).toLocaleString()
    : new Date().toLocaleString();

  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="margin-bottom: 0.5rem;">${title}</h2>
      <p style="font-size: 16px;">${body}</p>
      ${link ? `<p><a href="${link}" style="color: #2563eb; text-decoration: none;">View details</a></p>` : ""}
      <p style="font-size: 14px; color: #6b7280; margin-top: 1.5rem;">Sent at: ${sentAt}</p>
    </div>
  `;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!senderEmail || !senderPassword) {
    console.warn(
      "Email notification skipped because mail configuration is missing.",
    );
    return null;
  }

  const mailOptions = {
    from: senderName,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

const sendNotificationEmail = async ({ to, title, body, link, timestamp }) => {
  if (!to) {
    return null;
  }

  const html = buildEmailHtml({ title, body, link, timestamp });
  const text = `${title}\n\n${body}${link ? `\n\nView details: ${link}` : ""}\n\nSent at: ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}`;

  return await sendEmail({
    to,
    subject: title,
    text,
    html,
  });
};

module.exports = {
  sendNotificationEmail,
};
