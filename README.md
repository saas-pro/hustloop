# Nexus Platform - Frontend Prototype

This repository contains a high-fidelity, interactive frontend prototype for the Nexus Platform, built with Next.js, React, and ShadCN UI. It's designed to showcase the user experience, core features, and visual design of the application, serving as a comprehensive blueprint for backend development.

## Core Features

-   **Modern Tech Stack**: Built with Next.js 14 (App Router), React, and TypeScript for a robust and type-safe codebase.
-   **Responsive Design**: A polished and responsive UI that works seamlessly across desktop, tablet, and mobile devices, utilizing Tailwind CSS and ShadCN UI components.
-   **Component-Based Architecture**: Features a full suite of custom and ShadCN UI components for consistency and reusability.
-   **Modal-Based Navigation**: Core sections like Blog, Mentors, Incubators, and Pricing are loaded in modal dialogs for a smooth single-page application feel.
-   **Simulated User Roles & Dashboards**: Includes prototype dashboards for different user roles (Admin, Mentor, Incubator, MSME) to demonstrate role-specific functionalities.
-   **Interactive Forms**: Login, signup, and settings forms are functional for demonstration purposes (note: authentication is simulated).
-   **AI Integration**: Includes a Genkit-powered flow to demonstrate AI content summarization capabilities.
-   **Light/Dark Mode**: A persistent, user-toggleable theme for improved accessibility and user comfort.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Library**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **AI Functionality**: [Genkit](https://firebase.google.com/docs/genkit)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Project Setup

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### Running the Development Server

-   To run the app in development mode, use the following command. This will start the server with hot-reloading enabled.
    ```bash
    npm run dev
    ```
-   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes for Backend Development

This prototype is ready for backend integration. Here are some key points for the development team:

-   **Data is Simulated**: All data, including user accounts, mentors, incubators, submissions, etc., is currently hardcoded within the relevant React components (e.g., in `/src/components/views/`). These will need to be replaced with API calls. The `src/app/types.ts` file provides a clear data contract for the expected object structures.
-   **Authentication is Simulated**: The login flow (`/src/components/auth/login-modal.tsx`) uses hardcoded credentials to demonstrate the different user dashboards. This should be replaced with a proper authentication service (e.g., JWT, OAuth).
-   **Forms are Ready**: All forms (login, signup, settings) are built with React Hook Form and Zod for validation. The `onSubmit` handlers are the clear integration points for API calls.
-   **AI Flows**: The AI summarization feature in `/src/ai/flows/` is functional but can be expanded. It serves as a template for building out more complex Genkit-powered AI features.

This prototype provides a comprehensive visual and functional blueprint, making it an ideal starting point for building the full-stack application.
