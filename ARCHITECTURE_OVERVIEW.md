# Application Architecture Overview — TV Spatial Navigation Platform

This document describes the structure, navigation logic, and architectural patterns used in this React application, designed specifically for TV-style spatial navigation.

---

## 📂 Directory Structure

### `src/App.tsx` (Root Component)
The central point of the application. It:
- Maintains the global state for the current page (`currentPage`).
- Manages overlays (`livePage`, `watchPage`, `showDeputiesGrid`) that render on top of the main layout without unmounting it.
- Configures the `useFocusNavigation` hook with current page data (rail lengths, hero lengths, item IDs).

### `src/hooks/`
- **`useFocusNavigation.ts`**: The core spatial navigation engine. It manages a global `window.addEventListener('keydown')` listener that tracks focus state across regions (Sidebar, Main), zones (Hero, Rails, MySpace), and item indices.
- **`useCamaraAPI.ts`**: Handles data fetching and normalization for the Câmara dos Deputados services, utilizing `mapAPIToDeputy` for consistent data structures.
- **`usePlenarioVoting.ts`**: Manages real-time voting sessions, including API polling, user vote state, and interaction phases (intro, question, results).

### `src/pages/`
Each directory represents a top-level view or an overlay screen:
- **`Home/`**: The main landing page with hero banners and content rails.
- **`Camara/`**: Specialized service view for legislative content, including the `DeputiesGrid` overlay.
- **`Apps/`**: A "Grid of Apps" style page for secondary services.
- **`Live/` & `Watch/`**: Full-screen media playback overlays.

### `src/components/`
Atomic and molecular UI components that respond to focus:
- **`Sidebar/`**: Persistent navigation bar with expandable states.
- **`CircleButton/`**: Round buttons used for people/channels, supporting high-contrast focus states.
- **`ContentRail/`**: Horizontal scrolling lists of items.
- **`HeroBanner/`**: Large featured content section at the top of pages.
- **`VideoPlayer/`**: HLS-integrated media player with specialized `muted` state handling and a capture-phase unmute fallback for browser policy compatibility.

### `src/styles/`
- **`colors.ts` & `typography.ts`**: Centralized design tokens for colors (including semantic tokens like `feedback`, `surface`, and `muted`) and typography.
- **`tokens.css`**: CSS variables for global themes.

---

## 🕹️ Navigation Architecture

### 1. Spatial Navigation Model
The app uses a 2D coordinate system for focus:
- **`region`**: `sidebar` | `main`
- **`mainZone`**: `hero` | `rail-0` | `rail-1` | ... | `my-space`
- **`mainItemIndex`**: Horizontal position within a zone.

### 2. Dual-Layer Keyboard Handling
The navigation system is designed to prevent event conflicts:
- **Global Layer**: `useFocusNavigation` handles basic directional moves (Arrows) and default actions (Enter). It uses a `event.defaultPrevented` guard.
- **Local Layer**: Pages or components (e.g., `DeputiesGrid`) can register their own `onKeyDown` handlers. If they call `e.preventDefault()`, the global listener ignores the event, allowing the component to manage its own internal logic (like grid navigation).

### 3. Overlay Architecture (Non-Unmounting)
Overlays like `WatchPage` and `LivePlayer` do not replace the entire app tree. Instead:
- The main layout is kept in the DOM but hidden via `display: none` when an overlay is active.
- This prevents Sidebar and Main Page components from unmounting and remounting, which preserves state and avoids "reinitialization" flickering.

### 4. Instant Interaction & Unified Rails
- **Instant Channel Switching**: In the `LivePlayer`'s multi-channel mode, navigating with `←→` immediately updates the active stream, providing a snappy TV-like experience.
- **Unified Rails**: Specialized navigation patterns like the "Unified Rail" in `singleChannel` mode combine exit actions and EPG cards in a single horizontal row (`[Sair] [EPG cards...]`).

---

## 🧬 Data Flow
- **`src/data/`**: Contains static mock data (`home.ts`, `channels.ts`) used to bootstrap the UI.
- **Hooks**: Components use hooks like `useCamaraAPI` to fetch dynamic data from external sources, which is then mapped into standard component props like `ContentRailItem`.

---

## 🏗️ UX Patterns

### 1. Loading States (Shimmer)
The application uses skeleton/shimmer patterns (e.g., `ContentSkeleton` in `DeputyDetail`) to provide immediate visual feedback while background API requests are in flight, ensuring a smooth transition once data arrives.

### 2. Data Normalization
A consistent pattern of using mapping functions (like `mapAPIToDeputy`) ensures that complex or redundant API responses are transformed into clean, UI-ready interfaces that components can rely on.

---

## 🎨 Design System
The UI follows a strict TV-oriented design system:
- High contrast focus indicators (outline/scale transforms).
- Large typography for readability from 10 feet away.
- Fixed aspect ratio components (16:9 thumbnails, 1:1 circle buttons).
