📊 Personal Finance Visualizer
A modern, responsive, and lightweight web application to track expenses, view transactions, set budgets, and visualize personal finances — built with Next.js 14 (App Router), React 19, TailwindCSS, shadcn/ui, MongoDB, and Recharts.

✨ Features

➕ Add, Edit, Delete Transactions easily.
📆 Monthly Budgeting with category-wise progress tracking.
📈 Visualize Spending using beautiful charts.
🗑️ Delete Budgets with a single click.
📅 Select Month to view past or upcoming budgets.
🚀 Fully mobile responsive and fast.
🌟 Built with latest React 19 features (use, suspense, etc).
🎨 UI powered by shadcn/ui components.
📦 Tech Stack

Technology	              Purpose
Next.js 14	   Fullstack Framework (frontend + API routes)
React 19	   Latest frontend library
TailwindCSS	   Styling
shadcn/ui	   UI Components
MongoDB	       Database
Recharts	   Data Visualization (Charts)
Sonner	       Toast Notifications

Clone the repository:

gh repo clone aman225/finance-visualizer
Install dependencies:

pnpm install
# or
npm install
# or
yarn install
Create .env.local:


MONGODB_URI=your_mongodb_connection_string
Run the app locally:

pnpm dev
# or
npm run dev
# or
yarn dev

http://localhost:3000


Route	                  Method	     Purpose
/api/transactions	      GET, POST	     Fetch or Create transactions
/api/transactions	      DELETE	     Delete transaction
/api/budgets	          GET, POST	     Fetch or Create budgets
/api/budgets	          DELETE	     Delete budget
