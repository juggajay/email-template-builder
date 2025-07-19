# Email Template Builder 📧 v0.1.1

A production-ready SaaS application for creating professional e-commerce email templates with a drag-and-drop editor, built with Next.js 14, TypeScript, Supabase, and Stripe.

## 🚀 Live Demo

Visit the live application at: [http://localhost:3000](http://localhost:3000)

## ✨ Features

### Core Features
- **Drag-and-Drop Email Editor** - Powered by Unlayer with custom e-commerce components
- **20+ Pre-built Templates** - Professional designs for various e-commerce scenarios
- **E-commerce Components** - Product cards, countdown timers, discount codes
- **Mobile Responsive** - All templates optimized for mobile devices
- **Export Options** - HTML, ZIP, and direct platform integration

### Platform Integrations
- **Email Platforms** - Klaviyo, Mailchimp, Omnisend, Constant Contact
- **E-commerce** - Shopify, WooCommerce ready
- **Payment Processing** - Stripe subscription management
- **Authentication** - Supabase Auth with email/password and OAuth

### Business Model
- **Free Plan** - 5 exports per month
- **Pro Plan** - $29/month for unlimited exports
- **Agency Plan** - $49/month with white-label features

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email Editor**: Unlayer
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/juggajay/email-template-builder.git
   cd email-template-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   - Supabase credentials
   - Stripe API keys
   - Email platform API keys
   - Other service credentials

4. **Set up the database**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Copy contents of supabase-schema.sql to Supabase SQL editor
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── editor/           # Email editor
│   ├── layout/           # Layout components
│   ├── templates/        # Template components
│   └── ui/               # UI component library
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── email/           # Email export utilities
│   ├── stripe/          # Stripe integration
│   └── supabase/        # Supabase client
└── types/               # TypeScript types
```

## 🔧 Configuration

### Database Schema
The complete database schema is in `supabase-schema.sql` including:
- User profiles with subscription tiers
- Email templates with categories
- Template exports tracking
- Row Level Security policies

### Environment Variables
See `.env.example` for all required environment variables.

## 🚀 Deployment

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
npm start
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Stripe Endpoints
- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/create-portal-session` - Access billing portal
- `POST /api/stripe/webhooks` - Handle Stripe webhooks

## 🧪 Testing

```bash
npm test          # Run tests
npm run test:watch # Watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Email editor powered by [Unlayer](https://unlayer.com/)
- Database by [Supabase](https://supabase.com/)
- Payments by [Stripe](https://stripe.com/)

## 📞 Support

For support, email support@emailtemplatebuilder.com or open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript