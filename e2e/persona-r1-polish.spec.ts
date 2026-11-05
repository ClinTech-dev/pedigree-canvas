import { test, expect, type Page } from '@playwright/test';
import { seedFreshStart, readPersistedDoc, openRadialOnSeed } from './support/harness';

/**
 * Persona round 1 polish (#178): the small traps testers hit, driven through
 * the real app. The canvas-maths parts (fit includes the legend and respects
 * the islands; new parents are panned clear of the toolbar) are unit-tested in
 * `src/utils/viewportFit.test.ts`.
 */

/** Dismiss the auto-opened gender picker on the fresh seed. */
async function chooseSeedSex(page: Page): Promise<void> {
  const genderDialog = page.getByRole('dialog', { name: 'Choose gender identity' });
  await expect(genderDialog).toBeVisible();
  await genderDialog.getByRole('button', { name: 'Woman', exact: true }).click();
  await expect(genderDialog).toBeHidden();
}

async function openMenuItem(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Open document menu' }).click();
  await page.getByRole('menuitem', { name, exact: true }).click();
}

test.describe('persona round 1 polish', () => {
  test.beforeEach(async ({ page }) => {
    await seedFreshStart(page);
    await page.goto('/app/');
    await chooseSeedSex(page);
  });

  test('"New" warns the pedigree is only stored here and offers export first', async ({ page }) => {
    // Give the document real content: add a partner.
    await openRadialOnSeed(page);
    await page.getByRole('button', { name: 'Partner', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => Object.keys((await readPersistedDoc(page))?.individuals ?? {}).length)
      .toBe(2);

    await openMenuItem(page, 'New');
    const dialog = page.getByRole('dialog', { name: 'Start a new pedigree?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("isn't saved anywhere else");

    // Export first → the export modal opens and nothing is replaced.
    await dialog.getByRole('button', { name: /export first/i }).click();
    await expect(page.getByRole('heading', { name: 'Export Pedigree' })).toBeVisible();
    expect(Object.keys((await readPersistedDoc(page))?.individuals ?? {})).toHaveLength(2);
  });

  test('the Import dialog does not show a stale export status', async ({ page }) => {
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Export Pedigree' })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /SVG Image/ }).click();
    await download;
    await expect(page.getByText('SVG exported.')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Export Pedigree' })).toBeHidden();

    await openMenuItem(page, 'Import');
    await expect(page.getByRole('heading', { name: 'Import Pedigree' })).toBeVisible();
    await expect(page.getByText('SVG exported.')).toBeHidden();
  });

  test('help shows Ctrl shortcuts on a non-Mac platform', async ({ page }) => {
    // The Playwright Chromium runs on Linux here (navigator.platform "Linux …").
    await page.getByRole('button', { name: 'Help & About' }).click();
    const help = page.getByRole('dialog');
    await expect(help).toContainText('Ctrl+K');
    await expect(help).not.toContainText('⌘K');
  });
});
