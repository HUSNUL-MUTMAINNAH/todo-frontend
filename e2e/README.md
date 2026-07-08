# E2E Testing with Playwright

## Overview
This directory contains end-to-end tests for the To Do List application using Playwright.

## Test Files
- **auth.spec.ts** - Authentication flow tests (login, register, logout)
- **tasks.spec.ts** - Task management tests (create, update, delete, filter)
- **notifications.spec.ts** - Notification system tests

## Prerequisites
- Node.js installed
- Playwright browsers installed
- Application deployed to Vercel (or running locally)

## Installation
Browsers are already installed. If you need to reinstall:
```bash
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
```

## View Test Reports

### Open HTML report
```bash
npm run test:e2e:report
```

### Report location
- HTML report: `playwright-report/index.html`
- JSON results: `test-results/results.json`

## Configuration
Test configuration is in `playwright.config.ts`:
- Base URL: https://todo-frontend-qwseratdq-nana-todolist.vercel.app
- Browser: Chromium (Chrome)
- Screenshots: On failure
- Videos: On failure
- Traces: On first retry

## Test User Setup
Before running tests, you may need to:
1. Create a test user manually, or
2. Update TEST_USER credentials in test files

Current test user in `tasks.spec.ts` and `notifications.spec.ts`:
```typescript
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};
```

## CI/CD Integration
Tests are configured to run in CI with:
- 2 retries on failure
- Single worker (no parallel execution)
- No interactive report opening

## Troubleshooting

### SSL Certificate Errors
If browser download fails with SSL errors:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx playwright install chromium
```

### Port Already in Use
If testing against local server and port is busy:
1. Stop other processes using the port
2. Or update `baseURL` in `playwright.config.ts`

### Test Timeouts
Increase timeout in test file:
```typescript
test.setTimeout(60000); // 60 seconds
```

### Selector Issues
If tests fail due to element not found:
1. Run in headed mode to see what's happening
2. Use Playwright inspector: `npm run test:e2e:debug`
3. Update selectors in test files

## Best Practices
1. **Keep tests independent** - Each test should work on its own
2. **Use data-testid** - Add `data-testid` attributes to frontend components for stable selectors
3. **Clean up after tests** - Delete test data created during tests
4. **Use page objects** - For better maintainability (optional for small projects)
5. **Wait for elements** - Use Playwright's auto-waiting instead of fixed timeouts

## Future Improvements
- [ ] Add more test scenarios (calendar, categories)
- [ ] Implement page object pattern
- [ ] Add visual regression testing
- [ ] Integrate with CI/CD pipeline
- [ ] Add performance testing
- [ ] Test mobile viewport
