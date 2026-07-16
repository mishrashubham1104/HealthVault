# 💻 HealthVault - Frontend Client

This directory contains the frontend client application for HealthVault, built using React, Vite, Redux, and Tailwind CSS.

---

## 🛠️ Technology Stack
*   **Library/Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) for extremely fast rendering & bundling.
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [React-Redux](https://react-redux.js.org/) for clean, centralized global state handling.
*   **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with PostCSS & Autoprefixer.
*   **Icons**: [Lucide React](https://lucide.dev/) for SVG UI icons.
*   **Charts**: [Recharts](https://recharts.org/) for health graphs and visual analytics.

---

## 🚦 Getting Started

### Prerequisites
Make sure the backend API is configured and running. By default, the client expects the backend to be listening at `http://localhost:5000`.

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run in Development Mode
```bash
npm run dev
```
The app will start at [http://localhost:5173](http://localhost:5173).

### 3. Build for Production
To generate a production-ready client bundle in the `/dist` directory:
```bash
npm run build
```

---

## 📝 General Information
For comprehensive details on the backend configuration, monorepo scripts, and features, please refer to the [Root README.md](../README.md).
