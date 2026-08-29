import { test, expect } from '@playwright/test';

test.describe('Booking flow (US-1)', () => {
  test('Guest books a meeting end-to-end', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Выберите вид встречи')).toBeVisible();
    await expect(page.getByText('Загрузка...')).toBeHidden();

    await page.getByText('Встреча-знакомство').click();

    await expect(page.getByText('Загрузка...')).toBeHidden();
    await expect(page.getByText('Встреча-знакомство')).toBeVisible();
    await expect(page.getByText('Короткая встреча для знакомства')).toBeVisible();
    await expect(page.getByText('30 мин')).toBeVisible();

    const enabledDay = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).first();
    await expect(enabledDay).toBeEnabled({ timeout: 10000 });
    await enabledDay.click();

    const slotButtons = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}:\d{2}$/ });
    await expect(slotButtons.first()).toBeVisible({ timeout: 5000 });
    const firstSlot = slotButtons.first();
    await firstSlot.click();

    await expect(page.getByLabel('Имя')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Комментарий')).toBeVisible();

    await page.getByLabel('Имя').fill('E2E Тест Гость');
    await page.getByLabel('Email').fill('e2e@test.com');
    await page.getByLabel('Комментарий').fill('Автоматический E2E тест');

    await page.getByRole('button', { name: 'Забронировать' }).click();

    await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Встреча-знакомство')).toBeVisible();
    await expect(page.getByText('E2E Тест Гость')).toBeVisible();
    await expect(page.getByText('e2e@test.com')).toBeVisible();

    await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
  });
});

test.describe('Booking flow - navigation (US-1)', () => {
  test('Returns to home from confirmation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Загрузка...')).toBeHidden();

    await page.getByText('Встреча-знакомство').click();
    await expect(page.getByText('Загрузка...')).toBeHidden();

    const enabledDay = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).first();
    await expect(enabledDay).toBeEnabled({ timeout: 10000 });
    await enabledDay.click();

    const slotButtons = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}:\d{2}$/ });
    await expect(slotButtons.first()).toBeVisible({ timeout: 5000 });
    await slotButtons.first().click();

    await page.getByLabel('Имя').fill('Nav Test');
    await page.getByLabel('Email').fill('nav@test.com');
    await page.getByRole('button', { name: 'Забронировать' }).click();

    await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: 'На главную' }).click();
    await expect(page.getByText('Выберите вид встречи')).toBeVisible();
  });
});
