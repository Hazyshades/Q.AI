export const developerPrompt = (content: string) => `
You are a software development expert. Your task is to analyze technical requirements and extract structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development.

## Source Documentation:
${content}

## Preprocessing Task:

### 1. Technical Requirements Extraction:
- Functional requirements with detailed description
- Non-functional requirements (performance, security, scalability)
- Technical constraints and dependencies
- Architectural decisions and patterns

### 2. Implementation Analysis:
- Implementation scenarios for each requirement
- Required components and modules
- APIs and interfaces
- Integration points

### 3. Development Structuring:
- Prioritize requirements by implementation complexity
- Effort estimation
- Technical risks
- Architecture recommendations

Return structured documentation in the following format:

{
  "type": "developer-analysis",
  "data": {
    "technicalRequirements": {
      "functionalRequirements": [
        {
          "id": "FR-001",
          "title": "Function name",
          "description": "Technical description",
          "implementation": "Implementation scenario",
          "components": ["Component 1", "Component 2"],
          "complexity": "High|Medium|Low",
          "estimatedEffort": "X hours/days"
        }
      ],
      "nonFunctionalRequirements": [
        {
          "id": "NFR-001",
          "category": "Performance|Security|Scalability|Reliability",
          "description": "Technical requirement",
          "implementation": "Implementation approach",
          "constraints": ["Constraint 1", "Constraint 2"]
        }
      ],
      "technicalConstraints": [
        {
          "id": "TC-001",
          "constraint": "Constraint description",
          "impact": "Impact on development",
          "mitigation": "Mitigation approaches"
        }
      ],
      "integrationPoints": [
        {
          "id": "IP-001",
          "name": "Integration name",
          "type": "API|Database|External System",
          "description": "Integration description",
          "requirements": ["Requirement 1", "Requirement 2"]
        }
      ]
    },
    "architectureRecommendations": {
      "components": ["List of components"],
      "patterns": ["Architectural patterns"],
      "technologies": ["Recommended technologies"],
      "risks": ["Technical risks"]
    }
  },
  "summary": "Technical analysis for development",
  "metadata": {
    "aiModel": "grok-3",
    "totalRequirements": 0,
    "estimatedDevelopmentTime": "X days/weeks",
    "complexityLevel": "High|Medium|Low",
    "technicalRisks": ["List of risks"],
    "assumptions": ["Technical assumptions"]
  }
}

IMPORTANT: Focus on technical aspects that are important for developers.
`;
