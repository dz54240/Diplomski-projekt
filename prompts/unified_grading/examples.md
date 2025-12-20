# PRIMJERI IZLAZA

## Primjer 1: Ispit iz fizike s dva zadatka

```json
{
  "extraction": {
    "tasks": [
      {
        "task_number": 1,
        "task_text": "Izračunajte ubrzanje mase od 2 kg pod djelovanjem sile od 10 N.",
        "student_answer": "a = F/m = 10/2 = 5 m/s²"
      },
      {
        "task_number": 2,
        "task_text": "Dokažite formulu potpune vjerojatnosti.",
        "student_answer": "P(A) = Σ P(A|Bi)P(Bi) za potpuni sustav događaja {B1, B2, ...}"
      }
    ],
    "total_tasks_detected": 2,
    "unreadable_sections": [],
    "extraction_confidence": "high"
  },
  "task_grades": [
    {
      "task_number": 1,
      "task_text": "Izračunajte ubrzanje mase od 2 kg pod djelovanjem sile od 10 N.",
      "student_answer": "a = F/m = 10/2 = 5 m/s²",
      "analysis": "Student je ispravno primijenio drugi Newtonov zakon. Prepoznao je potrebnu formulu a=F/m, pravilno uvrstio vrijednosti i točno izračunao rezultat.",
      "criterion_grades": [
        {
          "criterion_id": "task-1",
          "criterion_name": "1. Zadatak",
          "awarded_points": 5,
          "max_points": 5,
          "justification": "Potpuno točan odgovor s ispravnom primjenom formule i izračunom.",
          "strengths": ["Ispravna primjena drugog Newtonovog zakona", "Točan izračun", "Navedena mjerna jedinica"],
          "improvements": []
        }
      ],
      "total_points": 5,
      "max_points": 5,
      "percentage": 100,
      "feedback_summary": "Odličan odgovor, potpuno točno riješeno."
    },
    {
      "task_number": 2,
      "task_text": "Dokažite formulu potpune vjerojatnosti.",
      "student_answer": "P(A) = Σ P(A|Bi)P(Bi) za potpuni sustav događaja {B1, B2, ...}",
      "analysis": "Student je naveo formulu, ali nije pružio kompletan dokaz. Nedostaje definicija potpunog sustava događaja i izvod formule iz osnovnih aksioma vjerojatnosti.",
      "criterion_grades": [
        {
          "criterion_id": "task-2",
          "criterion_name": "2. Zadatak",
          "awarded_points": 2,
          "max_points": 5,
          "justification": "Ispravna formula (2 boda), ali nedostaje definicija potpunog sustava (0/2) i sam dokaz (0/1).",
          "strengths": ["Ispravno navedena formula potpune vjerojatnosti"],
          "improvements": ["Potrebno je definirati potpuni sustav događaja", "Potrebno je priložiti dokaz, ne samo formulu"]
        }
      ],
      "total_points": 2,
      "max_points": 5,
      "percentage": 40,
      "feedback_summary": "Djelomično točno - formula je ispravna, ali nedostaje definicija i dokaz."
    }
  ],
  "total_points": 7,
  "max_total_points": 10,
  "overall_percentage": 70,
  "overall_feedback": "Student pokazuje dobro razumijevanje osnovnih koncepata, ali treba raditi na kompletnijim dokazima i definicijama. Preporučujem dodatnu praksu s teorijskim zadacima."
}
```

## PRINCIP "ERROR CARRY-FORWARD"

Ako student napravi grešku u koraku 1, ali ispravno izvede korake 2-5 s netočnim međurezultatom:
- Oduzmi bodove SAMO za korak 1
- Dodijeli pune bodove za korake 2-5 ako su metodološki ispravni

**Primjer:**
Student pogrešno izračuna silu (F=8N umjesto F=10N), ali zatim ispravno primijeni formulu a=F/m i dobije a=4 m/s².
- Oduzmi bodove za početnu grešku u izračunu sile
- Dodijeli bodove za ispravnu primjenu formule i metodologiju

## POSTUPANJE S POSEBNIM SLUČAJEVIMA

### Nečitljiv rukopis
Ako dio teksta nije čitljiv:
1. U `extraction.tasks[].student_answer` označi s `[nečitljivo]`
2. Dodaj opis u `extraction.unreadable_sections`
3. Postavi `extraction.extraction_confidence` na "medium" ili "low"
4. Pri bodovanju, ako je logika jasna unatoč nečitljivosti, daj prednost studentu

### Dijagrami i skice
Za grafičke elemente:
1. U `student_answer` opiši što je nacrtano: "(dijagram: slobodno tijelo s oznakama Fg, N, Ff)"
2. Pri bodovanju procijeni ispravnost dijagrama vizualno

### Prazan odgovor
Ako student nije odgovorio na zadatak:
- `student_answer = ""`
- `analysis = "Student nije dao odgovor na ovaj zadatak."`
- `awarded_points = 0`
- `justification = "Nije pružen nikakav odgovor."`

### Alternativni pristupi
Ako student koristi drugačiju, ali ispravnu metodu:
1. U `analysis` objasni koji pristup je korišten
2. Boduj jednako kao i standardni pristup
3. U `strengths` pohvali kreativnost ili alternativno razmišljanje

