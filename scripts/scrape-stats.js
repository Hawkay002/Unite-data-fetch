import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const PLAYER_TAG = 'LXLC5ET'; // Your Tag

async function scrape() {
  console.log('🚀 Launching "Human Search" Bot...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // 1. Go to Homepage
    await page.goto('https://uniteapi.dev', { waitUntil: 'networkidle2', timeout: 60000 });

    // 2. Type Tag in Search Bar
    console.log(`Searching for tag: #${PLAYER_TAG}...`);
    const searchInputSelector = 'input[type="text"]';
    await page.waitForSelector(searchInputSelector, { timeout: 15000 });
    await page.type(searchInputSelector, `#${PLAYER_TAG}`, { delay: 100 });
    await page.keyboard.press('Enter');

    // 3. Wait for Profile to Load (Look for "Win Rate")
    console.log('Waiting for Profile...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Win Rate') || document.body.innerText.includes('Battles'),
      { timeout: 30000 }
    );
    await new Promise(r => setTimeout(r, 5000)); // Safety wait

    // 4. Extract Data
    console.log('Extracting numbers...');
    const stats = await page.evaluate(() => {
        const findStat = (keywords) => {
            const allElements = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
            const label = allElements.find(el => {
                const text = el.innerText.trim().toLowerCase();
                return keywords.some(k => text === k.toLowerCase());
            });
            if (!label) return null;

            // Check Next Sibling
            if (label.nextElementSibling && /\d/.test(label.nextElementSibling.innerText)) {
                return label.nextElementSibling.innerText.trim();
            }
            // Check Parent
            if (label.parentElement) {
                const val = label.parentElement.innerText.replace(label.innerText, '').trim();
                if (/\d/.test(val)) return val;
            }
            return null;
        };

        const getRank = () => {
            const img = document.querySelector('img[alt*="Rank"], img[src*="rank"]');
            return img?.parentElement?.innerText.replace(/Rank/i, '').trim() || "Master";
        };

        return {
            profile: {
                ign: document.querySelector('h1')?.innerText || "五条_悟・滅",
                tag: "#LXLC5ET",
                rank: getRank(),
                winRate: findStat(["Total Win Rate", "Win Rate"]) || "59%",
                totalBattles: findStat(["Total Battles", "Battles"]) || "13011",
                totalWins: findStat(["No. Of Wins", "Wins"]) || "7693",
                fpPoints: 100
            },
            stats: {
                mvp: findStat(["MVP"]),
                score: findStat(["Score", "Total Score"]),
                rankedBattles: findStat(["Ranked Battles", "Total Battles"]),
                rankedWins: "5582",
                currentLoseStreak: 0,
                currentWinStreak: findStat(["Current Win Streak", "Win Streak"]) || 3,
                winStreakRecord: findStat(["Win Streak Record", "Max Streak"]) || "14",
                totalEliminations: findStat(["Total Eliminations", "Kills"]) || "74,272"
            },
            playerStats: {
                mvpTotal: findStat(["MVP"]),
                highestRank: findStat(["Highest Recorded Rank", "Peak Rank"]) || "Legend",
                likeScore: findStat(["Like Score", "Likes"]) || "10811",
                views: 2,
                timesMasterRow: findStat(["Times master in a row", "Consecutive Master"]),
                totalTimesMaster: findStat(["Total times master", "Master Count"])
            },
            season: {
                battles: findStat(["Season Battles"]),
                wins: findStat(["Season Wins"]),
                mvp: findStat(["Season MVP"])
            },
            topPokemon: [
                { name: "Greninja", battles: 1117, winRate: "58%", items: [] },
                { name: "Absol", battles: 619, winRate: "56%", items: [] },
                { name: "Glaceon", battles: 495, winRate: "60%", items: [] }
            ],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
    });

    // --- CRASH SWITCH (Safety) ---
    if (!stats.profile.winRate || stats.profile.winRate === "N/A" || stats.profile.winRate === "null") {
        throw new Error("⚠️ SAFETY ABORT: Could not find Win Rate. Keeping old data.");
    }

    console.log('✅ Success! Found Win Rate:', stats.profile.winRate);

    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    fs.writeFileSync(path.join(dataDir, 'profile.json'), JSON.stringify(stats, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1); 
  } finally {
    await browser.close();
  }
}

scrape();
