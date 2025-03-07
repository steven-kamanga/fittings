# Golf Fittings & Swing Analysis Scheduling App

A simple full-stack web application for scheduling golf fittings and swing analysis sessions. Built with **Next.js 15**, **Node.js/Express**, **PostgreSQL**, **TailwindCSS**, **shadcn/ui**, and **NextAuth.js** for authentication.

## Features

- 📅 **Schedule** golf fitting and swing analysis sessions
- 🔐 **User Authentication** with NextAuth.js
- 🎨 **Modern UI** with TailwindCSS & shadcn/ui
- 🗄️ **PostgreSQL** for database management
- 🚀 **Backend API** with Express.js

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

## Installation

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/steven-kamanga/fittings.git
   cd fittings
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   DATABASE_URL=your_postgres_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run database migrations:
   ```sh
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## Running the Backend

1. Navigate to the backend folder (if separate):
   ```sh
   cd fittings-api
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm run start
   ```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

### Contributors Wanted 🚀
We are looking for contributors to help improve this project! If you are interested, please submit a PR or open an issue.

Happy coding! 🏌️‍♂️

