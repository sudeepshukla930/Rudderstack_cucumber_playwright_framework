// File: tests/setup/global.setup.ts
import { chromium, firefox, webkit, type FullConfig } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';

async function globalSetup(config: FullConfig) {
  console.log('Global setup starting...');
  const { projects } = config;

  for (const project of projects) {
    if (project.name === 'chromium' || project.name === 'firefox' || project.name === 'webkit') {
      console.log(`Setting up authentication for ${project.name}...`);
      const browser = await (project.use.browserName === 'chromium' ? chromium.launch() :
                             project.use.browserName === 'firefox' ? firefox.launch() :
                             webkit.launch());
      
      const page = await browser.newPage();
      const loginPage = new LoginPage(page);

      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.RUDDERSTACK_USERNAME!,
        process.env.RUDDERSTACK_PASSWORD!
      );
      
      //  new, reusable method to check for dashboard visibility
    //   const isDashboardVisible = await loginPage.isDashboardVisible();
      
    //   if (!isDashboardVisible) {
    //     console.log('Connections page not immediately visible. Handling post-login prompts...');
    //     await loginPage.skip2FA();
    //     await loginPage.closePopup();
    //   } else {
    //     console.log('Connections page visible, skipping post-login checks.');
    //   }

     await loginPage.handleSequentialPostLogin();
      
      await loginPage.verifyLoginSuccess();

      await page.context().storageState({ path: `tests/auth/${project.name}.json` });
      
      await browser.close();
      console.log(`Authentication for ${project.name} complete.`);
    }
  }
}

export default globalSetup;