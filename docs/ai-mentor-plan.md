# AI Mentor — plan (NOT built)

> **Status: not built, on purpose.** Ye feature ek LLM API pe chalta hai, aur har
> student message ka paisa lagta hai. Jab tak budget nahi hai, ye banane layak nahi.
> Koi code, koi table, koi dependency abhi repo me nahi hai — sirf ye plan hai.

---

## Pehle ye samajh lo: ye free nahi ho sakta

| Raasta | Kya hota hai |
|---|---|
| Anthropic / OpenAI / Gemini API | Har message ka kharcha. Deploy ke baad **students ke messages ka bill tumhara**. |
| "Free tier" wale providers | Rate limits itne kam ki 10 students me hi khatam. Ek public platform isspe nahi tik sakta. |
| Local model (Ollama) | Tumhare laptop pe muft — par deployed students ko kuch nahi milega. Bekaar. |

Matlab: **AI Mentor tabhi banao jab har mahine kuch hazaar rupaye API pe kharch karne ko tayaar ho**, aur pehle se decide kar lo ki limit kya hogi.

Jab tak wo din nahi aata, ye file plan hai — implementation nahi.

---

## ChatGPT wale prompt ka review

Wo prompt (jo ChatGPT se aaya tha) 80% achha hai. Teen cheezein galat hain — inhe bina fix kiye mat banana:

### ❌ 1. "You are NOT ChatGPT. You are NOT Claude."

Ye model se **jhooth bulwata hai**. Student poochega "tum kya ho?" aur wo inkaar karega — jabki usi prompt me likha hai *"Never fabricate information"*. Apna hi rule tod raha hai.

**Fix:** *"You are DataQuest Mentor, built on Claude."* Identity bhi rahegi, sach bhi.

### ❌ 2. 12-step teaching flow + "Never skip this flow"

Student poochta hai *"f-string ka syntax kya hai?"* → AI shuru karta hai Hook → Problem → Why → Visualization → Definition → … → Interview Question.

Ye **exhausting** hai. Wo flow **concept padhane** ke liye sahi hai, **sawaal** ke liye zeher.

**Fix:** chhota sawaal → chhota jawab. Flow tabhi jab sach me concept build karna ho.

### ❌ 3. "Hint 1. Wait. Hint 2. Wait. Hint 3."

Frustrated student ko tarsaoge toh wo **doosre tab me ChatGPT khol lega** aur wahan se answer copy karega. Tumne cheating roki nahi — bas apne platform se bahar bhej di.

**Fix:** sabse chhota dhakka do jo use unblock kare, aur saaf bolo ki tum kya kar rahe ho. Agar wo phir bhi poora solution maange — imaandari se batao ki isse uska kya nuksan hai, ek aur hint offer karo, aur phir bhi maange toh **har line samjha ke** do. Ek honest "ye tumhe kaise nuksan karega" us refusal se behtar hai jise wo bypass kar dega.

### ✅ Jo bilkul sahi hai

- Copy-paste learner mat banao, sochne wala banao
- Hinglish explanation + English technical terms
- Visual/analogy pehle, theory baad me
- "Never say wrong" — kyun hua, kaise theek karein
- **"Motivation must be true"** — fake tareef nahi, asli numbers. *Ye ab sach me possible hai* kyunki humne progress real bana diya (`lib/progress.ts`). Pehle ye jhooth hota.
- Never fabricate APIs / experience

---

## Asli differentiator: page context, par **data ke saath**

Prompt me "page context" idea sabse neeche dabi hai — aur wahi sabse keemti hai. Par usme sirf **role label** hai ("AI lesson mentor ban jaye"). Wo kaafi nahi — role label toh ChatGPT ko bhi de sakte ho.

Asli cheez: mentor ke paas **DataQuest ka asli data** ho.

| Page | Role | Jo data bhejna hai (yahi asli value hai) |
|---|---|---|
| `/learn/[slug]` | Lesson mentor | Us lesson ka **poora content** — taaki generic jawab na de, usi lesson pe baat kare |
| `/practice/[slug]` | Coding coach | Problem + **student ka abhi ka editor code** + **uske last test results** |
| `/roadmap` | Career planner | `getProgress()` se **asli track progress** |
| `/progress` | Learning coach | Asli numbers — 0% hai toh 0% bolo, jhoothi hausla-afzai nahi |
| `/resume` | ATS reviewer | Uska asli resume text. **Kabhi experience mat gadho.** |
| `/projects` | Project mentor | Project uske liye mat banao — wo portfolio bekaar hai |

**Ek zaroori design decision:** practice page pe `solutionCode` **mat bhejna**. Model khud ye problems solve kar leta hai; reference answer prompt me daalne se sirf leak hone ka raasta khulta hai — usi ek page pe jahan leak hona pura product tod deta hai.

---

## Architecture (jab banao)

```
components/MentorPanel.tsx     chat UI, streaming
        │  POST { mode, lessonSlug/problemSlug, code, testSummary, messages }
        ▼
app/api/mentor/route.ts        ← API key SIRF yahan. Kabhi browser me nahi.
        │                        auth check → rate limit → build context
        ▼
lib/mentor/prompt.ts           constitution (upar wale 3 fix ke saath)
lib/mentor/context.ts          asli data: lesson text / code / progress
        ▼
Anthropic API (streaming)
```

**Tay shudda baatein:**

- **API key server-side only.** `ANTHROPIC_API_KEY` `.env` me, kabhi `NEXT_PUBLIC_*` nahi.
- **Streaming**, warna student 10 second khaali screen dekhega.
- **Rate limit DB me, memory me nahi.** Vercel serverless pe har instance apna counter rakhega — aisa limiter kuch cap nahi karta, sirf jhoothi tasalli deta hai. Ek `MentorUsage` table (userId + day + count) chahiye.
- **Prompt caching:** system prompt + lesson content ko cache karo. Dhyan rahe — Opus pe cache ka **minimum 4096 tokens** hai; usse chhota prefix chup-chaap cache nahi hoga. Isliye caching tabhi faayda degi jab lesson content saath ho aur student usi lesson pe kai sawaal pooche (jo aam baat hai).
- **Cost cap pehle, feature baad me.** Per-user daily limit, aur ek global kill-switch env var.

---

## Ab kya karna hai (ye sab free hai)

1. **Deploy** — Neon aur Vercel dono ka **free tier** kaafi hai. `DEPLOY.md` dekho. Ye tumhara #1 goal hai aur isme paisa nahi lagta.
2. **Viz / BI / DL / Deploy tracks ke problems** — abhi 0 hain. Sirf mehnat, paisa nahi.
3. **Hints better karo** — `hintsJson` pehle se hai. Achhe hints 80% wahi kaam kar dete hain jo AI mentor karta, muft me.
4. Pandas 27 → aur badhao, ML abhi sirf 3.
