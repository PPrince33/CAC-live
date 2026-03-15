# CAC Live Analytics Dashboard

Standalone live match analytics dashboard.

## Setup Instructions

1.  **Move this folder**: Drag this `standalone-dashboard` folder to your Desktop or a new location.
2.  **Initialize Git**: Open your terminal in this new folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
3.  **Create New Repo on GitHub**: Create a new repository on GitHub named `CAC-Live-Analytics`.
4.  **Push to GitHub**:
    ```bash
    git remote add origin https://github.com/PPrince33/CAC-Live-Analytics.git
    git branch -M main
    git push -u origin main
    ```
5.  **Environment Variables**: Create a `.env` file (copy from `.env.example`) and add your Supabase credentials.

## Local Development
Run `npm install` and then `npm run dev` to see the dashboard locally.
