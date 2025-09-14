#!/bin/bash

# =============================================================================
# MyKids Tracker - Quick Fix Script for Styling Issues
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 MyKids Tracker - Quick Fix for Styling Issues${NC}\n"

# Step 1: Check if Tailwind is installed
echo -e "${YELLOW}Step 1: Checking Tailwind CSS...${NC}"
if npm list tailwindcss >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Tailwind CSS is installed${NC}"
else
    echo -e "${RED}❌ Tailwind CSS not found. Installing...${NC}"
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
fi

# Step 2: Check and create tailwind.config.js
echo -e "\n${YELLOW}Step 2: Configuring Tailwind...${NC}"
if [ ! -f "tailwind.config.js" ]; then
    echo -e "${RED}❌ tailwind.config.js not found. Creating...${NC}"
    npx tailwindcss init -p
fi

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'kids-pink': {
          50: '#fef7ff',
          100: '#feeffe', 
          200: '#fce7fd',
          300: '#f9d0fa',
          400: '#f4a8f4',
          500: '#ec7fed',
          600: '#d946ef',
          700: '#c026d3',
          800: '#a21caf',
          900: '#86198f'
        },
        'kids-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff', 
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        }
      },
      fontFamily: {
        'thai': ['Sarabun', 'Kanit', 'sans-serif']
      },
      animation: {
        'bounce-soft': 'bounce 1s ease-in-out 2',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
EOF

echo -e "${GREEN}✅ tailwind.config.js updated${NC}"

# Step 3: Update src/index.css
echo -e "\n${YELLOW}Step 3: Updating CSS file...${NC}"
cat > src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Kanit:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Sarabun', 'Kanit', system-ui, sans-serif;
  }
  
  body {
    margin: 0;
    font-family: 'Sarabun', 'Kanit', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%);
    min-height: 100vh;
  }
}

@layer components {
  .gradient-background {
    background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 25%, #e0e7ff 50%, #ddd6fe 75%, #f3e8ff 100%);
  }
  
  .card-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .card-shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .behavior-card-good {
    @apply bg-gradient-to-br from-green-50 to-emerald-50 border-green-200;
  }
  
  .behavior-card-bad {
    @apply bg-gradient-to-br from-red-50 to-pink-50 border-red-200;
  }
  
  .reward-card {
    @apply bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}
EOF

echo -e "${GREEN}✅ src/index.css updated${NC}"

# Step 4: Check if lucide-react is installed
echo -e "\n${YELLOW}Step 4: Checking lucide-react...${NC}"
if npm list lucide-react >/dev/null 2>&1; then
    echo -e "${GREEN}✅ lucide-react is installed${NC}"
else
    echo -e "${RED}❌ lucide-react not found. Installing...${NC}"
    npm install lucide-react
fi

# Step 5: Clear cache and restart
echo -e "\n${YELLOW}Step 5: Clearing cache...${NC}"
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo -e "${GREEN}✅ Cache cleared${NC}"
fi

# Step 6: Build Tailwind (if needed)
echo -e "\n${YELLOW}Step 6: Building Tailwind CSS...${NC}"
if command -v npx >/dev/null 2>&1; then
    npx tailwindcss -i ./src/index.css -o ./src/output.css --watch &
    TAILWIND_PID=$!
    sleep 2
    kill $TAILWIND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Tailwind CSS built${NC}"
fi

echo -e "\n${GREEN}🎉 Quick Fix Complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Restart your development server: npm start"
echo "2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "3. Check if styles are now working"

echo -e "\n${YELLOW}If issues persist:${NC}"
echo "1. Make sure src/index.js imports './index.css'"
echo "2. Check browser console for errors"
echo "3. Try hard refresh (Ctrl+F5)"

echo -e "\n${GREEN}Happy coding! 🎯${NC}"
EOF

chmod +x quick-fix.sh
success "Quick fix script created successfully!"