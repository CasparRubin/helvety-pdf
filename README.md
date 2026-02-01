# Helvety PDF

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)

## Demo

![Demo](./public/screencapture/demo.gif)

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Dark Mode</strong></td>
    <td align="center"><strong>Light Mode</strong></td>
    <td align="center"><strong>Dark Mode - Editor</strong></td>
    <td align="center"><strong>Light Mode - Editor</strong></td>
    <td align="center"><strong>Mobile - Editor</strong></td>
  </tr>
  <tr>
    <td><img src="./public/screenshots/Dark%20mode.png" alt="Desktop upload interface in dark mode" width="200"/></td>
    <td><img src="./public/screenshots/Light%20mode.png" alt="Desktop upload interface in light mode" width="200"/></td>
    <td><img src="./public/screenshots/Dark%20mode%20Functionality.png" alt="Desktop PDF editor in dark mode" width="200"/></td>
    <td><img src="./public/screenshots/Light%20mode%20Functionality.png" alt="Desktop PDF editor in light mode" width="200"/></td>
    <td><img src="./public/screenshots/Dark%20mode%20Mobile%20Functionality.png" alt="Mobile PDF editor" width="100"/></td>
  </tr>
</table>

A privacy-focused, client-side PDF toolkit. Merge, reorder, rotate, and extract pages from PDF files and images with client-side processing (hosting provider may collect connection metadata). All file processing happens entirely in your browser.

**App:** [pdf.helvety.com](https://pdf.helvety.com) | **Subscribe:** [store.helvety.com](https://store.helvety.com/products/helvety-pdf)

**Privacy First** - 100% Client-Side Processing. All file processing happens entirely in your browser. The application does not collect or transmit your file data (hosting provider may collect connection metadata - see Privacy Policy).

Helvety PDF offers a free Basic tier with essential features, and a Pro subscription for unlimited usage and advanced features like page rotation.

## Features

- **Client-side file processing** - All operations happen in your browser
- **PDF and image support** - Upload PDF files and images (PNG, JPEG, WebP, GIF, etc.)
- **Page thumbnails preview** - Visual preview of all pages before processing
- **Drag & drop reordering** - Easily rearrange pages by dragging thumbnails
- **Page rotation** - Rotate individual pages by 90° increments _(Pro)_
- **Page deletion** - Remove unwanted pages from your documents
- **Page extraction** - Extract individual pages as separate PDF files
- **Multi-file merging** - Combine multiple PDF files and images into one PDF
- **Drag & drop upload** - Intuitive file upload interface
- **Customizable grid layout** - Adjust pages per row to accommodate different page sizes
- **Dark & Light mode support** - Comfortable viewing in any lighting condition

## Pricing

Helvety PDF offers a free Basic tier and a paid Pro subscription:

| Feature                | Basic (Free) | Pro (CHF 4.95/month) |
| ---------------------- | ------------ | -------------------- |
| Files                  | Max 2 files  | Unlimited            |
| Pages                  | Max 5 pages  | Unlimited            |
| Merge files            | Yes          | Yes                  |
| Split files            | Yes          | Yes                  |
| Reorder pages          | Yes          | Yes                  |
| Delete pages           | Yes          | Yes                  |
| Extract pages          | Yes          | Yes                  |
| Rotate pages           | -            | Yes                  |
| Client-side processing | Yes          | Yes                  |

Subscribe at [store.helvety.com](https://store.helvety.com/products/helvety-pdf)

## How It Works

1. **Upload Files** - Drag and drop or click to browse and select multiple PDF files and/or images
2. **Preview & Manage** - See thumbnails of all pages, reorder by dragging, rotate, or delete pages as needed
3. **Download** - Your processed PDF downloads automatically with a timestamped filename

## Security & Authentication

This application uses centralized authentication via [auth.helvety.com](https://auth.helvety.com) with end-to-end encryption:

### Authentication Flow

Authentication is handled by the centralized Helvety Auth service (`auth.helvety.com`) using **email + passkey authentication** — no passwords required:

**New Users:**

1. Redirected to auth.helvety.com → Enter email address
2. Click magic link in email → Verify email ownership
3. Scan QR code with phone → Verify with biometrics (Face ID/fingerprint)
4. Passkey created → Verify passkey → Session established → Redirected back to PDF app
5. Setup encryption passkey (for encrypting sensitive data)

**Returning Users:**

1. Redirected to auth.helvety.com → Enter email address
2. Click magic link in email → Verify email ownership
3. Scan QR code → Verify with biometrics → Session created
4. Redirected back → Unlock encryption with passkey

Sessions are shared across all `*.helvety.com` subdomains via cookie-based SSO.

**Privacy Note:** Your email address is used solely for authentication (magic links) and account recovery. We do not share your email with third parties for marketing purposes.

### End-to-End Encryption

User data is protected with client-side encryption using the WebAuthn PRF extension:

- **Centralized Setup** - Encryption is set up once via `auth.helvety.com` after initial passkey registration
- **Passkey-derived keys** - Encryption keys are derived from your passkey using the PRF extension
- **Zero-knowledge** - The server never sees your encryption key; all encryption/decryption happens in the browser
- **Device-bound security** - Your passkey (stored on your phone) is the only way to decrypt your data
- **Cross-subdomain passkeys** - Encryption passkeys work across all Helvety apps (registered to `helvety.com` RP ID)
- **Unlock Flow** - When returning, users unlock encryption with their existing passkey

### Browser Requirements

Passkey encryption requires a modern browser with WebAuthn PRF support:

- Google Chrome 128+
- Microsoft Edge 128+
- Safari 18+
- Firefox 139+ (desktop only)

**Note:** Firefox for Android does not support the PRF extension.

## Tech Stack

This project is built with modern web technologies:

- **[Next.js 16.1.6](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.4](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (Auth & Database)
- **[SimpleWebAuthn](https://simplewebauthn.dev/)** - WebAuthn/passkey authentication
- **[pdf-lib](https://pdf-lib.js.org/)** - PDF manipulation and creation
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** - PDF rendering engine
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode support
- **[Vitest](https://vitest.dev/)** - Unit and integration testing
- **[Playwright](https://playwright.dev/)** - End-to-end testing

## Project Structure

```
helvety-pdf/
├── __tests__/              # Unit and integration tests
├── .github/
│   └── workflows/          # CI/CD workflows
│       └── test.yml        # Automated testing
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   │   ├── encryption-actions.ts # Encryption parameter management
│   │   └── subscription-actions.ts # Subscription status queries
│   ├── auth/callback/     # Session establishment callback
│   ├── globals.css        # Global styles
│   ├── icon.svg           # App icon
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main page (redirects to auth if unauthenticated)
│   ├── page-client.tsx    # Client-side page component
│   ├── robots.ts          # Robots.txt configuration
│   └── sitemap.ts         # Sitemap configuration
├── components/            # React components
│   ├── ui/               # shadcn/ui component library
│   │   └── index.ts      # Barrel exports
│   ├── app-switcher.tsx   # Helvety ecosystem app switcher
│   ├── auth-token-handler.tsx # Auth token refresh handler
│   ├── encryption-gate.tsx # Encryption setup/unlock gate
│   ├── encryption-unlock.tsx # Encryption passkey unlock
│   ├── helvety-pdf.tsx    # Main PDF management component
│   ├── navbar.tsx         # Navigation bar
│   ├── pdf-action-buttons.tsx   # Action buttons for PDF operations
│   ├── pdf-image-thumbnail.tsx # Image thumbnail component
│   ├── pdf-imagebitmap-thumbnail.tsx # ImageBitmap-based thumbnail
│   ├── pdf-page-error-boundary.tsx # Page-level error boundary
│   ├── pdf-page-grid.tsx  # PDF page grid layout
│   ├── pdf-page-thumbnail.tsx  # Individual page thumbnail
│   ├── pdf-toolkit.tsx    # PDF toolkit utilities
│   ├── subscription-provider.tsx # Subscription context provider
│   ├── theme-provider.tsx # Theme context provider
│   ├── theme-switcher.tsx # Dark/light mode switcher
│   └── upgrade-prompt.tsx # Pro upgrade prompt dialog
├── hooks/                 # Custom React hooks
│   ├── index.ts           # Barrel exports
│   ├── use-columns.ts     # Column layout management
│   ├── use-drag-drop.ts   # Drag and drop functionality
│   ├── use-error-handler.ts # Error handling
│   ├── use-imagebitmap-memory.ts # ImageBitmap memory monitoring
│   ├── use-mobile.ts      # Mobile device detection
│   ├── use-page-drag-drop.ts # Page drag and drop functionality
│   ├── use-pdf-files.ts   # PDF file management with tier limits
│   ├── use-pdf-page-state.ts # Page state (deletions, rotations)
│   ├── use-pdf-processing.ts # PDF processing operations
│   ├── use-pdf-rendering.ts # PDF page rendering with caching
│   ├── use-pdf-worker.ts  # PDF worker management
│   ├── use-progressive-quality.ts # Progressive quality rendering
│   ├── use-screen-size.ts # Screen size detection
│   ├── use-subscription.ts # Subscription status hook
│   └── use-thumbnail-intersection.ts # Thumbnail intersection observer
├── lib/                   # Utility functions
│   ├── auth-redirect.ts   # Auth service redirect utilities
│   ├── config/            # Configuration
│   │   └── version.ts     # Build version info
│   ├── crypto/            # Encryption utilities
│   │   ├── encoding.ts    # Encoding helpers
│   │   ├── encryption-context.tsx # Encryption context provider
│   │   ├── encryption.ts  # Encryption/decryption functions
│   │   ├── index.ts       # Barrel exports
│   │   ├── key-storage.ts # IndexedDB key storage
│   │   ├── passkey.ts     # Passkey encryption
│   │   ├── prf-key-derivation.ts # PRF key derivation
│   │   └── types.ts       # Crypto type definitions
│   ├── supabase/          # Supabase client utilities
│   │   ├── admin.ts       # Admin client
│   │   ├── client.ts      # Browser client
│   │   ├── client-factory.ts # Client factory
│   │   └── server.ts      # Server client
│   ├── types/             # Type definitions
│   │   ├── entities.ts    # Entity types
│   │   ├── index.ts       # Barrel exports
│   │   ├── pdf.ts         # PDF-specific types
│   │   └── subscription.ts # Subscription types and limits
│   ├── batch-processing.ts # Batch processing utilities
│   ├── blob-url-utils.ts  # Blob URL management
│   ├── comparison-utils.ts # Array/object comparison utilities
│   ├── constants.ts       # Application constants
│   ├── env-validation.ts  # Environment variable validation
│   ├── error-formatting.ts # Error message formatting
│   ├── error-handler.ts   # Error handling utilities
│   ├── feature-detection.ts # Browser feature detection
│   ├── file-download.ts   # File download utilities
│   ├── file-processing.ts # File processing utilities
│   ├── file-validation.ts # File type/size validation
│   ├── imagebitmap-cache.ts # ImageBitmap LRU cache
│   ├── logger.ts          # Logging utilities
│   ├── memory-utils.ts    # Memory monitoring utilities
│   ├── page-actions.tsx   # Page action components
│   ├── pdf-colors.ts      # PDF file color assignments
│   ├── pdf-conversion.ts  # PDF conversion utilities
│   ├── pdf-errors.ts      # PDF error handling
│   ├── pdf-extraction.ts  # Page extraction utilities
│   ├── pdf-loading.ts     # PDF document loading
│   ├── pdf-lookup-utils.ts # PDF lookup utilities
│   ├── pdf-rotation.ts    # Page rotation utilities
│   ├── pdf-utils.ts       # PDF utilities (main entry point)
│   ├── thumbnail-dpr.ts   # Thumbnail DPR calculation
│   ├── timeout-utils.ts   # Timeout/promise utilities
│   ├── utils.ts           # General utilities
│   └── validation-utils.ts # Input validation utilities
├── e2e/                   # End-to-end tests (Playwright)
├── public/                # Static assets
│   ├── pdf.worker.min.mjs # PDF.js worker file
│   ├── pdf-rendering-worker.js # Custom rendering worker
│   └── *.svg              # Logo and branding assets
├── vitest.config.ts       # Vitest configuration
├── vitest.setup.ts        # Test setup
├── playwright.config.ts   # Playwright E2E configuration
└── [config files]         # Other configuration files
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later
- A Supabase project (for authentication)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/helvety/helvety-pdf.git
   cd helvety-pdf
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables) below)

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Copy `env.template` to `.env.local` and fill in the required values:

```bash
cp env.template .env.local
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_PROJECT_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (safe for browser) |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server-only, never expose to client) |

See `env.template` for the full list with descriptions.

## Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Configure Row Level Security (RLS) policies
3. Enable the required auth providers

### Authentication

Authentication is handled by the centralized Helvety Auth service. Ensure `auth.helvety.com` is configured and running. The PDF app uses cross-subdomain session cookies for SSO.

## Architecture & Performance

This application is built with performance and code quality in mind:

- **LRU Cache Strategy** - Uses Least Recently Used (LRU) cache eviction for optimal memory management
- **Batch Processing** - Processes PDF pages in adaptive batches (3-10 pages) to prevent UI blocking
- **Optimized Memoization** - Smart memoization with early short-circuiting for efficient re-renders
- **Strict TypeScript** - Comprehensive type safety with `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`, and other strict compiler options
- **Error Handling** - Centralized error handling with detailed context and recovery strategies
- **Code Organization** - Modular architecture with extracted utilities and reusable components

## Testing

This project uses Vitest for unit tests and Playwright for end-to-end tests.

```bash
# Run unit tests in watch mode
npm run test

# Run unit tests with Vitest UI
npm run test:ui

# Run unit tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

See `__tests__/README.md` for testing patterns and conventions.

## Developer

This application is developed and maintained by [Helvety](https://helvety.com), a Swiss company committed to transparency, strong security, and respect for user privacy and data protection.

For questions or inquiries, please contact us at [contact@helvety.com](mailto:contact@helvety.com).

## License & Usage

This repository is public for transparency purposes only. All code is open for inspection so users can verify its behavior.

**All Rights Reserved.** No license is granted. You may view the code, but you may not copy, reuse, redistribute, modify, or sell it without explicit written permission.

Purchasing a subscription grants access to use the hosted service only—subscriptions do not grant any rights to the source code.

See [LICENSE](./LICENSE) for full terms.
