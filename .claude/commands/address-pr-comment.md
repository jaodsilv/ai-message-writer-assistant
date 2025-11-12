---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*)
description: Address a PR comment
argument-hint: Required|Optional [comment]</comment>
---

## Context

- Arguments: $ARGUMENTS

## Your Task

### 1. Parse Arguments using tags and address the PR comment
* Set $TYPE to the type of the comment that is being addressed. This should be the part between `<type>` and `</type>` tags.
* Set $COMMENT to the comment that is being addressed. This should be the part between `<comment>` and `</comment>` tags.

### 2. Address the PR comment

Address the PR comment properly following the rules below:

1. Think deeply in a Plan to address the comment

#### 2.1. If $TYPE is Optional
* Based in the plan, classify ig it is Easy and/OR Small
* If it is Easy and Small, do:
  1. Execute the plan
  2. Commit the change
* If it is not Easy or not Small, do:
  1. Create a github issue for this. Attribute correct priority and labelling.
  2. Evaluate where is best fit in the roadmap and update DEV_PLAN.md accordingly including the github issue number.
  3. Commit the change to DEV_PLAN.md

#### 2.2. If $Type is Required OR ($Type is Optional and the change is easy and small):
1. Execute the plan
2. Commit the change
