require("dotenv").config();

module.exports = {
  JIRA_BASE_URL: process.env.JIRA_BASE_URL,
  JIRA_EMAIL: process.env.JIRA_EMAIL,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
  PROJECT_KEY: process.env.PROJECT_KEY,
  DASHBOARD_URL: process.env.DASHBOARD_URL,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT,
};
