import 'vitest';
import 'jest-axe';

// Этот файл нужен для того, чтобы TypeScript и Vitest
// "узнали" о кастомных матчерах из jest-axe, таких как toHaveNoViolations.
// Мы просто импортируем типы, а jest-axe и vitest сделают остальное. 