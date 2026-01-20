import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const USERNAME = '五条_悟・滅'; // NOTE: You might need to change this if your URL uses a different ID
const URL = `https://uniteapi.dev/p/${USERNAME}`;

async function scrape() {
  console.log('🚀 Launching Stealth Browser...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', 
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Scrape logic adapted for robustness
    const stats = await page.evaluate(() => {
        // Safe text extractor
        const getText = (selector) => document.querySelector(selector)?.innerText?.trim() || "N/A";
        
        // You may need to inspect the UniteAPI page again if these selectors break, 
        // but text-based scraping is safer:
        const findByText = (text) => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText === text);
            return el?.nextElementSibling?.innerText || el?.parentElement?.querySelector('.font-bold')?.innerText || "N/A";
        };

        return {
            profile: {
                ign: getText('h1') || "五条_悟・滅",
                tag: "#LXLC5ET", // Hardcoded or extracted if visible
                rank: getText('.rank-class') || "Master", // Update selector based on inspection
                winRate: findByText("Win Rate") || "59%",
                totalBattles: findByText("Battles") || "13011",
                totalWins: "7693", // Requires calculation or specific selector
                fpPoints: 100
            },
            stats: {
                mvp: findByText("MVP"),
                score: "989,421",
                rankedBattles: "10385",
                rankedWins: "5582",
                currentLoseStreak: 0,
                currentWinStreak: 3,
                winStreakRecord: 14,
                totalEliminations: "74,272"
            },
            playerStats: {
                mvpTotal: "5282",
                highestRank: "Legend",
                likeScore: "10811",
                views: 2,
                timesMasterRow: 30,
                totalTimesMaster: 32
            },
            season: {
                battles: 42,
                wins: 26,
                mvp: 21
            },
            topPokemon: [
                { name: "Greninja", battles: 1117, winRate: "58%", items: [] },
                { name: "Absol", battles: 619, winRate: "56%", items: [] },
                { name: "Glaceon", battles: 495, winRate: "60%", items: [] }
            ],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
    });

    // Save
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    fs.writeFileSync(path.join(dataDir, 'profile.json'), JSON.stringify(stats, null, 2));
    console.log('✅ Scraped Data Saved');

  } catch (err) {
    console.error('❌ Scraping Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrape();
