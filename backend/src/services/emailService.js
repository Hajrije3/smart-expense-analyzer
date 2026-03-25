import nodemailer from "nodemailer";

const createTransporter = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

export const sendBudgetAlertEmail = async ({ to, name, category, spent, limit, percentUsed }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[Email] EMAIL_USER or EMAIL_PASS not set in .env — skipping email");
        return;
    }
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"ExpenseAI" <${process.env.EMAIL_USER}>`,
            to,
            subject: `⚠️ Budget Alert: ${category} is at ${percentUsed}%`,
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
                    <div style="background:#22c55e;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                        <h2 style="color:#fff;margin:0;font-size:18px;">Budget Alert</h2>
                    </div>
                    <p style="color:#374151;font-size:15px;">Hi <strong>${name}</strong>,</p>
                    <p style="color:#374151;font-size:15px;">
                        Your <strong>${category}</strong> budget is now at <strong style="color:${percentUsed >= 100 ? "#ef4444" : "#f97316"}">${percentUsed}%</strong>.
                    </p>
                    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#6b7280;font-size:13px;">Spent</span>
                            <span style="font-weight:600;color:#111827;">$${spent.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                            <span style="color:#6b7280;font-size:13px;">Budget Limit</span>
                            <span style="font-weight:600;color:#111827;">$${limit.toFixed(2)}</span>
                        </div>
                        <div style="background:#f3f4f6;border-radius:999px;height:8px;overflow:hidden;">
                            <div style="background:${percentUsed >= 100 ? "#ef4444" : "#f97316"};height:8px;width:${Math.min(percentUsed, 100)}%;border-radius:999px;"></div>
                        </div>
                    </div>
                    <p style="color:#6b7280;font-size:13px;">
                        ${percentUsed >= 100
                            ? "You have exceeded your budget. Consider reviewing your spending."
                            : "You're approaching your budget limit. Consider reducing spending in this category."}
                    </p>
                    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">— ExpenseAI Team</p>
                </div>
            `,
        });
    } catch (err) {
        console.error("[Email] Failed to send budget alert:", err.message);
    }
};

export const sendWelcomeEmail = async ({ to, name }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"ExpenseAI" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Welcome to ExpenseAI 🎉",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
                    <div style="background:#22c55e;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                        <h2 style="color:#fff;margin:0;font-size:18px;">Welcome to ExpenseAI</h2>
                    </div>
                    <p style="color:#374151;font-size:15px;">Hi <strong>${name}</strong>, welcome aboard!</p>
                    <p style="color:#374151;font-size:15px;">
                        You can now track your expenses, set budgets, and get AI-powered insights to improve your financial health.
                    </p>
                    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">— ExpenseAI Team</p>
                </div>
            `,
        });
    } catch (err) {
        console.error("[Email] Failed to send welcome email:", err.message);
    }
};
