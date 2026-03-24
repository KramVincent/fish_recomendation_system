# Fish Dietary Recommendation System - Frontend

A Vue 3 frontend application for an AI-powered dietary recommendation system focused on fish consumption for individuals with chronic illnesses.

## 🚀 Features

- **Fish Species Identification**: Upload images to identify fish species using AI
- **Personalized Recommendations**: Get tailored dietary advice based on health profile
- **Health Profile Management**: Track health conditions, medications, and dietary preferences
- **Dark Mode Support**: Full dark mode with system preference detection
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Type-Safe**: Built with TypeScript for better development experience

## 🛠️ Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Type safety and better IDE support
- **Pinia** - State management with persistence
- **Vue Router** - Client-side routing with guards
- **Tailwind CSS** - Utility-first styling with custom design system
- **Vite** - Fast build tool and dev server

## 📦 Project Structure

```
src/
├── api/
│   ├── mock/           # Mock data for development
│   └── types/          # TypeScript interfaces
├── assets/
├── components/
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── composables/        # Vue composables
├── pages/              # Page/view components
├── router/             # Vue Router configuration
├── stores/             # Pinia stores
├── styles/             # Global styles
└── main.ts             # App entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Green (#2A6B4E) - Healthcare and wellness
- **Safe**: Green (#10B981) - Safe fish recommendations
- **Moderate**: Orange (#F59E0B) - Consume with caution
- **Avoid**: Red (#EF4444) - Fish to avoid

### Components
- BaseButton, BaseInput, BaseCard, BaseModal, BaseTable, BaseBadge
- ImageUploader, FishResultCard, HealthConditionSelector, RecommendationPanel
- AppHeader, AppFooter, Breadcrumb, NotificationContainer

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Accounts

The application includes demo accounts for testing:

- **User Account**: maria@example.com / password123
- **Dietitian Account**: dr.reyes@example.com / password123

Or use the quick demo login buttons on the login page.

## 🗺️ Routes

- `/` - Redirects to dashboard
- `/login` - Login page
- `/dashboard` - Main dashboard with statistics
- `/identify` - Fish identification page
- `/recommendations` - Personalized recommendations
- `/health-profile` - Health profile management

## 📱 Features in Detail

### Fish Identification
- Drag-and-drop or click to upload
- Image preview with progress indicator
- AI-powered species detection (mock data for now)
- Confidence scores for predictions

### Recommendations
- Categorized by safety level (Safe, Moderate, Avoid)
- Serving size and frequency guidelines
- Preparation tips and warnings
- Alternative fish suggestions
- PDF report generation (coming soon)

### Health Profile
- Multi-select health conditions
- Dietary preferences selection
- Personal information (age, weight)
- Allergies and medications tracking

### Dashboard
- Quick statistics overview
- Recent activity timeline
- Health conditions summary
- Quick action cards

## 🎯 State Management

The app uses Pinia stores for state management:

- **authStore**: User authentication and session
- **themeStore**: Dark/light mode with persistence
- **notificationStore**: Toast notifications
- **healthStore**: Health profile data
- **recommendationStore**: Fish recommendations
- **uploadStore**: Upload history and processing
- **fishStore**: Fish species database

## 🌙 Theme System

- Light and dark modes
- System preference detection
- Persistent user choice
- Smooth transitions

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliant (WCAG 2.1 AA)

## 🔮 Future Enhancements

- Backend integration (Supabase)
- Roboflow API integration for real fish detection
- PDF report generation
- Multi-language support (i18n)
- PWA capabilities
- Push notifications
- Social sharing
- Advanced analytics dashboard

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

## 🤝 Contributing

This is a demo project, but feel free to fork and customize for your needs!

---

**Note**: This is a frontend-only application with mock data. Backend integration is planned for future releases.
