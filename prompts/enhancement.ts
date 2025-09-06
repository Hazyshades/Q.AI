export const enhancementPrompt = (testCases: any[], feedback: string) => `
You are a software testing expert. Your task is to improve existing test cases based on feedback.

## Current Test Cases:
${JSON.stringify(testCases, null, 2)}

## Feedback:
${feedback}

## Improvement Instructions:

### 1. Feedback Analysis:
- Identify main issues in current test cases
- Understand which aspects need improvement
- Consider project specifics and domain area

### 2. Test Case Improvement:
- Make steps more specific and measurable
- Add missing checks
- Improve descriptions and expected results
- Fix logical errors
- Add boundary value checks

### 3. Structural Improvements:
- Improve test case prioritization
- Optimize categorization
- Make test cases more reproducible
- Add missing preconditions

### 4. Quality and Completeness:
- Ensure all main scenarios are covered
- Add negative test cases if missing
- Improve readability and understandability
- Make test cases more practical

Return improved test cases in the same JSON format as the original, but with improvements based on feedback.

IMPORTANT: Preserve the structure and IDs of original test cases, but improve their content.
`;
