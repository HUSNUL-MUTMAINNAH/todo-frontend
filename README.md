# Todo Frontend

Frontend aplikasi todo management menggunakan Expo, React Native, dan TypeScript.

## Fitur

- **Cross-Platform** - Berjalan di iOS, Android, dan Web
- **Authentication** - User login dan register
- **Task Management** - Create, read, update, delete tasks
- **Categories** - Organize tasks dengan categories
- **Real-time Notifications** - Push notifications untuk updates
- **Offline Support** - Local storage untuk offline functionality
- **E2E Testing** - Automated testing dengan Playwright
- **TypeScript** - Type-safe development

## Tech Stack

- **Expo** - Cross-platform development platform
- **React Native** - Mobile framework
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - Navigation dengan file-based routing
- **Context API** - State management
- **Playwright** - E2E testing
- **Expo Go** - Development client

## Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn
- Expo CLI
- iOS Simulator / Android Emulator (untuk testing)
- Expo Go app (untuk mobile testing)

## Setup

### Installation

1. Clone repository
```bash
git clone https://github.com/HUSNUL-MUTMAINNAH/todo-frontend.git
cd todo-frontend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

## Development

### Start Expo Development Server

```bash
npx expo start
```

Setelah server dimulai, tekan:
- `i` - Open iOS Simulator
- `a` - Open Android Emulator
- `w` - Open Web version
- `j` - Open debugger

### Android Development

Memerlukan Android Studio dan Android SDK:
```bash
npx expo start --android
```

### iOS Development

Memerlukan Xcode (macOS only):
```bash
npx expo start --ios
```

### Web Development

Development web version:
```bash
npx expo start --web
```

Akses di `http://localhost:19006`

## Project Structure

```
src/
├── app/                    # App pages (file-based routing)
├── components/            # Reusable components
├── services/              # API services
├── context/               # Context API for state management
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── constants/             # Constants dan config
└── global.css            # Global styles

e2e/                       # End-to-end tests
├── auth.spec.ts          # Authentication tests
├── tasks.spec.ts         # Task management tests
└── notifications.spec.ts # Notification tests

scripts/
├── reset-project.js      # Reset project script
```

## Screens

- **Login** - User authentication
- **Register** - Create new account
- **Dashboard** - Overview dan quick stats
- **Tasks** - View dan manage tasks
- **Categories** - Manage task categories
- **Profile** - User profile settings
- **Notifications** - View notifications

## API Integration

Frontend terhubung dengan todo-backend API. Setup:

1. Pastikan backend server running
2. Set `EXPO_PUBLIC_API_URL` di `.env.local`
3. Test koneksi dengan authentication

## Testing

### E2E Testing

Jalankan Playwright e2e tests:
```bash
npm run test:e2e
```

Test coverage:
- Authentication flows (login, register, logout)
- Task CRUD operations
- Category management
- Notification handling

### Manual Testing

Untuk testing manual, gunakan:
- **iOS Simulator** - XCode tools
- **Android Emulator** - Android Studio
- **Web Browser** - Expo web version
- **Expo Go** - Mobile app untuk real device testing

## Build

### Production Build

Web build:
```bash
npx expo export --platform web
```

Outputs ke folder `dist/`

### EAS Build (Native Builds)

Setup EAS:
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

Requires EAS account dan billing.

## Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "reset-project": "node scripts/reset-project.js",
  "test:e2e": "playwright test",
  "test:e2e:debug": "playwright test --debug"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| EXPO_PUBLIC_API_URL | Backend API URL |
| EXPO_PUBLIC_APP_ENV | App environment (development/production) |

## Deployment

### Web Deployment (Vercel)

1. Build untuk web:
```bash
npx expo export --platform web
```

2. Push ke GitHub
3. Connect ke Vercel
4. Vercel akan otomatis deploy

### Mobile Deployment

- **iOS** - EAS Build → TestFlight → App Store
- **Android** - EAS Build → Google Play Console

## Troubleshooting

### Metro Bundler Issues
```bash
npx expo start --clear
```

### Module Not Found
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Port Already in Use
```bash
npx expo start --port 8081
```

## Documentation Files

- `TESTING.md` - Testing documentation
- `E2E-TEST-RESULTS.md` - E2E test results
- `AGENTS.md` - Agent configuration
- `e2e/README.md` - E2E testing guide

## Support

Untuk pertanyaan atau issues, buat issue di GitHub repository.

## License

MIT
