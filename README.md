# CAC-live Match Analytics

A high-performance, real-time football match analytics dashboard built with React and Vite, powered by Supabase.

## 🚀 Key Features
- **Real-time Stats**: Live possession, shot maps, and win probability.
- **Advanced Metrics**: Expected Threat (xT), Field Tilt %, and Passing Accuracy.
- **Team Lineups**: Dynamic roster displays fetched from Supabase.
- **Minimalist UI**: Technical terminal-style aesthetic with ultra-small high-density data views.
- **Secure**: Modern configuration management using environment variables.

## 🛠 Tech Stack
- **Frontend**: React, Vite
- **Backend**: Supabase (PostgreSQL, Realtime)
- **Styling**: Vanilla CSS (Custom Terminal Design System)
- **Testing**: Vitest

## 📦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Development
```bash
npm run dev
```

### 4. Build
```bash
npm run build
```

## 🧪 Testing
Run the automated test suite to verify calculation logic:
```bash
npm run test
```

---
*Created by PP33 // Refactored by Antigravity*
