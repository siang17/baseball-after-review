# Baseball After Review (BAR) — 棒球復盤室

> **Boarding for Game Analysis** — 重新審視每一顆球的調度潛能

華航白色登機風 (China Airlines White Boarding Pass Style) 的棒球賽事復盤與進階數據分析網站。

---

## 快速開始

```bash
npm install
```

```bash
npm run dev
```

需要 Node.js 18.18+（建議 20 LTS 以上）。

---

## 技術棧

| 層 | 選用 |
| --- | --- |
| Framework | Next.js 15（App Router）/ React 19 / TypeScript |
| Styling | Tailwind CSS v4（`@theme` 設計代幣）+ Radix UI primitives |
| Icons | lucide-react |
| Charts | Recharts |
| State | Zustand |
| AI | 預留 `/api/simulate`、`/api/ai-manager`（OpenAI / Claude） |

Tailwind v4 不使用 `tailwind.config.js`；所有設計代幣定義在 `src/app/globals.css` 的 `@theme` 區塊。

### 語言與路由

語言的唯一來源是網址的第一個區段：`/zh/...` 與 `/en/...`。

- Server Component 直接從 `params.lang` 取語言；深層的 Client Component 用 `useLang()`
  （由 `LangProvider` 提供，值同樣來自網址，不持有狀態、不寫 localStorage）。
- `layout.tsx` 的 `generateStaticParams()` 讓兩種語言都在 build 時靜態預先產生，
  因此語言在伺服器輸出的 HTML 裡就是正確的，不會有「先中文再閃成英文」的情況。
- 導覽列的中英切換就是導到同一條路徑的另一語言版本（`/zh/replay` ↔ `/en/replay`）。
- 舊的無前綴網址（`/replay` 等）由 `next.config.ts` 的 `redirects()` 以 307 導到 `/zh/...`。
- 切換語言是一次真正的頁面導覽，元件會重新掛載，所以各頁的流程狀態都放在 `store/`
  的 zustand store（module singleton，能跨導覽存活）：`useReplayStore` 存復盤流程、
  `useRostersStore` 存名單瀏覽位置、`useMatchupStore` 存選隊流程。切換語言會停在原地，
  網址上的 query string（例如 `?game=...&autoDecision=1`）也會被語言切換連結原樣帶過去。
  `SiteHeader` 裡負責這個的 `LangToggleLink` 用了 `useSearchParams()`，因此包了一層
  `Suspense`——避免讓整個（靜態預先產生的）layout 被迫改成動態渲染，只有這一顆連結
  在客戶端才知道目前的 query。


---

## 目錄結構

```
baseball-after-review/
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json                 # @/* → src/*
└── src/
    ├── app/
    │   ├── globals.css           # 設計代幣、登機證齒孔、翻牌／LED 動畫
    │   └── [lang]/               # 語言區段：/zh/... 與 /en/...（兩種都靜態預先產生）
    │       ├── layout.tsx        # 根 layout：<html lang> + SiteHeader + LangProvider
    │       ├── page.tsx          # 登機大廳：Hero + 航班動態看板 + 示範專題
    │       ├── rosters/page.tsx  # 旅客名單（球員登機證）
    │       ├── matchup/page.tsx  # 夢幻對決訂位流程
    │       ├── replay/page.tsx   # 比賽復盤（HUD + 勝率曲線 + 決策艙）
    │       ├── case-study/page.tsx # 核心示範專題：2026 WBC 日本 vs. 委內瑞拉
    │       └── scatter/page.tsx  # 散佈圖分析器
    │
    ├── components/
    │   ├── layout/
    │   │   ├── SiteHeader.tsx        # 導覽列 + 中英切換（切換 = 導到另一語言的同一路徑）
    │   │   └── LangProvider.tsx      # 把 layout 讀到的語言傳給深層 Client Component
    │   ├── case-study/
    │   │   └── CaseStudyActions.tsx  # 專題頁唯一的互動區塊（client island）
    │   ├── boarding/
    │   │   └── BoardingPassCard.tsx  # 登機證卡片（含球員／遺珠／總教練包裝）
    │   ├── matchup/
    │   │   └── MatchupSelector.tsx   # 兩階段選隊（年代模式 → 隊伍 → 確認）
    │   ├── manager/
    │   │   └── ManagerDecisionModal.tsx  # 情境決策駕駛艙 + 三方對比
    │   ├── replay/
    │   │   └── TacticalControlHUD.tsx    # Pitch Timer / PitchCom / 用球數限制
    │   ├── rosters/
    │   │   ├── RostersBrowser.tsx        # 年代 → 隊伍 → 名單的瀏覽流程（client island）
    │   │   └── SnubComparison.tsx        # 遺珠 vs. 入選者逐項對照
    │   ├── analysis/
    │   │   ├── LazyCharts.tsx            # Recharts 圖表的 dynamic import 包裝
    │   │   ├── CrucialPlayAlert.tsx      # 黑匣子警報 + 關鍵轉折清單
    │   │   ├── WinProbabilityChart.tsx   # 勝率曲線 + 槓桿指數
    │   │   ├── DefenseArgumentPanel.tsx  # UZR 分項拆解 + NPB 校正
    │   │   ├── TempoImpactPanel.tsx      # Pitch Timer × PitchCom 節奏影響
    │   │   └── BullpenBridgePanel.tsx    # 65 球限制下的牛棚銜接檢討
    │   └── ui/
    │       ├── Barcode.tsx               # 決定性條碼 / QR 方塊
    │       ├── BaggageTag.tsx            # 行李吊牌指標卡
    │       └── FlightStatusBoard.tsx     # 航班動態看板（翻牌／LED）
    │
    ├── lib/
    │   ├── utils.ts              # cn()、決定性 hash / 條碼、格式化
    │   ├── i18n.ts               # Bilingual 工具、全站文案、語言/路徑輔助函式
    │   ├── constants.ts          # 賽事、球隊、艙等、用球數規則、指標定義
    │   └── sabermetrics.ts       # RE24 / Win Expectancy / LI / TTOP
    │
    ├── store/
    │   ├── useMatchupStore.ts    # 兩階段選隊流程狀態
    │   ├── useRostersStore.ts    # 名單頁瀏覽位置（年代 → 隊伍）
    │   └── useReplayStore.ts     # 復盤流程、游標、總教練模式、HUD 設定、警報
    │
    ├── types/
    │   └── baseball.ts           # 全站資料型別（單一事實來源）
    │
    └── data/
        ├── rosters/demoPlayers.ts
        ├── games/wbc2026-jpn-ven.ts
        └── case-studies/wbc2026-jpn-ven.ts   # 遺珠、守備論證、節奏、牛棚
```

### 模擬引擎

```
src/lib/simulation/
├── random.ts             # 決定性 PRNG（同設定必得同結果）
├── ratings.ts            # 球員 → 打席機率向量（log5 合成）、期望 wOBA、球隊評比
├── gameSim.ts            # 單場模擬：壘包推進、TTOP、疲勞、用球數上限、牛棚調度
└── matchupSimulator.ts   # N 場彙總 → MatchupSimulationResult
src/app/api/simulate/route.ts
```

### 尚待建立（規格已就緒，實作待補）

```
src/app/api/ai-manager/route.ts      # LI + RE24 → 機上廣播風格戰術建議
src/components/analysis/ScatterPlotStudio.tsx
```

---

## 設計系統

`src/app/globals.css` 的 `@theme`：

| 代幣 | 值 | 用途 |
| --- | --- | --- |
| `--color-paper` / `--color-paper-pure` | `#F8F9FA` / `#FFFFFF` | 主背景、卡片 |
| `--color-navy` / `--color-ink` | `#002244` / `#0B2545` | 品牌主色、文字 |
| `--color-plum` | `#D9381E` | 梅花紅：關鍵警報、CTA |
| `--color-alert` | `#FF6B35` | 警示橘：接近門檻、TTOP |
| `--color-board` | `#071B33` | 航班看板反白底 |

三個標誌性 UI 元素：

- **登機證卡片** — 撕票齒孔、Gate（分組）／Seat（打順-守位）／Class（艙等＝陣容層級）、條碼與 QR 票根。
- **航班動態看板** — 翻牌動畫 + LED 閃爍，用於賽程與復盤狀態。
- **行李吊牌** — 單項指標卡（用球數、UZR、球速衰退、強制休息天數）。

---

## 核心模組對照

| 模組 | 主要檔案 | 狀態 |
| --- | --- | --- |
| 球員名單與資料庫 | `types/baseball.ts`、`data/rosters/` | 型別完成，資料為示範值 |
| 進階數據與散佈圖 | `lib/constants.ts`（METRICS）、`app/[lang]/scatter` | 指標字典完成，圖表待實作 |
| 跨年份對決模擬器 | `components/matchup/`、`lib/simulation/` | 完成（選隊流程 + 蒙地卡羅引擎 + 結果頁） |
| 總教練互動決策 | `components/manager/ManagerDecisionModal.tsx` | 完成（三方對比） |
| 復盤引擎與戰術控制台 | `components/replay/TacticalControlHUD.tsx` | 完成（Timer / PitchCom / 用球數） |
| 關鍵轉折點與 WPA | `components/analysis/` | 完成 |
| 核心示範專題 | `app/[lang]/case-study`、`data/case-studies/` | 完成（六個章節，資料為示範值） |
| AI 戰術助手 | `app/api/ai-manager`（待建） | 未實作 |

### 核心示範專題章節

`/case-study` — 2026 WBC 日本 vs. 委內瑞拉，六段式復盤：

1. **球員遺珠評估** — 3 位遺珠與入選者的逐項數據差（`SnubComparison`）
2. **日本隊守備論證** — UZR 分項拆解（RngR / ErrR / ArmR / DPR）＋ NPB→MLB 折算
3. **最關鍵 Play 與調度** — 勝率曲線、最大 ΔWP 的一球、續投 vs. 換投對照
4. **節奏控制影響** — 被計時器逼快（剩餘 < 3 秒）與從容出手的投球品質分組對照
5. **65 球與牛棚銜接** — 兩隊接力段落、休息級距、替代方案模擬
6. **總教練模式體驗** — 一鍵帶狀態跳至七局下決策點／跨年代對決確認頁

---

## ⚠️ 資料狀態

`src/data/` 底下目前全為**示範資料 (placeholder)**：球員姓名、UZR、球速、勝率曲線等數值皆為虛構或未查證，僅供版面與計算邏輯驗證。

正式使用前請以官方／可信來源替換：

- WBSC Premier12、World Baseball Classic 官方 box score 與逐球資料
- MLB Statcast（球速、揮空率、離壘速度、OAA）
- FanGraphs（UZR、UZR/150、wRC+、WAR）
- NPB / KBO / CPBL 官方數據，並於 `LeagueAdjustment` 記錄換算係數與出處

### 計算方法的已知簡化

`src/lib/sabermetrics.ts`：

- **RE24** 使用 2010 年代 MLB base-out 期望得分矩陣，另乘上國際賽得分環境係數 `RUN_ENV_FACTOR = 0.92`。
- **Win Expectancy** 為常態近似（把剩餘得分視為 Poisson→Normal），**不是**官方查表值。要接真實 WE table 只需替換 `winExpectancy()`。
- **Leverage Index** 由一組代表性打席結果的加權 |ΔWP| 除以經驗平均值 `0.032` 求得。

`src/lib/simulation/`：

- **打席模型**是「中階」模型，不是逐球模型：以 log5（勝算比法）合成打者與投手的上壘率，再依打者的 ISO／揮空率把上壘率分配到保送與各類安打。要升級成逐球模型，只需替換 `plateAppearanceProbs()`，引擎其餘部分不用動。
- **隊伍強度來自 `TEAM_BASELINES` 手寫基準值，不是名單推導**。`ratings.ts` 已備妥 `buildBatterProfile()` / `buildPitcherProfile()` / `gradeRoster()` 作為接真實名單的入口，目前尚未接上。
- **牛棚只模擬 8 人**（先發 + 6 中繼 + 終結者），實際 WBC 名單帶 13–14 名投手。深度足以呈現「用球數上限把好投手燒完」的取捨，但名單見底後引擎只能續投現任投手。

### 引擎行為驗證（2026 JPN vs. VEN，各 5,000 場）

| 用球數上限 | 主隊勝率 | 平均得分（主/客） | 先發用球數 | 平均用投手數 |
| --- | --- | --- | --- | --- |
| 無限制 | 62.2% | 5.04 / 4.01 | 81.3 | 3.87 |
| 65 | 62.4% | 5.08 / 4.02 | 65.3 | 4.24 |
| 50 | 62.7% | 5.22 / 4.08 | 51.3 | 4.66 |
| 30 | 62.2% | 5.35 / 4.29 | 31.7 | 5.80 |

上限越緊 → 用投手越多 → 得分越高，方向正確。幅度（無限制到 30 球約 +0.3 分）取決於 `RELIEVER_DEPTH` 的深度懲罰係數，是可調參數而非實證結果。

這些近似足以驅動介面與相對比較，但不應直接引用為公開分析數字。
