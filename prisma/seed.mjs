import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "url";
import { sqlProblems } from "./sql-problems.mjs";
import { pandasProblems } from "./pandas-problems.mjs";
import { scryptSync, randomBytes } from "crypto";
const prisma = new PrismaClient();

const hashPassword = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

/* ------------------------------------------------------------------ */
/* Tracks (the 9-phase skill sheet)                                    */
/* ------------------------------------------------------------------ */
const tracks = [
  { slug: "python", order: 1, title: "Programming Foundations — Python", subtitle: "the base of everything", icon: "Py", weeks: "~4 weeks", level: "Beginner",
    whyText: "Python data science ki universal language hai. Ye solid hoga to aage sab easy lagega.",
    milestone: "CLI quiz / expense tracker app", toolsCsv: "Python 3,Jupyter,VS Code",
    skillsJson: JSON.stringify(["Variables, data types, operators", "If-else, loops", "Functions & scope", "List, tuple, dict, set", "String methods & slicing", "Comprehensions", "OOP — classes, inheritance", "Error handling", "File handling", "Modules, pip, venv"]) },
  { slug: "statistics", order: 2, title: "Math & Statistics", subtitle: "the brain behind ML", icon: "∑", weeks: "~5 weeks", level: "Beginner→Inter",
    whyText: "Data science = statistics + code. Isse tum results ka matlab bata paoge — interview me yahi farak banata hai.",
    milestone: "A/B test analysis report", toolsCsv: "NumPy,SciPy",
    skillsJson: JSON.stringify(["Descriptive stats", "Probability & Bayes", "Distributions", "CLT & sampling", "Hypothesis testing, p-value", "Chi-square & ANOVA", "Correlation vs causation", "A/B testing", "Linear algebra basics", "Calculus intuition"]) },
  { slug: "pandas", order: 3, title: "Data Manipulation — NumPy & Pandas", subtitle: "the daily job of a data pro", icon: "pd", weeks: "~4 weeks", level: "Intermediate",
    whyText: "Real data ganda hota hai. 80% job 'data saaf karna & shape dena' hai — Pandas isme master banata hai.",
    milestone: "Clean a messy real-world dataset", toolsCsv: "NumPy,Pandas",
    skillsJson: JSON.stringify(["NumPy arrays & vectorization", "Series & DataFrame", "Read CSV/Excel/JSON/SQL", "Indexing (loc/iloc)", "Missing data (NaN)", "GroupBy & aggregation", "Merge, join, concat", "Pivot & reshape (melt)", "Apply, map, lambda", "Cleaning: dupes, outliers, dtypes"]) },
  { slug: "viz", order: 4, title: "Data Visualization & EDA", subtitle: "turn data into insight", icon: "Viz", weeks: "~3 weeks", level: "Intermediate",
    whyText: "Data ko dekhna aur usse kahani banana — yahi analysis hai. Companies insight nikaalne ke liye hire karti hain.",
    milestone: "Full EDA notebook — 5 real insights", toolsCsv: "Matplotlib,Seaborn,Plotly,Excel",
    skillsJson: JSON.stringify(["Matplotlib", "Seaborn", "Plotly (interactive)", "EDA: uni/bi/multivariate", "Correlation heatmaps", "Data storytelling", "Excel / Sheets", "Right chart chunna"]) },
  { slug: "sql", order: 5, title: "SQL & Databases", subtitle: "every job asks for this", icon: "DB", weeks: "~4 weeks", level: "Intermediate",
    whyText: "Real data databases me hota hai. SQL ke bina DS job almost impossible — ek pura interview round sirf SQL ka hota hai.",
    milestone: "Answer 12 business questions from a DB", toolsCsv: "PostgreSQL,MySQL",
    skillsJson: JSON.stringify(["SELECT, WHERE, ORDER BY", "Aggregations, GROUP BY", "Joins (inner/left/right)", "Subqueries & CTEs", "Window functions", "Date & string functions", "DB design & normalization", "Query optimization"]) },
  { slug: "bi", order: 6, title: "Business Intelligence & Dashboards", subtitle: "🎯 Data Analyst ready here", icon: "BI", weeks: "~3 weeks", level: "Intermediate",
    whyText: "Yahan tak = Data Analyst (₹4-8 LPA) ready. BI tools business ko dikhate hain ki tum data se decisions driveable banate ho.",
    milestone: "Interactive sales / HR dashboard", toolsCsv: "Power BI,Tableau", checkpoint: "Data Analyst · ₹4–8 LPA",
    skillsJson: JSON.stringify(["Power BI or Tableau", "Data modeling", "DAX / calc fields", "Interactive dashboards", "KPIs & metrics", "Publishing reports"]) },
  { slug: "ml", order: 7, title: "Machine Learning", subtitle: "the core of 'Data Scientist'", icon: "ML", weeks: "~8 weeks", level: "Advanced",
    whyText: "Machine ko data se seekhna sikhate ho. Ye skill package ko analyst se scientist level tak le jaati hai.",
    milestone: "End-to-end prediction model", toolsCsv: "scikit-learn,XGBoost",
    skillsJson: JSON.stringify(["ML workflow & scikit-learn", "Preprocessing: encoding, scaling", "Feature engineering", "Regression: Linear, Ridge, Lasso", "Classification: Logistic, KNN, SVM", "Trees & Random Forest", "Boosting: XGBoost, LightGBM", "Unsupervised: K-Means, PCA", "Evaluation: CV, ROC-AUC, RMSE", "Hyperparameter tuning"]) },
  { slug: "dl", order: 8, title: "Deep Learning & a Specialization", subtitle: "pick ONE, go deep", icon: "DL", weeks: "~8 weeks", level: "Advanced",
    whyText: "Package upar le jaata hai. Sab nahi — ek specialization (NLP/Vision/Time Series) chuno aur deep jao.",
    milestone: "Specialization project", toolsCsv: "TensorFlow,PyTorch,Hugging Face",
    skillsJson: JSON.stringify(["Neural network basics", "TensorFlow/Keras or PyTorch", "CNN — vision basics", "RNN / LSTM", "NLP: TF-IDF, embeddings", "Transformers / BERT intro", "Time series: ARIMA, Prophet", "Master 1 specialization"]) },
  { slug: "deploy", order: 9, title: "Deployment, Portfolio & Job Prep", subtitle: "🚀 Data Scientist ready here", icon: "★", weeks: "~6 weeks", level: "Advanced",
    whyText: "Skills ban gayi — ab duniya ko dikhana hai. Portfolio + deployment + interview prep hi ₹8-15 LPA dilata hai. 90% students yahi skip karte hain — tum mat karna.",
    milestone: "Deployed portfolio site + live ML app", toolsCsv: "GitHub,Streamlit,Docker,Kaggle", checkpoint: "Data Scientist / ML Engineer · ₹8–15 LPA",
    skillsJson: JSON.stringify(["Git & GitHub", "Deploy: Flask/FastAPI/Streamlit", "Docker basics", "Cloud intro (AWS/GCP)", "PySpark / big data (bonus)", "Portfolio: 3-4 projects + Kaggle", "Resume & LinkedIn", "Interview prep: SQL, ML, stats", "Communication & business sense", "Mock interviews & apply"]) },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const P = (order, slug, title, functionName, descriptionMd, examples, starter, solution, tests, hints, tags, difficulty = "Easy") => ({
  order, slug, title, difficulty, functionName, descriptionMd,
  tagsCsv: tags.join(","), examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), xp: 20,
});

/* ------------------------------------------------------------------ */
/* Lesson content                                                      */
/* ------------------------------------------------------------------ */
const L1 = [
  { t: "objectives", items: ["Variable banana aur usme value store karna","4 basic data types pehchanna — int, float, str, bool","type() se kisi bhi value ka type check karna","Ek type se doosre me convert karna (type casting)"] },
  { t: "hook", q: "Instagram tumhara naam yaad kaise rakhta hai?", why: "Tum ek baar naam likhte ho, aur wo har baar wapas dikh jaata hai — app band karke kholo tab bhi. Computer ne wo naam <b>kahin</b> rakha hai. Aaj hum wahi jagah banana seekhenge." },
  { t: "think", q: "Computer ko tumhara naam yaad rakhna hai. Uske paas sirf memory hai — koi copy, koi diary nahi. Wo kaise dhoondega ki naam kahan rakha tha?", a: "Memory ek badi almari jaisi hai jisme lakhon khaane hain. Value rakh dena kaafi nahi — <b>us khaane pe naam ka sticker</b> bhi lagana padega, warna wapas kaise milega? Bas yahi variable hai: ek naam, jo memory ki ek jagah ko point karta hai." },
  { t: "h2", n: "1", text: "Variable kya hota hai?" },
  { t: "def", term: "Variable", en: "A variable is a named reference to a value stored in memory.", hi: "Seedhe shabdon me — ek <b>naam</b> jiske through tum ek value ko store karte ho aur baad me wapas nikaalte ho." },
  { t: "p", html: "Socho ek <strong>dabba (box)</strong> hai jispe naam ka sticker laga hai. Us dabbe me tum koi cheez rakh sakte ho aur naam se nikaal sakte ho. Programming me isi dabbe ko <strong>variable</strong> kehte hain." },
  { t: "analogy", concept: "Variable", real: "Sticker laga dabba", html: "Dabba = memory ki jagah. Sticker = variable ka naam. Andar ki cheez = value. Cheez badal sakti hai, sticker wahi rehta hai — isiliye <code>age = 21</code> ke baad <code>age = 22</code> likhna bilkul chalta hai." },
  { t: "code", file: "variables.py", code: "# variable banana — naam = value\nname = \"Jugendra\"\nage  = 21\nprint(name)\nprint(age)", output: "Jugendra\n21" },
  { t: "psoft", html: "Yahan <code>=</code> ka matlab \"barabar\" nahi — iska matlab hai <strong>\"right side ki value left side ke naam me daal do\"</strong>." },
  { t: "note", variant: "tip", html: "<b>Tip:</b> Variable ka naam meaningful rakho. <code>x = 21</code> se behtar <code>age = 21</code> hai." },
  { t: "viz", name: "variables-playground" },
  { t: "h2", n: "2", text: "4 basic data types" },
  { t: "p", html: "Har value ka ek <strong>type</strong> hota hai. Shuruaat me ye 4 sabse zaroori hain:" },
  { t: "dtypes", items: [
    { tag: "int", name: "Integer", desc: "Poore numbers, bina decimal.", ex: "age = 21" },
    { tag: "float", name: "Float", desc: "Decimal wale numbers.", ex: "price = 99.5" },
    { tag: "str", name: "String", desc: "Text — hamesha quotes me.", ex: "name = \"Freya\"" },
    { tag: "bool", name: "Boolean", desc: "Sirf True ya False.", ex: "is_online = True" },
  ]},
  { t: "h2", n: "3", text: "Type conversion (casting)" },
  { t: "p", html: "User se input hamesha <strong>string</strong> me aata hai — usse number banane ke liye convert karna padta hai." },
  { t: "code", file: "casting.py", code: "marks = \"85\"        # string hai\nmarks = int(marks)   # ab int\nprint(marks + 5)", output: "90" },
  { t: "note", variant: "warn", html: "<b>Common galti:</b> <code>\"85\" + 5</code> likhoge to error aayega. Pehle <code>int()</code> se convert karo." },
  { t: "viz", name: "casting-lab" },
  { t: "mistakes", items: [
    { bad: '"85" + 5', why: "Python <code>+</code> ka matlab type ke hisaab se badal deta hai — do strings ho to <b>jodta</b> hai, do numbers ho to <b>plus</b> karta hai. Ek string aur ek int? Wo guess nahi karta, error de deta hai.", fix: 'int("85") + 5' },
    { bad: 'age = "21"', why: "Quotes laga diye to wo number nahi, <b>text</b> hai. Dikhne me 21 lagta hai par <code>age + 1</code> pe error milega. <code>input()</code> hamesha string deta hai — yahi sabse common jagah hai jahan ye galti hoti hai.", fix: "age = 21" },
    { bad: "2age = 21", why: "Variable ka naam digit se shuru nahi ho sakta, aur usme space nahi aa sakta. Python file padhte waqt hi ruk jayega — <code>SyntaxError</code>.", fix: "age2 = 21" },
  ]},
  { t: "recap", items: ["Variable = ek naam jisme value store hoti hai","4 basic types: int, float, str, bool","type() se type pata karo · casting se badlo","String + number seedhe jodne se error — pehle convert karo"] },
  { t: "interview", items: [
    { level: "beginner", q: "Variable kya hota hai?", a: "A variable is a named reference to a value stored in memory. Python me variable declare karne ki zaroorat nahi — <code>x = 5</code> likhte hi ban jaata hai, aur uska type value se khud tay ho jaata hai." },
    { level: "beginner", q: "int aur float me kya farak hai?", a: "<code>int</code> poore numbers rakhta hai (<code>21</code>), <code>float</code> decimal wale (<code>99.5</code>). Do int ko divide karo to Python <b>float</b> hi deta hai — <code>10 / 2</code> ka jawab <code>5.0</code> hai, <code>5</code> nahi. Yahi chhoti baat interview me pakdi jaati hai." },
    { level: "intermediate", q: "Python dynamically typed hai — iska matlab kya hai?", a: "Type <b>value</b> ke saath judta hai, variable ke saath nahi. Isliye <code>x = 5</code> ke baad <code>x = \"hello\"</code> bilkul chalta hai — C/Java me nahi chalta. Faayda: likhna tez. Nuksan: type ki galti run karne par pakdi jaati hai, likhte waqt nahi." },
    { level: "intermediate", q: '<code>input()</code> se number lena ho to kya dhyan rakhoge?', a: "<code>input()</code> <b>hamesha string</b> deta hai, chahe user 21 hi likhe. Number chahiye to khud convert karo: <code>age = int(input())</code>. Bina convert kiye <code>age + 1</code> karoge to <code>TypeError</code> milega — ye production bugs ki sabse aam wajah hai." },
  ]},
];

const L2 = [
  { t: "objectives", items: ["Arithmetic operators (+ - * / // % **) use karna","Comparison operators se True/False nikaalna","Logical and / or / not samajhna"] },
  { t: "hook", q: "17 chocolates, 5 bachche. Har bachche ko barabar do — kitni bachengi?", why: "Jawaab hai 3 har ek ko, aur 2 bachi. Ye do alag sawaal hain, aur Python ke paas dono ke liye <b>alag operator</b> hai. Zyadatar log sirf ek jaante hain — aur wahi interview me phans jaate hain." },
  { t: "think", q: "Python me <code>17 / 5</code> ka jawaab <code>3.4</code> aata hai. Par tumhe sirf <b>3</b> chahiye (poora bhaag), ya sirf <b>2</b> chahiye (jo bacha). Kya karoge?", a: "<code>17 // 5</code> → <b>3</b> (floor division — decimal phenk deta hai)<br/><code>17 % 5</code> → <b>2</b> (modulo — remainder deta hai)<br/><br/>Ye do operators har jagah aate hain: even/odd check (<code>n % 2</code>), pages banana, cheezein groups me baantna." },
  { t: "h2", n: "1", text: "Arithmetic operators" },
  { t: "def", term: "Operator", en: "An operator is a symbol that performs an operation on one or more values.", hi: "Jis value pe operator kaam karta hai use <b>operand</b> kehte hain. <code>17 + 5</code> me <code>+</code> operator hai, aur <code>17</code> aur <code>5</code> operands." },
  { t: "p", html: "Numbers pe hisaab ke liye: <code>+</code> jodna, <code>-</code> ghatana, <code>*</code> guna, <code>/</code> bhaag, <code>//</code> poora bhaag, <code>%</code> remainder, <code>**</code> power." },
  { t: "code", file: "arithmetic.py", code: "print(17 + 5)   # 22\nprint(17 // 5)  # 3  (poora bhaag)\nprint(17 % 5)   # 2  (bacha hua)\nprint(2 ** 3)   # 8  (2 ki power 3)", output: "22\n3\n2\n8" },
  { t: "viz", name: "operator-lab" },
  { t: "h2", n: "2", text: "Comparison operators" },
  { t: "p", html: "Do cheezein compare karo — jawaab hamesha <code>True</code> ya <code>False</code>: <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>." },
  { t: "code", file: "compare.py", code: "print(10 == 10)  # True\nprint(5 > 8)     # False\nprint(3 != 4)    # True", output: "True\nFalse\nTrue" },
  { t: "note", variant: "warn", html: "<b>Yaad rakho:</b> <code>=</code> value dene ke liye, <code>==</code> compare karne ke liye. Sabse common galti!" },
  { t: "h2", n: "3", text: "Logical operators" },
  { t: "p", html: "Conditions jodne ke liye: <code>and</code> (dono sach), <code>or</code> (koi ek sach), <code>not</code> (ulta)." },
  { t: "code", file: "logical.py", code: "age = 20\nprint(age > 18 and age < 60)  # True\nprint(age < 13 or age > 60)   # False", output: "True\nFalse" },
  { t: "mistakes", items: [
    { bad: "if age = 18:", why: "<code>=</code> value <b>deta</b> hai, <code>==</code> <b>compare</b> karta hai. Ye sabse aam galti hai — aur Python isme meherbaan hai, seedha <code>SyntaxError</code> de deta hai. C me ye chup-chaap chal jaata aur ghanton bug dhoondhte.", fix: "if age == 18:" },
    { bad: "10 / 2  # soch rahe ho 5 milega", why: "<code>/</code> Python me <b>hamesha float</b> deta hai — jawaab <code>5.0</code> hai, <code>5</code> nahi. Poora number chahiye to <code>//</code> use karo. Interview me ye chhota sa sawaal aksar aata hai.", fix: "10 // 2  # 5" },
    { bad: "if 13 < age < 60 and name:", why: "Ye galat nahi hai — par samajhna zaroori hai. Python me <code>and</code>/<code>or</code> True/False nahi, <b>value</b> lautate hain, aur khaali string <code>\"\"</code> falsy hoti hai. Isliye <code>name</code> khaali hone par poori condition False ho jayegi.", fix: "if 13 < age < 60 and name != \"\":" },
  ]},
  { t: "recap", items: ["Arithmetic: + - * / // % **","Comparison hamesha True/False deta hai","= assign karta hai, == compare karta hai","and / or / not se conditions jodo"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>/</code> aur <code>//</code> me kya farak hai?", a: "<code>/</code> <b>true division</b> hai — hamesha float deta hai (<code>10/2</code> → <code>5.0</code>). <code>//</code> <b>floor division</b> hai — neeche wale poore number pe le jaata hai (<code>10//3</code> → <code>3</code>). Dhyan do: negative me <code>-7//2</code> ka jawaab <code>-4</code> hai, <code>-3</code> nahi — floor hamesha <b>neeche</b> jaata hai." },
    { level: "beginner", q: "<code>%</code> operator kis kaam aata hai?", a: "Remainder deta hai. Sabse common use: <code>n % 2 == 0</code> se even check karna, kisi cheez ko groups me baantna, ya circular index banana (<code>i % len(arr)</code>)." },
    { level: "intermediate", q: "Python me <code>and</code> kya return karta hai — True/False ya kuch aur?", a: "<b>Value</b> return karta hai, boolean nahi. <code>a and b</code> me agar <code>a</code> falsy hai to <code>a</code> lautata hai, warna <code>b</code>. Isliye <code>0 and 5</code> → <code>0</code>, aur <code>2 and 5</code> → <code>5</code>. Isse <b>short-circuit</b> kehte hain — <code>b</code> evaluate hi nahi hota agar zaroorat na ho." },
    { level: "intermediate", q: "<code>13 < age < 60</code> Python me chalta hai. Ye kaise?", a: "Ise <b>chained comparison</b> kehte hain — Python ise <code>13 < age and age < 60</code> me todta hai, aur <code>age</code> ko <b>sirf ek baar</b> evaluate karta hai. Zyadatar dusri languages me ye nahi chalta (wahan <code>13 &lt; age</code> pehle True/False banta, phir usse 60 se compare hota)." },
  ]},
];

const L3 = [
  { t: "objectives", items: ["if / else se decisions lena","elif se multiple cases handle karna","Indentation ka role samajhna"] },
  { t: "hook", q: "ATM ko kaise pata chalta hai ki paise dene hain ya \"insufficient balance\" bolna hai?", why: "Har app har second yahi kar rahi hai — <b>check karo, phir tay karo</b>. Login sahi hai ya nahi, cart khaali hai ya nahi, user adult hai ya nahi. Ye poora kaam ek hi cheez pe tika hai jo aaj seekhoge." },
  { t: "think", q: "Marks ke hisaab se grade dena hai: 90+ → A, 75+ → B, 40+ → C, warna Fail. Ek student ke 82 marks hain. Agar tum <b>chaar alag</b> <code>if</code> likh do (elif nahi), to kya hoga?", a: "Chaaron <code>if</code> alag-alag check honge. 82 <code>>= 75</code> bhi hai aur <code>>= 40</code> bhi — matlab <b>B aur C dono</b> print ho jayenge. <br/><br/><code>elif</code> ka poora point yahi hai: jaise hi koi ek match kare, <b>baaki chhod do</b>. Ye sirf sundarta nahi — ye correctness hai." },
  { t: "h2", n: "1", text: "if aur else" },
  { t: "def", term: "Conditional statement", en: "A conditional statement executes a block of code only when a given condition evaluates to true.", hi: "Condition ka jawaab hamesha <code>True</code> ya <code>False</code> hota hai — usi pe tay hota hai ki andar wala block chalega ya nahi." },
  { t: "p", html: "Program ko decision lena sikhate hain: <b>agar</b> condition True hai to ye karo, <b>warna</b> wo. Andar ka code <b>indent</b> (4 space) hota hai." },
  { t: "code", file: "ifelse.py", code: "age = 20\nif age >= 18:\n    print(\"Adult\")\nelse:\n    print(\"Minor\")", output: "Adult" },
  { t: "note", variant: "tip", html: "<b>Indentation zaroori hai:</b> Python me curly braces nahi — code block sirf spaces se banta hai. 4 space standard." },
  { t: "h2", n: "2", text: "elif — beech ke cases" },
  { t: "p", html: "Ek se zyada conditions ke liye <code>elif</code> (else-if). Upar se neeche check hoti hain — jo pehli True mile wahi chalti hai." },
  { t: "code", file: "grade.py", code: "marks = 82\nif marks >= 90:\n    print(\"A\")\nelif marks >= 75:\n    print(\"B\")\nelif marks >= 40:\n    print(\"C\")\nelse:\n    print(\"Fail\")", output: "B" },
  { t: "analogy", concept: "if / elif / else", real: "Security guard ki checklist", html: "Guard upar se neeche padhta hai: \"VIP pass hai? → andar bhejo.\" \"Nahi? Normal ticket hai? → line me lagao.\" \"Wo bhi nahi? → wapas bhejo.\" Jaise hi ek match ho, wo <b>ruk jaata hai</b> — baaki nahi padhta. <code>elif</code> bilkul yahi karta hai." },
  { t: "mistakes", items: [
    { bad: "if marks >= 40:\nprint(\"Pass\")", why: "Indent nahi kiya. Python me curly braces nahi hote — block <b>sirf spaces</b> se banta hai. Bina indent ke <code>IndentationError</code> milega.", fix: "if marks >= 40:\n    print(\"Pass\")" },
    { bad: "if marks >= 40:\n  print(\"Pass\")\n      print(\"Done\")", why: "Ek hi block me alag-alag indent. Python ko fixed 4 space nahi chahiye, par ek block ke andar <b>consistent</b> chahiye. Tabs aur spaces mix karna sabse bura — dikhta same hai, error milta hai.", fix: "if marks >= 40:\n    print(\"Pass\")\n    print(\"Done\")" },
    { bad: "if marks >= 40:\n    print(\"C\")\nif marks >= 75:\n    print(\"B\")", why: "Alag <code>if</code> matlab dono independently check honge — 82 marks pe <b>C aur B dono</b> print ho jayenge. Ek hi cheez me se ek chunni ho to <code>elif</code> chahiye.", fix: "if marks >= 75:\n    print(\"B\")\nelif marks >= 40:\n    print(\"C\")" },
  ]},
  { t: "recap", items: ["if → condition True to chalega","elif → aur cases (upar se neeche check)","else → koi match na ho to","Indentation (4 space) block banata hai"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>elif</code> aur alag-alag <code>if</code> me kya farak hai?", a: "Alag <code>if</code> <b>sabhi</b> check hote hain — kai sach ho sakte hain. <code>elif</code> me pehla match milte hi baaki <b>skip</b> ho jaate hain. Grade jaise mutually exclusive cases me <code>elif</code> hi sahi hai, warna ek se zyada branch chal jayenge." },
    { level: "beginner", q: "Python me indentation itna zaroori kyun hai?", a: "Kyunki Python me block banane ke liye <b>koi braces nahi</b> — indentation hi syntax hai. Dusri languages me indent sirf padhne ke liye hota hai; Python me wo hi batata hai ki code kis block ka hissa hai." },
    { level: "intermediate", q: "Python me kaunsi cheezein <code>False</code> maani jaati hain?", a: "<code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, khaali <code>\"\"</code>, khaali <code>[]</code>, <code>{}</code>, <code>()</code>, <code>set()</code>. Baaki sab <b>truthy</b>. Isliye <code>if items:</code> likhna <code>if len(items) > 0:</code> se zyada Pythonic hai — par dhyan raho, <code>0</code> valid value ho to ye bug ban jaata hai." },
    { level: "intermediate", q: "Python me ternary (one-line if) kaise likhte hain?", a: "<code>status = \"Adult\" if age >= 18 else \"Minor\"</code> — condition <b>beech</b> me aati hai, dusri languages ke <code>? :</code> se ulta. Chhoti assignment ke liye theek hai; nested ternary padhne layak nahi rehta — wahan normal <code>if</code> hi use karo." },
  ]},
];

const L4 = [
  { t: "objectives", items: ["for loop se list / range pe chalna","while loop condition tak chalana","break aur continue use karna"] },
  { t: "hook", q: "10 lakh users ki salary ka total nikalna hai. Kya tum 10 lakh baar <code>+</code> likhoge?", why: "Obviously nahi. Par phir computer kaise karta hai? Wo bhi ek-ek karke hi jodta hai — bas <b>likhne</b> ka kaam ek baar hota hai, <b>chalne</b> ka 10 lakh baar. Wahi loop hai." },
  { t: "think", q: "<code>range(5)</code> kya deta hai? Dhyan se socho — kitne numbers, aur kaunse se kaunse tak?", a: "<b>5 numbers: 0, 1, 2, 3, 4</b> — <code>5</code> khud shaamil <b>nahi</b> hai.<br/><br/>Ye \"start included, stop excluded\" rule Python me har jagah hai — <code>range()</code>, slicing <code>[1:3]</code>, sab me. Ek baar dimaag me baith gaya to aadhi off-by-one galtiyan khatam." },
  { t: "h2", n: "1", text: "for loop" },
  { t: "def", term: "Loop", en: "A loop repeatedly executes a block of code while a condition holds or for each item in a sequence.", hi: "Ek chakkar ko <b>iteration</b> kehte hain. <code>for</code> ek collection ke <b>har item</b> pe chalta hai; <code>while</code> tab tak chalta hai jab tak condition sach hai." },
  { t: "p", html: "Ek hi kaam har item pe dohrane ke liye <code>for</code> loop. <code>range(5)</code> deta hai 0,1,2,3,4." },
  { t: "code", file: "forloop.py", code: "total = 0\nfor n in [2, 4, 6, 8, 10]:\n    total += n\nprint(total)   # 30", output: "30" },
  { t: "viz", name: "loop-visualizer" },
  { t: "h2", n: "2", text: "while loop" },
  { t: "p", html: "Jab tak condition True hai, <code>while</code> chalta rehta hai. Dhyaan — condition kabhi False honi chahiye warna infinite loop!" },
  { t: "code", file: "while.py", code: "count = 3\nwhile count > 0:\n    print(count)\n    count -= 1", output: "3\n2\n1" },
  { t: "h2", n: "3", text: "break aur continue" },
  { t: "p", html: "<code>break</code> loop turant rok deta hai. <code>continue</code> current chakkar chhod ke agle pe chala jaata hai." },
  { t: "note", variant: "warn", html: "<b>Infinite loop se bacho:</b> while me kuch aisa zaroor badlo jisse condition ek din False ho." },
  { t: "analogy", concept: "for vs while", real: "Guest list vs Darwaza", html: "<b>for</b> = guest list haath me hai — tumhe pata hai kitne log aane hain, ek-ek ka naam pukaro, list khatam, kaam khatam. <b>while</b> = darwaaze pe khade ho — nahi pata kitne aayenge, bas \"jab tak koi aata rahe\" tab tak khade raho. Isiliye <code>while</code> me infinite loop ho sakta hai, <code>for</code> me nahi." },
  { t: "mistakes", items: [
    { bad: "for i in range(1, 5):\n    print(i)  # 5 chahiye tha", why: "<code>range(1, 5)</code> deta hai 1,2,3,4 — <b>5 nahi</b>. Stop hamesha <b>excluded</b> hota hai. Ye \"off-by-one\" galti programming ki sabse purani aur sabse aam galti hai.", fix: "for i in range(1, 6):\n    print(i)" },
    { bad: "while count > 0:\n    print(count)", why: "<code>count</code> kabhi badla hi nahi — condition hamesha True rahegi. <b>Infinite loop.</b> Program hang ho jayega. <code>while</code> likhte hi khud se poochho: \"ye False kab hoga?\"", fix: "while count > 0:\n    print(count)\n    count -= 1" },
    { bad: "for f in fruits:\n    fruits.remove(f)", why: "Jis list pe loop chal raha hai usi ko badal rahe ho. Har remove pe baaki items khisak jaate hain, aur loop <b>items skip kar deta hai</b>. Error nahi milega — bas chup-chaap galat jawab. Ye sabse khatarnaak kism ka bug hai.", fix: "for f in fruits[:]:\n    fruits.remove(f)" },
  ]},
  { t: "recap", items: ["for → known items / range pe chalo","while → condition tak chalo","break → loop rok do","continue → agla chakkar"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>for</code> aur <code>while</code> kab use karoge?", a: "<code>for</code> jab pata ho <b>kis-kis pe</b> chalna hai — list, string, range. <code>while</code> jab pata na ho kitni baar chalega, sirf <b>rukne ki condition</b> pata ho — jaise \"jab tak user quit na likhe\"." },
    { level: "beginner", q: "<code>break</code> aur <code>continue</code> me kya farak hai?", a: "<code>break</code> loop <b>poora</b> tod deta hai — bahar nikal jaata hai. <code>continue</code> sirf <b>current chakkar</b> chhodta hai aur agle pe chala jaata hai. <code>break</code> = \"bas, khatam\"; <code>continue</code> = \"isko chhodo, agla dikhao\"." },
    { level: "intermediate", q: "Loop pe <code>else</code> laga sakte ho? Wo kab chalega?", a: "Haan — Python ki khaas cheez hai. <code>for...else</code> me <code>else</code> tab chalta hai jab loop <b>bina break ke</b> poora ho jaye. Search me kaam aata hai: item mila to <code>break</code>, nahi mila to <code>else</code> me \"not found\". Naam confusing hai — ise <code>nobreak</code> samajhna behtar hai." },
    { level: "intermediate", q: "Jis list pe loop chal raha ho usko modify karne me kya problem hai?", a: "Loop internally <b>index</b> se chalta hai. Item hataoge to baaki peeche khisak jaayenge, par index aage badh chuka hoga — matlab kuch items <b>skip</b> ho jayenge. Error nahi aayega, jawaab galat aayega. Hal: copy pe loop karo (<code>for x in items[:]</code>) ya nayi list banao (list comprehension)." },
  ]},
];

const L5 = [
  { t: "objectives", items: ["List banana aur index se item nikaalna","append, len, slicing use karna","Tuple (fix list) samajhna"] },
  { t: "hook", q: "Ek class ke 60 students ke naam rakhne hain. 60 variables banaoge — <code>name1</code>, <code>name2</code>… <code>name60</code>?", why: "Aur agar 61st student aa gaya? Ya poori list sort karni ho? 60 alag naam ek saath handle karne ka koi tarika hi nahi. Isiliye ek aisa dabba chahiye jisme <b>kai cheezein, ek order me</b> rakhi ja sakein." },
  { t: "think", q: "<code>fruits = [\"apple\", \"mango\", \"kiwi\"]</code> — <code>fruits[1]</code> kya dega? Aur <code>fruits[-1]</code>?", a: "<code>fruits[1]</code> → <b>\"mango\"</b>. Index <b>0 se</b> shuru hota hai, isliye 1 matlab doosra item.<br/><code>fruits[-1]</code> → <b>\"kiwi\"</b>. Negative index peeche se ginta hai, aur -1 hamesha <b>aakhri</b> item hai.<br/><br/><code>len(fruits) - 1</code> likhne ki zaroorat nahi — <code>[-1]</code> hi kaafi hai." },
  { t: "h2", n: "1", text: "List aur index" },
  { t: "def", term: "List", en: "A list is an ordered, mutable collection of values, accessed by index.", hi: "<b>Ordered</b> = jis order me daala usi order me rahega. <b>Mutable</b> = banane ke baad badal sakte ho. <b>Index</b> = har item ki position, <code>0</code> se shuru." },
  { t: "p", html: "List me kai values ek jagah, square brackets me. Har item ka index aage se <code>0</code> se, peeche se <code>-1</code> se." },
  { t: "code", file: "list.py", code: "fruits = [\"apple\", \"mango\", \"kiwi\"]\nprint(fruits[0])   # apple\nprint(fruits[-1])  # kiwi\nprint(len(fruits)) # 3", output: "apple\nkiwi\n3" },
  { t: "viz", name: "list-indexer" },
  { t: "h2", n: "2", text: "List badalna" },
  { t: "p", html: "<code>append()</code> se item jodo, index se badlo, <code>[a:b]</code> se slice (tukda) lo." },
  { t: "code", file: "listops.py", code: "nums = [10, 20, 30]\nnums.append(40)     # [10,20,30,40]\nnums[0] = 99        # [99,20,30,40]\nprint(nums[1:3])    # [20, 30]", output: "[20, 30]" },
  { t: "h2", n: "3", text: "Tuple — fix list" },
  { t: "p", html: "Tuple list jaisi hai par <b>badalti nahi</b> — round brackets me. Jab data fix rakhna ho to use karo." },
  { t: "note", variant: "tip", html: "<b>List vs Tuple:</b> List <code>[]</code> badal sakti hai, Tuple <code>()</code> nahi." },
  { t: "analogy", concept: "List vs Tuple", real: "Shopping list vs Aadhaar card", html: "<b>Shopping list</b> — kuch bhi jodo, hatao, badlo. Wahi list hai. <b>Aadhaar card</b> — chhap gaya, ab badal nahi sakte; badalna hai to naya banwao. Wahi tuple hai. Isiliye coordinates <code>(x, y)</code> ya RGB <code>(255, 0, 0)</code> tuple hote hain — wo cheezein badalni nahi chahiye." },
  { t: "mistakes", items: [
    { bad: "fruits[3]  # list me 3 items hain", why: "3 items ke index hain <b>0, 1, 2</b> — index 3 hai hi nahi. <code>IndexError</code> milega. Aakhri item hamesha <code>len-1</code> pe hota hai, ya seedha <code>[-1]</code> likh do.", fix: "fruits[2]   # ya fruits[-1]" },
    { bad: "b = a\nb.append(4)  # a bhi badal gaya!", why: "<code>b = a</code> nayi list nahi banata — dono naam <b>ek hi list</b> ko point karte hain. Ek ko badlo, dono me dikhega. Ye har beginner ko kaatta hai.", fix: "b = a[:]   # ya list(a)" },
    { bad: "nums = (1, 2, 3)\nnums.append(4)", why: "Tuple <b>immutable</b> hai — usme <code>append</code> hota hi nahi. <code>AttributeError</code> milega. Badalna hai to list use karo, ya naya tuple banao.", fix: "nums = [1, 2, 3]\nnums.append(4)" },
  ]},
  { t: "recap", items: ["List [] — kai values, index 0 se","fruits[-1] = last item","append() jodta hai, [a:b] slice deta hai","Tuple () = badalti nahi"] },
  { t: "interview", items: [
    { level: "beginner", q: "List aur tuple me kya farak hai?", a: "List <b>mutable</b> hai (<code>[]</code>, badal sakti hai), tuple <b>immutable</b> (<code>()</code>, nahi badal sakta). Tuple thoda tez aur kam memory leta hai, aur — sabse zaroori — <b>dict ki key</b> ban sakta hai; list nahi ban sakti, kyunki uske badalne se hash tootega." },
    { level: "beginner", q: "<code>nums[1:3]</code> kya dega?", a: "Index <b>1 aur 2</b> ke items — <b>3 nahi</b>. Slicing me start included, stop excluded. Aur slice hamesha <b>nayi list</b> deta hai, original ko chhedta nahi." },
    { level: "intermediate", q: "<code>b = a</code> aur <code>b = a[:]</code> me kya farak hai?", a: "<code>b = a</code> sirf <b>naya naam</b> hai usi list ka — ek badlo, dono badle. <code>b = a[:]</code> <b>shallow copy</b> banata hai — top level alag ho jaata hai. Par nested list ho to andar wali abhi bhi shared hai; wahan <code>copy.deepcopy()</code> chahiye." },
    { level: "intermediate", q: "<code>append()</code> aur <code>extend()</code> me kya farak hai?", a: "<code>a.append([1,2])</code> poori list ko <b>ek item</b> ki tarah andar daal deta hai → <code>[..., [1,2]]</code>. <code>a.extend([1,2])</code> uske <b>har item</b> ko alag-alag jodta hai → <code>[..., 1, 2]</code>. Nested list ban jaana isi galti ki nishani hai." },
  ]},
];

const L6 = [
  { t: "objectives", items: ["Dictionary (key-value) banana aur use karna","Value access aur add karna","Set (unique items) samajhna"] },
  { t: "hook", q: "10 lakh users me se ek ka email dhoondhna hai. List me dhoondhoge — kitna time lagega?", why: "List me computer ko <b>ek-ek karke</b> 10 lakh tak check karna pad sakta hai. Dict me? Wo seedha wahan jaata hai — chahe 10 users ho ya 10 crore, time <b>utna hi</b> rehta hai. Ye jaadu nahi, ek trick hai jo aaj samajhoge." },
  { t: "think", q: "Dict itna tez kaise hai? Wo bina poori list dekhe seedha sahi jagah kaise pahunch jaata hai?", a: "Key ko ek function se guzaarke ek <b>number</b> banaya jaata hai — usse <b>hash</b> kehte hain. Wo number batata hai ki memory me <b>kis khaane me</b> dekhna hai. Matlab dhoondhna nahi padta, <b>seedha calculate</b> ho jaata hai.<br/><br/>Isiliye dict ki key <b>immutable</b> honi chahiye — key badal gayi to hash badal jayega, aur value hamesha ke liye kho jayegi. Yahi wajah hai ki list key nahi ban sakti, tuple ban sakta hai." },
  { t: "h2", n: "1", text: "Dictionary — key : value" },
  { t: "def", term: "Dictionary", en: "A dictionary is a mutable collection of key-value pairs, where each key maps to exactly one value.", hi: "Key se value <b>seedha</b> milti hai — dhoondhna nahi padta. Key <b>unique</b> aur <b>immutable</b> honi chahiye (string, number, tuple — list nahi)." },
  { t: "p", html: "Dict me har value ka ek <b>naam (key)</b> hota hai. Curly braces <code>{}</code> me <code>key: value</code>." },
  { t: "code", file: "dict.py", code: "student = {\"name\": \"Freya\", \"age\": 21}\nprint(student[\"name\"])       # Freya\nstudent[\"city\"] = \"Delhi\"   # naya add\nprint(student)", output: "Freya\n{'name': 'Freya', 'age': 21, 'city': 'Delhi'}" },
  { t: "note", variant: "tip", html: "<b>List vs Dict:</b> List me number index (0,1,2), Dict me apna naam wala key. Naam se dhoondhna ho to dict." },
  { t: "h2", n: "2", text: "Set — unique items" },
  { t: "p", html: "Set me har item sirf ek baar — duplicate apne aap hat jaate hain. Unique count ke liye best." },
  { t: "code", file: "set.py", code: "marks = [90, 85, 90, 70, 85]\nunique = set(marks)   # {90, 85, 70}\nprint(len(unique))    # 3", output: "3" },
  { t: "analogy", concept: "Dictionary", real: "Phone ki contact list", html: "Tum number yaad nahi rakhte — <b>naam</b> yaad rakhte ho. \"Amma\" type kiya, number aa gaya. Naam = <b>key</b>, number = <b>value</b>. Aur dhyan do: do \"Amma\" nahi ho sakte — key hamesha unique hoti hai. Naya number save karo to purana <b>replace</b> ho jaata hai. Dict bilkul yahi karta hai." },
  { t: "mistakes", items: [
    { bad: 'student["email"]  # key hai hi nahi', why: "Missing key pe <code>KeyError</code> aata hai aur program <b>ruk</b> jaata hai. Agar key ka pakka na ho to <code>.get()</code> use karo — wo error ki jagah <code>None</code> (ya tumhara default) deta hai.", fix: 'student.get("email", "N/A")' },
    { bad: 'd = {["a"]: 1}', why: "List <b>key nahi ban sakti</b> — wo mutable hai, aur badalne pe uska hash badal jayega, matlab value hamesha ke liye kho jayegi. <code>TypeError: unhashable type</code>. Tuple chalega, kyunki wo badalta nahi.", fix: 'd = {("a",): 1}' },
    { bad: "s = {}   # khaali set banana tha", why: "<code>{}</code> khaali <b>dict</b> banata hai, set nahi — Python me <code>{}</code> pehle dict ke liye tha. Khaali set ke liye <code>set()</code> hi likhna padta hai.", fix: "s = set()" },
  ]},
  { t: "recap", items: ["Dict {} = key:value pairs","d[key] se access, d[new]=val se add","Set {} = sirf unique items","set(list) se duplicates hatao"] },
  { t: "interview", items: [
    { level: "beginner", q: "List ki jagah dict kab use karoge?", a: "Jab cheez <b>naam se</b> dhoondhni ho, position se nahi. List me item dhoondhna matlab poori list scan karna (O(n)); dict me key se seedha milta hai (O(1)) — chahe 10 items ho ya 10 lakh." },
    { level: "beginner", q: "<code>d[\"key\"]</code> aur <code>d.get(\"key\")</code> me kya farak hai?", a: "Key na ho to <code>d[\"key\"]</code> <code>KeyError</code> phenkta hai aur program rukta hai; <code>d.get(\"key\")</code> chup-chaap <code>None</code> deta hai (ya <code>d.get(\"key\", default)</code>). Key ka pakka ho to bracket theek — kyunki tab error <b>chahiye</b>, taaki bug chhupe nahi." },
    { level: "intermediate", q: "Dict ki key kya-kya ban sakti hai, aur kyun?", a: "Sirf <b>hashable</b> cheezein — string, number, tuple. List/dict/set nahi, kyunki wo <b>mutable</b> hain. Dict key ka hash nikaal ke uski jagah tay karta hai; key badal gayi to hash badal jayega aur value dhoondhi nahi ja sakegi. Isiliye immutable ka rule hai." },
    { level: "intermediate", q: "Dict me lookup O(1) kaise hota hai?", a: "<b>Hash table.</b> Key ko hash function se ek number me badalte hain, wo number batata hai ki kis slot me dekhna hai — scan nahi, seedha calculation. Do keys ka hash same ho jaye (<b>collision</b>) to Python usse internally handle kar leta hai. Isiliye O(1) <b>average</b> hai, worst case nahi." },
  ]},
];

const L7 = [
  { t: "objectives", items: ["def se function banana","Parameters lena aur return karna","Default arguments use karna"] },
  { t: "hook", q: "Ek hi hisaab tumhare code me 40 jagah likha hai. Ab formula badal gaya. Kitni jagah theek karoge?", why: "Chalis. Aur ek jagah bhool gaye to bug wahin baith jayega — mahino tak. Function ka asli faayda \"kam likhna\" nahi hai. Asli faayda ye hai ki <b>badalne ki jagah sirf ek</b> ho." },
  { t: "think", q: "<code>print(x)</code> aur <code>return x</code> — dono value dikhate lagte hain. Farak kya hai?", a: "<code>print</code> value <b>screen pe dikhata</b> hai — aur baat khatam. <code>return</code> value <b>wapas deta</b> hai, taaki tum usse aage kaam kar sako.<br/><br/><code>total = add(3, 4)</code> tabhi chalega jab <code>add</code> <b>return</b> kare. Agar usme sirf <code>print</code> hota, to <code>total</code> me <code>None</code> aa jaata. Beginners ki sabse aam galti yahi hai — dikhta sahi hai, chalta nahi." },
  { t: "h2", n: "1", text: "Function banana" },
  { t: "def", term: "Function", en: "A function is a named, reusable block of code that takes inputs, performs a task, and optionally returns a value.", hi: "Jo values function <b>leta</b> hai wo <b>parameters</b>, aur jo tum bulate waqt <b>dete</b> ho wo <b>arguments</b>. <code>return</code> jawaab wapas bhejta hai — aur function wahin khatam ho jaata hai." },
  { t: "p", html: "Function = reusable code block. <code>def</code> se banate hain, <code>return</code> se jawaab wapas dete hain. Ek baar likho, baar-baar bulao." },
  { t: "code", file: "func.py", code: "def square(n):\n    return n * n\n\nprint(square(5))   # 25\nprint(square(9))   # 81", output: "25\n81" },
  { t: "h2", n: "2", text: "Parameters aur return" },
  { t: "p", html: "Function ko values do (parameters), wo kaam karke <code>return</code> se result deta hai. <code>print</code> aur <code>return</code> alag hain — return value aage use ho sakti hai." },
  { t: "code", file: "add.py", code: "def add(a, b):\n    return a + b\n\ntotal = add(3, 4)\nprint(total)   # 7", output: "7" },
  { t: "h2", n: "3", text: "Default arguments" },
  { t: "p", html: "Parameter ko default value do — agar nahi diya to wahi use hoga." },
  { t: "code", file: "default.py", code: "def greet(name=\"Guest\"):\n    return \"Hello, \" + name\n\nprint(greet())         # Hello, Guest\nprint(greet(\"Freya\"))   # Hello, Freya", output: "Hello, Guest\nHello, Freya" },
  { t: "note", variant: "tip", html: "<b>DRY principle:</b> Don't Repeat Yourself — same code baar-baar likhne ki jagah function bana lo." },
  { t: "analogy", concept: "Function", real: "Mixer grinder", html: "Masala <b>daalte</b> ho (arguments), button dabate ho (function call), paste <b>bahar aata</b> hai (return). Tumhe blade kaise ghoomte hain jaanne ki zaroorat nahi — bas kya daalna hai aur kya milega. Isko <b>abstraction</b> kehte hain, aur poori programming isi pe khadi hai." },
  { t: "mistakes", items: [
    { bad: "def add(a, b):\n    print(a + b)\n\ntotal = add(3, 4)   # total = None", why: "<code>print</code> sirf dikhata hai, <b>wapas nahi deta</b>. Bina <code>return</code> ke function chup-chaap <code>None</code> lautata hai. Screen pe 7 dikhega, par <code>total</code> me <code>None</code> hoga — aur error tab aayega jab <code>total</code> ko aage use karoge.", fix: "def add(a, b):\n    return a + b" },
    { bad: "def add_item(item, items=[]):\n    items.append(item)\n    return items", why: "<b>Python ka sabse mashhoor trap.</b> Default value function <b>ek hi baar</b> banti hai — har call me <b>wahi</b> list dobara istemaal hoti hai. Doosri call pe pichhle items abhi bhi andar milenge. Interview me ye poochha jaata hai.", fix: "def add_item(item, items=None):\n    if items is None:\n        items = []" },
    { bad: "def f():\n    return\n    print(\"hi\")", why: "<code>return</code> ke baad wala code <b>kabhi nahi</b> chalta — function wahin khatam ho jaata hai. Ise <b>dead code</b> kehte hain; Python warning bhi nahi deta.", fix: "def f():\n    print(\"hi\")\n    return" },
  ]},
  { t: "recap", items: ["def se function banao","return se result wapas do","print ≠ return","Default args: def f(x=value)"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>print</code> aur <code>return</code> me kya farak hai?", a: "<code>print</code> screen pe <b>dikhata</b> hai — insaan ke liye. <code>return</code> value <b>caller ko wapas</b> deta hai — code ke liye. Bina return ke function <code>None</code> lautata hai, isliye <code>total = add(3,4)</code> me <code>None</code> aa jayega." },
    { level: "beginner", q: "Parameter aur argument me kya farak hai?", a: "<b>Parameter</b> = definition me likha naam (<code>def add(a, b)</code> me <code>a</code>, <code>b</code>). <b>Argument</b> = call karte waqt di gayi asli value (<code>add(3, 4)</code> me <code>3</code>, <code>4</code>). Parameter dabba hai, argument usme rakhi cheez." },
    { level: "intermediate", q: "<code>def f(items=[])</code> me kya problem hai?", a: "Default value <b>function define hote waqt ek hi baar</b> banti hai, har call pe nahi. Matlab saari calls <b>ek hi list</b> share karengi — pichhli call ka data agli me dikhega. Mutable default (list/dict/set) ke liye hamesha <code>None</code> use karo aur andar bana lo." },
    { level: "intermediate", q: "<code>*args</code> aur <code>**kwargs</code> kya hain?", a: "<code>*args</code> extra <b>positional</b> arguments ko <b>tuple</b> me bhar leta hai; <code>**kwargs</code> extra <b>keyword</b> arguments ko <b>dict</b> me. Jab pata na ho kitne arguments aayenge tab kaam aate hain — decorators aur wrapper functions inhi pe chalte hain." },
  ]},
];

const L8 = [
  { t: "objectives", items: ["String methods use karna (upper, lower, strip, replace)","Slicing se tukde nikaalna","split se list banana"] },
  { t: "h2", n: "1", text: "String methods" },
  { t: "p", html: "Strings pe kaam ke methods: <code>.upper()</code>, <code>.lower()</code>, <code>.strip()</code> (extra space hatao), <code>.replace(a, b)</code>." },
  { t: "code", file: "strings.py", code: "name = \"  Freya  \"\nprint(name.strip())              # Freya\nprint(\"hello\".upper())           # HELLO\nprint(\"a-b-c\".replace(\"-\", \" \"))  # a b c", output: "Freya\nHELLO\na b c" },
  { t: "h2", n: "2", text: "Slicing aur split" },
  { t: "p", html: "<code>s[a:b]</code> se tukda lo (index a se b-1 tak). <code>.split()</code> string ko list me todta hai." },
  { t: "code", file: "slice.py", code: "s = \"datascience\"\nprint(s[0:4])            # data\nprint(s[-7:])            # science\nprint(\"a,b,c\".split(\",\"))  # ['a', 'b', 'c']", output: "data\nscience\n['a', 'b', 'c']" },
  { t: "note", variant: "tip", html: "<b>Yaad rakho:</b> Strings <b>immutable</b> hain — badalti nahi. Method hamesha naya string return karta hai." },
  { t: "recap", items: ["upper / lower / strip / replace common methods","s[a:b] se slicing","split() se list banao","strings immutable hoti hain"] },
];

const L9 = [
  { t: "objectives", items: ["List comprehension se short loop likhna","Condition (if) se filter karna","Clean code banana"] },
  { t: "h2", n: "1", text: "List comprehension" },
  { t: "p", html: "Ek line me list banana — loop ka short form: <code>[expression for item in list]</code>." },
  { t: "code", file: "comp.py", code: "nums = [1, 2, 3, 4]\nsquares = [n * n for n in nums]\nprint(squares)   # [1, 4, 9, 16]", output: "[1, 4, 9, 16]" },
  { t: "h2", n: "2", text: "Condition ke saath" },
  { t: "p", html: "<code>if</code> laga ke filter karo: <code>[x for x in list if condition]</code>." },
  { t: "code", file: "compif.py", code: "nums = [1, 2, 3, 4, 5, 6]\nevens = [x for x in nums if x % 2 == 0]\nprint(evens)   # [2, 4, 6]", output: "[2, 4, 6]" },
  { t: "note", variant: "tip", html: "<b>Kyun:</b> 3 line ka loop ek clean line me. Par bahut complex ho to normal loop hi behtar." },
  { t: "recap", items: ["[expr for x in list] — short loop","[x for x in list if cond] — filter","Clean & fast","Complex ho to normal loop use karo"] },
];

const L10 = [
  { t: "objectives", items: ["Class aur object samajhna","__init__ se data set karna","Method banana"] },
  { t: "h2", n: "1", text: "Class kya hai?" },
  { t: "p", html: "Class ek <b>blueprint</b> hai (jaise 'Car' ka design), object us blueprint se bani asli cheez (ek car). <code>class</code> se banate hain." },
  { t: "code", file: "class.py", code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return self.name + \" says woof!\"\n\nd = Dog(\"Bruno\")\nprint(d.bark())   # Bruno says woof!", output: "Bruno says woof!" },
  { t: "h2", n: "2", text: "__init__ aur self" },
  { t: "p", html: "<code>__init__</code> object banate waqt chalta hai (data set karta hai). <code>self</code> = wahi object, khud ko refer karta hai." },
  { t: "note", variant: "tip", html: "<b>Real use:</b> ML models, data structures — sab classes hote hain. OOP data science ka bada part hai." },
  { t: "recap", items: ["class = blueprint, object = usse bani cheez","__init__ data set karta hai","self = object khud","method = class ke andar function"] },
];

const L11 = [
  { t: "objectives", items: ["try / except se errors handle karna","Program crash hone se bachana","Common errors pehchanna"] },
  { t: "h2", n: "1", text: "try aur except" },
  { t: "p", html: "Jo code fail ho sakta hai use <code>try</code> me daalo, aur error aane pe kya karna hai wo <code>except</code> me." },
  { t: "code", file: "try.py", code: "try:\n    x = int(\"abc\")\nexcept ValueError:\n    x = 0\nprint(x)   # 0 (crash nahi hua)", output: "0" },
  { t: "h2", n: "2", text: "Kyun zaroori hai" },
  { t: "p", html: "User galat input de, ya file na mile — bina handle kiye program crash ho jaata hai. try/except usse rokta hai." },
  { t: "note", variant: "warn", html: "<b>Common errors:</b> ValueError (galat convert), ZeroDivisionError (0 se bhaag), KeyError (dict me key nahi)." },
  { t: "recap", items: ["try me risky code","except me error handle","Crash rukta hai","ValueError, ZeroDivisionError, KeyError common"] },
];

const L12 = [
  { t: "objectives", items: ["File open, read, write ka concept","with statement kyun","DS me files ka role"] },
  { t: "h2", n: "1", text: "File padhna aur likhna" },
  { t: "p", html: "<code>open()</code> se file kholte hain. <code>with</code> use karo — ye file apne aap band kar deta hai." },
  { t: "code", file: "file.py", code: "# likhna\nwith open(\"data.txt\", \"w\") as f:\n    f.write(\"Hello\")\n\n# padhna\nwith open(\"data.txt\", \"r\") as f:\n    print(f.read())   # Hello", output: "Hello" },
  { t: "note", variant: "tip", html: "<b>Data science me:</b> CSV, JSON files padhna roz ka kaam hai. Aage Pandas isi ko aasaan bana deta hai." },
  { t: "note", variant: "warn", html: "<b>Note:</b> File practice apne computer pe (VS Code) karo — browser me files save nahi hote. Yahan sirf concept samjho." },
  { t: "recap", items: ["open() se file kholo","with ... as f: safe tarika","'r' read, 'w' write","DS me CSV/JSON padhna aayega"] },
];

const L13 = [
  { t: "objectives", items: ["Module import karna","pip se package install karna","Virtual environment ka concept"] },
  { t: "h2", n: "1", text: "import — ready code use karo" },
  { t: "p", html: "Doosron ka likha code use karne ke liye <code>import</code>. Python me hazaaron ready modules hain." },
  { t: "code", file: "import.py", code: "import math\nprint(math.sqrt(16))   # 4.0\nprint(round(math.pi, 2))  # 3.14", output: "4.0\n3.14" },
  { t: "h2", n: "2", text: "pip aur virtual environment" },
  { t: "p", html: "<code>pip install pandas</code> se koi bhi package install karo. <b>venv</b> har project ke packages alag rakhta hai." },
  { t: "note", variant: "tip", html: "<b>DS ke liye:</b> pandas, numpy, matplotlib, scikit-learn — sab pip se aate hain, aur tumhare aage ke tracks me use honge." },
  { t: "recap", items: ["import se module use karo","pip install se package lao","venv project packages alag rakhta hai","DS libraries pip se aati hain"] },
];

const L14 = [
  { t: "objectives", items: ["int, float, complex samajhna","abs, round, pow use karna","math module ke functions"] },
  { t: "h2", n: "1", text: "Number types" },
  { t: "p", html: "Python me 3 number types: <b>int</b> (poore), <b>float</b> (decimal), <b>complex</b> (a+bj — DS me kam). Bade numbers me underscore bhi chalega: <code>1_000_000</code>." },
  { t: "code", file: "numbers.py", code: "print(abs(-7))          # 7\nprint(round(3.567, 1))  # 3.6\nprint(pow(2, 5))        # 32", output: "7\n3.6\n32" },
  { t: "h2", n: "2", text: "math module" },
  { t: "p", html: "<code>import math</code> se aur functions: <code>sqrt</code>, <code>ceil</code> (upar round), <code>floor</code> (neeche round), <code>pi</code>." },
  { t: "code", file: "math.py", code: "import math\nprint(math.sqrt(16))    # 4.0\nprint(math.ceil(4.1))   # 5\nprint(math.floor(4.9))  # 4", output: "4.0\n5\n4" },
  { t: "note", variant: "tip", html: "<b>random</b> module se random numbers: <code>random.randint(1, 6)</code> — dice roll jaisa." },
  { t: "recap", items: ["int, float, complex","abs / round / pow built-in","math: sqrt, ceil, floor, pi","random for random numbers"] },
];
const L15 = [
  { t: "objectives", items: ["f-strings se dynamic strings","Numbers format karna (decimals, comma)","Escape characters"] },
  { t: "h2", n: "1", text: "f-strings — sabse aasaan tarika" },
  { t: "p", html: "String ke aage <code>f</code> lagao aur <code>{}</code> me variable daalo. Ye modern Python ka standard hai." },
  { t: "code", file: "fstring.py", code: "name = \"Freya\"\nage = 21\nprint(f\"{name} is {age} years old\")\nprint(f\"Next year: {age + 1}\")", output: "Freya is 21 years old\nNext year: 22" },
  { t: "h2", n: "2", text: "Numbers ko format karna" },
  { t: "p", html: "<code>{value:.2f}</code> se 2 decimal tak, <code>{value:,}</code> se comma (1,000)." },
  { t: "code", file: "fmt.py", code: "pi = 3.14159\nprint(f\"{pi:.2f}\")      # 3.14\nprint(f\"{1000000:,}\")  # 1,000,000", output: "3.14\n1,000,000" },
  { t: "note", variant: "tip", html: "<b>Escape:</b> <code>\\n</code> nayi line, <code>\\t</code> tab. Reports/output me kaam aate hain." },
  { t: "recap", items: ["f\"{var}\" — dynamic strings","{x:.2f} — 2 decimals","{x:,} — comma separator","\\n newline, \\t tab"] },
];
const L16 = [
  { t: "objectives", items: ["True/False samajhna","Comparisons se bool banana","Truthy/falsy values"] },
  { t: "h2", n: "1", text: "Boolean values" },
  { t: "p", html: "Sirf do value: <code>True</code> aur <code>False</code>. Har comparison ek bool deta hai." },
  { t: "code", file: "bool.py", code: "print(10 > 5)        # True\nprint(bool(0))       # False\nprint(bool(\"hi\"))    # True", output: "True\nFalse\nTrue" },
  { t: "h2", n: "2", text: "Truthy aur Falsy" },
  { t: "p", html: "Kuch values automatically <b>False</b> maani jaati hain: <code>0</code>, <code>\"\"</code> (empty), <code>[]</code>, <code>None</code>. Baaki sab <b>True</b>." },
  { t: "note", variant: "tip", html: "<b>if me direct:</b> <code>if my_list:</code> ka matlab 'agar list khaali nahi hai'." },
  { t: "recap", items: ["True / False only","Comparison bool deta hai","0, \"\", [], None = falsy","Baaki sab truthy"] },
];
const L17 = [
  { t: "objectives", items: ["Lambda (one-line function) banana","map/sorted ke saath use","Kab use karein"] },
  { t: "h2", n: "1", text: "Lambda kya hai?" },
  { t: "p", html: "Lambda ek chhota anonymous function hai — ek line me. <code>lambda arguments: expression</code>." },
  { t: "code", file: "lambda.py", code: "double = lambda x: x * 2\nprint(double(5))   # 10\n\nadd = lambda a, b: a + b\nprint(add(3, 4))   # 7", output: "10\n7" },
  { t: "h2", n: "2", text: "map aur sorted ke saath" },
  { t: "p", html: "Lambda sabse zyada <code>map()</code>, <code>filter()</code>, <code>sorted(key=...)</code> ke saath use hota hai." },
  { t: "code", file: "lambdause.py", code: "nums = [1, 2, 3]\nsquares = list(map(lambda x: x * x, nums))\nprint(squares)   # [1, 4, 9]", output: "[1, 4, 9]" },
  { t: "note", variant: "tip", html: "<b>DS me:</b> Pandas me <code>df.apply(lambda ...)</code> har row/column pe function lagane ke liye bahut use hota hai." },
  { t: "recap", items: ["lambda args: expression","One-line anonymous function","map/filter/sorted ke saath","Pandas apply me common"] },
];
const L18 = [
  { t: "objectives", items: ["Local vs global variable","Function ke andar/bahar ka farak","global keyword"] },
  { t: "h2", n: "1", text: "Local aur Global" },
  { t: "p", html: "Function ke <b>andar</b> banaya variable sirf wahin kaam karta hai (local). Bahar wala poore program me (global)." },
  { t: "code", file: "scope.py", code: "x = 10            # global\n\ndef show():\n    y = 5         # local\n    print(x + y)  # 15\n\nshow()\n# print(y)  # error! y bahar nahi milta", output: "15" },
  { t: "note", variant: "warn", html: "<b>global keyword:</b> function ke andar global variable badalna ho to pehle <code>global x</code> likhna padta hai." },
  { t: "recap", items: ["Local = function ke andar","Global = bahar, sab jagah","Local bahar nahi milta","Badalne ko 'global x'"] },
];
const L19 = [
  { t: "objectives", items: ["JSON kya hai","String se Python object (loads)","Python se JSON string (dumps)"] },
  { t: "h2", n: "1", text: "JSON — data ka common format" },
  { t: "p", html: "JSON web APIs aur files me data bhejne ka standard format hai — dict jaisa dikhta hai. <code>import json</code>." },
  { t: "code", file: "json1.py", code: "import json\ntext = '{\"name\": \"Freya\", \"age\": 21}'\ndata = json.loads(text)   # string -> dict\nprint(data[\"name\"])       # Freya", output: "Freya" },
  { t: "h2", n: "2", text: "dumps — wapas string me" },
  { t: "code", file: "json2.py", code: "import json\nuser = {\"city\": \"Delhi\", \"active\": True}\nprint(json.dumps(user))", output: '{"city": "Delhi", "active": true}' },
  { t: "note", variant: "tip", html: "<b>DS me:</b> APIs se data aksar JSON me aata hai — <code>json.loads</code> se Python me lao, phir Pandas me daalo." },
  { t: "recap", items: ["JSON = data ka standard format","json.loads: string -> dict","json.dumps: dict -> string","APIs JSON me data dete hain"] },
];
const L20 = [
  { t: "objectives", items: ["datetime module","Aaj ki date nikaalna","Date formatting (strftime)"] },
  { t: "h2", n: "1", text: "Dates ke saath kaam" },
  { t: "p", html: "<code>datetime</code> module se dates handle karo — DS me time-series, logs, filtering me zaroori." },
  { t: "code", file: "date.py", code: "from datetime import datetime\nnow = datetime.now()\nprint(now.year)                  # 2026\nprint(now.strftime(\"%d-%m-%Y\"))  # 16-07-2026", output: "2026\n16-07-2026" },
  { t: "note", variant: "tip", html: "<b>strftime</b> se date apni marzi ke format me: <code>%d</code> din, <code>%m</code> mahina, <code>%Y</code> saal." },
  { t: "recap", items: ["datetime module","datetime.now() = abhi","strftime se format","DS time-series me zaroori"] },
];

const L21 = [
  { t: "objectives", items: ["Membership (in / not in) operators","Identity (is / is not)","Bitwise operators ki jhalak"] },
  { t: "h2", n: "1", text: "Membership — in / not in" },
  { t: "p", html: "<code>in</code> check karta hai koi value list/string me hai ya nahi — jawaab bool. <code>not in</code> ulta." },
  { t: "code", file: "member.py", code: "nums = [1, 2, 3]\nprint(2 in nums)        # True\nprint(5 not in nums)    # True\nprint(\"a\" in \"cat\")     # True", output: "True\nTrue\nTrue" },
  { t: "h2", n: "2", text: "Identity aur Bitwise" },
  { t: "p", html: "<code>is</code> check karta hai do naam <b>same object</b> hain ya nahi (value nahi). <b>Bitwise</b> operators bits pe kaam karte hain: <code>&amp;</code> and, <code>|</code> or, <code>^</code> xor." },
  { t: "code", file: "identity.py", code: "print(6 & 3)   # 2  (bitwise and)\nprint(6 | 3)   # 7  (bitwise or)\nx = None\nprint(x is None)  # True", output: "2\n7\nTrue" },
  { t: "note", variant: "tip", html: "<b>Yaad rakho:</b> value compare karne ko <code>==</code>, object identity ke liye <code>is</code>. <code>None</code> hamesha <code>is None</code> se check karo." },
  { t: "recap", items: ["in / not in — membership","is / is not — same object?","& | ^ — bitwise","None check: 'is None'"] },
];
const L22 = [
  { t: "objectives", items: ["match-case (Python ka switch)","Multiple cases handle karna","Default case (_)"] },
  { t: "h2", n: "1", text: "match-case" },
  { t: "p", html: "Bahut saari <code>if-elif</code> ki jagah <code>match-case</code> (Python 3.10+) saaf tarika hai. Ek value ko alag-alag cases se match karo." },
  { t: "code", file: "match.py", code: "day = \"Sun\"\nmatch day:\n    case \"Sat\" | \"Sun\":\n        print(\"weekend\")\n    case _:\n        print(\"weekday\")", output: "weekend" },
  { t: "note", variant: "tip", html: "<code>case _:</code> default hai (jaise else). <code>|</code> se ek case me kai values." },
  { t: "recap", items: ["match-case = clean switch","case value: … match pe chalta hai","| se multiple values","case _: default"] },
];
const L23 = [
  { t: "objectives", items: ["*args se koi bhi ginti ke arguments","**kwargs se named arguments","Recursion (function khud ko call kare)"] },
  { t: "h2", n: "1", text: "*args aur **kwargs" },
  { t: "p", html: "<code>*args</code> se function koi bhi ginti ke positional arguments le sakta hai (tuple ban jaate hain). <code>**kwargs</code> named arguments (dict) leta hai." },
  { t: "code", file: "args.py", code: "def total(*args):\n    return sum(args)\n\nprint(total(1, 2, 3))      # 6\nprint(total(10, 20))       # 30", output: "6\n30" },
  { t: "h2", n: "2", text: "Recursion" },
  { t: "p", html: "Recursion = function khud ko call karta hai, ek chhoti problem tak. Har recursion me ek <b>base case</b> zaroori hai (warna infinite)." },
  { t: "code", file: "rec.py", code: "def factorial(n):\n    if n <= 1:       # base case\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))   # 120", output: "120" },
  { t: "note", variant: "warn", html: "<b>Base case bhoolo mat:</b> recursion kabhi na kabhi rukni chahiye, warna 'RecursionError' aata hai." },
  { t: "recap", items: ["*args — kitne bhi positional","**kwargs — named (dict)","Recursion = khud ko call","Base case zaroori"] },
];
const L24 = [
  { t: "objectives", items: ["Inheritance — ek class doosri se","Parent aur child class","Method override karna"] },
  { t: "h2", n: "1", text: "Inheritance kya hai?" },
  { t: "p", html: "Ek class (child) doosri class (parent) ki saari properties aur methods le leti hai. Code dobara likhne ki zaroorat nahi — reuse!" },
  { t: "code", file: "inherit.py", code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"some sound\"\n\nclass Dog(Animal):        # Dog inherits Animal\n    def speak(self):      # override\n        return self.name + \" says woof\"\n\nprint(Dog(\"Bruno\").speak())   # Bruno says woof", output: "Bruno says woof" },
  { t: "note", variant: "tip", html: "<b>super():</b> parent ka method call karne ke liye <code>super().__init__()</code> use hota hai." },
  { t: "recap", items: ["class Child(Parent) — inherit","Child ko parent ke methods milte hain","Same method dobara likho = override","super() se parent call karo"] },
];
const L25 = [
  { t: "objectives", items: ["Encapsulation — data chhupana","Private variables (__)","Polymorphism — same naam, alag kaam"] },
  { t: "h2", n: "1", text: "Encapsulation" },
  { t: "p", html: "Class ke data ko bahar se seedha chhoo na paye — usse <b>private</b> banate hain (naam ke aage <code>__</code>). Access sirf methods se." },
  { t: "code", file: "encap.py", code: "class Account:\n    def __init__(self):\n        self.__balance = 0        # private\n    def deposit(self, amt):\n        self.__balance += amt\n    def balance(self):\n        return self.__balance\n\na = Account(); a.deposit(100)\nprint(a.balance())   # 100", output: "100" },
  { t: "h2", n: "2", text: "Polymorphism" },
  { t: "p", html: "Ek hi function/operator alag types pe alag kaam kare. Jaise <code>len()</code> string aur list dono pe chalta hai, <code>+</code> numbers jodta hai par strings ko jodta (concatenate) hai." },
  { t: "note", variant: "tip", html: "<b>DS me:</b> Pandas objects bhi Python ke standard methods (len, +, []) ko override karke apni tarah kaam karwate hain — yahi polymorphism hai." },
  { t: "recap", items: ["Encapsulation = data chhupao (__)","Private access sirf methods se","Polymorphism = same naam, alag behavior","len / + type ke hisaab se badalte hain"] },
];
const L26 = [
  { t: "objectives", items: ["Instance vs class variables","Static & class methods","Magic (dunder) methods"] },
  { t: "h2", n: "1", text: "Static aur Class methods" },
  { t: "p", html: "<code>@staticmethod</code> ko object ki zaroorat nahi (utility function). <code>@classmethod</code> ko class milti hai (<code>cls</code>)." },
  { t: "code", file: "static.py", code: "class Math:\n    @staticmethod\n    def add(a, b):\n        return a + b\n\nprint(Math.add(3, 4))   # 7  (object banaye bina)", output: "7" },
  { t: "h2", n: "2", text: "Dunder (magic) methods" },
  { t: "p", html: "Double-underscore methods jo Python automatically call karta hai: <code>__init__</code> (banate waqt), <code>__str__</code> (print pe), <code>__len__</code> (len() pe)." },
  { t: "code", file: "dunder.py", code: "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        return len(self.members)\n\nprint(len(Team([\"a\", \"b\", \"c\"])))   # 3", output: "3" },
  { t: "note", variant: "tip", html: "<b>__str__</b> define karo to <code>print(obj)</code> sundar output dega — debugging me bahut kaam ka." },
  { t: "recap", items: ["@staticmethod — object ki zaroorat nahi","@classmethod — cls milta hai","Dunder: __init__, __str__, __len__","Python inhe auto call karta hai"] },
];
const L27 = [
  { t: "objectives", items: ["Iterator vs iterable","Generator (yield) banana","Memory kyun bachti hai"] },
  { t: "h2", n: "1", text: "Iterables aur Iterators" },
  { t: "p", html: "<b>Iterable</b> = jispe loop chal sake (list, string). <b>Iterator</b> = ek-ek karke value deta hai (<code>next()</code> se). <code>for</code> loop andar iterator hi use karta hai." },
  { t: "code", file: "iter.py", code: "it = iter([10, 20, 30])\nprint(next(it))   # 10\nprint(next(it))   # 20", output: "10\n20" },
  { t: "h2", n: "2", text: "Generators — yield" },
  { t: "p", html: "Generator function <code>yield</code> se ek-ek value 'produce' karta hai, poori list banaye bina. Bade data pe <b>memory bachaata</b> hai." },
  { t: "code", file: "gen.py", code: "def squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\nprint(list(squares(4)))   # [1, 4, 9, 16]", output: "[1, 4, 9, 16]" },
  { t: "note", variant: "tip", html: "<b>DS me:</b> lakhon rows ek saath memory me nahi aati — generators/chunks se process hoti hain. Isliye ye important hai." },
  { t: "recap", items: ["Iterable = loop-able (list, str)","Iterator = next() se value","Generator = yield, lazy","Bade data pe memory bachata"] },
];
const L28 = [
  { t: "objectives", items: ["Closure samajhna","Decorator kya hai","Kahan use hota hai"] },
  { t: "h2", n: "1", text: "Closures" },
  { t: "p", html: "Ek function jo doosre function ke andar bana ho aur bahar wale ki variable 'yaad' rakhe — usse closure kehte hain." },
  { t: "code", file: "closure.py", code: "def multiplier(n):\n    def multiply(x):\n        return x * n     # n yaad rehta hai\n    return multiply\n\ndouble = multiplier(2)\nprint(double(5))   # 10", output: "10" },
  { t: "h2", n: "2", text: "Decorators" },
  { t: "p", html: "Decorator ek function ko 'wrap' karke uske aage/peeche extra kaam jodta hai, bina uska code badle. <code>@decorator</code> se lagate hain." },
  { t: "code", file: "dec.py", code: "def shout(func):\n    def wrapper(name):\n        return func(name).upper()\n    return wrapper\n\n@shout\ndef greet(name):\n    return \"hi \" + name\n\nprint(greet(\"freya\"))   # HI FREYA", output: "HI FREYA" },
  { t: "note", variant: "tip", html: "<b>Real use:</b> logging, timing, access-control — sab decorators se saaf tarike se jodte hain (Flask/FastAPI me bahut)." },
  { t: "recap", items: ["Closure = inner fn variable yaad rakhe","Decorator = function ko wrap kare","@decorator syntax","Logging/timing me common"] },
];
const L29 = [
  { t: "objectives", items: ["RegEx kya hai","re.findall / re.search","Common patterns (\\d, \\w)"] },
  { t: "h2", n: "1", text: "Regular Expressions" },
  { t: "p", html: "RegEx text me pattern dhoondhne/nikaalne ka powerful tool hai — data cleaning me bahut kaam aata hai. <code>import re</code>." },
  { t: "code", file: "re1.py", code: "import re\ntext = \"Order 123, bill 456\"\nprint(re.findall(r\"\\d+\", text))   # ['123', '456']", output: "['123', '456']" },
  { t: "h2", n: "2", text: "Common patterns" },
  { t: "p", html: "<code>\\d</code> = digit, <code>\\w</code> = letter/number, <code>+</code> = ek ya zyada, <code>.</code> = koi bhi char. <code>re.search</code> pehla match deta hai." },
  { t: "code", file: "re2.py", code: "import re\nprint(bool(re.search(r\"\\d\", \"abc7\")))  # True (digit hai)\nprint(bool(re.search(r\"\\d\", \"abc\")))   # False", output: "True\nFalse" },
  { t: "note", variant: "tip", html: "<b>DS me:</b> phone numbers, emails, dates text me se nikaalne ke liye RegEx best hai." },
  { t: "recap", items: ["re module — pattern matching","findall = saare matches (list)","search = pehla match","\\d digit, \\w word, + one-or-more"] },
];

const L30 = [
  { t: "objectives", items: ["Concurrency — ek saath kai kaam","Threading vs Multiprocessing","GIL ka concept"] },
  { t: "h2", n: "1", text: "Ek saath kai kaam kyun?" },
  { t: "p", html: "Normally code ek-ek line chalta hai. Par jab kai kaam saath karne ho (jaise 100 websites se data laana), tab <b>concurrency</b> time bacha deti hai — warna ek-ek karke ghanton lagta." },
  { t: "code", file: "thread.py", code: "import threading\n\ndef task(name):\n    print(f\"{name} chal raha hai\")\n\nt = threading.Thread(target=task, args=(\"A\",))\nt.start()\nt.join()", output: "A chal raha hai" },
  { t: "h2", n: "2", text: "Threading vs Multiprocessing" },
  { t: "p", html: "<b>Threading</b> — I/O kaam (files, network) ke liye. <b>Multiprocessing</b> — heavy CPU calculation ke liye (kai cores use karta hai). Python ka <b>GIL</b> ek time pe ek hi thread ko Python code chalane deta hai." },
  { t: "note", variant: "tip", html: "<b>Kahan atkoge iske bina:</b> web scraping, kai APIs se data, bade files — sab bahut slow honge aur pata nahi chalega kaise fast karein." },
  { t: "note", variant: "warn", html: "<b>Note:</b> ye browser me nahi chalega — VS Code me try karo. Yahan concept clear karo." },
  { t: "recap", items: ["Concurrency = kai kaam saath","Threading = I/O ke liye","Multiprocessing = CPU-heavy ke liye","GIL: ek time ek thread"] },
];
const L31 = [
  { t: "objectives", items: ["async / await samajhna","Coroutine kya hai","Kab async use karein"] },
  { t: "h2", n: "1", text: "async aur await" },
  { t: "p", html: "<code>async def</code> se ek 'coroutine' banta hai — ye kaam ke beech me ruk ke doosra kaam kar sakta hai (jaise network response ka wait karte hue). <code>await</code> ruk ke result leta hai." },
  { t: "code", file: "async.py", code: "import asyncio\n\nasync def greet():\n    await asyncio.sleep(1)\n    return \"done\"\n\nprint(asyncio.run(greet()))   # done", output: "done" },
  { t: "h2", n: "2", text: "Kyun useful hai" },
  { t: "p", html: "Jab program zyaadatar 'wait' karta hai (API, database), async us wait ke time me doosre kaam karwa leta hai — bina extra threads ke. Modern web (FastAPI) me bahut use hota hai." },
  { t: "note", variant: "tip", html: "<b>Simple rule:</b> bahut I/O (network/DB) wait ho to async; bahut calculation ho to multiprocessing." },
  { t: "recap", items: ["async def = coroutine","await = result ka wait","I/O-heavy kaam ke liye best","FastAPI/modern web me common"] },
];
const L32 = [
  { t: "objectives", items: ["Counter se frequency","itertools se smart looping","functools.reduce"] },
  { t: "h2", n: "1", text: "collections — Counter" },
  { t: "p", html: "<code>Counter</code> list me har item kitni baar aaya turant gin deta hai — data analysis me bahut kaam ka (jaise sabse common value dhoondhna)." },
  { t: "code", file: "counter.py", code: "from collections import Counter\nvotes = [\"a\", \"b\", \"a\", \"c\", \"a\"]\nc = Counter(votes)\nprint(c[\"a\"])            # 3\nprint(c.most_common(1))  # [('a', 3)]", output: "3\n[('a', 3)]" },
  { t: "h2", n: "2", text: "itertools aur functools" },
  { t: "p", html: "<code>itertools.accumulate</code> running total deta hai. <code>functools.reduce</code> poori list ko ek value me samet deta hai." },
  { t: "code", file: "tools.py", code: "from itertools import accumulate\nfrom functools import reduce\nprint(list(accumulate([1, 2, 3, 4])))        # [1, 3, 6, 10]\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]))  # 24", output: "[1, 3, 6, 10]\n24" },
  { t: "note", variant: "tip", html: "<b>DS me:</b> Counter (frequency), accumulate (cumulative sum), reduce (aggregate) — real data tasks me roz use hote hain." },
  { t: "recap", items: ["Counter = frequency count","most_common(n) = top n","accumulate = running total","reduce = list -> ek value"] },
];
const L33 = [
  { t: "objectives", items: ["os module — files/folders","pathlib se safe paths","sys module basics"] },
  { t: "h2", n: "1", text: "os aur pathlib" },
  { t: "p", html: "<code>os</code> aur <code>pathlib</code> se files/folders ke saath kaam: list karna, check karna, paths banana. DS me datasets load karne me kaam aata hai." },
  { t: "code", file: "os1.py", code: "import os\nfrom pathlib import Path\nprint(os.path.exists(\"data.csv\"))     # True/False\nprint(Path(\"data\") / \"file.csv\")      # data/file.csv", output: "False\ndata/file.csv" },
  { t: "h2", n: "2", text: "sys module" },
  { t: "p", html: "<code>sys</code> Python aur system ki info deta hai — command-line arguments, version, exit karna." },
  { t: "note", variant: "tip", html: "<b>Kahan atkoge iske bina:</b> 'file not found' errors, ya Windows/Mac me paths tootna. <code>pathlib</code> se paths dono pe chalte hain." },
  { t: "note", variant: "warn", html: "<b>Note:</b> file system wala kaam VS Code me practice karo." },
  { t: "recap", items: ["os = files/folders operations","pathlib = safe cross-platform paths","sys = system/Python info","Path() / se paths jodo"] },
];
const L34 = [
  { t: "objectives", items: ["CSV files (Excel jaisa data)","pickle se objects save","sqlite3 — built-in database"] },
  { t: "h2", n: "1", text: "CSV — sabse common data format" },
  { t: "p", html: "CSV (comma-separated) files me tabular data hota hai — Excel jaisa. DS me 90% datasets CSV me hi aate hain." },
  { t: "code", file: "csv1.py", code: "import csv\nwith open(\"data.csv\", \"w\", newline=\"\") as f:\n    w = csv.writer(f)\n    w.writerow([\"name\", \"age\"])\n    w.writerow([\"Freya\", 21])", output: "# data.csv ban gayi" },
  { t: "h2", n: "2", text: "pickle aur sqlite3" },
  { t: "p", html: "<code>pickle</code> Python objects ko file me save/load karta hai. <code>sqlite3</code> ek chhota built-in database — bina server ke SQL chalta hai." },
  { t: "note", variant: "tip", html: "<b>Aage:</b> CSV padhne ka aasaan tarika Pandas hai (<code>pd.read_csv</code>) — tumhare Pandas track me. Ye base samajh lo." },
  { t: "note", variant: "warn", html: "<b>Note:</b> file/database wala kaam VS Code me practice karo." },
  { t: "recap", items: ["CSV = tabular data (Excel jaisa)","csv.writer / csv.reader","pickle = Python object save","sqlite3 = built-in local DB"] },
];
const L35 = [
  { t: "objectives", items: ["Testing kyun zaroori","assert se basic test","unittest / pytest ka idea"] },
  { t: "h2", n: "1", text: "Code test kyun karein" },
  { t: "p", html: "Bade code me ek jagah change doosri jagah tod sakta hai. <b>Tests</b> automatically check karte hain sab sahi chal raha hai — bugs jaldi pakde jaate hain." },
  { t: "code", file: "assert.py", code: "def add(a, b):\n    return a + b\n\nassert add(2, 3) == 5      # sahi to kuch nahi\nassert add(0, 0) == 0\nprint(\"saare tests pass!\")", output: "saare tests pass!" },
  { t: "h2", n: "2", text: "unittest aur pytest" },
  { t: "p", html: "<code>unittest</code> Python ka built-in testing framework hai, <code>pytest</code> popular external tool — dono functions ko automatically test karte hain. Companies me testing standard practice hai." },
  { t: "note", variant: "tip", html: "<b>Interview me:</b> 'tests likhte ho?' — achhe engineers ki nishaani. Basic pata hona zaroori hai." },
  { t: "recap", items: ["Tests = auto bug-catching","assert se basic check","unittest = built-in","pytest = popular external tool"] },
];
const L36 = [
  { t: "objectives", items: ["Debugging ka tarika","print vs logging","Errors sahi se padhna"] },
  { t: "h2", n: "1", text: "Debugging" },
  { t: "p", html: "Jab code galat chale, <b>debugging</b> se problem dhoondhte hain. Simple: <code>print()</code> laga ke values dekho. VS Code me 'breakpoints' se line-by-line bhi chala sakte ho." },
  { t: "h2", n: "2", text: "Logging — print se behtar" },
  { t: "p", html: "Bade programs me print ki jagah <code>logging</code> — levels (info, warning, error) ke saath messages, aur production me on/off ho sakta hai." },
  { t: "code", file: "log.py", code: "import logging\nlogging.basicConfig(level=logging.INFO)\nlogging.info(\"Data load ho gaya\")\nlogging.warning(\"Kuch values missing hain\")", output: "INFO:root:Data load ho gaya\nWARNING:root:Kuch values missing hain" },
  { t: "note", variant: "tip", html: "<b>Sabse kaam ki tip:</b> error traceback ki <b>last line</b> asli problem batati hai — usse Google karo, 90% jawaab mil jaata hai." },
  { t: "recap", items: ["Debugging = problem dhoondhna","print() sabse simple","logging = levels, production-ready","Error ki last line padho"] },
];
const L37 = [
  { t: "objectives", items: ["PEP 8 style guide","Docstrings likhna","Type hints"] },
  { t: "h2", n: "1", text: "PEP 8 — Python ka style guide" },
  { t: "p", html: "PEP 8 code likhne ka official standard hai: 4-space indent, meaningful naam (snake_case), lines chhoti. Saaf code padhna aur maintain karna aasaan hota hai." },
  { t: "h2", n: "2", text: "Docstrings aur Type Hints" },
  { t: "p", html: "<b>Docstring</b> = function ke andar <code>\"\"\"...\"\"\"</code> me explanation. <b>Type hints</b> batate hain kaunsa type expected hai — bugs kam, editor better help deta hai." },
  { t: "code", file: "clean.py", code: "def repeat(text: str, n: int) -> str:\n    \"\"\"text ko n baar repeat karta hai.\"\"\"\n    return text * n\n\nprint(repeat(\"ab\", 3))   # ababab", output: "ababab" },
  { t: "note", variant: "tip", html: "<b>Interview me farak:</b> saaf, documented, type-hinted code turant 'professional' impression deta hai — resume projects me zaroor use karo." },
  { t: "recap", items: ["PEP 8 = official style guide","snake_case, 4-space indent","Docstring = function ki explanation","Type hints = types batao, bugs kam"] },
];
const L38 = [
  { t: "objectives", items: ["Project ka structure","Git — version control","GitHub — code + portfolio"] },
  { t: "h2", n: "1", text: "Project structure" },
  { t: "p", html: "Bade project ko folders me organize karo: code alag, data alag, <code>requirements.txt</code> me packages. Saaf structure se doosre (aur future tum) code samajh paate hain." },
  { t: "h2", n: "2", text: "Git aur GitHub" },
  { t: "p", html: "<b>Git</b> code ke versions save karta hai — kuch toota to peeche ja sakte ho. <b>GitHub</b> pe code online rakhte hain — ye tumhara <b>portfolio</b> ban jaata hai jo recruiters dekhte hain." },
  { t: "code", file: "git.sh", code: "git init                       # git shuru\ngit add .                      # files add\ngit commit -m \"first version\"  # save\ngit push                       # GitHub pe bhejo", output: "# code GitHub pe live" },
  { t: "note", variant: "tip", html: "<b>Sabse zaroori job-tip:</b> apne DS projects GitHub pe daalo. 'GitHub link' resume ka sabse strong part hai — ye tumhara asli proof hai." },
  { t: "recap", items: ["Project = organized folders","requirements.txt = packages list","Git = version control (undo)","GitHub = online code + portfolio"] },
];

/* ------------------------------------------------------------------ */
/* Lessons + their problems                                            */
/* ------------------------------------------------------------------ */
const pythonLessons = [
  { slug: "variables-data-types", order: 1, title: "Variables & Data Types", minutes: 12, content: L1, problems: [
    P(1, "marks-total", "Marks Total", "add_marks",
      "Ek student ke do subjects ke marks tumhe **string** me diye hain (jaise `\"85\"`). Ek function `add_marks(a, b)` banao jo dono ko **int** me convert kare aur **total** return kare.",
      [{ input: 'a="85", b="5"', output: "90" }, { input: 'a="40", b="60"', output: "100" }],
      "def add_marks(a, b):\n    # convert strings to int, return total\n    pass\n",
      "def add_marks(a, b):\n    return int(a) + int(b)\n",
      [{ args: ["85","5"], expected: 90 }, { args: ["40","60"], expected: 100 }, { args: ["0","0"], expected: 0 }],
      ["String ko number banane ke liye int() use hota hai.", "Dono ko convert karke + se jodo.", 'Seedhe a + b karoge to "855" ban jayega, galat!'],
      ["variables","type casting"]),
    P(2, "make-greeting", "Make a Greeting", "greet",
      "Ek function `greet(name)` banao jo `Hello, <name>!` return kare. Jaise `greet(\"Freya\")` → `Hello, Freya!`.",
      [{ input: 'name="Freya"', output: '"Hello, Freya!"' }, { input: 'name="Cappy"', output: '"Hello, Cappy!"' }],
      "def greet(name):\n    # return  Hello, <name>!\n    pass\n",
      'def greet(name):\n    return f"Hello, {name}!"\n',
      [{ args: ["Freya"], expected: "Hello, Freya!" }, { args: ["Cappy"], expected: "Hello, Cappy!" }, { args: ["Jugendra"], expected: "Hello, Jugendra!" }],
      ["Strings ko + se jod sakte ho.", 'f-string sabse aasaan: f"Hello, {name}!"'],
      ["strings","variables"]),
    P(3, "rectangle-area", "Rectangle Area", "area",
      "Ek function `area(length, width)` banao jo rectangle ka area (length × width) return kare.",
      [{ input: "length=5, width=3", output: "15" }, { input: "length=10, width=2", output: "20" }],
      "def area(length, width):\n    pass\n",
      "def area(length, width):\n    return length * width\n",
      [{ args: [5,3], expected: 15 }, { args: [10,2], expected: 20 }, { args: [7,7], expected: 49 }],
      ["Multiplication ka operator * hai.", "return length * width"],
      ["variables","int"]) ]},

  { slug: "operators", order: 2, title: "Operators & Expressions", minutes: 10, content: L2, problems: [
    P(1, "add-two", "Add Two Numbers", "add_two",
      "Ek function `add_two(a, b)` banao jo dono numbers ka sum return kare.",
      [{ input: "a=3, b=4", output: "7" }, { input: "a=10, b=-2", output: "8" }],
      "def add_two(a, b):\n    pass\n", "def add_two(a, b):\n    return a + b\n",
      [{ args: [3,4], expected: 7 }, { args: [10,-2], expected: 8 }, { args: [0,0], expected: 0 }],
      ["+ operator use karo.", "return a + b"], ["arithmetic"]),
    P(2, "is-even", "Even or Odd", "is_even",
      "Ek function `is_even(n)` banao jo `True` return kare agar n even hai, warna `False`. **Hint:** even matlab 2 se poora divide (remainder 0).",
      [{ input: "n=4", output: "True" }, { input: "n=7", output: "False" }],
      "def is_even(n):\n    pass\n", "def is_even(n):\n    return n % 2 == 0\n",
      [{ args: [4], expected: true }, { args: [7], expected: false }, { args: [0], expected: true }],
      ["Remainder ke liye % use hota hai.", "n % 2 == 0 hone pe even hai."], ["modulo","comparison"]),
    P(3, "power-of", "Power Of", "power_of",
      "Ek function `power_of(base, exp)` banao jo base ki power exp return kare (base^exp).",
      [{ input: "base=2, exp=3", output: "8" }, { input: "base=5, exp=2", output: "25" }],
      "def power_of(base, exp):\n    pass\n", "def power_of(base, exp):\n    return base ** exp\n",
      [{ args: [2,3], expected: 8 }, { args: [5,2], expected: 25 }, { args: [10,0], expected: 1 }],
      ["Power ka operator ** hai.", "return base ** exp"], ["power"]) ]},

  { slug: "conditionals", order: 3, title: "Conditionals (if / else)", minutes: 11, content: L3, problems: [
    P(1, "grade", "Grade Calculator", "grade",
      "Ek function `grade(marks)` banao jo return kare: `\"A\"` (>=90), `\"B\"` (>=75), `\"C\"` (>=40), warna `\"Fail\"`.",
      [{ input: "marks=95", output: '"A"' }, { input: "marks=50", output: '"C"' }],
      "def grade(marks):\n    pass\n",
      'def grade(marks):\n    if marks >= 90:\n        return "A"\n    elif marks >= 75:\n        return "B"\n    elif marks >= 40:\n        return "C"\n    else:\n        return "Fail"\n',
      [{ args: [95], expected: "A" }, { args: [80], expected: "B" }, { args: [50], expected: "C" }, { args: [30], expected: "Fail" }],
      ["if / elif / else use karo.", "Sabse badi condition pehle check karo (>=90)."], ["conditionals"]),
    P(2, "bigger", "Bigger Number", "bigger",
      "Ek function `bigger(a, b)` banao jo dono me se bada number return kare (barabar ho to koi ek).",
      [{ input: "a=3, b=9", output: "9" }, { input: "a=10, b=2", output: "10" }],
      "def bigger(a, b):\n    pass\n", "def bigger(a, b):\n    if a >= b:\n        return a\n    return b\n",
      [{ args: [3,9], expected: 9 }, { args: [10,2], expected: 10 }, { args: [5,5], expected: 5 }],
      ["if a > b to a return karo.", "Warna b return karo."], ["conditionals","comparison"]),
    P(3, "sign", "Positive, Negative, Zero", "sign",
      "Ek function `sign(n)` banao jo `\"positive\"`, `\"negative\"`, ya `\"zero\"` return kare.",
      [{ input: "n=5", output: '"positive"' }, { input: "n=-3", output: '"negative"' }],
      "def sign(n):\n    pass\n",
      'def sign(n):\n    if n > 0:\n        return "positive"\n    elif n < 0:\n        return "negative"\n    else:\n        return "zero"\n',
      [{ args: [5], expected: "positive" }, { args: [-3], expected: "negative" }, { args: [0], expected: "zero" }],
      ["Teen cases: >0, <0, aur baaki (0).", "if / elif / else."], ["conditionals"]) ]},

  { slug: "loops", order: 4, title: "Loops (for / while)", minutes: 12, content: L4, problems: [
    P(1, "sum-to-n", "Sum 1 to N", "sum_to_n",
      "Ek function `sum_to_n(n)` banao jo `1 + 2 + ... + n` ka total return kare.",
      [{ input: "n=5", output: "15" }, { input: "n=10", output: "55" }],
      "def sum_to_n(n):\n    pass\n", "def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n",
      [{ args: [5], expected: 15 }, { args: [1], expected: 1 }, { args: [10], expected: 55 }],
      ["range(1, n+1) 1 se n tak deta hai.", "Ek total variable me jodte jao."], ["loops","range"]),
    P(2, "count-vowels", "Count Vowels", "count_vowels",
      "Ek function `count_vowels(s)` banao jo string me vowels (a, e, i, o, u) ki ginti return kare.",
      [{ input: 's="hello"', output: "2" }, { input: 's="aeiou"', output: "5" }],
      "def count_vowels(s):\n    pass\n", "def count_vowels(s):\n    count = 0\n    for c in s.lower():\n        if c in \"aeiou\":\n            count += 1\n    return count\n",
      [{ args: ["hello"], expected: 2 }, { args: ["sky"], expected: 0 }, { args: ["aeiou"], expected: 5 }],
      ["String ke har char pe loop chalao.", 'if c in "aeiou" se check karo.'], ["loops","strings"]),
    P(3, "factorial", "Factorial", "factorial",
      "Ek function `factorial(n)` banao jo n! return kare (`5! = 5×4×3×2×1 = 120`). `factorial(0)` = 1.",
      [{ input: "n=5", output: "120" }, { input: "n=3", output: "6" }],
      "def factorial(n):\n    pass\n", "def factorial(n):\n    r = 1\n    for i in range(1, n + 1):\n        r *= i\n    return r\n",
      [{ args: [5], expected: 120 }, { args: [0], expected: 1 }, { args: [3], expected: 6 }],
      ["r = 1 se shuru karo, loop me multiply karo.", "range(1, n+1)."], ["loops"]) ]},

  { slug: "lists-tuples", order: 5, title: "Lists & Tuples", minutes: 13, content: L5, problems: [
    P(1, "list-sum", "List Sum", "list_sum",
      "Ek function `list_sum(nums)` banao jo list ke saare numbers ka total return kare.",
      [{ input: "nums=[1,2,3]", output: "6" }, { input: "nums=[10]", output: "10" }],
      "def list_sum(nums):\n    pass\n", "def list_sum(nums):\n    return sum(nums)\n",
      [{ args: [[1,2,3]], expected: 6 }, { args: [[10]], expected: 10 }, { args: [[]], expected: 0 }],
      ["Python me built-in sum() hota hai.", "return sum(nums)"], ["lists"]),
    P(2, "get-max", "Largest in List", "get_max",
      "Ek function `get_max(nums)` banao jo list ka sabse bada number return kare.",
      [{ input: "nums=[3,9,2]", output: "9" }, { input: "nums=[-1,-5]", output: "-1" }],
      "def get_max(nums):\n    pass\n", "def get_max(nums):\n    return max(nums)\n",
      [{ args: [[3,9,2]], expected: 9 }, { args: [[5]], expected: 5 }, { args: [[-1,-5]], expected: -1 }],
      ["Built-in max() try karo.", "return max(nums)"], ["lists"]),
    P(3, "reverse-list", "Reverse a List", "reverse_list",
      "Ek function `reverse_list(lst)` banao jo list ko ulta karke return kare.",
      [{ input: "lst=[1,2,3]", output: "[3,2,1]" }, { input: 'lst=["a","b"]', output: '["b","a"]' }],
      "def reverse_list(lst):\n    pass\n", "def reverse_list(lst):\n    return lst[::-1]\n",
      [{ args: [[1,2,3]], expected: [3,2,1] }, { args: [["a","b"]], expected: ["b","a"] }, { args: [[7]], expected: [7] }],
      ["Slicing trick: lst[::-1] list ulta kar deta hai.", "Ya reversed() + list()."], ["lists","slicing"]) ]},

  { slug: "dicts-sets", order: 6, title: "Dictionaries & Sets", minutes: 12, content: L6, problems: [
    P(1, "get-value", "Get Value by Key", "get_value",
      "Ek function `get_value(d, key)` banao jo dict `d` me se `key` ki value return kare.",
      [{ input: 'd={"a":1,"b":2}, key="b"', output: "2" }],
      "def get_value(d, key):\n    pass\n", "def get_value(d, key):\n    return d[key]\n",
      [{ args: [{ a: 1, b: 2 }, "b"], expected: 2 }, { args: [{ x: 10 }, "x"], expected: 10 }],
      ["Dict se value: d[key].", "return d[key]"], ["dict"]),
    P(2, "count-unique", "Count Unique", "count_unique",
      "Ek function `count_unique(lst)` banao jo list me kitne **alag** (unique) items hain wo return kare.",
      [{ input: "lst=[1,2,2,3]", output: "3" }, { input: "lst=[5,5,5]", output: "1" }],
      "def count_unique(lst):\n    pass\n", "def count_unique(lst):\n    return len(set(lst))\n",
      [{ args: [[1,2,2,3]], expected: 3 }, { args: [[5,5,5]], expected: 1 }, { args: [[]], expected: 0 }],
      ["set() duplicates hata deta hai.", "len(set(lst))."], ["set"]),
    P(3, "has-key", "Has Key?", "has_key",
      "Ek function `has_key(d, key)` banao jo `True`/`False` return kare ki `key` dict me hai ya nahi.",
      [{ input: 'd={"a":1}, key="a"', output: "True" }, { input: 'd={"a":1}, key="z"', output: "False" }],
      "def has_key(d, key):\n    pass\n", "def has_key(d, key):\n    return key in d\n",
      [{ args: [{ a: 1 }, "a"], expected: true }, { args: [{ a: 1 }, "z"], expected: false }],
      ["'in' operator check karta hai.", "return key in d"], ["dict"]) ]},

  { slug: "functions", order: 7, title: "Functions", minutes: 14, content: L7, problems: [
    P(1, "square", "Square a Number", "square",
      "Ek function `square(n)` banao jo n ka square (n × n) return kare.",
      [{ input: "n=5", output: "25" }, { input: "n=-3", output: "9" }],
      "def square(n):\n    pass\n", "def square(n):\n    return n * n\n",
      [{ args: [5], expected: 25 }, { args: [0], expected: 0 }, { args: [-3], expected: 9 }],
      ["n ko khud se multiply karo.", "return n * n"], ["functions"]),
    P(2, "final-price", "Apply Discount", "final_price",
      "Ek function `final_price(price, pct)` banao jo `pct`% discount ke baad ki keemat return kare.",
      [{ input: "price=100, pct=10", output: "90" }, { input: "price=200, pct=50", output: "100" }],
      "def final_price(price, pct):\n    pass\n", "def final_price(price, pct):\n    return price - price * pct / 100\n",
      [{ args: [100,10], expected: 90 }, { args: [200,50], expected: 100 }, { args: [50,0], expected: 50 }],
      ["Discount = price * pct / 100.", "Final = price - discount."], ["functions"]),
    P(3, "to-fahrenheit", "Celsius to Fahrenheit", "to_fahrenheit",
      "Ek function `to_fahrenheit(c)` banao jo Celsius ko Fahrenheit me badle. Formula: `c * 9/5 + 32`.",
      [{ input: "c=0", output: "32" }, { input: "c=100", output: "212" }],
      "def to_fahrenheit(c):\n    pass\n", "def to_fahrenheit(c):\n    return c * 9 / 5 + 32\n",
      [{ args: [0], expected: 32 }, { args: [100], expected: 212 }, { args: [37], expected: 98.6 }],
      ["Formula seedha lagao: c * 9/5 + 32.", "BODMAS ka dhyaan — * aur / pehle."], ["functions","math"]) ]},

  { slug: "strings", order: 8, title: "String Methods & Slicing", minutes: 12, content: L8, problems: [
    P(1, "reverse-string", "Reverse a String", "reverse_string",
      "Ek function `reverse_string(s)` banao jo string ko ulta karke return kare.",
      [{ input: 's="abc"', output: '"cba"' }, { input: 's="hello"', output: '"olleh"' }],
      "def reverse_string(s):\n    pass\n", "def reverse_string(s):\n    return s[::-1]\n",
      [{ args: ["abc"], expected: "cba" }, { args: ["hello"], expected: "olleh" }, { args: ["a"], expected: "a" }],
      ["Slicing trick: s[::-1].", "Ye string bhi ulta kar deta hai."], ["strings","slicing"]),
    P(2, "shout", "Shout It", "shout",
      "Ek function `shout(s)` banao jo string ko UPPERCASE me karke `!` laga de.",
      [{ input: 's="hi"', output: '"HI!"' }, { input: 's="data"', output: '"DATA!"' }],
      "def shout(s):\n    pass\n", 'def shout(s):\n    return s.upper() + "!"\n',
      [{ args: ["hi"], expected: "HI!" }, { args: ["data"], expected: "DATA!" }, { args: ["ok"], expected: "OK!" }],
      [".upper() uppercase karta hai.", 'Phir + "!" jodo.'], ["strings"]),
    P(3, "count-char", "Count a Character", "count_char",
      "Ek function `count_char(s, ch)` banao jo `s` me `ch` kitni baar aata hai wo return kare.",
      [{ input: 's="banana", ch="a"', output: "3" }, { input: 's="hello", ch="l"', output: "2" }],
      "def count_char(s, ch):\n    pass\n", "def count_char(s, ch):\n    return s.count(ch)\n",
      [{ args: ["banana", "a"], expected: 3 }, { args: ["hello", "l"], expected: 2 }, { args: ["abc", "z"], expected: 0 }],
      ["String me built-in .count() hota hai.", "return s.count(ch)"], ["strings"]) ]},

  { slug: "comprehensions", order: 9, title: "List Comprehensions", minutes: 11, content: L9, problems: [
    P(1, "squares", "List of Squares", "squares",
      "Ek function `squares(n)` banao jo `[1², 2², ..., n²]` list return kare. Comprehension use karo.",
      [{ input: "n=3", output: "[1, 4, 9]" }, { input: "n=4", output: "[1, 4, 9, 16]" }],
      "def squares(n):\n    pass\n", "def squares(n):\n    return [i * i for i in range(1, n + 1)]\n",
      [{ args: [3], expected: [1,4,9] }, { args: [1], expected: [1] }, { args: [4], expected: [1,4,9,16] }],
      ["[i*i for i in range(1, n+1)].", "range(1, n+1) 1 se n tak."], ["comprehension"]),
    P(2, "evens", "Only Evens", "evens",
      "Ek function `evens(nums)` banao jo list me se sirf even numbers ki nayi list return kare.",
      [{ input: "nums=[1,2,3,4]", output: "[2, 4]" }, { input: "nums=[1,3,5]", output: "[]" }],
      "def evens(nums):\n    pass\n", "def evens(nums):\n    return [x for x in nums if x % 2 == 0]\n",
      [{ args: [[1,2,3,4]], expected: [2,4] }, { args: [[1,3,5]], expected: [] }, { args: [[2,4,6]], expected: [2,4,6] }],
      ["[x for x in nums if x % 2 == 0].", "if se filter hota hai."], ["comprehension"]),
    P(3, "word-lengths", "Word Lengths", "word_lengths",
      "Ek function `word_lengths(words)` banao jo har word ki length ki list return kare.",
      [{ input: 'words=["hi","bye"]', output: "[2, 3]" }, { input: 'words=["a"]', output: "[1]" }],
      "def word_lengths(words):\n    pass\n", "def word_lengths(words):\n    return [len(w) for w in words]\n",
      [{ args: [["hi","bye"]], expected: [2,3] }, { args: [["a"]], expected: [1] }, { args: [[]], expected: [] }],
      ["[len(w) for w in words].", "len() se length milti hai."], ["comprehension"]) ]},

  { slug: "oop", order: 10, title: "Classes & Objects (OOP)", minutes: 15, content: L10, problems: [
    P(1, "circle-area", "Circle Area (OOP)", "circle_area",
      "`Circle` class me `area()` method poora karo — area = `3 × r × r` (pi ko 3 maan lo). `circle_area(r)` uska area deta hai.",
      [{ input: "r=2", output: "12" }, { input: "r=3", output: "27" }],
      "class Circle:\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        # return 3 * r * r  (self.r use karo)\n        pass\n\ndef circle_area(r):\n    return Circle(r).area()\n",
      "class Circle:\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3 * self.r * self.r\n\ndef circle_area(r):\n    return Circle(r).area()\n",
      [{ args: [2], expected: 12 }, { args: [3], expected: 27 }, { args: [1], expected: 3 }],
      ["self.r se radius milega.", "return 3 * self.r * self.r"], ["oop","class"]),
    P(2, "dog-sound", "Dog Sound (OOP)", "dog_sound",
      "`Dog` class ka `bark()` method poora karo jo `<name> woof` return kare. `dog_sound(name)` use call karta hai.",
      [{ input: 'name="Bruno"', output: '"Bruno woof"' }],
      "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        # return name + \" woof\"\n        pass\n\ndef dog_sound(name):\n    return Dog(name).bark()\n",
      'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return self.name + " woof"\n\ndef dog_sound(name):\n    return Dog(name).bark()\n',
      [{ args: ["Bruno"], expected: "Bruno woof" }, { args: ["Tommy"], expected: "Tommy woof" }],
      ["self.name se naam milega.", 'return self.name + " woof"'], ["oop","class"]) ]},

  { slug: "error-handling", order: 11, title: "Error Handling (try / except)", minutes: 11, content: L11, problems: [
    P(1, "safe-divide", "Safe Divide", "safe_divide",
      "Ek function `safe_divide(a, b)` banao jo `a / b` return kare, par agar `b` zero hai to `0` return kare (try/except).",
      [{ input: "a=10, b=2", output: "5" }, { input: "a=5, b=0", output: "0" }],
      "def safe_divide(a, b):\n    pass\n", "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return 0\n",
      [{ args: [10,2], expected: 5 }, { args: [5,0], expected: 0 }, { args: [9,3], expected: 3 }],
      ["try me a / b likho.", "except ZeroDivisionError: return 0"], ["error-handling"]),
    P(2, "to-int-safe", "Safe to Int", "to_int_safe",
      "Ek function `to_int_safe(s)` banao jo string ko int me badle, par galat ho to `0` return kare.",
      [{ input: 's="42"', output: "42" }, { input: 's="abc"', output: "0" }],
      "def to_int_safe(s):\n    pass\n", "def to_int_safe(s):\n    try:\n        return int(s)\n    except ValueError:\n        return 0\n",
      [{ args: ["42"], expected: 42 }, { args: ["abc"], expected: 0 }, { args: ["7"], expected: 7 }],
      ["try me int(s).", "except ValueError: return 0"], ["error-handling"]) ]},

  { slug: "file-handling", order: 12, title: "File Handling", minutes: 9, content: L12, problems: [] },

  { slug: "modules", order: 13, title: "Modules, pip & venv", minutes: 9, content: L13, problems: [] },

  { slug: "numbers-math", order: 14, title: "Numbers & the Math Module", minutes: 11, content: L14, problems: [
    P(1, "round-to", "Round a Number", "round_to",
      "Ek function `round_to(n, digits)` banao jo `n` ko `digits` decimal tak round kare.",
      [{ input: "n=3.14159, digits=2", output: "3.14" }, { input: "n=5.6789, digits=2", output: "5.68" }],
      "def round_to(n, digits):\n    pass\n", "def round_to(n, digits):\n    return round(n, digits)\n",
      [{ args: [3.14159, 2], expected: 3.14 }, { args: [5.6789, 2], expected: 5.68 }, { args: [2.4, 0], expected: 2 }],
      ["round(n, digits) built-in hai.", "return round(n, digits)"], ["numbers","math"]),
    P(2, "abs-diff", "Absolute Difference", "abs_diff",
      "Ek function `abs_diff(a, b)` banao jo `a` aur `b` ka farak (hamesha positive) return kare.",
      [{ input: "a=5, b=8", output: "3" }, { input: "a=10, b=3", output: "7" }],
      "def abs_diff(a, b):\n    pass\n", "def abs_diff(a, b):\n    return abs(a - b)\n",
      [{ args: [5, 8], expected: 3 }, { args: [10, 3], expected: 7 }, { args: [4, 4], expected: 0 }],
      ["abs() value ko positive bana deta hai.", "return abs(a - b)"], ["numbers","math"]) ]},

  { slug: "string-formatting", order: 15, title: "String Formatting & f-strings", minutes: 11, content: L15, problems: [
    P(1, "greet-age", "Greet with Age", "greet_age",
      "Ek function `greet_age(name, age)` banao jo `<name> is <age>` return kare. f-string use karo.",
      [{ input: 'name="Freya", age=21', output: '"Freya is 21"' }],
      "def greet_age(name, age):\n    pass\n", 'def greet_age(name, age):\n    return f"{name} is {age}"\n',
      [{ args: ["Freya", 21], expected: "Freya is 21" }, { args: ["Cappy", 3], expected: "Cappy is 3" }],
      ['f"{name} is {age}" use karo.', "f-string me variables {} me aate hain."], ["strings","format"]),
    P(2, "cost-line", "Cost Line", "cost_line",
      "Ek function `cost_line(item, price)` banao jo `<item> costs <price>` return kare.",
      [{ input: 'item="Pen", price=10', output: '"Pen costs 10"' }],
      "def cost_line(item, price):\n    pass\n", 'def cost_line(item, price):\n    return f"{item} costs {price}"\n',
      [{ args: ["Pen", 10], expected: "Pen costs 10" }, { args: ["Book", 250], expected: "Book costs 250" }],
      ['f"{item} costs {price}".', "Dono variables ek string me."], ["strings","format"]),
    P(3, "to-title", "Title Case", "to_title",
      "Ek function `to_title(s)` banao jo har word ka pehla letter capital kare.",
      [{ input: 's="hello world"', output: '"Hello World"' }],
      "def to_title(s):\n    pass\n", "def to_title(s):\n    return s.title()\n",
      [{ args: ["hello world"], expected: "Hello World" }, { args: ["data science"], expected: "Data Science" }],
      [".title() method use karo.", "return s.title()"], ["strings"]) ]},

  { slug: "booleans", order: 16, title: "Booleans & Truthiness", minutes: 10, content: L16, problems: [
    P(1, "is-adult", "Is Adult?", "is_adult",
      "Ek function `is_adult(age)` banao jo `True` return kare agar age 18 ya usse zyada hai.",
      [{ input: "age=18", output: "True" }, { input: "age=10", output: "False" }],
      "def is_adult(age):\n    pass\n", "def is_adult(age):\n    return age >= 18\n",
      [{ args: [18], expected: true }, { args: [10], expected: false }, { args: [25], expected: true }],
      ["Comparison bool deta hai.", "return age >= 18"], ["boolean"]),
    P(2, "is-empty", "Is Empty String?", "is_empty",
      "Ek function `is_empty(s)` banao jo `True` return kare agar string khaali hai.",
      [{ input: 's=""', output: "True" }, { input: 's="a"', output: "False" }],
      "def is_empty(s):\n    pass\n", "def is_empty(s):\n    return len(s) == 0\n",
      [{ args: [""], expected: true }, { args: ["a"], expected: false }, { args: ["hi"], expected: false }],
      ["len(s) length deta hai.", "len(s) == 0 hone pe khaali."], ["boolean","strings"]) ]},

  { slug: "lambda", order: 17, title: "Lambda Functions", minutes: 11, content: L17, problems: [
    P(1, "square-all", "Square All (map + lambda)", "square_all",
      "Ek function `square_all(nums)` banao jo har number ka square return kare. `map` + `lambda` use karo.",
      [{ input: "nums=[1,2,3]", output: "[1, 4, 9]" }, { input: "nums=[0,5]", output: "[0, 25]" }],
      "def square_all(nums):\n    pass\n", "def square_all(nums):\n    return list(map(lambda x: x * x, nums))\n",
      [{ args: [[1,2,3]], expected: [1,4,9] }, { args: [[0,5]], expected: [0,25] }, { args: [[]], expected: [] }],
      ["map(lambda x: x*x, nums).", "list() se wapas list banao."], ["lambda"]),
    P(2, "sort-by-length", "Sort by Length", "sort_by_length",
      "Ek function `sort_by_length(words)` banao jo words ko length ke hisaab se sort kare (chhoti se badi). `sorted` + `lambda` use karo.",
      [{ input: 'words=["bbb","a","cc"]', output: '["a", "cc", "bbb"]' }],
      "def sort_by_length(words):\n    pass\n", "def sort_by_length(words):\n    return sorted(words, key=lambda w: len(w))\n",
      [{ args: [["bbb","a","cc"]], expected: ["a","cc","bbb"] }, { args: [["hi","a"]], expected: ["a","hi"] }],
      ["sorted(words, key=lambda w: len(w)).", "key batata hai kis hisaab se sort karna."], ["lambda"]) ]},

  { slug: "scope", order: 18, title: "Variable Scope", minutes: 9, content: L18, problems: [] },

  { slug: "json", order: 19, title: "Working with JSON", minutes: 11, content: L19, problems: [
    P(1, "get-json-field", "Read a JSON Field", "get_json_field",
      "Ek function `get_json_field(text, key)` banao jo JSON string me se `key` ki value return kare.",
      [{ input: 'text=\'{"name":"Freya","age":21}\', key="age"', output: "21" }],
      "import json\n\ndef get_json_field(text, key):\n    pass\n", "import json\n\ndef get_json_field(text, key):\n    data = json.loads(text)\n    return data[key]\n",
      [{ args: ['{"name":"Freya","age":21}', "age"], expected: 21 }, { args: ['{"city":"Delhi"}', "city"], expected: "Delhi" }],
      ["json.loads(text) se string -> dict.", "Phir data[key]."], ["json"]) ]},

  { slug: "dates", order: 20, title: "Dates & Time", minutes: 9, content: L20, problems: [] },

  { slug: "more-operators", order: 21, title: "More Operators (Membership, Identity, Bitwise)", minutes: 10, content: L21, problems: [
    P(1, "is-member", "Is Member?", "is_member",
      "Ek function `is_member(item, items)` banao jo `True` return kare agar `item` list `items` me hai.",
      [{ input: "item=2, items=[1,2,3]", output: "True" }, { input: "item=5, items=[1,2]", output: "False" }],
      "def is_member(item, items):\n    pass\n", "def is_member(item, items):\n    return item in items\n",
      [{ args: [2, [1,2,3]], expected: true }, { args: [5, [1,2]], expected: false }, { args: ["a", ["a","b"]], expected: true }],
      ["'in' operator use karo.", "return item in items"], ["operators"]),
    P(2, "bitwise-and", "Bitwise AND", "bitwise_and",
      "Ek function `bitwise_and(a, b)` banao jo `a & b` (bitwise AND) return kare.",
      [{ input: "a=6, b=3", output: "2" }, { input: "a=12, b=10", output: "8" }],
      "def bitwise_and(a, b):\n    pass\n", "def bitwise_and(a, b):\n    return a & b\n",
      [{ args: [6, 3], expected: 2 }, { args: [12, 10], expected: 8 }, { args: [5, 5], expected: 5 }],
      ["& operator bitwise AND karta hai.", "return a & b"], ["operators","bitwise"]) ]},

  { slug: "match-case", order: 22, title: "Match-Case Statement", minutes: 9, content: L22, problems: [
    P(1, "day-type", "Weekend or Weekday", "day_type",
      "Ek function `day_type(day)` banao jo `\"weekend\"` return kare agar day `\"Sat\"` ya `\"Sun\"` hai, warna `\"weekday\"`. match-case use karo.",
      [{ input: 'day="Sat"', output: '"weekend"' }, { input: 'day="Mon"', output: '"weekday"' }],
      "def day_type(day):\n    pass\n", 'def day_type(day):\n    match day:\n        case "Sat" | "Sun":\n            return "weekend"\n        case _:\n            return "weekday"\n',
      [{ args: ["Sat"], expected: "weekend" }, { args: ["Sun"], expected: "weekend" }, { args: ["Mon"], expected: "weekday" }],
      ['case "Sat" | "Sun": weekend.', "case _: default (weekday)."], ["match"]) ]},

  { slug: "advanced-functions", order: 23, title: "Advanced Functions (*args, recursion)", minutes: 13, content: L23, problems: [
    P(1, "sum-all", "Sum All (*args)", "sum_all",
      "Ek function `sum_all(*args)` banao jo koi bhi ginti ke numbers ka total return kare.",
      [{ input: "1, 2, 3", output: "6" }, { input: "5, 10", output: "15" }],
      "def sum_all(*args):\n    pass\n", "def sum_all(*args):\n    return sum(args)\n",
      [{ args: [1,2,3], expected: 6 }, { args: [5,10], expected: 15 }, { args: [], expected: 0 }],
      ["*args saare arguments ko tuple banata hai.", "return sum(args)"], ["functions","args"]),
    P(2, "factorial-rec", "Recursive Factorial", "factorial_rec",
      "Ek function `factorial_rec(n)` banao jo **recursion** se n! nikaale. Base case: n <= 1 pe 1.",
      [{ input: "n=5", output: "120" }, { input: "n=0", output: "1" }],
      "def factorial_rec(n):\n    pass\n", "def factorial_rec(n):\n    if n <= 1:\n        return 1\n    return n * factorial_rec(n - 1)\n",
      [{ args: [5], expected: 120 }, { args: [0], expected: 1 }, { args: [4], expected: 24 }],
      ["Base case: if n <= 1: return 1.", "Warna n * factorial_rec(n-1)."], ["functions","recursion"]) ]},

  { slug: "inheritance", order: 24, title: "OOP: Inheritance", minutes: 13, content: L24, problems: [
    P(1, "cat-speak", "Inherit & Override", "cat_speak",
      "`Cat` class `Animal` se inherit karti hai. `speak()` ko override karo taaki wo `<name> says meow` return kare.",
      [{ input: 'name="Kitty"', output: '"Kitty says meow"' }],
      "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"some sound\"\n\nclass Cat(Animal):\n    def speak(self):\n        # return name + \" says meow\"\n        pass\n\ndef cat_speak(name):\n    return Cat(name).speak()\n",
      'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "some sound"\n\nclass Cat(Animal):\n    def speak(self):\n        return self.name + " says meow"\n\ndef cat_speak(name):\n    return Cat(name).speak()\n',
      [{ args: ["Kitty"], expected: "Kitty says meow" }, { args: ["Tom"], expected: "Tom says meow" }],
      ["self.name Animal se inherit hua hai.", 'return self.name + " says meow"'], ["oop","inheritance"]) ]},

  { slug: "encapsulation", order: 25, title: "OOP: Encapsulation & Polymorphism", minutes: 12, content: L25, problems: [
    P(1, "final-balance", "Bank Account (Encapsulation)", "final_balance",
      "`Account` class me `deposit()` method poora karo (private `__balance` me amount jodo). `final_balance(deposits)` saare deposits ke baad balance deta hai.",
      [{ input: "deposits=[100,50,25]", output: "175" }],
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        # self.__balance me amt jodo\n        pass\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        self.__balance += amt\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      [{ args: [[100,50,25]], expected: 175 }, { args: [[10]], expected: 10 }, { args: [[]], expected: 0 }],
      ["self.__balance += amt.", "Private variable methods se hi badalta hai."], ["oop","encapsulation"]) ]},

  { slug: "dunder-methods", order: 26, title: "OOP: Static & Dunder Methods", minutes: 12, content: L26, problems: [
    P(1, "team-size", "Team Size (__len__)", "team_size",
      "`Team` class ka `__len__` method poora karo taaki `len(team)` members ki ginti de. `team_size(members)` use call karta hai.",
      [{ input: 'members=["a","b","c"]', output: "3" }],
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        # members ki ginti return karo\n        pass\n\ndef team_size(members):\n    return len(Team(members))\n",
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        return len(self.members)\n\ndef team_size(members):\n    return len(Team(members))\n",
      [{ args: [["a","b","c"]], expected: 3 }, { args: [[]], expected: 0 }, { args: [["x"]], expected: 1 }],
      ["__len__ me return len(self.members).", "len(obj) automatically __len__ call karta hai."], ["oop","dunder"]) ]},

  { slug: "iterators-generators", order: 27, title: "Iterators & Generators", minutes: 13, content: L27, problems: [
    P(1, "first-squares", "Generator: First Squares", "first_squares",
      "Ek generator `gen_squares(n)` complete karo jo 1² se n² tak yield kare. `first_squares(n)` unki list deta hai.",
      [{ input: "n=3", output: "[1, 4, 9]" }, { input: "n=4", output: "[1, 4, 9, 16]" }],
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        # i ka square yield karo\n        pass\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      [{ args: [3], expected: [1,4,9] }, { args: [1], expected: [1] }, { args: [4], expected: [1,4,9,16] }],
      ["yield i * i loop ke andar.", "yield ek-ek value deta hai."], ["generators"]) ]},

  { slug: "decorators", order: 28, title: "Decorators & Closures", minutes: 12, content: L28, problems: [] },

  { slug: "regex", order: 29, title: "Regular Expressions (RegEx)", minutes: 12, content: L29, problems: [
    P(1, "find-numbers", "Find All Numbers", "find_numbers",
      "Ek function `find_numbers(text)` banao jo text me se saare numbers (as strings) ki list return kare. `re.findall` use karo.",
      [{ input: 'text="Order 123, bill 456"', output: '["123", "456"]' }],
      "import re\n\ndef find_numbers(text):\n    pass\n", "import re\n\ndef find_numbers(text):\n    return re.findall(r\"\\d+\", text)\n",
      [{ args: ["Order 123, bill 456"], expected: ["123","456"] }, { args: ["no numbers"], expected: [] }, { args: ["a1b2c3"], expected: ["1","2","3"] }],
      ['re.findall(r"\\d+", text).', "\\d+ = ek ya zyada digits."], ["regex"]),
    P(2, "has-digit", "Has a Digit?", "has_digit",
      "Ek function `has_digit(s)` banao jo `True` return kare agar string me koi digit hai. `re.search` use karo.",
      [{ input: 's="abc7"', output: "True" }, { input: 's="abc"', output: "False" }],
      "import re\n\ndef has_digit(s):\n    pass\n", "import re\n\ndef has_digit(s):\n    return bool(re.search(r\"\\d\", s))\n",
      [{ args: ["abc7"], expected: true }, { args: ["abc"], expected: false }, { args: ["12"], expected: true }],
      ['re.search(r"\\d", s) digit dhoondta hai.', "bool() se True/False."], ["regex"]) ]},

  { slug: "concurrency", order: 30, title: "Concurrency — Threads & Processes", minutes: 11, content: L30, problems: [] },
  { slug: "async", order: 31, title: "Async Programming (asyncio)", minutes: 11, content: L31, problems: [] },

  { slug: "collections-itertools", order: 32, title: "collections, itertools & functools", minutes: 13, content: L32, problems: [
    P(1, "top-item", "Most Common Item", "top_item",
      "Ek function `top_item(items)` banao jo list me sabse zyada baar aane wala item return kare. `Counter` use karo.",
      [{ input: 'items=["a","b","a"]', output: '"a"' }, { input: "items=[1,2,2,3,2]", output: "2" }],
      "from collections import Counter\n\ndef top_item(items):\n    pass\n", "from collections import Counter\n\ndef top_item(items):\n    return Counter(items).most_common(1)[0][0]\n",
      [{ args: [["a","b","a"]], expected: "a" }, { args: [[1,2,2,3,2]], expected: 2 }, { args: [["x"]], expected: "x" }],
      ["Counter(items).most_common(1) top item deta hai.", "[0][0] se sirf item nikaalo."], ["collections"]),
    P(2, "running-total", "Running Total", "running_total",
      "Ek function `running_total(nums)` banao jo cumulative (chalta) total ki list return kare. `itertools.accumulate` use karo.",
      [{ input: "nums=[1,2,3]", output: "[1, 3, 6]" }, { input: "nums=[1,1,1,1]", output: "[1, 2, 3, 4]" }],
      "from itertools import accumulate\n\ndef running_total(nums):\n    pass\n", "from itertools import accumulate\n\ndef running_total(nums):\n    return list(accumulate(nums))\n",
      [{ args: [[1,2,3]], expected: [1,3,6] }, { args: [[5]], expected: [5] }, { args: [[1,1,1,1]], expected: [1,2,3,4] }],
      ["accumulate(nums) running total deta hai.", "list() se list banao."], ["itertools"]),
    P(3, "product-of", "Product of List", "product_of",
      "Ek function `product_of(nums)` banao jo saare numbers ka guna (product) return kare. `functools.reduce` use karo.",
      [{ input: "nums=[1,2,3,4]", output: "24" }, { input: "nums=[2,3]", output: "6" }],
      "from functools import reduce\n\ndef product_of(nums):\n    pass\n", "from functools import reduce\n\ndef product_of(nums):\n    return reduce(lambda a, b: a * b, nums)\n",
      [{ args: [[1,2,3,4]], expected: 24 }, { args: [[5]], expected: 5 }, { args: [[2,3]], expected: 6 }],
      ["reduce(lambda a,b: a*b, nums).", "reduce list ko ek value me samet deta hai."], ["functools"]) ]},

  { slug: "system-modules", order: 33, title: "System Modules — os, sys, pathlib", minutes: 10, content: L33, problems: [] },
  { slug: "data-persistence", order: 34, title: "CSV, Pickle & SQLite", minutes: 11, content: L34, problems: [] },
  { slug: "testing", order: 35, title: "Testing — unittest & pytest", minutes: 11, content: L35, problems: [] },
  { slug: "debugging-logging", order: 36, title: "Debugging & Logging", minutes: 10, content: L36, problems: [] },

  { slug: "clean-code", order: 37, title: "Clean Code — PEP 8, Docstrings, Type Hints", minutes: 11, content: L37, problems: [
    P(1, "repeat-text", "Repeat with Type Hints", "repeat",
      "Ek function `repeat(text, n)` banao (type hints ke saath) jo `text` ko `n` baar repeat kare.",
      [{ input: 'text="ab", n=3', output: '"ababab"' }, { input: 'text="x", n=0', output: '""' }],
      "def repeat(text: str, n: int) -> str:\n    pass\n", "def repeat(text: str, n: int) -> str:\n    return text * n\n",
      [{ args: ["ab", 3], expected: "ababab" }, { args: ["x", 0], expected: "" }, { args: ["hi", 2], expected: "hihi" }],
      ["String ko number se multiply kar sakte ho: text * n.", 'text="x", n=0 pe khaali string.'], ["clean-code"]) ]},

  { slug: "project-git", order: 38, title: "Project Structure & Git Basics", minutes: 10, content: L38, problems: [] },
];

/* ===================== STATISTICS lessons ===================== */
const S1 = [
  { t: "objectives", items: ["Mean, median, mode nikaalna","Range samajhna","Kab kaunsa use karna"] },
  { t: "h2", n: "1", text: "Mean, Median, Mode" },
  { t: "p", html: "<b>Mean</b> = average (sab jodo ÷ ginti). <b>Median</b> = sort karke beech wala. <b>Mode</b> = sabse zyada baar aane wala." },
  { t: "code", file: "central.py", code: "nums = [4, 8, 6, 8, 10]\nprint(sum(nums) / len(nums))        # mean = 7.2\nprint(sorted(nums)[len(nums) // 2])  # median = 8", output: "7.2\n8" },
  { t: "viz", name: "central-tendency" },
  { t: "h2", n: "2", text: "Mean vs Median — kab kya" },
  { t: "p", html: "Agar data me <b>outlier</b> (bahut bada/chhota value) ho to mean galat picture deta hai — median tab behtar. Jaise salaries me ek CEO poore average ko upar kheench deta hai." },
  { t: "note", variant: "tip", html: "<b>Range</b> = max − min. Data kitna faila hua hai iska sabse simple maap." },
  { t: "recap", items: ["Mean = average","Median = beech wala (sort ke baad)","Mode = sabse zyada baar","Outlier ho to median behtar"] },
];
const S2 = [
  { t: "objectives", items: ["Variance samajhna","Standard deviation nikaalna","Spread kyun matter karta hai"] },
  { t: "h2", n: "1", text: "Data kitna faila hai?" },
  { t: "p", html: "Do classes ka average same ho sakta hai par ek me sab paas-paas, doosri me bikhre. Ye bikhraav <b>variance</b> aur <b>standard deviation</b> batate hain." },
  { t: "code", file: "spread.py", code: "nums = [2, 4, 6, 8]\nm = sum(nums) / len(nums)                 # mean = 5\nvar = sum((x - m) ** 2 for x in nums) / len(nums)\nprint(var)   # 5.0", output: "5.0" },
  { t: "h2", n: "2", text: "Standard deviation" },
  { t: "p", html: "Standard deviation = variance ka <b>square root</b>. Original unit me hota hai isliye samajhna aasaan." },
  { t: "code", file: "std.py", code: "import math\nprint(round(math.sqrt(5), 2))   # 2.24 (std dev)", output: "2.24" },
  { t: "note", variant: "tip", html: "<b>Low std</b> = data consistent (paas-paas). <b>High std</b> = bikhra hua. ML me bahut use hota hai." },
  { t: "recap", items: ["Variance = average squared distance from mean","Std dev = sqrt(variance)","Low std = consistent","High std = bikhra data"] },
];
const S3 = [
  { t: "objectives", items: ["Probability ka basic formula","0 se 1 ke beech samajhna","Complement nikaalna"] },
  { t: "h2", n: "1", text: "Probability kya hai?" },
  { t: "p", html: "Kisi cheez ke hone ki sambhavna. <b>Formula:</b> favorable ÷ total. Jawaab hamesha <b>0 (kabhi nahi) se 1 (pakka)</b> ke beech." },
  { t: "code", file: "prob.py", code: "# dice pe 6 aane ki probability\nfavorable = 1\ntotal = 6\nprint(favorable / total)   # 0.1666...", output: "0.16666666666666666" },
  { t: "h2", n: "2", text: "Complement — 'na hone' ki probability" },
  { t: "p", html: "Agar kisi cheez ki probability <code>p</code> hai, to us cheez ke <b>na hone</b> ki probability <code>1 − p</code> hoti hai." },
  { t: "code", file: "comp.py", code: "p_rain = 0.3\nprint(1 - p_rain)   # 0.7 (baarish na hone ki)", output: "0.7" },
  { t: "note", variant: "tip", html: "<b>DS me:</b> ML models 'probability' hi predict karte hain — jaise 'ye email 92% spam hai'." },
  { t: "recap", items: ["P = favorable / total","Hamesha 0 aur 1 ke beech","Complement = 1 − p","Models probability predict karte hain"] },
];
const S4 = [
  { t: "objectives", items: ["Normal distribution (bell curve) pehchanna","Z-score nikaalna","Outlier detect karna"] },
  { t: "h2", n: "1", text: "The Bell Curve" },
  { t: "p", html: "Real duniya ka bahut data 'ghanti' (bell) shape banata hai — height, marks, weight. Zyaadatar values beech (mean) ke paas, kam values kinaron pe." },
  { t: "viz", name: "bell-curve" },
  { t: "h2", n: "2", text: "Z-score — mean se kitna door" },
  { t: "p", html: "Z-score batata hai koi value mean se kitne 'standard deviation' door hai. <b>Formula:</b> (value − mean) ÷ std." },
  { t: "code", file: "zscore.py", code: "marks, mean, std = 85, 75, 5\nz = (marks - mean) / std\nprint(z)   # 2.0 (mean se 2 std upar — top!)", output: "2.0" },
  { t: "note", variant: "warn", html: "<b>Outlier rule:</b> agar |z| > 2 ho to value 'unusual' maani jaati hai. Data cleaning me kaam aata hai." },
  { t: "recap", items: ["Bell curve = zyada data beech me","z = (x − mean) / std","z bada = mean se door","|z| > 2 aksar outlier"] },
];

const S5 = [
  { t: "objectives", items: ["Percentile aur quartile","IQR (middle 50%)","Outlier detection (1.5×IQR rule)"] },
  { t: "h2", n: "1", text: "Percentiles aur Quartiles" },
  { t: "p", html: "<b>Percentile</b> batata hai kitna % data kisi value se neeche hai. <b>Quartiles</b> data ko 4 hisson me baantte hain: Q1 (25%), Q2 (50% = median), Q3 (75%)." },
  { t: "code", file: "quartile.py", code: "import statistics\ndata = [1, 2, 3, 4, 5, 6, 7, 8]\nprint(statistics.median(data))   # 4.5 (Q2)", output: "4.5" },
  { t: "h2", n: "2", text: "IQR aur Outliers" },
  { t: "p", html: "<b>IQR = Q3 − Q1</b> (middle 50% ka spread). Outlier rule: Q1 − 1.5×IQR se neeche ya Q3 + 1.5×IQR se upar = outlier. Data cleaning me bahut use hota hai." },
  { t: "note", variant: "tip", html: "<b>Box plot</b> IQR aur outliers ko visually dikhata hai — EDA me zaroor banega." },
  { t: "recap", items: ["Percentile = kitna % neeche","Q1/Q2/Q3 = 25/50/75%","IQR = Q3 − Q1","Outlier: 1.5×IQR rule"] },
];
const S6 = [
  { t: "objectives", items: ["Correlation (−1 se +1)","Covariance","Correlation ≠ Causation"] },
  { t: "h2", n: "1", text: "Correlation kya hai" },
  { t: "p", html: "Correlation do variables ka rishta batata hai: <b>+1</b> saath badhein, <b>−1</b> ulta chalein, <b>0</b> koi rishta nahi. DS me features ka relation samajhne ke liye zaroori." },
  { t: "viz", name: "scatter-correlation" },
  { t: "h2", n: "2", text: "Covariance" },
  { t: "p", html: "Covariance bhi rishta batata hai par uska scale fix nahi. Correlation = covariance ko standardize karke −1 se +1 me laaya hua — isliye compare karna aasaan." },
  { t: "note", variant: "warn", html: "<b>Sabse badi galti:</b> correlation ≠ causation. Do cheezein saath badhein iska matlab ek doosre ka kaaran nahi." },
  { t: "recap", items: ["Correlation: −1 se +1","+1 saath, −1 ulta, 0 koi nahi","Covariance = unscaled version","Correlation ≠ causation!"] },
];
const S7 = [
  { t: "objectives", items: ["Conditional probability","Bayes' theorem","Real use (spam, medical tests)"] },
  { t: "h2", n: "1", text: "Conditional Probability" },
  { t: "p", html: "<b>P(A | B)</b> = 'B ho chuka hai, ab A ki probability'. Jaise 'baarish ho rahi hai, to traffic jam ki probability'." },
  { t: "h2", n: "2", text: "Bayes' Theorem" },
  { t: "p", html: "Bayes formula naye evidence ke saath probability update karta hai: <b>P(A|B) = P(B|A) × P(A) / P(B)</b>. Spam filters, medical tests — sab isi pe based." },
  { t: "code", file: "bayes.py", code: "# P(disease | positive test)\np_disease = 0.01\np_pos_given_disease = 0.9\np_pos = 0.05\nprint(round(p_pos_given_disease * p_disease / p_pos, 2))  # 0.18", output: "0.18" },
  { t: "note", variant: "tip", html: "<b>Chaunkane wala:</b> 90% accurate test bhi, rare disease me positive aane pe sirf ~18% chance hoti hai actually bimari ki! Bayes yahi batata hai." },
  { t: "recap", items: ["P(A|B) = conditional probability","Bayes: P(B|A)×P(A)/P(B)","Naye evidence se update","Spam/medical me use"] },
];
const S8 = [
  { t: "objectives", items: ["Uniform, Binomial, Poisson","Kab kaunsa","Binomial probability"] },
  { t: "h2", n: "1", text: "Common distributions" },
  { t: "p", html: "<b>Uniform</b> — har outcome barabar (dice). <b>Binomial</b> — n baar try, har baar success/fail (coin flips). <b>Poisson</b> — ek time me kitni baar event (ghante me kitne calls)." },
  { t: "code", file: "binom.py", code: "import math\n# 2 coin flips me exactly 1 head\nn, k, p = 2, 1, 0.5\nprob = math.comb(n, k) * p**k * (1 - p)**(n - k)\nprint(prob)   # 0.5", output: "0.5" },
  { t: "h2", n: "2", text: "Kab kaunsa use karein" },
  { t: "p", html: "Yes/No wale repeated trials → Binomial. Rare events count → Poisson. Continuous data me aksar Normal (bell curve)." },
  { t: "note", variant: "tip", html: "<b>math.comb(n, k)</b> = n me se k chunne ke tarike (combinations) — binomial probability me kaam aata hai." },
  { t: "recap", items: ["Uniform = sab barabar","Binomial = success/fail trials","Poisson = event count","Normal = continuous bell curve"] },
];
const S9 = [
  { t: "objectives", items: ["Population vs Sample","Central Limit Theorem","Standard error"] },
  { t: "h2", n: "1", text: "Population aur Sample" },
  { t: "p", html: "Poore data ko <b>population</b> kehte hain, uska chhota hissa <b>sample</b>. Hum aksar sample se poori population ka andaaza lagate hain (poora data lena mushkil hota hai)." },
  { t: "h2", n: "2", text: "Central Limit Theorem (CLT)" },
  { t: "p", html: "CLT kehta hai: chahe original data kaisa bhi ho, agar kaafi samples ka <b>average</b> lo to wo averages normal (bell) distribution banate hain. Inference ki poori neev yahi hai." },
  { t: "code", file: "se.py", code: "import math\n# standard error = std / sqrt(n)\nstd, n = 10, 4\nprint(std / math.sqrt(n))   # 5.0", output: "5.0" },
  { t: "note", variant: "tip", html: "<b>Standard error</b> batata hai sample ka average population se kitna alag ho sakta hai. Bada sample = chhota error = zyada bharosa." },
  { t: "recap", items: ["Population = poora data","Sample = ek hissa","CLT: sample means normal hote hain","SE = std / √n"] },
];
const S10 = [
  { t: "objectives", items: ["Null vs Alternative hypothesis","p-value ka matlab","z-test statistic"] },
  { t: "h2", n: "1", text: "Hypothesis testing" },
  { t: "p", html: "Kisi claim ko data se test karte hain. <b>Null hypothesis (H₀)</b> = 'koi farak nahi'. <b>Alternative (H₁)</b> = 'farak hai'. Data dekh ke decide karte hain kaunsi maano." },
  { t: "h2", n: "2", text: "p-value" },
  { t: "p", html: "<b>p-value</b>: agar null sach hota, to itna ya isse zyada extreme result milne ki probability. Agar <b>p &lt; 0.05</b> to result 'significant' — null reject." },
  { t: "code", file: "ztest.py", code: "import math\n# z = (sample_mean - pop_mean) / (std / sqrt(n))\nz = (105 - 100) / (15 / math.sqrt(9))\nprint(z)   # 1.0", output: "1.0" },
  { t: "note", variant: "warn", html: "<b>p &lt; 0.05 ≠ 'pakka sach'.</b> Ye sirf 'kaafi evidence hai' batata hai. Aur significant ≠ important (bade sample me chhoti cheez bhi significant dikh sakti hai)." },
  { t: "recap", items: ["H₀ = koi farak nahi","H₁ = farak hai","p < 0.05 = significant (reject H₀)","z = (x̄ − μ) / (σ/√n)"] },
];
const S11 = [
  { t: "objectives", items: ["A/B test kya hai","Conversion rate","Lift (kitna improvement)"] },
  { t: "h2", n: "1", text: "A/B Testing" },
  { t: "p", html: "Do versions (A = purana, B = naya) ko real users pe try karke dekhte hain kaunsa behtar perform karta hai. Product companies me har change aise hi test hota hai." },
  { t: "code", file: "ab.py", code: "# conversion rate = conversions / visitors\nprint(round(50 / 1000 * 100, 2))   # 5.0  (version A)\nprint(round(60 / 1000 * 100, 2))   # 6.0  (version B)", output: "5.0\n6.0" },
  { t: "h2", n: "2", text: "Lift aur Significance" },
  { t: "p", html: "<b>Lift</b> = B, A se kitna % behtar hai. Par sirf number dekhna kaafi nahi — hypothesis test se check karo ki farak <b>significant</b> hai ya bas luck." },
  { t: "note", variant: "tip", html: "<b>Interview classic:</b> 'A/B test kaise karoge?' — random split, ek metric, enough sample, phir significance test. Poora Statistics track yahin kaam aata hai." },
  { t: "recap", items: ["A/B test = do versions compare","Conversion = conversions/visitors","Lift = B kitna % behtar","Significance test zaroori"] },
];

const statsLessons = [
  { slug: "descriptive-stats", order: 1, title: "Descriptive Statistics", minutes: 12, content: S1, problems: [
    P(1, "mean-of", "Mean (Average)", "mean_of",
      "Ek function `mean_of(nums)` banao jo list ka average (mean) return kare.",
      [{ input: "nums=[2,4,6]", output: "4" }, { input: "nums=[10,20,30,40]", output: "25" }],
      "def mean_of(nums):\n    pass\n", "def mean_of(nums):\n    return sum(nums) / len(nums)\n",
      [{ args: [[2,4,6]], expected: 4 }, { args: [[10,20,30,40]], expected: 25 }, { args: [[5]], expected: 5 }],
      ["Mean = sum(nums) / len(nums).", "sum() aur len() built-in hain."], ["mean","stats"]),
    P(2, "median-of", "Median", "median_of",
      "Ek function `median_of(nums)` banao jo median (sort karke beech wala) return kare. Even count ho to do beech wale ka average.",
      [{ input: "nums=[1,2,3]", output: "2" }, { input: "nums=[1,2,3,4]", output: "2.5" }],
      "def median_of(nums):\n    pass\n", "def median_of(nums):\n    s = sorted(nums)\n    n = len(s)\n    m = n // 2\n    return s[m] if n % 2 else (s[m-1] + s[m]) / 2\n",
      [{ args: [[1,2,3]], expected: 2 }, { args: [[1,2,3,4]], expected: 2.5 }, { args: [[7,3,5]], expected: 5 }],
      ["Pehle sorted(nums) karo.", "Beech ka index len//2."], ["median","stats"]),
    P(3, "data-range", "Data Range", "data_range",
      "Ek function `data_range(nums)` banao jo range (max − min) return kare.",
      [{ input: "nums=[3,7,2]", output: "5" }, { input: "nums=[10,10]", output: "0" }],
      "def data_range(nums):\n    pass\n", "def data_range(nums):\n    return max(nums) - min(nums)\n",
      [{ args: [[3,7,2]], expected: 5 }, { args: [[10,10]], expected: 0 }, { args: [[1,9,4]], expected: 8 }],
      ["max() aur min() use karo.", "return max(nums) - min(nums)"], ["range","stats"]) ]},

  { slug: "spread", order: 2, title: "Variance & Standard Deviation", minutes: 12, content: S2, problems: [
    P(1, "variance", "Variance", "variance",
      "Ek function `variance(nums)` banao jo variance return kare = har value ka (value − mean)² ka average.",
      [{ input: "nums=[2,4,6,8]", output: "5" }, { input: "nums=[4,4,4]", output: "0" }],
      "def variance(nums):\n    pass\n", "def variance(nums):\n    m = sum(nums) / len(nums)\n    return sum((x - m) ** 2 for x in nums) / len(nums)\n",
      [{ args: [[2,4,6,8]], expected: 5 }, { args: [[4,4,4]], expected: 0 }, { args: [[1,3,5,7]], expected: 5 }],
      ["Pehle mean nikaalo.", "Phir sum((x-mean)**2) / len."], ["variance","stats"]),
    P(2, "std-dev", "Standard Deviation", "std_dev",
      "Ek function `std_dev(nums)` banao jo standard deviation return kare (variance ka square root), 2 decimal tak round.",
      [{ input: "nums=[1,3,5,7]", output: "2.24" }, { input: "nums=[4,4,4]", output: "0" }],
      "import math\n\ndef std_dev(nums):\n    pass\n", "import math\n\ndef std_dev(nums):\n    m = sum(nums) / len(nums)\n    var = sum((x - m) ** 2 for x in nums) / len(nums)\n    return round(math.sqrt(var), 2)\n",
      [{ args: [[1,3,5,7]], expected: 2.24 }, { args: [[2,4,6,8]], expected: 2.24 }, { args: [[4,4,4]], expected: 0 }],
      ["math.sqrt(variance).", "round(result, 2) karna mat bhoolo."], ["std","stats"]) ]},

  { slug: "probability-basics", order: 3, title: "Probability Basics", minutes: 11, content: S3, problems: [
    P(1, "probability", "Probability", "probability",
      "Ek function `probability(favorable, total)` banao jo probability return kare = favorable ÷ total.",
      [{ input: "favorable=1, total=2", output: "0.5" }, { input: "favorable=1, total=4", output: "0.25" }],
      "def probability(favorable, total):\n    pass\n", "def probability(favorable, total):\n    return favorable / total\n",
      [{ args: [1,2], expected: 0.5 }, { args: [3,6], expected: 0.5 }, { args: [1,4], expected: 0.25 }],
      ["Bhaag ka operator / hai.", "return favorable / total"], ["probability","stats"]),
    P(2, "complement", "Complement", "complement",
      "Ek function `complement(p)` banao jo 'na hone' ki probability return kare = 1 − p (2 decimal round).",
      [{ input: "p=0.3", output: "0.7" }, { input: "p=0.5", output: "0.5" }],
      "def complement(p):\n    pass\n", "def complement(p):\n    return round(1 - p, 2)\n",
      [{ args: [0.3], expected: 0.7 }, { args: [0.5], expected: 0.5 }, { args: [1], expected: 0 }],
      ["1 − p.", "round(1 - p, 2)"], ["probability","stats"]) ]},

  { slug: "normal-distribution", order: 4, title: "Normal Distribution & Z-Score", minutes: 13, content: S4, problems: [
    P(1, "z-score", "Z-Score", "z_score",
      "Ek function `z_score(x, mean, std)` banao jo z-score return kare = (x − mean) ÷ std.",
      [{ input: "x=85, mean=75, std=5", output: "2" }, { input: "x=70, mean=75, std=5", output: "-1" }],
      "def z_score(x, mean, std):\n    pass\n", "def z_score(x, mean, std):\n    return (x - mean) / std\n",
      [{ args: [85,75,5], expected: 2 }, { args: [70,75,5], expected: -1 }, { args: [80,75,5], expected: 1 }],
      ["Formula: (x - mean) / std.", "Bracket ka dhyaan rakho."], ["z-score","stats"]),
    P(2, "is-outlier", "Detect Outlier", "is_outlier",
      "Ek function `is_outlier(z)` banao jo `True` return kare agar |z| > 2 hai (yaani outlier), warna `False`.",
      [{ input: "z=3", output: "True" }, { input: "z=1", output: "False" }],
      "def is_outlier(z):\n    pass\n", "def is_outlier(z):\n    return abs(z) > 2\n",
      [{ args: [3], expected: true }, { args: [1], expected: false }, { args: [-2.5], expected: true }],
      ["abs() se positive value milti hai.", "return abs(z) > 2"], ["z-score","stats"]) ]},

  { slug: "percentiles-iqr", order: 5, title: "Percentiles, Quartiles & IQR", minutes: 12, content: S5, problems: [
    P(1, "percentile-rank", "Percentile Rank", "percentile_rank",
      "Ek function `percentile_rank(nums, value)` banao jo return kare kitna % values `value` se chhoti hain (1 decimal).",
      [{ input: "nums=[1,2,3,4], value=3", output: "50" }], "def percentile_rank(nums, value):\n    pass\n",
      "def percentile_rank(nums, value):\n    return round(sum(1 for x in nums if x < value) / len(nums) * 100, 1)\n",
      [{ args: [[1,2,3,4], 3], expected: 50 }, { args: [[10,20,30,40,50], 30], expected: 40 }, { args: [[5,5,5], 5], expected: 0 }],
      ["Count karo kitne value se chhote hain.", "/ len * 100, round(…, 1)."], ["stats"], "Easy"),
    P(2, "iqr", "Interquartile Range", "iqr",
      "Ek function `iqr(nums)` banao jo IQR return kare = Q3 − Q1 (upper half ka median − lower half ka median).",
      [{ input: "nums=[1,2,3,4,5,6,7,8]", output: "4" }], "def iqr(nums):\n    pass\n",
      "def iqr(nums):\n    s = sorted(nums)\n    n = len(s)\n    def med(a):\n        k = len(a); m = k // 2\n        return a[m] if k % 2 else (a[m-1] + a[m]) / 2\n    lower = s[:n//2]\n    upper = s[n//2+1:] if n % 2 else s[n//2:]\n    return med(upper) - med(lower)\n",
      [{ args: [[1,2,3,4,5,6,7,8]], expected: 4 }, { args: [[1,2,3,4,5,6,7]], expected: 4 }, { args: [[10,20,30,40]], expected: 20 }],
      ["Data ko lower aur upper half me baanto.", "Dono ka median nikaal ke ghatao."], ["stats"], "Medium") ]},

  { slug: "correlation", order: 6, title: "Correlation & Covariance", minutes: 13, content: S6, problems: [
    P(1, "covariance", "Covariance", "covariance",
      "Ek function `covariance(x, y)` banao jo population covariance return kare (2 decimal).",
      [{ input: "x=[1,2,3], y=[2,4,6]", output: "1.33" }], "def covariance(x, y):\n    pass\n",
      "def covariance(x, y):\n    n = len(x)\n    mx = sum(x) / n\n    my = sum(y) / n\n    return round(sum((x[i]-mx)*(y[i]-my) for i in range(n)) / n, 2)\n",
      [{ args: [[1,2,3],[2,4,6]], expected: 1.33 }, { args: [[1,2,3],[1,2,3]], expected: 0.67 }, { args: [[2,4,6],[1,3,5]], expected: 2.67 }],
      ["Dono ke means nikaalo.", "mean((x-mx)*(y-my)) round 2."], ["stats"], "Medium"),
    P(2, "correlation", "Correlation Coefficient", "correlation",
      "Ek function `correlation(x, y)` banao jo Pearson correlation return kare (−1 se +1, 2 decimal).",
      [{ input: "x=[1,2,3], y=[2,4,6]", output: "1" }, { input: "x=[1,2,3], y=[3,2,1]", output: "-1" }],
      "import math\n\ndef correlation(x, y):\n    pass\n",
      "import math\n\ndef correlation(x, y):\n    n = len(x)\n    mx = sum(x) / n\n    my = sum(y) / n\n    cov = sum((x[i]-mx)*(y[i]-my) for i in range(n))\n    dx = math.sqrt(sum((v-mx)**2 for v in x))\n    dy = math.sqrt(sum((v-my)**2 for v in y))\n    return round(cov / (dx * dy), 2)\n",
      [{ args: [[1,2,3],[2,4,6]], expected: 1 }, { args: [[1,2,3],[3,2,1]], expected: -1 }, { args: [[1,2,3,4],[1,3,2,5]], expected: 0.83 }],
      ["cov / (std_x * std_y).", "round(…, 2)."], ["stats"], "Hard") ]},

  { slug: "bayes", order: 7, title: "Conditional Probability & Bayes", minutes: 12, content: S7, problems: [
    P(1, "bayes", "Bayes' Theorem", "bayes",
      "Ek function `bayes(p_a, p_b_given_a, p_b)` banao jo P(A|B) = P(B|A)×P(A)/P(B) return kare (2 decimal).",
      [{ input: "p_a=0.01, p_b_given_a=0.9, p_b=0.05", output: "0.18" }], "def bayes(p_a, p_b_given_a, p_b):\n    pass\n",
      "def bayes(p_a, p_b_given_a, p_b):\n    return round(p_b_given_a * p_a / p_b, 2)\n",
      [{ args: [0.01, 0.9, 0.05], expected: 0.18 }, { args: [0.5, 0.8, 0.5], expected: 0.8 }, { args: [0.2, 0.5, 0.4], expected: 0.25 }],
      ["Formula seedha lagao: P(B|A)*P(A)/P(B).", "round(…, 2)."], ["stats"], "Hard") ]},

  { slug: "distributions", order: 8, title: "Common Distributions", minutes: 12, content: S8, problems: [
    P(1, "binomial-prob", "Binomial Probability", "binomial_prob",
      "Ek function `binomial_prob(n, k, p)` banao jo n trials me exactly k success ki probability return kare (4 decimal). Formula: C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ.",
      [{ input: "n=2, k=1, p=0.5", output: "0.5" }], "import math\n\ndef binomial_prob(n, k, p):\n    pass\n",
      "import math\n\ndef binomial_prob(n, k, p):\n    return round(math.comb(n, k) * p**k * (1-p)**(n-k), 4)\n",
      [{ args: [2,1,0.5], expected: 0.5 }, { args: [3,2,0.5], expected: 0.375 }, { args: [5,0,0.5], expected: 0.0312 }],
      ["math.comb(n, k) combinations deta hai.", "round(…, 4)."], ["stats"], "Hard") ]},

  { slug: "sampling-clt", order: 9, title: "Sampling & Central Limit Theorem", minutes: 12, content: S9, problems: [
    P(1, "standard-error", "Standard Error", "standard_error",
      "Ek function `standard_error(std, n)` banao jo standard error return kare = std / √n (2 decimal).",
      [{ input: "std=10, n=4", output: "5" }], "import math\n\ndef standard_error(std, n):\n    pass\n",
      "import math\n\ndef standard_error(std, n):\n    return round(std / math.sqrt(n), 2)\n",
      [{ args: [10,4], expected: 5 }, { args: [6,9], expected: 2 }, { args: [20,100], expected: 2 }],
      ["math.sqrt(n) se root.", "std / sqrt(n), round 2."], ["stats"], "Medium") ]},

  { slug: "hypothesis-testing", order: 10, title: "Hypothesis Testing & p-value", minutes: 13, content: S10, problems: [
    P(1, "z-test-stat", "Z-Test Statistic", "z_test_stat",
      "Ek function `z_test_stat(sample_mean, pop_mean, std, n)` banao jo z = (x̄ − μ)/(σ/√n) return kare (2 decimal).",
      [{ input: "sample_mean=105, pop_mean=100, std=15, n=9", output: "1" }], "import math\n\ndef z_test_stat(sample_mean, pop_mean, std, n):\n    pass\n",
      "import math\n\ndef z_test_stat(sample_mean, pop_mean, std, n):\n    return round((sample_mean - pop_mean) / (std / math.sqrt(n)), 2)\n",
      [{ args: [105,100,15,9], expected: 1 }, { args: [110,100,20,16], expected: 2 }, { args: [100,100,5,25], expected: 0 }],
      ["Denominator = std / sqrt(n).", "(sample_mean - pop_mean) / us se divide."], ["stats"], "Hard") ]},

  { slug: "ab-testing", order: 11, title: "A/B Testing", minutes: 12, content: S11, problems: [
    P(1, "conversion-rate", "Conversion Rate", "conversion_rate",
      "Ek function `conversion_rate(conversions, visitors)` banao jo conversion % return kare (2 decimal).",
      [{ input: "conversions=50, visitors=1000", output: "5" }], "def conversion_rate(conversions, visitors):\n    pass\n",
      "def conversion_rate(conversions, visitors):\n    return round(conversions / visitors * 100, 2)\n",
      [{ args: [50,1000], expected: 5 }, { args: [30,200], expected: 15 }, { args: [0,50], expected: 0 }],
      ["conversions / visitors * 100.", "round(…, 2)."], ["stats"], "Easy"),
    P(2, "lift", "A/B Lift", "lift",
      "Ek function `lift(control, variant)` banao jo variant, control se kitna % behtar hai wo return kare (2 decimal). Formula: (variant−control)/control × 100.",
      [{ input: "control=0.10, variant=0.12", output: "20" }], "def lift(control, variant):\n    pass\n",
      "def lift(control, variant):\n    return round((variant - control) / control * 100, 2)\n",
      [{ args: [0.10,0.12], expected: 20 }, { args: [0.05,0.06], expected: 20 }, { args: [0.2,0.2], expected: 0 }],
      ["(variant - control) / control * 100.", "round(…, 2)."], ["stats"], "Medium") ]},
];

/* ===================== PANDAS lessons ===================== */
const PD1 = [
  { t: "objectives", items: ["NumPy array kya hai","Vectorization (fast operations)","Array pe math"] },
  { t: "h2", n: "1", text: "NumPy arrays" },
  { t: "p", html: "NumPy Python me fast numerical computing deta hai. <b>Array</b> list jaisa hai par bahut tez — poore array pe ek saath operation chalta hai (vectorization)." },
  { t: "code", file: "numpy.py", code: "import numpy as np\narr = np.array([1, 2, 3, 4])\nprint(arr * 2)       # [2 4 6 8]\nprint(arr.mean())    # 2.5", output: "[2 4 6 8]\n2.5" },
  { t: "h2", n: "2", text: "Kyun fast hai" },
  { t: "p", html: "Normal Python loop se lakhon numbers pe operation slow hota hai. NumPy C me likha hai — 10-100x fast. Pandas bhi andar NumPy use karta hai." },
  { t: "note", variant: "tip", html: "<b>Vectorization:</b> loop likhne ki jagah poore array pe seedha operation — DS ka golden rule 'loop mat likho, vectorize karo'." },
  { t: "recap", items: ["NumPy = fast numerical arrays","arr * 2 poore array pe","mean/sum/max built-in","Pandas ki neev NumPy hai"] },
];
const PD2 = [
  { t: "objectives", items: ["Series aur DataFrame","DataFrame banana","Basic info (shape, columns)"] },
  { t: "h2", n: "1", text: "DataFrame — Excel jaisa table" },
  { t: "p", html: "<b>DataFrame</b> rows aur columns wala table hai (Excel sheet jaisa). <b>Series</b> ek single column. Ye DS me sabse zyada use hone wali cheez hai." },
  { t: "viz", name: "dataframe-anatomy" },
  { t: "code", file: "df.py", code: "import pandas as pd\ndata = [{\"city\": \"Delhi\", \"sales\": 100},\n        {\"city\": \"Mumbai\", \"sales\": 200}]\ndf = pd.DataFrame(data)\nprint(len(df))            # 2 (rows)\nprint(df[\"sales\"].sum())  # 300", output: "2\n300" },
  { t: "h2", n: "2", text: "Data dekhna" },
  { t: "p", html: "<code>df.head()</code> pehli rows, <code>df.shape</code> (rows, columns), <code>df.columns</code> naam, <code>df.describe()</code> stats — data jaanne ke tools." },
  { t: "note", variant: "tip", html: "<b>Pehla kaam hamesha:</b> naya data mile to <code>df.head()</code>, <code>df.info()</code>, <code>df.describe()</code> — data se 'jaan-pehchaan' karo." },
  { t: "recap", items: ["DataFrame = rows + columns table","Series = ek column","pd.DataFrame(data) se banao","head/shape/columns/describe se dekho"] },
];
const PD3 = [
  { t: "objectives", items: ["Column select karna","Boolean filtering","Condition se rows"] },
  { t: "h2", n: "1", text: "Column select" },
  { t: "p", html: "<code>df[\"col\"]</code> se ek column, <code>df[[\"a\",\"b\"]]</code> se kai. <code>df.loc</code> / <code>df.iloc</code> se specific rows/columns." },
  { t: "code", file: "select.py", code: "import pandas as pd\ndf = pd.DataFrame([{\"city\":\"Delhi\",\"sales\":100},\n                   {\"city\":\"Mumbai\",\"sales\":200}])\nprint(df[\"sales\"].mean())   # 150.0", output: "150.0" },
  { t: "h2", n: "2", text: "Filtering — condition se rows" },
  { t: "p", html: "Condition ko bracket me daalo: <code>df[df[\"sales\"] &gt; 100]</code> sirf wo rows dega jinme sales 100 se zyada." },
  { t: "code", file: "filter.py", code: "big = df[df[\"sales\"] > 100]\nprint(len(big))   # 1", output: "1" },
  { t: "note", variant: "tip", html: "<b>Multiple conditions:</b> <code>&amp;</code> (and), <code>|</code> (or), har condition () me — <code>df[(df.a > 1) &amp; (df.b < 5)]</code>." },
  { t: "recap", items: ["df['col'] = ek column","df[df['col'] > x] = filter","& and, | or (brackets me)","loc/iloc specific access"] },
];
const PD4 = [
  { t: "objectives", items: ["Missing values (NaN)","isnull se dhoondhna","dropna / fillna"] },
  { t: "h2", n: "1", text: "Missing data ka problem" },
  { t: "p", html: "Real data me values missing hoti hain (NaN). Inhe handle kiye bina calculations galat aate hain. <code>df.isnull().sum()</code> har column me kitne missing hain batata hai." },
  { t: "code", file: "missing.py", code: "import pandas as pd\ndf = pd.DataFrame([{\"age\": 21}, {\"age\": None}, {\"age\": 30}])\nprint(df[\"age\"].isnull().sum())   # 1", output: "1" },
  { t: "h2", n: "2", text: "Handle karna" },
  { t: "p", html: "<code>dropna()</code> missing rows hata deta hai. <code>fillna(value)</code> unhe kisi value se bhar deta hai (jaise mean se)." },
  { t: "note", variant: "tip", html: "<b>Kya karein:</b> thodi missing → fillna (mean/median). Bahut missing → column drop. Ye decision DS me roz lena padta hai." },
  { t: "recap", items: ["Missing = NaN","isnull().sum() = kitne missing","dropna() = rows hatao","fillna(x) = value se bharo"] },
];
const PD5 = [
  { t: "objectives", items: ["GroupBy — group karke summarize","Split-Apply-Combine","Aggregations"] },
  { t: "h2", n: "1", text: "GroupBy — data ka dil" },
  { t: "p", html: "GroupBy data ko categories me baant ke har group pe calculation karta hai — jaise 'har city ka total sales'. <b>Split → Apply → Combine</b>." },
  { t: "code", file: "groupby.py", code: "import pandas as pd\ndf = pd.DataFrame([{\"city\":\"Delhi\",\"sales\":100},\n                   {\"city\":\"Mumbai\",\"sales\":200},\n                   {\"city\":\"Delhi\",\"sales\":50}])\nprint(df.groupby(\"city\")[\"sales\"].sum())", output: "city\nDelhi     150\nMumbai    200\nName: sales, dtype: int64" },
  { t: "h2", n: "2", text: "Aggregations" },
  { t: "p", html: "Group ke baad <code>.sum()</code>, <code>.mean()</code>, <code>.count()</code>, <code>.max()</code> — koi bhi summary. Ye DS reports ka base hai." },
  { t: "note", variant: "tip", html: "<b>Sabse zyada use:</b> 'per category' insights — har product/region/month ka total, average. Interview me groupby zaroor aata hai." },
  { t: "recap", items: ["groupby(col) = categories me baanto","phir .sum()/.mean()/.count()","Split-Apply-Combine","'per group' insights"] },
];
const PD6 = [
  { t: "objectives", items: ["sort_values se sorting","unique / nunique","Common cleaning ops"] },
  { t: "h2", n: "1", text: "Sorting" },
  { t: "p", html: "<code>df.sort_values(\"col\")</code> se rows sort karo (chhote se bade). <code>ascending=False</code> se ulta." },
  { t: "code", file: "sort.py", code: "import pandas as pd\ndf = pd.DataFrame([{\"n\":3},{\"n\":1},{\"n\":2}])\nprint(df.sort_values(\"n\")[\"n\"].tolist())   # [1, 2, 3]", output: "[1, 2, 3]" },
  { t: "h2", n: "2", text: "Unique aur cleaning" },
  { t: "p", html: "<code>df[\"col\"].nunique()</code> alag values ki ginti, <code>.unique()</code> unki list. <code>drop_duplicates()</code> duplicate rows hataata hai." },
  { t: "note", variant: "tip", html: "<b>tolist()</b> pandas Series ko normal Python list bana deta hai — aage use karne me aasaan." },
  { t: "recap", items: ["sort_values('col') sorting","ascending=False ulta","nunique() = kitne alag","drop_duplicates() cleaning"] },
];

const PDrec = "records ek list of dicts hai (jaise database rows). `pd.DataFrame(records)` se DataFrame banao.";
const pandasLessons = [
  { slug: "numpy-arrays", order: 1, title: "NumPy Arrays & Vectorization", minutes: 11, content: PD1, problems: [] },
  { slug: "series-dataframe", order: 2, title: "Series & DataFrame", minutes: 13, content: PD2, problems: [
    P(1, "df-row-count", "Count Rows", "row_count",
      "Ek function `row_count(records)` banao jo DataFrame me kitni rows hain wo return kare. " + PDrec,
      [{ input: 'records=[{"a":1},{"a":2}]', output: "2" }], "import pandas as pd\n\ndef row_count(records):\n    pass\n",
      "import pandas as pd\n\ndef row_count(records):\n    df = pd.DataFrame(records)\n    return len(df)\n",
      [{ args: [[{ a: 1 }, { a: 2 }]], expected: 2 }, { args: [[{ x: 1 }]], expected: 1 }, { args: [[{ a: 1 }, { a: 2 }, { a: 3 }]], expected: 3 }],
      ["pd.DataFrame(records) se DataFrame.", "len(df) rows deta hai."], ["pandas"], "Easy"),
    P(2, "df-column-total", "Column Total", "column_total",
      "Ek function `column_total(records, col)` banao jo `col` column ka total (sum) return kare. " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200}], col="sales"', output: "300" }], "import pandas as pd\n\ndef column_total(records, col):\n    pass\n",
      "import pandas as pd\n\ndef column_total(records, col):\n    return int(pd.DataFrame(records)[col].sum())\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 350 }, { args: [[{ x: 5 }, { x: 5 }], "x"], expected: 10 }, { args: [[{ n: 1 }, { n: 2 }, { n: 3 }], "n"], expected: 6 }],
      ["df[col].sum() se total.", "int() se plain number."], ["pandas"], "Easy") ]},
  { slug: "select-filter", order: 3, title: "Selecting & Filtering", minutes: 13, content: PD3, problems: [
    P(1, "df-column-mean", "Column Average", "column_mean",
      "Ek function `column_mean(records, col)` banao jo `col` ka average return kare (2 decimal). " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200},{"sales":50}], col="sales"', output: "116.67" }], "import pandas as pd\n\ndef column_mean(records, col):\n    pass\n",
      "import pandas as pd\n\ndef column_mean(records, col):\n    return round(float(pd.DataFrame(records)[col].mean()), 2)\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 116.67 }, { args: [[{ n: 2 }, { n: 4 }], "n"], expected: 3 }, { args: [[{ n: 10 }], "n"], expected: 10 }],
      ["df[col].mean() se average.", "round(float(…), 2)."], ["pandas"], "Medium"),
    P(2, "df-filter-count", "Filter & Count", "filter_count",
      "Ek function `filter_count(records, col, value)` banao jo ginti kare kitni rows me `col` ki value `value` ke barabar hai. " + PDrec,
      [{ input: 'records=[{"city":"Delhi"},{"city":"Mumbai"}], col="city", value="Delhi"', output: "1" }], "import pandas as pd\n\ndef filter_count(records, col, value):\n    pass\n",
      "import pandas as pd\n\ndef filter_count(records, col, value):\n    df = pd.DataFrame(records)\n    return int((df[col] == value).sum())\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "Delhi"], expected: 2 }, { args: [[{ city: "Delhi" }, { city: "Mumbai" }], "city", "Mumbai"], expected: 1 }, { args: [[{ x: 1 }, { x: 1 }, { x: 2 }], "x", 1], expected: 2 }],
      ["df[col] == value ek True/False series deta hai.", ".sum() se True count."], ["pandas"], "Medium") ]},
  { slug: "missing-data", order: 4, title: "Handling Missing Data", minutes: 12, content: PD4, problems: [
    P(1, "df-count-missing", "Count Missing Values", "count_missing",
      "Ek function `count_missing(records, col)` banao jo `col` me kitni values missing (null/NaN) hain wo return kare. " + PDrec,
      [{ input: 'records=[{"a":1},{"a":null},{"a":3}], col="a"', output: "1" }], "import pandas as pd\n\ndef count_missing(records, col):\n    pass\n",
      "import pandas as pd\n\ndef count_missing(records, col):\n    return int(pd.DataFrame(records)[col].isnull().sum())\n",
      [{ args: [[{ a: 1 }, { a: null }, { a: 3 }], "a"], expected: 1 }, { args: [[{ a: 1 }, { a: 2 }], "a"], expected: 0 }, { args: [[{ a: null }, { a: 5 }], "a"], expected: 1 }],
      ["df[col].isnull() missing pe True.", ".sum() se ginti."], ["pandas"], "Medium") ]},
  { slug: "groupby", order: 5, title: "GroupBy & Aggregation", minutes: 14, content: PD5, problems: [
    P(1, "df-group-max-sum", "Highest Group Total", "group_max_sum",
      "Ek function `group_max_sum(records, group_col, value_col)` banao jo har group ke total me se sabse bada total return kare. " + PDrec,
      [{ input: 'group by city, sum sales', output: "200" }], "import pandas as pd\n\ndef group_max_sum(records, group_col, value_col):\n    pass\n",
      "import pandas as pd\n\ndef group_max_sum(records, group_col, value_col):\n    df = pd.DataFrame(records)\n    return int(df.groupby(group_col)[value_col].sum().max())\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "sales"], expected: 200 }, { args: [[{ c: "x", v: 10 }, { c: "y", v: 50 }], "c", "v"], expected: 50 }],
      ["df.groupby(group_col)[value_col].sum() per-group total.", ".max() se sabse bada."], ["pandas"], "Medium"),
    P(2, "df-top-group", "Top Group", "top_group",
      "Ek function `top_group(records, group_col, value_col)` banao jo us group ka naam return kare jiska total sabse zyada hai. " + PDrec,
      [{ input: 'group by city, sum sales', output: '"Mumbai"' }], "import pandas as pd\n\ndef top_group(records, group_col, value_col):\n    pass\n",
      "import pandas as pd\n\ndef top_group(records, group_col, value_col):\n    df = pd.DataFrame(records)\n    return df.groupby(group_col)[value_col].sum().idxmax()\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "sales"], expected: "Mumbai" }, { args: [[{ c: "x", v: 10 }, { c: "y", v: 5 }, { c: "x", v: 10 }], "c", "v"], expected: "x" }],
      [".sum() ke baad .idxmax() sabse bade wale ka label deta hai."], ["pandas"], "Hard") ]},
  { slug: "sorting-unique", order: 6, title: "Sorting, Unique & Cleaning", minutes: 12, content: PD6, problems: [
    P(1, "df-max-column", "Max of Column", "max_of_column",
      "Ek function `max_of_column(records, col)` banao jo `col` ki sabse badi value return kare. " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200}], col="sales"', output: "200" }], "import pandas as pd\n\ndef max_of_column(records, col):\n    pass\n",
      "import pandas as pd\n\ndef max_of_column(records, col):\n    return int(pd.DataFrame(records)[col].max())\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 200 }, { args: [[{ n: 3 }, { n: 9 }], "n"], expected: 9 }, { args: [[{ n: -1 }, { n: -5 }], "n"], expected: -1 }],
      ["df[col].max() se sabse badi value."], ["pandas"], "Easy"),
    P(2, "df-unique-count", "Unique Count", "unique_count",
      "Ek function `unique_count(records, col)` banao jo `col` me kitni alag (unique) values hain wo return kare. " + PDrec,
      [{ input: 'records=[{"c":"a"},{"c":"a"},{"c":"b"}], col="c"', output: "2" }], "import pandas as pd\n\ndef unique_count(records, col):\n    pass\n",
      "import pandas as pd\n\ndef unique_count(records, col):\n    return int(pd.DataFrame(records)[col].nunique())\n",
      [{ args: [[{ c: "a" }, { c: "a" }, { c: "b" }], "c"], expected: 2 }, { args: [[{ city: "Delhi", sales: 1 }, { city: "Mumbai", sales: 2 }, { city: "Delhi", sales: 3 }], "city"], expected: 2 }, { args: [[{ c: "x" }], "c"], expected: 1 }],
      ["df[col].nunique() alag values ki ginti."], ["pandas"], "Easy"),
    P(3, "df-sorted-column", "Sorted Column", "sorted_column",
      "Ek function `sorted_column(records, col)` banao jo `col` ki values ko sort karke list return kare. " + PDrec,
      [{ input: 'records=[{"n":3},{"n":1},{"n":2}], col="n"', output: "[1, 2, 3]" }], "import pandas as pd\n\ndef sorted_column(records, col):\n    pass\n",
      "import pandas as pd\n\ndef sorted_column(records, col):\n    return pd.DataFrame(records).sort_values(col)[col].tolist()\n",
      [{ args: [[{ n: 3 }, { n: 1 }, { n: 2 }], "n"], expected: [1, 2, 3] }, { args: [[{ n: 5 }, { n: 2 }], "n"], expected: [2, 5] }, { args: [[{ n: 1 }], "n"], expected: [1] }],
      ["df.sort_values(col) rows sort karta hai.", "[col].tolist() se list."], ["pandas"], "Medium") ]},
];

/* ===================== DATA VIZ & EDA ===================== */
const vizLessons = [
  { slug: "viz-intro", order: 1, title: "Why Visualize? (EDA)", minutes: 10, problems: [], content: [
    { t: "objectives", items: ["Visualization kyun zaroori","EDA kya hai","Insight vs numbers"] },
    { t: "h2", n: "1", text: "Ek picture 1000 numbers ke barabar" },
    { t: "p", html: "Sirf numbers ke table se pattern dhoondhna mushkil hai. <b>Chart</b> banate hi trend, outlier, relationship turant dikh jaate hain. Yahi ek data analyst ka asli kaam hai." },
    { t: "h2", n: "2", text: "EDA — Exploratory Data Analysis" },
    { t: "p", html: "EDA matlab data ko 'ghoom-phir ke' samajhna — charts aur summary se. Model banane se pehle data ko jaanna sabse zaroori step hai." },
    { t: "note", variant: "tip", html: "<b>Famous quote:</b> 'The greatest value of a picture is when it forces us to notice what we never expected.' — visualization se hidden insights milte hain." },
    { t: "recap", items: ["Charts se pattern turant dikhta hai","EDA = data ko explore karo","Model se pehle data samjho","Insight nikalna analyst ka kaam"] },
  ]},
  { slug: "matplotlib-basics", order: 2, title: "Matplotlib Basics", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Line, bar, scatter plots","Labels aur title","Basic customization"] },
    { t: "h2", n: "1", text: "Pehla chart" },
    { t: "p", html: "<code>matplotlib</code> Python ki sabse basic plotting library hai. <code>plt.plot()</code> line, <code>plt.bar()</code> bar, <code>plt.scatter()</code> scatter." },
    { t: "code", file: "plot.py", code: "import matplotlib.pyplot as plt\nx = [1, 2, 3, 4]\ny = [10, 20, 15, 25]\nplt.plot(x, y)\nplt.title(\"Sales\")\nplt.xlabel(\"Month\")\nplt.show()", output: "# ek line chart dikhega" },
    { t: "h2", n: "2", text: "Chart types" },
    { t: "p", html: "<b>Line</b> — time ke saath change. <b>Bar</b> — categories compare. <b>Scatter</b> — do variables ka relation. <b>Histogram</b> — distribution." },
    { t: "note", variant: "tip", html: "<b>Hamesha:</b> title, x-label, y-label zaroor lagao — bina label ka chart bekaar hai." },
    { t: "recap", items: ["plt.plot/bar/scatter","title, xlabel, ylabel zaroori","plt.show() se dikhao","Chart type = data ke hisaab se"] },
  ]},
  { slug: "seaborn", order: 3, title: "Seaborn — Statistical Plots", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Seaborn kya hai","Distribution & relationship plots","Heatmap (correlation)"] },
    { t: "h2", n: "1", text: "Seaborn — sundar aur asaan" },
    { t: "p", html: "<code>seaborn</code> matplotlib ke upar bana hai — kam code me sundar statistical charts. DataFrames ke saath seedhe kaam karta hai." },
    { t: "code", file: "sns.py", code: "import seaborn as sns\n# histogram\nsns.histplot(df[\"age\"])\n# relationship\nsns.scatterplot(data=df, x=\"height\", y=\"weight\")", output: "# statistical charts" },
    { t: "h2", n: "2", text: "Heatmap — correlation dekhna" },
    { t: "p", html: "<code>sns.heatmap(df.corr())</code> se saare columns ka correlation ek rang wale grid me dikhta hai — kaunse features jude hain turant pata." },
    { t: "note", variant: "tip", html: "<b>EDA ke best dost:</b> histplot (distribution), boxplot (outliers), heatmap (correlation), pairplot (sab relationships)." },
    { t: "recap", items: ["Seaborn = kam code, sundar charts","DataFrame ke saath seedhe","heatmap(df.corr()) correlation","boxplot outliers dikhata hai"] },
  ]},
  { slug: "choosing-charts", order: 4, title: "Choosing the Right Chart", minutes: 10, problems: [], content: [
    { t: "objectives", items: ["Kaunsa chart kab","Common galtiyan","Clear communication"] },
    { t: "h2", n: "1", text: "Data ke hisaab se chart" },
    { t: "p", html: "<b>Trend over time</b> → line. <b>Compare categories</b> → bar. <b>Distribution</b> → histogram/box. <b>Relationship</b> → scatter. <b>Part of whole</b> → pie (kam use karo)." },
    { t: "note", variant: "warn", html: "<b>Galtiyan:</b> 3D charts (confusing), bahut saare pie slices, y-axis 0 se na shuru karna (misleading). Simple hamesha behtar." },
    { t: "recap", items: ["Line = time trend","Bar = categories","Histogram/box = distribution","Scatter = relationship"] },
  ]},
  { slug: "eda-storytelling", order: 5, title: "EDA Process & Data Storytelling", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["EDA ka step-by-step process","Insight nikalna","Story banana"] },
    { t: "h2", n: "1", text: "EDA process" },
    { t: "p", html: "1) Data load + shape dekho, 2) missing/outliers check, 3) har column ka distribution, 4) columns ke beech relationships, 5) insights likho. Ye order follow karo." },
    { t: "h2", n: "2", text: "Data storytelling" },
    { t: "p", html: "Charts banana kaafi nahi — unse ek <b>kahani</b> batao: 'sales December me 40% badhi kyunki...'. Business ko number nahi, matlab chahiye." },
    { t: "note", variant: "tip", html: "<b>Portfolio tip:</b> ek achha EDA notebook (Kaggle dataset pe) tumhare resume ka strong part banta hai — insights clearly likho." },
    { t: "recap", items: ["EDA ka fixed process follow karo","Load → clean → explore → relate → insight","Charts se kahani batao","Business ko matlab chahiye"] },
  ]},
];

/* ===================== SQL ===================== */
const sqlNote = { t: "note", variant: "tip", html: "<b>SQL playground ab live hai!</b> Is lesson ke problems me asli SQLite database chalta hai — query likho, rows turant dikhengi. Padhne se zyada likhne se aata hai." };
const sqlLessons = [
  { slug: "sql-intro", order: 1, title: "SQL & SELECT", minutes: 11, problems: [], content: [
    { t: "objectives", items: ["SQL kya hai","SELECT statement","Columns choose karna"] },
    { t: "h2", n: "1", text: "SQL — database se baat karna" },
    { t: "p", html: "SQL (Structured Query Language) databases se data nikaalne ki language hai. Har DS job me zaroori — ek pura interview round sirf SQL ka hota hai." },
    { t: "code", file: "select.sql", code: "-- saare columns\nSELECT * FROM employees;\n\n-- sirf kuch columns\nSELECT name, salary FROM employees;", output: "-- rows return hongi" },
    { t: "h2", n: "2", text: "Basic structure" },
    { t: "p", html: "<code>SELECT</code> (kaunse columns) <code>FROM</code> (kaunsi table). Ye har query ki neev hai." },
    sqlNote,
    { t: "recap", items: ["SQL = database ki language","SELECT columns FROM table","* = saare columns","Har DS job me zaroori"] },
  ]},
  { slug: "sql-where", order: 2, title: "WHERE & Filtering", minutes: 11, problems: [], content: [
    { t: "objectives", items: ["WHERE se filter","Comparison & logical operators","IN, BETWEEN, LIKE"] },
    { t: "h2", n: "1", text: "WHERE — conditions" },
    { t: "p", html: "<code>WHERE</code> se sirf wo rows aati hain jo condition poori karti hain — jaise Python ka filter." },
    { t: "code", file: "where.sql", code: "SELECT name FROM employees\nWHERE salary > 50000;\n\nSELECT * FROM employees\nWHERE dept = 'Sales' AND age < 30;", output: "-- filtered rows" },
    { t: "h2", n: "2", text: "Handy operators" },
    { t: "p", html: "<code>IN (a, b)</code> list me se, <code>BETWEEN x AND y</code> range, <code>LIKE 'A%'</code> pattern match (A se shuru)." },
    sqlNote,
    { t: "recap", items: ["WHERE = row filter","AND / OR / NOT","IN, BETWEEN, LIKE","= '' me strings"] },
  ]},
  { slug: "sql-order", order: 3, title: "ORDER BY, LIMIT & DISTINCT", minutes: 10, problems: [], content: [
    { t: "objectives", items: ["Sorting (ORDER BY)","Top-N (LIMIT)","Unique values (DISTINCT)"] },
    { t: "h2", n: "1", text: "Sort aur limit" },
    { t: "p", html: "<code>ORDER BY col DESC</code> se sort (DESC = bada se chhota). <code>LIMIT 5</code> se sirf pehli 5 rows — 'top 5' queries ke liye." },
    { t: "code", file: "order.sql", code: "SELECT name, salary FROM employees\nORDER BY salary DESC\nLIMIT 5;", output: "-- top 5 highest paid" },
    { t: "h2", n: "2", text: "DISTINCT" },
    { t: "p", html: "<code>SELECT DISTINCT dept FROM employees</code> — duplicate hata ke sirf alag values." },
    sqlNote,
    { t: "recap", items: ["ORDER BY = sorting","DESC bada→chhota, ASC ulta","LIMIT n = top n","DISTINCT = unique values"] },
  ]},
  { slug: "sql-groupby", order: 4, title: "Aggregations & GROUP BY", minutes: 13, problems: [], content: [
    { t: "objectives", items: ["COUNT, SUM, AVG, MAX","GROUP BY","HAVING"] },
    { t: "h2", n: "1", text: "Aggregate functions" },
    { t: "p", html: "<code>COUNT()</code>, <code>SUM()</code>, <code>AVG()</code>, <code>MAX()</code>, <code>MIN()</code> — poore column pe summary." },
    { t: "code", file: "agg.sql", code: "-- har dept ka average salary\nSELECT dept, AVG(salary)\nFROM employees\nGROUP BY dept;", output: "-- per-dept average" },
    { t: "h2", n: "2", text: "GROUP BY & HAVING" },
    { t: "p", html: "<code>GROUP BY</code> rows ko categories me baant ke har group pe aggregate karta hai (Pandas groupby jaisa). <code>HAVING</code> groups pe filter (WHERE rows pe)." },
    sqlNote,
    { t: "recap", items: ["COUNT/SUM/AVG/MAX summary","GROUP BY = per category","HAVING = groups pe filter","WHERE rows pe, HAVING groups pe"] },
  ]},
  { slug: "sql-joins", order: 5, title: "JOINs", minutes: 14, problems: [], content: [
    { t: "objectives", items: ["Tables ko jodna","INNER vs LEFT JOIN","Foreign keys"] },
    { t: "h2", n: "1", text: "JOIN — do tables jodna" },
    { t: "p", html: "Real data kai tables me hota hai (employees, departments). <code>JOIN</code> unhe ek common column pe jodta hai." },
    { t: "code", file: "join.sql", code: "SELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id;", output: "-- combined rows" },
    { t: "h2", n: "2", text: "INNER vs LEFT" },
    { t: "p", html: "<b>INNER JOIN</b> — sirf matching rows. <b>LEFT JOIN</b> — left table ki saari rows + jahan match ho wo (warna NULL). Venn diagram socho." },
    sqlNote,
    { t: "recap", items: ["JOIN = tables jodo common column pe","INNER = sirf match","LEFT = left ka sab + match","ON se join condition"] },
  ]},
  { slug: "sql-advanced", order: 6, title: "Subqueries & Window Functions", minutes: 14, problems: [], content: [
    { t: "objectives", items: ["Subquery (query ke andar query)","Window functions","RANK, ROW_NUMBER"] },
    { t: "h2", n: "1", text: "Subqueries" },
    { t: "p", html: "Ek query ke result ko doosri query me use karo. Jaise 'average se zyada salary wale' nikaalna." },
    { t: "code", file: "sub.sql", code: "SELECT name FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);", output: "-- above-average earners" },
    { t: "h2", n: "2", text: "Window functions" },
    { t: "p", html: "<code>RANK()</code>, <code>ROW_NUMBER()</code>, <code>LEAD/LAG</code> rows ke beech calculation karte hain bina group collapse kiye — advanced analytics ka powerful tool." },
    sqlNote,
    { t: "recap", items: ["Subquery = query ke andar query","Window fn = row-wise advanced calc","RANK, ROW_NUMBER, LEAD/LAG","Interview me advanced SQL zaroori"] },
  ]},
];

/* ------------------------------------------------------------------ */
/* ===================== BUSINESS INTELLIGENCE ===================== */
const biLessons = [
  { slug: "bi-intro", order: 1, title: "BI & Dashboards Intro", minutes: 10, problems: [], content: [
    { t: "objectives", items: ["Business Intelligence kya hai","Dashboard ka role","Analyst ka kaam"] },
    { t: "h2", n: "1", text: "BI — data se business decisions" },
    { t: "p", html: "BI tools (Power BI, Tableau) data ko interactive dashboards me badalte hain jo managers khud explore kar sakein. Yahan tak aate hi tum <b>Data Analyst (₹4-8 LPA)</b> ke liye ready ho." },
    { t: "h2", n: "2", text: "Dashboard kya karta hai" },
    { t: "p", html: "Ek dashboard KPIs ko charts + filters ke saath dikhata hai — koi bhi bina code ke data dekh sake. Business me isse rozana decisions hote hain." },
    { t: "note", variant: "tip", html: "<b>Analyst ka daily kaam:</b> data → clean → dashboard → insights present. Communication utni hi zaroori jitni technical skill." },
    { t: "recap", items: ["BI = data se decisions","Dashboard = charts + KPIs + filters","Power BI / Tableau","Analyst checkpoint yahin"] },
  ]},
  { slug: "bi-tools", order: 2, title: "Power BI / Tableau Basics", minutes: 11, problems: [], content: [
    { t: "objectives", items: ["Power BI vs Tableau","Data connect & model","Visuals banana"] },
    { t: "h2", n: "1", text: "Ek tool pe master bano" },
    { t: "p", html: "<b>Power BI</b> (Microsoft, popular, DAX language) ya <b>Tableau</b> (sundar visuals). Ek pe achhe se pakad banao — dono ki zaroorat nahi." },
    { t: "h2", n: "2", text: "Basic flow" },
    { t: "p", html: "1) Data connect (CSV/database), 2) relationships banao, 3) drag-drop charts, 4) filters/slicers, 5) publish." },
    { t: "note", variant: "tip", html: "<b>DAX:</b> Power BI me calculated measures banane ki formula language (Excel formulas jaisa). Basic DAX aana chahiye." },
    { t: "recap", items: ["Power BI ya Tableau — ek chuno","Connect → model → visualize","Filters interactive","Publish & share"] },
  ]},
  { slug: "bi-kpis", order: 3, title: "KPIs & Business Metrics", minutes: 10, problems: [], content: [
    { t: "objectives", items: ["KPI kya hai","Common business metrics","Metric chunna"] },
    { t: "h2", n: "1", text: "KPIs — kya measure karein" },
    { t: "p", html: "KPI (Key Performance Indicator) = business ka health-check number. Jaise revenue, conversion rate, churn, customer acquisition cost (CAC)." },
    { t: "note", variant: "tip", html: "<b>Business samajhna:</b> achha analyst sirf chart nahi banata — samajhta hai kaunsa metric matter karta hai. Ye interview me farak banata hai." },
    { t: "recap", items: ["KPI = key health metric","Revenue, conversion, churn, CAC","Right metric chunna skill hai","Business context zaroori"] },
  ]},
];

/* ===================== MACHINE LEARNING ===================== */
const mlLessons = [
  { slug: "ml-intro", order: 1, title: "What is Machine Learning?", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["ML kya hai","Supervised vs Unsupervised","ML workflow"] },
    { t: "h2", n: "1", text: "Machine ko data se seekhana" },
    { t: "p", html: "ML me hum machine ko rules nahi batate — <b>data</b> dete hain aur wo khud pattern seekh ke prediction karti hai. Jaise past sales se future predict karna." },
    { t: "h2", n: "2", text: "Do main types" },
    { t: "p", html: "<b>Supervised</b> — labeled data se seekho (price predict, spam/not-spam). <b>Unsupervised</b> — bina labels ke pattern dhoondho (customer groups)." },
    { t: "note", variant: "tip", html: "<b>ML workflow:</b> data → clean → features → train → evaluate → improve. Ye cycle har ML project me." },
    { t: "recap", items: ["ML = data se pattern seekhna","Supervised = labeled (predict)","Unsupervised = groups dhoondho","Workflow: data→train→evaluate"] },
  ]},
  { slug: "ml-regression", order: 2, title: "Supervised: Regression", minutes: 13, problems: [], content: [
    { t: "objectives", items: ["Regression kya hai","Linear regression","scikit-learn basics"] },
    { t: "h2", n: "1", text: "Regression — number predict karna" },
    { t: "p", html: "Regression continuous value predict karta hai — ghar ki keemat, temperature, sales. <b>Linear regression</b> sabse basic: ek seedhi line data me fit karta hai." },
    { t: "code", file: "reg.py", code: "from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npred = model.predict(X_test)", output: "# predictions" },
    { t: "h2", n: "2", text: "scikit-learn pattern" },
    { t: "p", html: "Har sklearn model ka same pattern: <code>model.fit(X, y)</code> train, <code>model.predict(X)</code> predict. Ye consistency sklearn ki khoobi hai." },
    { t: "note", variant: "tip", html: "<b>Types:</b> Linear, Ridge/Lasso (regularized), Polynomial. Shuruaat Linear se karo." },
    { t: "recap", items: ["Regression = number predict","Linear = seedhi line","model.fit() phir model.predict()","Ridge/Lasso = regularized"] },
  ]},
  { slug: "ml-classification", order: 3, title: "Supervised: Classification", minutes: 13, problems: [], content: [
    { t: "objectives", items: ["Classification kya hai","Common algorithms","Kab kaunsa"] },
    { t: "h2", n: "1", text: "Classification — category predict" },
    { t: "p", html: "Classification category predict karta hai — spam/not-spam, disease/healthy, churn/stay. Output ek label (number nahi)." },
    { t: "h2", n: "2", text: "Popular algorithms" },
    { t: "p", html: "<b>Logistic Regression</b> (naam regression, kaam classification), <b>Decision Tree</b>, <b>Random Forest</b>, <b>KNN</b>, <b>SVM</b>. Random Forest aksar strong baseline." },
    { t: "note", variant: "tip", html: "<b>XGBoost / LightGBM:</b> boosting algorithms jo competitions aur real projects me top perform karte hain." },
    { t: "recap", items: ["Classification = label predict","Logistic, Tree, Random Forest","KNN, SVM bhi common","XGBoost = competition winner"] },
  ]},
  { slug: "ml-evaluation", order: 4, title: "Model Evaluation", minutes: 13, problems: [
    P(1, "accuracy", "Accuracy Score", "accuracy",
      "Ek function `accuracy(predicted, actual)` banao jo accuracy return kare = (sahi predictions / total), 2 decimal.",
      [{ input: "predicted=[1,0,1,1], actual=[1,0,0,1]", output: "0.75" }], "def accuracy(predicted, actual):\n    pass\n",
      "def accuracy(predicted, actual):\n    correct = sum(1 for p, a in zip(predicted, actual) if p == a)\n    return round(correct / len(actual), 2)\n",
      [{ args: [[1,0,1,1],[1,0,0,1]], expected: 0.75 }, { args: [[1,1],[1,1]], expected: 1 }, { args: [[0],[1]], expected: 0 }],
      ["zip se dono list saath chalao.", "correct / total, round 2."], ["ml"], "Medium"),
    P(2, "mae", "Mean Absolute Error", "mae",
      "Ek function `mae(predicted, actual)` banao jo Mean Absolute Error return kare = average of |predicted − actual|, 2 decimal.",
      [{ input: "predicted=[3,5], actual=[2,5]", output: "0.5" }], "def mae(predicted, actual):\n    pass\n",
      "def mae(predicted, actual):\n    return round(sum(abs(p - a) for p, a in zip(predicted, actual)) / len(actual), 2)\n",
      [{ args: [[3,5],[2,5]], expected: 0.5 }, { args: [[10],[10]], expected: 0 }, { args: [[1,2,3],[4,2,0]], expected: 2 }],
      ["abs(p - a) har pair ka error.", "Sum / total, round 2."], ["ml"], "Medium"),
    P(3, "test-size", "Train-Test Split Size", "test_size",
      "Ek function `test_size(n, test_ratio)` banao jo test set ka size return kare = int(n × test_ratio).",
      [{ input: "n=100, test_ratio=0.2", output: "20" }], "def test_size(n, test_ratio):\n    pass\n",
      "def test_size(n, test_ratio):\n    return int(n * test_ratio)\n",
      [{ args: [100, 0.2], expected: 20 }, { args: [50, 0.3], expected: 15 }, { args: [200, 0.25], expected: 50 }],
      ["n * test_ratio, int() se whole number."], ["ml"], "Easy") ], content: [
    { t: "objectives", items: ["Train-test split","Accuracy, precision, recall","RMSE, cross-validation"] },
    { t: "h2", n: "1", text: "Model kitna achha hai?" },
    { t: "p", html: "Model ko <b>train</b> aur <b>test</b> data me baanto — test pe check karo (jo usne dekha nahi). Warna overfitting pata nahi chalega." },
    { t: "h2", n: "2", text: "Metrics" },
    { t: "p", html: "Classification: <b>accuracy</b>, <b>precision/recall</b>, <b>ROC-AUC</b>. Regression: <b>MAE</b>, <b>RMSE</b>, R². <b>Cross-validation</b> se reliable estimate." },
    { t: "note", variant: "warn", html: "<b>Accuracy trap:</b> imbalanced data me 95% accuracy bekaar ho sakti hai. Precision/recall dekho." },
    { t: "recap", items: ["Train-test split zaroori","Accuracy, precision, recall","RMSE/MAE regression ke liye","Cross-validation = reliable"] },
  ]},
  { slug: "ml-unsupervised", order: 5, title: "Unsupervised: Clustering & PCA", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Clustering (groups dhoondho)","K-Means","PCA (dimensionality reduction)"] },
    { t: "h2", n: "1", text: "Clustering — bina labels ke groups" },
    { t: "p", html: "Jab labels na ho, clustering similar cheezein group karta hai — customers ko behavior ke hisaab se segments me. <b>K-Means</b> sabse popular." },
    { t: "h2", n: "2", text: "PCA" },
    { t: "p", html: "<b>PCA</b> bahut features ko kam me squeeze karta hai — important info rakh ke. Bade data ko simple aur fast banata hai." },
    { t: "note", variant: "tip", html: "<b>Real use:</b> customer segmentation, anomaly detection, recommendations — sab unsupervised se." },
    { t: "recap", items: ["Clustering = groups without labels","K-Means popular","PCA = features kam karo","Segmentation me use"] },
  ]},
  { slug: "ml-workflow", order: 6, title: "Overfitting & ML Workflow", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Overfitting vs underfitting","Feature engineering","Hyperparameter tuning"] },
    { t: "h2", n: "1", text: "Overfitting — sabse badi problem" },
    { t: "p", html: "<b>Overfitting</b>: model training data ratta maar leta hai par naye data pe fail. <b>Underfitting</b>: model bahut simple. Balance chahiye." },
    { t: "h2", n: "2", text: "Feature engineering & tuning" },
    { t: "p", html: "<b>Feature engineering</b> (achhe input features) aksar model se zyada matter karta hai. <b>Hyperparameter tuning</b> (GridSearch) se optimize karo." },
    { t: "note", variant: "tip", html: "<b>Pro secret:</b> 'better data > fancy model'. Time features banane me lagao." },
    { t: "recap", items: ["Overfit = ratta, test pe fail","Underfit = bahut simple","Feature engineering key","GridSearch se tuning"] },
  ]},
];

/* ===================== DEEP LEARNING ===================== */
const dlLessons = [
  { slug: "dl-intro", order: 1, title: "Neural Networks Intro", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Neural network kya hai","Layers & neurons","Kab use karein"] },
    { t: "h2", n: "1", text: "Neural networks — dimaag se prerit" },
    { t: "p", html: "Neural network layers of 'neurons' se bana hai jo data se complex patterns seekhta hai. Images, text, speech pe ML se aage nikal jaata hai." },
    { t: "h2", n: "2", text: "Kab zaroori" },
    { t: "p", html: "Chhote structured data (tables) pe aksar Random Forest/XGBoost kaafi. Deep learning tab jab bahut data ho aur complex ho (images, language)." },
    { t: "note", variant: "tip", html: "<b>Frameworks:</b> TensorFlow/Keras (aasaan) ya PyTorch (research favourite). Ek se shuru karo." },
    { t: "recap", items: ["NN = layers of neurons","Complex data pe strong","Tables pe XGBoost aksar kaafi","TensorFlow ya PyTorch"] },
  ]},
  { slug: "dl-types", order: 2, title: "CNN, RNN & Frameworks", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["CNN (images)","RNN/LSTM (sequences)","Transfer learning"] },
    { t: "h2", n: "1", text: "CNN aur RNN" },
    { t: "p", html: "<b>CNN</b> — images ke liye (object detection, face recognition). <b>RNN/LSTM</b> — sequences ke liye (text, time series, speech)." },
    { t: "h2", n: "2", text: "Transfer learning" },
    { t: "p", html: "Zero se train karne ki jagah <b>pre-trained models</b> ko apne data pe fine-tune karo — kam data me bhi strong results." },
    { t: "note", variant: "tip", html: "<b>Shortcut:</b> Hugging Face pe hazaaron ready models — download karke use ya fine-tune." },
    { t: "recap", items: ["CNN = images","RNN/LSTM = sequences","Transfer learning = pre-trained","Hugging Face = ready models"] },
  ]},
  { slug: "dl-nlp", order: 3, title: "NLP & Choosing a Specialization", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["NLP basics","Transformers/BERT","Ek specialization chuno"] },
    { t: "h2", n: "1", text: "NLP — text samajhna" },
    { t: "p", html: "NLP text pe kaam: sentiment, translation, chatbots. <b>Transformers</b> (BERT, GPT) ne revolution la diya — aaj ka standard." },
    { t: "h2", n: "2", text: "Ek specialization chuno" },
    { t: "p", html: "Sab seekhne ki zaroorat nahi. Ek chuno — <b>NLP</b>, <b>Computer Vision</b>, ya <b>Time Series</b> — aur usme deep jao. 'Master of one' > 'jack of all'." },
    { t: "note", variant: "tip", html: "<b>Aaj ka hot:</b> LLMs (ChatGPT jaise) NLP ka part — GenAI skills ki demand bahut high." },
    { t: "recap", items: ["NLP = text processing","Transformers/BERT standard","Ek specialization me deep jao","GenAI/LLM demand high"] },
  ]},
];

/* ===================== DEPLOYMENT & JOB PREP ===================== */
const deployLessons = [
  { slug: "deploy-git", order: 1, title: "Git & GitHub", minutes: 11, problems: [], content: [
    { t: "objectives", items: ["Git = version control","GitHub = online + portfolio","Basic commands"] },
    { t: "h2", n: "1", text: "Git — code ka time machine" },
    { t: "p", html: "Git code ke versions save karta hai — kuch toota to peeche ja sakte ho. Team ek saath kaam kar paati hai bina ek doosre ka code todhe." },
    { t: "code", file: "git.sh", code: "git init\ngit add .\ngit commit -m \"first version\"\ngit push", output: "# code GitHub pe" },
    { t: "h2", n: "2", text: "GitHub = tumhara portfolio" },
    { t: "p", html: "Apne DS projects GitHub pe daalo. Recruiters ye dekhte hain — 'GitHub link' resume ka <b>sabse strong</b> proof." },
    { t: "note", variant: "tip", html: "<b>Zaroori:</b> har project ka achha README (kya banaya, kaise chalao, kya seekha) — pehli cheez jo koi dekhta hai." },
    { t: "recap", items: ["Git = version control","init → add → commit → push","GitHub = online + portfolio","README zaroor likho"] },
  ]},
  { slug: "deploy-model", order: 2, title: "Model Deployment", minutes: 12, problems: [], content: [
    { t: "objectives", items: ["Model deploy kyun","Streamlit / Flask","Live app banana"] },
    { t: "h2", n: "1", text: "Deploy — model ko live karo" },
    { t: "p", html: "Notebook me pada model kisi ko dikhta nahi. <b>Deploy</b> karke live web app banao jise koi bhi link se use kare." },
    { t: "h2", n: "2", text: "Streamlit — sabse aasaan" },
    { t: "p", html: "<b>Streamlit</b> se Python me hi interactive ML app ban jaata hai (bina web knowledge). <b>Flask/FastAPI</b> = API, <b>Docker</b> = packaging." },
    { t: "note", variant: "tip", html: "<b>Game-changer:</b> ek deployed live ML app (Streamlit Cloud pe free) resume ko 10x strong banata hai — 'yaha click karke try karo'." },
    { t: "recap", items: ["Deploy = model ko live app","Streamlit sabse aasaan","Flask/FastAPI = API","Docker = packaging"] },
  ]},
  { slug: "deploy-portfolio", order: 3, title: "Portfolio Building", minutes: 11, problems: [], content: [
    { t: "objectives", items: ["Strong portfolio","Projects kaise chuno","Presentation"] },
    { t: "h2", n: "1", text: "3-4 strong projects" },
    { t: "p", html: "Bahut chhote nahi — 3-4 <b>solid, complete, alag</b> projects. Ek EDA, ek ML model, ek deployed app, ek SQL/dashboard. Har ek end-to-end." },
    { t: "note", variant: "tip", html: "<b>Kaggle:</b> real datasets aur competitions se projects. Achhi Kaggle profile bhi portfolio hai." },
    { t: "recap", items: ["3-4 complete projects","Variety: EDA/ML/deploy/SQL","Har project end-to-end","Kaggle profile bhi count"] },
  ]},
  { slug: "deploy-interview", order: 4, title: "Interview Prep & Job Hunt", minutes: 13, problems: [], content: [
    { t: "objectives", items: ["Interview rounds","Resume & LinkedIn","Job hunt strategy"] },
    { t: "h2", n: "1", text: "DS interview ke rounds" },
    { t: "p", html: "Typical: <b>SQL round</b>, <b>Python/DSA</b>, <b>ML concepts</b>, <b>Statistics</b>, <b>case study / project discussion</b>. Ye poora platform inhi ke liye tayaar karta hai." },
    { t: "h2", n: "2", text: "Resume aur apply" },
    { t: "p", html: "Resume me projects + GitHub + skills clearly. LinkedIn active. Referrals se apply (job portals se zyada kaam karte hain). Roz thoda — consistency." },
    { t: "note", variant: "tip", html: "<b>Yaad rakho:</b> reject hona normal hai — har 'no' ek 'yes' ke kareeb le jaata hai. Base strong hai to job pakki. 💪" },
    { t: "recap", items: ["Rounds: SQL, Python, ML, stats, case","Resume + GitHub + projects","LinkedIn + referrals","Consistency = job"] },
  ]},
];

/* ------------------------------------------------------------------ */
/* Extra graded practice problems (Easy / Medium / Hard / Super Hard) */
/* attached to existing lessons by slug                               */
/* ------------------------------------------------------------------ */
const EX = (lessonSlug, diff, slug, title, fn, desc, examples, starter, solution, tests, hints, tags) =>
  ({ lessonSlug, ...P(50, slug, title, fn, desc, examples, starter, solution, tests, hints, tags, diff) });


const extraProblems = [
  /* ---------- LOOPS ---------- */
  EX("loops", "Easy", "count-positives", "Count Positives", "count_positives",
    "Ek function `count_positives(nums)` banao jo list me kitne numbers 0 se bade hain wo ginti kare.",
    [{ input: "nums=[1,-2,3]", output: "2" }], "def count_positives(nums):\n    pass\n",
    "def count_positives(nums):\n    c = 0\n    for n in nums:\n        if n > 0:\n            c += 1\n    return c\n",
    [{ args: [[1,-2,3]], expected: 2 }, { args: [[-1,-5]], expected: 0 }, { args: [[5,5]], expected: 2 }],
    ["Loop me if n > 0: count badhao."], ["loops"]),
  EX("loops", "Easy", "sum-digits", "Sum of Digits", "sum_digits",
    "Ek function `sum_digits(n)` banao jo number ke saare digits ka sum return kare.",
    [{ input: "n=123", output: "6" }], "def sum_digits(n):\n    pass\n",
    "def sum_digits(n):\n    return sum(int(d) for d in str(n))\n",
    [{ args: [123], expected: 6 }, { args: [0], expected: 0 }, { args: [45], expected: 9 }],
    ["str(n) se har digit pe loop.", "int(d) se wapas number."], ["loops"]),
  EX("loops", "Medium", "is-prime", "Prime Number?", "is_prime",
    "Ek function `is_prime(n)` banao jo `True` return kare agar n prime hai (sirf 1 aur khud se divide ho).",
    [{ input: "n=7", output: "True" }, { input: "n=4", output: "False" }], "def is_prime(n):\n    pass\n",
    "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n",
    [{ args: [7], expected: true }, { args: [4], expected: false }, { args: [2], expected: true }, { args: [1], expected: false }],
    ["2 se sqrt(n) tak check karo.", "koi divide kare to prime nahi."], ["loops"]),
  EX("loops", "Medium", "fizzbuzz-value", "FizzBuzz Value", "fizzbuzz_value",
    "Ek function `fizzbuzz_value(n)` banao: 3 aur 5 dono se divide ho to `\"FizzBuzz\"`, sirf 3 se to `\"Fizz\"`, sirf 5 se to `\"Buzz\"`, warna number ko string me.",
    [{ input: "n=15", output: '"FizzBuzz"' }, { input: "n=7", output: '"7"' }], "def fizzbuzz_value(n):\n    pass\n",
    'def fizzbuzz_value(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)\n',
    [{ args: [15], expected: "FizzBuzz" }, { args: [3], expected: "Fizz" }, { args: [5], expected: "Buzz" }, { args: [7], expected: "7" }],
    ["Pehle 15 (dono) check karo.", "str(n) se number ko string."], ["loops"]),
  EX("loops", "Hard", "nth-fibonacci", "Nth Fibonacci", "nth_fibonacci",
    "Ek function `nth_fibonacci(n)` banao jo 0-indexed nth Fibonacci number return kare (0,1,1,2,3,5,8...).",
    [{ input: "n=6", output: "8" }, { input: "n=0", output: "0" }], "def nth_fibonacci(n):\n    pass\n",
    "def nth_fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n",
    [{ args: [0], expected: 0 }, { args: [1], expected: 1 }, { args: [6], expected: 8 }, { args: [10], expected: 55 }],
    ["Do variables a,b se track karo.", "a,b = b, a+b"], ["loops"]),
  EX("loops", "Hard", "gcd", "Greatest Common Divisor", "gcd",
    "Ek function `gcd(a, b)` banao jo `a` aur `b` ka HCF (greatest common divisor) return kare.",
    [{ input: "a=12, b=8", output: "4" }], "def gcd(a, b):\n    pass\n",
    "def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n",
    [{ args: [12, 8], expected: 4 }, { args: [17, 5], expected: 1 }, { args: [100, 10], expected: 10 }],
    ["Euclid's algorithm: a,b = b, a%b jab tak b != 0."], ["loops"]),
  EX("loops", "Super Hard", "collatz-steps", "Collatz Steps", "collatz_steps",
    "Ek function `collatz_steps(n)` banao jo ginti kare kitne steps me n 1 tak pahunchta hai. Rule: even to /2, odd to *3+1.",
    [{ input: "n=6", output: "8" }], "def collatz_steps(n):\n    pass\n",
    "def collatz_steps(n):\n    steps = 0\n    while n != 1:\n        n = n // 2 if n % 2 == 0 else 3 * n + 1\n        steps += 1\n    return steps\n",
    [{ args: [1], expected: 0 }, { args: [6], expected: 8 }, { args: [16], expected: 4 }],
    ["while n != 1 loop.", "even: n//2, odd: 3n+1."], ["loops"]),
  EX("loops", "Super Hard", "count-primes-below", "Count Primes Below N", "count_primes_below",
    "Ek function `count_primes_below(n)` banao jo n se chhote (n ko chhod ke) kitne prime numbers hain wo ginti kare.",
    [{ input: "n=10", output: "4" }], "def count_primes_below(n):\n    pass\n",
    "def count_primes_below(n):\n    def prime(x):\n        if x < 2:\n            return False\n        for i in range(2, int(x ** 0.5) + 1):\n            if x % i == 0:\n                return False\n        return True\n    return sum(1 for x in range(2, n) if prime(x))\n",
    [{ args: [10], expected: 4 }, { args: [2], expected: 0 }, { args: [20], expected: 8 }],
    ["Har number check karo prime hai ya nahi.", "range(2, n) me count karo."], ["loops"]),

  /* ---------- STRINGS ---------- */
  EX("strings", "Easy", "to-lower", "Lowercase", "to_lower",
    "Ek function `to_lower(s)` banao jo string ko lowercase me return kare.",
    [{ input: 's="ABC"', output: '"abc"' }], "def to_lower(s):\n    pass\n", "def to_lower(s):\n    return s.lower()\n",
    [{ args: ["ABC"], expected: "abc" }, { args: ["Hello"], expected: "hello" }],
    [".lower() method use karo."], ["strings"]),
  EX("strings", "Easy", "first-last", "First + Last Char", "first_last",
    "Ek function `first_last(s)` banao jo string ka pehla aur aakhri character jodkar return kare.",
    [{ input: 's="hello"', output: '"ho"' }], "def first_last(s):\n    pass\n", "def first_last(s):\n    return s[0] + s[-1]\n",
    [{ args: ["hello"], expected: "ho" }, { args: ["ab"], expected: "ab" }, { args: ["x"], expected: "xx" }],
    ["s[0] pehla, s[-1] aakhri."], ["strings"]),
  EX("strings", "Medium", "is-palindrome", "Palindrome?", "is_palindrome",
    "Ek function `is_palindrome(s)` banao jo `True` return kare agar string ulta bhi same hai.",
    [{ input: 's="level"', output: "True" }], "def is_palindrome(s):\n    pass\n", "def is_palindrome(s):\n    return s == s[::-1]\n",
    [{ args: ["level"], expected: true }, { args: ["hello"], expected: false }, { args: ["a"], expected: true }],
    ["s[::-1] se ulta string.", "s == s[::-1] compare karo."], ["strings"]),
  EX("strings", "Medium", "count-words", "Count Words", "count_words",
    "Ek function `count_words(s)` banao jo string me kitne words hain wo ginti kare.",
    [{ input: 's="hi there world"', output: "3" }], "def count_words(s):\n    pass\n", "def count_words(s):\n    return len(s.split())\n",
    [{ args: ["hi there world"], expected: 3 }, { args: ["one"], expected: 1 }, { args: [""], expected: 0 }],
    ["s.split() words ki list deta hai.", "len() se ginti."], ["strings"]),
  EX("strings", "Medium", "remove-vowels", "Remove Vowels", "remove_vowels",
    "Ek function `remove_vowels(s)` banao jo string me se saare vowels (a,e,i,o,u) hata de.",
    [{ input: 's="hello"', output: '"hll"' }], "def remove_vowels(s):\n    pass\n",
    'def remove_vowels(s):\n    return "".join(c for c in s if c not in "aeiou")\n',
    [{ args: ["hello"], expected: "hll" }, { args: ["aeiou"], expected: "" }, { args: ["xyz"], expected: "xyz" }],
    ["Har char check karo vowel hai ya nahi.", 'if c not in "aeiou".'], ["strings"]),
  EX("strings", "Hard", "is-anagram", "Anagram Check", "is_anagram",
    "Ek function `is_anagram(a, b)` banao jo `True` return kare agar dono strings ek doosre ke anagram hain (same letters).",
    [{ input: 'a="listen", b="silent"', output: "True" }], "def is_anagram(a, b):\n    pass\n",
    "def is_anagram(a, b):\n    return sorted(a) == sorted(b)\n",
    [{ args: ["listen", "silent"], expected: true }, { args: ["abc", "abd"], expected: false }, { args: ["aab", "aba"], expected: true }],
    ["sorted(a) letters ko order me laga deta hai.", "sorted(a) == sorted(b)."], ["strings"]),
  EX("strings", "Hard", "most-frequent-char", "Most Frequent Char", "most_frequent_char",
    "Ek function `most_frequent_char(s)` banao jo string me sabse zyada baar aane wala character return kare.",
    [{ input: 's="aabbbc"', output: '"b"' }], "from collections import Counter\n\ndef most_frequent_char(s):\n    pass\n",
    "from collections import Counter\n\ndef most_frequent_char(s):\n    return Counter(s).most_common(1)[0][0]\n",
    [{ args: ["aabbbc"], expected: "b" }, { args: ["abc"], expected: "a" }, { args: ["xxy"], expected: "x" }],
    ["Counter(s).most_common(1).", "[0][0] se char nikaalo."], ["strings"]),
  EX("strings", "Super Hard", "caesar-cipher", "Caesar Cipher", "caesar_cipher",
    "Ek function `caesar_cipher(s, shift)` banao jo lowercase string ke har letter ko `shift` aage badha de (z ke baad wapas a). Sirf lowercase letters.",
    [{ input: 's="abc", shift=1', output: '"bcd"' }, { input: 's="xyz", shift=3', output: '"abc"' }],
    "def caesar_cipher(s, shift):\n    pass\n",
    "def caesar_cipher(s, shift):\n    return ''.join(chr((ord(c) - 97 + shift) % 26 + 97) for c in s)\n",
    [{ args: ["abc", 1], expected: "bcd" }, { args: ["xyz", 3], expected: "abc" }, { args: ["hello", 0], expected: "hello" }],
    ["ord(c) se number, chr() se wapas letter.", "% 26 se wrap-around (z ke baad a)."], ["strings"]),
  EX("strings", "Super Hard", "longest-word", "Longest Word", "longest_word",
    "Ek function `longest_word(s)` banao jo sentence ka sabse lamba word return kare.",
    [{ input: 's="I love python"', output: '"python"' }], "def longest_word(s):\n    pass\n",
    "def longest_word(s):\n    return max(s.split(), key=len)\n",
    [{ args: ["I love python"], expected: "python" }, { args: ["a bb ccc"], expected: "ccc" }, { args: ["hi"], expected: "hi" }],
    ["s.split() words ki list.", "max(words, key=len)."], ["strings"]),

  /* ---------- LISTS ---------- */
  EX("lists-tuples", "Easy", "list-average", "List Average", "list_average",
    "Ek function `list_average(nums)` banao jo list ka average return kare.",
    [{ input: "nums=[2,4]", output: "3" }], "def list_average(nums):\n    pass\n", "def list_average(nums):\n    return sum(nums) / len(nums)\n",
    [{ args: [[2,4]], expected: 3 }, { args: [[1,2,3]], expected: 2 }, { args: [[10]], expected: 10 }],
    ["sum(nums) / len(nums)."], ["lists"]),
  EX("lists-tuples", "Medium", "second-largest", "Second Largest", "second_largest",
    "Ek function `second_largest(nums)` banao jo doosra sabse bada (distinct) number return kare.",
    [{ input: "nums=[1,5,3]", output: "3" }], "def second_largest(nums):\n    pass\n",
    "def second_largest(nums):\n    return sorted(set(nums))[-2]\n",
    [{ args: [[1,5,3]], expected: 3 }, { args: [[4,4,2]], expected: 2 }, { args: [[10,20,5]], expected: 10 }],
    ["set() se duplicates hatao, sorted() karo.", "[-2] = doosra sabse bada."], ["lists"]),
  EX("lists-tuples", "Medium", "remove-duplicates", "Remove Duplicates", "remove_duplicates",
    "Ek function `remove_duplicates(lst)` banao jo duplicates hata de par order same rakhe.",
    [{ input: "lst=[1,2,2,3,1]", output: "[1, 2, 3]" }], "def remove_duplicates(lst):\n    pass\n",
    "def remove_duplicates(lst):\n    return list(dict.fromkeys(lst))\n",
    [{ args: [[1,2,2,3,1]], expected: [1,2,3] }, { args: [[5,5]], expected: [5] }, { args: [[]], expected: [] }],
    ["dict.fromkeys(lst) order rakhta hai aur duplicates hatata hai.", "list() se wapas list."], ["lists"]),
  EX("lists-tuples", "Hard", "rotate-left", "Rotate Left", "rotate_left",
    "Ek function `rotate_left(lst, k)` banao jo list ko k positions left rotate kare.",
    [{ input: "lst=[1,2,3,4], k=1", output: "[2, 3, 4, 1]" }], "def rotate_left(lst, k):\n    pass\n",
    "def rotate_left(lst, k):\n    if not lst:\n        return lst\n    k = k % len(lst)\n    return lst[k:] + lst[:k]\n",
    [{ args: [[1,2,3,4], 1], expected: [2,3,4,1] }, { args: [[1,2,3], 2], expected: [3,1,2] }, { args: [[1,2,3], 0], expected: [1,2,3] }],
    ["lst[k:] + lst[:k] rotate karta hai.", "k % len se bade k handle karo."], ["lists"]),
  EX("lists-tuples", "Hard", "two-sum", "Two Sum (Indices)", "two_sum",
    "Ek function `two_sum(nums, target)` banao jo un do numbers ke **indices** [i, j] return kare jinka sum target hai.",
    [{ input: "nums=[2,7,11], target=9", output: "[0, 1]" }], "def two_sum(nums, target):\n    pass\n",
    "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n",
    [{ args: [[2,7,11], 9], expected: [0,1] }, { args: [[3,2,4], 6], expected: [1,2] }, { args: [[1,2,3], 5], expected: [1,2] }],
    ["Ek dict me dekhte jao 'target - n' pehle aaya kya.", "enumerate se index milta hai."], ["lists"]),
  EX("lists-tuples", "Super Hard", "max-subarray-sum", "Max Subarray Sum", "max_subarray_sum",
    "Ek function `max_subarray_sum(nums)` banao jo continuous subarray ka maximum sum return kare (Kadane's algorithm).",
    [{ input: "nums=[1,-2,3,4]", output: "7" }], "def max_subarray_sum(nums):\n    pass\n",
    "def max_subarray_sum(nums):\n    best = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best\n",
    [{ args: [[1,-2,3,4]], expected: 7 }, { args: [[-1,-2]], expected: -1 }, { args: [[5]], expected: 5 }],
    ["Kadane: cur = max(n, cur+n).", "best me sabse bada rakho."], ["lists"]),
  EX("lists-tuples", "Super Hard", "move-zeros", "Move Zeros to End", "move_zeros",
    "Ek function `move_zeros(nums)` banao jo saare 0 end me le jaaye, baaki ka order same rakhe.",
    [{ input: "nums=[0,1,0,3]", output: "[1, 3, 0, 0]" }], "def move_zeros(nums):\n    pass\n",
    "def move_zeros(nums):\n    non_zero = [x for x in nums if x != 0]\n    zeros = [0] * nums.count(0)\n    return non_zero + zeros\n",
    [{ args: [[0,1,0,3]], expected: [1,3,0,0] }, { args: [[1,2]], expected: [1,2] }, { args: [[0,0,1]], expected: [1,0,0] }],
    ["Pehle non-zero elements, phir zeros jodo.", "nums.count(0) se zeros ki ginti."], ["lists"]),

  /* ---------- FUNCTIONS ---------- */
  EX("functions", "Easy", "cube", "Cube a Number", "cube",
    "Ek function `cube(n)` banao jo n ka cube (n³) return kare.",
    [{ input: "n=3", output: "27" }], "def cube(n):\n    pass\n", "def cube(n):\n    return n ** 3\n",
    [{ args: [3], expected: 27 }, { args: [0], expected: 0 }, { args: [2], expected: 8 }],
    ["n ** 3 se cube."], ["functions"]),
  EX("functions", "Medium", "count-greater", "Count Greater Than", "count_greater",
    "Ek function `count_greater(nums, x)` banao jo ginti kare kitne numbers x se bade hain.",
    [{ input: "nums=[1,5,3,8], x=4", output: "2" }], "def count_greater(nums, x):\n    pass\n",
    "def count_greater(nums, x):\n    return sum(1 for n in nums if n > x)\n",
    [{ args: [[1,5,3,8], 4], expected: 2 }, { args: [[1,2], 5], expected: 0 }, { args: [[5,5], 4], expected: 2 }],
    ["Loop me n > x count karo."], ["functions"]),
  EX("functions", "Hard", "sum-of-squares", "Sum of Squares", "sum_of_squares",
    "Ek function `sum_of_squares(n)` banao jo 1² + 2² + ... + n² return kare.",
    [{ input: "n=3", output: "14" }], "def sum_of_squares(n):\n    pass\n",
    "def sum_of_squares(n):\n    return sum(i * i for i in range(1, n + 1))\n",
    [{ args: [3], expected: 14 }, { args: [1], expected: 1 }, { args: [4], expected: 30 }],
    ["range(1, n+1) me har i ka square jodo."], ["functions"]),
  EX("functions", "Super Hard", "is-perfect", "Perfect Number?", "is_perfect",
    "Ek function `is_perfect(n)` banao jo `True` return kare agar n perfect hai (apne divisors ka sum = n, khud ko chhod ke). Jaise 6 = 1+2+3.",
    [{ input: "n=6", output: "True" }], "def is_perfect(n):\n    pass\n",
    "def is_perfect(n):\n    return sum(i for i in range(1, n) if n % i == 0) == n\n",
    [{ args: [6], expected: true }, { args: [28], expected: true }, { args: [10], expected: false }],
    ["1 se n-1 tak divisors ka sum.", "sum == n hone pe perfect."], ["functions"]),

  /* ---------- DICTIONARIES ---------- */
  EX("dicts-sets", "Easy", "dict-size", "Dictionary Size", "dict_size",
    "Ek function `dict_size(d)` banao jo dict me kitne keys hain wo return kare.",
    [{ input: 'd={"a":1,"b":2}', output: "2" }], "def dict_size(d):\n    pass\n", "def dict_size(d):\n    return len(d)\n",
    [{ args: [{ a: 1, b: 2 }], expected: 2 }, { args: [{}], expected: 0 }, { args: [{ x: 5 }], expected: 1 }],
    ["len(d) keys ki ginti deta hai."], ["dict"]),
  EX("dicts-sets", "Medium", "sum-values", "Sum of Values", "sum_values",
    "Ek function `sum_values(d)` banao jo dict ki saari values ka sum return kare.",
    [{ input: 'd={"a":1,"b":2,"c":3}', output: "6" }], "def sum_values(d):\n    pass\n", "def sum_values(d):\n    return sum(d.values())\n",
    [{ args: [{ a: 1, b: 2, c: 3 }], expected: 6 }, { args: [{ x: 10 }], expected: 10 }, { args: [{}], expected: 0 }],
    ["d.values() saari values deta hai.", "sum() se jodo."], ["dict"]),
  EX("dicts-sets", "Hard", "max-value-key", "Key with Max Value", "max_value_key",
    "Ek function `max_value_key(d)` banao jo us key ko return kare jiski value sabse zyada hai.",
    [{ input: 'd={"a":5,"b":9,"c":2}', output: '"b"' }], "def max_value_key(d):\n    pass\n",
    "def max_value_key(d):\n    return max(d, key=d.get)\n",
    [{ args: [{ a: 5, b: 9, c: 2 }], expected: "b" }, { args: [{ x: 1 }], expected: "x" }, { args: [{ p: 3, q: 7 }], expected: "q" }],
    ["max(d, key=d.get) sabse badi value wali key deta hai."], ["dict"]),

  /* ---------- CONDITIONALS ---------- */
  EX("conditionals", "Easy", "is-positive", "Positive Check", "is_positive",
    "Ek function `is_positive(n)` banao jo `True` return kare agar n 0 se bada hai.",
    [{ input: "n=5", output: "True" }], "def is_positive(n):\n    pass\n", "def is_positive(n):\n    return n > 0\n",
    [{ args: [5], expected: true }, { args: [-1], expected: false }, { args: [0], expected: false }],
    ["return n > 0"], ["conditionals"]),
  EX("conditionals", "Medium", "leap-year", "Leap Year?", "is_leap_year",
    "Ek function `is_leap_year(year)` banao jo `True` return kare agar leap year hai (4 se divide, par 100 se nahi — unless 400 se).",
    [{ input: "year=2024", output: "True" }, { input: "year=1900", output: "False" }], "def is_leap_year(year):\n    pass\n",
    "def is_leap_year(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)\n",
    [{ args: [2024], expected: true }, { args: [1900], expected: false }, { args: [2000], expected: true }, { args: [2023], expected: false }],
    ["4 se divide AND (100 se nahi OR 400 se).", "2000 leap hai, 1900 nahi."], ["conditionals"]),
];


/* ------------------------------------------------------------------ */
async function main() {
  console.log("🌱 Seeding DataQuest…");

  await prisma.submission.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.note.deleteMany();
  await prisma.track.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: { name: "Jugendra Pratap", email: "jugendra@dataquest.dev", passwordHash: hashPassword("dataquest"), role: "Aspiring Data Analyst", xp: 2480, streak: 12, bestStreak: 12 },
  });

  // Demo classmates so the leaderboard feels alive.
  await prisma.user.createMany({
    data: [
      { name: "Ananya Sharma", email: "ananya@dq.dev", passwordHash: hashPassword("demo1234"), xp: 3940, streak: 21, bestStreak: 21 },
      { name: "Rohit Mehta", email: "rohit@dq.dev", passwordHash: hashPassword("demo1234"), xp: 3120, streak: 15, bestStreak: 18 },
      { name: "Priya Kumar", email: "priya@dq.dev", passwordHash: hashPassword("demo1234"), xp: 2880, streak: 9, bestStreak: 14 },
      { name: "Sameer Thakur", email: "sameer@dq.dev", passwordHash: hashPassword("demo1234"), xp: 2210, streak: 7, bestStreak: 10 },
      { name: "Neha Verma", email: "neha@dq.dev", passwordHash: hashPassword("demo1234"), xp: 1450, streak: 4, bestStreak: 6 },
    ],
  });

  const trackLessons = {
    python: pythonLessons, statistics: statsLessons, pandas: pandasLessons,
    viz: vizLessons, sql: sqlLessons, bi: biLessons,
    ml: mlLessons, dl: dlLessons, deploy: deployLessons,
  };
  const lessonBySlug = {};
  for (const t of tracks) {
    const track = await prisma.track.create({ data: t });
    const lessons = trackLessons[track.slug];
    if (lessons) {
      for (const l of lessons) {
        const lesson = await prisma.lesson.create({
          data: { slug: l.slug, order: l.order, title: l.title, minutes: l.minutes, level: l.level || "Beginner", contentJson: JSON.stringify(l.content), trackId: track.id },
        });
        lessonBySlug[l.slug] = lesson.id;
        for (const p of (l.problems || [])) {
          await prisma.problem.create({ data: { ...p, lessonId: lesson.id } });
        }
      }
    }
  }

  // attach the extra graded practice problems by lesson slug
  for (const ep of [...extraProblems, ...sqlProblems, ...pandasProblems]) {
    const lid = lessonBySlug[ep.lessonSlug];
    if (!lid) continue;
    const { lessonSlug, ...data } = ep;
    await prisma.problem.create({ data: { ...data, lessonId: lid } });
  }

  await prisma.note.createMany({
    data: [
      { userId: user.id, topic: "Python", title: "Type casting", body: "String ko number banane ke liye int()/float(). Input hamesha string me aata hai.", code: 'int("85") + 5  →  90' },
      { userId: user.id, topic: "Python", title: "= vs ==", body: "= value deta hai, == compare karta hai. Sabse common galti.", code: "" },
      { userId: user.id, topic: "Python", title: "Slicing reverse", body: "List ulta karne ka trick.", code: "lst[::-1]" },
      { userId: user.id, topic: "Pandas", title: "GroupBy pattern", body: "Split → Apply → Combine.", code: "df.groupby('city')['sales'].sum()" },
      { userId: user.id, topic: "Statistics", title: "p-value kya hai", body: "Agar p < 0.05 to result significant — null hypothesis reject.", code: "" },
    ],
  });

  const counts = { users: await prisma.user.count(), tracks: await prisma.track.count(), lessons: await prisma.lesson.count(), problems: await prisma.problem.count() };
  console.log("✅ Done:", counts);
}

/** Lesson content, keyed by track slug. Exported so apply-lessons.mjs can refresh
 *  lesson bodies on a live database without a destructive re-seed. */
export const trackLessons = {
  python: pythonLessons, statistics: statsLessons, pandas: pandasLessons,
  viz: vizLessons, sql: sqlLessons, bi: biLessons,
  ml: mlLessons, dl: dlLessons, deploy: deployLessons,
};

// Only seed when run directly (`node prisma/seed.mjs`) — importing this file to
// read trackLessons must not wipe and rebuild the database.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
}
