const fetchIssues = require("./fetchIssues");

async function categorizeIssues() {
  const issues = await fetchIssues();
  const categorized = {
    sprints: {},
    epics: [],
    stories: [],
    subtasks: [],
    tasks: [],
  };

  issues.forEach((issue) => {
    const { issuetype, sprint, summary, status } = issue.fields;

    // Organize by Sprint
    const sprintName = sprint ? sprint.name : "No Sprint";
    if (!categorized.sprints[sprintName]) {
      categorized.sprints[sprintName] = [];
    }
    categorized.sprints[sprintName].push({
      key: issue.key,
      summary,
      status: status.name,
      type: issuetype.name,
    });

    // Organize by Issue Type
    switch (issuetype.name) {
      case "Epic":
        categorized.epics.push({
          key: issue.key,
          summary,
          status: status.name,
        });
        break;
      case "Story":
        // Check if this Story has an Epic Link
        const epicLink = issue.fields.customfield_10007; // This is commonly the Epic Link field
        categorized.stories.push({
          key: issue.key,
          summary,
          status: status.name,
          epicLink: epicLink ? epicLink : null,
        });
        break;
      case "Sub-task":
        categorized.subtasks.push({
          key: issue.key,
          summary,
          status: status.name,
        });
        break;
      case "Task":
        categorized.tasks.push({
          key: issue.key,
          summary,
          status: status.name,
        });
        break;
      // Add more cases if necessary
    }
  });

  // Optionally, group Stories under their respective Epics
  categorized.epics.forEach((epic) => {
    epic.stories = categorized.stories.filter(
      (story) => story.epicLink === epic.key
    );
  });

  return categorized;
}

module.exports = categorizeIssues;
