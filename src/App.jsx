import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";

// ═══ CONFIG ═══
const C = {
  QTM: "0x9959c0787806BDED214A57a6Bb4D261742080FD9",
  NFT: "0x70eFe001735fE06cB1016C30bA610f3893E6F321",
  FACTORY: "0xBFD62BAf2116aDd43acbc54de9c590cEa580B159",
  GAME: "0x942883f0f9671c7C08f55336B7C63311c5658750",
  DEV: "0x9863694f4eF5417be7063145cad7C7E9d5518247",
};
const L = {
  x: "https://x.com/volya089", tg: "https://t.me/VolyaUAOfficiale",
  site: "https://closefast.tech/", scan: "https://monadscan.com/address/",
  vly: "https://dexscreener.com/monad/0x8aa57ccc34e14ab5404fd4e3481babc047ed54e6",
};
const LOGO = "https://peach-fascinating-dragonfly-692.mypinata.cloud/ipfs/bafybeifys4axhdlhmupjqlqbnocyeqtm3zojd7x6d4clthuwzhy47ygll4?pinataGatewayToken=bWYA3wgNwzuNFYwibilk9VG-RKvTcJ336mxOMdrpDzaD_vg5zmcufW_DY1vfQr4t";
const MONAD = { chainId: "0x8F", chainName: "Monad Mainnet", rpcUrls: ["https://rpc.monad.xyz"], nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 }, blockExplorerUrls: ["https://monadexplorer.com"] };

const QTM_ABI = ["function balanceOf(address) view returns (uint256)","function approve(address,uint256) returns (bool)","function stake(uint256,uint256)","function unstake()","function pendingReward(address) view returns (uint256)","function stakes(address) view returns (uint256,uint256,uint256,uint256)","function setReferrer(address)","function referralCount(address) view returns (uint256)","function referralEarned(address) view returns (uint256)","function getPoolsInfo() view returns (uint256,uint256,uint256)","function totalSupply() view returns (uint256)","function totalBurned() view returns (uint256)"];
const NFT_ABI = ["function totalSupply() view returns (uint256)","function mintPriceMON() view returns (uint256)","function balanceOf(address) view returns (uint256)","function mintWithMON(uint256) payable"];
const GAME_ABI = ["function startQuest(uint256,uint256)","function completeQuest()","function createBattle(uint256,uint256) returns (uint256)","function joinBattle(uint256,uint256)","function wins(address) view returns (uint256)","function losses(address) view returns (uint256)","function playerScore(address) view returns (uint256)","function activeQuests(address) view returns (uint256,uint256,uint256,bool)","function battleCount() view returns (uint256)","function battles(uint256) view returns (address,address,uint256,uint256,uint256,uint256,bool,address)"];

const QUESTS = [
  { name: "Quantum Patrol", diff: 1, reward: "50", xp: 100, time: "1h", pow: 10 },
  { name: "Dark Matter Raid", diff: 3, reward: "200", xp: 300, time: "4h", pow: 50 },
  { name: "Nebula Expedition", diff: 5, reward: "500", xp: 600, time: "8h", pow: 100 },
  { name: "Black Hole Dive", diff: 7, reward: "1,000", xp: 1000, time: "12h", pow: 200 },
  { name: "Multiverse Breach", diff: 10, reward: "5,000", xp: 3000, time: "24h", pow: 500 },
];

const DAILY_REWARDS = [5, 8, 12, 15, 20, 25, 50]; // QTM per day (7-day cycle)
const ACHIEVEMENTS = [
  { id: "first_mint", name: "First NFT", desc: "Mint your first NFT", icon: "🎨", check: (d) => +d.nftBal > 0 },
  { id: "staker", name: "Staker", desc: "Stake any amount of QTM", icon: "🏦", check: (d) => d.stakeInfo !== null },
  { id: "warrior", name: "Warrior", desc: "Win your first PvP battle", icon: "⚔️", check: (d) => d.wins > 0 },
  { id: "veteran", name: "Veteran", desc: "Win 10 PvP battles", icon: "🏆", check: (d) => d.wins >= 10 },
  { id: "recruiter", name: "Recruiter", desc: "Refer 5 users", icon: "🤝", check: (d) => d.refCount >= 5 },
  { id: "whale", name: "Whale", desc: "Hold 100K+ QTM", icon: "🐋", check: (d) => +d.qtmBal >= 100000 },
  { id: "collector", name: "Collector", desc: "Own 10+ NFTs", icon: "💎", check: (d) => +d.nftBal >= 10 },
  { id: "legend", name: "Legend", desc: "Score 10,000+ points", icon: "⭐", check: (d) => d.score >= 10000 },
];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [chainOk, setChainOk] = useState(false);
  const [tab, setTab] = useState("home");
  const [copied, setCopied] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [monBal, setMonBal] = useState(null);
  const [txStatus, setTxStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  // Data
  const [qtmBal, setQtmBal] = useState("0");
  const [nftBal, setNftBal] = useState("0");
  const [nftSupply, setNftSupply] = useState("0");
  const [mintPrice, setMintPrice] = useState("0");
  const [stakeInfo, setStakeInfo] = useState(null);
  const [pendingRew, setPendingRew] = useState("0");
  const [activeQuest, setActiveQuest] = useState(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [score, setScore] = useState(0);
  const [refCount, setRefCount] = useState(0);
  const [refEarned, setRefEarned] = useState("0");
  const [pools, setPools] = useState(null);
  const [totalSupply, setTotalSupply] = useState("0");
  const [totalBurned, setTotalBurned] = useState("0");
  const [openBattles, setOpenBattles] = useState([]);

  // Forms
  const [mintQty, setMintQty] = useState(1);
  const [stakeAmt, setStakeAmt] = useState("");
  const [stakeDays, setStakeDays] = useState(30);
  const [questId, setQuestId] = useState(0);
  const [questNft, setQuestNft] = useState("");
  const [battleNft, setBattleNft] = useState("");
  const [battleWager, setBattleWager] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinNft, setJoinNft] = useState("");

  // Daily reward
  const [dailyDay, setDailyDay] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Check referral from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) localStorage.setItem("qtm_referrer", ref);
  }, []);

  // Daily reward state
  useEffect(() => {
    const last = localStorage.getItem("qtm_daily_last");
    const streak = parseInt(localStorage.getItem("qtm_daily_streak") || "0");
    const today = new Date().toDateString();
    setDailyClaimed(last === today);
    setDailyDay(streak % 7);
  }, []);

  // Wallet
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((a) => { if (a.length) { setWallet(a[0]); ck(); } }).catch(() => {});
    window.ethereum.on?.("accountsChanged", (a) => { if (!a.length) disc(); else { setWallet(a[0]); ck(); } });
    window.ethereum.on?.("chainChanged", () => ck());
  }, []);

  const ck = async () => { try { setChainOk((await window.ethereum.request({ method: "eth_chainId" })) === MONAD.chainId); } catch { setChainOk(false); } };
  const conn = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    const a = await window.ethereum.request({ method: "eth_requestAccounts" }); setWallet(a[0]);
    try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD.chainId }] }); } catch { await window.ethereum.request({ method: "wallet_addEthereumChain", params: [MONAD] }); }
    setChainOk(true);
    const b = await window.ethereum.request({ method: "eth_getBalance", params: [a[0], "latest"] }); setMonBal((parseInt(b, 16) / 1e18).toFixed(3));
    // Auto set referrer
    const ref = localStorage.getItem("qtm_referrer");
    if (ref && ref !== a[0] && window.ethers) {
      try {
        const s = await new window.ethers.BrowserProvider(window.ethereum).getSigner();
        await new window.ethers.Contract(C.QTM, QTM_ABI, s).setReferrer(ref);
      } catch {}
    }
  };
  const disc = () => { setWallet(null); setChainOk(false); setMonBal(null); setShowWallet(false); };
  const cp = (t, l) => { navigator.clipboard.writeText(t); setCopied(l); setTimeout(() => setCopied(""), 2000); };
  const sh = (a) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
  const fmt = (w) => { try { return parseFloat(window.ethers.formatEther(w)).toFixed(2); } catch { return "0"; } };
  const tx = (m) => { setTxStatus(m); if (!m.includes("⏳")) setTimeout(() => setTxStatus(""), 4000); };

  // Refresh
  const refresh = useCallback(async () => {
    if (!wallet || !window.ethers) return;
    const p = new window.ethers.BrowserProvider(window.ethereum);
    try {
      const q = new window.ethers.Contract(C.QTM, QTM_ABI, p);
      setQtmBal(fmt(await q.balanceOf(wallet)));
      setTotalSupply(fmt(await q.totalSupply()));
      setTotalBurned(fmt(await q.totalBurned()));
      const si = await q.stakes(wallet);
      setStakeInfo(si[0] > 0n ? { amount: fmt(si[0]), start: Number(si[1]), lock: Number(si[2]) } : null);
      if (si[0] > 0n) setPendingRew(fmt(await q.pendingReward(wallet)));
      setRefCount(Number(await q.referralCount(wallet)));
      setRefEarned(fmt(await q.referralEarned(wallet)));
      const pi = await q.getPoolsInfo(); setPools({ s: fmt(pi[0]), g: fmt(pi[1]), e: fmt(pi[2]) });
      const n = new window.ethers.Contract(C.NFT, NFT_ABI, p);
      setNftBal(String(await n.balanceOf(wallet))); setNftSupply(String(await n.totalSupply()));
      setMintPrice(String(await n.mintPriceMON()));
      const g = new window.ethers.Contract(C.GAME, GAME_ABI, p);
      const aq = await g.activeQuests(wallet);
      setActiveQuest(aq[2] > 0n && !aq[3] ? { qid: Number(aq[0]), nid: Number(aq[1]), start: Number(aq[2]) } : null);
      setWins(Number(await g.wins(wallet))); setLosses(Number(await g.losses(wallet)));
      setScore(Number(await g.playerScore(wallet)));
      // Open battles
      const bc = Number(await g.battleCount()); const ob = [];
      for (let i = Math.max(0, bc - 15); i < bc; i++) {
        try { const b = await g.battles(i); if (b[1] === "0x0000000000000000000000000000000000000000" && !b[6]) ob.push({ id: i, p1: b[0], nft: Number(b[2]), wager: fmt(b[4]) }); } catch {}
      }
      setOpenBattles(ob);
    } catch (e) { console.error(e); }
  }, [wallet]);

  useEffect(() => { refresh(); }, [refresh, tab]);

  // Actions
  const act = async (fn) => { try { await fn(); } catch (e) { tx("❌ " + (e.reason || e.message || "Error").slice(0, 80)); } };
  const getSigner = async () => new window.ethers.BrowserProvider(window.ethereum).getSigner();

  const doMint = async () => { const s = await getSigner(); const n = new window.ethers.Contract(C.NFT, NFT_ABI, s); const pr = await n.mintPriceMON(); tx("⏳ Minting..."); const t = await n.mintWithMON(mintQty, { value: pr * BigInt(mintQty) }); await t.wait(); tx("✅ Minted!"); refresh(); };
  const doStake = async () => { const s = await getSigner(); tx("⏳ Staking..."); const t = await new window.ethers.Contract(C.QTM, QTM_ABI, s).stake(window.ethers.parseEther(stakeAmt), stakeDays); await t.wait(); tx("✅ Staked!"); refresh(); };
  const doUnstake = async () => { const s = await getSigner(); tx("⏳ Unstaking..."); const t = await new window.ethers.Contract(C.QTM, QTM_ABI, s).unstake(); await t.wait(); tx("✅ Claimed!"); refresh(); };
  const doQuest = async () => { const s = await getSigner(); tx("⏳ Quest..."); const t = await new window.ethers.Contract(C.GAME, GAME_ABI, s).startQuest(questId, questNft); await t.wait(); tx("✅ Started!"); refresh(); };
  const doComplete = async () => { const s = await getSigner(); tx("⏳ Completing..."); const t = await new window.ethers.Contract(C.GAME, GAME_ABI, s).completeQuest(); await t.wait(); tx("✅ Rewards!"); refresh(); };
  const doBattle = async () => { const s = await getSigner(); const g = new window.ethers.Contract(C.GAME, GAME_ABI, s); const w = battleWager ? window.ethers.parseEther(battleWager) : 0n; if (w > 0n) { tx("⏳ Approving..."); const a = await new window.ethers.Contract(C.QTM, QTM_ABI, s).approve(C.GAME, w); await a.wait(); } tx("⏳ Creating..."); const t = await g.createBattle(battleNft, w); await t.wait(); tx("✅ Created!"); refresh(); };
  const doJoin = async () => { const s = await getSigner(); tx("⏳ Fighting..."); const t = await new window.ethers.Contract(C.GAME, GAME_ABI, s).joinBattle(joinId, joinNft); await t.wait(); tx("✅ Resolved!"); refresh(); };

  const claimDaily = () => {
    const reward = DAILY_REWARDS[dailyDay];
    localStorage.setItem("qtm_daily_last", new Date().toDateString());
    localStorage.setItem("qtm_daily_streak", String((dailyDay + 1) % 7));
    setDailyClaimed(true); setDailyDay((dailyDay + 1) % 7);
    tx(`✅ Claimed ${reward} QTM daily reward! (Day ${dailyDay + 1}/7)`);
  };

  const refLink = wallet ? `${window.location.origin}?ref=${wallet}` : "";
  const achievementData = { nftBal, stakeInfo, wins, refCount, qtmBal, score };
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.check(achievementData)).length;

  const tabs = [
    { id: "home", label: "HOME", icon: "" },
    { id: "mint", label: "NFT", icon: "🎨" },
    { id: "stake", label: "STK", icon: "🏦" },
    { id: "quest", label: "Q", icon: "🗺️" },
    { id: "pvp", label: "PVP", icon: "⚔️" },
    { id: "leader", label: "TOP", icon: "🏆" },
    { id: "ref", label: "REF", icon: "🤝" },
    { id: "bridge", label: "🌐", icon: "" },
    { id: "vly", label: "💎", icon: "" },
  ];

  const pageTitles = {
    home: "Quantum | Home", mint: "Quantum | Mint NFT", stake: "Quantum | Stake QTM",
    quest: "Quantum | Quests", pvp: "Quantum | PvP Battles", leader: "Quantum | Leaderboard",
    ref: "Quantum | Referral", bridge: "Quantum | Bridge", vly: "Quantum | $VLY", privacy: "Quantum | Privacy",
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-mono relative">
      <Helmet><title>{pageTitles[tab] || "Quantum"}</title></Helmet>

      {/* Toast */}
      {txStatus && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-bold animate-slide-up max-w-[90%] ${txStatus.includes("✅") ? "bg-quantum-green text-dark-900" : txStatus.includes("❌") ? "bg-quantum-pink text-white" : "bg-quantum-cyan text-dark-900"}`}>
          {txStatus}
        </div>
      )}

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between px-3 py-2 bg-dark-900/95 backdrop-blur-xl border-b border-quantum-cyan/10">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setTab("home")}>
          <img src={LOGO} alt="" className="w-6 h-6 rounded-full border-2 border-quantum-cyan" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-sm font-black tracking-widest gradient-text from-quantum-cyan to-quantum-purple">QTM</span>
        </div>
        <div className="flex gap-0.5 overflow-x-auto max-w-[55%] scrollbar-none">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "bg-quantum-cyan/15 text-quantum-cyan border border-quantum-cyan/30" : "text-gray-500 border border-transparent"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        {wallet ? (
          <button onClick={() => setShowWallet(!showWallet)} className={`px-3 py-2 rounded-lg text-[10px] font-bold min-h-[36px] flex items-center gap-1 ${chainOk ? "bg-quantum-cyan/10 text-quantum-cyan border border-quantum-cyan/30" : "bg-quantum-gold/15 text-quantum-gold border border-quantum-gold/30"}`}>
            {chainOk ? "🟢" : "⚠️"}{sh(wallet)}
          </button>
        ) : (
          <button onClick={conn} className="px-4 py-2.5 rounded-lg text-xs font-black min-h-[40px] bg-gradient-to-r from-quantum-cyan to-quantum-purple text-dark-900">🔌 Connect</button>
        )}
      </nav>

      {/* Wallet Modal */}
      {showWallet && (
        <div>
          <div className="fixed inset-0 z-[98] bg-black/60" onClick={() => setShowWallet(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[320px] p-5 rounded-2xl bg-dark-800 border border-quantum-cyan/20 animate-slide-up">
            <h3 className="text-sm font-black text-quantum-cyan mb-2">Wallet</h3>
            <p className="text-[11px] break-all mb-2">{wallet}</p>
            {monBal && <p className="text-sm text-quantum-cyan font-bold">💰 {monBal} MON</p>}
            {qtmBal !== "0" && <p className="text-sm text-quantum-purple font-bold">⚛️ {qtmBal} QTM</p>}
            {nftBal !== "0" && <p className="text-sm text-quantum-gold font-bold mb-3">🎨 {nftBal} NFTs</p>}
            <button onClick={() => cp(wallet, "w")} className="btn-secondary mb-2 !py-2 text-xs">{copied === "w" ? "✅" : "📋 Copy"}</button>
            <button onClick={disc} className="btn-secondary !text-quantum-pink !border-quantum-pink/30 !py-2 text-xs">⏏ Disconnect</button>
          </div>
        </div>
      )}

      {/* ═══ HOME ═══ */}
      {tab === "home" && (
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
          <h1 className="text-[clamp(28px,7vw,56px)] font-black tracking-[4px] gradient-text from-quantum-cyan via-quantum-purple to-quantum-pink bg-[length:200%_200%] animate-gradient mb-2">QUANTUM</h1>
          <p className="text-xs text-gray-500 max-w-sm mb-4">Mint NFTs • Stake QTM • PvP • Quests • Bridge</p>

          {/* Daily Reward */}
          {wallet && !dailyClaimed && (
            <div className="card mb-4 max-w-sm w-full bg-quantum-gold/5 border-quantum-gold/20 text-center">
              <p className="text-xs text-quantum-gold font-bold mb-2">🎁 Daily Reward — Day {dailyDay + 1}/7</p>
              <div className="flex justify-center gap-1 mb-3">
                {DAILY_REWARDS.map((r, i) => (
                  <div key={i} className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[8px] font-bold ${i === dailyDay ? "bg-quantum-gold/20 text-quantum-gold border border-quantum-gold/40 scale-110" : i < dailyDay ? "bg-quantum-green/10 text-quantum-green" : "bg-white/5 text-gray-600"}`}>
                    {r}
                  </div>
                ))}
              </div>
              <button onClick={claimDaily} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white !py-2.5 text-xs">🎁 Claim {DAILY_REWARDS[dailyDay]} QTM</button>
            </div>
          )}

          {/* PWA Install */}
          {installPrompt && (
            <button onClick={() => { installPrompt.prompt(); setInstallPrompt(null); }} className="mb-4 px-4 py-2 rounded-lg bg-quantum-purple/10 border border-quantum-purple/30 text-quantum-purple text-xs font-bold">
              📱 Install App
            </button>
          )}

          {/* Stats */}
          {wallet && (
            <div className="grid grid-cols-5 gap-1.5 max-w-md w-full mb-4">
              {[
                { v: qtmBal, l: "QTM", c: "text-quantum-cyan" },
                { v: nftBal, l: "NFTs", c: "text-quantum-gold" },
                { v: `${wins}W`, l: "PvP", c: "text-quantum-green" },
                { v: refCount, l: "Refs", c: "text-quantum-purple" },
                { v: `${unlockedCount}/${ACHIEVEMENTS.length}`, l: "Badges", c: "text-quantum-pink" },
              ].map((s) => (
                <div key={s.l} className="stat-box"><div className={`text-sm font-black ${s.c}`}>{s.v}</div><div className="text-[7px] text-gray-600">{s.l}</div></div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 max-w-xs w-full mb-6">
            <button onClick={() => setTab("mint")} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white">🎨 Mint</button>
            <button onClick={() => setTab("stake")} className="btn-primary bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900">🏦 Stake</button>
            <button onClick={() => setTab("quest")} className="btn-primary bg-gradient-to-r from-quantum-purple to-quantum-pink text-white">🗺️ Quest</button>
            <button onClick={() => setTab("pvp")} className="btn-primary bg-gradient-to-r from-quantum-pink to-quantum-purple text-white">⚔️ PvP</button>
          </div>

          {/* Achievements */}
          {wallet && (
            <div className="max-w-md w-full mb-4">
              <h3 className="text-xs font-bold text-gray-500 mb-2">🏅 ACHIEVEMENTS ({unlockedCount}/{ACHIEVEMENTS.length})</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = a.check(achievementData);
                  return (
                    <div key={a.id} className={`stat-box ${unlocked ? "border border-quantum-gold/30 bg-quantum-gold/5" : "opacity-40"}`} title={a.desc}>
                      <div className="text-lg">{a.icon}</div>
                      <div className="text-[7px] font-bold mt-0.5">{a.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tokenomics */}
          {pools && (
            <div className="max-w-md w-full">
              <h3 className="text-xs font-bold text-gray-500 mb-2">📊 TOKENOMICS</h3>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="stat-box"><div className="text-xs font-bold text-quantum-cyan">{totalSupply}</div><div className="text-[7px] text-gray-600">Supply</div></div>
                <div className="stat-box"><div className="text-xs font-bold text-quantum-pink">{totalBurned}</div><div className="text-[7px] text-gray-600">Burned</div></div>
                <div className="stat-box"><div className="text-xs font-bold text-quantum-green">{pools.s}</div><div className="text-[7px] text-gray-600">Stake Pool</div></div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══ MINT ═══ */}
      {tab === "mint" && (
        <section className="pt-16 pb-10 px-4 max-w-md mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-gold mb-1">🎨 Mint NFT</h2>
          <p className="text-center text-[11px] text-gray-500 mb-4">{nftSupply}/10,000 minted</p>
          <div className="card mb-3">
            <label className="text-[10px] text-gray-500 tracking-wider block mb-1">QUANTITY (1-10)</label>
            <input type="number" min="1" max="10" value={mintQty} onChange={(e) => setMintQty(Math.min(10, Math.max(1, +e.target.value)))} className="input-field mb-2" />
            <p className="text-[10px] text-gray-500">Cost: {mintPrice > 0 ? (fmt(mintPrice) * mintQty).toFixed(2) : "?"} MON</p>
          </div>
          <button onClick={() => act(doMint)} disabled={!wallet} className={`btn-primary ${wallet ? "bg-gradient-to-r from-quantum-gold to-quantum-pink text-white" : "bg-gray-700 text-gray-500"}`}>
            {wallet ? `🚀 Mint ${mintQty} NFT` : "🔌 Connect"}
          </button>
        </section>
      )}

      {/* ═══ STAKE ═══ */}
      {tab === "stake" && (
        <section className="pt-16 pb-10 px-4 max-w-md mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-green mb-1">🏦 Stake QTM</h2>
          <p className="text-center text-[11px] text-gray-500 mb-4">Balance: {qtmBal} QTM</p>
          {stakeInfo ? (
            <div className="card bg-quantum-green/5 border-quantum-green/20 mb-3">
              <h3 className="text-sm font-bold text-quantum-green mb-2">Active Stake</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="stat-box"><div className="text-sm font-black text-quantum-green">{stakeInfo.amount}</div><div className="text-[8px]">Staked</div></div>
                <div className="stat-box"><div className="text-sm font-black text-quantum-gold">{pendingRew}</div><div className="text-[8px]">Reward</div></div>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">Unlocks: {new Date((stakeInfo.start + stakeInfo.lock) * 1000).toLocaleDateString()}</p>
              <button onClick={() => act(doUnstake)} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white">💰 Unstake + Claim</button>
              <p className="text-[9px] text-quantum-pink mt-1 text-center">⚠️ Early = 15% penalty</p>
            </div>
          ) : (
            <div className="card mb-3">
              <label className="text-[10px] text-gray-500 tracking-wider block mb-1">AMOUNT</label>
              <input value={stakeAmt} onChange={(e) => setStakeAmt(e.target.value)} placeholder="1000" className="input-field mb-2" />
              <label className="text-[10px] text-gray-500 tracking-wider block mb-1">LOCK</label>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {[7, 30, 90, 365].map((d) => (
                  <button key={d} onClick={() => setStakeDays(d)} className={`py-2 rounded-lg text-xs font-bold ${stakeDays === d ? "bg-quantum-cyan/15 text-quantum-cyan border border-quantum-cyan/30" : "bg-white/[0.03] text-gray-500 border border-white/[0.06]"}`}>{d}d</button>
                ))}
              </div>
              <button onClick={() => act(doStake)} disabled={!stakeAmt} className={`btn-primary bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900 ${!stakeAmt && "opacity-50"}`}>🏦 Stake</button>
            </div>
          )}
        </section>
      )}

      {/* ═══ QUEST ═══ */}
      {tab === "quest" && (
        <section className="pt-16 pb-10 px-4 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-purple mb-4">🗺️ Quests</h2>
          {activeQuest ? (
            <div className="card bg-quantum-purple/5 border-quantum-purple/20 mb-3">
              <h3 className="text-sm text-quantum-purple font-bold">🏃 {QUESTS[activeQuest.qid]?.name}</h3>
              <p className="text-[10px] text-gray-500 mb-3">NFT #{activeQuest.nid}</p>
              <button onClick={() => act(doComplete)} className="btn-primary bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900">✅ Complete</button>
            </div>
          ) : (
            <div className="card mb-3">
              {QUESTS.map((q, i) => (
                <div key={i} onClick={() => setQuestId(i)} className={`flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer ${questId === i ? "bg-quantum-purple/10 border border-quantum-purple/30" : "bg-black/20"}`}>
                  <div><div className={`font-bold text-[11px] ${questId === i ? "text-quantum-purple" : "text-gray-300"}`}>{q.name}</div><div className="text-[8px] text-gray-600">{q.time} • Pow:{q.pow}</div></div>
                  <span className="text-xs font-bold text-quantum-cyan">{q.reward}</span>
                </div>
              ))}
              <label className="text-[10px] text-gray-500 tracking-wider block mb-1 mt-2">NFT ID</label>
              <input value={questNft} onChange={(e) => setQuestNft(e.target.value)} placeholder="1" className="input-field mb-2" />
              <button onClick={() => act(doQuest)} disabled={!questNft} className={`btn-primary bg-gradient-to-r from-quantum-purple to-quantum-pink text-white ${!questNft && "opacity-50"}`}>🚀 Start</button>
            </div>
          )}
        </section>
      )}

      {/* ═══ PVP ═══ */}
      {tab === "pvp" && (
        <section className="pt-16 pb-10 px-4 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-pink mb-1">⚔️ PvP</h2>
          <div className="flex justify-center gap-3 text-[11px] mb-4">
            <span className="text-quantum-green">🏆{wins}W</span><span className="text-quantum-pink">💀{losses}L</span><span className="text-quantum-gold">⭐{score}</span>
          </div>
          <div className="card mb-3">
            <h3 className="text-xs font-bold text-quantum-pink mb-2">Create Battle</h3>
            <label className="text-[10px] text-gray-500 block mb-1">NFT ID</label>
            <input value={battleNft} onChange={(e) => setBattleNft(e.target.value)} placeholder="1" className="input-field mb-1.5" />
            <label className="text-[10px] text-gray-500 block mb-1">WAGER (QTM)</label>
            <input value={battleWager} onChange={(e) => setBattleWager(e.target.value)} placeholder="0" className="input-field mb-2" />
            <button onClick={() => act(doBattle)} disabled={!battleNft} className={`btn-primary bg-gradient-to-r from-quantum-pink to-quantum-purple text-white ${!battleNft && "opacity-50"}`}>⚔️ Create</button>
          </div>
          {/* Open Battles */}
          <div className="card mb-3">
            <h3 className="text-xs font-bold text-quantum-gold mb-2">Open Battles ({openBattles.length})</h3>
            {openBattles.length === 0 ? <p className="text-[10px] text-gray-600">No open battles</p> : openBattles.map((b) => (
              <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-black/20 mb-1 text-[10px]">
                <div><span className="font-bold">#{b.id}</span> • {sh(b.p1)} • {b.wager} QTM</div>
                <button onClick={() => { setJoinId(b.id); setTab("pvp"); }} className="px-2 py-1 rounded text-[9px] font-bold bg-quantum-pink/10 text-quantum-pink border border-quantum-pink/30">Join</button>
              </div>
            ))}
          </div>
          {/* Join */}
          <div className="card">
            <h3 className="text-xs font-bold text-quantum-cyan mb-2">Join Battle</h3>
            <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Battle ID" className="input-field mb-1.5" />
            <input value={joinNft} onChange={(e) => setJoinNft(e.target.value)} placeholder="Your NFT ID" className="input-field mb-2" />
            <button onClick={() => act(doJoin)} disabled={!joinId || !joinNft} className={`btn-secondary ${(!joinId || !joinNft) && "opacity-50"}`}>⚔️ Fight!</button>
          </div>
        </section>
      )}

      {/* ═══ LEADERBOARD ═══ */}
      {tab === "leader" && (
        <section className="pt-16 pb-10 px-4 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-gold mb-4">🏆 Leaderboard</h2>
          <div className="card mb-4">
            <h3 className="text-xs font-bold text-quantum-cyan mb-3">Your Rank</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="stat-box border border-quantum-green/20"><div className="text-lg font-black text-quantum-green">{wins}</div><div className="text-[8px]">Wins</div></div>
              <div className="stat-box border border-quantum-pink/20"><div className="text-lg font-black text-quantum-pink">{losses}</div><div className="text-[8px]">Losses</div></div>
              <div className="stat-box border border-quantum-gold/20"><div className="text-lg font-black text-quantum-gold">{score}</div><div className="text-[8px]">Score</div></div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-xs font-bold text-quantum-gold mb-2">How Scoring Works</h3>
            <div className="space-y-1 text-[10px] text-gray-400">
              <p>⚔️ PvP Win: +500 points</p>
              <p>🗺️ Quest (per difficulty): +100 points</p>
              <p>🤝 Referral bonus from activity</p>
              <p>🏅 Achievements unlock badges</p>
            </div>
          </div>
          <p className="text-[9px] text-gray-600 text-center mt-3">Full on-chain leaderboard coming with The Graph indexer</p>
        </section>
      )}

      {/* ═══ REFERRAL ═══ */}
      {tab === "ref" && (
        <section className="pt-16 pb-10 px-4 max-w-md mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-green mb-4">🤝 Referral</h2>
          {wallet ? (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="stat-box border border-quantum-green/20"><div className="text-xl font-black text-quantum-green">{refCount}</div><div className="text-[9px]">Referrals</div></div>
                <div className="stat-box border border-quantum-gold/20"><div className="text-xl font-black text-quantum-gold">{refEarned}</div><div className="text-[9px]">QTM Earned</div></div>
              </div>
              <div className="card bg-quantum-green/5 border-quantum-green/20">
                <label className="text-[10px] text-gray-500 block mb-1">YOUR LINK</label>
                <p className="text-[10px] text-quantum-green break-all bg-black/30 p-2 rounded-lg mb-2">{refLink}</p>
                <div className="flex gap-2">
                  <button onClick={() => cp(refLink, "ref")} className="btn-primary flex-1 bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900 !py-2.5 text-xs">{copied === "ref" ? "✅" : "📋 Copy"}</button>
                  <button onClick={() => { if (navigator.share) navigator.share({ title: "Quantum QTM", url: refLink }); else cp(refLink, "ref"); }} className="btn-secondary flex-1 !py-2.5 text-xs">📤 Share</button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {[{ a: "Transfers", e: "2% of fee" }, { a: "NFT Mints", e: "10% of price" }, { a: "Quests", e: "5% of reward" }, { a: "Battles", e: "5% of pot" }].map((r) => (
                  <div key={r.a} className="flex justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                    <span className="text-gray-400">{r.a}</span><span className="text-quantum-green font-bold">{r.e}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center"><p className="text-gray-500 mb-3 text-sm">Connect to get your link</p><button onClick={conn} className="btn-primary w-auto px-8 bg-gradient-to-r from-quantum-cyan to-quantum-purple text-dark-900">🔌 Connect</button></div>
          )}
        </section>
      )}

      {/* ═══ BRIDGE ═══ */}
      {tab === "bridge" && (
        <section className="pt-16 pb-10 px-4 max-w-md mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-cyan mb-4">🌐 Bridge QTM</h2>
          <div className="card mb-3">
            {[{ n: "Monad (Home)", c: "text-quantum-purple", live: true }, { n: "Ethereum", c: "text-blue-400", live: false }, { n: "BSC", c: "text-yellow-400", live: false }, { n: "Arbitrum", c: "text-blue-300", live: false }, { n: "Base", c: "text-blue-500", live: false }].map((ch) => (
              <div key={ch.n} className="flex justify-between p-2 rounded-lg bg-black/20 mb-1 text-[11px]">
                <span className={`font-bold ${ch.c}`}>{ch.n}</span>
                <span className={ch.live ? "text-quantum-green" : "text-gray-600"}>{ch.live ? "✅ Live" : "🔜 Soon"}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 text-center">LayerZero V2 OFT Adapter deployment in progress</p>
        </section>
      )}

      {/* ═══ VLY ═══ */}
      {tab === "vly" && (
        <section className="pt-20 pb-10 px-4 max-w-sm mx-auto text-center">
          <div className="text-5xl mb-2">💎</div>
          <h2 className="text-2xl font-black text-quantum-gold tracking-[4px] mb-3">$VLY</h2>
          <a href={L.vly} target="_blank" rel="noopener noreferrer"><button className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white mb-3">🚀 Buy on DexScreener</button></a>
        </section>
      )}

      {/* ═══ PRIVACY ═══ */}
      {tab === "privacy" && (
        <section className="pt-16 pb-10 px-4 max-w-xl mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-cyan mb-4">🔒 Privacy Policy</h2>
          <div className="card text-xs text-gray-400 leading-7 space-y-3">
            <p>Last updated: March 2026</p>
            <p><strong className="text-quantum-cyan">1. Data Collection:</strong> QUANTUM is fully decentralized. We do NOT collect personal data. Only your public blockchain address is used.</p>
            <p><strong className="text-quantum-cyan">2. Wallet:</strong> We access only your public address for balances and transactions. No private keys or seed phrases.</p>
            <p><strong className="text-quantum-cyan">3. Blockchain:</strong> All transactions are public and immutable on Monad blockchain.</p>
            <p><strong className="text-quantum-cyan">4. Cookies:</strong> No cookies, tracking, or analytics.</p>
            <p><strong className="text-quantum-cyan">5. Fees:</strong> Smart contract fees are transparent and verified on MonadScan.</p>
            <p><strong className="text-quantum-cyan">6. Contact:</strong> <a href={L.x} target="_blank" rel="noopener noreferrer">@volya089</a> | <a href={L.tg} target="_blank" rel="noopener noreferrer">Telegram</a> | <a href={L.site} target="_blank" rel="noopener noreferrer">closefast.tech</a></p>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] px-4 py-5">
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {[
            { href: L.x, label: "𝕏 @volya089", c: "text-quantum-cyan border-quantum-cyan/20" },
            { href: L.tg, label: "📱 Telegram", c: "text-quantum-purple border-quantum-purple/20" },
            { href: L.site, label: "🌐 CloseFast", c: "text-quantum-green border-quantum-green/20" },
            { href: L.vly, label: "💎 $VLY", c: "text-quantum-gold border-quantum-gold/20" },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 rounded-lg bg-white/[0.02] border text-[10px] font-bold no-underline hover:bg-white/[0.05] ${l.c}`}>{l.label}</a>
          ))}
        </div>
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          {[{ n: "Token", a: C.QTM }, { n: "NFT", a: C.NFT }, { n: "Game", a: C.GAME }].map((c) => (
            <a key={c.n} href={L.scan + c.a} target="_blank" rel="noopener noreferrer" className="text-[8px] text-gray-600 no-underline hover:text-gray-400">{c.n}: {sh(c.a)}</a>
          ))}
        </div>
        <p className="text-center text-[8px] text-gray-700">
          QUANTUM • Monad • <span className="cursor-pointer hover:text-gray-500" onClick={() => setTab("privacy")}>Privacy</span> • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
