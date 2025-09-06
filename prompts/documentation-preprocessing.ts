export const documentationPreprocessingPrompt = (content: string) => `
You are an expert in technical documentation analysis. Your task is to preprocess unstructured documentation and extract structured requirements from it.

## Source Documentation:
${content}

## Preprocessing Task:

### 1. Cleaning and Structuring:
- Remove irrelevant information (screenshots, formatting, comments)
- Extract key requirements and functionality
- Structure information by logical blocks
- Resolve contradictions if possible

### 2. Requirements Extraction:
- Functional requirements (what the system should do)
- Non-functional requirements (performance, security, usability)
- Business rules and constraints
- User scenarios and roles

### 3. Normalization:
- Unify terminology
- Remove duplicate information
- Make requirements more specific
- Add missing information based on context

Return structured documentation in the following format:

{
  "type": "documentation-analysis",
  "data": {
    "structuredRequirements": {
      "functionalRequirements": [
        {
          "id": "FR-001",
          "title": "Function name",
          "description": "Detailed description",
          "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
          "priority": "Critical|High|Medium|Low"
        }
      ],
      "nonFunctionalRequirements": [
        {
          "id": "NFR-001",
          "category": "Performance|Security|Usability|Reliability",
          "description": "Requirement description",
          "criteria": "Specific criteria"
        }
      ],
      "businessRules": [
        {
          "id": "BR-001",
          "rule": "Business rule description",
          "conditions": "Application conditions"
        }
      ],
      "userScenarios": [
        {
          "id": "US-001",
          "actor": "User type",
          "scenario": "Scenario description",
          "steps": ["Step 1", "Step 2"]
        }
      ]
    }
  },
  "summary": "Brief description of documentation analysis",
  "metadata": {
    "aiModel": "deepseek-chat",
    "originalDocumentQuality": "Good|Average|Poor",
    "assumptions": ["List of assumptions"],
    "contradictions": ["Found contradictions"],
    "missingInformation": ["Missing information"]
  }
}

IMPORTANT: Preserve all important information from the source documentation, but present it in a structured format.
`;
