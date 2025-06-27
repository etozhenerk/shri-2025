# Руководство по тестированию UI-компонентов (Storybook)

## Основные принципы

Тестирование UI-компонентов из директории `src/ui` строится на базе **Storybook** и его аддонов для визуального регрессионного тестирования. Наша цель — не проверять логику (она тестируется на интеграционном уровне), а гарантировать, что компонент корректно отображается во всех своих состояниях.

## Правила написания тестов (Stories)

1.  **Расположение файлов:**
    *   Для каждого компонента (например, `src/ui/Button/Button.tsx`) создается директория `__stories__`.
    *   Внутри нее создается файл с историями: `Button.stories.tsx`.

2.  **Структура истории:**
    *   Каждый файл `*.stories.tsx` содержит мета-информацию о компоненте (заголовок, компонент) и одну или несколько "историй".
    *   Каждая история (`export const StoryName = ...`) представляет собой одно конкретное состояние компонента.

3.  **Именование историй:**
    *   Имена должны четко описывать состояние компонента.
    *   **Default:** Базовое состояние компонента с минимальными пропсами.
    *   **States:** Отдельные истории для каждого важного состояния (`Disabled`, `Loading`, `Error`, `WithIcon` и т.д.).

4.  **Фокус на визуальных тестах:**
    *   Основной метод тестирования — **снимок (snapshot)**. Мы не пишем классические `expect` утверждения на пропсы или классы.
    *   Storybook с помощью аддона для тестирования автоматически сравнивает новый снимок с эталонным. Любое визуальное расхождение приводит к падению теста.

## Пример

```tsx
// src/ui/Button/__stories__/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  // Автоматически сгенерированная документация
  tags: ['autodocs'],
  argTypes: {
    // Описание пропсов для интерактивной панели
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// История для базового состояния
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// История для вторичного состояния
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

// История для отключенного состояния
export const Disabled: Story = {
  args: {
    ...Primary.args, // Наследуем аргументы из базовой истории
    disabled: true,
    children: 'Disabled Button',
  },
};
``` 