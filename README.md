<div align="center">

# Vellor 🎓

**Manage your tutoring business like a pro.**

[![CI](https://github.com/DhaatuTheGamer/Vellor/actions/workflows/ci.yml/badge.svg)](https://github.com/DhaatuTheGamer/Vellor/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-3.5.0-8b5cf6)](https://github.com/DhaatuTheGamer/Vellor)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)

Vellor is a modern, open-source web application built for private teachers and tutors. It provides a single, beautiful interface to manage students, track lessons and payments, and stay motivated through built-in gamification — all while keeping your data 100% private on your own device.

[Getting Started](#-getting-started) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [Why Vellor?](#-why-vellor)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 💡 Why Vellor?

Most tutoring management tools are either too complex, too expensive, or require handing over your data to a third-party service. Vellor was built to solve this:

- **Free & open-source** — no subscriptions, no hidden fees.
- **Privacy-first** — all data lives in your browser's `localStorage`. Nothing leaves your device.
- **Gamified** — earn points, level up, and unlock achievements to stay motivated.
- **Lightweight** — runs instantly in any modern browser with zero setup overhead.

---

## ✨ Features

### 🍎 Student Management
- **Organized Profiles** — Store contact info, parent details, rates, and subjects in one place.
- **Instant Search** — Filter your roster by name in real time.
- **Detailed History** — View the complete lesson and payment record for each student.

### 💸 Financial Tracking
- **Quick Lesson Logging** — Record a lesson and payment in seconds via the floating action button.
- **Payment Statuses** — Automatically categorized as `Paid`, `Due`, `Partially Paid`, or `Overpaid`.
- **Dashboard Overview** — At-a-glance cards showing monthly income, unpaid fees, active students, and overdue alerts.
- **Income Charts** — 6-month interactive area chart for income and student growth trends.
- **CSV & PDF Export** — Instantly export your financial data to CSV for tax season, or generate professional PDF invoices directly from the dashboard.
- **Calendar View** — Visualize your schedule with a color-coded calendar view of all your lessons and payments.

### 🎮 Gamification
- **Points System** — Earn points for adding students, logging payments, and clearing debts.
- **Ranks & Levels** — Progress from *Novice Tutor* to *Scholarly Sensei* across multiple tiers.
- **25+ Achievements** — Unlock badges for milestones like your first $100 earned, a 30-day login streak, or managing 50 students.
- **Monthly Goal Tracker** — Set an income target and watch your progress bar fill up in real time.
- **Confetti Celebrations** — Achievement unlocks are accompanied by confetti animations 🎉

### 🔒 Privacy & Data Control
- **100% Offline (PWA)** — Install Vellor directly to your device as a Progressive Web App. No server, no database, no tracking. All data is stored locally in your browser and works completely offline.
- **Export & Import** — Back up your data to a JSON file and restore it anytime.
- **Automated Backup Alerts** — Vellor tracks your backup habits and gently reminds you to secure your data every 14 days.
- **Secure Reset** — Wipe all application data with one click.
- **Encrypted Storage** — Data is encrypted with AES-GCM before being saved to `localStorage`. Includes a secure "Recovery Key" fallback.

### 🎨 Design & UX
- **Dark / Light Mode** — Toggle between themes with smooth transitions.
- **Responsive Layout** — Fully usable on desktop, tablet, and mobile.
- **Smooth Animations** — Page transitions and micro-interactions powered by Framer Motion.
- **Multi-Currency Support** — Configure your preferred currency symbol in settings.
- **International Phone Input** — Country code selection with flag indicators.

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | `≥ 18.x` (LTS recommended) | JavaScript runtime |
| npm | `≥ 9.x` (bundled with Node.js) | Package manager |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DhaatuTheGamer/Vellor.git

# 2. Navigate into the project
cd Vellor

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will launch at **`http://localhost:5173`** (default Vite port). Open it in your browser and you're ready to go!

---

## 📖 Usage

### First Launch

1. **Welcome Screen** — Enter your name to personalize the app, then click **Get Started**.
2. **Dashboard** — Your home base. View stats, charts, recent activity, and overdue alerts.
3. **Add a Student** — Click **+ Add Student** and fill in their details: name, country, contact, parent info, subjects, and rate.
4. **Log a Lesson** — Click **+ Log Lesson** (or the floating ⚡ button) to quickly record a lesson duration and payment.

### Key Workflows

```
Dashboard → Add Student → Log Lesson → Track Payments → Unlock Achievements
```

| Action | How |
|--------|-----|
| **Add a student** | Navigate to *Students* → click *Add Student* → fill the form |
| **Log a lesson** | Click the ⚡ floating button → select student → enter duration & amount |
| **View payment history** | *Students* → click a student card → scroll to *Transactions* |
| **Export data** | *Profile* → scroll to *Data Management* → click *Export Data* |
| **Change theme** | Click the 🌙/☀️ icon in the navigation bar |

---

## 🛠️ Tech Stack

| Technology | Role | Why |
|-----------|------|-----|
| [**React 19**](https://react.dev/) | UI framework | Component-based architecture with hooks |
| [**TypeScript 5.7**](https://www.typescriptlang.org/) | Language | Compile-time type safety and better DX |
| [**Vite 6**](https://vitejs.dev/) | Build tool | Lightning-fast HMR and optimized production builds |
| [**Tailwind CSS**](https://tailwindcss.com/) | Styling | Utility-first CSS with CDN integration |
| [**React Router 7**](https://reactrouter.com/) | Navigation | Client-side routing with URL-based navigation |
| [**Framer Motion**](https://www.framer.com/motion/) | Animations | Declarative animations and page transitions |
| [**Recharts**](https://recharts.org/) | Charts | Composable, responsive charting for dashboards |
| [**Lucide React**](https://lucide.dev/) | Icons | Beautiful, consistent open-source icon set |
| [**canvas-confetti**](https://www.npmjs.com/package/canvas-confetti) | Effects | Confetti animations for achievements |

---

## 📂 Project Structure

```
Vellor/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline (lint + build)
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── Button.tsx          #   Buttons with variants & icons
│   │   ├── Card.tsx            #   Container cards
│   │   ├── Modal.tsx           #   Dialog modals
│   │   ├── Input.tsx           #   Form inputs
│   │   ├── Select.tsx          #   Dropdown selects
│   │   ├── Icon.tsx            #   Icon wrapper (Lucide)
│   │   ├── FAB.tsx             #   Floating action button
│   │   ├── Toast.tsx           #   Toast notifications
│   │   ├── PhoneInput.tsx      #   International phone input
│   │   └── index.ts            #   Barrel export
│   ├── students/               # Student-specific components
│   │   ├── StudentForm.tsx
│   │   ├── StudentListItem.tsx
│   │   └── StudentDetailView.tsx
│   └── transactions/           # Transaction-specific components
│       ├── TransactionForm.tsx
│       ├── TransactionListItem.tsx
│       └── QuickLogModal.tsx
├── pages/                      # Route-level page components
│   ├── DashboardPage.tsx       #   Main dashboard with stats & charts
│   ├── StudentsPage.tsx        #   Student roster & management
│   ├── TransactionsPage.tsx    #   Transaction list & filters
│   ├── AchievementsPage.tsx    #   Gamification badges & progress
│   ├── ProfilePage.tsx         #   User profile & data management
│   ├── SettingsPage.tsx        #   App settings redirect
│   └── WelcomePage.tsx         #   First-time onboarding
├── App.tsx                     # Root component, layout & routing
├── store.ts                    # Context-based state management
├── types.ts                    # TypeScript type definitions
├── constants.ts                # App constants & achievement defs
├── helpers.ts                  # Utility functions (formatting, etc.)
├── index.tsx                   # Entry point
├── index.html                  # HTML shell
├── index.css                   # Custom scrollbar & animation styles
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |

---

## 🔄 CI/CD Pipeline

Vellor uses **GitHub Actions** for continuous integration. The pipeline runs automatically on every push or pull request to the `main` branch.

**Pipeline Steps:**

```
Checkout → Setup Node.js 20 → npm ci → Type-check (tsc) → Build (vite)
```

The workflow is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's a bug fix, a new feature, or a documentation improvement — every contribution makes Vellor better.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make** your changes and ensure they pass lint:
   ```bash
   npm run lint
   ```
4. **Commit** with a descriptive message
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. **Push** your branch
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open** a Pull Request on GitHub

### Contribution Guidelines

- Follow the existing code style and TypeScript conventions.
- Ensure `npm run lint` passes with zero errors before submitting.
- Keep pull requests focused — one feature or fix per PR.
- Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/).

---

## 🧪 Testing

Run the TypeScript type-checker to verify code correctness:

```bash
npm run lint
```

This runs `tsc --noEmit`, which performs a full compile-time type-check across all `.ts` and `.tsx` files without emitting output. It catches type errors, missing imports, and interface mismatches.

To verify the production build:

```bash
npm run build
```

> **Note:** Vitest is now integrated! We have automated testing coverage for core financial derivations and gamification boundary logic. Contributions to expand the testing suite are always welcome.

---

## 🔮 Roadmap

Planned features for future releases:

- [ ] **Cloud Sync** — Sync data across devices via Firebase or Supabase
- [x] **Calendar View** — Visual scheduling for lessons and due dates
- [x] **PDF Invoices** — Generate professional invoices for parents
- [ ] **Advanced Analytics** — Trend analysis, student retention metrics, and forecasting
- [x] **Unit Tests** — Vitest + React Testing Library coverage
- [x] **PWA Support** — Install Vellor as a native-like app on mobile

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute this software.

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for educators everywhere.**

[⬆ Back to Top](#vellor-)

</div>