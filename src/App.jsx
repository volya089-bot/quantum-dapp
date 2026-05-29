import { useState, useEffect, useCallback, useMemo } from "react";
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
  site: "https://closefast.tech/", scan: "https://monadexplorer.com/address/",
  vly: "https://dexscreener.com/monad/0x8aa57ccc34e14ab5404fd4e3481babc047ed54e6",
};
const LOGO = "https://peach-fascinating-dragonfly-692.mypinata.cloud/ipfs/bafybeifys4axhdlhmupjqlqbnocyeqtm3zojd7x6d4clthuwzhy47ygll4?pinataGatewayToken=bWYA3wgNwzuNFYwibilk9VG-RKvTcJ336mxOMdrpDzaD_vg5zmcufW_DY1vfQr4t";
const MONAD = { chainId: "0x8F", chainName: "Monad Mainnet", rpcUrls: ["https://rpc.monad.xyz"], nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 }, blockExplorerUrls: ["https://monadexplorer.com"] };

const VLY_CONTRACT = "0x9459ddd1B70E51280DEf774650EcD04F0e24d234";
const VLY_PAIR = "0xd87ae1f36a59c4f793dee766e2188ce3b9241e05";
const MAINNET_RPC = "https://rpc.monad.xyz";

const QTM_ABI = ["function balanceOf(address) view returns (uint256)","function approve(address,uint256) returns (bool)","function stake(uint256,uint256)","function unstake()","function pendingReward(address) view returns (uint256)","function stakes(address) view returns (uint256,uint256,uint256,uint256)","function setReferrer(address)","function referralCount(address) view returns (uint256)","function referralEarned(address) view returns (uint256)","function getPoolsInfo() view returns (uint256,uint256,uint256)","function totalSupply() view returns (uint256)","function totalBurned() view returns (uint256)"];
const NFT_ABI = ["function totalSupply() view returns (uint256)","function mintPriceMON() view returns (uint256)","function mintPriceQTM() view returns (uint256)","function maxSupply() view returns (uint256)","function balanceOf(address) view returns (uint256)","function mintWithMON(uint256) payable","function mintWithQTM(uint256)","function nftData(uint256) view returns (uint8,uint256,uint256,uint256,uint256,uint256,uint256,string)"];
const GAME_ABI = ["function startQuest(uint256,uint256)","function completeQuest()","function createBattle(uint256,uint256) returns (uint256)","function joinBattle(uint256,uint256)","function wins(address) view returns (uint256)","function losses(address) view returns (uint256)","function playerScore(address) view returns (uint256)","function activeQuests(address) view returns (uint256,uint256,uint256,bool)","function battleCount() view returns (uint256)","function battles(uint256) view returns (address,address,uint256,uint256,uint256,uint256,bool,address)"];

const QUESTS = [
  { name: "Quantum Patrol", diff: 1, reward: "50", xp: 100, time: "1h", pow: 10 },
  { name: "Dark Matter Raid", diff: 3, reward: "200", xp: 300, time: "4h", pow: 50 },
  { name: "Nebula Expedition", diff: 5, reward: "500", xp: 600, time: "8h", pow: 100 },
  { name: "Black Hole Dive", diff: 7, reward: "1,000", xp: 1000, time: "12h", pow: 200 },
  { name: "Multiverse Breach", diff: 10, reward: "5,000", xp: 3000, time: "24h", pow: 500 },
];
const RARITY = ["Common","Uncommon","Rare","Epic","Legendary","Quantum"];
const R_CLR = ["#6b7280","#22c55e","#3b82f6","#a855f7","#f59e0b","#f43f5e"];
const DAILY = [5, 8, 12, 15, 20, 25, 50];

// ═══ DYNAMIC SVG NFT GENERATOR ═══
function generateNFTSvg(tokenId, rarity = 0, power = 50, speed = 50, luck = 10) {
  const seed = tokenId * 7919 + 1;
  const h1 = (seed * 137) % 360;
  const h2 = (h1 + 60 + (seed % 120)) % 360;
  const h3 = (h2 + 40 + (seed % 80)) % 360;
  const numShapes = 3 + (seed % 5);
  const rarityGlow = rarity * 4;

  let shapes = "";
  for (let i = 0; i < numShapes; i++) {
    const cx = 60 + ((seed * (i + 3) * 31) % 280);
    const cy = 80 + ((seed * (i + 7) * 17) % 240);
    const r = 15 + ((seed * (i + 2) * 13) % 45);
    const rot = (seed * (i + 1) * 23) % 360;
    const opacity = 0.15 + (i * 0.08);
    const sides = 3 + ((seed * (i + 4)) % 5);

    if (sides <= 4) {
      shapes += `<rect x="${cx - r / 2}" y="${cy - r / 2}" width="${r}" height="${r}" rx="${r / 6}" transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="hsl(${(h1 + i * 40) % 360},80%,65%)" stroke-width="1.5" opacity="${opacity}"><animateTransform attributeName="transform" type="rotate" from="${rot} ${cx} ${cy}" to="${rot + 360} ${cx} ${cy}" dur="${8 + i * 3}s" repeatCount="indefinite"/></rect>`;
    } else if (sides <= 5) {
      const points = Array.from({ length: sides }, (_, j) => {
        const angle = (j * 2 * Math.PI) / sides - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(" ");
      shapes += `<polygon points="${points}" fill="none" stroke="hsl(${(h2 + i * 50) % 360},75%,60%)" stroke-width="1.2" opacity="${opacity}" transform="rotate(${rot} ${cx} ${cy})"><animateTransform attributeName="transform" type="rotate" from="${rot} ${cx} ${cy}" to="${rot + 360} ${cx} ${cy}" dur="${10 + i * 2}s" repeatCount="indefinite"/></polygon>`;
    } else {
      shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="hsl(${(h3 + i * 30) % 360},70%,55%)" stroke-width="1" opacity="${opacity}"><animate attributeName="r" values="${r};${r + 8};${r}" dur="${6 + i * 2}s" repeatCount="indefinite"/></circle>`;
    }
  }

  // Orbital rings
  for (let i = 0; i < 2 + (seed % 2); i++) {
    const orbitR = 80 + i * 50;
    shapes += `<ellipse cx="200" cy="200" rx="${orbitR}" ry="${orbitR * 0.4}" fill="none" stroke="hsl(${(h1 + i * 60) % 360},60%,50%)" stroke-width="0.8" opacity="0.2" stroke-dasharray="8 6" transform="rotate(${i * 35 + (seed % 30)} 200 200)"><animateTransform attributeName="transform" type="rotate" from="${i * 35} 200 200" to="${i * 35 + 360} 200 200" dur="${20 + i * 5}s" repeatCount="indefinite"/></ellipse>`;
  }

  // Center particle
  shapes += `<circle cx="200" cy="200" r="${6 + rarity * 2}" fill="url(#cg)" filter="url(#glow)"><animate attributeName="r" values="${6 + rarity * 2};${10 + rarity * 3};${6 + rarity * 2}" dur="3s" repeatCount="indefinite"/></circle>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <radialGradient id="bg"><stop offset="0%" stop-color="hsl(${h1},40%,8%)"/><stop offset="100%" stop-color="#040810"/></radialGradient>
      <radialGradient id="cg"><stop offset="0%" stop-color="hsl(${h1},90%,70%)"/><stop offset="100%" stop-color="hsl(${h2},80%,40%)"/></radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="${3 + rarityGlow}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="400" height="400" fill="url(#bg)" rx="16"/>
    ${shapes}
    <text x="200" y="26" text-anchor="middle" fill="hsl(${h1},70%,70%)" font-size="11" font-family="monospace" opacity="0.7">QUANTUM #${tokenId}</text>
    <text x="200" y="380" text-anchor="middle" fill="${R_CLR[rarity]}" font-size="13" font-family="monospace" font-weight="bold">${RARITY[rarity]}</text>
    <text x="90" y="396" text-anchor="middle" fill="#00f0ff" font-size="9" font-family="monospace" opacity="0.6">PWR:${power}</text>
    <text x="200" y="396" text-anchor="middle" fill="#22c55e" font-size="9" font-family="monospace" opacity="0.6">SPD:${speed}</text>
    <text x="310" y="396" text-anchor="middle" fill="#f59e0b" font-size="9" font-family="monospace" opacity="0.6">LCK:${luck}</text>
  </svg>`;
}

function NFTPreview({ tokenId = 1, rarity = 0, power = 50, speed = 50, luck = 10, customImage = null }) {
  const svg = useMemo(() => generateNFTSvg(tokenId, rarity, power, speed, luck), [tokenId, rarity, power, speed, luck]);
  if (customImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square">
        <img src={customImage} alt="Custom NFT" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-xs font-bold text-quantum-cyan">QUANTUM #{tokenId}</p>
          <div className="flex gap-3 text-[9px] mt-1">
            <span className="text-quantum-cyan">PWR:{power}</span>
            <span className="text-quantum-green">SPD:{speed}</span>
            <span className="text-quantum-gold">LCK:{luck}</span>
          </div>
        </div>
      </div>
    );
  }
  return <div className="rounded-2xl overflow-hidden border border-white/10" dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ═══ MAIN APP ═══
export default function App() {
  const [wallet, setWallet] = useState(null);
  const [chainOk, setChainOk] = useState(false);
  const [tab, setTab] = useState("home");
  const [copied, setCopied] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [monBal, setMonBal] = useState(null);
  const [txStatus, setTxStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  const [qtmBal, setQtmBal] = useState("0");
  const [nftBal, setNftBal] = useState("0");
  const [nftSupply, setNftSupply] = useState("0");
  const [qtmCirculating, setQtmCirculating] = useState("—");
  const [qtmBurnedAmt, setQtmBurnedAmt] = useState("0");
  const [poolStaking, setPoolStaking] = useState("—");
  const [poolGame, setPoolGame] = useState("—");
  const [blockNum, setBlockNum] = useState(null);
  const [vlyPrice, setVlyPrice] = useState(null);
  const [vlyMarketCap, setVlyMarketCap] = useState(null);
  const [vlyLiquidity, setVlyLiquidity] = useState(null);
  const [vlyCirculating, setVlyCirculating] = useState(null);
  const [vlyUserBal, setVlyUserBal] = useState(null);
  const [topNFTs, setTopNFTs] = useState([]);
  const [creationFee, setCreationFee] = useState("0");
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

  const [mintQty, setMintQty] = useState(1);
  const [stakeAmt, setStakeAmt] = useState("");
  const [stakeDays, setStakeDays] = useState(30);
  const [questId, setQuestId] = useState(0);
  const [questNft, setQuestNft] = useState("");
  const [battleNft, setBattleNft] = useState("");
  const [battleWager, setBattleWager] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinNft, setJoinNft] = useState("");
  const [previewId, setPreviewId] = useState(1);
  const [previewRarity, setPreviewRarity] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [dailyDay, setDailyDay] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => { const h = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener("beforeinstallprompt", h); return () => window.removeEventListener("beforeinstallprompt", h); }, []);
  useEffect(() => { const p = new URLSearchParams(window.location.search); const r = p.get("ref"); if (r) localStorage.setItem("qtm_referrer", r); }, []);
  useEffect(() => { const l = localStorage.getItem("qtm_daily_last"); const s = parseInt(localStorage.getItem("qtm_daily_streak") || "0"); setDailyClaimed(l === new Date().toDateString()); setDailyDay(s % 7); }, []);
  useEffect(() => { const load = async () => { if (!window.ethers) return; try { const prov = new window.ethers.JsonRpcProvider("https://rpc.monad.xyz"); const nft = new window.ethers.Contract(C.NFT, NFT_ABI, prov); const [sup, prMON] = await Promise.all([nft.totalSupply().catch(() => 0n), nft.mintPriceMON().catch(() => 0n)]); setNftSupply(String(sup)); setMintPrice(String(prMON)); } catch(e) { console.warn("p:", e); } }; const t = setTimeout(load, 800); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const loadGlobal = async () => {
      if (!window.ethers) return;
      try {
        const prov = new window.ethers.JsonRpcProvider("https://rpc.monad.xyz");
        const fmtM = v => (parseFloat(window.ethers.formatEther(v))/1e6).toFixed(1)+"M";
        const QA = ["function totalSupply() view returns (uint256)","function totalBurned() view returns (uint256)","function getPoolsInfo() view returns (uint256,uint256,uint256)"];
        const NA = ["function totalSupply() view returns (uint256)","function ownerOf(uint256) view returns (address)","function nftData(uint256) view returns (uint8,uint256,uint256,uint256,uint256,uint256,uint256,string)"];
        const FA = ["function creationFeeMON() view returns (uint256)"];
        const qtmC = new window.ethers.Contract(C.QTM, QA, prov);
        const nftC = new window.ethers.Contract(C.NFT, NA, prov);
        const facC = new window.ethers.Contract(C.FACTORY, FA, prov);
        const blk = await prov.getBlockNumber();
        setBlockNum(blk.toLocaleString());
        const [ts, tb, pi, fee] = await Promise.all([qtmC.totalSupply().catch(()=>0n),qtmC.totalBurned().catch(()=>0n),qtmC.getPoolsInfo().catch(()=>[0n,0n,0n]),facC.creationFeeMON().catch(()=>0n)]);
        const circ = ts - pi[0] - pi[1] - pi[2];
        setQtmCirculating(fmtM(circ > 0n ? circ : ts));
        setQtmBurnedAmt(fmtM(tb));
        setPoolStaking(fmtM(pi[0]));
        setPoolGame(fmtM(pi[1]));
        setCreationFee(window.ethers.formatEther(fee));
        const sup = Number(await nftC.totalSupply().catch(()=>0n));
        if (sup > 0) {
          const nfts = [];
          for (let i = 1; i <= sup; i++) {
            try {
              const [owner, d] = await Promise.all([nftC.ownerOf(i).catch(()=>"?"),nftC.nftData(i).catch(()=>null)]);
              if (d) nfts.push({id:i,owner,rarity:Number(d[0]),power:Number(d[1]),speed:Number(d[2]),luck:Number(d[3]),mintTime:Number(d[4])});
            } catch {}
          }
          nfts.sort((a,b)=>b.power-a.power);
          setTopNFTs(nfts);
        }
      } catch(e) { console.warn("globalLoad:", e); }
    };
    loadGlobal();
    const iv = setInterval(async()=>{
      if(!window.ethers) return;
      const prov = new window.ethers.JsonRpcProvider("https://rpc.monad.xyz");
      prov.getBlockNumber().then(b=>setBlockNum(b.toLocaleString())).catch(()=>{});
    }, 12000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const mainProv = new ethers.JsonRpcProvider(MAINNET_RPC);
        const vlyABI = ["function totalSupply() view returns (uint256)","function balanceOf(address) view returns (uint256)"];
        const pairABI = ["function getReserves() view returns (uint112,uint112,uint32)","function token0() view returns (address)"];
        const vlyToken = new ethers.Contract(VLY_CONTRACT, vlyABI, mainProv);
        const pairContract = new ethers.Contract(VLY_PAIR, pairABI, mainProv);
        const [ts, reserves, token0] = await Promise.all([vlyToken.totalSupply(), pairContract.getReserves(), pairContract.token0()]);
        const isVLYToken1 = token0.toLowerCase() !== VLY_CONTRACT.toLowerCase();
        const wmonRes = isVLYToken1 ? Number(reserves[0]) / 1e18 : Number(reserves[1]) / 1e18;
        const vlyRes = isVLYToken1 ? Number(reserves[1]) / 1e18 : Number(reserves[0]) / 1e18;
        const price = vlyRes > 0 ? wmonRes / vlyRes : 0;
        setVlyPrice(price);
        setVlyMarketCap(price * (Number(ts) / 1e18));
        setVlyLiquidity(wmonRes * 2);
        setVlyCirculating(Number(ts) / 1e18);
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts[0]) { const b = await vlyToken.balanceOf(accounts[0]); setVlyUserBal(Number(b)/1e18); }
          } catch(e) {}
        }
      } catch(e) { console.log("VLY loader err:", e.message); }
    })();
  }, []);



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
    const ref = localStorage.getItem("qtm_referrer");
    if (ref && ref !== a[0] && window.ethers) { try { const s = await new window.ethers.BrowserProvider(window.ethereum).getSigner(); await new window.ethers.Contract(C.QTM, QTM_ABI, s).setReferrer(ref); } catch {} }
  };
  const disc = () => { setWallet(null); setChainOk(false); setMonBal(null); setShowWallet(false); };
  const cp = (t, l) => { navigator.clipboard.writeText(t); setCopied(l); setTimeout(() => setCopied(""), 2000); };
  const sh = (a) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
  const fmt = (w) => { try { return parseFloat(window.ethers.formatEther(w)).toFixed(2); } catch { return "0"; } };
  const tx = (m) => { setTxStatus(m); if (!m.includes("⏳")) setTimeout(() => setTxStatus(""), 4000); };

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
      const bc = Number(await g.battleCount()); const ob = [];
      for (let i = Math.max(0, bc - 15); i < bc; i++) { try { const b = await g.battles(i); if (b[1] === "0x0000000000000000000000000000000000000000" && !b[6]) ob.push({ id: i, p1: b[0], nft: Number(b[2]), wager: fmt(b[4]) }); } catch {} }
      setOpenBattles(ob);
    } catch (e) { console.error(e); }
  }, [wallet]);

  useEffect(() => { refresh(); }, [refresh, tab]);

  const act = async (fn) => { try { await fn(); } catch (e) { tx("❌ " + (e.reason || e.message || "Error").slice(0, 80)); } };
  const gs = async () => new window.ethers.BrowserProvider(window.ethereum).getSigner();

  const doMint = async () => { const s = await gs(); const n = new window.ethers.Contract(C.NFT, NFT_ABI, s); const pr = await n.mintPriceMON(); tx("⏳ Minting..."); const t = await n.mintWithMON(mintQty, { value: pr * BigInt(mintQty) }); await t.wait(); tx("✅ Minted!"); refresh(); };
  const doStake = async () => { const s = await gs(); tx("⏳ Staking..."); await (await new window.ethers.Contract(C.QTM, QTM_ABI, s).stake(window.ethers.parseEther(stakeAmt), stakeDays)).wait(); tx("✅ Staked!"); refresh(); };
  const doUnstake = async () => { const s = await gs(); tx("⏳ Unstaking..."); await (await new window.ethers.Contract(C.QTM, QTM_ABI, s).unstake()).wait(); tx("✅ Claimed!"); refresh(); };
  const doQuest = async () => { const s = await gs(); tx("⏳ Quest..."); await (await new window.ethers.Contract(C.GAME, GAME_ABI, s).startQuest(questId, questNft)).wait(); tx("✅ Started!"); refresh(); };
  const doComplete = async () => { const s = await gs(); tx("⏳ Completing..."); await (await new window.ethers.Contract(C.GAME, GAME_ABI, s).completeQuest()).wait(); tx("✅ Rewards!"); refresh(); };
  const doBattle = async () => { const s = await gs(); const g = new window.ethers.Contract(C.GAME, GAME_ABI, s); const w = battleWager ? window.ethers.parseEther(battleWager) : 0n; if (w > 0n) { tx("⏳ Approving..."); await (await new window.ethers.Contract(C.QTM, QTM_ABI, s).approve(C.GAME, w)).wait(); } tx("⏳ Creating..."); await (await g.createBattle(battleNft, w)).wait(); tx("✅ Created!"); refresh(); };
  const doJoin = async () => { const s = await gs(); tx("⏳ Fighting..."); await (await new window.ethers.Contract(C.GAME, GAME_ABI, s).joinBattle(joinId, joinNft)).wait(); tx("✅ Resolved!"); refresh(); };

  const claimDaily = () => { localStorage.setItem("qtm_daily_last", new Date().toDateString()); localStorage.setItem("qtm_daily_streak", String((dailyDay + 1) % 7)); setDailyClaimed(true); setDailyDay((d) => (d + 1) % 7); tx(`✅ Claimed ${DAILY[dailyDay]} QTM!`); };

  const handleImageUpload = (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setUploadedImage(ev.target.result); r.readAsDataURL(f); } };

  const refLink = wallet ? `${window.location.origin}?ref=${wallet}` : "";
  const tabs = [
    { id: "home", l: "HOME" }, { id: "mint", l: "🎨MINT" }, { id: "stake", l: "🏦STK" },
    { id: "quest", l: "🗺️Q" }, { id: "pvp", l: "⚔️PVP" }, { id: "leader", l: "🏆TOP" },
    { id: "ref", l: "🤝REF" }, { id: "my-nfts", l: "🖼️NFTs" }, { id: "bridge", l: "🌐" }, { id: "vly", l: "💎QTM" },
  ];

  // ═══ STATS BAR ═══
  const StatsBar = () => (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 max-w-4xl w-full mx-auto mb-4">
      {[
        { v: totalSupply, l: "Supply", c: "text-quantum-cyan" },
        { v: totalBurned, l: "Burned", c: "text-quantum-pink" },
        { v: qtmBal, l: "My QTM", c: "text-quantum-cyan" },
        { v: nftBal, l: "My NFTs", c: "text-quantum-gold" },
        { v: `${wins}W/${losses}L`, l: "PvP", c: "text-quantum-green" },
        { v: score, l: "Score", c: "text-quantum-gold" },
        { v: refCount, l: "Refs", c: "text-quantum-purple" },
        { v: nftSupply, l: "Minted", c: "text-quantum-pink" },
      ].map((s) => (
        <div key={s.l} className="stat-box"><div className={`text-xs lg:text-sm font-black ${s.c}`}>{s.v}</div><div className="text-[7px] text-gray-600">{s.l}</div></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-mono">
      <Helmet><title>{tab === "home" ? "Quantum | Home" : `Quantum | ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}</title></Helmet>

      {/* Toast */}
      {txStatus && <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-bold animate-slide-up max-w-[90%] ${txStatus.includes("✅") ? "bg-quantum-green text-dark-900" : txStatus.includes("❌") ? "bg-quantum-pink text-white" : "bg-quantum-cyan text-dark-900"}`}>{txStatus}</div>}

      {/* ═══ HEADER with QTM Balance ═══ */}
      <nav className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between px-2 lg:px-6 py-2 bg-dark-900/95 backdrop-blur-xl border-b border-quantum-cyan/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("home")}>
          <img src={LOGO} alt="" className="w-6 h-6 rounded-full border-2 border-quantum-cyan" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-sm font-black tracking-widest gradient-text from-quantum-cyan to-quantum-purple hidden sm:inline">QUANTUM</span>
          <span className="hidden sm:inline text-[8px] px-1.5 py-0.5 rounded bg-quantum-purple/10 text-quantum-purple border border-quantum-purple/20 font-bold tracking-wider">MONAD</span>
          <span className="text-sm font-black tracking-widest gradient-text from-quantum-cyan to-quantum-purple sm:hidden">QTM</span>
        </div>

        {blockNum && (
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-quantum-purple/5 border border-quantum-purple/20">
            <span className="w-1.5 h-1.5 rounded-full bg-quantum-green animate-pulse inline-block"></span>
            <span className="text-[9px] text-gray-500 font-mono">#{blockNum}</span>
          </div>
        )}
        {/* QTM Balance in header */}
        {wallet && qtmBal !== "0" && (
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-quantum-cyan/5 border border-quantum-cyan/20">
            <span className="text-quantum-cyan text-xs font-bold">⚛️ {qtmBal} QTM</span>
            {monBal && <span className="text-gray-500 text-[10px] ml-2">💰{monBal} MON</span>}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto max-w-[45%] lg:max-w-[50%]">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "bg-quantum-cyan/15 text-quantum-cyan border border-quantum-cyan/30" : "text-gray-600 border border-transparent"}`}>{t.l}</button>
          ))}
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {wallet && qtmBal !== "0" && <span className="lg:hidden text-[9px] text-quantum-cyan font-bold">{qtmBal}</span>}
          {wallet ? (
            <button onClick={() => setShowWallet(!showWallet)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold min-h-[34px] flex items-center gap-1 ${chainOk ? "bg-quantum-cyan/10 text-quantum-cyan border border-quantum-cyan/30" : "bg-quantum-gold/15 text-quantum-gold border border-quantum-gold/30"}`}>
              {chainOk ? "🟢" : "⚠️"}{sh(wallet)}
            </button>
          ) : (
            <button onClick={conn} className="px-3 py-2 rounded-lg text-xs font-black min-h-[38px] bg-gradient-to-r from-quantum-cyan to-quantum-purple text-dark-900">🔌 Connect</button>
          )}
        </div>
      </nav>

      {/* Wallet Modal */}
      {showWallet && (
        <div>
          <div className="fixed inset-0 z-[98] bg-black/60" onClick={() => setShowWallet(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[320px] p-5 rounded-2xl bg-dark-800 border border-quantum-cyan/20 animate-slide-up">
            <h3 className="text-sm font-black text-quantum-cyan mb-2">Wallet</h3>
            <p className="text-[11px] break-all mb-1">{wallet}</p>
            {monBal && <p className="text-sm text-quantum-cyan font-bold">💰 {monBal} MON</p>}
            <p className="text-sm text-quantum-purple font-bold">⚛️ {qtmBal} QTM</p>
            {nftBal !== "0" && <p className="text-sm text-quantum-gold font-bold mb-3">🎨 {nftBal} NFTs</p>}
            <button onClick={() => cp(wallet, "w")} className="btn-secondary mb-2 !py-2 text-xs">{copied === "w" ? "✅" : "📋 Copy"}</button>
            <button onClick={disc} className="btn-secondary !text-quantum-pink !border-quantum-pink/30 !py-2 text-xs">⏏ Disconnect</button>
          </div>
        </div>
      )}

      {/* ═══ HOME ═══ */}
      {tab === "home" && (
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 pb-10">
          <h1 className="text-[clamp(28px,7vw,56px)] font-black tracking-[4px] gradient-text from-quantum-cyan via-quantum-purple to-quantum-pink bg-[length:200%_200%] animate-gradient mb-2">QUANTUM</h1>
          <p className="text-xs text-gray-500 max-w-sm mb-4">Mint Dynamic NFTs • Stake QTM • PvP • Quests</p>

          {wallet && !dailyClaimed && (
            <div className="card mb-4 max-w-sm w-full bg-quantum-gold/5 border-quantum-gold/20">
              <p className="text-xs text-quantum-gold font-bold mb-2">🎁 Daily Reward — Day {dailyDay + 1}/7</p>
              <div className="flex justify-center gap-1 mb-3">
                {DAILY.map((r, i) => <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-bold ${i === dailyDay ? "bg-quantum-gold/20 text-quantum-gold border border-quantum-gold/40 scale-110" : i < dailyDay ? "bg-quantum-green/10 text-quantum-green" : "bg-white/5 text-gray-600"}`}>{r}</div>)}
              </div>
              <button onClick={claimDaily} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white !py-2 text-xs">🎁 Claim {DAILY[dailyDay]} QTM</button>
            </div>
          )}

          {installPrompt && <button onClick={() => { installPrompt.prompt(); setInstallPrompt(null); }} className="mb-4 px-4 py-2 rounded-lg bg-quantum-purple/10 border border-quantum-purple/30 text-quantum-purple text-xs font-bold">📱 Install App</button>}

          {/* Global On-Chain Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl w-full mx-auto mb-3">
            {[
              {v: nftSupply+"/10K", l: "NFTs Minted", c: "text-quantum-gold"},
              {v: qtmCirculating, l: "QTM Circulating", c: "text-quantum-cyan"},
              {v: poolStaking, l: "Staking Pool", c: "text-quantum-green"},
              {v: poolGame, l: "Game Rewards", c: "text-quantum-purple"},
            ].map(s => (
              <div key={s.l} className="stat-box border border-white/10">
                <div className={`text-sm font-black ${s.c}`}>{s.v}</div>
                <div className="text-[7px] text-gray-600 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
          {wallet && <StatsBar />}

          {/* NFT Preview Carousel */}
          <div className="max-w-xs w-full mb-4">
            <NFTPreview tokenId={previewId} rarity={previewRarity} power={30 + previewId * 5} speed={25 + previewId * 3} luck={5 + previewId} />
            <div className="flex justify-center gap-2 mt-2">
              {[0, 1, 2, 3, 4, 5].map((r) => <button key={r} onClick={() => { setPreviewRarity(r); setPreviewId(1 + r * 17); }} className={`w-7 h-7 rounded-full text-[8px] font-bold border ${previewRarity === r ? `border-2` : "border-white/10 opacity-50"}`} style={{ borderColor: R_CLR[r], color: R_CLR[r], background: `${R_CLR[r]}15` }}>{r + 1}x</button>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
            <button onClick={() => setTab("mint")} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white">🎨 Mint</button>
            <button onClick={() => setTab("stake")} className="btn-primary bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900">🏦 Stake</button>
            <button onClick={() => setTab("quest")} className="btn-primary bg-gradient-to-r from-quantum-purple to-quantum-pink text-white">🗺️ Quest</button>
            <button onClick={() => setTab("pvp")} className="btn-primary bg-gradient-to-r from-quantum-pink to-quantum-purple text-white">⚔️ PvP</button>
          </div>
        </section>
      )}

      {/* ═══ MINT — 2 COLUMN DESKTOP ═══ */}
      {tab === "mint" && (
        <section className="pt-16 pb-10 px-4 max-w-5xl mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-gold mb-4">🎨 Mint Dynamic NFT</h2>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT: NFT Preview (large on desktop) */}
            <div className="lg:w-1/2">
              <div className="max-w-md mx-auto lg:max-w-none lg:sticky lg:top-20">
                <NFTPreview
                  tokenId={parseInt(nftSupply || "0") + 1}
                  rarity={Math.floor(Math.random() * 3)}
                  power={30 + mintQty * 10}
                  speed={25 + mintQty * 8}
                  luck={5 + mintQty * 3}
                  customImage={uploadedImage}
                />
                {/* Upload */}
                <div className="mt-3 card">
                  <label className="text-[10px] text-gray-500 tracking-wider block mb-2">📸 UPLOAD CUSTOM IMAGE (optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-quantum-purple/20 file:text-quantum-purple file:font-bold file:cursor-pointer file:text-xs hover:file:bg-quantum-purple/30" />
                  {uploadedImage && (
                    <button onClick={() => setUploadedImage(null)} className="mt-2 text-[10px] text-quantum-pink cursor-pointer hover:underline">✕ Remove custom image</button>
                  )}
                  <p className="text-[9px] text-gray-600 mt-1">No image? Dynamic SVG with unique quantum pattern based on token ID</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Controls */}
            <div className="lg:w-1/2">
              <div className="card mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500">Minted</span>
                  <span className="text-sm font-bold text-quantum-gold">{nftSupply}/10,000</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/5 mb-4">
                  <div className="h-full rounded-full bg-gradient-to-r from-quantum-gold to-quantum-pink transition-all" style={{ width: `${(parseInt(nftSupply || "0") / 10000) * 100}%` }} />
                </div>

                <label className="text-[10px] text-gray-500 tracking-wider block mb-1">QUANTITY (1-10)</label>
                <input type="number" min="1" max="10" value={mintQty} onChange={(e) => setMintQty(Math.min(10, Math.max(1, +e.target.value)))} className="input-field mb-3" />

                <div className="flex justify-between text-xs mb-4">
                  <span className="text-gray-500">Price per NFT</span>
                  <span className="text-quantum-cyan font-bold">{mintPrice > 0 ? fmt(mintPrice) : "?"} MON</span>
                </div>
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-quantum-gold font-bold">{mintPrice > 0 ? (fmt(mintPrice) * mintQty).toFixed(2) : "?"} MON</span>
                </div>

                <button onClick={() => act(doMint)} disabled={!wallet} className={`btn-primary ${wallet ? "bg-gradient-to-r from-quantum-gold to-quantum-pink text-white" : "bg-gray-700 text-gray-500"}`}>
                  {wallet ? `🚀 Mint ${mintQty} NFT${mintQty > 1 ? "s" : ""}` : "🔌 Connect Wallet"}
                </button>
              </div>

              {/* Rarity table */}
              <div className="card">
                <h3 className="text-xs font-bold text-gray-500 mb-2">RARITY CHANCES</h3>
                {[
                  { n: "Common", p: "62%", c: "#6b7280" }, { n: "Uncommon", p: "25%", c: "#22c55e" },
                  { n: "Rare", p: "10%", c: "#3b82f6" }, { n: "Epic", p: "2.5%", c: "#a855f7" },
                  { n: "Legendary", p: "0.5%", c: "#f59e0b" }, { n: "Quantum", p: "0.01%", c: "#f43f5e" },
                ].map((r) => (
                  <div key={r.n} className="flex justify-between items-center py-1.5 border-b border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.c }} />
                      <span>{r.n}</span>
                    </div>
                    <span className="font-bold" style={{ color: r.c }}>{r.p}</span>
                  </div>
                ))}
              </div>

              {/* QTM Rewards info */}
              <div className="card mt-3 bg-quantum-cyan/5 border-quantum-cyan/20">
                <h3 className="text-xs font-bold text-quantum-cyan mb-1">⚛️ Earn QTM with your NFTs</h3>
                <p className="text-[10px] text-gray-400 leading-5">Stake NFTs in Game Engine to earn QTM daily. Use them in quests (50-5000 QTM rewards) and PvP battles. Higher rarity = higher stats = more rewards!</p>
              </div>
            </div>
          </div>
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
                {[7, 30, 90, 365].map((d) => <button key={d} onClick={() => setStakeDays(d)} className={`py-2 rounded-lg text-xs font-bold ${stakeDays === d ? "bg-quantum-cyan/15 text-quantum-cyan border border-quantum-cyan/30" : "bg-white/[0.03] text-gray-500 border border-white/[0.06]"}`}>{d}d</button>)}
              </div>
              <p className="text-[10px] text-gray-500 mb-2">APR: ~{(12 + (stakeDays / 365) * 5).toFixed(1)}% + tx fee share</p>
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
              <p className="text-[10px] text-gray-500 mb-3">NFT #{activeQuest.nid} • Reward: {QUESTS[activeQuest.qid]?.reward} QTM</p>
              <button onClick={() => act(doComplete)} className="btn-primary bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900">✅ Complete & Claim QTM</button>
            </div>
          ) : (
            <div className="card mb-3">
              {QUESTS.map((q, i) => (
                <div key={i} onClick={() => setQuestId(i)} className={`flex justify-between items-center p-2.5 rounded-lg mb-1 cursor-pointer ${questId === i ? "bg-quantum-purple/10 border border-quantum-purple/30" : "bg-black/20"}`}>
                  <div><div className={`font-bold text-[11px] ${questId === i ? "text-quantum-purple" : "text-gray-300"}`}>{q.name}</div><div className="text-[8px] text-gray-600">{q.time} • Pow:{q.pow} • XP:{q.xp}</div></div>
                  <span className="text-xs font-bold text-quantum-cyan">{q.reward} QTM</span>
                </div>
              ))}
              <label className="text-[10px] text-gray-500 tracking-wider block mb-1 mt-2">NFT ID</label>
              <input value={questNft} onChange={(e) => setQuestNft(e.target.value)} placeholder="1" className="input-field mb-2" />
              <button onClick={() => act(doQuest)} disabled={!questNft} className={`btn-primary bg-gradient-to-r from-quantum-purple to-quantum-pink text-white ${!questNft && "opacity-50"}`}>🚀 Start Quest</button>
            </div>
          )}
        </section>
      )}

      {/* ═══ PVP ═══ */}
      {tab === "pvp" && (
        <section className="pt-16 pb-10 px-4 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-pink mb-1">⚔️ PvP Battles</h2>
          <div className="flex justify-center gap-3 text-[11px] mb-4"><span className="text-quantum-green">🏆{wins}W</span><span className="text-quantum-pink">💀{losses}L</span><span className="text-quantum-gold">⭐{score}</span></div>
          <div className="card mb-3">
            <h3 className="text-xs font-bold text-quantum-pink mb-2">Create Battle</h3>
            <input value={battleNft} onChange={(e) => setBattleNft(e.target.value)} placeholder="NFT ID" className="input-field mb-1.5" />
            <input value={battleWager} onChange={(e) => setBattleWager(e.target.value)} placeholder="Wager QTM (optional)" className="input-field mb-2" />
            <button onClick={() => act(doBattle)} disabled={!battleNft} className={`btn-primary bg-gradient-to-r from-quantum-pink to-quantum-purple text-white ${!battleNft && "opacity-50"}`}>⚔️ Create</button>
          </div>
          {openBattles.length > 0 && (
            <div className="card mb-3">
              <h3 className="text-xs font-bold text-quantum-gold mb-2">Open Battles ({openBattles.length})</h3>
              {openBattles.map((b) => (
                <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-black/20 mb-1 text-[10px]">
                  <span>#{b.id} • {sh(b.p1)} • {b.wager}QTM</span>
                  <button onClick={() => { setJoinId(String(b.id)); }} className="px-2 py-1 rounded text-[9px] font-bold bg-quantum-pink/10 text-quantum-pink border border-quantum-pink/30">Join</button>
                </div>
              ))}
            </div>
          )}
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
<section className="pt-16 pb-10 px-4 max-w-2xl mx-auto">
<h2 className="text-xl font-black text-center text-quantum-gold mb-1">🏆 NFT Power Ranking</h2>
<p className="text-center text-[10px] text-gray-500 mb-4">Live on-chain · QUANTUM NFT contract · Monad Mainnet</p>
{wallet && <StatsBar />}
{topNFTs.length === 0 ? (
<div className="card text-center"><p className="text-gray-500 text-sm animate-pulse">Loading on-chain data...</p></div>
) : (
<div className="space-y-2">
{topNFTs.slice(0,20).map((nft, i) => (
<div key={nft.id} className="card flex items-center gap-3 py-2">
<div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i===0?"bg-quantum-gold/20 text-quantum-gold border border-quantum-gold/40":i===1?"bg-gray-400/20 text-gray-300 border border-gray-400/40":i===2?"bg-orange-600/20 text-orange-400 border border-orange-600/40":"bg-white/5 text-gray-600"}`}>{i+1}</div>
<div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-white/10" dangerouslySetInnerHTML={{__html: generateNFTSvg(nft.id, nft.rarity, nft.power, nft.speed, nft.luck)}} />
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-0.5 flex-wrap">
<span className="text-xs font-bold text-quantum-cyan">#{nft.id}</span>
<span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{background: R_CLR[nft.rarity]+"20", color: R_CLR[nft.rarity]}}>{RARITY[nft.rarity]}</span>
</div>
<div className="flex gap-2 text-[9px]">
<span className="text-quantum-cyan">PWR:<b>{nft.power}</b></span>
<span className="text-quantum-green">SPD:<b>{nft.speed}</b></span>
<span className="text-quantum-gold">LCK:<b>{nft.luck}</b></span>
</div>
<div className="text-[8px] text-gray-600 mt-0.5 truncate">
<a href={"https://monadexplorer.com/address/"+nft.owner} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-quantum-cyan no-underline font-mono">{nft.owner.substring(0,10)}...</a>
</div>
</div>
<a href={"https://monadexplorer.com/token/"+C.NFT+"?a="+nft.id} target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-600 hover:text-quantum-cyan no-underline shrink-0 ml-auto">↗</a>
</div>
))}
<div className="card mt-3 bg-quantum-cyan/5 border-quantum-cyan/20">
<div className="grid grid-cols-3 gap-2 text-center text-[10px]">
<div><div className="font-bold text-quantum-gold">{nftSupply}/10K</div><div className="text-gray-600">Minted</div></div>
<div><div className="font-bold text-quantum-green">{poolStaking}</div><div className="text-gray-600">Staking Pool</div></div>
<div><div className="font-bold text-quantum-purple">{poolGame}</div><div className="text-gray-600">Game Pool</div></div>
</div>
</div>
</div>
)}
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
                  <button onClick={() => cp(refLink, "ref")} className="btn-primary flex-1 bg-gradient-to-r from-quantum-green to-quantum-cyan text-dark-900 !py-2 text-xs">{copied === "ref" ? "✅" : "📋 Copy"}</button>
                  <button onClick={() => { if (navigator.share) navigator.share({ title: "Quantum", url: refLink }); else cp(refLink, "ref"); }} className="btn-secondary flex-1 !py-2 text-xs">📤 Share</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center"><button onClick={conn} className="btn-primary w-auto px-8 bg-gradient-to-r from-quantum-cyan to-quantum-purple text-dark-900">🔌 Connect</button></div>
          )}
        </section>
      )}

{/* ═══ MY NFTS ═══ */}
{tab === "my-nfts" && (
<section className="pt-16 pb-10 px-4 max-w-4xl mx-auto">
<h2 className="text-xl font-black text-center text-quantum-gold mb-4">🖼️ My Quantum NFTs</h2>
{!wallet ? (
<div className="card text-center"><p className="text-gray-400 mb-3 text-sm">Connect wallet to view your NFTs</p><button onClick={conn} className="btn-primary bg-gradient-to-r from-quantum-cyan to-quantum-purple text-dark-900">🔌 Connect</button></div>
) : nftBal === "0" ? (
<div className="card text-center"><p className="text-4xl mb-3">🎨</p><p className="text-gray-400 text-sm mb-3">You have no QUANTUM NFTs yet</p><button onClick={() => setTab("mint")} className="btn-primary bg-gradient-to-r from-quantum-gold to-quantum-pink text-white">🎨 Mint Now — 50 MON</button></div>
) : (
<div>
<p className="text-center text-xs text-gray-500 mb-4">You own <span className="text-quantum-gold font-bold">{nftBal}</span> QUANTUM NFT{nftBal !== "1" ? "s" : ""}</p>
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
{(topNFTs.filter(n=>n.owner.toLowerCase()===wallet.toLowerCase()).length > 0 ? topNFTs.filter(n=>n.owner.toLowerCase()===wallet.toLowerCase()) : Array.from({length:Math.min(parseInt(nftBal||"0"),20)},(_,i)=>({id:i+1,rarity:i%6,power:30+(i+1)*5,speed:25+(i+1)*3,luck:5+(i+1),owner:wallet,mintTime:0}))).map(nft=>(
<div key={nft.id} className="card hover:border-quantum-gold/40 transition-all hover:scale-[1.02]">
<NFTPreview tokenId={nft.id} rarity={nft.rarity} power={nft.power} speed={nft.speed} luck={nft.luck} />
<div className="mt-2 text-center">
<p className="text-xs font-bold text-quantum-cyan">QUANTUM #{nft.id}</p>
<p className="text-[9px] mb-1" style={{color:R_CLR[nft.rarity]}}>{RARITY[nft.rarity]}</p>
<div className="flex gap-1 justify-center text-[8px] mb-1">
<span className="text-quantum-cyan">PWR:{nft.power}</span>
<span className="text-quantum-green">SPD:{nft.speed}</span>
<span className="text-quantum-gold">LCK:{nft.luck}</span>
</div>
<div className="flex gap-1 justify-center flex-wrap">
<button onClick={()=>{setQuestNft(String(nft.id));setTab("quest");}} className="text-[8px] px-1.5 py-0.5 rounded bg-quantum-purple/10 text-quantum-purple border border-quantum-purple/20">🗺️ Quest</button>
<button onClick={()=>{setBattleNft(String(nft.id));setTab("pvp");}} className="text-[8px] px-1.5 py-0.5 rounded bg-quantum-pink/10 text-quantum-pink border border-quantum-pink/20">⚔️ PvP</button>
</div>
<a href={"https://monadexplorer.com/token/"+C.NFT+"?a="+nft.id} target="_blank" rel="noopener noreferrer" className="text-[8px] text-gray-600 hover:text-quantum-cyan no-underline block mt-1">Monad Explorer ↗</a>
</div>
</div>
))}
</div>
</div>
)}
{topNFTs.length > 0 && (
<div className="card mt-4 bg-white/[0.02]">
<h3 className="text-xs font-bold text-quantum-cyan mb-2">🌍 All {nftSupply} Minted NFTs (Top by Power)</h3>
<div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
{topNFTs.slice(0,16).map(nft=>(
<div key={nft.id} className="text-center py-1 rounded bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:border-quantum-cyan/20" onClick={()=>setTab("leader")}>
<div className="text-[8px] font-bold" style={{color:R_CLR[nft.rarity]}}>#{nft.id}</div>
<div className="text-[7px] text-quantum-cyan">P:{nft.power}</div>
</div>
))}
</div>
<p className="text-[8px] text-center text-gray-600 mt-1 cursor-pointer hover:text-gray-400" onClick={()=>setTab("leader")}>View full ranking →</p>
</div>
)}
</section>
)}

{/* ═══ BRIDGE ═══ */}
      {tab === "bridge" && (
        <section className="pt-16 pb-10 px-4 max-w-md mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-cyan mb-4">🌐 Bridge QTM</h2>
          <div className="card">
            {[{ n: "Monad", c: "text-quantum-purple", ok: true }, { n: "Ethereum", c: "text-blue-400" }, { n: "BSC", c: "text-yellow-400" }, { n: "Arbitrum", c: "text-blue-300" }, { n: "Base", c: "text-blue-500" }].map((ch) => (
              <div key={ch.n} className="flex justify-between p-2 rounded-lg bg-black/20 mb-1 text-[11px]"><span className={`font-bold ${ch.c}`}>{ch.n}</span><span className={ch.ok ? "text-quantum-green" : "text-gray-600"}>{ch.ok ? "✅ Live" : "🔜"}</span></div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-3">LayerZero V2 OFT — coming soon</p>
        </section>
      )}

      {/* ═══ VLY / TOKENOMICS ═══ */}
{tab === "vly" && (
    <section style={{padding:"1rem"}}>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontSize:"2.5rem",fontWeight:900,background:"linear-gradient(135deg,#a259ff,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🪙 VLY TOKEN</div>
        <div style={{color:"#888",fontSize:"0.85rem",marginTop:"0.3rem",fontFamily:"monospace"}}>Monad Mainnet • {VLY_CONTRACT.slice(0,8)}...{VLY_CONTRACT.slice(-6)}</div>
        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",marginTop:"0.8rem",flexWrap:"wrap"}}>
          <a href={"https://pancakeswap.finance/swap?outputCurrency="+VLY_CONTRACT+"&chain=monad"} target="_blank" rel="noopener noreferrer" style={{padding:"0.5rem 1.2rem",background:"linear-gradient(90deg,#a259ff,#00e5ff)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,textDecoration:"none",fontSize:"0.9rem"}}>🥞 Buy on PancakeSwap</a>
          <a href={"https://monadexplorer.com/address/"+VLY_CONTRACT} target="_blank" rel="noopener noreferrer" style={{padding:"0.5rem 1.2rem",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"8px",color:"#ccc",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}>🔍 Explorer</a>
          <a href={"https://monadexplorer.com/address/"+VLY_PAIR} target="_blank" rel="noopener noreferrer" style={{padding:"0.5rem 1.2rem",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"8px",color:"#ccc",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}>💧 Pair</a>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:"0.8rem",marginBottom:"1.5rem"}}>
        {[{label:"💰 Price",value:vlyPrice!=null?(vlyPrice<0.001?vlyPrice.toFixed(6):vlyPrice.toFixed(4))+" MON":"Loading…",sub:"per VLY"},{label:"📊 Market Cap",value:vlyMarketCap!=null?(vlyMarketCap>1e6?(vlyMarketCap/1e6).toFixed(2)+"M":vlyMarketCap.toFixed(0))+" MON":"Loading…",sub:"supply × price"},{label:"💧 Liquidity",value:vlyLiquidity!=null?vlyLiquidity.toFixed(4)+" MON":"Loading…",sub:"PancakeSwap pool"},{label:"🏦 Supply",value:vlyCirculating!=null?(vlyCirculating/1e6).toFixed(1)+"M VLY":"100M VLY",sub:"total on-chain"},].map((s,i)=>(
          <div key={i} style={{background:"rgba(162,89,255,0.1)",border:"1px solid rgba(162,89,255,0.3)",borderRadius:"12px",padding:"1rem",textAlign:"center"}}>
            <div style={{color:"#888",fontSize:"0.75rem",marginBottom:"0.3rem"}}>{s.label}</div>
            <div style={{fontSize:"1.1rem",fontWeight:700,color:"#e0e0e0"}}>{s.value}</div>
            <div style={{color:"#666",fontSize:"0.7rem"}}>{s.sub}</div>
          </div>
        ))}
      </div>
      {vlyUserBal!=null&&(<div style={{background:"rgba(0,229,255,0.08)",border:"1px solid rgba(0,229,255,0.3)",borderRadius:"12px",padding:"1rem",marginBottom:"1.5rem",textAlign:"center"}}><div style={{color:"#00e5ff",fontWeight:700,fontSize:"1.1rem"}}>💼 Your VLY: {vlyUserBal.toFixed(2)} VLY</div>{vlyPrice&&<div style={{color:"#888",fontSize:"0.8rem",marginTop:"0.3rem"}}>≈ {(vlyUserBal*vlyPrice).toFixed(4)} MON</div>}</div>)}
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"1.2rem",marginBottom:"1.5rem"}}>
        <h3 style={{margin:"0 0 1rem",color:"#fff",fontSize:"1rem",fontWeight:700}}>📊 VLY Tokenomics</h3>
        {[{v:"30M",label:"Community & Ecosystem",pct:30,color:"#a259ff"},{v:"25M",label:"Liquidity & DEX",pct:25,color:"#00e5ff"},{v:"20M",label:"Team & Dev",pct:20,color:"#ff6b6b"},{v:"15M",label:"Presale (LBT)",pct:15,color:"#ffd166"},{v:"10M",label:"Reserve",pct:10,color:"#06d6a0"},].map((row,i)=>(
          <div key={i} style={{marginBottom:"0.8rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}><span style={{color:"#ccc",fontSize:"0.85rem"}}>{row.label}</span><span style={{color:"#fff",fontWeight:600,fontSize:"0.85rem"}}>{row.v} ({row.pct}%)</span></div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:"4px",height:"6px",overflow:"hidden"}}><div style={{width:row.pct+"%",height:"100%",background:row.color,borderRadius:"4px"}}/></div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"1.2rem"}}>
        <h3 style={{margin:"0 0 0.8rem",color:"#fff",fontSize:"1rem",fontWeight:700}}>🚀 How to Get VLY</h3>
        {[{icon:"🥞",title:"Buy on PancakeSwap",desc:"Swap MON → VLY on Monad mainnet",link:"https://pancakeswap.finance/swap?outputCurrency="+VLY_CONTRACT+"&chain=monad"},{icon:"🎯",title:"LBT Presale",desc:"Buy LBT at presale.warrify.io using VLY",link:"https://presale.warrify.io"},{icon:"⚔️",title:"PvP Battles",desc:"Earn QTM → convert to VLY rewards (soon)",link:null},].map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"0.8rem",padding:"0.8rem",background:"rgba(255,255,255,0.04)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.08)",marginBottom:"0.6rem"}}>
            <span style={{fontSize:"1.4rem"}}>{item.icon}</span>
            <div style={{flex:1}}><div style={{color:"#fff",fontWeight:600,fontSize:"0.9rem"}}>{item.title}</div><div style={{color:"#888",fontSize:"0.78rem"}}>{item.desc}</div></div>
            {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" style={{padding:"0.4rem 0.9rem",background:"rgba(162,89,255,0.3)",border:"1px solid rgba(162,89,255,0.5)",borderRadius:"6px",color:"#a259ff",fontWeight:600,textDecoration:"none",fontSize:"0.8rem",whiteSpace:"nowrap"}}>Open →</a>}
          </div>
        ))}
      </div>
    </section>
  )}
      {tab === "privacy" && (
        <section className="pt-16 pb-10 px-4 max-w-xl mx-auto">
          <h2 className="text-xl font-black text-center text-quantum-cyan mb-4">🔒 Privacy</h2>
          <div className="card text-xs text-gray-400 leading-7 space-y-2">
            <p><strong className="text-quantum-cyan">1.</strong> No personal data collected. Only public blockchain address used.</p>
            <p><strong className="text-quantum-cyan">2.</strong> Wallet access is read-only (public address). No private keys.</p>
            <p><strong className="text-quantum-cyan">3.</strong> All transactions are public on Monad blockchain.</p>
            <p><strong className="text-quantum-cyan">4.</strong> No cookies or tracking.</p>
            <p><strong className="text-quantum-cyan">5.</strong> Contact: <a href={L.x}>@volya089</a> | <a href={L.tg}>Telegram</a> | <a href={L.site}>closefast.tech</a></p>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] px-4 py-4">
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {[{ href: L.x, l: "𝕏 @volya089", c: "border-quantum-cyan/20 text-quantum-cyan" }, { href: L.tg, l: "📱 TG", c: "border-quantum-purple/20 text-quantum-purple" }, { href: L.site, l: "🌐 CloseFast", c: "border-quantum-green/20 text-quantum-green" }, { href: L.vly, l: "💎 $VLY", c: "border-quantum-gold/20 text-quantum-gold" }].map((l) => (
            <a key={l.l} href={l.href} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 rounded-lg bg-white/[0.02] border text-[10px] font-bold no-underline hover:bg-white/[0.05] ${l.c}`}>{l.l}</a>
          ))}
        </div>
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          {[{ n: "Token", a: C.QTM }, { n: "NFT", a: C.NFT }, { n: "Game", a: C.GAME }].map((c) => (
            <a key={c.n} href={L.scan + c.a} target="_blank" rel="noopener noreferrer" className="text-[8px] text-gray-600 no-underline hover:text-gray-400">{c.n}: {sh(c.a)}</a>
          ))}
        </div>
        <p className="text-center text-[8px] text-gray-700">QUANTUM • Monad {blockNum && <span className="text-quantum-green font-mono text-[7px]">#{blockNum}</span>} • <span className="cursor-pointer hover:text-gray-500" onClick={() => setTab("privacy")}>Privacy</span> • 2026</p>
      </footer>
    </div>
  );
}
