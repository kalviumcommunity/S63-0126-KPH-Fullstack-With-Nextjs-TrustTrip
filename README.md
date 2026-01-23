# TrustTrip

**A transparent bus ticket refund system built with Next.js**

## 🚌 Project Overview



---

## 🏗️ Project Structure

```
trusttrip/

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trusttrip
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

---

## 🎯 Features

### Core Functionality
- **Transparent Refund Calculation**: Step-by-step breakdown of refund amounts
- **Rule-Based System**: Clear business rules for different scenarios
- **Real-time Calculation**: Instant refund estimates based on ticket details
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features
- **Next.js 14**: Latest App Router with server-side rendering
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **API Routes**: Built-in backend functionality
- **Component Architecture**: Modular and reusable UI components

---

## 🔧 Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Modules |
| **Backend** | Next.js API Routes |
| **Development** | ESLint, Prettier, Husky |
| **Deployment** | Vercel (recommended) |

---

## 🔐 Environment Variables Configuration

### Setup

1. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your variables**
   Edit `.env.local` with your actual values. Never commit this file.

### Variable Types

#### Server-Side Variables (Keep Secret)
These variables are only accessible on the server and should never be exposed to the client:

- `DATABASE_URL` - PostgreSQL connection string
- `API_SECRET_KEY` - Secret key for API authentication
- `JWT_SECRET` - Secret for JWT token signing
- `SMTP_*` - Email service configuration
- `AWS_SECRET_ACCESS_KEY` - AWS secret credentials

#### Client-Side Variables (Safe to Expose)
These variables use the `NEXT_PUBLIC_` prefix and are safe to expose to the browser:

- `NEXT_PUBLIC_APP_URL` - Application base URL
- `NEXT_PUBLIC_API_BASE_URL` - API endpoint base URL
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps public key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env.local`** - It contains secrets
2. **Use `NEXT_PUBLIC_` prefix** - Only for client-safe variables
3. **Validate environment variables** - Check required vars at startup
4. **Use different keys per environment** - Dev, staging, production
5. **Rotate secrets regularly** - Especially in production

### Common Pitfalls Avoided

- ❌ **Secret Exposure**: Server-only variables don't use `NEXT_PUBLIC_` prefix
- ❌ **Missing Prefixes**: Client variables always use `NEXT_PUBLIC_` prefix
- ❌ **Build vs Runtime**: Environment variables are properly configured for both
- ❌ **Accidental Commits**: `.env.local` is ignored by git

### Environment-Specific Configuration

```bash
# Development
NODE_ENV="development"
NEXT_PUBLIC_ENVIRONMENT="development"

# Production
NODE_ENV="production"
NEXT_PUBLIC_ENVIRONMENT="production"
```

---

## 📊 Refund Calculation Logic

The refund system considers multiple factors:

1. **Time-based deductions**
   - 24+ hours before departure: 5% deduction
   - 12-24 hours: 15% deduction
   - 6-12 hours: 25% deduction
   - Less than 6 hours: 50% deduction

2. **Ticket type modifiers**
   - Standard tickets: Base calculation
   - Premium tickets: Reduced deduction rates
   - Promotional tickets: Higher deduction rates

3. **Additional factors**
   - Processing fees
   - Route-specific policies
   - Seasonal adjustments

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Manual Deployment
```bash
npm run build
npm run start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Integration with real bus booking APIs
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Admin panel for rule management

---

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation wiki

---

