# Lace and Legacy - Project Documentation

## Overview

Lace and Legacy is a modern e-commerce platform specializing in vintage and retro fashion. Built with React, the application provides a comprehensive shopping experience with advanced filtering, responsive design, and modern UI components.

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── buttons/        # Button components
│   ├── cards/          # Card components
│   ├── catalog/        # Product catalog components
│   ├── forms/          # Form input components
│   ├── icons/          # Custom icon components
│   ├── layout/         # Layout components
│   ├── loaders/        # Loading components
│   ├── navigation/     # Navigation components
│   ├── products/       # Product-related components
│   ├── reviews/        # Review components
│   ├── typography/     # Typography components
│   └── ui/             # Generic UI components
├── contexts/           # React Context providers
├── data/              # Mock data and constants
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API services
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Pages Documentation

### Core Shopping Pages

#### 1. HomePage.jsx
**Route**: `/`
**Purpose**: Landing page showcasing featured products and brand introduction

**Key Features**:
- Typewriter effect hero section with rotating text
- Featured product carousel
- Brand story section
- Newsletter signup
- Quick view modal integration

**Components Used**:
- `ProductCard`
- `QuickViewModal`
- Custom typewriter animation

#### 2. ProductCatalogPage.jsx
**Route**: `/products`
**Purpose**: Main product browsing and filtering interface

**Key Features**:
- **Sticky Filter Header**: Positioned below main header with proper z-index
- **Advanced Search**: Debounced search with 300ms delay
- **Responsive Filter System**: 
  - Desktop: Collapsible sidebar with smooth transitions
  - Mobile: Full-screen overlay using Sheet component
- **Active Filters Display**: Badge components with individual remove buttons
- **Sorting Options**: Name, price, newest, era-based sorting
- **View Modes**: Grid and list views with responsive breakpoints
- **Pagination**: Configurable items per page (12, 24, 48)
- **Dynamic Layout**: Proper height calculation and sticky positioning

**State Management**:
```javascript
const [filters, setFilters] = useState({
  sizes: [],
  colors: [],
  priceRange: [0, 1000],
  eras: [],
  styles: [],
  conditions: []
});
```

**Components Used**:
- `FilterSidebar`
- `ProductCard`
- `QuickViewModal`
- `Select`, `Badge`, `Sheet`, `Input`, `Button`

#### 3. ProductDetailPage.jsx
**Route**: `/products/:id`
**Purpose**: Detailed product information and purchase interface

**Key Features**:
- Image gallery with zoom functionality
- Size and color selection
- Quantity controls
- Add to cart functionality
- Wishlist integration
- Size guide modal
- Product reviews section
- Related product recommendations
- Breadcrumb navigation

**Components Used**:
- `ImageGallery`
- `SizeGuideModal`
- `ReviewSection`
- `ProductRecommendations`

### Shopping Flow Pages

#### 4. CartPage.jsx
**Route**: `/cart`
**Purpose**: Shopping cart management and order summary

**Key Features**:
- Item quantity modification
- Remove items functionality
- Move to wishlist option
- Order total calculation
- Shipping cost estimation
- Promo code application
- Continue shopping link
- Checkout button

#### 5. CheckoutPage.jsx
**Route**: `/checkout`
**Purpose**: Multi-step checkout process

**Key Features**:
- **4-Step Process**: Shipping → Billing → Payment → Review
- Guest checkout option
- Form validation
- Address autocomplete
- Payment method selection
- Order summary sidebar
- Progress indicator
- Secure payment processing

**Steps**:
1. **Shipping**: Address and delivery options
2. **Billing**: Billing address (can copy from shipping)
3. **Payment**: Credit card and payment method selection
4. **Review**: Final order confirmation

#### 6. OrderConfirmationPage.jsx
**Route**: `/order-confirmation`
**Purpose**: Post-purchase confirmation and next steps

**Key Features**:
- Order number display
- Estimated delivery date
- Order summary
- Tracking information
- Email confirmation notice
- Continue shopping option

### Account Management Pages

#### 7. LoginPage.jsx
**Route**: `/login`
**Purpose**: User authentication

**Key Features**:
- Email/password login
- Remember me option
- Forgot password link
- Social login options
- Registration redirect

#### 8. RegisterPage.jsx
**Route**: `/register`
**Purpose**: New user account creation

**Key Features**:
- Personal information form
- Email verification
- Password strength indicator
- Terms and conditions acceptance
- Newsletter subscription option

#### 9. DashboardPage.jsx
**Route**: `/dashboard`
**Purpose**: User account dashboard

**Key Features**:
- Account overview
- Recent orders
- Wishlist summary
- Profile completion status
- Quick actions menu

#### 10. OrderHistoryPage.jsx
**Route**: `/orders`
**Purpose**: Complete order history and tracking

**Key Features**:
- Order list with status
- Order details modal
- Reorder functionality
- Download invoices
- Track shipments

#### 11. WishlistPage.jsx
**Route**: `/wishlist`
**Purpose**: Saved items management

**Key Features**:
- Wishlist item grid
- Move to cart functionality
- Remove items
- Share wishlist
- Stock notifications

### Information Pages

#### 12. AboutPage.jsx
**Route**: `/about`
**Purpose**: Brand story and company information

**Key Features**:
- Company history
- Mission and values
- Team information
- Sustainability practices

#### 13. ContactPage.jsx
**Route**: `/contact`
**Purpose**: Customer support and contact information

**Key Features**:
- Contact form
- FAQ section
- Store locations
- Business hours
- Social media links

#### 14. FAQPage.jsx
**Route**: `/faq`
**Purpose**: Frequently asked questions

**Key Features**:
- Categorized questions
- Search functionality
- Expandable answers
- Contact support option

### Policy and Guide Pages

#### 15. SizeGuidePage.jsx
**Route**: `/size-guide`
**Purpose**: Sizing information and measurement guide

#### 16. CareGuidePage.jsx
**Route**: `/care-guide`
**Purpose**: Vintage clothing care instructions

#### 17. ShippingReturnsPage.jsx
**Route**: `/shipping-returns`
**Purpose**: Shipping and return policy information

#### 18. PrivacyPolicyPage.jsx
**Route**: `/privacy`
**Purpose**: Privacy policy and data handling information

#### 19. ReturnPolicyPage.jsx
**Route**: `/returns`
**Purpose**: Return and exchange policy details

### Utility Pages

#### 20. NotFoundPage.jsx
**Route**: `*` (catch-all)
**Purpose**: 404 error page

**Key Features**:
- Friendly error message
- Navigation suggestions
- Search functionality
- Return to home option

#### 21. EmailVerificationPage.jsx
**Route**: `/verify-email`
**Purpose**: Email verification process

#### 22. ForgotPasswordPage.jsx
**Route**: `/forgot-password`
**Purpose**: Password reset functionality

#### 23. ThankYouPage.jsx
**Route**: `/thank-you`
**Purpose**: Generic thank you page for various actions

## Key Components

### UI Components

#### Badge.jsx
- Variants: default, secondary, destructive, outline, success
- Sizes: sm, md, lg
- Framer Motion animations
- Click event handling

#### Sheet.jsx
- Mobile-first overlay component
- Framer Motion slide animations
- Body scroll lock
- Accessibility features

#### Select.jsx
- Custom dropdown component
- Keyboard navigation
- Search functionality
- Multi-select support

#### Button.jsx
- Multiple variants and sizes
- Loading states
- Icon support
- Accessibility compliant

### Product Components

#### ProductCard.jsx
- Grid and list view modes
- Quick view functionality
- Add to cart integration
- Wishlist toggle
- Hover animations

#### FilterSidebar.jsx
- Collapsible filter sections
- Range sliders for price
- Multi-select checkboxes
- Clear filters functionality

#### QuickViewModal.jsx
- Product preview modal
- Image carousel
- Basic product actions
- Responsive design

## State Management

### Context Providers

#### CartContext
- Cart items management
- Add/remove/update items
- Persistent storage
- Total calculations

#### AuthContext
- User authentication state
- Login/logout functionality
- Protected routes
- User profile data

#### ThemeContext
- Dark/light mode toggle
- Theme persistence
- CSS variable management

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Progressive enhancement
- Touch-friendly interfaces
- Optimized navigation
- Compressed layouts

## Performance Optimizations

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports

### Search Optimization
- Debounced search queries (300ms)
- Memoized filter results
- Efficient re-rendering

### Image Optimization
- Lazy loading
- WebP format support
- Responsive images
- Placeholder loading

## Accessibility Features

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

## Testing Strategy

### Component Testing
- Unit tests for components
- Integration tests for pages
- Snapshot testing
- Accessibility testing

### User Flow Testing
- Shopping cart flow
- Checkout process
- Authentication flow
- Filter functionality

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
- API endpoints
- Payment gateway keys
- Analytics tracking IDs
- Feature flags

## Future Enhancements

### Planned Features
- Real-time inventory updates
- Advanced recommendation engine
- Social sharing integration
- Multi-language support
- Progressive Web App features

### Performance Improvements
- Server-side rendering
- CDN integration
- Image optimization service
- Caching strategies

## Development Guidelines

### Code Standards
- ESLint configuration
- Prettier formatting
- Component naming conventions
- File organization patterns

### Git Workflow
- Feature branch strategy
- Pull request reviews
- Automated testing
- Deployment pipelines

---

*This documentation provides a comprehensive overview of the Lace and Legacy e-commerce platform, focusing on the page structure and functionality. For technical implementation details, refer to the individual component files and their inline documentation.*