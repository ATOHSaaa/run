/** GitHub Actions 等の Linux CI ではサンドボックスと共有メモリ周りの追加引数が必要 */
export const puppeteerLaunchOptions = {
  headless: true,
  ...(process.env.CI
    ? {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      }
    : {}),
};
