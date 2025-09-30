# Q.AI

AI-powered platform for generating test cases, checklists, and documentation analysis from technical requirements.

## 🚀 Features

- **AI-Powered Analysis**: Support for multiple AI models (Grok-3, GPT-4, DeepSeek, Qwen)
- **Multiple Output Types**: Test cases, checklists, documentation analysis
- **Role-Based Analysis**: Analyst, Developer, Manager, and Tester perspectives
- **Export Options**: PDF, Excel, Google Sheets
- **Project Management**: Save and organize your analysis sessions
- **Real-time Processing**: Fast AI-powered content generation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **Database**: Supabase
- **AI Models**: Grok-3, GPT-4, DeepSeek, Qwen
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- AI API keys (Nebius)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd q-ai-generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# AI API Keys
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Google Sheets API
VITE_GOOGLE_SHEETS_API_KEY=

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_AI_MODEL=deepseek
VITE_MAX_FILE_SIZE=10485760
```

### 4. Run development server
```bash
npm run dev
```

## 🚀 Deployment on Vercel

### 1. Connect to Vercel
- Import your GitHub repository to Vercel
- Vercel will automatically detect the Vite framework

### 2. Environment Variables
Add the following environment variables in Vercel dashboard:

- `VITE_OPENROUTER_API_KEY`
- `VITE_DEEPSEEK_API_KEY` 
- `VITE_GOOGLE_SHEETS_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_MODEL`

### 3. Deploy
Vercel will automatically deploy on every push to main branch.

## 📁 Project Structure

```
├── components/          # React components
│   ├── ui/             # UI components (Radix UI)
│   └── ...             # Feature components
├── utils/              # Utility functions
│   ├── ai-service.ts   # AI API integration
│   ├── config.ts       # Configuration
│   └── ...             # Other utilities
├── prompts/            # AI prompts for different roles
├── supabase/           # Supabase functions and migrations
└── styles/             # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤖 AI Models

The application supports multiple AI models via [Nebius](https://studio.nebius.com "Nebius Studio")

- **Grok-3** - Advanced reasoning
- **GPT-4** - High-quality analysis
- **DeepSeek** - Fast and efficient
- **DeepSeek Reasoner** - Advanced reasoning capabilities
- **Qwen** - Free alternative

## 📊 Output Types

1. **Test Cases** - Structured test scenarios with steps and expected results
2. **Checklists** - Verification lists for different testing phases
3. **Documentation Analysis** - Requirements analysis and structuring
4. **Developer Analysis** - Technical implementation insights
5. **Manager Analysis** - Project planning and resource estimation
6. **Structured Testing** - Comprehensive testing strategy

## 📝 License

MIT License - see LICENSE file for details

