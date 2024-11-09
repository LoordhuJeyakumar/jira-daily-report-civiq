const sendEmail = require("./sendEmail");
const categorizeIssues = require("./utils/categorizeIssues");
const formatEmailContent = require("./utils/formatEmailContent");

async function main() {
  const categorizedIssues = await categorizeIssues();
  const emailContent = formatEmailContent(categorizedIssues);

  await sendEmail(emailContent);
}

main();
