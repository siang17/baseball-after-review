import path from 'node:path';
import type { NextConfig } from 'next';

/** 站內既有的無語言前綴網址，一律導到預設語言（zh）。 */
const LEGACY_PATHS = ['/', '/rosters', '/matchup', '/replay', '/case-study', '/scatter'];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 這個 repo 會用 git worktree 開分支，工作區裡會同時存在多份 package-lock.json，
  // Next 會誤把上層目錄當成 workspace root（build traces 會抓錯範圍）。明確指定為本專案根目錄。
  outputFileTracingRoot: path.join(__dirname),

  // 語言改由網址第一個區段決定（/zh/... 、/en/...）之後，舊網址用 307 導過去。
  // 用暫時而非永久轉址，避免瀏覽器把對應關係硬快取住，之後想調整預設語言會很難收回。
  async redirects() {
    return LEGACY_PATHS.map((source) => ({
      source,
      destination: source === '/' ? '/zh' : `/zh${source}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
