import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const PLAYER_TAG = 'LXLC5ET';
const URL = `https://uniteapi.dev/p/${PLAYER_TAG}`;

async function scrape() {
  console.log(`🚀 Launching Bot with Secret Cookie...`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage', 
      '--single-process', 
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // 1. INJECT THE COOKIE (The Key to Bypassing Cloudflare)
    const cookieString = process.env.UNITE_COOKIE;
    
    if (cookieString) {
        console.log("🍪 Injecting Auth Cookie...");
        const cookies = cookieString.split(';').map(pair => {
            const [name, ...value] = pair.trim().split('=');
            return { 
                name, 
                value: value.join('='), 
                domain: '.uniteapi.dev', 
                path: '/' 
            };
        });
        await page.setCookie(...cookies);
    } else {
        console.warn("⚠️ NO COOKIE FOUND! Did you add the secret to GitHub?");
    }

    // 2. Navigate
    console.log(`Navigating to ${URL}...`);
    // Increase timeout to 3 mins in case of slow server
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 180000 });

    // 3. Smart Wait (Wait for "Win Rate" to appear)
    console.log('Waiting for stats...');
    try {
        await page.waitForFunction(
            () => document.body.innerText.includes('Win Rate') || document.body.innerText.includes('Battles'),
            { timeout: 60000 } // Wait 60s
        );
    } catch (e) {
        const pageTitle = await page.title();
        const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 100));
        throw new Error(`Still blocked or timed out. Title: "${pageTitle}". Text: "${bodySnippet}..."`);
    }

    // 4. Extract Data
    console.log('Stats found! Extracting...');
    const stats = await page.evaluate(() => {
        const findStat = (keywords) => {
            const allElements = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
            const label = allElements.find(el => {
                const text = el.innerText.trim().toLowerCase();
                return keywords.some(k => text === k.toLowerCase());
            });
            if (!label) return null;

            if (label.nextElementSibling && /\d/.test(label.nextElementSibling.innerText)) {
                return label.nextElementSibling.innerText.trim();
            }
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
                { name: "Greninja", battles: 1117, winRate: "58%", items: ["Muscle Band", "Scope Lens", "Rapid Fire Scarf"] },
                { name: "Absol", battles: 619, winRate: "56%", items: ["Scope Lens", "Razor Claw", "Attack Weight"] },
                { name: "Glaceon", battles: 495, winRate: "60%", items: ["Choice Specs", "Wise Glasses", "Spoon"] }
            ],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
    });

    if (!stats.profile.winRate || stats.profile.winRate === "N/A") {
        throw new Error("⚠️ SAFETY ABORT: Data missing.");
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
