# Kitchen Inventory Tracker

A responsive web application designed to help users manage their kitchen inventory and generate shopping lists efficiently. Built with Next.js 14, TypeScript, and modern web technologies.

## Features

- **Inventory Management**: Track items with detailed information including expiration dates, locations, and quantities
- **Smart Shopping Lists**: Automatically generate shopping lists from low stock items
- **Offline Functionality**: PWA capabilities for offline usage
- **Responsive Design**: Optimized for both mobile and desktop devices
- **Smart Insights**: Get insights about expiring items and usage patterns

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: IndexedDB with Dexie.js
- **PWA**: Service Worker for offline functionality

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── inventory/         # Inventory management pages
│   ├── shopping/          # Shopping list pages
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── lists/            # List components
│   └── layout/           # Layout components
├── stores/               # Zustand stores
├── lib/                  # Utilities and configurations
│   ├── db/              # IndexedDB operations
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript type definitions
├── hooks/               # Custom React hooks
└── styles/              # Global styles and Tailwind config
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## Dependencies

### Core Dependencies
- `next` - React framework with App Router
- `react` & `react-dom` - React library
- `typescript` - Type safety
- `framer-motion` - Animations and transitions
- `zustand` - State management
- `dexie` - IndexedDB wrapper

### Development Dependencies
- `tailwindcss` - Utility-first CSS framework
- `eslint` - Code linting
- `@types/*` - TypeScript type definitions

## Documentation

### User Documentation
- **[User Guide](USER_GUIDE.md)** - Complete guide for using the application
- **[Accessibility](ACCESSIBILITY.md)** - Accessibility features and compliance

### Developer Documentation
- **[Testing Guide](TESTING.md)** - Testing strategy and guidelines
- **[Performance](PERFORMANCE.md)** - Performance optimization details

### Specifications
This project follows the spec-driven development methodology. See the `.kiro/specs/kitchen-inventory-tracker/` directory for:
- `requirements.md` - Feature requirements and acceptance criteria
- `design.md` - Technical design and architecture
- `tasks.md` - Implementation plan and task breakdown

## Accessibility

The Kitchen Inventory Tracker is designed to be accessible to all users:
- ✅ WCAG 2.1 Level AA compliant
- ✅ Full keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast ratios
- ✅ Touch-friendly controls (44px minimum)
- ✅ Reduced motion support

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for detailed compliance information.

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is private and not licensed for public use.
