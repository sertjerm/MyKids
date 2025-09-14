# 🎯 MyKids Behavior Tracker

A modern family behavior tracking system that helps parents motivate children through positive reinforcement and reward systems.

## ✨ Features

### 🏠 **Family-Based System**
- Multi-family support with individual family accounts
- Family-specific behaviors and rewards
- Admin dashboard for parents

### 👶 **Child-Friendly Interface**  
- Colorful, intuitive design for children
- Emoji avatars and visual feedback
- Real-time point tracking

### ⭐ **Smart Behavior System**
- Good behaviors (earn points) vs Bad behaviors (lose points)
- Repeatable vs one-time behaviors
- Daily limits and validation

### 🎁 **Reward Redemption**
- Point-based reward system
- Instant validation of available points
- Custom rewards per family

### 📊 **Analytics & Reports**
- Family statistics dashboard
- Individual child progress tracking
- Activity history and trends

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Modern web browser

### Installation
```bash
# Install dependencies
npm install

# Install required packages (if not already installed)
npm install lucide-react

# Configure Tailwind CSS (if not already configured)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm start
```

### Demo Login
The app includes demo families for testing:
- **ครอบครัวสมิท** - smith.family@example.com
- **ครอบครัวจอห์นสัน** - johnson.family@example.com  
- **ครอบครัวทดสอบ** - test.family@example.com

## 🎮 How to Use

### 👨‍👩‍👧‍👦 **For Parents (Admin)**
1. **Login** - Select your family from the login screen
2. **Dashboard** - View family overview and statistics
3. **Manage Children** - Add/edit child profiles
4. **Behaviors** - Configure good/bad behaviors with points
5. **Rewards** - Set up rewards with point costs
6. **Reports** - Track family progress and statistics

### 👶 **For Children**
1. **Select Child** - Parent selects "เข้าใช้งาน" for specific child
2. **Record Behaviors** - Tap on behaviors completed today
3. **Redeem Rewards** - Use earned points for rewards
4. **Track Progress** - See real-time point updates

## 🏗️ Project Structure

```
src/
├── components/           # UI Components
│   ├── LoginPage.jsx    # Family login
│   ├── Avatar.jsx       # Profile pictures
│   └── index.js         # Component exports
├── services/            # API Layer
│   └── api.js          # Main API interface
├── data/               # Mock Data
│   └── mockData.js     # Database simulation
└── App.jsx             # Main application
```

## 🔧 API Configuration

The system supports both mock data and real API backends:

```javascript
import api from './services/api';

// Use mock data (default)
api.setApiMode(true);

// Switch to real API
api.setApiMode(false);
api.setApiBaseUrl('https://your-api-url.com/v1');
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradients for main actions
- **Good Behaviors**: Green tones for positive actions
- **Bad Behaviors**: Red tones for negative actions  
- **Rewards**: Purple/pink for special items
- **Background**: Soft pastel gradients

## 📱 Responsive Design

The application works seamlessly across:
- **Desktop**: Full dashboard experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Child-friendly mobile interface

## 🤝 Contributing

### Development Setup
```bash
# Fork the repository
# Clone your fork
git clone https://github.com/yourusername/mykids-tracker.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git commit -m "Add new feature"

# Push and create pull request
git push origin feature/new-feature
```

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for families who want to nurture positive behavior in children**

</div>
