# FORMAT IZLAZNIH PODATAKA

**KRITIČNO**: Tvoj odgovor MORA biti isključivo validan JSON objekt. NE dodavaj tekst prije ili poslije JSON-a. NE koristi markdown code blokove.

## JSON SHEMA

```json
{
  "extraction": {
    "tasks": [
      {
        "task_number": 1,
        "task_text": "Tekst zadatka (printani dio)",
        "student_answer": "Studentov odgovor (rukom pisani dio)"
      }
    ],
    "total_tasks_detected": 1,
    "unreadable_sections": ["Opis nečitljivih dijelova ako postoje"],
    "extraction_confidence": "high"
  },
  "task_grades": [
    {
      "task_number": 1,
      "task_text": "Tekst zadatka",
      "student_answer": "Studentov odgovor",
      "analysis": "Detaljna analiza što je student napravio",
      "criterion_grades": [
        {
          "criterion_id": "id-iz-rubrike",
          "criterion_name": "Naziv kriterija",
          "awarded_points": 4,
          "max_points": 5,
          "justification": "Obrazloženje dodijeljenih bodova",
          "strengths": ["Što je dobro napravljeno"],
          "improvements": ["Što bi moglo biti bolje"]
        }
      ],
      "total_points": 4,
      "max_points": 5,
      "percentage": 80,
      "feedback_summary": "Kratki sažetak povratne informacije"
    }
  ],
  "total_points": 4,
  "max_total_points": 5,
  "overall_percentage": 80,
  "overall_feedback": "Završni komentar o cijelom ispitu"
}
```

## OPIS POLJA

### Extraction (Ekstrakcija)

| Polje | Tip | Opis |
|-------|-----|------|
| `extraction.tasks` | array | Niz izvučenih zadataka iz slike |
| `extraction.tasks[].task_number` | integer | Redni broj zadatka |
| `extraction.tasks[].task_text` | string | Printani tekst zadatka |
| `extraction.tasks[].student_answer` | string | Rukom pisani odgovor studenta |
| `extraction.total_tasks_detected` | integer | Ukupan broj detektiranih zadataka |
| `extraction.unreadable_sections` | array | Lista nečitljivih dijelova |
| `extraction.extraction_confidence` | string | "high", "medium" ili "low" |

### Task Grades (Ocjene po zadacima)

| Polje | Tip | Opis |
|-------|-----|------|
| `task_grades` | array | Niz ocjena po zadacima |
| `task_grades[].task_number` | integer | Broj zadatka |
| `task_grades[].task_text` | string | Tekst zadatka |
| `task_grades[].student_answer` | string | Studentov odgovor |
| `task_grades[].analysis` | string | Detaljna analiza studentovog rješenja |
| `task_grades[].criterion_grades` | array | Ocjene po kriterijima |
| `task_grades[].total_points` | number | Ukupni bodovi za zadatak |
| `task_grades[].max_points` | number | Maksimalni bodovi za zadatak |
| `task_grades[].percentage` | number | Postotak uspješnosti (0-100) |
| `task_grades[].feedback_summary` | string | Sažetak povratne informacije |

### Criterion Grades (Ocjene po kriterijima)

| Polje | Tip | Opis |
|-------|-----|------|
| `criterion_grades[].criterion_id` | string | ID kriterija iz rubrike |
| `criterion_grades[].criterion_name` | string | Naziv kriterija |
| `criterion_grades[].awarded_points` | number | Dodijeljeni bodovi |
| `criterion_grades[].max_points` | number | Maksimalni bodovi |
| `criterion_grades[].justification` | string | Obrazloženje bodovanja |
| `criterion_grades[].strengths` | array | Lista pozitivnih stvari |
| `criterion_grades[].improvements` | array | Lista stvari za poboljšanje |

### Overall (Ukupno)

| Polje | Tip | Opis |
|-------|-----|------|
| `total_points` | number | Ukupno dodijeljeni bodovi |
| `max_total_points` | number | Maksimalni mogući bodovi |
| `overall_percentage` | number | Postotak uspješnosti (0-100) |
| `overall_feedback` | string | Završni komentar |

## PRAVILA FORMATIRANJA

- Odgovor MORA biti parsabilan JSON
- NE dodavaj tekst prije ili poslije JSON-a
- NE koristi markdown code blokove
- Sva polja su OBAVEZNA
- `criterion_id` MORA odgovarati ID-u iz rubrike
- `strengths` i `improvements` mogu biti prazni nizovi `[]`
- Postoci moraju biti cijeli brojevi (0-100)
- Za prazne odgovore koristi prazan string `""`

