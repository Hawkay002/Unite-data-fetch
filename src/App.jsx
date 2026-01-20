import React from 'react';
import { Trophy, Swords, Target, Flame, Crown, Eye, ThumbsUp, Medal, Zap } from 'lucide-react';
import data from './data/profile.json';

// Reusable Stat Card Component
const StatBox = ({ label, value, icon: Icon, color = "text-white" }) => (
  <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-600 transition-colors duration-300">
    <div>
      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
    {Icon && <Icon className={`w-6 h-6 ${color} opacity-80`} />}
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8 font-sans text-slate-100">
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER PROFILE SECTION --- */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              
              {/* Avatar Ring */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 p-1 shadow-lg shadow-orange-500/20">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                     <span className="text-4xl filter drop-shadow-lg">🥷</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/50 uppercase tracking-widest shadow-lg">
                  Lv.50
                </div>
              </div>

              {/* Name & Rank Info */}
              <div className="text-center md:text-left space-y-2 flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                  {data.profile.ign}
                </h1>
                <p className="text-indigo-400 font-mono text-sm tracking-wider bg-indigo-500/10 inline-block px-2 py-0.5 rounded border border-indigo-500/20">
                  {data.profile.tag}
                </p>
                
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-purple-500/10 text-purple-300 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-500/30 shadow-sm shadow-purple-500/10">
                    <Crown size={14} className="text-purple-400" />
                    {data.profile.rank}
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-300 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/30">
                    <Zap size={14} className="text-green-400" />
                    FP {data.profile.fpPoints}
                  </div>
                </div>
              </div>

              {/* Key Header Stats */}
              <div className="flex gap-8 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                 <div className="text-center group/stat">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 group-hover/stat:text-indigo-400 transition-colors">Win Rate</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{data.profile.winRate}</p>
                 </div>
                 <div className="text-center group/stat">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 group-hover/stat:text-indigo-400 transition-colors">Total Battles</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{data.profile.totalBattles}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COL 1: COMBAT STATS */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
              <Swords className="w-5 h-5 text-red-500" /> Combat Metrics
            </h2>
            <div className="grid grid-cols-1 gap-3">
               <StatBox label="Total Score" value={data.stats.score} icon={Target} color="text-yellow-400" />
               <StatBox label="Eliminations" value={data.stats.totalEliminations} icon={Swords} color="text-red-400" />
               <StatBox label="MVP Awards" value={data.stats.mvp} icon={Crown} color="text-orange-400" />
               <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Current Streak" value={data.stats.currentWinStreak} icon={Flame} color="text-green-400" />
                  <StatBox label="Best Streak" value={data.stats.winStreakRecord} color="text-blue-400" />
               </div>
            </div>
          </div>

          {/* COL 2: LEGACY & SEASON */}
          <div className="space-y-6">
            
            {/* Legacy Card */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                <Trophy className="w-5 h-5 text-yellow-400" /> Career Legacy
              </h2>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Highest Rank</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 font-black text-xl">{data.playerStats.highestRank}</span>
                 </div>
                 <div className="h-px bg-slate-800"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Total Master</span>
                    <span className="text-white font-bold text-lg">{data.playerStats.totalTimesMaster}x</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Consecutive</span>
                    <span className="text-white font-bold text-lg">{data.playerStats.timesMasterRow} Seasons</span>
                 </div>
                 <div className="h-px bg-slate-800"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2 text-sm font-medium"><ThumbsUp size={16} className="text-blue-400"/> Like Score</span>
                    <span className="text-white font-bold text-lg">{data.playerStats.likeScore}</span>
                 </div>
              </div>
            </div>

            {/* Season Card */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                <Medal className="w-5 h-5 text-purple-400" /> Current Season
              </h2>
              <div className="grid grid-cols-3 gap-3">
                 <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Battles</div>
                    <div className="font-black text-xl">{data.season.battles}</div>
                 </div>
                 <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Wins</div>
                    <div className="font-black text-xl text-green-400">{data.season.wins}</div>
                 </div>
                 <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">MVP</div>
                    <div className="font-black text-xl text-orange-400">{data.season.mvp}</div>
                 </div>
              </div>
            </div>
          </div>

          {/* COL 3: TOP AGENTS */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
              <Eye className="w-5 h-5 text-blue-400" /> Top Agents
            </h2>
            <div className="space-y-3">
               {data.topPokemon.map((poke, i) => (
                  <div key={i} className="group relative bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                     <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                          {/* In a real app, use <img> here. Emoji for placeholder */}
                          <span className="text-2xl opacity-50">👾</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-white text-lg leading-tight truncate">{poke.name}</h3>
                             <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-0.5 rounded border border-green-500/20">{poke.winRate} WR</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">{poke.battles} Matches Played</p>
                          
                          <div className="flex gap-1.5 mt-2">
                             {/* Held Items Visualization */}
                             <div className="h-1.5 w-6 rounded-full bg-orange-400/50"></div>
                             <div className="h-1.5 w-6 rounded-full bg-red-400/50"></div>
                             <div className="h-1.5 w-6 rounded-full bg-blue-400/50"></div>
                          </div>
                       </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>

        </div>
        
        <div className="flex justify-center items-center gap-2 text-slate-600 text-xs py-8 opacity-60">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           Data synced via UniteAPI • Last update: {data.lastUpdated}
        </div>
      </div>
    </div>
  );
}

export default App;
