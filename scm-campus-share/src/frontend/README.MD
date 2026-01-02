# Campus Academic Resource Sharing Platform - Frontend

An open-source React application built for university students to share, search, and download academic resources (notes, slides, exam papers) across campuses. This project serves as the client-side interface for the Go-based backend API.

<img width="1901" height="908" alt="image" src="https://github.com/user-attachments/assets/d03d7973-550a-4327-bb84-bf1e29310e45" />

*> **Image Description:** A wide banner shot of the application homepage showing the logo, navigation bar, and a welcoming hero section.*

## 🚀 Features Implemented

### 🔐 Authentication & User Profile
*   **Secure Login & Registration:** JWT-based authentication flow.
*   **Protected Routes:** Unauthorized users are automatically redirected to login.
*   **Profile Management:** View and update user details (Name, Major, Year).
*   **Role Handling:** Support for Student and Admin roles.

### 📚 Resource Management
*   **Resource Feed:** Grid view of academic resources with metadata (views, downloads).
*   **Advanced Search:** Filter resources by title or description.
*   **File Upload:** Drag-and-drop interface for uploading PDFs, PPTs, and DOCs with metadata (Sharing Level, Tags, Course).
*   **Secure Downloads:** Direct S3-signed URL downloads via backend integration.

### 💬 Social & Interactive
*   **Comments System:** Discuss resources with a threaded comment section.
*   **Star Ratings:** 5-star rating system with real-time average updates.
*   **Bookmarks:** Save resources to a personal "Saved" list for quick access.

## 🛠️ Tech Stack

*   **Framework:** [React 18](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4.1](https://tailwindcss.com/)
*   **Routing:** [React Router v6](https://reactrouter.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/) (with Interceptors for JWT handling)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

The project follows a feature-based architecture for scalability:

```text
src/
├── components/         # Shared UI components (StarRating, Buttons)
├── features/           # Feature-specific logic
│   ├── auth/           # AuthContext, ProtectedRoute, Login forms
│   ├── resources/      # ResourceCard, Feed logic
│   ├── admin/          # Admin specific components
│   └── social/         # Comments, Ratings logic
├── layouts/            # Layout shells (AppLayout with Sidebar)
├── lib/                # Utilities (Axios instance, tailwind-merge)
├── pages/              # Main page views (Dashboard, Upload, Profile)
└── services/           # API integration services (auth, resource, social)


```

## 📸 Screenshots & UI

### 1. The Dashboard (Feed)
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/e37a3942-ae79-4eb6-b735-d6eea375f31a" />

> **Image Description:** The main application view. On the left is the navigation sidebar. In the center is a responsive grid of "Resource Cards," each showing a file icon, title, tags, and download count. A search bar is prominent at the top.

### 2. Resource Details & Interaction
<img width="938" height="800" alt="image" src="https://github.com/user-attachments/assets/dac4e5a2-07b0-442c-a100-7c5ea6e09242" />

> **Image Description:** A detailed view of a specific file. It shows the full description, a "Download" button, a "Bookmark" toggle, the 5-star rating component, and a comment section below.

### 3. Upload Interface
<img width="814" height="881" alt="image" src="https://github.com/user-attachments/assets/edb23be1-eaac-482f-889d-10ede096f9c1" />

> **Image Description:** A clean form with a large drag-and-drop zone for files. Below it are input fields for Title, Description, and dropdowns for Resource Type (Notes, Slides) and Sharing Level (Public, University).

### 4. BookMark Files
<img width="966" height="704" alt="image" src="https://github.com/user-attachments/assets/8634edc0-d997-4814-b05c-53ae3b78e666" />

>**Image Description:** This feature is just like the telegram's `saved message`  feature


## ⚡ Getting Started

## Option 1 Deployed In Vercel
### Deployment Link
* ```https://campus-share-iota.vercel.app/ ```

  
## Option 2 Local Deployment steps
### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/campus-share-frontend.git
    cd campus-share-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    # URL of your Go Backend API
    VITE_API_URL=https://campus-share-backend.onrender.com/api/v1
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`

## 🔌 API Integration Logic

This frontend communicates with the backend using a centralized **Axios instance** (`src/lib/axios.js`).

*   **Request Interceptor:** Automatically attaches the `Authorization: Bearer <token>` to every request if a user is logged in.
*   **Response Interceptor:** Global error handling. If the backend returns `401 Unauthorized`, the app automatically clears local storage and redirects the user to `/login`.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to a branch.
5.  Open a Pull Request.

## 📄 License

Distributed under the GPL-3.0 license. See [LICENSE](./LICENSE) for more information.
