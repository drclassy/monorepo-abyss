# Dr. Dibya Arfianda Website - Next.js 15

Modern website built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.0 | Framework (App Router) |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | 5.7 | Type Safety |
| **Tailwind CSS** | 3.4 | Styling |
| **Prisma** | 6.0 | ORM & Database |
| **PostgreSQL** | - | Database |
| **Zod** | 3.23 | Validation |
| **React Hook Form** | 7.54 | Form Management |
| **Lucide React** | 0.468 | Icons |
| **Sonner** | 1.7 | Toast Notifications |

## 📁 Project Structure

```
nextjs-app/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Philosophy.tsx
│   │   ├── Services.tsx
│   │   ├── ContactForm.tsx
│   │   └── Footer.tsx
│   ├── api/
│   │   └── consultations/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   ├── schemas.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── public/
│   └── images/
└── package.json
```

## 🛠️ Setup & Installation

### 1. Install Dependencies
```bash
cd nextjs-app
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/drdibya_db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://drdibyaarfianda.com"
```

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## 🗄️ Database Schema

### Consultation Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| fullName | String | Patient name |
| email | String | Contact email |
| phone | String? | WhatsApp/phone |
| consultationType | Enum | obstetrics/gynaecology/fertility |
| message | String? | Optional message |
| status | Enum | pending/contacted/completed/cancelled |
| createdAt | DateTime | Timestamp |

## 📝 API Routes

### POST /api/consultations
Submit new consultation request.

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+6281234567890",
  "consultationType": "obstetrics",
  "message": "Optional message"
}
```

### GET /api/consultations
Get all consultations (for admin dashboard).

## 🎨 Design System

### Colors
- `cream`: #FDFBF7 (background)
- `charcoal`: #121212 (text, buttons)
- `gold`: #B5A48B (accents)
- `taupe`: #4A4A4A (body text)

### Typography
- **Headings**: Cormorant Garamond (serif)
- **Body**: Inter (sans-serif)

## 🔐 Security
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection via React escaping
- Security headers in next.config.ts

## 📱 Responsive
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

**Design preserved 100% from original 121.html**
