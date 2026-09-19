const { defineConfig } = require('@playwright/test');
const projects = [
  { name:'tablet', use:{ browserName:'chromium', viewport:{width:1280,height:800}, hasTouch:true, isMobile:true, deviceScaleFactor:1 } },
  { name:'phone', use:{ browserName:'chromium', viewport:{width:360,height:740}, hasTouch:true, isMobile:true, deviceScaleFactor:2 } },
  { name:'phone-landscape', use:{ browserName:'chromium', viewport:{width:740,height:360}, hasTouch:true, isMobile:true, deviceScaleFactor:1 } },
  { name:'safari', use:{ browserName:'webkit', viewport:{width:390,height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2 } }
];
if (process.env.CHROME95_PATH) projects.push({name:'chrome95',use:{browserName:'chromium',viewport:{width:1280,height:800},hasTouch:true,isMobile:true,deviceScaleFactor:1,launchOptions:{executablePath:process.env.CHROME95_PATH}}});
module.exports=defineConfig({
  testDir:'tests',fullyParallel:true,workers:process.env.CI?2:1,retries:0,timeout:45000,reporter:'list',
  use:{baseURL:process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/',trace:'retain-on-failure'},
  projects,
  webServer:process.env.GAMES_BASE_URL?undefined:{command:'node tools/game-server.mjs',url:'http://127.0.0.1:4177/',reuseExistingServer:!process.env.CI}
});
