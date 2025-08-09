   <img alt="RudderStack" width="512" src="https://raw.githubusercontent.com/rudderlabs/rudder-sdk-js/develop/assets/rs-logo-full-light.jpg">

# Rudderstack E2E Test Framework
![image](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=Playwright&logoColor=yellow)    ![js](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E
)   ![ts](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
)  ![pom](https://img.shields.io/badge/POM-48B9C7?style=for-the-badge&logo=pkgsrc&logoColor=white)

### 🤖 Overview

This test automation framework is developed using Playwright and Cucumber to automate End-to-End (E2E) testing for the Rudderstack application, adopting a Behavior-Driven Development (BDD) approach. It extensively utilizes the Page Object Model (POM) pattern to ensure robust code organization, maintainability, scalability, and reusability of test scripts. The framework supports both UI and API test automation, integrates comprehensive reporting, video recording on failure, and robust waiting mechanisms to handle asynchronous UI updates.

### 🏛️ Architecture

The framework is meticulously designed with a modular and layered architecture, incorporating several key design patterns to ensure clean, efficient, and reliable tests.

#### a. Page Object Model (POM)

*   Purpose: To abstract UI selectors and interactions from the test logic. This makes tests more readable, resilient to UI changes, and easier to maintain.
    
*   Implementation: Page-specific elements (locators) and actions are encapsulated within dedicated TypeScript classes (e.g., `LoginPage`, `ConnectionsPage` in the `page-objects/` directory). All page object classes extend a `BasePage`, centralizing common properties (like the Playwright `Page` instance) and shared methods to prevent code duplication.
    

#### b. Factory Pattern

*   Purpose: To provide an interface for creating complex objects without exposing their intricate instantiation logic, promoting cleaner code and easier data management.
    
*   Implementation: The `EventFactory` class (`page-objects/event-factory.ts`) is used to generate structured test data, such as API event payloads. This centralizes test data creation, making it simpler to manage and modify event structures.
    

#### c. Dependency Injection (DI)

*   Purpose: To supply external dependencies to components, enhancing modularity, testability, and decoupling.
    
*   Implementation: The Playwright `Page` object, which is created within Cucumber's `Before` hook, is then injected into the constructors of page object classes (e.g., `connectionsPage = new ConnectionsPage(this.page)`). This ensures page objects are decoupled from the test environment's specifics.
    

#### d. Global Hooks and Setup

*   Purpose: To centralize and manage all pre- and post-test actions, configurations, and teardown procedures across the entire test suite.
    
*   Implementation:
    
    *   Cucumber: The `hooks.ts` file (`tests/cucumber/hooks/hook.ts`) is the core of the global setup for BDD tests.
        
        *   The `BeforeAll` hook handles one-time global tasks such as loading environment variables, setting up the initial authenticated state, and creating necessary directories (e.g., for video recordings).
            
        *   The `Before` and `After` hooks manage scenario-specific operations. `Before` creates a fresh browser context and page for each test, loading the authenticated state. `After` performs teardown, including closing the context and browser, and finalizing video recordings.
            
    *   Standalone: For Playwright's native `.spec.ts` tests, `global-setup.ts` (if implemented) would manage similar one-time login procedures for each browser type, storing authentication states to be reused by individual test files. This ensures efficient execution without repeating login for every test.
        

### ✨ Key Features

*   Dual Test Runners: Supports executing tests using both:
    
    *   Cucumber (BDD Mode): For running `.feature` files with human-readable, behavior-driven scenarios.
        
    *   Playwright's Native Test Runner (Standalone Mode): For executing individual `.spec.ts` test files, ideal for focused unit or integration tests.
        
*   Environment Configuration: Dynamically loads configuration from `.env.development` or `.env.qa` files using `cross-env` and `dotenv`. This allows seamless testing against different environments (e.g., development, QA, staging) without code modifications.
    
*   E2E Video Recording: Automatically records a video of each test scenario's execution. These videos are invaluable for debugging failing tests, providing a visual replay of the entire test flow. Videos are saved to the `test-results/videos/` directory.
    
*   Failure Screenshots: On any test failure, a full-page screenshot is automatically captured. These screenshots are attached to the test report, providing immediate visual context and aiding in rapid debugging.
    
*   Robust Waiting Mechanisms: Employs Playwright's `expect().toPass()` with dynamic waiting and retry logic. This is crucial for handling asynchronous UI updates and inherent delays (e.g., event counts taking several minutes to reflect changes). The system continuously polls and refreshes the UI until the expected condition is met or a defined timeout is reached, preventing flaky tests due to timing issues.
    
*   Headed vs. Headless Mode: Tests can be executed in either mode. This is easily configurable via the `HEADLESS=false` environment variable, allowing for visual debugging during development and efficient headless execution in CI environments.
    
*   Reporting: Generates comprehensive test reports in HTML and JSON formats, providing detailed insights into test execution results.
    

### 📁 Files and Directory Structure

The framework adheres to a clean and logical directory structure to promote separation of concerns, enhance readability, and facilitate maintainability.

    /
    ├── .github/                      # GitHub 
        └── workflows/
    │       └── playwright.yml                # CI   
    
    workflow for running E2E tests
    
    ├── tests/                        # Root directory for all test suites
    │   ├── api/                      # Contains standalone API tests using Playwright's native runner
    │   │   └── rudderstack.spec.ts
    │   └── cucumber/                 # Primary directory for Behavior-Driven Development (BDD) tests
    │       ├── features/             # Gherkin .feature files (human-readable scenarios)
    │       │   └── uiEvents.feature
    │       ├── hooks/                # Cucumber hooks for global setup/teardown
    │       │   └── hook.ts           # (Browser launch, auth, video recording, etc.)
    │       └── step-definition/      # Step definitions (.ts files mapping Gherkin steps to code)
    │           └── uiEvents.steps.ts
    ├── page-objects/                 # Implementation of the Page Object Model (POM)
    │   ├── base-page.ts              # Base class for all page objects, providing common functionality
    │   ├── connection-page.ts        # Page object for the Connections UI dashboard
    │   ├── login-page.ts             # Page object for the Login UI
    │   └── event-factory.ts          # Factory for creating API event payloads (Factory Pattern)
    ├── test-results/                 # Output directory for all test artifacts
    │   ├── videos/                   # Recorded E2E test videos for each scenario
    │   └── screenshots/              # Screenshots captured automatically on test failures
    ├── .env.development              # Environment variables specific to the development environment
    ├── .env.qa                       # Environment variables specific to the QA environment
    ├── package.json                  # Project manifest: lists dependencies and defines npm scripts
    └── cucumber.js                   # Cucumber configuration file: defines paths, formats, and profiles
    

### 4\. Usage

#### a. Installation

To set up the framework and install all necessary dependencies, run the following commands in your project's root directory:

    npm install # Installs project dependencies from package.json
    npx playwright install --with-deps # Installs all required browser binaries for Playwright (Chromium, Firefox, WebKit)
    

#### b. Environment Variables

Create `.env.development` and `.env.qa` files in the project root based on your environment needs. These files should contain sensitive information like login credentials.

Example (`.env.development`):


    RUDDERSTACK_WRITE_KEY="your_write_key_here"
    RUDDERSTACK_DATAPLANE_URL="https://your_dataplane_url.com"
    RUDDERSTACK_USERNAME="your_username@example.com"
    RUDDERSTACK_PASSWORD="your_secure_password"
    
    

#### c. Scripts

The `package.json` file defines several convenient npm scripts for running tests in various modes and environments:

| Script | Description |
| --- | --- |
| npm run test:dev-ui-cucumber | Runs all Cucumber UI tests in the development environment (headless by default). Utilizes cucumber.js config. |
| npm run test:dev-ui-spec | Runs a specific standalone UI test (tests/ui/connections.spec.ts) in the development environment. |
| npm run test:dev-api-spec | Runs a specific standalone API test (tests/api/rudderstack.spec.ts) in the development environment. |
| npm run test:dev-ui-spec-headed | Runs a specific UI test in the development environment in headed mode (browser visible). |
| npm run debug:dev-ui-spec | Runs a specific UI test in the development environment in headed mode with Playwright's built-in debugger enabled. |
| npm run test:qa-ui-cucumber | Runs all Cucumber UI tests in the QA environment (headless by default). |
| npm run test:qa-ui-headed | Runs a specific UI test in the QA environment in headed mode (browser visible). |

### 5\. Continuous Integration (CI)

The framework is configured for seamless integration with GitHub Actions, ensuring that all tests run automatically on specified events (e.g., push to the `main` branch or pull requests). This helps maintain code quality and prevent regressions.

 **<h2 align="center"> Contributed by <a href="https://github.com/sudeepshukla930">Sudeep Shukla</a> With 💜. </h2>**