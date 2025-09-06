export const managerPrompt = (content: string) => `
You are a software development project management expert. Your task is to analyze technical requirements and make them transparent by extracting project goals, priorities, key implementation components, and overall overview.

## Source Documentation:
${content}

## Preprocessing Task:

### 1. Project Information Extraction:
- Project goals and objectives
- Business requirements and expectations
- Key stakeholders
- Timeframes and constraints

### 2. Project Scope Analysis:
- Main functional blocks
- Critical implementation paths
- Dependencies and risks
- Resource requirements

### 3. Management Structuring:
- Prioritize by business value
- Assess complexity and risks
- Plan phases
- Success metrics

Return structured documentation in the following format:

{
  "type": "manager-analysis",
  "data": {
    "projectOverview": {
      "projectGoals": [
        {
          "id": "PG-001",
          "goal": "Project goal",
          "description": "Detailed description",
          "businessValue": "Business value",
          "priority": "Critical|High|Medium|Low"
        }
      ],
      "stakeholders": [
        {
          "id": "ST-001",
          "role": "Stakeholder role",
          "responsibilities": "Responsibilities",
          "influence": "Influence level"
        }
      ],
      "keyFeatures": [
        {
          "id": "KF-001",
          "name": "Feature name",
          "description": "Description",
          "businessValue": "Business value",
          "complexity": "High|Medium|Low",
          "estimatedEffort": "X days/weeks"
        }
      ]
    },
    "projectPlanning": {
      "phases": [
        {
          "id": "PH-001",
          "name": "Phase name",
          "duration": "X days/weeks",
          "deliverables": ["Deliverable 1", "Deliverable 2"],
          "dependencies": ["Dependency 1", "Dependency 2"]
        }
      ],
      "risks": [
        {
          "id": "RK-001",
          "risk": "Risk description",
          "probability": "High|Medium|Low",
          "impact": "Critical|High|Medium|Low",
          "mitigation": "Risk mitigation plan"
        }
      ],
      "successMetrics": [
        {
          "id": "SM-001",
          "metric": "Metric name",
          "description": "Description",
          "target": "Target value",
          "measurement": "Measurement method"
        }
      ]
    },
    "resourceRequirements": {
      "team": {
        "roles": ["Role 1", "Role 2"],
        "estimatedSize": "X people",
        "skills": ["Skill 1", "Skill 2"]
      },
      "timeline": {
        "estimatedDuration": "X months",
        "criticalPath": ["Phase 1", "Phase 2"],
        "milestones": ["Milestone 1", "Milestone 2"]
      }
    }
  },
  "summary": "Project overview for management",
  "metadata": {
    "aiModel": "grok-3",
    "projectComplexity": "High|Medium|Low",
    "estimatedBudget": "X rubles/dollars",
    "businessPriority": "Critical|High|Medium|Low",
    "keyRisks": ["Main risks"],
    "assumptions": ["Business assumptions"]
  }
}

IMPORTANT: Focus on aspects important for project management and decision-making.
`;