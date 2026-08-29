import { test, expect } from '@playwright/test';

test.describe('Admin dashboard (US-6)', () => {
  test('Admin sees bookings list', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByText('Загрузка...')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Встречи' })).toBeVisible();

    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByPlaceholder('Фильтр по типу события')).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Тип события' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Гость' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Начало' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Конец' })).toBeVisible();
  });

  test('Admin filters bookings by scope', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Загрузка...')).toBeHidden();

    await page.locator('select').selectOption('all');
    await page.waitForTimeout(1000);

    await page.locator('select').selectOption('upcoming');
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin event types (US-5)', () => {
  test('Admin creates a new event type', async ({ page }) => {
    await page.goto('/admin/event-types');

    await expect(page.getByText('Загрузка...')).toBeHidden();
    await expect(page.getByText('Типы событий')).toBeVisible();

    await page.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Новый тип события')).toBeVisible();

    const uniqueId = `e2e-test-${Date.now()}`;
    await page.getByLabel('ID').fill(uniqueId);
    await page.getByLabel('Название').fill('E2E Тест EventType');
    await page.getByLabel('Описание').fill('Создан автоматическим E2E тестом');
    await page.getByLabel('Длительность (мин)').fill('45');

    await page.getByRole('button', { name: 'Создать' }).click();

    await expect(page.getByText('Новый тип события')).toBeHidden({ timeout: 10000 });

    await expect(page.getByText(uniqueId)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'E2E Тест EventType' }).first()).toBeVisible();
  });

  test('Admin sees event types table', async ({ page }) => {
    await page.goto('/admin/event-types');

    await expect(page.getByText('Загрузка...')).toBeHidden();
    await expect(page.getByText('Типы событий')).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Название' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Длительность' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Создано' })).toBeVisible();

    await expect(page.getByText('intro-30')).toBeVisible();
    await expect(page.getByText('deep-dive-60')).toBeVisible();
  });
});
