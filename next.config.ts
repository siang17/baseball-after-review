import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 這個 repo 會用 git worktree 開分支，工作區裡會同時存在多份 package-lock.json，
  // Next 會誤把上層目錄當成 workspace root（build traces 會抓錯範圍）。明確指定為本專案根目錄。
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
