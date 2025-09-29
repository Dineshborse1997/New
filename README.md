# Employee Management System

A comprehensive, production-ready Employee Management System built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Authentication & Security
- Role-based authentication (Admin & Employee)
- Secure password encryption
- Session management with Supabase Auth
- Row Level Security (RLS) policies

### Admin Features
- **Dashboard**: Real-time statistics and analytics
- **Employee Management**: Complete CRUD operations
- **Department Management**: Organize teams effectively
- **Reports & Export**: CSV/PDF export functionality
- **Audit Logging**: Track all admin actions
- **Notifications**: System-wide messaging

### Employee Features
- **Personal Dashboard**: View personal metrics
- **Profile Management**: Update personal information
- **Attendance Tracking**: View attendance records
- **Department Overview**: See team information

### UI/UX Features
- **Modern Design**: Glass-morphism with gradient backgrounds
- **Dark Mode**: Toggle between light and dark themes
- **Responsive**: Mobile-first design approach
- **Smooth Animations**: Micro-interactions throughout
- **Accessible**: WCAG 2.1 compliant

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Static hosting compatible

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd employee-management-system
npm install
```

### 2. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the migration file in your Supabase SQL editor

### 3. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

## 👤 Default Login Credentials

### Admin Account
- **Email**: admin@company.com
- **Password**: admin123

### Employee Account
- **Email**: john.doe@company.com
- **Password**: admin123

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components (Modal, Loading, etc.)
│   ├── employees/      # Employee-specific components
│   ├── departments/    # Department-specific components
│   └── layout/         # Layout components (Sidebar, Header)
├── contexts/           # React contexts (Auth, Theme)
├── lib/               # Utility libraries (Supabase client)
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🔒 Security Features

### Database Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure password hashing
- SQL injection prevention

### Application Security
- Protected routes based on user roles
- Input validation and sanitization
- Secure session handling
- CSRF protection via Supabase

## 📊 Database Schema

### Core Tables
- **users**: Authentication and roles
- **employees**: Employee information
- **departments**: Organizational structure
- **attendance**: Attendance tracking
- **notifications**: System notifications
- **audit_logs**: Admin action logging

### Key Relationships
- Users ↔ Employees (1:1)
- Departments ↔ Employees (1:N)
- Employees ↔ Attendance (1:N)
- Users ↔ Notifications (1:N)

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

### Environment Variables
Ensure these environment variables are set in production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check

### Code Quality
- ESLint configuration with React and TypeScript rules
- Prettier for code formatting
- TypeScript for type safety
- Git hooks for pre-commit checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

## 🔄 Updates & Roadmap

### Current Version: 1.0.0

### Planned Features
- [ ] Advanced reporting with charts
- [ ] Leave management system
- [ ] Performance reviews
- [ ] Employee onboarding workflow
- [ ] Time tracking integration
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Advanced analytics dashboard

---

**Built with ❤️ using React, TypeScript, and Supabase**