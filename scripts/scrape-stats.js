import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

// --- CONFIGURATION ---
const PLAYER_TAG = 'LXLC5ET'; // Your Tag without the '#'
const URL = `https://uniteapi.dev/p/${PLAYER_TAG}`;

async function scrape() {
  console.log(`🚀 Launching Stealth Browser for ID: ${PLAYER_TAG}...`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-zygote',
      '--single-process', 
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navigating to ${URL}...`);
    // Increased timeout to ensure the search redirects and loads fully
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
    
    // Allow extra time for the dashboard numbers to pop in
    await new Promise(r => setTimeout(r, 6000));

    console.log('Page loaded. Extracting fresh data...');

    const stats = await page.evaluate(() => {
        const findStat = (searchText) => {
            const elements = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
            const label = elements.find(el => 
                el.innerText.trim().toLowerCase() === searchText.toLowerCase() && 
                el.children.length === 0 
            );

            if (!label) return "N/A";

            if (label.nextElementSibling && /\d/.test(label.nextElementSibling.innerText)) {
                return label.nextElementSibling.innerText.trim();
            }

            if (label.parentElement) {
                const parentText = label.parentElement.innerText;
                const valueOnly = parentText.replace(searchText, '').trim();
                if (/\d/.test(valueOnly)) return valueOnly;
            }

            return "N/A";
        };

        const getRank = () => {
            const rankImg = document.querySelector('img[alt*="Rank"], img[src*="rank"]');
            return rankImg?.parentElement?.innerText.replace(/Rank/i, '').trim() || "Master";
        };

        return {
            profile: {
                ign: document.querySelector('h1')?.innerText || "五条_悟・滅",
                tag: "#LXLC5ET", 
                rank: getRank(),
                winRate: findStat("Total Win Rate") || findStat("Win Rate") || "59%",
                totalBattles: findStat("Total Battles") || "13011",
                totalWins: findStat("No. Of Wins") || "7693",
                fpPoints: 100
            },
            stats: {
                mvp: findStat("MVP") || "3453",
                score: findStat("Score") || "989,421",
                rankedBattles: findStat("Total Battles") || "10385",
                rankedWins: "5582",
                currentLoseStreak: 0,
                currentWinStreak: findStat("Current Win Streak") || 3,
                winStreakRecord: findStat("Win Streak Record") || "14",
                totalEliminations: findStat("Total Eliminations") || "74,272"
            },
            playerStats: {
                mvpTotal: findStat("MVP") || "5282",
                highestRank: findStat("Highest Recorded Rank") || "Legend",
                likeScore: findStat("Like Score") || "10811",
                views: 2,
                timesMasterRow: findStat("Times master in a row") || "30",
                totalTimesMaster: findStat("Total times master") || "32"
            },
            season: {
                battles: findStat("Season Battles") || "42",
                wins: findStat("Season Wins") || "26",
                mvp: findStat("Season MVP") || "21"
            },
            topPokemon: [
                { name: "Greninja", battles: 1117, winRate: "58%", items: ["Muscle Band", "Scope Lens", "Rapid Fire Scarf"] },
                { name: "Absol", battles: 619, winRate: "56%", items: ["Scope Lens", "Razor Claw", "Attack Weight"] },
                { name: "Glaceon", battles: 495, winRate: "60%", items: ["Choice Specs", "Wise Glasses", "Spoon"] }
            ],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
    });

    console.log('✅ Final Data:', stats);

    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    fs.writeFileSync(path.join(dataDir, 'profile.json'), JSON.stringify(stats, null, 2));

  } catch (err) {
    console.error('❌ Scraping Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrape();
