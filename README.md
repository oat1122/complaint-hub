# Anonymous Complaint System

A secure, role-based anonymous complaint system built with Next.js 14, Prisma, and TypeScript.

## Features

### User Roles

- **Anonymous Users**: Submit complaints without login or personal information
- **Admin**: Full access to review/delete complaints and manage system
- **Viewer (Pna)**: Read-only access to dashboard and complaints

### Key Features

- Anonymous complaint submission with tracking number
- File attachments support (up to 5 files, 10MB each)
- Dashboard with real-time statistics and charts
- Advanced filtering and search
- Role-based access control

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM with MySQL/MariaDB
- NextAuth.js for authentication
- TailwindCSS for styling
- Recharts for visualization
- React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL or MariaDB database

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/complaint-hub.git
cd complaint-hub
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```
# Create a .env.local file with the following:
DATABASE_URL="mysql://username:password@localhost:3306/complaintdb"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_PATH="./public/uploads"
```

4. Set up the database

```bash
# Push schema to database
npm run db:push

# Seed the database with initial users
npm run db:seed
```

5. Run the development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Users

- **Admin**:

  - Username: `admin`
  - Password: `admin1234`
  - Rights: Full access

- **Viewer**:
  - Username: `Pna`
  - Password: `Pna1234`
  - Rights: Read-only access

## Project Structure

```
/
├── prisma/           # Database schema and migration files
├── public/           # Static assets and uploads
├── src/
│   ├── app/          # App routes using Next.js App Router
│   ├── components/   # React components
│   │   ├── auth/     # Authentication components
│   │   ├── complaint/# Complaint-related components
│   │   ├── dashboard/# Dashboard components
│   │   └── ui/       # UI components
│   └── lib/          # Utility functions and shared code
│       ├── auth/     # Authentication utils
│       ├── db/       # Database utils
│       └── utils/    # General utilities
└── package.json
```

## Security Features

- No tracking of anonymous users
- CSRF protection
- Rate limiting
- File validation
- Role-based access control
