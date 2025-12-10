# Mastra Insight Assistant - Frontend

A beautiful, distinctive frontend for the Mastra Insight Assistant built with Next.js, Framer Motion, and Tailwind CSS.

## Design Philosophy

This frontend avoids generic "AI slop" aesthetics with:

- **Unique Typography**: Sora (display), DM Sans (body), JetBrains Mono (code)
- **Distinctive Color Palette**: Dark theme with vibrant teal, purple, and pink accents
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **Atmospheric Backgrounds**: Layered gradients and geometric patterns
- **Creative Layouts**: Unexpected but functional design choices

## Features

- 🎨 Distinctive dark theme with vibrant accents
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 🚀 Fast and optimized
- 🎯 Intuitive user experience

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Landing page
│   ├── onboard/
│   │   └── page.tsx          # Onboarding flow
│   └── insights/
│       └── [projectId]/
│           └── page.tsx      # Insights visualization
├── lib/
│   └── api.ts                # API client
└── app/
    └── globals.css           # Global styles and theme
```

## Design System

### Colors
- **Primary**: Teal/Cyan (#00d9ff)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Pink (#ec4899)
- **Background**: Deep black (#0a0a0f)

### Typography
- **Display**: Sora (headings)
- **Body**: DM Sans (content)
- **Mono**: JetBrains Mono (code/data)

### Animations
- Staggered reveals on page load
- Smooth transitions
- Hover effects
- Loading states

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`. Make sure the backend is running before using the frontend.

## License

MIT

