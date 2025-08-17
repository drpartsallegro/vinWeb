# 🚗 PartsFlow - Premium VIN-Based Auto Parts Platform

A production-ready, SEO-friendly, mobile-first web application for VIN-based auto parts ordering with premium dark UI, comprehensive admin panel, and multi-payment gateway support.

## ✨ Features

### 🎯 **Core Functionality**
- **VIN-Gated Wizard** - 3-step parts ordering process with photo upload
- **Multi-Supplier Quotes** - Compare prices from multiple suppliers
- **Partial Order Acceptance** - Choose which parts to include in purchase
- **Real-time Notifications** - Orange dot indicator with comprehensive notification system
- **Comment Threads** - Order-level messaging between customers and support
- **Guest & Registered Users** - Magic link access for guests, full accounts for registered users

### 💳 **Payment & Shipping**
- **Multi-Payment Support** - Przelewy24 (P24), Manual Bank Transfer, Cash on Delivery
- **Polish Market Focus** - PLN currency, Polish postal codes, NIP validation
- **Multiple Shipping Options** - InPost Lockers, Couriers, DPD, DHL, Poczta Polska
- **Free Shipping Threshold** - Configurable minimum order value
- **Upsell System** - Recommended products carousel

### 🛡️ **Admin Panel**
- **Order Management** - Status tracking, offer management, customer communication
- **User Management** - Role-based access (USER, STAFF, ADMIN)
- **Settings Configuration** - Payments, shipping, branding, SEO, security
- **Analytics Dashboard** - Order statistics and performance metrics
- **Email Templates** - Preview and manage email communications

### 🔒 **Security & Quality**
- **Authentication** - NextAuth with email/password, Google OAuth, magic links
- **Validation** - Client & server-side Zod validation
- **File Security** - Magic bytes verification, EXIF stripping, size limits
- **Rate Limiting** - API protection and abuse prevention
- **Audit Logging** - Complete action tracking for compliance

### 🎨 **Design & UX**
- **Premium Dark UI** - Soft-glass cards, gradients, fluid typography
- **Mobile-First** - Responsive design optimized for mobile devices
- **Accessibility** - Focus rings, reduced motion support, semantic HTML
- **Theme Support** - Dark/light mode with smooth transitions

### 🔍 **SEO & Performance**
- **Next.js Metadata** - Dynamic meta tags for all pages
- **JSON-LD** - Structured data for search engines
- **Sitemap & Robots** - Automated generation with admin controls
- **PWA Ready** - Manifest file and mobile app capabilities
- **Lighthouse ≥95** - Optimized for Accessibility & Best Practices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd partsflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/partsflow"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

EMAIL_FROM="PartsFlow <no-reply@yourdomain.com>"
EMAIL_OUTBOX_DIR="./emails/outbox"
STORAGE_DIR="./uploads"

# Optional P24 configuration
P24_MERCHANT_ID="your-merchant-id"
P24_POS_ID="your-pos-id"  
P24_CRC="your-crc-key"
P24_REST_API_KEY="your-api-key"
P24_SANDBOX=true

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Database setup**
```bash
npx prisma db push
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
partsflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── orders/            # Order management pages
│   │   ├── wizard/            # 3-step order wizard
│   │   └── layout.tsx         # Root layout with SEO
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── features/          # Feature components
│   │   ├── seo/               # SEO components (JSON-LD)
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── email/             # Email system & templates
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   └── test/                  # Test files
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── public/                    # Static assets
├── e2e/                      # Playwright E2E tests
├── data/
│   └── categories.json       # Product categories
└── emails/outbox/            # Development email storage
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following key models:

- **User** - Authentication and user management
- **OrderRequest** - Main order entity with status tracking
- **OrderItem** - Individual parts with photos and offers
- **Offer** - Supplier quotes with pricing and availability
- **Payment** - Multi-provider payment tracking
- **Notification** - Real-time user notifications
- **OrderComment** - Threaded communication system
- **ShopConfig** - Admin-configurable settings
- **AuditLog** - Complete action tracking

## 🔧 Configuration

### Admin Settings
Access the admin panel at `/admin` with an ADMIN role account to configure:

- **Payments** - Enable/disable payment providers, configure P24 credentials
- **Shipping** - Set free shipping thresholds, available methods
- **Branding** - Site title, logo, theme colors
- **SEO** - Canonical URLs, sitemap generation, robots policy
- **Notifications** - Email preferences and templates

### Payment Providers

#### Przelewy24 (P24)
Configure in admin settings or environment variables:
- Merchant ID, POS ID, CRC key, REST API key
- Sandbox mode for development
- Webhook handling for payment confirmation

#### Manual Bank Transfer
- Admin marks payments as confirmed
- Bank details shown to customers
- Email notifications for payment instructions

#### Cash on Delivery (COD)
- Payment collected on delivery
- Additional COD fees configurable
- Automatic order confirmation

## 📧 Email System

The application includes a comprehensive email system with:

### Development Mode
- **File Transport** - Emails saved to `./emails/outbox/` as EML files
- **Preview Interface** - Admin panel email template previews
- **Template Testing** - All email templates with sample data

### Production Mode
- **SMTP Support** - Configure SMTP settings for production
- **Template System** - HTML emails with dark theme styling
- **Delivery Tracking** - Email logs with success/failure tracking

### Email Templates
- Order confirmation with magic links for guests
- Quote notifications when offers are ready
- Payment confirmations with receipt details
- Comment notifications for order communication
- Magic link access for guest users

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```
- Utility function validation
- Zod schema testing
- Component unit tests

### Integration Tests
```bash
npm run test:integration
```
- API endpoint testing
- Database integration
- Email system testing

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
- Complete wizard flow
- Mobile responsiveness
- Payment processes
- Admin workflows

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection
- NextAuth configuration
- Email SMTP settings
- Payment gateway credentials
- Storage configuration

### Database Migration
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Performance Optimization
- Image optimization with Sharp
- Static file caching
- Database query optimization
- CDN integration ready

## 🛠️ Development

### Code Quality
- **ESLint** - Code linting and formatting
- **Prettier** - Consistent code formatting
- **TypeScript** - Full type safety
- **Conventional Commits** - Structured commit messages

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript checking
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 📊 Performance & SEO

### Lighthouse Scores
Target scores (mobile):
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### SEO Features
- Dynamic meta tags
- OpenGraph & Twitter cards
- JSON-LD structured data
- Automated sitemap generation
- Robots.txt configuration
- Canonical URL management

### PWA Features
- Web app manifest
- Offline capability ready
- Mobile app installation
- Push notifications ready

## 🔐 Security

### Authentication
- NextAuth.js with multiple providers
- Session-based authentication
- Role-based access control
- Magic link authentication for guests

### Data Protection
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload security
- Rate limiting

### Privacy
- GDPR compliance ready
- User data encryption
- Audit logging
- Secure file handling

## 🌍 Internationalization

The application is built with Polish market focus:
- PLN currency support
- Polish postal code validation
- NIP (tax ID) validation
- Polish language support ready
- European date/time formats

## 📞 Support

### Documentation
- Comprehensive README
- API documentation
- Admin user guide
- Developer setup guide

### Monitoring
- Error logging
- Performance monitoring
- User analytics ready
- Health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow existing code style
- Write tests for new features
- Update documentation
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
- All other open source contributors

---

**PartsFlow** - Built with ❤️ for the automotive industry