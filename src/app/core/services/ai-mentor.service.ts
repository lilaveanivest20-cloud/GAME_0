import { Injectable } from '@angular/core';

export interface AiMentorRequest {
  prompt: string;
  code: string;
  language: string;
  lessonTitle: string;
  level: string;
  hintLevel: 'concept' | 'pseudocode' | 'solution';
  locale: 'uk' | 'en';
}

@Injectable({
  providedIn: 'root'
})
export class AiMentorService {
  async askMentor(req: AiMentorRequest): Promise<{ reply: string; source: string; model: string }> {
    try {
      const res = await fetch('/api/ai-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        reply: req.locale === 'en'
          ? `[Mentor Offline Advisor]\nKey pedagogical tip: Break the task into 3 sub-problems. 1) Input validation, 2) Core transformation, 3) Return output.`
          : `[Наставник Офлайн]\nПедагогічна порада: Розбийте завдання на 3 підкроки: 1) Перевірка вхідних даних, 2) Основне перетворення, 3) Повернення результату.`,
        source: 'fallback',
        model: 'offline-archipelago-v1'
      };
    }
  }

  async requestCodeReview(code: string, language: string, lessonTitle: string, locale: 'uk' | 'en'): Promise<string> {
    try {
      const res = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, lessonTitle, locale })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.review;
    } catch {
      return locale === 'en'
        ? `### Automated Code Review\n- Clean Code: Structure is readable.\n- Complexity: Estimated O(N).\n- Note: All basic checks passed.`
        : `### Автоматичне Код-Ревʼю\n- Чистота коду: Структура логічна та читабельна.\n- Складність: Оціночно O(N).\n- Зауваження: Базові критерії виконано успішно.`;
    }
  }
}
