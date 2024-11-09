const axios = require("axios");
const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  PROJECT_KEY,
} = require("../config/jiraConfig");

const JQL_QUERY = `project = "${PROJECT_KEY}" AND issuetype IN (Epic,Story,Subtask, EMPTY,subTaskIssueTypes(),Task,Sub-task,standardIssueTypes()) AND status IN ("To Do", "In Progress", Done)`;

async function fetchIssues() {
  try {
    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {
      params: {
        jql: JQL_QUERY,
        fields: "summary,status,issuetype,customfield_10007,sprint",
        maxResults: 100,
      },
      auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
    });

    return response.data.issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    return [];
  }
}
fetchIssues();

module.exports = fetchIssues;
