
# TutorFlow - Student Remuneration & Gamification App

TutorFlow is a React-based web application designed for teachers and tutors to manage student information, track payments and lessons, and view financial summaries. It incorporates gamification features like points, levels, and achievements to enhance user engagement. All data is stored locally in the browser's localStorage.

## Features

*   **Student Management:**
    *   Add, edit, and delete student profiles.
    *   Store student details including contact information, parent/guardian details, and tuition specifics (subjects, rates, lesson duration).
    *   View a detailed profile for each student with their transaction history.
*   **Transaction Logging:**
    *   Log lessons/sessions with details like date, duration, lesson fee, and amount paid.
    *   Record payment methods and add notes to transactions.
    *   Automatic calculation of payment status (Paid, Partially Paid, Due, Overpaid).
*   **Financial Overview (Dashboard):**
    *   View total unpaid amounts across all students.
    *   Track total income received for the current month.
    *   See the number of active students.
    *   Identify overdue payments at a glance.
*   **Gamification System:**
    *   Earn points for various actions (e.g., adding students, logging payments).
    *   Advance through tutor ranks/levels based on accumulated points.
    *   Unlock achievements for milestones (e.g., first student added, first payment logged).
*   **Customizable Settings:**
    *   Personalize the application with the tutor's name.
    *   Select a preferred currency symbol.
    *   Toggle between Light and Dark themes.
*   **User Interface & Experience:**
    *   Responsive design for use on various screen sizes.
    *   Clean and intuitive interface.
    *   Interactive elements like modals, cards, and badges.
*   **Data Persistence:**
    *   All data (students, transactions, settings, gamification progress) is saved locally in the browser's localStorage, allowing users to retain their information between sessions.

## Tech Stack

*   **React 19**: Core JavaScript library for building the user interface.
*   **TypeScript**: Superset of JavaScript adding static typing.
*   **React Router DOM**: For client-side routing within the application.
*   **Tailwind CSS**: Utility-first CSS framework for styling (loaded via CDN).
*   **ES Modules & Import Maps**: Used in `index.html` for direct browser module loading without a build step for basic execution.

## Project Structure

The project follows a typical React application structure:

```
/TutorFlow-App/
├── index.html            # Main HTML entry point, includes Tailwind CDN and import maps
├── metadata.json         # Application metadata (not directly used by the running app but for project info)
├── README.md             # This file: Project overview and documentation
├── index.tsx             # Main React entry point, renders the App component
├── App.tsx               # Root application component, sets up routing and layout
├── components/
│   └── UI.tsx            # Collection of reusable UI components (Button, Card, Modal, etc.)
├── pages/
│   └── Pages.tsx         # Contains all page components (Dashboard, Students, Transactions, etc.)
├── store.ts              # Global state management using React Context and localStorage hook
├── types.ts              # TypeScript type definitions and interfaces
└── constants.ts          # Application-wide constants (currency options, gamification rules, etc.)
```

*(Note: A `public/` directory for static assets like favicons or images is not present in the provided file list but would be a common addition for further development.)*

## Setup and Running the Application

1.  **Prerequisites:**
    *   A modern web browser (e.g., Chrome, Firefox, Edge, Safari) that supports ES Modules and Import Maps.

2.  **Running the App:**
    *   Ensure all the files (`index.html`, `index.tsx`, `App.tsx`, `components/UI.tsx`, `pages/Pages.tsx`, `store.ts`, `types.ts`, `constants.ts`) are in the same directory structure as listed above.
    *   Open the `index.html` file directly in your web browser. The application is designed to run directly from the filesystem in a browser due to its use of CDNs for Tailwind CSS and import maps for React modules.

    *(For a more robust development experience, including features like hot module reloading and optimized builds, you would typically integrate a development server and build tool like Vite or Create React App. However, for viewing and basic interaction with the current setup, opening `index.html` is sufficient.)*

## Further Development Ideas

*   **Data Export/Import:** Allow users to export their data (e.g., to CSV or JSON) for backup or use in other tools, and import data.
*   **Cloud Synchronization:** Option to sync data with a cloud backend (e.g., Firebase, Supabase) for access across multiple devices.
*   **Reporting & Analytics:** More detailed financial reports, charts visualizing income trends, student payment histories, etc.
*   **Calendar Integration:** Visual calendar view for scheduled lessons and payment due dates.
*   **Notifications/Reminders:** In-app or browser notifications for overdue payments or upcoming lessons.
*   **Advanced Gamification:** More complex achievements, leaderboards (if a multi-user context is considered), customizable reward points.
*   **User Authentication:** If moving to a multi-user or cloud-synced model, user accounts and authentication would be necessary.
*   **Testing:** Implementation of unit tests (e.g., with Jest/React Testing Library) and end-to-end tests (e.g., with Cypress/Playwright) to ensure code quality and reliability.
*   **Accessibility (A11y) Audit:** Conduct a thorough accessibility audit and implement improvements based on WCAG guidelines.
*   **Progressive Web App (PWA) Features:** Add a service worker and manifest file to enable offline capabilities and "install to homescreen" functionality.
