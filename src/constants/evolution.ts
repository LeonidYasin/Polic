export interface AppVersion {
  version: string;
  cycle: number;
  date: string;
  changes: string[];
  status: 'stable' | 'beta' | 'legacy';
}

export const EVOLUTION_LOG: AppVersion[] = [
  {
    version: "1.0.0",
    cycle: 1,
    date: "2026-04-10",
    changes: ["Инициализация Контура Развития", "Базовая верстка Конституции"],
    status: 'legacy'
  },
  {
    version: "1.1.0",
    cycle: 2,
    date: "2026-04-12",
    changes: ["Интеграция Firebase", "Система авторизации Google", "Первая итерация Ариона"],
    status: 'legacy'
  },
  {
    version: "1.2.0",
    cycle: 3,
    date: "2026-04-14",
    changes: ["Внедрение Протокола 7%", "Раздел Прозрачной Казны (Kazan)", "Геометрия Доверия (анимированный логотип)"],
    status: 'legacy'
  },
  {
    version: "1.3.0",
    cycle: 4,
    date: "2026-04-16",
    changes: ["Админ-панель (Контур Управления)", "Система уведомлений для Магистров", "Направленный поток задач от Ариона"],
    status: 'stable'
  },
  {
    version: "1.4.0",
    cycle: 5,
    date: "2026-04-17",
    changes: [
      "Хроника Эволюции: внедрен реестр генетической памяти",
      "Глубокая интеграция Этического Кодекса в логику Ариона",
      "Визуальный код 2.0: Геометрия Доверия и Kazan",
      "Направленный поток задач: работа находит человека"
    ],
    status: 'stable'
  },
  {
    version: "1.5.0 (Current)",
    cycle: 6,
    date: "2026-04-18",
    changes: [
      "Зал Агоры: запуск протокола децентрализованного голосования",
      "Математика Меритократии: внедрение формул R и W",
      "Виральное расширение: Ключи приглашения (Invitation Keys)",
      "Событийный поток (Event-driven Reality)"
    ],
    status: 'stable'
  }
];

export const CURRENT_VERSION = EVOLUTION_LOG[EVOLUTION_LOG.length - 1];
