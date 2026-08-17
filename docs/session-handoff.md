# BAR — Session Handoff

最後更新：2026-08-17

## 這次 session 做了什麼

### 1. 專案骨架與核心頁面
- Next.js 15（App Router）+ TypeScript + Tailwind v4 專案，路徑 `C:\Users\Siang Lee\baseball-after-review`。
- 華航白色登機證視覺系統：設計代幣（`globals.css`）、`BoardingPassCard`、`FlightStatusBoard`、`BaggageTag`、決定性條碼（`Barcode`/`QrGlyph`）。
- 六個頁面：首頁、名單（`/rosters`）、跨年份對決（`/matchup`）、比賽復盤（`/replay`）、示範專題（`/case-study`）、散佈圖（`/scatter`，目前只有指標字典骨架）。
- 全站型別定義集中在 `src/types/baseball.ts`；中英雙語靠 `Bilingual { zh, en }` 結構統一處理。

### 2. Featured Case Study（`/case-study`）
- 2026 WBC 日本 vs. 委內瑞拉六段式復盤：球員遺珠評估、日本隊守備論證（UZR 分項拆解 + NPB→MLB 折算）、關鍵 Play 與調度解析、Pitch Timer×PitchCom 節奏影響、65 球牛棚銜接檢討、總教練模式互動入口。
- 新增元件：`SnubComparison`、`DefenseArgumentPanel`、`TempoImpactPanel`、`BullpenBridgePanel`。
- 所有球員均以「示範 XX」代稱、數值為虛構，新聞出處刻意留空 —— 沒有可信的 2026 WBC 真實資料來源。

### 3. 對決模擬引擎（`src/lib/simulation/`）
- `random.ts`：決定性 PRNG（mulberry32），同設定必得同結果。
- `ratings.ts`：球員數據 → 打席機率向量（log5 合成上壘率），期望 wOBA，球隊攻守評比。
- `gameSim.ts`：單場模擬——壘包推進、TTOP 衰退、疲勞（球速衰退代理）、用球數強制退場、牛棚調度、延長賽突破僵局制、提前結束比賽規則。
- `matchupSimulator.ts`：N 場彙總成 `MatchupSimulationResult`（勝率、平均比分、代表性勝率曲線、攻守評比、關鍵對位、診斷資訊）。
- `/api/simulate` 已接上 `/matchup` 頁的 `SimulationResult` 元件。

### 4. 資料層（Prisma，尚未連接真實資料庫）
- `prisma/schema.prisma`：PostgreSQL schema，涵蓋賽事、隊伍、球員、外部身份、名單、賽季數據、比賽、打席、逐球、資料來源、匯入批次。
- `/api/admin/import/roster`：Zod 驗證的名單匯入端點。
- `.env.example` 提供 `DATABASE_URL` 與匯入 token 佔位格式。

### 5. 這次 session 修的 bug
| 問題 | 根因 | 修法 |
|---|---|---|
| `tsc --noEmit` 失敗 | Prisma `PlateAppearance.pitcher` 與 `Pitch.pitcher` 共用同一個關聯名，`prisma generate` 驗證失敗 | 拆成 `paBatter`/`paPitcher`/`pitchPitcher` 三個具名關聯 |
| Zod → Prisma JSON 型別不合 | `Record<string, unknown>` 不等於 `InputJsonValue` | 明確轉型為 `Prisma.InputJsonObject` |
| **用球數上限對模擬結果幾乎無影響**（產品核心論點被抵銷） | 每隊只有 4 名投手，名單用完後不再換投，30 球上限等於零代價 | 牛棚擴到 8 人梯隊、深度遞減；九局直接跳終結者而非順推 |
| `TEAM_BASELINES` 整體高於聯盟平均 1.0（互相矛盾） | 9 隊基準值平均 ≈1.05 | 依維度平均值重新置中到 1.0（`NORMALISED_BASELINES`） |
| `shadow-ticket` 樣式未定義 | Tailwind v4 靜默丟棄未知 utility | 在 `globals.css` `@theme` 補上 `--shadow-ticket` |
| `keyMatchups` 只回傳 placeholder（`expectedWoba: null`），UI 未渲染 | 沒接上 `plateAppearanceProbs`/`expectedWoba` | 新增 `keyMatchupsFor()`，UI 加渲染區塊 |
| CSS 全部 404，頁面無樣式 | 跑 `npm run build`（production）覆蓋了正在跑的 dev server 的 `.next` 目錄，asset manifest 對不上 | 清除 `.next`、重啟 dev server |

### 6. 驗證結果
- `npx tsc --noEmit` 通過。
- `npm run build` 通過，6 個路由全部產出。
- `/api/simulate` 實測：10,000 場模擬 230ms，決定性（同設定重跑結果一致），用球數上限敏感度測試方向正確（65→50→30 球，得分與換投次數單調上升）。
- 瀏覽器驗證首頁、`/matchup` 完整跑過一次選隊→確認→模擬流程，CSS/字體正確套用。

### 7. 版本控制
- `git init`，2 個 commit：
  - `881da7c` Initial commit（55 檔案）
  - `79f2d7e` Remove stale README.file
- **尚未設定 remote，尚未 push。**
- 已用 winget 安裝 GitHub CLI（`gh version 2.97.0`），但 `gh auth login` 需要使用者手動在瀏覽器完成互動授權，這次 session 沒有跑完。

---

## To-Do List

### 高優先（會影響下次能不能直接動）
- [ ] **完成 `gh auth login`**：開新終端機執行 `gh auth login` → 選 GitHub.com → HTTPS → 瀏覽器登入。完成後才能用 `gh repo create` 建立遠端並 push。
- [ ] **push 到 GitHub**：`gh auth login` 完成後，建立 repo 並 `git push -u origin main`。
- [ ] **確認 dev server 啟動方式**：這次 session 背景啟動的 dev server 在 session 結束時被判定為「failed（exit code 4）」，需要重新用 `npm run dev` 啟動並確認穩定性；記得**不要**在 dev server 跑著的時候同時執行 `npm run build`（會覆蓋 `.next` 造成 CSS 404，這次已踩過一次）。

### 中優先（產品完整度）
- [ ] **接上真實名單資料到模擬引擎**：`ratings.ts` 的 `buildBatterProfile()` / `buildPitcherProfile()` / `gradeRoster()` 已寫好但沒被 `matchupSimulator.ts` 使用；目前引擎吃的是 `TEAM_BASELINES` 手寫基準值，不是球員數據。
- [ ] **散佈圖分析器**（`/scatter`）：目前只有指標字典展示，`ScatterPlotConfig` 型別已定義，缺 `ScatterPlotStudio.tsx` 實際圖表元件（建議用 Recharts）。
- [ ] **AI 戰術助手**（`/api/ai-manager`）：規格已在 `ManagerModeConfig`/`DecisionPoint` 型別中定義，尚未實作；目前 `aiReport` 是規則式模板文字，不是真正的 LLM 產出。
- [ ] **連接真實 PostgreSQL 資料庫**：目前 Prisma schema 與匯入 API 都只用 placeholder `DATABASE_URL` 測過 `prisma generate`，沒有實際跑過 migration 或寫入。

### 低優先 / 資料品質
- [ ] **`/case-study` 專題資料是全虛構的示範值**（球員代稱「示範 XX」、新聞出處留空）。要公開發布前必須替換為 WBSC / Statcast / FanGraphs / NPB 官方資料，並在 `LeagueAdjustment` 記錄真實校正係數與出處。
- [ ] **`sabermetrics.ts` 的已知簡化**：Win Expectancy 是常態近似非官方查表值；Leverage Index 分母 `0.032` 是經驗值；RE24 用 2010 年代 MLB 矩陣乘國際賽環境係數 `0.92`。這些足夠支撐介面相對比較，但不能當公開分析數字引用。
- [ ] **`RELIEVER_DEPTH` 深度懲罰係數是可調參數，不是實證結果**：目前用球數上限的效應幅度（無限制到 30 球約 +0.3 分）取決於這個手調係數，未來若要做更嚴謹的分析需要重新校準。

---

## 環境備忘
- Node.js v24.19.0、npm 11.17.0 已安裝在 `C:\Program Files\nodejs`（PATH 有時抓不到，新 session 若遇到 `node`/`npm not found` 記得檢查 PATH 或用完整路徑）。
- GitHub CLI 已安裝在 `C:\Program Files\GitHub CLI\gh.exe`，同樣可能有 PATH 延遲問題，新開終端機通常就正常。
- 專案沒有真實 PostgreSQL 實例；本機測試 Prisma 時用的是 placeholder `DATABASE_URL`（`postgresql://placeholder:placeholder@localhost:5432/bar`），僅夠讓 `prisma generate` 通過型別產生，無法實際連線。
