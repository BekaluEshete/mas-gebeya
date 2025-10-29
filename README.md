# 🏡 MAS Gebeya

**MAS Gebeya** is a web-based marketplace for **buying and renting cars, properties, lands, and machines** in Ethiopia.  
It provides a modern, localized, and secure platform for individuals and businesses to browse, post, and negotiate deals - all within an Ethiopian context.



## 🚀 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js (React) + Redux + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (hosted on MongoDB Atlas) |
| **Hosting** | Vercel (Frontend), AWS / Render (Backend) |
| **Charts & UI** | Recharts, Radix UI, Lucide-React |
| **Authentication** | JWT (JSON Web Token) |

---

## ✨ Key Features

### 👥 Public Users
- Browse cars, properties, lands, and machines without signing in.  
- Advanced **search and filtering** with category-based options.  
- View Ethiopian-based pricing (ETB), locations, and seller details.

### 🔐 Registered Users
- Register/Login using email & password.  
- Add items to a **cart** for purchase or rental.  
- Make offers, accept listed prices, or reject deals.  
- Access **personal dashboard** (cart, history, favorites, settings).  

### 🧑‍💼 Admin Users
- Manage all **listings (CRUD)** for cars, properties, lands, and machines.  
- Manage users and confirm/decline deals.  
- Access **analytics dashboard** with charts:
  - Pie chart: inventory distribution  
  - Bar chart: revenue by category  
  - Line chart: sales trends  
  - Area chart: user activity  

---

## 🧩 System Architecture

💻  Next.js (React + Redux) — Frontend (Vercel)  
   ⇅  
⚙️  Node.js (Express) — Backend (Render)  
   ⇅  
🍃  MongoDB Atlas — Database  
   ⇅    
🎨  Tailwind CSS + Radix UI — Styling & Components



---

## 📋 Functional Modules

### 🏠 Public Features
- Browse listings for **Cars, Properties, Lands, and Machines**.  
- Filter and search listings by category (price, location, size, etc.).  

### 👨‍💻 Registered User Features
- Add to cart and manage quantity.  
- Chat with admin for real-time deal negotiation.  
- Track offers (accepted/rejected).  
- Manage user dashboard (favorites, settings, history).  

### 🧑‍💼 Admin Features
- CRUD for all categories.  
- Confirm or decline deals.  
- Visual analytics dashboard with revenue and activity charts.

### 🌍 System Features
- Mobile-first responsive UI.  
- Ethiopian context (names, cities, ETB currency).  
- Black-and-white base theme + category colors:
  - Blue = Cars  
  - Green = Properties  
  - Brown = Lands  
  - Orange = Machines  

---

## ⚙️ Non-Functional Requirements

| Category | Requirements |
|-----------|--------------|
| **Performance** | Page load < 2s, API response < 500ms |
| **Security** | JWT auth, HTTPS, encrypted passwords |
| **Usability** | Intuitive, consistent, minimal learning curve |
| **Scalability** | Handles 1,000+ concurrent users |
| **Accessibility** | WCAG 2.1 Level AA, ARIA labels, keyboard navigation |


## 💰 Budget Breakdown

| Category | Cost (ETB) |
|-----------|-------------|
| Development | 45,000 |
| Design & Assets | 3,000 |
| Contingency | 2,000 |
| **Total** | **50,000 ETB** |

💵 **Milestone Payments:**
)


## ✅ Acceptance Criteria

- Functional browsing, search, and deal features.  
- Responsive and mobile-first design.  
- Secure authentication (JWT, HTTPS).  
- Charts and analytics for admins.  
- Localization with Ethiopian content (ETB, cities).  


## 👨‍💻 Author

**Bekalu Eshetie**  
📍 Ethiopia  
💼 Full-Stack Web and App Developer (Next.js | Node.js | MongoDB)  
---

## 📝 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and distribute with attribution.

---

## 💬 Acknowledgements

- [Next.js](https://nextjs.org)  
- [React](https://react.dev)  
- [Node.js](https://nodejs.org)  
- [MongoDB](https://www.mongodb.com)  
- [Tailwind CSS](https://tailwindcss.com)  
- [Radix UI](https://www.radix-ui.com)


