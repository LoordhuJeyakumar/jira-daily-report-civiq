const { JIRA_BASE_URL, DASHBOARD_URL } = require("../config/jiraConfig");

function formatEmailContent(categorizedIssues) {
  let emailContent = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      body {
        font-family: "Arial", sans-serif;
        margin: 20px;
        background-color: #f4f7fc;
        color: #333;
        line-height: 1.6;
      }
      h2,
      h3 {
        color: #2c3e50;
        font-weight: bold;
      }
      h4 {
        color: #34495e;
      }
      p {
        font-size: 16px;
        margin-bottom: 20px;
      }
      a {
        color: #3498db;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      th,
      td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
        font-size: 14px;
      }
      th {
        background-color: #2980b9;
        color: black;
      }
      td {
        background-color: #f9f9f9;
      }
      .status-header {
        background-color: #ecf0f1;
        font-weight: bold;
        padding: 10px;
        border-top: 4px solid #3498db;
      }
      .status-column {
        color: #2c3e50;
      }
      .status-to-do {
        background-color: #f39c12;
        color: black;
      }
      .status-in-progress {
        background-color: #f1c40f;
        color: black;
      }
      .status-done {
        background-color: #27ae60;
        color: black;
      }
      .epic-row {
        background-color: #e8f7fa;
      }
    </style>
      </head>
      <body>
        <h2>Daily Project Update</h2>
        <p><strong>Dashboard URL:</strong> <a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a></p>
  `;

  // Loop through sprints and issues
  Object.keys(categorizedIssues.sprints).forEach((sprint) => {
    emailContent += `<h3>Sprint: ${sprint}</h3>`;

    // Filter issues by status (To Do, In Progress, Done)
    const statusGroups = {
      "To Do": [],
      "In Progress": [],
      Done: [],
    };

    categorizedIssues.sprints[sprint].forEach((issue) => {
      const status = issue.status;
      if (statusGroups[status]) {
        statusGroups[status].push(issue);
      }
    });

    // List the issues under each status category
    ["To Do", "In Progress", "Done"].forEach((status) => {
      if (statusGroups[status].length > 0) {
        emailContent += `<h4 style="background-color: #ecf0f1; padding: 10px; font-weight: bold;">${status}</h4>`;
        emailContent += `<table>`;
        emailContent += `
          <tr style="background-color: #2980b9; color: black;">
            <th>Issue Key</th>
            <th>Summary</th>
            <th>Type</th>
            <th>Status</th>
          </tr>`;

        statusGroups[status].forEach((issue) => {
          const statusClass = `status-${status
            .toLowerCase()
            .replace(" ", "-")}`;
          emailContent += `
            <tr class="${statusClass}" style="background-color: #f9f9f9;">
              <td><a href="${JIRA_BASE_URL}/browse/${issue.key}" style="color: #3498db;">${issue.key}</a></td>
              <td>${issue.summary}</td>
              <td>${issue.type}</td>
              <td>${issue.status}</td>
            </tr>`;

          // If issue is an Epic, list stories under it
          if (issue.type === "Epic") {
            const stories = categorizedIssues.stories.filter(
              (story) =>
                story.fields &&
                story.fields.customfield_10007 &&
                story.fields.customfield_10007 === issue.key
            ); // Check if customfield_10007 exists before comparing

            stories.forEach((story) => {
              emailContent += `
                <tr class="epic-row" style="background-color: #e8f7fa;">
                  <td><a href="${JIRA_BASE_URL}/browse/${story.key}" style="color: #3498db;">${story.key}</a></td>
                  <td>${story.fields.summary}</td>
                  <td>Story</td>
                  <td>${story.fields.status.name}</td>
                </tr>`;

              // For each story, list subtasks if any
              const subtasks = categorizedIssues.subtasks.filter(
                (subtask) =>
                  subtask.fields.parent &&
                  subtask.fields.parent.key === story.key
              );
              subtasks.forEach((subtask) => {
                emailContent += `
                  <tr style="background-color: #f9f9f9;">
                    <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}" style="color: #3498db;">${subtask.key}</a></td>
                    <td>${subtask.fields.summary}</td>
                    <td>Subtask</td>
                    <td>${subtask.fields.status.name}</td>
                  </tr>`;
              });
            });
          }

          // If it's a story or task, list subtasks if any
          if (issue.type === "Story" || issue.type === "Task") {
            const subtasks = categorizedIssues.subtasks.filter(
              (subtask) =>
                subtask.fields.parent && subtask.fields.parent.key === issue.key
            );
            subtasks.forEach((subtask) => {
              emailContent += `
                <tr>
                  <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
                  <td>${subtask.fields.summary}</td>
                  <td>Subtask</td>
                  <td>${subtask.fields.status.name}</td>
                </tr>`;
            });
          }
        });

        emailContent += `</table>`;
      }
    });
  });

  // Epics section (no Sprint)
  emailContent += `<h3>**Epics:**</h3>`;
  categorizedIssues.epics.forEach((epic) => {
    // Check if epic has fields and summary before accessing
    if (epic.fields && epic.fields.summary) {
      emailContent += `<table>`;
      emailContent += `
        <tr>
          <th>Issue Key</th>
          <th>Summary</th>
          <th>Status</th>
        </tr>`;
      emailContent += `
        <tr class="epic-row">
          <td><a href="${JIRA_BASE_URL}/browse/${epic.key}">${epic.key}</a></td>
          <td>${epic.fields.summary}</td>
          <td>${epic.fields.status ? epic.fields.status.name : "N/A"}</td>
        </tr>`;

      // Loop through stories linked to this epic
      const stories = categorizedIssues.stories.filter(
        (story) =>
          story.fields &&
          story.fields.customfield_10007 &&
          story.fields.customfield_10007 === epic.key
      );

      stories.forEach((story) => {
        emailContent += `
          <tr>
            <td><a href="${JIRA_BASE_URL}/browse/${story.key}">${story.key}</a></td>
            <td>${story.fields.summary}</td>
            <td>${story.fields.status.name}</td>
          </tr>`;

        // For each story, list subtasks if any
        const subtasks = categorizedIssues.subtasks.filter(
          (subtask) =>
            subtask.fields.parent && subtask.fields.parent.key === story.key
        );
        subtasks.forEach((subtask) => {
          emailContent += `
            <tr>
              <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
              <td>${subtask.fields.summary}</td>
              <td>${subtask.fields.status.name}</td>
            </tr>`;
        });
      });

      emailContent += `</table>`;
    }
  });

  // Stories without an Epic
  emailContent += `<h3>**Stories (No Epic):**</h3>`;
  // When filtering stories without an Epic link
  categorizedIssues.stories
    .filter((story) => story.fields && !story.fields.customfield_10007) // Stories with no Epic link
    .forEach((story) => {
      emailContent += `<table>`;
      emailContent += `
        <tr>
          <th>Issue Key</th>
          <th>Summary</th>
          <th>Status</th>
        </tr>`;
      emailContent += `
        <tr>
          <td><a href="${JIRA_BASE_URL}/browse/${story.key}">${story.key}</a></td>
          <td>${story.fields.summary}</td>
          <td>${story.fields.status.name}</td>
        </tr>`;

      // For each story, list subtasks if any
      const subtasks = categorizedIssues.subtasks.filter(
        (subtask) =>
          subtask.fields.parent && subtask.fields.parent.key === story.key
      );
      subtasks.forEach((subtask) => {
        emailContent += `
          <tr>
            <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
            <td>${subtask.fields.summary}</td>
            <td>${subtask.fields.status.name}</td>
          </tr>`;
      });
      emailContent += `</table>`;
    });

  emailContent += `
      </body>
    </html>
  `;

  return emailContent;
}

module.exports = formatEmailContent;

/* const { JIRA_BASE_URL, DASHBOARD_URL } = require("../config/jiraConfig");

function formatEmailContent(categorizedIssues) {
  let emailContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          h2 {
            color: #333;
          }
          .status-header {
            background-color: #f0f0f0;
            font-weight: bold;
            padding: 5px;
          }
          .status-column {
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <h2>Daily Project Update</h2>
        <p><strong>Dashboard URL:</strong> <a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a></p>
  `;

  // Loop through sprints and issues
  Object.keys(categorizedIssues.sprints).forEach((sprint) => {
    emailContent += `<h3>Sprint: ${sprint}</h3>`;

    // Filter issues by status (To Do, In Progress, Done)
    const statusGroups = {
      "To Do": [],
      "In Progress": [],
      Done: [],
    };

    categorizedIssues.sprints[sprint].forEach((issue) => {
      const status = issue.status;
      if (statusGroups[status]) {
        statusGroups[status].push(issue);
      }
    });

    // List the issues under each status category
    ["To Do", "In Progress", "Done"].forEach((status) => {
      if (statusGroups[status].length > 0) {
        emailContent += `<h4 class="status-header">${status}</h4>`;
        emailContent += `<table>`;
        emailContent += `
          <tr>
            <th>Issue Key</th>
            <th>Summary</th>
            <th>Type</th>
            <th>Status</th>
          </tr>`;

        statusGroups[status].forEach((issue) => {
          emailContent += `
            <tr>
              <td><a href="${JIRA_BASE_URL}/browse/${issue.key}">${issue.key}</a></td>
              <td>${issue.summary}</td>
              <td>${issue.type}</td>
              <td>${issue.status}</td>
            </tr>`;

          // If issue is an Epic, list stories under it
          if (issue.type === "Epic") {
            const stories = categorizedIssues.stories.filter(
              (story) =>
                story.fields &&
                story.fields.customfield_10007 &&
                story.fields.customfield_10007 === issue.key
            ); // Check if customfield_10007 exists before comparing

            stories.forEach((story) => {
              emailContent += `
                <tr>
                  <td><a href="${JIRA_BASE_URL}/browse/${story.key}">${story.key}</a></td>
                  <td>${story.fields.summary}</td>
                  <td>Story</td>
                  <td>${story.fields.status.name}</td>
                </tr>`;

              // For each story, list subtasks if any
              const subtasks = categorizedIssues.subtasks.filter(
                (subtask) =>
                  subtask.fields.parent &&
                  subtask.fields.parent.key === story.key
              );
              subtasks.forEach((subtask) => {
                emailContent += `
                  <tr>
                    <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
                    <td>${subtask.fields.summary}</td>
                    <td>Subtask</td>
                    <td>${subtask.fields.status.name}</td>
                  </tr>`;
              });
            });
          }

          // If it's a story or task, list subtasks if any
          if (issue.type === "Story" || issue.type === "Task") {
            const subtasks = categorizedIssues.subtasks.filter(
              (subtask) =>
                subtask.fields.parent && subtask.fields.parent.key === issue.key
            );
            subtasks.forEach((subtask) => {
              emailContent += `
                <tr>
                  <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
                  <td>${subtask.fields.summary}</td>
                  <td>Subtask</td>
                  <td>${subtask.fields.status.name}</td>
                </tr>`;
            });
          }
        });

        emailContent += `</table>`;
      }
    });
  });

  // Epics section (no Sprint)
  emailContent += `<h3>**Epics:**</h3>`;
  categorizedIssues.epics.forEach((epic) => {
    // Check if epic has fields and summary before accessing
    if (epic.fields && epic.fields.summary) {
      emailContent += `<table>`;
      emailContent += `
        <tr>
          <th>Issue Key</th>
          <th>Summary</th>
          <th>Status</th>
        </tr>`;
      emailContent += `
        <tr>
          <td><a href="${JIRA_BASE_URL}/browse/${epic.key}">${epic.key}</a></td>
          <td>${epic.fields.summary}</td>
          <td>${epic.fields.status ? epic.fields.status.name : "N/A"}</td>
        </tr>`;

      // Loop through stories linked to this epic
      const stories = categorizedIssues.stories.filter(
        (story) =>
          story.fields &&
          story.fields.customfield_10007 &&
          story.fields.customfield_10007 === epic.key
      );

      stories.forEach((story) => {
        emailContent += `
          <tr>
            <td><a href="${JIRA_BASE_URL}/browse/${story.key}">${story.key}</a></td>
            <td>${story.fields.summary}</td>
            <td>${story.fields.status.name}</td>
          </tr>`;

        // For each story, list subtasks if any
        const subtasks = categorizedIssues.subtasks.filter(
          (subtask) =>
            subtask.fields.parent && subtask.fields.parent.key === story.key
        );
        subtasks.forEach((subtask) => {
          emailContent += `
            <tr>
              <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
              <td>${subtask.fields.summary}</td>
              <td>${subtask.fields.status.name}</td>
            </tr>`;
        });
      });

      emailContent += `</table>`;
    }
  });

  // Stories without an Epic
  emailContent += `<h3>**Stories (No Epic):**</h3>`;
  // When filtering stories without an Epic link
  categorizedIssues.stories
    .filter((story) => story.fields && !story.fields.customfield_10007) // Stories with no Epic link
    .forEach((story) => {
      emailContent += `<table>`;
      emailContent += `
        <tr>
          <th>Issue Key</th>
          <th>Summary</th>
          <th>Status</th>
        </tr>`;
      emailContent += `
        <tr>
          <td><a href="${JIRA_BASE_URL}/browse/${story.key}">${story.key}</a></td>
          <td>${story.fields.summary}</td>
          <td>${story.fields.status.name}</td>
        </tr>`;

      // For each story, list subtasks if any
      const subtasks = categorizedIssues.subtasks.filter(
        (subtask) =>
          subtask.fields.parent && subtask.fields.parent.key === story.key
      );
      subtasks.forEach((subtask) => {
        emailContent += `
          <tr>
            <td><a href="${JIRA_BASE_URL}/browse/${subtask.key}">${subtask.key}</a></td>
            <td>${subtask.fields.summary}</td>
            <td>${subtask.fields.status.name}</td>
          </tr>`;
      });

      emailContent += `</table>`;
    });

  emailContent += `</body></html>`;
  return emailContent;
}

module.exports = formatEmailContent;
 */
