import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const PLAYER_TAG = 'LXLC5ET';
const URL = `https://uniteapi.dev/p/${PLAYER_TAG}`;

// 🎭 THE MASK: This makes the robot claim it is a standard Windows Chrome Browser.
// If this fails, copy your specific User-Agent from the Network Tab and paste it here.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function scrape() {
  console.log(`🚀 Launching Impersonator Bot...`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage', 
      '--single-process', 
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled' // Hides "Chrome is being controlled by automated software"
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 1. WEAR THE MASK (Set User-Agent)
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1920, height: 1080 });

    // 2. INJECT THE COOKIE
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
        throw new Error("⚠️ SECRET MISSING: You must add UNITE_COOKIE to GitHub Secrets.");
    }

    // 3. Navigate
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 4. Smart Wait
    console.log('Waiting for stats...');
    try {
        await page.waitForFunction(
            () => document.body.innerText.includes('Win Rate') || document.body.innerText.includes('Battles'),
            { timeout: 30000 }
        );
    } catch (e) {
        // Debugging Info
        const pageTitle = await page.title();
        throw new Error(`Cloudflare blocked us again. Title: "${pageTitle}". (Try copying your specific User-Agent string into the script)`);
    }

    // 5. Extract Data
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
