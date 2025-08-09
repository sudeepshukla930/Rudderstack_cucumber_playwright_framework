const path = require('path');
const dotenv = require('dotenv');

// 1. E2E_ENV variable ko check karein
const environment = process.env.E2E_ENV || 'development';

// 2. Sahi .env file ka path banayein
const envPath = path.resolve(__dirname, `.env.${environment}`);

// 3. Uss specific .env file ko load karein
dotenv.config({ path: envPath });
module.exports = {
    default: {
        tags: process.env.npm_config_TAGS || "",
        formatOptions: {
            snippetInterface: "async-await"
        },
       paths: [
            "tests/cucumber/features/" 
        ],
        publishQuiet: true,
        dryRun: false,
        require: [
            "tests/cucumber/step-definition/*.ts",
            "tests/cucumber/hooks/hook.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            
        ],
        
    },
    // rerun: {
    //     formatOptions: {
    //         snippetInterface: "async-await"
    //     },
    //     publishQuiet: true,
    //     dryRun: false,
    //     require: [
    //           "tests/cucumber/step-definition/*.ts",
    //         "tests/cucumber/hooks/hook.ts"
    //     ],
    //     requireModule: [
    //         "ts-node/register"
    //     ],
    //     format: [
    //         "progress-bar",
    //         "html:test-results/cucumber-report.html",
    //         "json:test-results/cucumber-report.json",
    //         "rerun:@rerun.txt"
    //     ],
    //     parallel: 2
    // }
}