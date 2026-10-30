import { chromium } from "playwright-core";
import fs from "node:fs/promises";
const base = process.env.QA_URL || "http://127.0.0.1:5173";
const root = new URL("../qa/", import.meta.url);
const only = process.env.QA_ONLY?.split(",");
await fs.mkdir(new URL("screenshots/", root), { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const report = {
  viewports: [],
  errors: [],
  failures: [],
  checkedAt: new Date().toISOString(),
};
try {
  for (const [name, width, height] of [
    ["desktop", 1600, 900],
    ["mobile", 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: name === "mobile",
      hasTouch: name === "mobile",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      report.errors.push(`${name}: ${error.message}`),
    );
    page.on("response", (r) => {
      if (r.status() >= 400)
        report.errors.push(`${name}: ${r.status()} ${r.url()}`);
    });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.screenshot({
      path: new URL(`screenshots/${name}-preloader.png`, root).pathname,
    });
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.dataset.ready === "true",
      { timeout: 120000 },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2200);
    await page.waitForFunction(() => window.__portfolio.loaded() === 239, {
      timeout: 120000,
    });
    const geometry = await page.evaluate(() => window.__portfolio.geometry());
    const commitsBefore = await page.evaluate(() => window.__reactCommits);
    const shots = ["preloader"];
    async function capture(label, y) {
      await page.evaluate((y) => window.__portfolio.seek(y), y);
      await page.waitForTimeout(220);
      await page.screenshot({
        path: new URL(`screenshots/${name}-${label}.png`, root).pathname,
      });
      shots.push(label);
      const issue = await page.evaluate(() => {
        const vw = innerWidth;
        return {
          overflow: document.documentElement.scrollWidth > vw + 1,
          navHidden:
            innerWidth < 820
              ? getComputedStyle(document.querySelector(".nav")).display ===
                "none"
              : false,
        };
      });
      if (issue.overflow)
        report.failures.push(`${name}-${label}: horizontal overflow`);
    }
    await capture("intro", 0);
    for (const scene of geometry.filter((s) => !only || only.includes(s.id)))
      for (const p of [0.15, 0.5, 0.85])
        await capture(
          `${scene.id}-${Math.round(p * 100)}`,
          scene.top + (scene.h - height) * p,
        );
    for (const scene of geometry
      .slice(1)
      .filter(
        (s, i) => !only || only.includes(s.id) || only.includes(geometry[i].id),
      ))
      await capture(`blade-${scene.id}`, scene.top - 0.47 * height);
    const contact = geometry.at(-1);
    // Inverse sine(0.6), to check the exact HUD threshold on either side.
    for (const t of !only || only.includes("contact") ? [0.59, 0.61] : []) {
      const u = Math.acos(1 - 2 * t) / Math.PI;
      await capture(
        `contact-theme-${t}`,
        contact.top - 0.78 * height + 0.62 * height * u,
      );
      const onRed = await page
        .locator(".hud")
        .evaluate((el) => el.classList.contains("on-red"));
      if (onRed !== t > 0.6)
        report.failures.push(`${name}: wrong HUD theme at ${t}`);
    }
    const awards = geometry.find((s) => s.id === "awards");
    for (const p of !only || only.includes("awards") ? [0, 1] : [])
      await capture(`cylinder-${p}`, awards.top + (awards.h - height) * p);
    await page.evaluate(() => window.__portfolio.seek(0));
    await page.waitForTimeout(200);
    const links = await page
      .locator("a")
      .evaluateAll((all) =>
        all.map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
        })),
      );
    if (links.some((l) => !l.href || l.href === "undefined"))
      report.failures.push(`${name}: invalid anchor`);
    const pdf = await context.request.get(`${base}/resume.pdf`);
    if (
      !pdf.ok() ||
      !(await pdf.body()).subarray(0, 4).equals(Buffer.from("%PDF"))
    )
      report.failures.push(`${name}: résumé download failed`);
    await page.getByRole("link", { name: "See my work" }).click();
    await page.waitForTimeout(2500);
    const navY = await page.evaluate(() => window.__portfolio.snapshot().y);
    if (Math.abs(navY - geometry.find((s) => s.id === "work").top) > 8)
      report.failures.push(`${name}: Work navigation failed`);
    await page.setViewportSize({ width: width + 20, height: height + 20 });
    await page.waitForTimeout(300);
    if (
      (await page.evaluate(() => window.__portfolio.snapshot().vw)) !==
      width + 20
    )
      report.failures.push(`${name}: resize failed`);
    const commitsAfter = await page.evaluate(() => window.__reactCommits);
    if (commitsBefore !== commitsAfter)
      report.failures.push(`${name}: React rendered during scrolling`);
    report.viewports.push({
      name,
      width,
      height,
      screenshots: shots.length,
      reactCommitsDuringScroll: commitsAfter - commitsBefore,
      loaded: await page.evaluate(() => window.__portfolio.loaded()),
      links: links.length,
    });
    await context.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    new URL(only ? `report-${only.join("-")}.json` : "report.json", root),
    JSON.stringify(report, null, 2),
  );
}
console.log(JSON.stringify(report, null, 2));
if (report.errors.length || report.failures.length) process.exitCode = 1;
