# Enterprise React 19 Boilerplate

A production-ready, enterprise-grade React 19 boilerplate with comprehensive features for building scalable applications.

## 🚀 Features

### Core Stack

- ⚛️ **React 19** with TypeScript (strict mode)
- ⚡ **Vite 7** with React Compiler for optimizations
- 📦 **pnpm** for fast, efficient package management

### UI & Styling

- 🎨 **MUI v7** - Material Design component library
- 💅 **Emotion** - CSS-in-JS with RTL support
- 🌍 **RTL Support** - Automatic layout flipping for Arabic/Hebrew
- 🎭 **Dark/Light Mode** - Theme switching with persistence

### Routing & Data Fetching

- 🛣️ **TanStack Router** - Type-safe routing with nested routes
- 🔄 **TanStack Query v5** - Server state management with caching
- 📡 **Axios** - HTTP client with interceptors
- 🔌 **Devtools** - React Query & Router devtools included

### State Management

- 🐻 **Zustand** - Lightweight state management
- 💾 **Persisted State** - Auto-save to localStorage
- 🔐 **Auth Store** - Centralized authentication state
- ⚙️ **Preferences Store** - Theme, locale, and direction

### Security & Access Control

- 🔒 **RBAC System** - Role-Based Access Control
- 🎫 **Permission System** - Granular permission checks
- 🛡️ **Route Guards** - Automatic route protection
- 🚫 **Component Guards** - Conditional UI rendering

### Internationalization

- 🌐 **react-i18next** - i18n with namespace support
- 🗣️ **Multi-language** - English & Arabic included
- 🔄 **Auto RTL** - Automatic direction switching
- 📝 **Type-safe translations** - Full TypeScript support

### Performance

- ⚡ **Code Splitting** - Route-based lazy loading
- 📦 **Bundle Optimization** - 600 KB main bundle (188 KB gzipped)
- 🎯 **Tree Shaking** - Unused code elimination
- 🚀 **React Compiler** - Automatic optimizations

### Progressive Web App

- 📱 **Installable** - Add to home screen on mobile/desktop
- 🔌 **Offline Support** - Works without network connection
- 🔄 **Auto Updates** - Seamless background updates with prompts

### Code Quality

- ✅ **ESLint 9** - Flat config with comprehensive rules
- 🎨 **Prettier** - Code formatting
- 📘 **TypeScript** - Strict mode enabled
- 🔍 **Import Sorting** - Organized imports

### Developer Experience

- 🛠️ **Feature Generator CLI** - Scaffold features instantly
- 📚 **Comprehensive Docs** - Detailed guides for everything
- 🔥 **Hot Module Replacement** - Fast refresh
- 🐛 **DevTools** - Query and Router debugging

## 📁 Project Structure

```
src/
├── app/                          # App shell & configuration
│   ├── providers/                # React providers
│   │   └── ThemeProvider.tsx     # Theme + RTL + Emotion cache
│   ├── router/                   # Router configuration
│   │   ├── index.ts              # Main router & public routes
│   │   ├── layouts.ts            # Layout route definitions
│   │   ├── appRoutes.ts          # Protected routes collection
│   │   └── routeGuard.ts         # RBAC protection logic
│   └── index.tsx                 # App entry point
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   ├── dashboard/                # Dashboard feature
│   ├── admin/                    # Admin feature
│   ├── users/                    # User management
│   └── forbidden/                # 403 page
├── shared/                       # Shared resources
│   ├── components/
│   │   ├── layouts/              # Layout components
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── ThemeToggle.tsx   # Dark/Light/System toggle
│   │   │   ├── LocaleSwitcher.tsx# Language switcher
│   │   │   ├── PWAInstallPrompt.tsx
│   │   │   ├── PWAUpdatePrompt.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   └── NetworkStatus.tsx # Offline indicator
│   │   └── NotFound.tsx          # 404 page
│   └── hooks/                    # Custom React hooks
│       ├── useSystemTheme.ts     # OS theme detection
│       ├── useSSE.ts             # Server-Sent Events
│       ├── useNetworkStatus.ts   # Online/offline status
│       └── useAppNavigate.ts     # Type-safe navigation
├── stores/                       # Zustand stores
│   ├── authStore.ts              # Authentication state
│   ├── preferencesStore.ts       # Theme, locale, direction
│   └── notificationStore.ts      # Notification state
├── lib/                          # Core infrastructure
│   ├── theme/                    # MUI theme system
│   │   ├── index.ts              # Theme factory
│   │   ├── createEmotionCache.ts # RTL/LTR cache
│   │   ├── palette.ts            # Light/dark palettes
│   │   ├── typography.ts         # Direction-aware fonts
│   │   └── components.ts         # Component overrides
│   ├── i18n/                     # Internationalization
│   │   ├── config.ts             # i18next setup
│   │   ├── languageConfig.ts     # Language metadata & RTL
│   │   ├── useI18nFormat.ts      # Number/date formatting
│   │   └── locales/              # Translation files (en, ar)
│   ├── rbac/                     # RBAC system
│   │   ├── types.ts              # Role & permission types
│   │   ├── guards.ts             # Access control logic
│   │   └── components.tsx        # RBAC UI components
│   └── api/                      # API layer
│       ├── client.ts             # Axios instance
│       ├── query-client.ts       # TanStack Query config
│       ├── query-keys.ts         # Query key factory
│       ├── queries/              # Query hooks
│       └── mutations/            # Mutation hooks
├── config/                       # Global configuration
│   └── constants.ts              # App constants
├── sw.ts                         # Service Worker (PWA)
└── main.tsx                      # React entry point
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Generate new feature
pnpm generate:feature
```

### Development Server

```bash
pnpm dev
```

Server runs at `http://localhost:5173` (exposed on network with `--host`)

### Test Credentials

- **Regular User**: `user@example.com` (any password)
  - Access: Dashboard only
- **Admin User**: `admin@example.com` (any password)
  - Access: Dashboard + Admin panel
  - All permissions

## 📖 Documentation

### Core Guides

- [Walkthrough](./docs/walkthrough.md) - Complete overview
- [Implementation Plan](./docs/implementation_plan.md) - Architecture details
- [Routing & I18n Guide](./docs/ROUTING_AND_I18N.md) - Routing utilities & patterns

### Feature Guides

- [Route Factory](./docs/route-factory-guide.md) - Declarative routing
- [Feature Generator](./docs/feature-generator.md) - CLI tool usage
- [Code Splitting](./docs/code-splitting.md) - Performance optimization
- [RTL, i18n & Theme Guide](./docs/rtl-i18n-theme-guide.md) - RTL support, theming, and i18n deep dive

## 🎯 Key Features Explained

### 1. RBAC System

**Route-level protection:**

```typescript
{
  path: '/admin',
  component: AdminPage,
  roles: ['ADMIN'],
  permissions: ['manage:users'],
}
```

**Component-level protection:**

```tsx
<IfAllowed roles={["ADMIN"]} permissions={["manage:users"]}>
  <AdminButton />
</IfAllowed>
```

### 2. Declarative Routing

Define routes in feature modules:

```typescript
const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "dashboard",
  component: lazyRouteComponent(() =>
    import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
  ),
  beforeLoad: () => RouteGuard({ roles: ["USER", "ADMIN"] }),
});
```

### 3. Feature Generator

Scaffold complete features instantly:

```bash
pnpm generate:feature
```

Generates:

- ✅ Folder structure
- ✅ Page component
- ✅ Route configuration
- ✅ RBAC integration
- ✅ Lazy loading

### 4. Internationalization & RTL Support

The i18n system is deeply integrated with RTL and theming:

```typescript
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '@/stores/preferencesStore';

const { t } = useTranslation();
const { locale, direction, setLocale, setDirection } = usePreferencesStore();

// Use translations
<Typography>{t('common.welcome')}</Typography>

// Switch locale (direction is updated automatically for RTL languages)
setLocale('ar'); // Automatically sets direction to 'rtl'
setLocale('en'); // Automatically sets direction to 'ltr'
```

**RTL Features:**

- 🔄 **Automatic layout flipping** - Emotion cache with `@mui/stylis-plugin-rtl`
- 🧹 **Memory-safe cache management** - Old caches are flushed on direction change
- 🎯 **Per-direction style injection** - Separate cache keys for RTL/LTR

**LocaleSwitcher Component:**
Use the built-in `LocaleSwitcher` component in your layout for easy language switching.

### 5. Code Splitting

All routes are lazy-loaded:

```typescript
const DashboardPage = lazyRouteComponent(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
```

**Result:** 13 KB smaller initial bundle

### 6. Centralized API

All queries and mutations in one place:

```typescript
// Use anywhere
const { data } = useDashboardStats();
const loginMutation = useLogin();
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Path Aliases

Configured in `tsconfig.app.json` and `vite.config.ts`:

```typescript
import { Component } from "@/shared/components";
import { useAuthStore } from "@/stores/authStore";
```

### Theme Customization

The theming system supports **Light**, **Dark**, and **System** modes with automatic OS preference detection:

```typescript
import { usePreferencesStore } from "@/stores/preferencesStore";

const { themeMode, setThemeMode, toggleTheme } = usePreferencesStore();

// Set theme mode
setThemeMode("light"); // Force light mode
setThemeMode("dark"); // Force dark mode
setThemeMode("system"); // Follow OS preference (default)

// Toggle between light/dark
toggleTheme();
```

**Theme Modes:**
| Mode | Behavior |
|------|----------|
| `light` | Always light theme |
| `dark` | Always dark theme |
| `system` | Reactively follows OS color scheme preference |

**Customize Palettes:**

Edit `src/lib/theme/palette.ts`:

```typescript
export const lightPalette = {
  mode: "light" as const,
  primary: { main: "#1976d2" },
  secondary: { main: "#9c27b0" },
  // ... more colors
};

export const darkPalette = {
  mode: "dark" as const,
  primary: { main: "#90caf9" },
  secondary: { main: "#ce93d8" },
  // ... more colors
};
```

**Memory-Safe Emotion Cache:**

The `ThemeProvider` uses a module-level cache manager that properly flushes old caches on direction changes, preventing memory leaks:

```typescript
// Old cache is flushed before creating new one
if (currentCache) {
  currentCache.sheet.flush();
}
currentCache = createEmotionCache(direction);
```

## 📦 Bundle Size

### Production Build

```
Main bundle:      600 KB (188 KB gzipped)
AdminPage:        1.2 KB (lazy loaded)
DashboardPage:   14.1 KB (lazy loaded)
```

### Optimization Tips

1. **Code splitting** - Already implemented ✅
2. **Tree shaking** - Automatic with Vite ✅
3. **Vendor chunks** - See `docs/code-splitting.md`
4. **Image optimization** - Use WebP format
5. **Font subsetting** - Load only needed characters

## 🛠️ Adding Features

### Using CLI (Recommended)

```bash
pnpm generate:feature
```

Follow prompts to create a complete feature with:

- Folder structure
- Page component
- Route configuration
- RBAC setup

### Manual Creation

1. Create feature folder: `src/features/my-feature/`
2. Add page component
3. Update `routes.config.ts`
4. Add translations

## 🔐 RBAC Configuration

### Available Roles

- `GUEST` - Unauthenticated users
- `USER` - Regular users
- `MANAGER` - Managers
- `ADMIN` - Administrators

### Available Permissions

- `view:dashboard`
- `view:admin`
- `manage:users`
- `manage:settings`

### Adding New Permissions

Edit `src/lib/rbac/types.ts`:

```typescript
export type Permission = "view:dashboard" | "my:new:permission"; // Add here
```

## 🌍 Internationalization & Theme System

> 📚 **For a comprehensive deep-dive**, see the [RTL, i18n & Theme Guide](./docs/rtl-i18n-theme-guide.md) which covers architecture, troubleshooting, and advanced patterns.

### Adding Languages

1. **Create translation file:** `src/lib/i18n/locales/fr.json`
2. **Add to i18n config:**

```typescript
// src/lib/i18n/config.ts
import frCommon from "./locales/fr.json";

export const resources = {
  en: { common: enCommon },
  ar: { common: arCommon },
  fr: { common: frCommon }, // Add new language
};
```

3. **Update LocaleSwitcher** to include the new language option

### Translation Files

Translation files use namespaces (default: `common`):

```json
{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading..."
  },
  "dashboard": {
    "title": "Dashboard"
  }
}
```

### Usage

```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

t("common.welcome"); // "Welcome"
t("dashboard.title"); // "Dashboard"
```

### RTL Languages

RTL languages (Arabic, Hebrew, etc.) are automatically detected. When switching to an RTL language:

1. Document `dir` attribute is updated
2. Emotion cache is refreshed with RTL stylis plugin
3. MUI components automatically flip layout
4. Old cache is flushed to prevent memory leaks

### Theme Toggle Component

Use the built-in theme toggle in your layout:

```tsx
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";

// In your AppBar
<ThemeToggle />;
```

### System Theme Detection

The `useResolvedTheme` hook reactively listens to OS color scheme changes:

```typescript
import { useResolvedTheme } from "@/shared/hooks/useSystemTheme";

const resolvedMode = useResolvedTheme("system"); // Returns 'light' or 'dark'
```

## 🧪 Testing

### Type Checking

```bash
pnpm tsc --noEmit
```

### Linting

```bash
pnpm lint
```

### Build Verification

```bash
pnpm build
```

## 📊 DevTools

### React Query Devtools

- Press floating button to open
- View queries, mutations, cache
- Debug refetch behavior

### TanStack Router Devtools

- View route tree
- Inspect route params
- Debug navigation

## 🚀 Deployment

### Build

```bash
pnpm build
```

Output in `dist/` folder.

### Preview

```bash
pnpm preview
```

### Deploy to Vercel/Netlify

1. Connect repository
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables

## 🎨 Customization

### Branding

1. Update `src/config/constants.ts`
2. Change theme colors in `ThemeProvider.tsx`
3. Replace logo/favicon in `public/`

### Layout

Edit layouts in `src/shared/components/layouts/`:

- `PublicLayout.tsx` - Unauthenticated pages
- `AppLayout.tsx` - Authenticated pages

## 📚 Learning Resources

### Documentation

- [React 19 Docs](https://react.dev)
- [MUI Documentation](https://mui.com)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

### Guides in This Project

- Route Factory Guide
- Feature Generator Guide
- Code Splitting Guide
- Walkthrough Document

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run linter: `pnpm lint`
4. Test build: `pnpm build`
5. Submit PR

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:

- React Team - React 19
- Vercel - Vite
- TanStack - Router & Query
- MUI Team - Material UI
- Zustand Team - State management

---

**Ready to build something amazing?** 🚀

```bash
pnpm dev
```
