# 🧪 Test Setup & Execution Guide

**Project:** Media-Manager
**Test Framework:** Vitest
**Coverage Target:** 70%+ for critical components
**Last Updated:** 2026-03-04

---

## 📋 Installation & Setup

### Step 1: Install Testing Dependencies

```bash
npm install --save-dev \
  vitest@latest \
  @vitest/ui \
  @vitest/coverage-v8 \
  @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  jsdom \
  @vitejs/plugin-react
```

### Step 2: Configure Vitest

Files created:
- `vitest.config.ts` - Main vitest configuration
- `vitest.setup.ts` - Test setup and global mocks

### Step 3: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:auth": "vitest run __tests__/auth.test.ts",
    "test:api": "vitest run __tests__/api.test.ts",
    "test:functions": "vitest run __tests__/edge-functions.test.ts",
    "test:e2e": "vitest run __tests__/e2e.test.ts"
  }
}
```

---

## 🏃 Running Tests

### Run All Tests (Single Run)
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI Dashboard
```bash
npm run test:ui
# Opens at http://localhost:51204
```

### Run Specific Test Suites
```bash
npm run test:auth          # Auth context tests
npm run test:api           # API endpoint tests
npm run test:functions     # Edge function tests
npm run test:e2e           # End-to-end workflow tests
```

### Generate Coverage Report
```bash
npm run test:coverage
# HTML report: ./coverage/index.html
```

---

## 📊 Test Files & Coverage

### Test Files Created

| File | Tests | Type | Coverage Target |
|------|-------|------|-----------------|
| `__tests__/auth.test.ts` | 10 | Unit | Auth system 100% |
| `__tests__/api.test.ts` | 25+ | Unit | API endpoints 80% |
| `__tests__/edge-functions.test.ts` | 30+ | Unit | Edge functions 75% |
| `__tests__/e2e.test.ts` | 25+ | E2E | Critical workflows |

**Total Test Cases:** 90+

### Coverage Targets

```
Global Target: 70%
├── Lines:       70%
├── Functions:   70%
├── Branches:    70%
└── Statements:  70%

Critical Components Target: 85%+
├── Auth context:       100%
├── API endpoints:      80%
├── Edge functions:     75%
└── Rules engine:       85%
```

---

## 🧩 Test Structure

### Unit Tests (`auth.test.ts`)

```typescript
describe('Auth Context', () => {
  describe('AuthProvider initialization', () => {
    it('should initialize with null user', () => {
      // Test implementation
    });
  });
});
```

**10 test cases covering:**
- Session initialization
- Auth state transitions
- SignOut cleanup
- useAuth hook validation
- Error handling

### API Tests (`api.test.ts`)

```typescript
describe('API Endpoints - Notifications', () => {
  describe('GET /api/notifications', () => {
    it('should require authentication', () => {
      // Test implementation
    });
  });
});
```

**25+ test cases covering:**
- Authentication guards
- Input validation
- RLS enforcement
- Pagination
- Error handling
- Security vulnerabilities

### Edge Function Tests (`edge-functions.test.ts`)

```typescript
describe('Edge Functions', () => {
  describe('refresh-tokens function', () => {
    it('should validate required environment variables', () => {
      // Test implementation
    });
  });
});
```

**30+ test cases covering:**
- Environment variable validation
- API integration
- Error handling
- Retry logic
- Data transformation
- Logging

### E2E Tests (`e2e.test.ts`)

```typescript
describe('E2E: User Workflows', () => {
  it('should complete full login flow', async () => {
    // Test implementation
  });
});
```

**25+ test cases covering:**
- Authentication flows
- Campaign management
- Rules automation
- Notifications
- Analytics & exports
- Error scenarios

---

## ✅ Quality Gates

### PASS Criteria (All must be true)
- ✅ All tests pass
- ✅ 70%+ code coverage
- ✅ No console errors/warnings
- ✅ No memory leaks detected
- ✅ Performance acceptable (<50ms per test)

### FAIL Criteria (Any of these = FAIL)
- ❌ Any test failure
- ❌ Coverage below 70%
- ❌ Unhandled exceptions
- ❌ Memory leaks in cleanup
- ❌ Tests timeout (>10s)

---

## 🔧 Debugging Tests

### Run Single Test
```bash
npx vitest run __tests__/auth.test.ts -t "should initialize"
```

### Run with Console Output
```bash
npx vitest run --reporter=verbose
```

### Run with Debug Info
```bash
DEBUG=* npx vitest run
```

### Use Vitest Inspector
```bash
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

---

## 📈 Coverage Analysis

### Viewing Coverage Reports

1. **Terminal Summary:**
```bash
npm run test:coverage
```

2. **HTML Report:**
```bash
npm run test:coverage
# Open: coverage/index.html in browser
```

3. **JSON Report:**
```bash
# Generated: coverage/coverage-final.json
```

### Interpreting Coverage

```
File                    | Statements | Branches | Functions | Lines
auth-context.tsx        | 100%       | 100%     | 100%      | 100%
notifications/route.ts  | 85%        | 72%      | 80%       | 85%
api.test.ts             | 95%        | 88%      | 100%      | 95%
```

**Goal:** All critical files at 80%+

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 📚 Test Best Practices

### DO ✅
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Keep tests focused and fast
- ✅ Clean up after each test

### DON'T ❌
- ❌ Test internal state directly
- ❌ Create long, complex tests
- ❌ Skip error case testing
- ❌ Test implementation details
- ❌ Ignore test failures
- ❌ Leave test data in database

### Example: Good Test

```typescript
it('should fetch notifications with correct filters', async () => {
  // Arrange
  const mockNotifications = [{ id: 1, read: false }];
  mockSupabase.from.mockReturnValueOnce(mockQuery);

  // Act
  const result = await getNotifications({
    filter: 'unread',
    limit: 10,
  });

  // Assert
  expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
  expect(result).toEqual(mockNotifications);
});
```

---

## 🆘 Troubleshooting

### Tests Timeout
```
Error: Test timed out after 10000ms
```
**Solution:** Increase timeout in vitest.config.ts
```typescript
testTimeout: 20000
```

### Mock Not Working
```
Error: Cannot find module '@/lib/supabase'
```
**Solution:** Ensure mocks are defined in vitest.setup.ts

### Coverage Not Generated
```
Error: No coverage information
```
**Solution:** Run with coverage flag
```bash
npm run test:coverage
```

### Tests Not Found
```
Error: No files matching __tests__/**/*.test.ts
```
**Solution:** Ensure test files follow naming pattern

---

## 📞 Next Steps

1. **Run test setup:** `npm install && npm run test`
2. **View coverage:** `npm run test:coverage`
3. **Monitor in CI/CD:** Set up GitHub Actions
4. **Iterate:** Fix failing tests and improve coverage
5. **Deploy:** Once coverage >70%, ready for deployment

---

## 📋 Checklist Before Production

- [ ] All tests passing (100%)
- [ ] Coverage >= 70% globally
- [ ] Critical components >= 85% coverage
- [ ] No console errors in tests
- [ ] No memory leaks detected
- [ ] CI/CD pipeline configured
- [ ] Coverage reports reviewed
- [ ] Technical debt documented
- [ ] Performance acceptable
- [ ] Security tests passing

---

**Generated by:** Quinn (QA Agent)
**Status:** Ready for test implementation
**Effort Estimate:** 3-5 days to implement all tests
