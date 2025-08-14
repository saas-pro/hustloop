# Hustloop Platform - Frontend

This repository contains the high-fidelity, interactive frontend for the Hustloop Platform, built with Next.js, React, and ShadCN UI. It is designed to deliver a seamless user experience, robust role-based dashboards, and modern UI/UX for startups, mentors, incubators, and MSMEs.

<!-- Deployment ready with Firebase environment variables -->

## Core Features

- **Modern Tech Stack**: Built with Next.js 14 (App Router), React, and TypeScript for a robust and type-safe codebase.
- **Responsive Design**: A polished and responsive UI that works seamlessly across desktop, tablet, and mobile devices, utilizing Tailwind CSS and ShadCN UI components.
- **Component-Based Architecture**: Features a full suite of custom and ShadCN UI components for consistency and reusability.
- **Modal-Based Navigation**: Core sections like Blog, Mentors, Incubators, and Pricing are loaded in modal dialogs for a smooth single-page application feel.
- **Role-Based Dashboards**: Includes dashboards for Admin, Mentor, Incubator, and MSME roles, each with tailored features and workflows.
- **Interactive Forms**: Login, signup, and settings forms are fully functional and ready for backend integration.
- **AI Integration**: Includes a Genkit-powered flow to demonstrate AI content summarization capabilities.
- **Light/Dark Mode**: A persistent, user-toggleable theme for improved accessibility and user comfort.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Functionality**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)

## Configuration & Deployment

### Environment Variables
The application uses environment variables for API and Firebase configuration. These should be set in your deployment environment or in a `.env` file (not committed to source control):

- `NEXT_PUBLIC_API_BASE_URL` — The base URL for the backend API (e.g., `https://api.hustloop.com`)


### Deployment
- The frontend is deployed via **GitHub Pages** using the workflow defined in `.github/workflows/deploy.yml`.
- The build process uses the above environment variables, which should be set as GitHub repository secrets.
- The output is exported as static files and published to the `hustloop.com` domain.

## Backend Integration Notes

The Hustloop frontend is ready for seamless backend integration. Here are the key points for backend/API developers:

- **API Endpoints**: All API calls are routed through the `NEXT_PUBLIC_API_BASE_URL` (default: `https://api.hustloop.com`). Update this variable to point to your backend as needed.
- **Authentication**: The frontend expects JWT-based authentication. On login/signup, the backend should return a JWT token, which will be stored in `localStorage` and sent in the `Authorization` header for authenticated requests.
- **User Roles**: The backend should provide user role information (`admin`, `mentor`, `incubator`, `msme`) in the authentication response and user profile endpoints. The UI adapts based on this role.
- **Data Contracts**: Refer to `src/app/types.ts` for the expected object structures for users, mentors, incubators, MSMEs, blog posts, and submissions. The backend should match these contracts for smooth integration.
- **Forms**: All forms (login, signup, settings, profile, contact, etc.) are built with React Hook Form and Zod for validation. The `onSubmit` handlers are the integration points for API calls.
- **AI Flows**: The AI summarization feature in `/src/ai/flows/` is functional and can be expanded. The backend can provide additional AI-powered endpoints as needed.
- **Error Handling**: The frontend expects error responses in the format `{ error: string }` for failed API calls.
- **Session Management**: Tokens and user info are stored in `localStorage` for session persistence. The backend should provide endpoints for token refresh and logout if needed.
- **Static Assets**: Images and other static assets are loaded from remote sources (e.g., Unsplash, placehold.co) or can be served from the backend if required.

## Contribution & Support
- For deployment or configuration issues, check the GitHub Actions workflow and environment variable setup.
- For backend integration, coordinate on API contracts and authentication flows.
- For UI/UX or feature requests, open an issue or pull request.

---

This codebase provides a comprehensive, production-ready foundation for the Hustloop platform frontend, enabling rapid integration with your backend services and scalable deployment.
# Trigger deployment
