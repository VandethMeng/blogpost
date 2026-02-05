# Testing Guide

## Overview

This project uses a comprehensive testing strategy with three test types:

- **Unit Tests**: Test individual functions and components in isolation (Jest)
- **Integration Tests**: Test API routes with in-memory MongoDB database (Jest)
- **E2E Tests**: Test complete user flows in a real browser (Playwright)

## Test Structure

```
__tests__/
├── unit/
│   ├── lib/
│   │   └── auth.test.ts          # Password hashing utilities
│   └── components/
│       └── PostForm.test.tsx     # PostForm component
├── integration/
│   ├── auth.test.ts              # Auth API routes
│   ├── posts.test.ts             # Posts API routes
│   └── comments.test.ts          # Comments API routes
└── helpers/
    └── testDb.ts                 # MongoDB Memory Server helpers

e2e/
├── auth.spec.ts                  # Authentication flows
├── posts.spec.ts                 # Post creation/editing/deletion
└── comments.spec.ts              # Comment functionality
```

## Test Status

✅ **Unit Tests**: 11/11 passing  
⚠️ **Integration Tests**: Requires dev server + ESM module configuration (see below)
✅ **E2E Tests**: Playwright installed and configured

## Running Tests

### Unit Tests (Jest)

```bash
# Run unit tests (fully working)
npm run test:unit

# Run all Jest tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests (headless mode)
npm run test:e2e

# Run with interactive UI mode (recommended for development)
npm run test:e2e:ui

# Run in debug mode with step-by-step execution
npm run test:e2e:debug

# Run only in Chromium browser
npm run test:e2e:chromium

# View HTML test report
npm run test:e2e:report
```

**Note**: E2E tests automatically start the Next.js dev server on port 3000. If you have a server already running on that port, the tests will reuse it.

### Integration Tests

**Note**: Integration tests require additional setup due to ESM module issues with MongoDB Memory Server. For now, focus on unit tests and E2E tests which are fully functional.

## Unit Tests

### Auth Utilities (`__tests__/unit/lib/auth.test.ts`)

Tests password hashing and verification:

- ✅ Hash password correctly
- ✅ Produce different hashes for different passwords
- ✅ Produce consistent hashes for same password
- ✅ Verify correct password
- ✅ Reject incorrect password
- ✅ Case sensitivity

### PostForm Component (`__tests__/unit/components/PostForm.test.tsx`)

Tests form behavior:

- ✅ Render all form fields
- ✅ Update input values on change
- ✅ Submit form and call API
- ✅ Clear form after submission
- ✅ Prevent submission with empty fields

## E2E Tests (Playwright)

End-to-end tests simulate real user interactions in actual browsers (Chromium, Firefox, WebKit).

### Authentication Flow (`e2e/auth.spec.ts`)

Tests complete auth flows:

- ✅ Display login/signup links
- ✅ Navigate to signup page
- ✅ Sign up new user
- ✅ Login existing user
- ✅ Show error for invalid credentials
- ✅ Logout successfully
- ✅ Prevent duplicate email registration

### Blog Posts (`e2e/posts.spec.ts`)

Tests post management:

- ✅ Display existing posts
- ✅ Create new post when authenticated
- ✅ Hide create form when not authenticated
- ✅ Edit own post
- ✅ Delete own post
- ✅ Display posts in chronological order

### Comments (`e2e/comments.spec.ts`)

Tests comment functionality:

- ✅ Add comment to post
- ✅ Display comment author
- ✅ Add multiple comments to same post
- ✅ Delete own comment
- ✅ Prevent empty comments
- ✅ Display comment timestamp
- ✅ Preserve comments after page reload
- ✅ Multiple users can comment on same post

## Integration Tests

### Prerequisites

Integration tests require:

## Integration Tests (Jest)

### Prerequisites

Integration tests require:

1. **Next.js dev server running** on `http://localhost:3000`
2. **MongoDB Memory Server** (automatically started by tests)

**Start dev server before running integration tests:**

```bash
npm run dev
```

Then in another terminal:

```bash
npm run test:integration
```

### Auth Routes (`__tests__/integration/auth.test.ts`)

Tests authentication flow:

- ✅ Signup new user
- ✅ Prevent duplicate email
- ✅ Login with correct credentials
- ✅ Reject incorrect password
- ✅ Get current user info
- ✅ Logout successfully

### Posts Routes (`__tests__/integration/posts.test.ts`)

Tests post CRUD operations:

- ✅ Get all posts (empty and populated)
- ✅ Posts sorted by date (newest first)
- ✅ Pagination with skip/limit
- ✅ Create post (authenticated)
- ✅ Reject unauthenticated post creation
- ✅ Get single post by ID
- ✅ Update post (authenticated)
- ✅ Delete post (authenticated)

### Comments Routes (`__tests__/integration/comments.test.ts`)

Tests comment operations:

- ✅ Add comment to post (authenticated)
- ✅ Reject unauthenticated comments
- ✅ Validate required fields
- ✅ Handle non-existent posts
- ✅ Delete comment (authenticated)

## Test Database

Integration tests use **MongoDB Memory Server** for isolation:

- Each test suite creates a fresh in-memory database
- Tests don't affect production/development data
- Automatic cleanup after tests complete

Helper functions in [`__tests__/helpers/testDb.ts`](c:\Users\Dell\OneDrive\Desktop\nextjs-courses\blogpost__tests__\helpers\testDb.ts):

- `setupTestDb()` - Initialize memory server
- `teardownTestDb()` - Stop memory server
- `clearTestDb()` - Clear all collections
- `getTestDb()` - Get database instance

## Playwright Configuration

E2E tests are configured in [`playwright.config.ts`](c:\Users\Dell\OneDrive\Desktop\nextjs-courses\blogpost\playwright.config.ts):

- **Test Directory**: `e2e/`
- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: `http://localhost:3000`
- **Auto Server**: Automatically starts/stops Next.js dev server
- **Reports**: HTML report generated at `playwright-report/`
- **Screenshots**: Captured on test failure
- **Traces**: Recorded on first retry

### Playwright Best Practices

1. **Use meaningful selectors**: Prefer `getByRole`, `getByText`, `getByPlaceholder` over CSS selectors
2. **Wait for elements**: Playwright auto-waits, but use `expect(...).toBeVisible()` for clarity
3. **Test user flows**: E2E tests should simulate real user interactions
4. **Isolate test data**: Use timestamps in test data to avoid conflicts
5. **Clean up**: Tests create their own users/posts/comments each run

## Coverage Thresholds

Minimum coverage requirements (configured in [`jest.config.js`](c:\Users\Dell\OneDrive\Desktop\nextjs-courses\blogpost\jest.config.js)):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Run `npm run test:coverage` to see coverage report.

## Best Practices

1. **Unit Tests** (Jest):
   - Test functions in isolation
   - Mock external dependencies
   - Fast execution (no I/O operations)

2. **Integration Tests** (Jest):
   - Test full request/response cycle
   - Use real database (in-memory)
   - Test authentication flows
   - Verify data persistence

3. **E2E Tests** (Playwright):
   - Test complete user journeys
   - Use real browsers
   - Test critical paths (signup, login, post creation)
   - Verify UI updates and interactions

4. **General**:
   - Clear test names describing behavior
   - One assertion per test (when possible)
   - Setup/teardown for clean state
   - Test edge cases and errors

## Troubleshooting

### E2E tests failing

**Problem**: Tests timeout or fail to connect

**Solution**:

- Playwright automatically starts the dev server, wait for it to initialize
- If port 3000 is in use by another app, stop it first
- Check [playwright-report/index.html](c:\Users\Dell\OneDrive\Desktop\nextjs-courses\blogpost\playwright-report\index.html) for screenshots and traces

**Problem**: Selector not found

**Solution**:

- Use `npm run test:e2e:debug` to step through test
- Verify element is visible in the UI
- Check if element needs authentication to appear

### Integration tests failing

**Problem**: Tests timeout or connection refused

**Solution**: Make sure dev server is running:

```bash
npm run dev
```

### MongoDB Memory Server errors

**Problem**: Memory server fails to start

**Solution**:

1. Clear cache: `rm -rf node_modules/.cache`
2. Reinstall: `npm install mongodb-memory-server --force`

### TypeScript errors in tests

**Problem**: Type errors in test files

**Solution**: Ensure `@types/jest` is installed and `jest.config.js` uses `ts-jest` preset

## CI/CD Integration

To run tests in GitHub Actions or other CI:

```yaml
- name: Run tests
  run: |
    npm run build  # Build Next.js first
    npm run test:unit  # Unit tests don't need server
    npm run dev & # Start server in background
    sleep 10  # Wait for server startup
    npm run test:integration  # Integration tests
```

## Future Improvements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Test admin routes and authorization
- [ ] Test error boundaries and edge cases
- [ ] Add visual regression tests
- [ ] Performance benchmarking tests
