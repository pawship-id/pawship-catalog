import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

// alternative transporter configurations
const createTransporterWithFallback = () => {
  // debug email configuration
  console.log("Email config debug:", {
    username: process.env.EMAIL_USERNAME,
    hasPassword: !!process.env.EMAIL_PASSWORD,
    passwordLength: process.env.EMAIL_PASSWORD?.length || 0,
  });

  const configs = [
    // config 1: Simple service approach
    {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    // config 2: STARTTLS approach
    {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      requireTLS: true,
      connectionTimeout: 20000,
      socketTimeout: 20000,
    },
    // config 3: SSL approach with relaxed TLS
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    },
  ];

  return configs;
};

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // validate required environment variables
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        "Missing required email configuration environment variables"
      );
    }

    // validate input options
    if (!options.email || !options.subject || !options.message) {
      throw new Error(
        "Missing required email options: email, subject, or message"
      );
    }

    console.log("Attempting to send email to:", options.email);

    // 1. try multiple transporter configurations
    const configs = createTransporterWithFallback();
    let transporter;
    let lastError;

    for (let i = 0; i < configs.length; i++) {
      try {
        console.log(`Trying configuration ${i + 1}/${configs.length}`);
        transporter = nodemailer.createTransport(configs[i]);

        // test connection with timeout
        await Promise.race([
          transporter.verify(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 15000)
          ),
        ]);

        console.log(`Configuration ${i + 1} successful`);
        break;
      } catch (error) {
        console.log(`Configuration ${i + 1} failed:`, error);
        lastError = error;
        transporter = null;

        if (i === configs.length - 1) {
          throw new Error(
            `All email configurations failed. Last error: ${lastError}`
          );
        }
      }
    }

    if (!transporter) {
      throw new Error("Failed to create email transporter");
    }

    // 3. specify email options using the provided options parameter
    const mailOptions = {
      from: `"Pawship" <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html:
        options.html ||
        `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${options.message.replace(/\n/g, "<br>")}</div>`,
    };

    // 4. send email with timeout and retry
    let result;
    let attempts = 0;
    const maxRetries = 2;
    const retryDelay = 3000; // 3 seconds

    while (attempts < maxRetries) {
      try {
        attempts++;
        console.log(`Email send attempt ${attempts}/${maxRetries}`);

        result = await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Send timeout after 30 seconds")),
              30000
            )
          ),
        ]);

        console.log(`Email sent successfully to ${options.email}`, {
          messageId:
            result && typeof result === "object" && "messageId" in result
              ? result.messageId
              : "unknown",
          accepted:
            result && typeof result === "object" && "accepted" in result
              ? result.accepted
              : [],
          rejected:
            result && typeof result === "object" && "rejected" in result
              ? result.rejected
              : [],
        });

        break; // success, exit retry loop
      } catch (sendError) {
        console.log(`Email send attempt ${attempts} failed:`, sendError);

        if (attempts >= maxRetries) {
          throw sendError; // re-throw if all attempts failed
        }

        // wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", {
      error: error instanceof Error ? error.message : error,
      recipient: options?.email || "unknown",
      subject: options?.subject || "unknown",
    });

    // re-throw the error so calling code can handle it appropriately
    throw error;
  }
};

export default sendEmail;
