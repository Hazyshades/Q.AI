import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', logger(() => {}));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// File upload and processing
app.post('/make-server-0344b1bc/upload-document', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const outputType = formData.get('outputType') as string || 'testcases';
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Read file content
    let textContent = '';
    
    if (file.type === 'text/plain') {
      textContent = await file.text();
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF processing, we'll extract text content
      // In a real implementation, you'd use a PDF parser
      textContent = 'PDF content extraction would be implemented here';
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX processing
      textContent = 'DOCX content extraction would be implemented here';
    }

    // Generate unique session ID
    const sessionId = crypto.randomUUID();
    
    // Store file metadata
    await kv.set(`document:${sessionId}`, {
      filename: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      content: textContent,
      outputType: outputType
    });

    return c.json({
      sessionId: sessionId,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    // File upload error
    return c.json({ error: 'File upload failed' }, 500);
  }
});

// Process text input directly
app.post('/make-server-0344b1bc/process-text', async (c) => {
  try {
    const { text, outputType } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'No text provided' }, 400);
    }

    const sessionId = crypto.randomUUID();
    
    // Store text input
    await kv.set(`document:${sessionId}`, {
      filename: 'text_input.txt',
      type: 'text/plain',
      content: text,
      outputType: outputType || 'testcases',
      uploadedAt: new Date().toISOString()
    });

    return c.json({
      sessionId: sessionId,
      message: 'Text processed successfully'
    });

  } catch (error) {
    // Text processing error
    return c.json({ error: 'Text processing failed' }, 500);
  }
});

// Generate test cases or checklist using AI
app.post('/make-server-0344b1bc/generate/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    
    // Retrieve document data
    const documentData = await kv.get(`document:${sessionId}`);
    if (!documentData) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Simulate AI processing with more realistic data based on content
    const results = await generateTestData(documentData.content, documentData.outputType);
    
    // Store generated results
    await kv.set(`results:${sessionId}`, {
      ...results,
      generatedAt: new Date().toISOString(),
      sessionId: sessionId
    });

    return c.json(results);

  } catch (error) {
    // Generation error
    return c.json({ error: 'Generation failed' }, 500);
  }
});

// Get results by session ID
app.get('/make-server-0344b1bc/results/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const results = await kv.get(`results:${sessionId}`);
    
    if (!results) {
      return c.json({ error: 'Results not found' }, 404);
    }

    return c.json(results);
  } catch (error) {
    // Results retrieval error
    return c.json({ error: 'Failed to retrieve results' }, 500);
  }
});

// Get user's generation history
app.get('/make-server-0344b1bc/history', async (c) => {
  try {
    // Get all results from the last 30 days
    const results = await kv.getByPrefix('results:');
    
    const history = results
      .filter(item => {
        const generatedAt = new Date(item.generatedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return generatedAt >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 20); // Limit to 20 most recent

    return c.json({ history });
  } catch (error) {
    // History retrieval error
    return c.json({ error: 'Failed to retrieve history' }, 500);
  }
});

// Helper function to generate test data using AI
async function generateTestData(content: string, outputType: string) {

  try {
    // Use AI service to analyze requirements and generate test data
    const aiResult = await callAIService(content, outputType);
    return aiResult;
  } catch (error) {
    console.error('AI generation failed, falling back to rule-based generation:', error);
    return generateFallbackTestData(content, outputType);
  }
}

// Call AI service (Grok 3 or OpenAI)
async function callAIService(content: string, outputType: string) {
  const aiModel = Deno.env.get('AI_MODEL') || 'grok-3';
  const apiKey = aiModel === 'grok-3' 
    ? Deno.env.get('GROK_API_KEY') 
    : Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('No AI API key configured');
  }

  const apiUrl = aiModel === 'grok-3'
    ? 'https://api.x.ai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const prompt = `
Analyze the following technical requirements and create ${outputType === 'testcases' ? 'structured test cases' : 'checklist'}:

${content}

Create JSON response in the following format for test cases:
{
  "type": "testcases",
  "data": [
    {
      "id": "TC-001",
      "title": "Test case name",
      "description": "Detailed description",
      "preconditions": "Preconditions",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expected": "Expected result",
      "priority": "High|Medium|Low|Critical",
      "category": "Category"
    }
  ],
  "summary": "Brief description of analysis",
  "metadata": {
    "totalRequirements": 10,
    "functionalRequirements": 8,
    "nonFunctionalRequirements": 2,
    "estimatedTestTime": "4-6 hours"
  }
}

Or for checklist:
{
  "type": "checklist",
  "data": [
    {
      "id": 1,
      "item": "Check item",
      "checked": false,
      "category": "Category"
    }
  ]
}

Important:
1. Create both positive and negative test cases
2. Include boundary value checks
3. Consider various user scenarios
4. Prioritize by functionality importance
5. Return only valid JSON without additional text
`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: aiModel === 'grok-3' ? 'grok-3' : 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a software testing expert. Your task is to analyze technical requirements and create quality test cases and checklists.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  const result = JSON.parse(jsonMatch[0]);
  
  // Validate result
  if (!result.type || !result.data || !Array.isArray(result.data)) {
    throw new Error('Invalid response structure from AI');
  }

  return result;
}



// Fallback rule-based generation
function generateFallbackTestData(content: string, outputType: string) {
  // Analyze content for keywords and functionality
  const hasLogin = content.toLowerCase().includes('login') || content.toLowerCase().includes('authentication') || content.toLowerCase().includes('signin');
  const hasRegistration = content.toLowerCase().includes('registration') || content.toLowerCase().includes('signup') || content.toLowerCase().includes('register');
  const hasProfile = content.toLowerCase().includes('profile') || content.toLowerCase().includes('account') || content.toLowerCase().includes('dashboard');
  const hasSearch = content.toLowerCase().includes('search') || content.toLowerCase().includes('find');
  const hasPayment = content.toLowerCase().includes('payment') || content.toLowerCase().includes('billing') || content.toLowerCase().includes('checkout');
  
  if (outputType === 'testcases') {
    const testCases = [];
    let tcCounter = 1;

    if (hasLogin) {
      testCases.push(
        {
          id: `TC-${String(tcCounter++).padStart(3, '0')}`,
          title: 'User login with valid credentials',
          description: 'Verify successful user authentication in the system',
          preconditions: 'User is registered in the system',
          steps: [
            'Open login page',
            'Enter valid email/username',
            'Enter valid password',
            'Click "Login" button'
          ],
          expected: 'User successfully authenticated and redirected to main page',
          priority: 'High'
        },
        {
          id: `TC-${String(tcCounter++).padStart(3, '0')}`,
          title: 'Login with invalid password',
          description: 'Verify error handling for incorrect password',
          preconditions: 'User is registered in the system',
          steps: [
            'Open login page',
            'Enter valid email/username',
            'Enter invalid password',
            'Click "Login" button'
          ],
          expected: 'Error message "Invalid password" is displayed',
          priority: 'High'
        }
      );
    }

    if (hasRegistration) {
      testCases.push({
        id: `TC-${String(tcCounter++).padStart(3, '0')}`,
        title: 'New user registration',
        description: 'Verify successful user registration with valid data',
        preconditions: 'Email is not registered in the system',
        steps: [
          'Open registration page',
          'Fill "Email" field with valid address',
          'Fill "Password" field according to requirements',
          'Confirm password',
          'Click "Register" button'
        ],
        expected: 'User successfully registered, confirmation email sent',
        priority: 'High'
      });
    }

    if (hasProfile) {
      testCases.push({
        id: `TC-${String(tcCounter++).padStart(3, '0')}`,
        title: 'User profile editing',
        description: 'Verify ability to modify profile data',
        preconditions: 'User is authenticated in the system',
        steps: [
          'Navigate to user profile',
          'Click "Edit" button',
          'Modify personal data',
          'Click "Save" button'
        ],
        expected: 'Profile data successfully updated',
        priority: 'Medium'
      });
    }

    if (hasSearch) {
      testCases.push({
        id: `TC-${String(tcCounter++).padStart(3, '0')}`,
        title: 'Search by keyword',
        description: 'Verify search functionality',
        preconditions: 'System contains searchable content',
        steps: [
          'Open search form',
          'Enter keyword',
          'Click "Search" button or press Enter'
        ],
        expected: 'Relevant search results are displayed',
        priority: 'Medium'
      });
    }

    if (hasPayment) {
      testCases.push({
        id: `TC-${String(tcCounter++).padStart(3, '0')}`,
        title: 'Successful order payment',
        description: 'Verify payment process with valid credit card',
        preconditions: 'User has items in cart',
        steps: [
          'Proceed to checkout',
          'Fill delivery information',
          'Select "Credit Card" payment method',
          'Enter card details',
          'Confirm payment'
        ],
        expected: 'Payment processed successfully, order completed',
        priority: 'Critical'
      });
    }

    // Add generic test cases if no specific functionality detected
    if (testCases.length === 0) {
      testCases.push(
        {
          id: 'TC-001',
          title: 'Main page loading',
          description: 'Verify correct display of main page',
          preconditions: 'Browser supports modern web standards',
          steps: [
            'Open browser',
            'Enter application URL',
            'Press Enter'
          ],
          expected: 'Main page loads correctly',
          priority: 'High'
        },
        {
          id: 'TC-002',
          title: 'Navigation between sections',
          description: 'Verify main navigation functionality',
          preconditions: 'Application is loaded',
          steps: [
            'Find navigation menu',
            'Click on various menu items',
            'Verify page transitions'
          ],
          expected: 'Navigation works correctly, pages load',
          priority: 'Medium'
        }
      );
    }

    return {
      type: 'testcases',
      data: testCases
    };
  } else {
    const checklist = [];
    let itemId = 1;

    // Generate checklist items based on detected functionality
    if (hasLogin) {
      checklist.push(
        { id: itemId++, item: 'Verify login form display', checked: false },
        { id: itemId++, item: 'Ensure field validation is present', checked: false },
        { id: itemId++, item: 'Test "Login" button functionality', checked: false },
        { id: itemId++, item: 'Test authentication error handling', checked: false }
      );
    }

    if (hasRegistration) {
      checklist.push(
        { id: itemId++, item: 'Verify registration form', checked: false },
        { id: itemId++, item: 'Ensure email address validation', checked: false },
        { id: itemId++, item: 'Verify password requirements', checked: false }
      );
    }

    if (hasProfile) {
      checklist.push(
        { id: itemId++, item: 'Verify user profile access', checked: false },
        { id: itemId++, item: 'Ensure data editing capability', checked: false }
      );
    }

    if (hasSearch) {
      checklist.push(
        { id: itemId++, item: 'Verify search form functionality', checked: false },
        { id: itemId++, item: 'Ensure search results accuracy', checked: false }
      );
    }

    if (hasPayment) {
      checklist.push(
        { id: itemId++, item: 'Verify checkout process', checked: false },
        { id: itemId++, item: 'Ensure card data input security', checked: false },
        { id: itemId++, item: 'Verify successful payment confirmation', checked: false }
      );
    }

    // Add generic checklist items if no specific functionality detected
    if (checklist.length === 0) {
      checklist.push(
        { id: itemId++, item: 'Verify main page loading', checked: false },
        { id: itemId++, item: 'Ensure correct interface display', checked: false },
        { id: itemId++, item: 'Verify main navigation functionality', checked: false },
        { id: itemId++, item: 'Ensure responsive design', checked: false },
        { id: itemId++, item: 'Verify page loading times', checked: false },
        { id: itemId++, item: 'Ensure no JavaScript errors', checked: false }
      );
    }

    return {
      type: 'checklist',
      data: checklist
    };
  }
}

serve(app.fetch);