#!/bin/bash
# Additional setup script

echo "🎯 MyKids Tracker - Additional Setup"

# Check Node.js version
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js detected: $node_version"
else
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional packages if needed
echo "🔧 Installing required packages..."
npm install lucide-react

# Check Tailwind
if [ ! -f "tailwind.config.js" ]; then
    echo "🎨 Setting up Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    
    echo "⚠️  Please configure tailwind.config.js with the following content:"
    echo "
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"
fi

echo "🚀 Setup complete! Run 'npm start' to begin development."
