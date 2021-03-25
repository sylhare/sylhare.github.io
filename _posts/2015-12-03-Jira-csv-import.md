---
layout: post
title: Rules to import issue to jira via csv files
color: rgb(216,174,71)
tags: [agile]
---

## CSV External import

On the advance configuration (if you're admin press `gg` then type external import):

- Usually Excel csv are with `;`
- Use `ISO-8859-1` for french instead of `utf-8` to get the accents
 
### Adding issues links

Adding links to the issues can be mapped to the jira link field using:

- the `Issue ID` from the sheet
- the `issue key` from issues already in jira like `TEST-1`

| Summary | Issue ID | Link  "relates" | Link "relates" | Link "blocks" |
|---------|----------|--------------------|-------------------|---------------|
| House   | 1        | 2                  | 3                 | 3             |
| Patio   | 2        |                    |                   | 3             |
| Garden  | 3        | TEST-1             |                   |               |


### Adding issue

Basic representation on how to add an issue with the mandatory fields:

- Issue id: from your excel sheet, must be unique at each import
- Parent id: used for subtasks only
- Issuetype: Must match the ones in Jira so that it maps automatically
	
| id | parent id | Summary   | issue type |
|----|------------|--------------|-------------|
| 1  |               | task ABC    | Task          |
| 2  | 1            | subtask A   | Subtask    |
| 3  | 1            | subtask B   | Subtask    |


### Adding epics

For epics and the linked issues under those epics you need:

- Epic Name: Little name of the epic
- Summary: lengthy name of the epic
- Epic Link: To link the epic to the story
    - The Epic Name `the car` define in excel
    - The issue key `PLANE-7` of an existing epic in jira 
- Issuetype: must be set as `Epic` to be an epic.
	
| Issue type | Epic Name | summary         | Epic Link |
|------------|-----------|-----------------|-----------|
| Epic       | the car   | build a car     |           |
| Story      |           | build an engine | my-epic   |
| Story      |           | buy tires       | my-epic   |
| Story      |           | Build wings     | PLANE-7   |
