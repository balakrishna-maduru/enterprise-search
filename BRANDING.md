# Company Branding Configuration

This application supports multi-company branding configuration, allowing you to customize the appearance and company information for different organizations.

## Features

- **Dynamic Company Information**: Company name, logo, domain, and full name
- **Custom Logo Support**: Upload or specify URL for company logo
- **Color Scheme Customization**: Full color palette customization with Tailwind CSS integration
- **Theme Variables**: CSS custom properties for advanced theming
- **Runtime Configuration**: Change branding without rebuilding the application

## Configuration Methods

### 1. Environment Variables

Set the company configuration at build time:

```bash
REACT_APP_COMPANY_CONFIG=bank

```

### 2. Runtime Configuration

Change branding at runtime using localStorage:

```javascript
import { updateCompanyConfig } from './src/config/branding';

// Update company information
updateCompanyConfig({
  company: {
    name: 'Your Company',
    shortName: 'YC',
    domain: 'yourcompany.com',
    fullName: 'Your Company Inc.'
  },
  logo: {
    url: 'https://your-company.com/logo.png',
    alt: 'Your Company Logo',
    width: 120,
    height: 40
  },
  colors: {
    primary: {
      600: '#your-primary-color',
      // ... other shades
    }
  }
});
```

### 3. Admin Interface

Use the built-in admin interface to configure branding:

```javascript
import BrandingConfig from './src/components/Admin/BrandingConfig';

// Include in your admin panel
<BrandingConfig />
```

## File Structure

```
src/
├── config/
│   └── branding.js          # Main branding configuration
├── contexts/
│   └── BrandingContext.js   # React context for branding
├── components/
│   ├── UI/
│   │   └── CompanyLogo.js   # Company logo component
│   └── Admin/
│       └── BrandingConfig.js # Admin configuration interface
└── data/
    └── users.js            # User data with dynamic company domain
```

## Usage Examples

### Using the Branding Context

```javascript
import { useBranding } from './contexts/BrandingContext';

const MyComponent = () => {
  const { config, getCompanyName, getColor } = useBranding();
  
  return (
    <div>
      <h1>{getCompanyName()} Application</h1>
      <div style={{ backgroundColor: getColor('primary') }}>
        Primary color background
      </div>
    </div>
  );
};
```

### Using the Company Logo

```javascript
import CompanyLogo from './components/UI/CompanyLogo';

const Header = () => {
  return (
    <header>
      <CompanyLogo size="large" showText={true} />
    </header>
  );
};
```

### Using Tailwind CSS Classes

The color system integrates with Tailwind CSS:

```javascript
const Button = () => {
  return (
    <button className="bg-primary-600 hover:bg-primary-700 text-white">
      Primary Button
    </button>
  );
};
```

## Color System

The branding system supports three color types:

- **Primary**: Main brand colors
- **Secondary**: Supporting colors (usually grays)
- **Accent**: Highlight colors

Each color type has 9 shades (50, 100, 200, ..., 900) following Tailwind CSS conventions.

## Adding New Companies

To add a new company configuration:

1. Open `src/config/branding.js`
2. Add a new entry to the `companyConfigs` object:

```javascript
export const companyConfigs = {
  // ... existing configs
  yourcompany: {
    ...defaultBranding,
    company: {
      name: 'Your Company',
      shortName: 'YC',
      domain: 'yourcompany.com',
      fullName: 'Your Company Inc.'
    },
    colors: {
      ...defaultBranding.colors,
      primary: {
        // Your primary colors
      }
    }
  }
};
```

3. Set the environment variable: `REACT_APP_COMPANY_CONFIG=yourcompany`

## Advanced Customization

### Custom CSS Properties

You can define custom CSS properties in the theme configuration:

```javascript
theme: {
  '--custom-border-radius': '12px',
  '--custom-shadow': '0 8px 24px rgba(0, 0, 0, 0.1)',
  '--custom-font-family': 'Inter, sans-serif'
}
```

### Logo Configuration

The logo system supports:

- **URL**: Direct URL to logo image
- **Base64**: Embedded base64 image data
- **Fallback**: Automatic text-based logo generation

```javascript
logo: {
  url: 'https://example.com/logo.png',
  alt: 'Company Logo',
  width: 120,
  height: 40
}
```

## Local Storage Keys

The system uses company-specific localStorage keys:

- `{company_shortname}_saved_searches`: Saved searches
- `{company_shortname}_demo_initialized`: Demo data flag
- `company_config`: Runtime configuration override

## Demo Component

A demo component is available to test the branding system:

```javascript
import BrandingDemo from './components/Demo/BrandingDemo';

<BrandingDemo />
```

This component shows:
- Current configuration
- Component examples
- Environment variable usage
- Admin interface access