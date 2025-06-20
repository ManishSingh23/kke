const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, email, phone, company, products, message, website } =
      req.body;

    if (website) {
      return res
        .status(400)
        .json({ success: false, message: "Spam detected." });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const productsList =
      Array.isArray(products) && products.length > 0
        ? products.join(", ")
        : "Not specified";

    const subject = `New Enquiry from ${name} - Krishna Kavach`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2563eb; }
            .value { margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🚀 New Enquiry - Krishna Kavach Engineering</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Name:</div>
                    <div class='value'>${name}</div>
                </div>
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>${email}</div>
                </div>
                <div class='field'>
                    <div class='label'>Phone:</div>
                    <div class='value'>${phone}</div>
                </div>
                <div class='field'>
                    <div class='label'>Company:</div>
                    <div class='value'>${company || "Not provided"}</div>
                </div>
                <div class='field'>
                    <div class='label'>Products Interested In:</div>
                    <div class='value'>${productsList}</div>
                </div>
                <div class='field'>
                    <div class='label'>Message:</div>
                    <div class='value'>${message || "No message provided"}</div>
                </div>
            </div>
            <div class='footer'>
                <p>This enquiry was submitted from the Krishna Kavach website on ${new Date().toLocaleString()}</p>
                <p>🌟 Something magical is launching soon! 🌟</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Krishna Kavach Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || "admin@krishnakavach.com",
      replyTo: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info);
      })
      .catch((err) => {
        console.error("SendMail error:", err);
      });

    res.status(200).json({
      success: true,
      message: `Thank you ${name}! Your message has been sent successfully. We'll contact you soon at ${phone}. 🚀 Stay tuned for our magical launch!`,
    });
  } catch (error) {
    console.error("Email error:", error);

    console.log("Enquiry backup:", {
      timestamp: new Date().toISOString(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      products: req.body.products,
      message: req.body.message,
    });

    res.status(500).json({
      success: false,
      message:
        "Unable to send email at the moment. Please contact us directly at admin@krishnakavach.com or call +91 8860838343.",
    });
  }
};
