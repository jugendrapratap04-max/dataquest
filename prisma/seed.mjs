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
export const tracks = [
  { slug: "python", order: 1, title: "Programming Foundations — Python", subtitle: "the base of everything", icon: "Py", weeks: "~4 weeks", level: "Beginner",
    whyText: "Python is the universal language of data science. Get this solid and everything after it comes easier.",
    milestone: "CLI quiz / expense tracker app", toolsCsv: "Python 3,Jupyter,VS Code",
    skillsJson: JSON.stringify(["Variables, data types, operators", "If-else, loops", "Functions & scope", "List, tuple, dict, set", "String methods & slicing", "Comprehensions", "OOP — classes, inheritance", "Error handling", "File handling", "Modules, pip, venv"]) },
  { slug: "statistics", order: 2, title: "Math & Statistics", subtitle: "the brain behind ML", icon: "∑", weeks: "~5 weeks", level: "Beginner→Inter",
    whyText: "Data science is statistics plus code. This is what lets you say what a result actually means — and it is what separates people in interviews.",
    milestone: "A/B test analysis report", toolsCsv: "NumPy,SciPy",
    skillsJson: JSON.stringify(["Descriptive stats", "Probability & Bayes", "Distributions", "CLT & sampling", "Hypothesis testing, p-value", "Chi-square & ANOVA", "Correlation vs causation", "A/B testing", "Linear algebra basics", "Calculus intuition"]) },
  { slug: "pandas", order: 3, title: "Data Manipulation — NumPy & Pandas", subtitle: "the daily job of a data pro", icon: "pd", weeks: "~4 weeks", level: "Intermediate",
    whyText: "Real data is messy. Around 80% of the job is cleaning and reshaping it, and pandas is how you get good at that.",
    milestone: "Clean a messy real-world dataset", toolsCsv: "NumPy,Pandas",
    skillsJson: JSON.stringify(["NumPy arrays & vectorization", "Series & DataFrame", "Read CSV/Excel/JSON/SQL", "Indexing (loc/iloc)", "Missing data (NaN)", "GroupBy & aggregation", "Merge, join, concat", "Pivot & reshape (melt)", "Apply, map, lambda", "Cleaning: dupes, outliers, dtypes"]) },
  { slug: "viz", order: 4, title: "Data Visualization & EDA", subtitle: "turn data into insight", icon: "Viz", weeks: "~3 weeks", level: "Intermediate",
    whyText: "Seeing the data and turning it into a story — that is analysis. Companies hire people who can pull the insight out.",
    milestone: "Full EDA notebook — 5 real insights", toolsCsv: "Matplotlib,Seaborn,Plotly,Excel",
    skillsJson: JSON.stringify(["Matplotlib", "Seaborn", "Plotly (interactive)", "EDA: uni/bi/multivariate", "Correlation heatmaps", "Data storytelling", "Excel / Sheets", "Right chart chunna"]) },
  { slug: "sql", order: 5, title: "SQL & Databases", subtitle: "every job asks for this", icon: "DB", weeks: "~4 weeks", level: "Intermediate",
    whyText: "Real data lives in databases. A data science job without SQL is close to impossible — there is usually a whole interview round on it.",
    milestone: "Answer 12 business questions from a DB", toolsCsv: "PostgreSQL,MySQL",
    skillsJson: JSON.stringify(["SELECT, WHERE, ORDER BY", "Aggregations, GROUP BY", "Joins (inner/left/right)", "Subqueries & CTEs", "Window functions", "Date & string functions", "DB design & normalization", "Query optimization"]) },
  { slug: "bi", order: 6, title: "Business Intelligence & Dashboards", subtitle: "🎯 Data Analyst ready here", icon: "BI", weeks: "~3 weeks", level: "Intermediate",
    whyText: "Get here and you are Data Analyst ready (₹4–8 LPA). BI tools are how you show a business that you turn data into decisions.",
    milestone: "Interactive sales / HR dashboard", toolsCsv: "Power BI,Tableau", checkpoint: "Data Analyst · ₹4–8 LPA",
    skillsJson: JSON.stringify(["Power BI or Tableau", "Data modeling", "DAX / calc fields", "Interactive dashboards", "KPIs & metrics", "Publishing reports"]) },
  { slug: "ml", order: 7, title: "Machine Learning", subtitle: "the core of 'Data Scientist'", icon: "ML", weeks: "~8 weeks", level: "Advanced",
    whyText: "You teach a machine to learn from data. This is the skill that moves an offer from analyst to scientist level.",
    milestone: "End-to-end prediction model", toolsCsv: "scikit-learn,XGBoost",
    skillsJson: JSON.stringify(["ML workflow & scikit-learn", "Preprocessing: encoding, scaling", "Feature engineering", "Regression: Linear, Ridge, Lasso", "Classification: Logistic, KNN, SVM", "Trees & Random Forest", "Boosting: XGBoost, LightGBM", "Unsupervised: K-Means, PCA", "Evaluation: CV, ROC-AUC, RMSE", "Hyperparameter tuning"]) },
  { slug: "dl", order: 8, title: "Deep Learning & a Specialization", subtitle: "pick ONE, go deep", icon: "DL", weeks: "~8 weeks", level: "Advanced",
    whyText: "This is what pushes the package higher. Not all of it — pick one specialization (NLP / Vision / Time Series) and go deep.",
    milestone: "Specialization project", toolsCsv: "TensorFlow,PyTorch,Hugging Face",
    skillsJson: JSON.stringify(["Neural network basics", "TensorFlow/Keras or PyTorch", "CNN — vision basics", "RNN / LSTM", "NLP: TF-IDF, embeddings", "Transformers / BERT intro", "Time series: ARIMA, Prophet", "Master 1 specialization"]) },
  { slug: "deploy", order: 9, title: "Deployment, Portfolio & Job Prep", subtitle: "🚀 Data Scientist ready here", icon: "★", weeks: "~6 weeks", level: "Advanced",
    whyText: "The skills are built — now the world has to see them. Portfolio, deployment and interview prep are what get you ₹8–15 LPA. 90% of students skip this step; do not be one of them.",
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
  hintsJson: JSON.stringify(hints), xp: xpFor(difficulty),
});

// A Super Hard problem used to pay exactly what an Easy one pays, because this
// helper hardcoded 20 while the SQL and pandas modules already scaled by
// difficulty. Same ladder as those, in one place, so the three agree.
function xpFor(difficulty) {
  if (difficulty === "Medium") return 30;
  if (difficulty === "Hard") return 40;
  if (difficulty === "Super Hard") return 50;
  return 20;
}

/* ------------------------------------------------------------------ */
/* Lesson content                                                      */
/* ------------------------------------------------------------------ */
const L0 = [
  { t: "objectives", items: [
    "Run your very first Python program",
    "Follow how Python reads a file — line by line, top to bottom",
    "Write comments, and understand Python's one unusual rule: indentation",
    "Ask a person for input with <code>input()</code>",
    "Say why data science picked Python out of every language there is",
  ]},
  { t: "hook", q: "Excel already makes charts. So why does a data scientist need to write code at all?", why: "Because a spreadsheet quietly gives up. Somewhere past a million rows it crawls, and when your manager says <b>\"redo last month's report with the new file\"</b>, you do the entire thing again by hand. Code does not forget the steps, does not get tired, and runs again in one second." },
  { t: "think", q: "You spent a whole day cleaning 50,000 rows in Excel. Next month the same file arrives with fresh data. What do you actually have to do?", a: "All of it again — and worse, there is <b>no record</b> of what you did, so you cannot even be sure you repeat it the same way. That is the real reason analysts move to code: a script is a <b>written record of every step</b>. Re-running it costs a second, anyone can read what it did, and it is identical every time." },

  { t: "h2", n: "1", text: "What Python actually is" },
  { t: "def", term: "Python", en: "Python is a programming language: a set of words and rules for writing instructions a computer can carry out.", hi: "In plain words: you write the steps, Python performs them — exactly, in order, and as many times as you ask." },
  { t: "analogy", concept: "A program", real: "A recipe", html: "A recipe is a list of steps in a fixed order, written so that <i>anybody</i> can follow it and get the same dish. A program is the same thing written for a computer — with one difference: the computer follows it <b>exactly</b>, including your mistakes. It will never guess what you meant." },
  { t: "code", file: "first.py", code: "print(\"Hello, DataMarg!\")", output: "Hello, DataMarg!" },
  { t: "psoft", html: "That is a complete Python program. One line. <code>print()</code> is an instruction that means <strong>\"put this on the screen\"</strong>, and the thing inside the quotes is what gets put there." },
  { t: "note", variant: "tip", html: "<b>Try changing it.</b> Put your own name in the quotes and run it again. Breaking and fixing a one-line program is the cheapest lesson you will ever get." },

  { t: "h2", n: "2", text: "How Python runs your file" },
  { t: "p", html: "Python reads your file the way you read a page: <strong>top to bottom, one line at a time</strong>. It finishes a line completely before it looks at the next one. Almost every confusing bug a beginner hits comes from forgetting this." },
  { t: "viz", name: "code-runner" },
  { t: "p", html: "Two things in there surprise nearly everyone the first time:" },
  { t: "p", html: "<strong>Storing something is silent.</strong> Three of those five lines put a value into memory and printed nothing at all. A program that stores ten things and never calls <code>print()</code> looks, from the outside, like it did nothing." },
  { t: "p", html: "<strong>The right-hand side is worked out first.</strong> On <code>total = marks + bonus</code>, Python calculates <code>82 + 5</code> and only then puts <code>87</code> under the name <code>total</code>." },

  { t: "h2", n: "3", text: "Comments — notes for humans" },
  { t: "p", html: "Anything after a <code>#</code> is ignored by Python completely. Comments are how you leave an explanation for the next person who reads your code — which, six months from now, is you." },
  { t: "code", file: "comments.py", code: "# GST is 18% in India\nprice = 1000\ntotal = price * 1.18   # add the tax\nprint(total)", output: "1180.0" },
  { t: "note", variant: "tip", html: "<b>Write comments about <i>why</i>, not <i>what</i>.</b> <code># add the tax</code> is useful. <code># multiply price by 1.18</code> just repeats the code back at you." },

  { t: "h2", n: "4", text: "Indentation — Python's one unusual rule" },
  { t: "p", html: "Most languages use curly braces to show what belongs inside what. Python uses <strong>spaces at the start of a line</strong>, and it is strict about them. Indented lines belong to the line above; a stray space is a real error, not a style opinion." },
  { t: "code", file: "indent.py", code: "marks = 85\n\nif marks > 40:\n    print(\"Passed\")      # indented -> belongs to the if\n    print(\"Well done\")   # also inside the if\n\nprint(\"Result printed\")  # not indented -> always runs", output: "Passed\nWell done\nResult printed" },
  { t: "note", variant: "warn", html: "<b>Use 4 spaces, and never mix tabs with spaces.</b> Python treats them as different, so a file that looks perfectly lined up on your screen can still fail with <code>IndentationError</code>. Every editor can be set to insert spaces when you press Tab — set it once and forget it." },

  { t: "h2", n: "5", text: "Asking a person for something" },
  { t: "p", html: "<code>input()</code> stops the program, waits for someone to type, and hands you whatever they typed." },
  { t: "code", file: "greet.py", code: "name = input(\"What is your name? \")\nprint(\"Hello,\", name)\nprint(\"Welcome to DataMarg\")" },
  { t: "note", variant: "warn", html: "<b>Remember this one — it causes more beginner bugs than anything else:</b> <code>input()</code> always gives you <b>text</b>, even when the person types a number. <code>input()</code> then <code>+ 1</code> will not add — you will meet this properly in the next lesson." },

  { t: "h2", n: "6", text: "Why data science picked Python" },
  { t: "p", html: "There are hundreds of programming languages. Data science settled on this one for three reasons, and none of them is that it is easy:" },
  { t: "dtypes", items: [
    { tag: "1", name: "It reads like English", desc: "Less time fighting syntax means more time on the actual problem.", ex: "if marks > 40:" },
    { tag: "2", name: "The libraries are already written", desc: "pandas, NumPy, Matplotlib, scikit-learn — decades of work you import in one line.", ex: "import pandas as pd" },
    { tag: "3", name: "It is what the jobs ask for", desc: "Job posts, interviews and existing company code are overwhelmingly Python.", ex: "python, sql, pandas" },
  ]},
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> a data analyst's day is mostly reading a file, cleaning it, calculating something, and reporting the answer. Every one of those is a Python line you will have written by the end of this track — and the shape you saw in Code Runner (store → calculate → show) is the shape of nearly all of it." },

  { t: "h2", n: "7", text: "Putting it together" },
  { t: "worked", title: "a small report that greets a student and shows their total", goal: "Read it before writing anything. Notice the <b>order</b>: nothing appears on screen until a <code>print()</code> runs, and nothing can be used before it has been stored.", steps: [
    { label: "1. Show a heading first", code: "print(\"--- Result ---\")", why: "Python runs top to bottom, so whatever you print first appears first. Order on the page is order on the screen." },
    { label: "2. Store what you were given", code: "name = \"Priya\"\nmarks = 78", why: "These two lines print nothing. Storing is silent — that is normal, not a mistake." },
    { label: "3. Work out the new value", code: "total = marks + 12", why: "The right side is calculated first (78 + 12), and only then does 90 go into <code>total</code>." },
    { label: "4. Show the result", code: "print(name, \"scored\", total)", why: "<code>print()</code> with commas puts a space between each piece automatically." },
  ], full: "print(\"--- Result ---\")   # 1. heading\nname = \"Priya\"            # 2. store\nmarks = 78\ntotal = marks + 12        # 3. calculate\nprint(name, \"scored\", total)  # 4. show", output: "--- Result ---\nPriya scored 90" },
  { t: "faded", intro: "Same shape, different student. Three pieces are missing — fill them in and press Check.", code: "print(\"--- Result ---\")\nname = \"Rahul\"\nmarks = 64\ntotal = marks ____ 6\n____(name, \"scored\", ____)", blanks: [
    { answer: "+", accept: ["plus"], why: "Step 3 — the bonus is added to the marks before anything is stored." },
    { answer: "print", why: "Step 4 — nothing reaches the screen without <code>print()</code>." },
    { answer: "total", why: "Print the value you just calculated, not <code>marks</code> — otherwise the bonus never shows up." },
  ], output: "--- Result ---\nRahul scored 70" },

  { t: "trace", intro: "Nothing here prints anything — it all happens silently in memory, which is exactly the point. Work out the values in your head, line by line.", code: "total = 10\nbonus = 5\ntotal = total + bonus\nbonus = 0", steps: [
    { q: "After line 3, <code>total</code> is", answer: "15", why: "Line 3 works out the right side first using the current values (10 + 5), then stores 15 back under <code>total</code>." },
    { q: "After line 4, <code>bonus</code> is", answer: "0", why: "Line 4 simply replaces what <code>bonus</code> held. Straightforward — it is the next one that catches people." },
    { q: "After line 4, <code>total</code> is", answer: "15", why: "This is the one worth pausing on. Line 3 already <b>finished</b> the calculation and stored 15. Changing <code>bonus</code> afterwards does not reach back and redo it — Python ran that line once, top to bottom, and moved on." },
  ]},

  { t: "drills", intro: "Short ones. Type each yourself before opening the answer.", items: [
    { task: "Print your own name.", code: "print(\"Aarav\")", out: "Aarav" },
    { task: "Print the number <code>2026</code> — no quotes needed.", code: "print(2026)", out: "2026" },
    { task: "Print two lines, <code>one</code> then <code>two</code>.", code: "print(\"one\")\nprint(\"two\")", out: "one\ntwo" },
    { task: "Print <code>Total: 90</code> using a comma between the two pieces.", code: "print(\"Total:\", 90)", out: "Total: 90" },
    { task: "Store 50 in <code>marks</code>, then print it.", code: "marks = 50\nprint(marks)", out: "50" },
    { task: "Write a line that Python ignores completely.", code: "# Python never reads this line\nprint(\"but it reads this\")", out: "but it reads this" },
    { task: "Print <code>Passed</code> only when <code>marks</code> is above 40 — mind the indentation.", code: "marks = 55\nif marks > 40:\n    print(\"Passed\")", out: "Passed" },
    { task: "Ask for a name and greet the person.", code: "name = input(\"Name: \")\nprint(\"Hi\", name)" },
  ]},

  { t: "mistakes", items: [
    { bad: "print(Hello)", why: "Without quotes, Python thinks <code>Hello</code> is the <b>name of something you stored earlier</b>, goes looking for it, and finds nothing — <code>NameError</code>. Text always needs quotes.", fix: "print(\"Hello\")" },
    { bad: "Print(\"Hello\")", why: "Python is <b>case-sensitive</b>. The instruction is <code>print</code>, all lowercase. <code>Print</code> is simply a name it has never heard of.", fix: "print(\"Hello\")" },
    { bad: "print(\"Hello\"", why: "The bracket was opened and never closed, so Python keeps reading, looking for the end, and runs off the edge of the file — <code>SyntaxError</code>. Every <code>(</code> needs its <code>)</code>.", fix: "print(\"Hello\")" },
    { bad: "marks = 85\n    print(marks)", why: "Nothing was indented <i>into</i> — there is no <code>if</code> or loop above it — so that extra space is meaningless and Python refuses the file with <code>IndentationError</code>. Indent only when a line belongs inside something.", fix: "marks = 85\nprint(marks)" },
  ]},

  { t: "debug", intro: "This is meant to print a student's total. It crashes instead. Read it and decide what is wrong before opening the fix.", code: "print(\"Total:\", total)\ntotal = 90", symptom: "NameError: name 'total' is not defined", q: "Both lines look fine on their own. So what is wrong?", fix: "total = 90\nprint(\"Total:\", total)", why: "Nothing is wrong with either line — the <b>order</b> is wrong. Python runs top to bottom, so on line 1 it goes looking for <code>total</code>, which does not exist yet; line 2 has not happened. <b>You must store something before you can use it.</b> Reading errors as \"what had not happened yet?\" will solve a surprising share of your bugs." },

  { t: "recap", items: [
    "A program is a recipe: steps in order, followed <b>exactly</b>",
    "Python reads <b>top to bottom, one line at a time</b> — store before you use",
    "Storing is silent; only <code>print()</code> puts anything on screen",
    "<code>#</code> starts a comment — explain <i>why</i>, not <i>what</i>",
    "Indentation is a rule, not a style — 4 spaces, never mixed with tabs",
    "<code>input()</code> hands you <b>text</b>, always",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Is Python compiled or interpreted?", a: "Python is <b>interpreted</b> — the interpreter reads and executes your file line by line, rather than turning the whole program into a machine-code executable first. That is why an error on line 40 still lets lines 1–39 run, and why Python is quick to try things in but slower than C at raw number-crunching." },
    { level: "beginner", q: "What does <code>print()</code> do, and what does it return?", a: "It writes its arguments to standard output, separated by spaces. Worth knowing: it <b>returns <code>None</code></b>, so <code>x = print(\"hi\")</code> puts <code>None</code> in <code>x</code>. Printing and returning are different things — a beginner mixing them up is very common." },
    { level: "beginner", q: "Why does Python use indentation instead of braces?", a: "Readability by force. In other languages the indentation is a convention that can lie about what the braces actually say; in Python the layout <i>is</i> the structure, so code that looks nested is nested. The trade-off is that whitespace becomes a real error, and mixing tabs with spaces breaks files." },
    { level: "intermediate", q: "Why does data science use Python rather than a faster language?", a: "Because the slow part is rarely Python. Libraries like NumPy and pandas do the heavy work in compiled C under a Python surface, so you get C speed with Python's readability. Add the ecosystem — scikit-learn, Matplotlib, Jupyter — and the productivity wins by far more than the raw language speed loses." },
    { level: "intermediate", q: "What is the difference between a script and a program here?", a: "In practice, very little in Python — a <code>.py</code> file you run top to bottom is usually called a script. The distinction that matters at work is whether the file is a one-off (a script you ran once to clean a dataset) or something re-run and depended on, which needs structure, tests and a <code>if __name__ == \"__main__\"</code> entry point." },
  ]},
];

const L1 = [
  { t: "objectives", items: [
    "Create a variable and store a value in it",
    "Recognise the four core data types — <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>",
    "Check any value's type with <code>type()</code>",
    "Convert one type into another (casting) without breaking your program",
    "Name variables the way professional Python code does",
  ]},
  { t: "hook", q: "How does Instagram remember your name?", why: "You type it once, and it comes back every single time — even after you close the app and open it a week later. The computer put that name <b>somewhere</b>. Today you build that somewhere." },
  { t: "think", q: "A computer has to remember your name. All it has is memory — no notebook, no diary. How will it find that name again later?", a: "Memory is like a huge wall of lockers. Putting the value inside a locker is not enough — you also have to <b>stick a label on that locker</b>, or you will never find it again. That label is the variable: a name that points to one place in memory." },
  { t: "h2", n: "1", text: "What is a variable?" },
  { t: "def", term: "Variable", en: "A variable is a named reference to a value stored in memory.", hi: "In plain words: a <b>name</b> you use to store a value now and pull it back later." },
  { t: "p", html: "Think of a <strong>labelled box</strong>. You put something inside, and from then on the label is enough — you never need to know which shelf it sits on. In programming that box is a <strong>variable</strong>." },
  { t: "analogy", concept: "Variable", real: "A labelled box", html: "The box is the place in memory. The label is the variable name. What is inside is the value. The contents can change while the label stays the same — which is exactly why writing <code>age = 21</code> today and <code>age = 22</code> next year is perfectly normal." },
  { t: "code", file: "variables.py", code: "# create a variable -> name = value\nname = \"Aarav\"\nage  = 21\nprint(name)\nprint(age)", output: "Aarav\n21" },
  { t: "psoft", html: "Here <code>=</code> does not mean \"is equal to\". It means <strong>\"take the value on the right and put it into the name on the left\"</strong>. Python reads that line right to left." },
  { t: "note", variant: "tip", html: "<b>Tip:</b> give a variable a name that says what it holds. <code>age = 21</code> beats <code>x = 21</code> — you will thank yourself inside a 200-line file." },
  { t: "viz", name: "variables-playground" },
  { t: "h2", n: "2", text: "Creating, changing and reusing" },
  { t: "p", html: "Python has no separate \"declare\" step. The moment you assign a value, the variable exists. Assign again and the name simply points at the new value." },
  { t: "code", file: "reassign.py", code: "score = 40\nprint(score)\n\nscore = 85          # same name, new value\nprint(score)\n\nscore = score + 5   # read the old value, then store the new one\nprint(score)", output: "40\n85\n90" },
  { t: "p", html: "That last line is worth a pause. Python first works out the right-hand side using the <em>current</em> value (<code>85 + 5</code>), and only then stores the result back into <code>score</code>. The name on the left is updated last — which is why <code>score = score + 5</code> is not the contradiction it looks like." },
  { t: "p", html: "You can also create several variables in one line, and swap two of them without a temporary third:" },
  { t: "code", file: "multiple.py", code: "x, y, z = 10, 20, 30\na = b = 0                       # two labels, one value\n\nfirst, second = \"Priya\", \"Rahul\"\nfirst, second = second, first   # swap, no temp needed\nprint(first, second)", output: "Rahul Priya" },
  { t: "note", variant: "key", html: "<b>Hold on to this:</b> a variable is a <b>label</b>, not the value itself. Two labels can point at the same value, and moving one label never disturbs the other." },
  { t: "trace", intro: "Read it line by line and work out what each name holds. Do not run it — working it out in your head is the whole exercise.", code: "x = 5\nx = x + 3\ny = x\nx = 100\ny = y + 1", steps: [
    { q: "After line 2, <code>x</code> is", answer: "8", why: "Line 2 reads the current <code>x</code> (5), adds 3, and stores 8 back under the same name." },
    { q: "After line 3, <code>y</code> is", answer: "8", why: "<code>y</code> takes whatever <code>x</code> held at that moment — 8." },
    { q: "After line 5, <code>x</code> is", answer: "100", why: "Line 4 pointed <code>x</code> at 100, and line 5 only touches <code>y</code>." },
    { q: "After line 5, <code>y</code> is", answer: "9", why: "This is the one that catches people. <code>y</code> was never <i>linked</i> to <code>x</code> — it copied the value 8 and went its own way, so line 4 does nothing to it. 8 + 1 = 9." },
  ]},
  { t: "h2", n: "3", text: "Naming rules (and what professionals actually do)" },
  { t: "p", html: "Some naming rules are enforced by Python — break them and the file will not even start. The rest are conventions the whole Python community follows, and interviewers do notice them." },
  { t: "p", html: "<b>Hard rules:</b> a name may contain letters, digits and underscores; it must not start with a digit; it cannot contain spaces or hyphens; and it cannot be one of Python's reserved keywords such as <code>for</code>, <code>if</code>, <code>class</code> or <code>None</code>." },
  { t: "code", file: "naming.py", code: "total_marks = 450      # valid - snake_case, the Python convention\n_count = 0             # valid - a leading underscore is allowed\nstudent2 = \"Priya\"     # valid - digits are fine, just not first\nGST_RATE = 0.18        # valid - ALL_CAPS means \"never change this\"\n\n# 2student = \"Priya\"   # SyntaxError - starts with a digit\n# total-marks = 450    # SyntaxError - a hyphen means minus\n# class = \"12th\"       # SyntaxError - 'class' is a keyword" },
  { t: "p", html: "The convention is <code>snake_case</code> for variables — <code>total_marks</code>, not <code>totalMarks</code> or <code>TotalMarks</code> — and <code>ALL_CAPS</code> for values that are never meant to change, like a tax rate." },
  { t: "note", variant: "tip", html: "<b>Case matters.</b> <code>marks</code>, <code>Marks</code> and <code>MARKS</code> are three different variables. A surprising share of \"but I just defined it!\" errors are one capital letter." },
  { t: "h2", n: "4", text: "The four core data types" },
  { t: "p", html: "Every value in Python has a <strong>type</strong>, and the type decides what you are allowed to do with it. These four cover most of the code you will write for a long time:" },
  { t: "dtypes", items: [
    { tag: "int", name: "Integer", desc: "Whole numbers, no decimal point.", ex: "age = 21" },
    { tag: "float", name: "Float", desc: "Numbers with a decimal point.", ex: "price = 249.50" },
    { tag: "str", name: "String", desc: "Text — always inside quotes.", ex: "name = \"Priya\"" },
    { tag: "bool", name: "Boolean", desc: "Only True or False.", ex: "is_active = True" },
  ]},
  { t: "p", html: "You never have to guess a type — ask Python with <code>type()</code>:" },
  { t: "code", file: "types.py", code: "price = 249.50\nprint(type(price))\nprint(type(\"249.50\"))\nprint(type(10 == 10))", output: "<class 'float'>\n<class 'str'>\n<class 'bool'>" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> when you load a sales CSV in pandas, a price column often arrives as <code>str</code> instead of <code>float</code> — one stray value like <code>\"1,200\"</code> is enough to do it. Every total after that is silently wrong. Checking types is the first thing a data analyst does with a new file, and it starts with exactly what you just learnt." },
  { t: "h2", n: "5", text: "Type conversion (casting)" },
  { t: "p", html: "Values often arrive as the wrong type. <code>input()</code>, for example, <strong>always</strong> hands you a string, even when the user typed a number. Converting is called <strong>casting</strong>, and each function is named after the type you want:" },
  { t: "code", file: "casting.py", code: "marks = \"85\"           # a string\nmarks = int(marks)      # now an int\nprint(marks + 5)\n\nprint(str(90) + \"%\")    # int -> str, so it can join text\nprint(float(\"99.5\") * 2)", output: "90\n90%\n199.0" },
  { t: "note", variant: "warn", html: "<b>Very common error:</b> <code>\"85\" + 5</code> raises <code>TypeError</code>. Python will not guess whether you meant to add numbers or join text — convert first." },
  { t: "viz", name: "casting-lab" },
  { t: "p", html: "Two conversions surprise almost everybody:" },
  { t: "code", file: "casting_edges.py", code: "print(int(9.7))            # cuts the decimal off, it does NOT round\nprint(round(9.7))          # use round() when you want rounding\nprint(int(float(\"9.7\")))   # a decimal string needs two steps", output: "9\n10\n9" },
  { t: "note", variant: "warn", html: "<code>int(\"9.7\")</code> on its own raises <code>ValueError</code>. <code>int()</code> only accepts a string that already looks like a whole number, so go through <code>float()</code> first." },
  { t: "h2", n: "6", text: "Why Python feels different: dynamic typing" },
  { t: "def", term: "Dynamic typing", en: "The type belongs to the value, not to the variable, so the same variable can hold a different type later.", hi: "In plain words: the box does not care what you put in it. In Java or C++ you must promise up front that a box will only ever hold whole numbers." },
  { t: "code", file: "dynamic.py", code: "x = 5\nprint(type(x))\n\nx = \"five\"       # completely legal in Python\nprint(type(x))", output: "<class 'int'>\n<class 'str'>" },
  { t: "p", html: "The upside is how fast this is to write. The downside is that a type mistake is only discovered when that line actually <em>runs</em> — which in a long data pipeline can be twenty minutes in. That is why experienced teams add type hints later (<code>marks: int = 85</code>); you will meet them in the Clean Code lesson." },
  { t: "h2", n: "7", text: "Putting it together" },
  { t: "worked", title: "marks arrive as text, add a 5-mark bonus, print a sentence", goal: "Study this before you write anything. Notice the <b>labels on each step</b> — that shape (get it, convert it, calculate, format, show) repeats in almost every program you will ever write.", steps: [
    { label: "1. Take the raw value", code: "marks_text = \"85\"", why: "This is what <code>input()</code> would hand you — text, even though it looks like a number." },
    { label: "2. Convert it to the type you need", code: "marks = int(marks_text)", why: "Nothing arithmetic can happen until this line runs. Convert as early as possible, not deep inside the calculation." },
    { label: "3. Do the calculation", code: "total = marks + 5", why: "Now <code>+</code> means addition, because both sides are numbers." },
    { label: "4. Convert back for display", code: "message = \"Final marks: \" + str(total)", why: "To glue a number onto text you must make it text first — the same rule in the other direction." },
    { label: "5. Show the result", code: "print(message)", why: "Keep the output on its own line; it makes the earlier steps easy to test one at a time." },
  ], full: "marks_text = \"85\"                       # 1. take the raw value\nmarks = int(marks_text)                 # 2. convert it\ntotal = marks + 5                       # 3. calculate\nmessage = \"Final marks: \" + str(total)  # 4. back to text\nprint(message)                          # 5. show it", output: "Final marks: 90" },
  { t: "faded", intro: "Same five steps, different data: a price arrives as text and you add a ₹40 delivery fee. Three pieces are missing — fill them in and press Check.", code: "price_text = \"1200\"\nprice = ____(price_text)\ntotal = price + 40\nmessage = \"Total: Rs \" + ____(total)\nprint(____)", blanks: [
    { answer: "int", why: "Step 2 — convert the text to a number, or <code>+ 40</code> would be a <code>TypeError</code>." },
    { answer: "str", why: "Step 4 — a number cannot be joined to text until it becomes text." },
    { answer: "message", why: "Step 5 — print the variable you just built. Printing <code>total</code> would lose the words around it." },
  ], output: "Total: Rs 1240" },
  { t: "drills", intro: "One drill per operation from this lesson. Write it yourself first — the answer only teaches you something once you have committed to a guess.", items: [
    { task: "Store the city <code>Jaipur</code> in a variable called <code>city</code>, then print it.", code: "city = \"Jaipur\"\nprint(city)", out: "Jaipur" },
    { task: "Set <code>price</code> to 250, then raise it by 50 using its own value.", code: "price = 250\nprice = price + 50\nprint(price)", out: "300" },
    { task: "Create <code>a</code>, <code>b</code> and <code>c</code> as 1, 2 and 3 on a single line.", code: "a, b, c = 1, 2, 3\nprint(a, b, c)", out: "1 2 3" },
    { task: "Swap two variables without using a third one.", code: "x, y = \"first\", \"second\"\nx, y = y, x\nprint(x, y)", out: "second first" },
    { task: "Print the type of <code>3.0</code>. Guess before you run it.", code: "print(type(3.0))", out: "<class 'float'>" },
    { task: "Turn the string <code>\"42\"</code> into a number and add 8 to it.", code: "n = \"42\"\nprint(int(n) + 8)", out: "50" },
    { task: "Turn the number <code>18</code> into text and join it with <code>\" years\"</code>.", code: "age = 18\nprint(str(age) + \" years\")", out: "18 years" },
    { task: "Convert <code>7.9</code> to an int — predict the answer first.", code: "print(int(7.9))", out: "7" },
    { task: "Convert the string <code>\"7.9\"</code> to an int (it takes two steps).", code: "print(int(float(\"7.9\")))", out: "7" },
    { task: "Store <code>True</code> in <code>is_passed</code>, then print the value and its type.", code: "is_passed = True\nprint(is_passed)\nprint(type(is_passed))", out: "True\n<class 'bool'>" },
  ]},
  { t: "mistakes", items: [
    { bad: '"85" + 5', why: "Python decides what <code>+</code> means from the types around it — two strings get <b>joined</b>, two numbers get <b>added</b>. One of each? It refuses to guess and raises <code>TypeError</code>.", fix: 'int("85") + 5' },
    { bad: 'age = "21"', why: "Those quotes make it <b>text</b>, not a number. It looks like 21 on screen, but <code>age + 1</code> fails. Since <code>input()</code> always returns a string, this is where the mistake usually sneaks in.", fix: "age = 21" },
    { bad: "2age = 21", why: "A variable name cannot start with a digit and cannot contain spaces or hyphens. Python stops while it is still <i>reading</i> the file — a <code>SyntaxError</code>, so nothing runs at all.", fix: "age2 = 21" },
    { bad: "name = 'Priya'\nprint(Name)", why: "Python is <b>case-sensitive</b>: <code>Name</code> and <code>name</code> are two different variables, so the second one was never created. You get <code>NameError</code>, which reads like Python forgot your variable — it did not; you asked for a different one.", fix: "name = 'Priya'\nprint(name)" },
  ]},
  { t: "debug", intro: "A student wrote this to print their age next year. It crashes. Read it and decide which line is wrong before you open the fix.", code: "age = input(\"Your age: \")   # the user types 21\nnext_year = age + 1\nprint(next_year)", symptom: "TypeError: can only concatenate str (not \"int\") to str", q: "Which line is actually wrong — and is it the line Python blamed?", fix: "age = int(input(\"Your age: \"))\nnext_year = age + 1\nprint(next_year)", why: "Python points at <b>line 2</b>, because that is where it gave up. The <b>mistake</b> is on line 1, where the value was never converted. That gap — between where a program breaks and where it went wrong — is most of what debugging actually is, and it starts here." },
  { t: "recap", items: [
    "A variable is a <b>name</b> that points at a value in memory — reassign it freely",
    "Four core types: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code> — check any of them with <code>type()</code>",
    "<code>snake_case</code>, never start with a digit, never use a keyword, and mind the capitals",
    "Cast with <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code> — <code>int()</code> truncates, it does not round",
    "Python is dynamically typed: the type travels with the value, not with the name",
    "The shape of almost every program: <b>get it → convert it → calculate → format → show</b>",
  ]},
  { t: "interview", items: [
    { level: "beginner", q: "What is a variable?", a: "A variable is a named reference to a value stored in memory. Python needs no declaration — writing <code>x = 5</code> creates it, and its type is decided by the value you gave it." },
    { level: "beginner", q: "What is the difference between <code>int</code> and <code>float</code>?", a: "<code>int</code> holds whole numbers (<code>21</code>), <code>float</code> holds numbers with a decimal point (<code>99.5</code>). Worth knowing: dividing two ints with <code>/</code> still gives a <b>float</b> — <code>10 / 2</code> is <code>5.0</code>, not <code>5</code>. That small detail gets caught in interviews." },
    { level: "beginner", q: "How do you check the type of a value at runtime?", a: "<code>type(value)</code> returns the type object, so <code>type(3.0)</code> gives <code>&lt;class 'float'&gt;</code>. For a yes/no check, <code>isinstance(x, int)</code> is preferred because it also accepts subclasses." },
    { level: "intermediate", q: "Python is dynamically typed — what does that mean?", a: "The type is attached to the <b>value</b>, not to the variable. So <code>x = 5</code> followed by <code>x = \"hello\"</code> is legal, where C or Java would reject it. Upside: fast to write. Downside: a type error only shows up when that line runs, not while you are writing it." },
    { level: "intermediate", q: "What do you watch out for when reading a number from <code>input()</code>?", a: "<code>input()</code> <b>always</b> returns a string, even if the user typed 21. Convert it yourself: <code>age = int(input())</code>. Skip that and <code>age + 1</code> raises <code>TypeError</code> — one of the most common bugs in beginner code." },
  ]},
];

const L2 = [
  { t: "objectives", items: [
    "Use every arithmetic operator, and know when <code>//</code> beats <code>/</code>",
    "Read a comparison as the <code>True</code>/<code>False</code> value it produces",
    "Combine conditions with <code>and</code> / <code>or</code> / <code>not</code> — and know what they really return",
    "Work out what an expression evaluates to, in the order Python actually uses",
  ]},
  { t: "hook", q: "17 chocolates, 5 children, everyone gets the same. How many each, and how many are left?", why: "Three each, two left over. Those are <b>two different questions</b>, and Python has a separate operator for each. Most people only ever learn one of them — and the other is what an interviewer asks about." },
  { t: "think", q: "In Python, <code>17 / 5</code> gives <code>3.4</code>. But you need only the <b>3</b> (whole boxes filled), or only the <b>2</b> (what is left). What do you use?", a: "<code>17 // 5</code> → <b>3</b> — floor division, the decimal part is dropped.<br/><code>17 % 5</code> → <b>2</b> — modulo, what remains.<br/><br/>These two show up everywhere: checking even or odd with <code>n % 2</code>, splitting rows into pages, sharing something out equally, wrapping an index back to the start of a list." },

  { t: "h2", n: "1", text: "Arithmetic operators" },
  { t: "def", term: "Operator", en: "An operator is a symbol that performs an operation on one or more values.", hi: "The values an operator works on are called its <b>operands</b>. In <code>17 + 5</code>, <code>+</code> is the operator and <code>17</code> and <code>5</code> are the operands." },
  { t: "p", html: "Seven of them do arithmetic: <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide, <code>//</code> floor divide, <code>%</code> remainder, and <code>**</code> power." },
  { t: "code", file: "arithmetic.py", code: "print(17 + 5)\nprint(17 - 5)\nprint(17 * 5)\nprint(17 / 5)\nprint(17 // 5)\nprint(17 % 5)\nprint(2 ** 3)", output: "22\n12\n85\n3.4\n3\n2\n8" },
  { t: "note", variant: "warn", html: "<b>Look at the fourth line.</b> <code>17 / 5</code> gave <code>3.4</code>, and <code>10 / 2</code> would give <code>5.0</code> — not <code>5</code>. In Python 3, <code>/</code> <b>always</b> produces a float, even when the division is exact. When you want a whole number, you have to ask for one with <code>//</code>." },
  { t: "viz", name: "operator-lab" },
  { t: "p", html: "Change the two numbers in that panel and watch <code>/</code>, <code>//</code> and <code>%</code> answer the same division three different ways. The relationship between them is worth remembering: <code>a</code> is always <code>(a // b) * b + (a % b)</code>." },
  { t: "analogy", concept: "// and %", real: "Paying with notes", html: "You owe ₹1730 and you only have ₹500 notes. <code>1730 // 500</code> is <b>3</b> — the notes you can hand over. <code>1730 % 500</code> is <b>230</b> — what you still owe after them. Same division, two answers, and which one you need depends entirely on the question." },

  { t: "h2", n: "2", text: "Comparison operators" },
  { t: "p", html: "These compare two values, and the answer is always <code>True</code> or <code>False</code> — never anything else: <code>==</code> equal, <code>!=</code> not equal, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>." },
  { t: "code", file: "compare.py", code: "print(10 == 10)\nprint(5 > 8)\nprint(3 != 4)\nprint(7 >= 7)", output: "True\nFalse\nTrue\nTrue" },
  { t: "note", variant: "tip", html: "<b>One equals sign stores, two compare.</b> <code>age = 18</code> puts 18 into <code>age</code>. <code>age == 18</code> asks whether it is already 18. Writing <code>=</code> where you meant <code>==</code> is the single most common beginner mistake in every language that has both." },
  { t: "p", html: "Python also lets you chain them the way mathematics does. <code>13 &lt; age &lt; 60</code> is legal, and it means exactly <code>13 &lt; age and age &lt; 60</code> — with <code>age</code> worked out only once. Most other languages cannot do this." },

  { t: "h2", n: "3", text: "Logical operators — and what they actually return" },
  { t: "p", html: "<code>and</code> needs both sides true, <code>or</code> needs either side, <code>not</code> flips the answer." },
  { t: "code", file: "logical.py", code: "age = 20\nprint(age > 18 and age < 60)\nprint(age < 13 or age > 60)\nprint(not age > 18)", output: "True\nFalse\nFalse" },
  { t: "p", html: "Now the part that surprises people. <code>and</code> and <code>or</code> do <b>not</b> hand back <code>True</code> or <code>False</code> — they hand back <b>one of the operands</b>. They stop as soon as the answer is settled, which is called <b>short-circuiting</b>." },
  { t: "code", file: "shortcircuit.py", code: "print(0 and 5)\nprint(2 and 5)\nprint(0 or \"fallback\")\nprint(\"\" or \"default\")", output: "0\n5\nfallback\ndefault" },
  { t: "p", html: "Read it as: <code>and</code> returns the first <b>falsy</b> value it meets, otherwise the last one. <code>or</code> returns the first <b>truthy</b> value, otherwise the last. That last line is a real idiom — <code>name or \"Guest\"</code> is how you supply a default." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> <code>%</code> is how rows get bucketed and how a sample of every tenth record is taken; <code>//</code> is how a result set is cut into pages. And the <code>/</code> float rule bites for real — a total built with <code>/</code> comes out as <code>1250.0000000000002</code> in a report, and someone has to explain the number to a client. Knowing which operator returns which <i>type</i> is not trivia." },

  { t: "h2", n: "4", text: "Order of operations" },
  { t: "p", html: "An expression is not read strictly left to right. Python applies <code>**</code> first, then <code>*</code> <code>/</code> <code>//</code> <code>%</code>, then <code>+</code> <code>-</code>, then comparisons, and <code>and</code> / <code>or</code> last of all." },
  { t: "code", file: "precedence.py", code: "print(2 + 3 * 2)\nprint((2 + 3) * 2)\nprint(2 ** 3 ** 2)\nprint(-7 // 2)", output: "8\n10\n512\n-4" },
  { t: "note", variant: "warn", html: "Two traps in there. <code>2 ** 3 ** 2</code> is <b>512</b>, not 64 — power groups from the <b>right</b>, so it is <code>2 ** 9</code>. And <code>-7 // 2</code> is <b>-4</b>, not -3, because floor division always rounds <b>downward</b>, and -4 is below -3.5. When in doubt, put in the brackets; nobody has ever complained that an expression was too clear." },

  { t: "trace", intro: "An order total with a flat 10% discount. Work out what each name holds after the line runs — the interesting one is line 4.", code: "price = 249\nqty = 3\ntotal = price * qty\ndiscount = total // 10\nfinal = total - discount", steps: [
    { q: "After line 3, <code>total</code> is", answer: "747", why: "<code>249 * 3</code>. Multiplication happens before the name <code>total</code> is given anything." },
    { q: "After line 4, <code>discount</code> is", answer: "74", why: "A tenth of 747 is 74.7, but <code>//</code> throws the decimal away and gives <b>74</b>. That is the whole point of using it here — you cannot discount 74.7 rupees." },
    { q: "After line 5, <code>final</code> is", answer: "673", why: "<code>747 - 74</code>. Note it is 673, not 672.3 — every value in this chain stayed a whole number because <code>//</code> was used instead of <code>/</code>." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the sum of 12 and 8.", code: "print(12 + 8)", out: "20" },
    { task: "Print how many whole times 5 goes into 17.", code: "print(17 // 5)", out: "3" },
    { task: "Print what is left over when 17 is divided by 5.", code: "print(17 % 5)", out: "2" },
    { task: "Print 3 raised to the power 4.", code: "print(3 ** 4)", out: "81" },
    { task: "Print whether 10 is even, using <code>%</code>.", code: "print(10 % 2 == 0)", out: "True" },
    { task: "Print the last digit of 4729.", code: "print(4729 % 10)", out: "9" },
    { task: "Print whether an age of 25 is between 18 and 60 inclusive.", code: "age = 25\nprint(age >= 18 and age <= 60)", out: "True" },
    { task: "Write the same check as a chained comparison.", code: "age = 25\nprint(18 <= age <= 60)", out: "True" },
    { task: "Print whether the day is a weekend, using <code>or</code>.", code: "day = \"Sunday\"\nprint(day == \"Saturday\" or day == \"Sunday\")", out: "True" },
    { task: "Use <code>or</code> to fall back to <code>Guest</code> when the name is empty.", code: "name = \"\"\nprint(name or \"Guest\")", out: "Guest" },
    { task: "Print 17 divided by 5 as a plain division, and notice the type.", code: "print(17 / 5)", out: "3.4" },
  ]},

  { t: "mistakes", items: [
    { bad: "if age = 18:", why: "<code>=</code> <b>stores</b>, <code>==</code> <b>compares</b>. Python is kind here and refuses with a <code>SyntaxError</code>. In C the same line quietly assigns and the condition is always true, which is a bug people have lost days to.", fix: "if age == 18:" },
    { bad: "total = 10 / 2   # expecting 5", why: "<code>/</code> always returns a float, so this is <code>5.0</code>. It looks harmless until the value is used as a list index or printed in a report, where <code>5.0</code> and <code>5</code> are visibly different.", fix: "total = 10 // 2   # 5" },
    { bad: "print(2 + 3 * 2)   # expecting 10", why: "Multiplication runs before addition, so this is <code>8</code>. Python is not reading left to right; it is applying precedence, exactly like ordinary arithmetic.", fix: "print((2 + 3) * 2)   # 10" },
    { bad: "print(-7 // 2)   # expecting -3", why: "Floor division rounds <b>down</b>, not toward zero. -3.5 rounded down is <b>-4</b>. For positive numbers the two ideas agree, which is why this only ever surprises you the first time a negative appears.", fix: "print(int(-7 / 2))   # -3, if truncation is what you meant" },
  ]},

  { t: "debug", intro: "Ninety rupees is to be split equally between four friends, each getting a whole number of rupees, and whatever cannot be split is left over. It reports nothing left over, which cannot be right. Read it before opening the fix.", code: "total = 90\nfriends = 4\n\neach = total / friends\nleft = total - each * friends\n\nprint(each, left)", symptom: "prints 22.5 0.0, but each share must be a whole number and 2 should be left over", q: "Nothing crashes and the arithmetic is correct. So which operator is answering the wrong question?", fix: "total = 90\nfriends = 4\n\neach = total // friends\nleft = total % friends\n\nprint(each, left)", why: "<code>/</code> answered \"how much is 90 divided by 4\" — 22.5, perfectly true and completely useless, because you cannot hand someone half a rupee. Multiplying that back gives 90 again, so <code>left</code> is 0. <code>//</code> asks \"how many whole rupees each\" and <code>%</code> asks \"what could not be shared\", which is what the problem was actually about. The lesson is that the bug was never in the maths — it was in choosing an operator that answers a different question." },

  { t: "recap", items: [
    "<code>/</code> always gives a float; <code>//</code> gives the whole part, <code>%</code> gives the remainder",
    "<code>//</code> rounds <b>down</b>, so <code>-7 // 2</code> is <code>-4</code>",
    "Comparisons always produce <code>True</code> or <code>False</code>, and can be chained: <code>13 &lt; age &lt; 60</code>",
    "<code>and</code> / <code>or</code> return an <b>operand</b>, not a boolean — which is what makes <code>name or \"Guest\"</code> work",
    "<code>**</code> groups from the right, and <code>*</code> beats <code>+</code> — bracket anything you would have to think twice about",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>/</code> and <code>//</code>?", a: "<code>/</code> is <b>true division</b> and always returns a float, so <code>10 / 2</code> is <code>5.0</code>. <code>//</code> is <b>floor division</b> and returns the value rounded down, so <code>10 // 3</code> is <code>3</code>. Add that floor means <i>downward</i>, not <i>toward zero</i>: <code>-7 // 2</code> is <code>-4</code>." },
    { level: "beginner", q: "What is <code>%</code> used for?", a: "It gives the remainder. The everyday uses are checking even or odd with <code>n % 2 == 0</code>, taking every nth item, splitting things into fixed-size groups, and wrapping an index around with <code>i % len(items)</code> so it never runs off the end." },
    { level: "intermediate", q: "Does <code>and</code> return <code>True</code>/<code>False</code>?", a: "No — it returns one of the <b>operands</b>. <code>a and b</code> gives <code>a</code> when <code>a</code> is falsy, otherwise <code>b</code>. So <code>0 and 5</code> is <code>0</code> and <code>2 and 5</code> is <code>5</code>. It also <b>short-circuits</b>: if <code>a</code> settles the answer, <code>b</code> is never evaluated, which is why <code>x != 0 and total / x</code> is safe." },
    { level: "intermediate", q: "Why does <code>13 &lt; age &lt; 60</code> work in Python?", a: "It is a <b>chained comparison</b>. Python expands it to <code>13 &lt; age and age &lt; 60</code> and evaluates <code>age</code> only once — which matters if that middle term is an expensive function call. In most other languages the first comparison would produce a boolean and then be compared against 60, giving nonsense." },
    { level: "advanced", q: "What is <code>2 ** 3 ** 2</code>, and why?", a: "<b>512</b>. Almost every operator in Python is left-associative, but <code>**</code> is <b>right</b>-associative, so it groups as <code>2 ** (3 ** 2)</code> = <code>2 ** 9</code>. Reading it left to right gives 64, which is the wrong answer for the right-looking reason." },
  ]},
];

const L3 = [
  { t: "objectives", items: [
    "Make a program decide, with <code>if</code> and <code>else</code>",
    "Handle several cases with <code>elif</code> — and know why the order matters",
    "Understand how indentation defines a block",
    "Write a one-line conditional (the ternary)",
  ]},
  { t: "hook", q: "How does an ATM know whether to hand over the cash or say \"insufficient balance\"?", why: "Every app you use is doing this every second — <b>check something, then decide</b>. Is the login right? Is the cart empty? Is this user an adult? All of it rests on the one idea you learn here." },
  { t: "think", q: "Grades: 90+ is A, 75+ is B, 40+ is C, otherwise Fail. A student has 82. If you write <b>four separate</b> <code>if</code> statements instead of using <code>elif</code>, what happens?", a: "All four are checked independently. 82 is <code>>= 75</code> <i>and</i> <code>>= 40</code>, so <b>both B and C get printed</b>.<br/><br/>That is the entire point of <code>elif</code>: the moment one matches, <b>stop looking</b>. It is not a tidiness choice, it is a correctness one." },

  { t: "h2", n: "1", text: "if and else" },
  { t: "def", term: "Conditional statement", en: "A conditional statement runs a block of code only when a given condition is true.", hi: "In plain words: the condition always answers <code>True</code> or <code>False</code>, and that answer decides whether the block underneath runs at all." },
  { t: "p", html: "You are teaching the program to choose: <b>if</b> this is true do that, <b>otherwise</b> do something else. The code belonging to a branch is <b>indented</b> — four spaces." },
  { t: "code", file: "ifelse.py", code: "age = 20\n\nif age >= 18:\n    print(\"Adult\")\nelse:\n    print(\"Minor\")", output: "Adult" },
  { t: "note", variant: "tip", html: "<b>Indentation is the syntax.</b> Python has no curly braces — the spaces are what make a block. Four is the convention, and staying consistent inside a block is the rule." },

  { t: "h2", n: "2", text: "elif — the cases in between" },
  { t: "p", html: "For more than two outcomes, use <code>elif</code> (short for else-if). Python checks them <b>from top to bottom and stops at the first true one</b>." },
  { t: "code", file: "grade.py", code: "marks = 82\n\nif marks >= 90:\n    print(\"A\")\nelif marks >= 75:\n    print(\"B\")\nelif marks >= 40:\n    print(\"C\")\nelse:\n    print(\"Fail\")", output: "B" },
  { t: "viz", name: "condition-flow" },
  { t: "p", html: "Move the marks to 92 in that panel and watch the second line. <code>marks >= 40</code> is perfectly true — and it still never runs, because Python already had its answer. <b>A condition being true is not enough; it has to be reached.</b>" },
  { t: "analogy", concept: "if / elif / else", real: "A guard with a checklist", html: "The guard reads top to bottom: \"VIP pass? → send them in.\" \"No? Regular ticket? → join the queue.\" \"Neither? → turn them away.\" The moment one matches he <b>stops reading</b>. That is exactly what <code>elif</code> does." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is how every data rule gets written — flagging a transaction as high value, bucketing customers into segments, deciding whether a row is clean enough to keep. Getting the <i>order</i> of the conditions wrong is one of the most common bugs in a real pipeline, and it never crashes; it quietly produces the wrong answer." },

  { t: "h2", n: "3", text: "The one-line version" },
  { t: "p", html: "When a decision only picks between two values, Python has a shorter form. The condition sits in the <b>middle</b>, which is the opposite of most languages:" },
  { t: "code", file: "ternary.py", code: "age = 15\nstatus = \"Adult\" if age >= 18 else \"Minor\"\nprint(status)", output: "Minor" },
  { t: "note", variant: "warn", html: "Fine for a small assignment. Nesting one inside another gets unreadable fast — when that happens, go back to a normal <code>if</code>." },

  { t: "trace", intro: "Read it in order and work out what each name holds. The trap is which line actually gets reached.", code: "score = 88\nresult = \"none\"\nif score >= 95:\n    result = \"top\"\nelif score >= 60:\n    result = \"good\"\nelif score >= 85:\n    result = \"great\"", steps: [
    { q: "After line 4, <code>result</code> is", answer: "none", why: "<code>88 >= 95</code> is False, so that body never ran — <code>result</code> still holds what line 2 put there." },
    { q: "After line 6, <code>result</code> is", answer: "good", why: "<code>88 >= 60</code> is True, so this branch runs and the chain is finished." },
    { q: "After line 8, <code>result</code> is", answer: "good", why: "Here is the real lesson. <code>88 >= 85</code> is true, but Python stopped at the branch above and never looked at this one. A stricter condition placed <b>after</b> a looser one is unreachable — the classic ordering bug." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Print <code>Pass</code> when <code>marks</code> is 40 or more.", code: "marks = 55\nif marks >= 40:\n    print(\"Pass\")", out: "Pass" },
    { task: "Print <code>Pass</code> or <code>Fail</code> using <code>else</code>.", code: "marks = 30\nif marks >= 40:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")", out: "Fail" },
    { task: "Three bands: 75+ prints <code>A</code>, 40+ prints <code>B</code>, otherwise <code>C</code>.", code: "marks = 62\nif marks >= 75:\n    print(\"A\")\nelif marks >= 40:\n    print(\"B\")\nelse:\n    print(\"C\")", out: "B" },
    { task: "Check two things at once — print <code>Eligible</code> only if age is 18+ <b>and</b> the person has an ID.", code: "age = 20\nhas_id = True\nif age >= 18 and has_id:\n    print(\"Eligible\")", out: "Eligible" },
    { task: "Print <code>Weekend</code> if the day is Saturday <b>or</b> Sunday.", code: "day = \"Sunday\"\nif day == \"Saturday\" or day == \"Sunday\":\n    print(\"Weekend\")", out: "Weekend" },
    { task: "Use a nested <code>if</code>: only check the password once you know the user exists.", code: "user = \"aarav\"\npassword = \"secret\"\nif user:\n    if password == \"secret\":\n        print(\"Logged in\")", out: "Logged in" },
    { task: "Write the same two-way decision as a one-line ternary.", code: "marks = 82\nprint(\"Pass\" if marks >= 40 else \"Fail\")", out: "Pass" },
    { task: "Print <code>Empty</code> when a list has nothing in it — without using <code>len()</code>.", code: "items = []\nif not items:\n    print(\"Empty\")", out: "Empty" },
  ]},

  { t: "mistakes", items: [
    { bad: "if marks >= 40:\nprint(\"Pass\")", why: "Not indented. Python has no braces — a block is <b>made of spaces</b>. Without the indent you get <code>IndentationError</code> and nothing runs at all.", fix: "if marks >= 40:\n    print(\"Pass\")" },
    { bad: "if marks = 40:", why: "<code>=</code> stores a value; a condition needs <code>==</code>, which compares. Python catches this as a <code>SyntaxError</code> rather than quietly assigning — a kindness some other languages do not offer.", fix: "if marks == 40:" },
    { bad: "if marks >= 40:\n    print(\"C\")\nif marks >= 75:\n    print(\"B\")", why: "Two separate <code>if</code>s are two separate questions, both asked. At 82 marks <b>both C and B</b> print. When exactly one outcome should win, they have to be one chain.", fix: "if marks >= 75:\n    print(\"B\")\nelif marks >= 40:\n    print(\"C\")" },
    { bad: "if marks >= 40:\n  print(\"Pass\")\n      print(\"Done\")", why: "One block, two different indents. Python does not insist on four spaces, but it does insist that a block is <b>consistent</b>. Mixing tabs with spaces is the worst version — it looks aligned and still fails.", fix: "if marks >= 40:\n    print(\"Pass\")\n    print(\"Done\")" },
  ]},

  { t: "debug", intro: "This should give 20% off to anyone spending 5000 or more, and 10% to anyone spending 1000 or more. A customer spends 6000 and gets 10%. Read it before opening the fix.", code: "amount = 6000\n\nif amount >= 1000:\n    discount = 10\nelif amount >= 5000:\n    discount = 20\nelse:\n    discount = 0\n\nprint(discount)", symptom: "prints 10, but 6000 should get 20", q: "Nothing errors and every line looks correct. So why is the answer wrong?", fix: "amount = 6000\n\nif amount >= 5000:\n    discount = 20\nelif amount >= 1000:\n    discount = 10\nelse:\n    discount = 0\n\nprint(discount)", why: "The conditions are in the wrong order. 6000 satisfies <code>>= 1000</code> first, Python stops there, and the 20% branch is unreachable for <b>every</b> amount. <b>In an if/elif chain the strictest condition goes first.</b> Notice this bug never crashes — it just hands the wrong discount to every big customer, which is exactly why bugs like it survive in real systems." },

  { t: "recap", items: [
    "<code>if</code> runs its block only when the condition is <b>True</b>",
    "<code>elif</code> adds more cases, checked <b>top to bottom</b>",
    "Python <b>stops at the first true branch</b> — later ones are never asked",
    "Put the <b>strictest</b> condition first, or it becomes unreachable",
    "Indentation makes the block — four spaces, kept consistent",
    "<code>value_a if condition else value_b</code> is the one-line form",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>elif</code> and separate <code>if</code> statements?", a: "Separate <code>if</code>s are all evaluated, so more than one branch can run. In an <code>if/elif</code> chain the first true branch wins and the rest are skipped entirely. For mutually exclusive cases like grades, <code>elif</code> is the correct choice — separate <code>if</code>s would produce two answers." },
    { level: "beginner", q: "Why does indentation matter so much in Python?", a: "Because there are <b>no braces</b> — the indentation <i>is</i> the syntax that defines a block. In most languages indentation is a readability convention that can disagree with the braces; in Python, code that looks nested is nested, and inconsistent indentation is a hard error." },
    { level: "intermediate", q: "Which values are treated as False in Python?", a: "<code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, empty <code>\"\"</code>, <code>[]</code>, <code>{}</code>, <code>()</code> and <code>set()</code>. Everything else is truthy, which is why <code>if items:</code> is preferred over <code>if len(items) > 0:</code>. The catch: if <code>0</code> is a legitimate value, that shortcut becomes a bug — check <code>is not None</code> instead." },
    { level: "intermediate", q: "How do you write a ternary in Python?", a: "<code>status = \"Adult\" if age >= 18 else \"Minor\"</code> — the condition sits in the middle, the reverse of C-style <code>? :</code>. It is an expression, so it fits anywhere a value fits, including inside a comprehension. Nesting them destroys readability, so past one level use a normal <code>if</code>." },
    { level: "intermediate", q: "In an if/elif chain, does the order of conditions affect correctness or only style?", a: "Correctness. Evaluation stops at the first true branch, so a broader condition placed above a narrower one makes the narrower one unreachable — checking <code>amount >= 1000</code> before <code>amount >= 5000</code> means nobody ever reaches the higher tier. It raises no error and produces only wrong output, which makes it genuinely dangerous." },
  ]},
];

const L4 = [
  { t: "objectives", items: [
    "Repeat work with a <code>for</code> loop, over a list, a string or a <code>range</code>",
    "Use <code>while</code> when you know the stopping condition but not the count",
    "Control a loop from inside with <code>break</code> and <code>continue</code>",
    "Read <code>range()</code> correctly — including why the stop value is never reached",
  ]},
  { t: "hook", q: "You need the total salary of ten lakh users. Are you going to write <code>+</code> ten lakh times?", why: "Of course not. But the computer still adds them one at a time — the difference is that <b>writing</b> it happens once and <b>running</b> it happens ten lakh times. That gap is the whole idea of a loop, and it is the first moment programming stops being a calculator." },
  { t: "think", q: "What does <code>range(5)</code> give you? Think carefully — how many numbers, and which ones?", a: "<b>Five numbers: 0, 1, 2, 3, 4.</b> The <code>5</code> itself is <b>not</b> included.<br/><br/>Python uses this \"start included, stop excluded\" rule everywhere — <code>range()</code>, slicing like <code>[1:3]</code>, all of it. Once that is settled in your head, half of all off-by-one bugs simply stop happening." },

  { t: "h2", n: "1", text: "The for loop" },
  { t: "def", term: "Loop", en: "A loop repeatedly executes a block of code, either for each item in a sequence or while a condition holds.", hi: "One pass through the block is called an <b>iteration</b>. A <code>for</code> loop runs once per item in a collection; a <code>while</code> loop runs as long as its condition stays true." },
  { t: "p", html: "A <code>for</code> loop takes a collection and hands you one item at a time. The indented block runs once per item, and the loop variable holds whichever item you are on." },
  { t: "code", file: "forloop.py", code: "total = 0\nfor n in [2, 4, 6, 8, 10]:\n    total += n\nprint(total)", output: "30" },
  { t: "viz", name: "loop-visualizer" },
  { t: "p", html: "Step through that panel and watch the loop variable change on each pass while the total carries forward. The variable is not one value — it is a new value every iteration." },

  { t: "h2", n: "2", text: "range() — counting without a list" },
  { t: "p", html: "You do not always have a list to loop over. <code>range()</code> produces the numbers for you: <code>range(stop)</code>, <code>range(start, stop)</code>, or <code>range(start, stop, step)</code>." },
  { t: "code", file: "range.py", code: "print(list(range(5)))\nprint(list(range(1, 5)))\nprint(list(range(1, 10, 2)))", output: "[0, 1, 2, 3, 4]\n[1, 2, 3, 4]\n[1, 3, 5, 7, 9]" },
  { t: "note", variant: "warn", html: "<b>The stop value is never produced.</b> <code>range(1, 5)</code> stops at 4. If you want 1 to 5, you must write <code>range(1, 6)</code>. This one rule is behind more beginner bugs than any other single thing in Python." },

  { t: "h2", n: "3", text: "The while loop" },
  { t: "p", html: "Use <code>while</code> when you cannot say in advance how many times it should run — only what would make it stop." },
  { t: "code", file: "while.py", code: "count = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint(\"Lift off\")", output: "3\n2\n1\nLift off" },
  { t: "note", variant: "tip", html: "Notice <code>count -= 1</code>. Every <code>while</code> loop needs something inside it that moves the condition towards false. The moment you write <code>while</code>, ask yourself: <b>what will make this stop?</b> If you cannot answer, you have written an infinite loop." },
  { t: "analogy", concept: "for vs while", real: "A guest list, or a doorway", html: "<b>for</b> is a guest list in your hand — you know exactly who is coming, you call each name, the list ends and you are done. <b>while</b> is standing at the door: you have no idea how many will arrive, you only know you stay \"as long as people keep coming\". That is why a <code>while</code> can run forever and a <code>for</code> cannot." },

  { t: "h2", n: "4", text: "break and continue" },
  { t: "p", html: "<code>break</code> leaves the loop immediately. <code>continue</code> abandons the current pass and jumps to the next one." },
  { t: "code", file: "breakcontinue.py", code: "for n in [4, 7, 10, 13, 16]:\n    if n % 2 != 0:\n        continue\n    if n > 10:\n        break\n    print(n)", output: "4\n10" },
  { t: "p", html: "Follow it: 4 is even and not above 10, so it prints. 7 is odd, so <code>continue</code> skips it. 10 prints. 13 is skipped. 16 is even but above 10, so <code>break</code> ends the loop — and nothing after it runs." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> nearly all real data work is a loop over rows — cleaning each record, checking each file, calling an API once per user. <code>continue</code> is how you skip a bad row instead of crashing the whole job, and <code>break</code> is how you stop early once you have found what you came for. A pipeline that dies on row 40,000 because of one missing value is a pipeline whose author had not met <code>continue</code>." },

  { t: "h2", n: "5", text: "The else nobody expects" },
  { t: "p", html: "A loop can carry an <code>else</code>. It runs when the loop finished <b>without</b> hitting <code>break</code> — which makes it exactly right for searching." },
  { t: "code", file: "forelse.py", code: "names = [\"asha\", \"vikram\", \"priya\"]\n\nfor name in names:\n    if name == \"rahul\":\n        print(\"found\")\n        break\nelse:\n    print(\"not found\")", output: "not found" },
  { t: "note", variant: "tip", html: "The name is genuinely misleading — it is not \"or else\". Read it as <b>nobreak</b>: run this if the loop was never interrupted." },

  { t: "trace", intro: "A running total over a list. Work out what each name holds once the line has run.", code: "items = [3, 5, 8]\ntotal = 0\nfor n in items:\n    total += n\ncount = len(items)", steps: [
    { q: "After line 2, <code>total</code> is", answer: "0", why: "The loop has not started yet. Line 2 only sets up the box the total will accumulate into." },
    { q: "After line 4 has finished running, <code>total</code> is", answer: "16", why: "The loop ran three times: 0+3, then +5, then +8. <code>total</code> is not reassigned each pass, it is added to — which is what makes it carry across iterations." },
    { q: "After line 5, <code>count</code> is", answer: "3", why: "<code>len()</code> counts the items in the list. Note it is 3 and not 16 — the number of items and the sum of them are different questions." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the numbers 0 to 4, one per line.", code: "for i in range(5):\n    print(i)", out: "0\n1\n2\n3\n4" },
    { task: "Add up a list and print the total.", code: "nums = [2, 4, 6]\ntotal = 0\nfor n in nums:\n    total += n\nprint(total)", out: "12" },
    { task: "Count the letters in <code>hello</code> using a loop, without <code>len()</code>.", code: "count = 0\nfor c in \"hello\":\n    count += 1\nprint(count)", out: "5" },
    { task: "Print the numbers from 2 up to and including 5, as a list.", code: "print(list(range(2, 6)))", out: "[2, 3, 4, 5]" },
    { task: "Print every third number from 0 to under 10.", code: "print(list(range(0, 10, 3)))", out: "[0, 3, 6, 9]" },
    { task: "Count down from 3 with a <code>while</code> loop.", code: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1", out: "3\n2\n1" },
    { task: "Stop the loop as soon as you reach 3.", code: "for n in [1, 2, 3, 4]:\n    if n == 3:\n        break\n    print(n)", out: "1\n2" },
    { task: "Print every number except 2.", code: "for n in [1, 2, 3, 4]:\n    if n == 2:\n        continue\n    print(n)", out: "1\n3\n4" },
    { task: "Print each character of <code>abc</code> on its own line.", code: "for ch in \"abc\":\n    print(ch)", out: "a\nb\nc" },
    { task: "Print each item with its position, using <code>enumerate</code>.", code: "for i, name in enumerate([\"asha\", \"vikram\"]):\n    print(i, name)", out: "0 asha\n1 vikram" },
    { task: "Print every pair from two nested loops over <code>range(2)</code>.", code: "for i in range(2):\n    for j in range(2):\n        print(i, j)", out: "0 0\n0 1\n1 0\n1 1" },
  ]},

  { t: "mistakes", items: [
    { bad: "for i in range(1, 5):\n    print(i)   # wanted 1 to 5", why: "<code>range(1, 5)</code> gives 1, 2, 3, 4 — <b>not 5</b>. The stop value is always excluded. This is the off-by-one error, the oldest and most common mistake in programming.", fix: "for i in range(1, 6):\n    print(i)" },
    { bad: "while count > 0:\n    print(count)", why: "Nothing ever changes <code>count</code>, so the condition stays true forever and the program hangs. A <code>while</code> loop with no change inside it is not a loop, it is a freeze.", fix: "while count > 0:\n    print(count)\n    count -= 1" },
    { bad: "for f in fruits:\n    fruits.remove(f)", why: "You are changing the list you are looping over. Each removal shifts the remaining items back while the loop's position moves forward, so items get <b>silently skipped</b>. No error appears — just a wrong answer, which is the most dangerous kind of bug.", fix: "for f in fruits[:]:\n    fruits.remove(f)" },
    { bad: "for i in range(len(names)):\n    print(names[i])", why: "This works, but it is the long way round and it comes from other languages. Python hands you the items directly, and when you need the position too, <code>enumerate</code> gives you both.", fix: "for name in names:\n    print(name)" },
  ]},

  { t: "debug", intro: "This should add up all four numbers and print 50. It prints 20 instead. Nothing crashes, and every line looks reasonable. Read it before opening the fix.", code: "nums = [5, 10, 15, 20]\n\nfor n in nums:\n    total = 0\n    total += n\n\nprint(total)", symptom: "prints 20, but the four numbers add up to 50", q: "The addition is correct and the loop visits every number. So why does only the last one survive?", fix: "nums = [5, 10, 15, 20]\n\ntotal = 0\nfor n in nums:\n    total += n\n\nprint(total)", why: "<code>total = 0</code> is <b>inside</b> the loop, so it is reset at the start of every pass. Each iteration wipes out everything counted so far and adds one number to zero — which is why the answer is the last number, not the sum. Setting up before the loop and accumulating inside it is the pattern behind every running total you will ever write. Indentation alone decided this, and Python had no way to warn you: both versions are perfectly valid code." },

  { t: "recap", items: [
    "<code>for</code> runs once per item — use it when you know what you are looping over",
    "<code>while</code> runs until its condition turns false — use it when you only know the stopping rule",
    "<code>range(a, b)</code> <b>excludes</b> <code>b</code>; <code>range(a, b, step)</code> counts in jumps",
    "<code>break</code> ends the loop; <code>continue</code> skips just this pass",
    "Set your accumulator up <b>before</b> the loop, never inside it",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "When would you use <code>for</code> and when <code>while</code>?", a: "<code>for</code> when you know <b>what</b> you are iterating over — a list, a string, a range. <code>while</code> when you do not know how many passes there will be and only know the stopping condition, such as \"until the user types quit\"." },
    { level: "beginner", q: "What is the difference between <code>break</code> and <code>continue</code>?", a: "<code>break</code> ends the <b>whole loop</b> and moves past it. <code>continue</code> abandons only the <b>current pass</b> and starts the next one. Think of <code>break</code> as \"stop, we are done\" and <code>continue</code> as \"skip this one, next please\"." },
    { level: "intermediate", q: "Can a loop have an <code>else</code>? When does it run?", a: "Yes, and it is unusual to Python. The <code>else</code> runs when the loop completes <b>without hitting <code>break</code></b>. It is built for searching: <code>break</code> when you find the item, and the <code>else</code> handles \"not found\" without needing a flag variable. The keyword is badly named — read it as <code>nobreak</code>." },
    { level: "intermediate", q: "What goes wrong if you modify a list while looping over it?", a: "The loop tracks its position by <b>index</b>. Removing an item shifts everything after it back by one, while the index still moves forward — so items get skipped. Nothing raises an error; the result is just quietly wrong. Loop over a copy (<code>items[:]</code>) or build a new list instead." },
    { level: "advanced", q: "What does <code>enumerate</code> give you, and why prefer it to <code>range(len(x))</code>?", a: "<code>enumerate</code> yields <code>(index, item)</code> pairs, so you get the position and the value together. <code>range(len(x))</code> gives you only the index and then makes you look the item up yourself — more code, an extra chance to index wrongly, and it fails on anything that is not indexable. <code>enumerate</code> also takes a <code>start</code>, so <code>enumerate(x, 1)</code> counts from one." },
  ]},
];

const L5 = [
  { t: "objectives", items: [
    "Build a list and reach any item by index, from either end",
    "Change a list with <code>append</code>, <code>extend</code>, assignment and <code>pop</code>",
    "Cut a piece out with slicing, and know that a slice is a new list",
    "Choose between a list and a tuple, and know why copying a list is not <code>b = a</code>",
  ]},
  { t: "hook", q: "You need to hold the names of 60 students in a class. Sixty variables — <code>name1</code>, <code>name2</code> … <code>name60</code>?", why: "And when the 61st joins? Or you need them sorted? Sixty separate names cannot be handled together at all — you cannot loop over them, count them or sort them. What you need is one container that holds <b>many things, in order</b>." },
  { t: "think", q: "<code>fruits = [\"apple\", \"mango\", \"kiwi\"]</code> — what is <code>fruits[1]</code>? And <code>fruits[-1]</code>?", a: "<code>fruits[1]</code> is <b>\"mango\"</b>. Indexing starts at <b>0</b>, so 1 is the second item.<br/><code>fruits[-1]</code> is <b>\"kiwi\"</b>. Negative indexes count from the back, and -1 is always the last item.<br/><br/>You never need <code>fruits[len(fruits) - 1]</code>. <code>[-1]</code> says the same thing and cannot go wrong." },

  { t: "h2", n: "1", text: "Lists and indexing" },
  { t: "def", term: "List", en: "A list is an ordered, mutable collection of values, each reachable by its index.", hi: "<b>Ordered</b> means items stay in the order you put them. <b>Mutable</b> means you can change it after creating it. <b>Index</b> is an item's position, counting from <code>0</code> forwards and <code>-1</code> backwards." },
  { t: "p", html: "A list holds several values in square brackets. Every item has a position: <code>0</code> for the first, and <code>-1</code> for the last no matter how long the list is." },
  { t: "code", file: "list.py", code: "fruits = [\"apple\", \"mango\", \"kiwi\"]\nprint(fruits[0])\nprint(fruits[-1])\nprint(len(fruits))", output: "apple\nkiwi\n3" },
  { t: "viz", name: "list-indexer" },
  { t: "p", html: "Move the index in that panel past the end of the list and watch what happens. Three items means valid indexes <code>0</code>, <code>1</code>, <code>2</code> — asking for <code>3</code> is an <code>IndexError</code>, and it is the commonest error message a beginner ever sees." },

  { t: "h2", n: "2", text: "Changing a list" },
  { t: "p", html: "A list is meant to be modified. <code>append()</code> adds one item at the end, assignment by index replaces one, and <code>pop()</code> removes the last item <b>and hands it back</b>." },
  { t: "code", file: "listops.py", code: "nums = [10, 20, 30]\nnums.append(40)\nnums[0] = 99\nprint(nums)\nprint(nums.pop())\nprint(nums)", output: "[99, 20, 30, 40]\n40\n[99, 20, 30]" },
  { t: "note", variant: "tip", html: "<code>append</code> adds <b>one</b> item; <code>extend</code> adds <b>each item</b> of another list. <code>a.append([3, 4])</code> gives you <code>[1, 2, [3, 4]]</code> — a list inside a list — while <code>a.extend([3, 4])</code> gives <code>[1, 2, 3, 4]</code>. An unexpected nested list is almost always this." },

  { t: "h2", n: "3", text: "Slicing — taking a piece" },
  { t: "p", html: "<code>[start:stop]</code> cuts out a section. Same rule as <code>range()</code>: the start is included, the stop is not. Leave either side empty to mean \"from the beginning\" or \"to the end\"." },
  { t: "code", file: "slicing.py", code: "letters = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nprint(letters[1:3])\nprint(letters[:2])\nprint(letters[2:])\nprint(letters[::-1])", output: "['b', 'c']\n['a', 'b']\n['c', 'd', 'e']\n['e', 'd', 'c', 'b', 'a']" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> a slice is how you take the first hundred rows of a dataset to test on, how you split data into training and test sets, and how you page results. Two things make it worth knowing exactly: a slice always returns a <b>new</b> list, so it never damages the original — and <code>[::-1]</code> is the shortest reverse in the language." },

  { t: "h2", n: "4", text: "Tuples — the list that will not change" },
  { t: "p", html: "A tuple looks like a list in round brackets, but once made it cannot be changed. Use it when the data is not supposed to move — and unpack it straight into names." },
  { t: "code", file: "tuple.py", code: "point = (3, 7)\nx, y = point\nprint(x)\nprint(y)\nprint(len(point))", output: "3\n7\n2" },
  { t: "analogy", concept: "List vs tuple", real: "A shopping list, or an Aadhaar card", html: "A <b>shopping list</b> is meant to be scribbled on — add, cross out, reorder. That is a list. An <b>Aadhaar card</b> is printed and finished; if the details change you get a new one issued. That is a tuple. It is why coordinates <code>(x, y)</code> and colours <code>(255, 0, 0)</code> are tuples: those values belong together and are not supposed to drift apart." },

  { t: "h2", n: "5", text: "Copying — the one that catches everyone" },
  { t: "p", html: "<code>b = a</code> does <b>not</b> make a second list. It gives the same list a second name, so a change through either name shows up in both. <code>a[:]</code> makes a real copy." },
  { t: "code", file: "copying.py", code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)\n\nc = a[:]\nc.append(5)\nprint(a)\nprint(c)", output: "[1, 2, 3, 4]\n[1, 2, 3, 4]\n[1, 2, 3, 4, 5]" },
  { t: "note", variant: "warn", html: "Read the first two lines of output again. Appending to <code>b</code> changed <code>a</code>, because they were never two lists. Appending to <code>c</code> did not, because <code>a[:]</code> actually copied. Nothing errors either way, which is exactly why this bug survives so long." },

  { t: "trace", intro: "A list of scores being updated. Work out what each name holds once the line has run.", code: "scores = [40, 55, 70]\nscores.append(90)\ntop = scores[-1]\nfirst_two = scores[:2]\ncount = len(scores)", steps: [
    { q: "After line 3, <code>top</code> is", answer: "90", why: "<code>append</code> put 90 at the end on line 2, and <code>[-1]</code> always reads the last item — whatever the length happens to be." },
    { q: "After line 4, <code>first_two</code> is", answer: "[40, 55]", accept: ["[40,55]", "40, 55", "40,55"], why: "<code>[:2]</code> takes indexes 0 and 1. The stop value is excluded, so 70 is not included — and the original list is untouched." },
    { q: "After line 5, <code>count</code> is", answer: "4", why: "Three to start with, one appended. Note that slicing on line 4 did not remove anything: a slice copies, it does not cut." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the first item of the list.", code: "print([\"a\", \"b\", \"c\"][0])", out: "a" },
    { task: "Print the last item without using <code>len()</code>.", code: "print([\"a\", \"b\", \"c\"][-1])", out: "c" },
    { task: "Print how many items a list has.", code: "print(len([1, 2, 3, 4]))", out: "4" },
    { task: "Add 3 to the end of the list and print it.", code: "nums = [1, 2]\nnums.append(3)\nprint(nums)", out: "[1, 2, 3]" },
    { task: "Replace the middle item with 99.", code: "nums = [1, 2, 3]\nnums[1] = 99\nprint(nums)", out: "[1, 99, 3]" },
    { task: "Print the middle two items of a four-item list.", code: "print([10, 20, 30, 40][1:3])", out: "[20, 30]" },
    { task: "Print the list reversed, using a slice.", code: "print([1, 2, 3][::-1])", out: "[3, 2, 1]" },
    { task: "Copy a list safely, then add to the copy. The original must not change.", code: "a = [1, 2]\nb = a[:]\nb.append(3)\nprint(a)", out: "[1, 2]" },
    { task: "Join two lists into one with <code>extend</code>.", code: "a = [1, 2]\na.extend([3, 4])\nprint(a)", out: "[1, 2, 3, 4]" },
    { task: "Unpack a tuple into two names and print their sum.", code: "x, y = (4, 9)\nprint(x + y)", out: "13" },
    { task: "Print the total of a list of numbers.", code: "print(sum([5, 10, 15]))", out: "30" },
  ]},

  { t: "mistakes", items: [
    { bad: "fruits[3]   # the list has 3 items", why: "Three items have indexes <b>0, 1, 2</b>. There is no index 3, so this is an <code>IndexError</code>. The last item sits at <code>len - 1</code>, or just write <code>[-1]</code> and stop counting.", fix: "fruits[2]   # or fruits[-1]" },
    { bad: "b = a\nb.append(4)   # a changed too", why: "<code>b = a</code> does not build a new list — both names point at the <b>same</b> list, so a change through one is visible through the other. This catches every beginner exactly once, and it never raises an error.", fix: "b = a[:]   # or list(a)" },
    { bad: "nums = (1, 2, 3)\nnums.append(4)", why: "A tuple is <b>immutable</b>, so it has no <code>append</code> at all — <code>AttributeError</code>. If the data needs to change, it should have been a list; if it should not change, that is the tuple doing its job.", fix: "nums = [1, 2, 3]\nnums.append(4)" },
    { bad: "a = [1, 2]\na.append([3, 4])   # expecting [1, 2, 3, 4]", why: "<code>append</code> adds its argument as <b>one item</b>, so you get <code>[1, 2, [3, 4]]</code> — a list nested inside a list. Later code then trips over an item that is not a number.", fix: "a.extend([3, 4])   # [1, 2, 3, 4]" },
  ]},

  { t: "debug", intro: "This takes a backup of a list before changing it, then prints the backup. The backup shows the change too, which defeats the whole point. Nothing crashes. Read it before opening the fix.", code: "original = [1, 2, 3]\nbackup = original\n\noriginal.append(4)\n\nprint(\"backup:\", backup)", symptom: "prints backup: [1, 2, 3, 4], but the backup was taken before the append", q: "The backup was made on line 2, before anything was added. So how did the 4 get into it?", fix: "original = [1, 2, 3]\nbackup = original[:]\n\noriginal.append(4)\n\nprint(\"backup:\", backup)", why: "<code>backup = original</code> never made a backup. It gave the one list a second name, so there was only ever one list to append to. <code>original[:]</code> copies the items into a genuinely new list, and only then does the word backup mean anything. This is the most expensive one-character-class mistake in Python: nothing errors, the code reads correctly, and the data quietly moves under you. Any time you plan to keep an <i>earlier</i> version of something, ask whether you copied it or just renamed it." },

  { t: "recap", items: [
    "A list is ordered and changeable; index from <code>0</code>, or from the back with <code>-1</code>",
    "<code>append</code> adds one item, <code>extend</code> adds each item of another list",
    "<code>[a:b]</code> includes <code>a</code>, excludes <code>b</code>, and returns a <b>new</b> list",
    "A tuple <code>()</code> cannot be changed — use it for values that belong together",
    "<code>b = a</code> is a second name, not a copy. Use <code>a[:]</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between a list and a tuple?", a: "A list is <b>mutable</b> (<code>[]</code>, can be changed); a tuple is <b>immutable</b> (<code>()</code>, cannot). A tuple is slightly faster and smaller, and — the answer they are usually listening for — it can be used as a <b>dictionary key</b>, which a list cannot." },
    { level: "beginner", q: "What does <code>nums[1:3]</code> give you?", a: "The items at indexes <b>1 and 2</b> — not 3. Slicing includes the start and excludes the stop, the same rule as <code>range()</code>. It also returns a <b>new</b> list, leaving the original alone." },
    { level: "intermediate", q: "What is the difference between <code>b = a</code> and <code>b = a[:]</code>?", a: "<code>b = a</code> is just another name for the same list — change one and both show it. <code>b = a[:]</code> makes a <b>shallow copy</b>, so the outer list is genuinely separate. But if the list contains other lists, those inner ones are still shared; that needs <code>copy.deepcopy()</code>." },
    { level: "intermediate", q: "<code>append()</code> versus <code>extend()</code>?", a: "<code>a.append([1, 2])</code> puts the whole list in as <b>one item</b>, giving <code>[..., [1, 2]]</code>. <code>a.extend([1, 2])</code> adds <b>each item separately</b>, giving <code>[..., 1, 2]</code>. If you find an unexpected nested list, this is why." },
    { level: "advanced", q: "Why can a tuple be a dictionary key when a list cannot?", a: "Dictionary keys must be <b>hashable</b>, and a hash has to stay the same for as long as the key is in use. A list can be changed after it is stored, which would move it to a different bucket and make it unfindable — so Python refuses outright with <code>TypeError: unhashable type: 'list'</code>. A tuple cannot change, so its hash is stable. The catch: a tuple containing a list is itself unhashable, because the mutable part is still in there." },
  ]},
];

const L6 = [
  { t: "objectives", items: [
    "Build a dictionary and get a value straight out of it by key",
    "Add, change and safely read keys that might not exist",
    "Use a set to get unique items — and know what it silently throws away",
    "Choose correctly between a list, a set and a dictionary",
  ]},
  { t: "hook", q: "You need one user's email out of ten lakh. How long does that take?", why: "In a list the computer may have to check <b>every single one</b>. In a dictionary it goes straight there — and it takes the <b>same time</b> whether you have ten users or ten crore. That is not magic, it is one trick, and you will understand it in the next two minutes." },
  { t: "think", q: "How can a dictionary jump straight to the right place without looking through everything first?", a: "The key is passed through a function that turns it into a <b>number</b> — that number is called a <b>hash</b>. The number says which slot in memory to look in. So nothing is searched; the location is <b>calculated</b>.<br/><br/>That is also why a key must be <b>immutable</b>. If a key could change, its hash would change, and the value would be stranded in a slot nobody can compute their way back to. It is exactly why a list cannot be a key and a tuple can." },

  { t: "h2", n: "1", text: "Dictionary — key to value" },
  { t: "def", term: "Dictionary", en: "A dictionary is a mutable collection of key-value pairs, where each key maps to exactly one value.", hi: "In plain words: you look things up by name instead of by position, and the lookup does not get slower as the dictionary grows." },
  { t: "p", html: "Every value has a <b>name</b> — its key. You write them inside curly braces as <code>key: value</code>." },
  { t: "code", file: "dict.py", code: "student = {\"name\": \"Priya\", \"age\": 21}\n\nprint(student[\"name\"])\n\nstudent[\"city\"] = \"Delhi\"   # a key that did not exist is added\nstudent[\"age\"] = 22         # a key that did exist is replaced\nprint(student)", output: "Priya\n{'name': 'Priya', 'age': 22, 'city': 'Delhi'}" },
  { t: "note", variant: "tip", html: "<b>List or dictionary?</b> A list finds things by position — <code>marks[0]</code>. A dictionary finds them by name — <code>student[\"age\"]</code>. If you would have to remember <i>which number</i> something is, you wanted a dictionary." },

  { t: "h2", n: "2", text: "Reading a key that might not be there" },
  { t: "p", html: "Asking for a key that does not exist does not give you an empty answer — it <b>stops the program</b> with <code>KeyError</code>. When you are not certain, use <code>.get()</code>." },
  { t: "code", file: "safe.py", code: "student = {\"name\": \"Priya\"}\n\nprint(student.get(\"email\"))            # missing -> None, no crash\nprint(student.get(\"email\", \"not set\"))  # or your own default\nprint(\"name\" in student)               # just checking? use in", output: "None\nnot set\nTrue" },
  { t: "note", variant: "warn", html: "<code>student[\"email\"]</code> on a missing key raises <code>KeyError</code> and everything after it stops. On a 50,000-row file that means the whole job dies on row 12,000 — which is why <code>.get()</code> shows up so often in real data code." },

  { t: "h2", n: "3", text: "Set — unique things only" },
  { t: "p", html: "A set holds each item <b>once</b>. Repeats are dropped as they go in, without a word." },
  { t: "code", file: "set.py", code: "marks = [90, 85, 90, 70, 85]\n\nunique = set(marks)\nprint(unique)\nprint(len(marks), \"values ->\", len(unique), \"unique\")", output: "{90, 85, 70}\n5 values -> 3 unique" },
  { t: "viz", name: "collection-bench" },
  { t: "p", html: "Add a city that is already in there and watch the three panels stop agreeing. The list keeps both rows, the set quietly drops one, and the dictionary keeps one key with the <b>last</b> value. Nothing errors in any of them — which is exactly what makes this worth seeing rather than reading." },
  { t: "analogy", concept: "Dictionary", real: "The contacts on your phone", html: "You do not remember numbers, you remember <b>names</b>. Type \"Amma\", the number appears. Name = <b>key</b>, number = <b>value</b>. And notice you cannot have two contacts saved under exactly the same name — saving again <b>replaces</b> the old number. A dictionary behaves identically." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> counting unique customers, removing duplicate order IDs, and mapping a product code to its price are all this, all day. The set is also the fastest way to answer \"is this ID one I have already seen?\" — a check that runs millions of times in a real pipeline." },

  { t: "trace", intro: "Work out what each container ends up holding. Nothing here raises an error — that is the difficulty.", code: "sales = {}\nsales[\"mumbai\"] = 120\nsales[\"delhi\"] = 95\nsales[\"mumbai\"] = 150\ncities = set([\"mumbai\", \"delhi\", \"mumbai\"])\nunique_cities = len(cities)\ntotal = len(sales) + unique_cities", steps: [
    { q: "After line 4, <code>sales</code> is", answer: "{'mumbai': 150, 'delhi': 95}", why: "Line 4 does not add a second Mumbai — one key holds one value, so 150 simply replaces 120. Two keys, not three. This one is safe to ask by its printout because a dictionary keeps <b>insertion order</b>; the set below is not." },
    { q: "After line 6, <code>unique_cities</code> is", answer: "2", why: "Three names went into the set and two came out — the repeated \"mumbai\" was dropped on the way, silently. Note the question asks for the <b>count</b>, not the printout: a set has no guaranteed order, so what you see when you print one is never something to rely on." },
    { q: "After line 7, <code>total</code> is", answer: "4", why: "Two keys plus two unique cities. Five values were written in total and four survived — the two that vanished, with no error, are the whole point of this lesson." },
  ]},

  { t: "drills", intro: "One per operation. Write each before opening the answer.", items: [
    { task: "Create a dictionary for a city and its sales, then print the sales.", code: "sales = {\"mumbai\": 120}\nprint(sales[\"mumbai\"])", out: "120" },
    { task: "Add a second city to that dictionary.", code: "sales = {\"mumbai\": 120}\nsales[\"delhi\"] = 95\nprint(sales)", out: "{'mumbai': 120, 'delhi': 95}" },
    { task: "Change Mumbai's value to 150.", code: "sales = {\"mumbai\": 120}\nsales[\"mumbai\"] = 150\nprint(sales)", out: "{'mumbai': 150}" },
    { task: "Read a key that does not exist — without crashing.", code: "sales = {\"mumbai\": 120}\nprint(sales.get(\"pune\", 0))", out: "0" },
    { task: "Check whether a key is present.", code: "sales = {\"mumbai\": 120}\nprint(\"mumbai\" in sales)", out: "True" },
    { task: "Remove a key.", code: "sales = {\"mumbai\": 120, \"delhi\": 95}\ndel sales[\"delhi\"]\nprint(sales)", out: "{'mumbai': 120}" },
    { task: "Loop over the dictionary printing each key and its value.", code: "sales = {\"mumbai\": 120, \"delhi\": 95}\nfor city, amount in sales.items():\n    print(city, amount)", out: "mumbai 120\ndelhi 95" },
    { task: "Count how many <b>unique</b> values are in a list.", code: "marks = [90, 85, 90, 70]\nprint(len(set(marks)))", out: "3" },
    { task: "Find the items common to two lists, using sets.", code: "a = [1, 2, 3, 4]\nb = [3, 4, 5]\nprint(sorted(set(a) & set(b)))", out: "[3, 4]" },
    { task: "Make an empty set — careful, it is not what you would guess.", code: "s = set()\nprint(type(s))", out: "<class 'set'>" },
  ]},

  { t: "mistakes", items: [
    { bad: 'student["email"]', why: "A missing key raises <code>KeyError</code> and the program <b>stops</b>. When you cannot be sure the key is there, use <code>.get()</code> — it hands back <code>None</code>, or a default you choose, instead of ending the run.", fix: 'student.get("email", "N/A")' },
    { bad: 'd = {["a"]: 1}', why: "A list cannot be a key. It is mutable, so its hash could change, and the value would be stranded where nothing can find it — <code>TypeError: unhashable type</code>. A tuple works, because it never changes.", fix: 'd = {("a",): 1}' },
    { bad: "s = {}", why: "That makes an empty <b>dictionary</b>, not a set — the braces belonged to dictionaries first. The mistake is quiet: <code>s.add(1)</code> then fails with <code>AttributeError</code> and the message points at the wrong line entirely.", fix: "s = set()" },
    { bad: "ids = set(all_ids)\ntotal = sum(ids)", why: "Converting to a set to \"clean up\" a list of IDs also deletes every legitimate repeat. If the same customer really did order twice, that order is now gone and the total is wrong — with no error to warn you.", fix: "ids = set(all_ids)   # only when duplicates are genuinely unwanted" },
  ]},

  { t: "debug", intro: "This should count how many orders each city made. It reports 1 for every city. Read it before opening the fix.", code: "orders = [\"mumbai\", \"delhi\", \"mumbai\", \"mumbai\", \"delhi\"]\n\ncounts = {}\nfor city in orders:\n    counts[city] = 1\n\nprint(counts)", symptom: "prints {'mumbai': 1, 'delhi': 1} — every city shows 1", q: "The loop clearly runs five times. So why is nothing above 1?", fix: "orders = [\"mumbai\", \"delhi\", \"mumbai\", \"mumbai\", \"delhi\"]\n\ncounts = {}\nfor city in orders:\n    counts[city] = counts.get(city, 0) + 1\n\nprint(counts)", why: "The loop does run five times — and every time it <b>overwrites</b> the key with 1 instead of adding to what was already there. One key holds one value, so the previous count is simply gone. <code>counts.get(city, 0) + 1</code> reads the old number first, defaulting to 0 the first time a city appears. This is the single most common dictionary bug there is, and like the others in this lesson it produces a clean-looking wrong answer rather than a crash." },

  { t: "recap", items: [
    "A dictionary maps a <b>key</b> to one value — lookup by name, not position",
    "<code>d[key]</code> raises <code>KeyError</code> if it is missing; <code>d.get(key, default)</code> does not",
    "Assigning an existing key <b>replaces</b> its value — it does not add a second one",
    "A set keeps each item <b>once</b>, dropping repeats silently",
    "Keys must be immutable — tuple yes, list no",
    "<code>{}</code> is an empty dictionary; an empty set is <code>set()</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between a list and a dictionary?", a: "A list is ordered and indexed by position; a dictionary maps keys to values and is looked up by key. The practical difference is cost: finding a value in a list means scanning it, while a dictionary lookup is roughly constant time no matter how large it grows." },
    { level: "beginner", q: "What happens if you assign to a key that already exists?", a: "The value is replaced. A key appears at most once, so there is no way to have two entries under the same key — which is why building counters with <code>d[k] = 1</code> instead of <code>d[k] = d.get(k, 0) + 1</code> is such a common bug." },
    { level: "intermediate", q: "Why must dictionary keys be immutable?", a: "The slot a key lives in is computed from its hash. If the key could change after being stored, its hash would change, and the value would sit in a slot nothing can compute its way back to. So <code>str</code>, <code>int</code> and <code>tuple</code> can be keys; <code>list</code> and <code>dict</code> cannot — attempting it raises <code>TypeError: unhashable type</code>." },
    { level: "intermediate", q: "When would you use a set instead of a list?", a: "When you only care whether something is present and duplicates are meaningless — deduplicating IDs, or testing membership. <code>x in some_set</code> is roughly constant time while <code>x in some_list</code> scans. The trade-off is that a set has no order and no positions, and it will discard duplicates you might actually have needed." },
    { level: "intermediate", q: "Are dictionaries ordered in Python?", a: "Since Python 3.7 a dictionary preserves <b>insertion order</b>, and that is a language guarantee, not an implementation detail. Sets do not — never rely on the order you see when printing one. If you need a dictionary sorted by key or value, sort it explicitly with <code>sorted(d.items())</code>." },
  ]},
];

const L7 = [
  { t: "objectives", items: [
    "Write a function with <code>def</code> and call it",
    "Take inputs as parameters and hand a result back with <code>return</code>",
    "Tell <code>print</code> and <code>return</code> apart — the difference that catches everyone",
    "Give a parameter a default, and avoid the trap that comes with it",
  ]},
  { t: "hook", q: "The same calculation appears in 40 places in your code. The formula changes. How many places do you fix?", why: "Forty. And if you miss one, that bug sits there for months. The real value of a function is not writing less — it is that there is <b>only one place to change</b>." },
  { t: "think", q: "<code>print(x)</code> and <code>return x</code> both look like they give you the value. What is actually different?", a: "<code>print</code> puts the value <b>on the screen</b> — and that is the end of it. <code>return</code> hands the value <b>back to whoever called the function</b>, so you can store it, add to it, or pass it on.<br/><br/><code>total = add(3, 4)</code> only works if <code>add</code> <b>returns</b>. If it only printed, <code>total</code> would be <code>None</code> — the screen looks perfect and the program is broken. This is the most common beginner mistake there is." },

  { t: "h2", n: "1", text: "Writing one" },
  { t: "def", term: "Function", en: "A function is a named, reusable block of code that takes inputs, performs a task, and optionally returns a value.", hi: "In plain words: the values a function <b>accepts</b> are its parameters; the values you <b>hand it</b> when calling are the arguments. <code>return</code> sends the answer back — and ends the function on the spot." },
  { t: "p", html: "Write it once with <code>def</code>, then call it as many times as you like." },
  { t: "code", file: "func.py", code: "def square(n):\n    return n * n\n\nprint(square(5))\nprint(square(9))", output: "25\n81" },

  { t: "h2", n: "2", text: "print is not return" },
  { t: "p", html: "This is the one to slow down on. Both of these look correct, and only one of them can be used in the next line of your program." },
  { t: "code", file: "add.py", code: "def add(a, b):\n    return a + b\n\ntotal = add(3, 4)\nprint(total + 10)   # only possible because add RETURNED", output: "17" },
  { t: "viz", name: "function-machine" },
  { t: "p", html: "Call the printing one and look at the right-hand panel: the screen shows the greeting, and <code>x</code> holds <code>None</code>. That is why the mistake survives so long — in a terminal the two versions look identical, and the program only breaks later, on a line that has nothing wrong with it." },
  { t: "note", variant: "warn", html: "A function with no <code>return</code> still returns something: <code>None</code>. So <code>total = add(3, 4)</code> on a printing function gives you <code>None</code>, and the error appears wherever <code>total</code> is next used — far from the real cause." },

  { t: "h2", n: "3", text: "Default arguments" },
  { t: "p", html: "Give a parameter a default and the caller can leave it out." },
  { t: "code", file: "default.py", code: "def greet(name=\"Guest\"):\n    return \"Hello, \" + name\n\nprint(greet())\nprint(greet(\"Priya\"))", output: "Hello, Guest\nHello, Priya" },
  { t: "note", variant: "tip", html: "<b>Don't Repeat Yourself.</b> If you have written the same three lines twice, that is usually a function waiting to be named." },
  { t: "analogy", concept: "A function", real: "A mixer grinder", html: "You put the spices in (arguments), press the button (the call), and paste comes out (the return value). You never need to know how the blades are arranged — only what goes in and what comes back. That is <b>abstraction</b>, and the whole of programming is built on it." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> every cleaning step you write — parse a date, strip a currency symbol, bucket an age — becomes a function, because you will run it on next month's file too. A data pipeline is mostly small functions called in order, and the ones that <code>return</code> rather than <code>print</code> are the ones you can test." },

  { t: "trace", intro: "Read it carefully. Two of these functions look almost the same and do not behave the same.", code: "def shout(word):\n    print(word.upper())\n\ndef quiet(word):\n    return word.lower()\n\na = shout(\"hello\")\nb = quiet(\"HELLO\")\nc = quiet(\"HELLO\").upper()", steps: [
    { q: "After line 7, <code>a</code> is", answer: "None", why: "<code>shout</code> printed \"HELLO\" to the screen and returned nothing — so <code>a</code> holds <code>None</code>. The screen looked right and the variable is empty." },
    { q: "After line 8, <code>b</code> is", answer: "hello", why: "<code>quiet</code> returned the value, so it actually landed in <code>b</code>." },
    { q: "After line 9, <code>c</code> is", answer: "HELLO", why: "Because <code>quiet</code> hands a real string back, you can keep working on it in the same expression. Try that on <code>shout(...)</code> and you get <code>AttributeError</code>, because you would be calling <code>.upper()</code> on <code>None</code>." },
  ]},

  { t: "drills", intro: "One per idea. Write each before opening the answer.", items: [
    { task: "Write <code>double(n)</code> that returns twice its input, and print <code>double(7)</code>.", code: "def double(n):\n    return n * 2\n\nprint(double(7))", out: "14" },
    { task: "Write a function taking two numbers and returning the larger one.", code: "def bigger(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(bigger(3, 9))", out: "9" },
    { task: "Store a function's result in a variable, then use it.", code: "def add(a, b):\n    return a + b\n\ntotal = add(3, 4)\nprint(total + 10)", out: "17" },
    { task: "Show what a function without <code>return</code> gives back.", code: "def show(n):\n    print(n)\n\nresult = show(5)\nprint(result)", out: "5\nNone" },
    { task: "Give a parameter a default and call the function both ways.", code: "def greet(name=\"Guest\"):\n    return \"Hello, \" + name\n\nprint(greet())\nprint(greet(\"Priya\"))", out: "Hello, Guest\nHello, Priya" },
    { task: "Call a function using keyword arguments, in the wrong order on purpose.", code: "def rate(price, qty):\n    return price * qty\n\nprint(rate(qty=3, price=20))", out: "60" },
    { task: "Return two values at once and unpack them.", code: "def stats(nums):\n    return min(nums), max(nums)\n\nlow, high = stats([4, 9, 1])\nprint(low, high)", out: "1 9" },
    { task: "Use <code>return</code> to leave a function early.", code: "def check(n):\n    if n < 0:\n        return \"negative\"\n    return \"fine\"\n\nprint(check(-5))", out: "negative" },
    { task: "Write a function that calls another function.", code: "def square(n):\n    return n * n\n\ndef sum_of_squares(a, b):\n    return square(a) + square(b)\n\nprint(sum_of_squares(3, 4))", out: "25" },
    { task: "Show that a variable made inside a function does not exist outside it.", code: "def f():\n    inside = 10\n    return inside\n\nprint(f())\nprint(\"inside\" in dir())", out: "10\nFalse" },
  ]},

  { t: "mistakes", items: [
    { bad: "def add(a, b):\n    print(a + b)\n\ntotal = add(3, 4)", why: "<code>print</code> only displays — it <b>hands nothing back</b>. Without <code>return</code> the function quietly gives <code>None</code>, so the screen shows 7 while <code>total</code> is empty, and the error surfaces later on a line that is perfectly fine.", fix: "def add(a, b):\n    return a + b" },
    { bad: "def add_item(item, items=[]):\n    items.append(item)\n    return items", why: "<b>Python's most famous trap.</b> A default value is created <b>once</b>, when the function is defined — so every call reuses the <i>same</i> list. The second call still has the first call's items in it. This is a standard interview question.", fix: "def add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items" },
    { bad: "def f():\n    return\n    print(\"hi\")", why: "Code after <code>return</code> <b>never runs</b> — the function ends there. This is dead code, and Python will not warn you about it.", fix: "def f():\n    print(\"hi\")\n    return" },
    { bad: "def f():\n    count = 0\n\nf()\nprint(count)", why: "A name created inside a function lives only inside it. Once the function ends it is gone, so this raises <code>NameError</code>. If you want the value outside, <b>return</b> it.", fix: "def f():\n    return 0\n\ncount = f()\nprint(count)" },
  ]},

  { t: "debug", intro: "This should add a 5-mark bonus to each student and total them up. It crashes. Read it before opening the fix.", code: "def add_bonus(marks):\n    print(marks + 5)\n\ntotal = 0\nfor m in [80, 72, 91]:\n    total = total + add_bonus(m)\n\nprint(total)", symptom: "TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'", q: "The numbers print correctly on screen. So why does the addition fail?", fix: "def add_bonus(marks):\n    return marks + 5\n\ntotal = 0\nfor m in [80, 72, 91]:\n    total = total + add_bonus(m)\n\nprint(total)", why: "Look at what the screen shows: 85, 77, 96 — all correct. But <code>add_bonus</code> <b>prints</b> them instead of <b>returning</b> them, so the call itself evaluates to <code>None</code>, and <code>total + None</code> is the crash. The output being right is exactly what makes this confusing: the values were computed, they just never came back. Swapping <code>print</code> for <code>return</code> is the whole fix." },

  { t: "recap", items: [
    "<code>def</code> defines a function; calling it runs the body",
    "<code>return</code> hands a value back — <code>print</code> only displays it",
    "No <code>return</code> means the function returns <b>None</b>",
    "<code>return</code> ends the function immediately",
    "Defaults let a caller leave an argument out — but <b>never use a list or dict as one</b>",
    "Names made inside a function do not exist outside it",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>print</code> and <code>return</code>?", a: "<code>print</code> writes to standard output for a human to read; <code>return</code> passes a value back to the calling code. Only a returned value can be stored, tested or passed on. A function without <code>return</code> returns <code>None</code>, which is why <code>total = add(3, 4)</code> on a printing function silently leaves <code>total</code> empty." },
    { level: "beginner", q: "What is the difference between a parameter and an argument?", a: "A parameter is the name in the definition — <code>def greet(name)</code>. An argument is the actual value passed at the call — <code>greet(\"Priya\")</code>. Interviewers ask it to see whether you read documentation precisely, not because the distinction changes your code." },
    { level: "intermediate", q: "Why is a mutable default argument dangerous?", a: "The default is evaluated <b>once</b>, when the function is defined, so every call shares the same object. <code>def f(items=[])</code> accumulates across calls, which looks like the function remembering things it should not. The fix is <code>items=None</code> and creating the list inside the body. It is the classic Python gotcha question." },
    { level: "intermediate", q: "Can a Python function return more than one value?", a: "It returns one object — but <code>return min(x), max(x)</code> builds a tuple, and the caller can unpack it as <code>low, high = stats(x)</code>. That is why it feels like multiple returns. Beyond two or three values, a dictionary or a small class reads far better than positional unpacking." },
    { level: "intermediate", q: "What happens to a variable created inside a function?", a: "It lives in that call's local scope and disappears when the call ends — referencing it outside raises <code>NameError</code>. Each call gets its own copy, which is what makes functions safe to reuse. To get a value out, return it; reaching for <code>global</code> instead is almost always a design smell." },
  ]},
];

const L8 = [
  { t: "objectives", items: [
    "Reach any character by index, and cut out any piece with slicing",
    "Clean text with <code>strip</code>, <code>lower</code>, <code>upper</code>, <code>replace</code> and <code>title</code>",
    "Break text apart with <code>split</code> and put it back with <code>join</code>",
    "Explain why strings are <b>immutable</b>, and why that changes how you write every line",
  ]},
  { t: "hook", q: "A file arrives with 5,000 names. Some have extra spaces, some are in ALL CAPS, some in lower case. Are you going to fix 5,000 names by hand?", why: "Never. A computer does it in one line — and the reason this matters is that real data always arrives like that. Cleaning text is not a beginner exercise you outgrow; it is the single most common thing a data person does before anything interesting can start." },
  { t: "def", term: "String", en: "A string is an immutable, ordered sequence of characters.", hi: "A line of characters, each at a fixed position (its <b>index</b>), which cannot be changed once created. Any change produces a <b>new</b> string — the original is left exactly as it was." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> raw data is text. Names, dates, categories, addresses, every field of a CSV — all of it arrives as strings, and almost all of it arrives dirty. <code>strip()</code>, <code>lower()</code>, <code>replace()</code> and <code>split()</code> are what an analyst reaches for every single day, before a single chart is drawn. This is not preparation for the job; it <i>is</i> the job." },

  { t: "h2", n: "1", text: "Index — every character has a position" },
  { t: "p", html: "A string is a sequence, exactly like a list. Each character has an index: <code>0, 1, 2…</code> from the front, and <code>-1, -2…</code> from the back." },
  { t: "code", file: "index.py", code: "s = \"DATA\"\nprint(s[0])\nprint(s[-1])\nprint(len(s))", output: "D\nA\n4" },

  { t: "h2", n: "2", text: "Slicing — take a piece" },
  { t: "p", html: "<code>s[start:stop:step]</code> gives you a section. Same rule you already know from <code>range()</code> and lists: <b>start included, stop excluded</b>. Leave a side blank to mean \"from the beginning\" or \"to the end\"." },
  { t: "code", file: "slicing.py", code: "s = \"DATAMARG\"\nprint(s[0:4])\nprint(s[4:])\nprint(s[::2])\nprint(s[::-1])", output: "DATA\nMARG\nDTMR\nGRAMATAD" },
  { t: "viz", name: "string-slicer" },
  { t: "p", html: "Drag the handles in that panel and watch which characters survive. Then try a start beyond the end of the string: slicing quietly returns an empty string rather than crashing, which is the one place Python is <i>more</i> forgiving than indexing." },
  { t: "think", q: "What does <code>s[::-1]</code> do, and what is it good for?", a: "It <b>reverses</b> the string — a step of <code>-1</code> walks backwards from the end.<br/><br/>It is the shortest reverse in the language, and it is how a palindrome check is written: <code>s == s[::-1]</code>. That one line is a genuine interview question, and it is just a slice." },

  { t: "h2", n: "3", text: "The cleaning methods" },
  { t: "p", html: "<code>.strip()</code> removes whitespace at both ends, <code>.lower()</code> and <code>.upper()</code> change case, <code>.replace(a, b)</code> swaps one piece of text for another, and <code>.title()</code> capitalises each word. They chain, left to right." },
  { t: "code", file: "clean.py", code: "raw = \"  Freya THOMPSAN  \"\nprint(raw.strip().lower())\nprint(\"09-08-2026\".replace(\"-\", \"/\"))\nprint(\"data science\".title())", output: "freya thompsan\n09/08/2026\nData Science" },
  { t: "note", variant: "tip", html: "<code>.lower()</code> is how you compare text fairly. <code>\"Delhi\" == \"delhi\"</code> is <code>False</code>, which is why a customer list can hold the same city four times under four spellings. Comparing <code>a.strip().lower() == b.strip().lower()</code> is the fix, and it is worth making a habit." },

  { t: "h2", n: "4", text: "split and join" },
  { t: "p", html: "<code>.split(sep)</code> breaks a string into a <b>list</b>. <code>sep.join(list)</code> does the reverse, gluing a list back into one string. Together they are how every row of a CSV gets handled." },
  { t: "code", file: "split.py", code: "row = \"Freya,Chef,India\"\nparts = row.split(\",\")\nprint(parts)\nprint(\" | \".join(parts))\nprint(len(parts))", output: "['Freya', 'Chef', 'India']\nFreya | Chef | India\n3" },
  { t: "note", variant: "warn", html: "<code>join</code> is called <b>on the separator</b>, not on the list — <code>\", \".join(parts)</code>, never <code>parts.join(\", \")</code>. It reads backwards the first few times, and then it never confuses you again." },

  { t: "h2", n: "5", text: "Immutable — and why it changes how you type" },
  { t: "p", html: "A string cannot be modified. Every method that looks like it changes one is really <b>returning a new string</b> and leaving the original alone. If you do not catch the return value, nothing happens at all." },
  { t: "code", file: "immutable.py", code: "name = \"  Freya  \"\nname.strip()\nprint(repr(name))\nname = name.strip()\nprint(repr(name))", output: "'  Freya  '\n'Freya'" },
  { t: "p", html: "Line 2 did the work and threw the answer away. Line 4 is the same call with the result kept. Python raises no error for line 2 — it is perfectly valid code that simply achieves nothing, which is what makes it hard to spot." },
  { t: "analogy", concept: "A string", real: "A train of lettered coaches", html: "A string is a train where each coach holds one character and has a fixed seat number — that is the index. A <b>slice</b> is uncoupling some coaches to make a shorter train, leaving the original standing. <b>Immutable</b> means you cannot repaint a coach: you can only build a new train. That is exactly why every string method hands you back a new string." },

  { t: "trace", intro: "A messy field being cleaned and split. Work out what each name holds once the line has run.", code: "raw = \"  Data Science  \"\nclean = raw.strip()\nwords = clean.split(\" \")\nfirst = words[0]\ncount = len(words)", steps: [
    { q: "After line 2, <code>clean</code> is", answer: "Data Science", why: "<code>strip()</code> removes whitespace from both ends only. The space between the two words is inside the text, so it stays." },
    { q: "After line 4, <code>first</code> is", answer: "Data", why: "<code>split(\" \")</code> produced <code>['Data', 'Science']</code>, and index 0 is the first piece. Note that <code>raw</code> is still the original messy string — none of this changed it." },
    { q: "After line 5, <code>count</code> is", answer: "2", why: "Two words, because the ends were stripped first. Split the unstripped string and you would get four pieces, two of them empty — which is the bug in the debug task below." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the first character of <code>Python</code>.", code: "print(\"Python\"[0])", out: "P" },
    { task: "Print the last character without using <code>len()</code>.", code: "print(\"Python\"[-1])", out: "n" },
    { task: "Print how many characters are in <code>Python</code>.", code: "print(len(\"Python\"))", out: "6" },
    { task: "Print the first four characters of <code>DATAMARG</code>.", code: "print(\"DATAMARG\"[0:4])", out: "DATA" },
    { task: "Print <code>abc</code> reversed.", code: "print(\"abc\"[::-1])", out: "cba" },
    { task: "Print <code>data</code> in capitals.", code: "print(\"data\".upper())", out: "DATA" },
    { task: "Remove the spaces around <code>  hi  </code>.", code: "print(\"  hi  \".strip())", out: "hi" },
    { task: "Turn the dashes in a date into slashes.", code: "print(\"2026-01-05\".replace(\"-\", \"/\"))", out: "2026/01/05" },
    { task: "Break <code>a,b,c</code> into a list.", code: "print(\"a,b,c\".split(\",\"))", out: "['a', 'b', 'c']" },
    { task: "Join a list back into one string with dashes.", code: "print(\"-\".join([\"a\", \"b\", \"c\"]))", out: "a-b-c" },
    { task: "Check whether <code>madam</code> is a palindrome.", code: "s = \"madam\"\nprint(s == s[::-1])", out: "True" },
    { task: "Count how many times <code>a</code> appears in <code>banana</code>.", code: "print(\"banana\".count(\"a\"))", out: "3" },
  ]},

  { t: "mistakes", items: [
    { bad: "name = \"  Freya  \"\nname.strip()\nprint(name)   # still padded", why: "Strings are <b>immutable</b>. <code>.strip()</code> does not change <code>name</code>, it returns a cleaned copy — and here that copy is thrown away. No error, no warning, no effect.", fix: "name = name.strip()\nprint(name)   # Freya" },
    { bad: "s = \"DATA\"\nprint(s[1:4])   # expecting 4 characters", why: "<code>[1:4]</code> gives indexes 1, 2 and 3 — <b>three</b> characters, because the stop is excluded. The same off-by-one rule as <code>range()</code> and list slicing.", fix: "print(s[1:4])   # ATA, and that is correct" },
    { bad: "s = \"Hi\"\nprint(s[5])", why: "There is no index 5, so this is an <code>IndexError</code>. Worth knowing that <b>slicing</b> does not behave this way: <code>s[5:]</code> on the same string returns an empty string instead of crashing.", fix: "print(s[5:])   # '' , no error" },
    { bad: "if city == \"Delhi\":", why: "Text comparison is exact — case and spaces included. A file holding <code>delhi</code>, <code>DELHI</code> and <code>&nbsp;Delhi&nbsp;</code> will match none of them, and the rows silently go missing from your count.", fix: "if city.strip().lower() == \"delhi\":" },
  ]},

  { t: "debug", intro: "This should count the words in a messy field and print 2. It prints 8. Nothing crashes, and split is clearly the right tool. Read it before opening the fix.", code: "raw = \"  data   science  \"\n\nwords = raw.split(\" \")\n\nprint(len(words))", symptom: "prints 8, but there are only two words", q: "There are two words and split was given the right separator. Where are the other six pieces coming from?", fix: "raw = \"  data   science  \"\n\nwords = raw.split()\n\nprint(len(words))", why: "<code>split(\" \")</code> means \"cut at <b>every single</b> space\". Two spaces in a row have nothing between them, so an empty string is produced — and this field has seven spaces in total, giving eight pieces, six of them empty.<br/><br/><code>split()</code> with <b>no argument</b> is a different rule, not just a default: it treats any run of whitespace as one separator and drops the empties. For real-world text — which is exactly the messy kind — the no-argument version is almost always what you want. The lesson is that the plainest-looking call was the more sophisticated one." },

  { t: "recap", items: [
    "<code>s[i]</code> indexes, <code>s[a:b:c]</code> slices — <b>start included, stop excluded</b>",
    "<code>s[::-1]</code> reverses; <code>s == s[::-1]</code> is a palindrome check",
    "<code>strip / lower / upper / replace / title</code> are the everyday cleaning tools",
    "<code>split</code> makes a list, <code>join</code> makes a string — and <code>join</code> is called on the separator",
    "Strings are <b>immutable</b>: every method returns a new one, so you must assign the result",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What does it mean that strings are immutable?", a: "Once created, a string cannot be changed. <code>.upper()</code>, <code>.replace()</code> and the rest never touch the original — they return a <b>new</b> string. That is why <code>s.strip()</code> on its own does nothing and <code>s = s.strip()</code> is required." },
    { level: "beginner", q: "What does <code>s[::-1]</code> do?", a: "Reverses the string, by slicing with a step of <code>-1</code>. It is the standard way to test a palindrome: <code>s == s[::-1]</code>." },
    { level: "intermediate", q: "When would you use <code>replace()</code> and when <code>split()</code>?", a: "<code>replace(a, b)</code> when you are swapping something inside the text but keeping one string — dashes to slashes in a date, for instance. <code>split(sep)</code> when you want the pieces <b>separately</b>, as a list — a CSV row into its columns. In practice a <code>strip()</code> often follows a split, because the pieces come back with spaces attached." },
    { level: "intermediate", q: "What is the difference between <code>split(\" \")</code> and <code>split()</code>?", a: "<code>split(\" \")</code> cuts at every single space, so consecutive spaces produce empty strings. <code>split()</code> with no argument treats any run of whitespace — spaces, tabs, newlines — as one separator and discards the empties. For messy real-world text the no-argument form is nearly always the correct one." },
    { level: "advanced", q: "Why is <code>\"\".join(parts)</code> preferred over building a string with <code>+=</code> in a loop?", a: "Because strings are immutable, <code>s += x</code> cannot extend anything — it builds a whole new string each time and copies everything across. Over a long loop that is quadratic work. <code>join</code> looks at all the pieces, allocates once and copies once. It is the difference between a script finishing and a script appearing to hang." },
  ]},
];

const L9 = [
  { t: "objectives", items: [
    "Turn a <code>for</code> + <code>append</code> loop into a single comprehension",
    "Filter with <code>if</code> after the <code>for</code>, and transform with <code>if/else</code> before it",
    "Build sets and dictionaries the same way",
    "Judge when a comprehension helps and when a plain loop is the better answer",
  ]},
  { t: "hook", q: "You have 10,000 prices and every one needs 18% GST added, as a new list. Do you write the whole <code>for</code> and <code>append</code>, or one line?", why: "In Python this is one line. A comprehension is the same loop with the ceremony removed — and transforming one list into another is, more than anything else, what data work actually consists of." },
  { t: "def", term: "List comprehension", en: "A concise expression that builds a new list by transforming and optionally filtering the items of an iterable, in a single line.", hi: "The shape is always the same: <code>[expr for x in items if condition]</code> — take each item, optionally keep it, and put the result of <code>expr</code> into a new list." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> transforming data is the daily work — adding tax to prices, cleaning a column of names, deriving one field from another, dropping the rows that are unusable. A comprehension is how that gets written in a line someone else can read. The same shape carries into pandas later, where you will be doing it to whole columns at once." },

  { t: "h2", n: "1", text: "Transform every item" },
  { t: "p", html: "<code>[expr for x in items]</code> runs <code>expr</code> on each item and collects the results into a <b>new</b> list. The original is never touched." },
  { t: "code", file: "comp.py", code: "nums = [1, 2, 3, 4]\nsquares = [n * n for n in nums]\nprint(squares)\nprint(nums)", output: "[1, 4, 9, 16]\n[1, 2, 3, 4]" },
  { t: "p", html: "It is worth seeing that it really is the same loop. These two build an identical list:" },
  { t: "code", file: "sameloop.py", code: "words = [\"data\", \"science\"]\n\nout = []\nfor w in words:\n    out.append(w.upper())\n\nsame = [w.upper() for w in words]\n\nprint(out)\nprint(same)\nprint(out == same)", output: "['DATA', 'SCIENCE']\n['DATA', 'SCIENCE']\nTrue" },

  { t: "h2", n: "2", text: "Filter with if" },
  { t: "p", html: "An <code>if</code> placed <b>after</b> the <code>for</code> decides which items survive. Items that fail it never reach the expression at all." },
  { t: "code", file: "compif.py", code: "nums = [1, 2, 3, 4, 5, 6]\nevens_sq = [x * x for x in nums if x % 2 == 0]\nprint(evens_sq)", output: "[4, 16, 36]" },
  { t: "viz", name: "comprehension-builder" },
  { t: "p", html: "Change the filter in that panel and watch how many items reach the expression. Reading order matters: the <code>for</code> runs first, the <code>if</code> decides, and only then does the expression on the left run." },

  { t: "h2", n: "3", text: "if/else before the for — a different job" },
  { t: "p", html: "There is a second place <code>if</code> can appear, and it means something else entirely. Before the <code>for</code>, an <code>if/else</code> chooses <b>what value</b> to produce — it keeps every item rather than removing any." },
  { t: "code", file: "ternary.py", code: "nums = [1, 2, 3, 4]\nlabels = [\"even\" if n % 2 == 0 else \"odd\" for n in nums]\nprint(labels)\nprint(len(labels))", output: "['odd', 'even', 'odd', 'even']\n4" },
  { t: "note", variant: "warn", html: "<b>Read the length: four items in, four out.</b> This is the single most confused point in the whole topic. <code>if</code> <b>after</b> the <code>for</code> <i>filters</i> — fewer items come out. <code>if/else</code> <b>before</b> the <code>for</code> <i>transforms</i> — the same number come out. And <code>[x for x in nums if x &gt; 0 else 0]</code> is not a thing: it is a <code>SyntaxError</code>, because a filter has no else." },

  { t: "h2", n: "4", text: "Sets and dictionaries, same idea" },
  { t: "p", html: "Change the brackets and the same shape builds a set or a dictionary." },
  { t: "code", file: "setdict.py", code: "words = [\"data\", \"science\", \"data\"]\nprint(sorted({w for w in words}))\nprint({w: len(w) for w in words})", output: "['data', 'science']\n{'data': 4, 'science': 7}" },
  { t: "analogy", concept: "A comprehension", real: "A conveyor belt", html: "Items come along a belt. First there is a <b>gate</b> — the <code>if</code> after the <code>for</code> — and whatever fails it drops off the line. Whatever survives passes through a <b>machine</b>, the expression on the left, and lands in a new crate at the far end. A <code>for</code> loop is the same factory; a comprehension is the same factory drawn on one line." },

  { t: "trace", intro: "Two comprehensions over the same list. Work out what each name holds once the line has run.", code: "prices = [100, 250, 80]\ndoubled = [p * 2 for p in prices]\ncheap = [p for p in prices if p < 200]\ncount = len(cheap)", steps: [
    { q: "After line 2, <code>doubled</code> is", answer: "[200, 500, 160]", accept: ["[200,500,160]", "200, 500, 160", "200,500,160"], why: "Every item is transformed and every item survives — there is no filter here, so three go in and three come out." },
    { q: "After line 3, <code>cheap</code> is", answer: "[100, 80]", accept: ["[100,80]", "100, 80", "100,80"], why: "This one filters instead of transforming: the expression is just <code>p</code>, and the <code>if</code> drops 250. Note it read <code>prices</code>, not <code>doubled</code> — neither comprehension changed the original." },
    { q: "After line 4, <code>count</code> is", answer: "2", why: "Two items survived the filter. If the <code>if</code> had been written as an <code>if/else</code> before the <code>for</code>, this would have been 3 — that is the whole difference between the two positions." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Square every number in the list.", code: "print([n * n for n in [1, 2, 3]])", out: "[1, 4, 9]" },
    { task: "Double every number in the list.", code: "print([n * 2 for n in [1, 2, 3]])", out: "[2, 4, 6]" },
    { task: "Keep only the even numbers.", code: "print([n for n in [1, 2, 3, 4] if n % 2 == 0])", out: "[2, 4]" },
    { task: "Upper-case every word.", code: "print([w.upper() for w in [\"a\", \"b\"]])", out: "['A', 'B']" },
    { task: "Get the length of every word.", code: "print([len(w) for w in [\"data\", \"ai\"]])", out: "[4, 2]" },
    { task: "Square only the odd numbers below 6.", code: "print([n * n for n in range(6) if n % 2 == 1])", out: "[1, 9, 25]" },
    { task: "Label each number <code>big</code> or <code>small</code> — every item must survive.", code: "print([\"big\" if n > 5 else \"small\" for n in [3, 9]])", out: "['small', 'big']" },
    { task: "Build a list of the numbers 0 to 4 from a <code>range</code>.", code: "print([n for n in range(5)])", out: "[0, 1, 2, 3, 4]" },
    { task: "Strip the spaces off every item.", code: "print([w.strip() for w in [\"  a  \", \" b\"]])", out: "['a', 'b']" },
    { task: "Collect the distinct remainders with a set comprehension.", code: "print(sorted({n % 3 for n in range(6)}))", out: "[0, 1, 2]" },
    { task: "Map each word to its length with a dict comprehension.", code: "print({w: len(w) for w in [\"ai\", \"data\"]})", out: "{'ai': 2, 'data': 4}" },
    { task: "Add up the even numbers below 5, using a comprehension.", code: "print(sum([n for n in range(5) if n % 2 == 0]))", out: "6" },
  ]},

  { t: "mistakes", items: [
    { bad: "res = [f(x) for x in a for y in b if p(x) if q(y)]", why: "The entire point of a comprehension is that it reads in one glance. Two loops and two filters on one line destroys that — and the person who cannot follow it in two months is you. When it stops fitting in your head, a plain loop is the better code, not the weaker one.", fix: "res = []\nfor x in a:\n    for y in b:\n        if p(x) and q(y):\n            res.append(f(x))" },
    { bad: "[print(x) for x in nums]", why: "A comprehension exists to <b>build a list</b>. Using it only for a side effect still builds one — a throwaway list of <code>None</code>, one per item — and quietly wastes the memory. It also tells the next reader you wanted a list, which you did not.", fix: "for x in nums:\n    print(x)" },
    { bad: "[x for x in nums if x > 0 else 0]", why: "A filter has no <code>else</code> — there is nowhere for the rejected item to go. This is a <code>SyntaxError</code>. If you want a replacement value rather than removal, the <code>if/else</code> belongs <b>before</b> the <code>for</code>.", fix: "[x if x > 0 else 0 for x in nums]" },
    { bad: "total = sum([x * x for x in big_list])", why: "This builds the entire list in memory purely to add it up and throw it away. On a large input that is real memory for no reason.", fix: "total = sum(x * x for x in big_list)" },
  ]},

  { t: "debug", intro: "This should keep only the positive numbers from the list. It returns four items instead of two, with zeros where the negatives were. Nothing crashes. Read it before opening the fix.", code: "nums = [5, -3, 8, -1]\n\npositives = [n if n > 0 else 0 for n in nums]\n\nprint(positives)", symptom: "prints [5, 0, 8, 0], but only the positive numbers were wanted", q: "The condition is right and the list is right. So why did nothing actually get removed?", fix: "nums = [5, -3, 8, -1]\n\npositives = [n for n in nums if n > 0]\n\nprint(positives)", why: "The <code>if</code> is in the <b>transforming</b> position, before the <code>for</code>, where its job is to choose a value — so every item survives and the negatives merely become 0. Filtering happens with an <code>if</code> <b>after</b> the <code>for</code>, where an item that fails is simply never produced.<br/><br/>Both spellings are valid Python and both look reasonable at a glance, which is why this one gets shipped. The tell is the <b>length</b>: a filter changes it, a transform does not. When a comprehension returns the wrong number of items, look at which side of the <code>for</code> your <code>if</code> is sitting on." },

  { t: "recap", items: [
    "<code>[expr for x in items]</code> transforms every item into a <b>new</b> list",
    "<code>if</code> <b>after</b> the <code>for</code> filters — fewer items come out",
    "<code>if/else</code> <b>before</b> the <code>for</code> transforms — the count stays the same",
    "Change the brackets for a set <code>{x for x in …}</code> or a dict <code>{k: v for …}</code>",
    "If it no longer reads in one glance, or you only want a side effect, write the loop",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a list comprehension and why use one?", a: "A one-line way to build a list: <code>[expr for x in items if cond]</code>. It is shorter than <code>for</code> plus <code>append</code>, slightly faster because the append is not looked up each pass, and easier to read — as long as it stays simple." },
    { level: "beginner", q: "Where does the <code>if</code> go?", a: "For <b>filtering</b>, after the <code>for</code>: <code>[x for x in xs if x &gt; 0]</code>. There is a second position — an <code>if/else</code> <b>before</b> the <code>for</code> — but that <b>transforms</b> rather than filters, and keeps every item." },
    { level: "intermediate", q: "When should you not use a comprehension?", a: "When the logic is nested or complicated enough that it no longer reads in one glance, and when you only want a side effect such as printing or writing to a database — a comprehension would build a pointless list of <code>None</code>. The rule of thumb: if you have to decode it, write the loop." },
    { level: "intermediate", q: "Does the loop variable leak out of a comprehension?", a: "Not in Python 3. A comprehension has its own scope, so <code>x</code> inside it does not overwrite an outer <code>x</code> and does not exist afterwards. In Python 2 it did leak, which is where the old warnings come from." },
    { level: "advanced", q: "What is the difference between <code>sum([x*x for x in xs])</code> and <code>sum(x*x for x in xs)</code>?", a: "The first builds the whole list in memory and then adds it up. The second is a <b>generator expression</b> — it produces one value at a time and never holds them all, so memory stays flat however large the input is. When the result is consumed once and immediately, drop the brackets." },
  ]},
];

const L10 = [
  { t: "objectives", items: [
    "Tell a <b>class</b> (the blueprint) from an <b>object</b> (one thing built from it)",
    "Write <code>__init__</code>, and explain what <code>self</code> actually is",
    "Store data on an object with <code>self.x</code>, and act on it with methods",
    "Know why two objects of the same class do not share their data — and the one case where they do",
  ]},
  { t: "hook", q: "An app tracks 100 dogs, each with a name, a breed and an age. Are you going to make <code>dog1_name</code>, <code>dog1_age</code>, <code>dog2_name</code> … three hundred variables?", why: "It cannot be done. What you want is one <b>blueprint</b> that says \"every dog has a name, a breed and an age, and every dog can bark\" — and then to stamp out as many dogs as you like from it. That blueprint is a class, and it is the whole idea." },
  { t: "def", term: "Class and object", en: "A class is a blueprint that bundles data (attributes) with behaviour (methods); an object is one specific instance built from that blueprint.", hi: "One class, many objects. Each object carries <b>its own</b> data, while the methods are written once and shared by all of them." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> every library you will touch is made of this. A pandas <code>DataFrame</code> is an object; <code>df.head()</code> is a method. A scikit-learn model is an object; <code>model.fit()</code> and <code>model.predict()</code> are methods on it. You do not need to write many classes as an analyst — but the moment you understand them, unfamiliar libraries stop being magic and start being readable." },

  { t: "h2", n: "1", text: "A class, and objects made from it" },
  { t: "p", html: "<code>class</code> defines the blueprint. Calling it — <code>Dog(\"Bruno\", \"Labrador\")</code> — builds one object from it." },
  { t: "code", file: "class.py", code: "class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        return self.name + \" says woof!\"\n\nd = Dog(\"Bruno\", \"Labrador\")\nprint(d.bark())\nprint(d.breed)", output: "Bruno says woof!\nLabrador" },
  { t: "viz", name: "object-inspector" },
  { t: "p", html: "Build a second object in that panel and look at the two side by side. The methods are identical — they were written once — but each object carries its own values." },
  { t: "code", file: "twoobjects.py", code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return self.name + \" says woof!\"\n\na = Dog(\"Bruno\")\nb = Dog(\"Rani\")\nprint(a.bark())\nprint(b.bark())\nprint(a.name == b.name)", output: "Bruno says woof!\nRani says woof!\nFalse" },

  { t: "h2", n: "2", text: "__init__ and self" },
  { t: "p", html: "<code>__init__</code> runs <b>automatically</b> the moment an object is created, and its job is to set that object's starting data. <code>self</code> means <b>this particular object</b> — the one the method was called on." },
  { t: "code", file: "counter.py", code: "class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def add(self):\n        self.count += 1\n        return self.count\n\nc = Counter()\nc.add()\nc.add()\nprint(c.count)", output: "2" },
  { t: "p", html: "Python passes <code>self</code> for you. That is why you write it as the first parameter but never pass it at the call — and it is why these two lines do exactly the same thing:" },
  { t: "code", file: "dotcall.py", code: "class Dog:\n    def bark(self):\n        return \"woof\"\n\nd = Dog()\nprint(d.bark())\nprint(Dog.bark(d))", output: "woof\nwoof" },
  { t: "note", variant: "tip", html: "<code>d.bark()</code> is shorthand for <code>Dog.bark(d)</code>. Once you have seen that, <code>self</code> stops being a rule to memorise: the object has to get in there somehow, and the dot is what puts it there." },
  { t: "think", q: "Inside <code>__init__</code>, what is the difference between <code>self.name = name</code> and just <code>name = name</code>?", a: "<code>name = name</code> creates an ordinary <b>local variable</b>, which vanishes the instant <code>__init__</code> ends. Nothing is saved anywhere.<br/><br/><code>self.name = name</code> attaches the value <b>to the object</b>, so it survives for as long as the object does — which is why <code>bark()</code> can still read it later. And leaving out <code>self.</code> raises no error at all; the data simply is not there." },
  { t: "code", file: "localvsself.py", code: "class Box:\n    def __init__(self, label):\n        self.label = label\n        size = 10\n\n    def describe(self):\n        return self.label\n\nb = Box(\"books\")\nprint(b.describe())\nprint(hasattr(b, \"size\"))", output: "books\nFalse" },
  { t: "analogy", concept: "Class versus object", real: "A cookie cutter and the cookies", html: "The <b>class</b> is the cookie cutter — there is one of it, and you cannot eat it. The <b>objects</b> are the cookies it stamps out: as many as you like, each with its own flavour, all with the same shape. <code>self</code> is how one cookie refers to itself, so that a chocolate one knows it is chocolate while the recipe stays written once." },

  { t: "trace", intro: "A cart that remembers what has been added. Work out what each name holds once the line has run.", code: "class Cart:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name):\n        self.items.append(name)\n        return len(self.items)\n\nc = Cart()\nfirst = c.add(\"pen\")\nsecond = c.add(\"book\")\ntotal = len(c.items)", steps: [
    { q: "After line 10, <code>first</code> is", answer: "1", why: "<code>__init__</code> gave this object an empty list, one item was appended, and <code>add</code> returns the new length." },
    { q: "After line 11, <code>second</code> is", answer: "2", why: "The list persisted between the two calls, because it lives on the object rather than inside the method. That is the whole point of <code>self.</code>." },
    { q: "After line 12, <code>total</code> is", answer: "2", why: "Two items on this cart. A second <code>Cart()</code> would have started at zero — each object gets its own list from <code>__init__</code>." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Make a class that stores one number, and print it.", code: "class P:\n    def __init__(self, n):\n        self.n = n\n\nprint(P(5).n)", out: "5" },
    { task: "Make two objects of the same class and show they hold different data.", code: "class P:\n    def __init__(self, n):\n        self.n = n\n\na = P(1)\nb = P(2)\nprint(a.n, b.n)", out: "1 2" },
    { task: "Write a method that returns a greeting.", code: "class G:\n    def hello(self):\n        return \"hi\"\n\nprint(G().hello())", out: "hi" },
    { task: "Store two attributes with <code>__init__</code>.", code: "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nd = Dog(\"Rani\", 3)\nprint(d.name, d.age)", out: "Rani 3" },
    { task: "Change an attribute after the object exists.", code: "class P:\n    def __init__(self):\n        self.x = 1\n\np = P()\np.x = 9\nprint(p.x)", out: "9" },
    { task: "Write a method that uses an attribute of the object.", code: "class C:\n    def __init__(self):\n        self.items = [1, 2]\n\n    def size(self):\n        return len(self.items)\n\nprint(C().size())", out: "2" },
    { task: "Give <code>__init__</code> a default value.", code: "class P:\n    def __init__(self, n=\"guest\"):\n        self.n = n\n\nprint(P().n)", out: "guest" },
    { task: "Call one method from inside another.", code: "class M:\n    def a(self):\n        return \"a\"\n\n    def b(self):\n        return self.a() + \"b\"\n\nprint(M().b())", out: "ab" },
    { task: "Call a method the long way, passing the object yourself.", code: "class D:\n    def bark(self):\n        return \"woof\"\n\nd = D()\nprint(D.bark(d))", out: "woof" },
    { task: "Count how many times a method was called.", code: "class Counter:\n    def __init__(self):\n        self.c = 0\n\n    def add(self):\n        self.c += 1\n\nk = Counter()\nk.add()\nk.add()\nprint(k.c)", out: "2" },
    { task: "Check whether an object has an attribute it was never given.", code: "class B:\n    def __init__(self):\n        self.a = 1\n\nprint(hasattr(B(), \"b\"))", out: "False" },
  ]},

  { t: "mistakes", items: [
    { bad: "class Dog:\n    def bark():\n        return \"woof\"\n\nDog().bark()", why: "Every method needs <code>self</code> as its first parameter, because Python passes the object in whether you asked for it or not. Without it you get a <code>TypeError</code> saying the method takes 0 arguments but 1 was given — which is confusing until you remember the dot supplies one.", fix: "class Dog:\n    def bark(self):\n        return \"woof\"" },
    { bad: "def __init__(self, name):\n    name = name", why: "Without <code>self.</code> this is a local variable that dies with the method. <b>Nothing is stored and nothing errors</b> — the object is simply born empty, and the failure surfaces much later as an <code>AttributeError</code> somewhere else.", fix: "def __init__(self, name):\n    self.name = name" },
    { bad: "d = Dog(\"Bruno\")\nd.bark(d)", why: "The dot already passes the object, so this passes it twice — <code>TypeError</code>. You write <code>self</code> in the definition; you do not supply it at the call.", fix: "d.bark()" },
    { bad: "class Cart:\n    items = []", why: "An attribute defined in the <b>class body</b> belongs to the class, so <b>every object shares the one list</b>. Add to one cart and it appears in all of them. Per-object data belongs in <code>__init__</code>.", fix: "class Cart:\n    def __init__(self):\n        self.items = []" },
  ]},

  { t: "debug", intro: "Two carts are created and one pen is added to the first. The second cart reports the pen as well. Nothing crashes. Read it before opening the fix.", code: "class Cart:\n    items = []\n\n    def add(self, name):\n        self.items.append(name)\n\na = Cart()\nb = Cart()\na.add(\"pen\")\n\nprint(b.items)", symptom: "prints ['pen'], but nothing was ever added to b", q: "Two separate objects were created and only one of them was touched. So how did the pen get into the other?", fix: "class Cart:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name):\n        self.items.append(name)\n\na = Cart()\nb = Cart()\na.add(\"pen\")\n\nprint(b.items)", why: "<code>items = []</code> sits in the <b>class body</b>, so that one list belongs to the class and every object looks at the same one. There was never a second list to add to.<br/><br/>Putting it in <code>__init__</code> instead means a fresh list is built <b>each time an object is created</b>, which is what \"each object has its own data\" actually requires. This is one of the most-reported bugs in real Python code, and it is invisible with a single object — it only appears once there are two, which is often in production." },

  { t: "recap", items: [
    "A <b>class</b> is the blueprint; an <b>object</b> is one thing built from it",
    "<code>__init__</code> runs automatically at creation and sets that object's data",
    "<code>self</code> is this object — <code>d.bark()</code> is just <code>Dog.bark(d)</code>",
    "<code>self.x = …</code> stores on the object; plain <code>x = …</code> disappears silently",
    "Data in the <b>class body</b> is shared by every object; per-object data goes in <code>__init__</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between a class and an object?", a: "A class is the blueprint — written once. An object is one instance built from it, and there can be many, each holding its own data while sharing the class's methods. Car the design, versus the car standing outside." },
    { level: "beginner", q: "What is <code>self</code>?", a: "A reference to the object the method was called on. Python passes it automatically, which is why it is the first parameter in the definition and never supplied at the call. <code>d.bark()</code> is shorthand for <code>Dog.bark(d)</code>." },
    { level: "beginner", q: "When does <code>__init__</code> run, and what is it for?", a: "Automatically, whenever an object is created. It sets the object's starting attributes — it is the constructor in all but name. You never call it directly." },
    { level: "intermediate", q: "What happens if you forget <code>self.</code> inside <code>__init__</code>?", a: "Nothing visible. <code>name = name</code> makes a local variable that is discarded when the method ends, so the object is created without the attribute. The error appears much later, as an <code>AttributeError</code> the first time something reads it — far from the line that caused it." },
    { level: "advanced", q: "What is the difference between a class attribute and an instance attribute?", a: "A class attribute is defined in the class body and there is <b>one</b> of it, shared by every instance. An instance attribute is created on <code>self</code> in <code>__init__</code> and each object gets its own. Class attributes are fine for constants, but a <b>mutable</b> one — a list or a dict — is a classic bug: appending through any object changes it for all of them. Assigning to <code>self.x</code> where a class attribute <code>x</code> exists does not overwrite it either; it quietly creates an instance attribute that shadows it." },
  ]},
];

const L11 = [
  { t: "objectives", items: [
    "Catch a failure with <code>try</code> / <code>except</code> instead of letting the program die",
    "Catch the <b>specific</b> exception, and know why a bare <code>except</code> is dangerous",
    "Use <code>else</code> and <code>finally</code>, and <code>raise</code> your own errors",
    "Decide when to catch an error and when to let it through",
  ]},
  { t: "hook", q: "Your script reads 50,000 rows from a file. Row 40,000 has the word <code>unknown</code> where a number should be. What happens to the other 10,000 rows?", why: "Without error handling, nothing. The program stops on that row and everything after it is lost — after forty minutes of work. Handling the failure is the difference between a script that finishes with one row flagged and a script that has to be rerun." },
  { t: "def", term: "Exception", en: "An exception is an error raised during execution which interrupts the normal flow, and which a program may catch and respond to.", hi: "An exception is not the same as a crash. It is Python <b>reporting</b> a problem — and if you are ready for it, you decide what happens next instead of the program ending." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> real data is broken in small ways — a missing value, a date typed by hand, a division by a count that turned out to be zero. Handling those is what separates a script that runs once on your machine from one that can be scheduled and trusted. The goal is never to hide failures; it is to keep going and record which rows failed." },

  { t: "h2", n: "1", text: "try and except" },
  { t: "p", html: "Put the risky work in <code>try</code>. If it raises, the matching <code>except</code> runs instead of the program stopping." },
  { t: "code", file: "basic.py", code: "try:\n    n = int(\"abc\")\nexcept ValueError:\n    print(\"that is not a number\")", output: "that is not a number" },
  { t: "viz", name: "exception-flow" },
  { t: "p", html: "Follow the arrows in that panel. The moment a line inside <code>try</code> raises, the <b>rest of the try block is skipped</b> — control jumps straight to the matching <code>except</code>. Nothing between the failing line and the end of the block ever runs." },

  { t: "h2", n: "2", text: "Catch the specific exception" },
  { t: "p", html: "Name the error you expect. Anything else still travels up and gets reported, which is exactly what you want for a problem you did not plan for." },
  { t: "code", file: "specific.py", code: "def divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return \"cannot divide by zero\"\n\nprint(divide(10, 2))\nprint(divide(10, 0))", output: "5.0\ncannot divide by zero" },
  { t: "note", variant: "warn", html: "<b>Never write a bare <code>except:</code>.</b> It catches everything — including your own typos, and including Ctrl-C. A misspelt variable name inside a bare <code>try</code> becomes a <code>NameError</code> that is silently swallowed, and your function calmly returns a wrong answer forever. The debug task below is exactly that." },

  { t: "h2", n: "3", text: "else and finally" },
  { t: "p", html: "<code>else</code> runs only when nothing was raised. <code>finally</code> runs either way — it is where cleanup goes, such as closing a file or a connection." },
  { t: "code", file: "elsefinally.py", code: "try:\n    value = int(\"42\")\nexcept ValueError:\n    print(\"bad input\")\nelse:\n    print(\"parsed\", value)\nfinally:\n    print(\"done\")", output: "parsed 42\ndone" },

  { t: "h2", n: "4", text: "Raising your own" },
  { t: "p", html: "<code>raise</code> reports a problem your own code has detected. Refusing bad input loudly is better than storing it and finding out later." },
  { t: "code", file: "raising.py", code: "def set_age(age):\n    if age < 0:\n        raise ValueError(\"age cannot be negative\")\n    return age\n\nprint(set_age(30))\n\ntry:\n    set_age(-5)\nexcept ValueError as e:\n    print(\"caught:\", e)", output: "30\ncaught: age cannot be negative" },
  { t: "think", q: "If you can catch an error, should you always catch it?", a: "No — and this is the judgement the topic is really about.<br/><br/>Catch it when you know what to do instead: skip the bad row, use a default, retry. <b>Let it through</b> when you do not, because an error that reaches you is information, and one that is swallowed is a wrong answer with no warning attached.<br/><br/>A caught exception that returns a plausible-looking number is worse than a crash. The crash tells you where to look." },
  { t: "analogy", concept: "try / except", real: "A safety net under a trapeze", html: "The net does not stop the fall — it decides what happens after one. <code>try</code> is the part of the act where a fall is possible; <code>except</code> is the net, placed for the fall you actually expect. A bare <code>except</code> is a net stretched over the whole circus: it catches the trapeze artist, the audience, and the person who came to fix the lights, and nobody can tell what went wrong." },

  { t: "trace", intro: "A parser that falls back to -1 on bad input. Work out what each name holds once the line has run.", code: "def parse(text):\n    try:\n        return int(text)\n    except ValueError:\n        return -1\n\na = parse(\"10\")\nb = parse(\"x\")\nc = a + b", steps: [
    { q: "After line 7, <code>a</code> is", answer: "10", why: "<code>int(\"10\")</code> succeeded, so the <code>return</code> inside <code>try</code> ran and the <code>except</code> was never reached." },
    { q: "After line 8, <code>b</code> is", answer: "-1", why: "<code>int(\"x\")</code> raised <code>ValueError</code>, so the <code>try</code> was abandoned at that point and the fallback returned instead." },
    { q: "After line 9, <code>c</code> is", answer: "9", why: "<code>10 + (-1)</code>. Worth noticing: the -1 flowed onward as if it were real data. A fallback value is a decision, not a fix." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Catch the error from converting a word to an integer.", code: "try:\n    int(\"x\")\nexcept ValueError:\n    print(\"bad\")", out: "bad" },
    { task: "Catch a division by zero.", code: "try:\n    print(1 / 0)\nexcept ZeroDivisionError:\n    print(\"no\")", out: "no" },
    { task: "Run something that always happens at the end.", code: "try:\n    pass\nfinally:\n    print(\"always\")", out: "always" },
    { task: "Run a block only when nothing failed.", code: "try:\n    v = 1\nexcept ValueError:\n    print(\"bad\")\nelse:\n    print(\"ok\")", out: "ok" },
    { task: "Raise your own error and catch it.", code: "try:\n    raise ValueError(\"boom\")\nexcept ValueError as e:\n    print(e)", out: "boom" },
    { task: "Catch a missing dictionary key.", code: "d = {}\ntry:\n    d[\"a\"]\nexcept KeyError:\n    print(\"missing\")", out: "missing" },
    { task: "Catch an index that is out of range.", code: "try:\n    [1][5]\nexcept IndexError:\n    print(\"out of range\")", out: "out of range" },
    { task: "Catch adding a string to a number.", code: "try:\n    \"a\" + 1\nexcept TypeError:\n    print(\"wrong types\")", out: "wrong types" },
    { task: "Give two <code>except</code> blocks and let the right one run.", code: "try:\n    int(\"x\")\nexcept ZeroDivisionError:\n    print(\"zero\")\nexcept ValueError:\n    print(\"value\")", out: "value" },
    { task: "Print the name of the exception you caught.", code: "try:\n    int(\"x\")\nexcept ValueError as e:\n    print(type(e).__name__)", out: "ValueError" },
    { task: "Avoid the try entirely by asking for a default instead.", code: "d = {}\nprint(d.get(\"a\", 0))", out: "0" },
  ]},

  { t: "mistakes", items: [
    { bad: "try:\n    risky()\nexcept:\n    pass", why: "Two errors in four lines. The bare <code>except</code> catches <b>everything</b> — your typos, out-of-memory, even Ctrl-C — and <code>pass</code> then throws the evidence away. The program continues in a state you no longer understand.", fix: "try:\n    risky()\nexcept ValueError as e:\n    log.warning(\"skipping row: %s\", e)" },
    { bad: "try:\n    a = load()\n    b = clean(a)\n    c = save(b)\nexcept Exception:\n    print(\"something failed\")", why: "The <code>try</code> covers three different operations, so the message cannot say which one broke. Keep the block around the line that can actually fail — a wide <code>try</code> turns a precise error into a shrug.", fix: "a = load()\nb = clean(a)\ntry:\n    c = save(b)\nexcept IOError as e:\n    print(\"could not save:\", e)" },
    { bad: "try:\n    value = d[\"name\"]\nexcept KeyError:\n    value = \"\"", why: "Not wrong, but there is a plainer way to say it. Exceptions are for the unexpected; a key that is <i>known</i> to be optional is ordinary logic.", fix: "value = d.get(\"name\", \"\")" },
    { bad: "except ValueError:\n    return 0", why: "Returning a plausible number for a failure hides it forever. Nobody downstream can tell a real 0 from a failed one, and the wrong total ships. If a fallback is genuinely right, record that it happened.", fix: "except ValueError:\n    log.warning(\"bad row, skipped\")\n    return None" },
  ]},

  { t: "debug", intro: "This should return the length of the list. It returns 0 for a list that clearly has three items, and nothing crashes. Read it before opening the fix.", code: "def safe_len(items):\n    try:\n        return len(itmes)\n    except:\n        return 0\n\nprint(safe_len([1, 2, 3]))", symptom: "prints 0, but the list has three items", q: "The list is fine and <code>len</code> is the right function. So what is being caught?", fix: "def safe_len(items):\n    try:\n        return len(items)\n    except TypeError:\n        return 0\n\nprint(safe_len([1, 2, 3]))", why: "<code>itmes</code> is a typo. Python raised <code>NameError</code> — a bug in <i>your</i> code, not in the data — and the bare <code>except</code> caught it, returned 0, and told nobody. The function will report 0 for every list it is ever given.<br/><br/>This is the whole argument against a bare <code>except</code> in one screen. Name the exception you are prepared for, and everything you were <b>not</b> prepared for keeps its right to interrupt you. Fixing the typo is half the fix; narrowing the <code>except</code> is what stops the next typo from hiding." },

  { t: "recap", items: [
    "<code>try</code> holds the risky line, <code>except</code> decides what happens if it raises",
    "Catch the <b>specific</b> exception — never a bare <code>except:</code>",
    "<code>else</code> runs when nothing failed; <code>finally</code> runs either way",
    "<code>raise</code> reports a problem your own code detected",
    "Catch it only when you know what to do instead — otherwise let it through",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between an error and an exception being handled?", a: "An unhandled exception stops the program and prints a traceback. A handled one is caught by an <code>except</code> block, which decides what happens next — a default, a skip, a retry — and execution carries on." },
    { level: "beginner", q: "What is wrong with <code>except:</code> on its own?", a: "It catches every exception there is, including bugs in your own code such as a misspelt name, and including <code>KeyboardInterrupt</code>. The failure disappears and the function returns something plausible instead. Always name the exception you expect." },
    { level: "intermediate", q: "What is the difference between <code>else</code> and <code>finally</code>?", a: "<code>else</code> runs only if the <code>try</code> completed without raising — it is where the \"it worked\" path goes, kept out of the <code>try</code> so it is not accidentally protected. <code>finally</code> runs in every case, raised or not, and is for cleanup that must happen regardless." },
    { level: "intermediate", q: "When should you not catch an exception?", a: "When you have no sensible response to it. Catching an error you cannot handle converts a loud, locatable failure into a quiet wrong answer. Letting it propagate to a level that <i>can</i> decide — or letting it stop the job — is often the correct engineering choice." },
    { level: "advanced", q: "What does <code>raise ... from e</code> do, and why use it?", a: "It chains exceptions: it raises a new one while recording the original as its cause, so the traceback shows both. It is how you translate a low-level failure into a meaningful one — a <code>KeyError</code> becoming <code>ConfigError</code> — without losing the line that actually broke. Without it, the original context is hidden, and the traceback tells you what your wrapper thought rather than what really happened." },
  ]},
];

const L12 = [
  { t: "objectives", items: [
    "Open, read and write a file — and know why <code>with</code> is the only safe way",
    "Tell the four modes apart: <code>r</code>, <code>w</code>, <code>a</code>, <code>x</code>",
    "Understand that <code>\"w\"</code> empties a file <b>the moment it opens</b>",
    "Read a huge file line by line instead of loading it into memory",
    "Deal with a missing file instead of crashing",
  ]},
  { t: "hook", q: "You want to read <code>data.csv</code>, and you type <code>open(\"data.csv\", \"w\")</code> by mistake. How much of the file survives?", why: "None of it. Not one row. And the deletion happens at <b>open</b> time — before your next line of code runs, before you write anything, whether or not the script then crashes. There is no undo, no recycle bin, and Python raises no warning, because as far as it is concerned you asked for exactly this." },
  { t: "think", q: "If <code>\"w\"</code> wipes the file, what should you use to <b>add</b> a line to a log file that already has a thousand lines in it?", a: "<code>\"a\"</code> — append. It opens the file with the cursor parked at the end, so everything already there survives and your new text lands after it.<br/><br/>This single letter is the difference between a log file that grows all day and one that only ever contains the last thing that happened. It is one of the most common bugs in beginner scripts, and it destroys data silently." },

  { t: "h2", n: "1", text: "open, and why with matters" },
  { t: "def", term: "File handle", en: "A file handle is the connection Python gives you to a file on disk — you read and write through the handle, not the file itself, and the handle must be closed for your writes to be flushed to disk.", hi: "In plain words: <code>open()</code> does not hand you the file, it hands you a <b>pipe</b> to it. Until that pipe is closed, some of what you wrote may still be sitting in a buffer rather than on the disk." },
  { t: "p", html: "<code>open(path, mode)</code> gives you the handle. You could call <code>f.close()</code> yourself, but if anything raises an exception in between, that close never runs and your data stays in the buffer. <code>with</code> closes the handle on the way out — even if the code inside crashes." },
  { t: "code", file: "basics.py", code: "# write a file\nwith open(\"notes.txt\", \"w\") as f:\n    f.write(\"alpha\\n\")\n    f.write(\"beta\\n\")\n\n# read it back\nwith open(\"notes.txt\") as f:\n    print(f.read())", output: "alpha\nbeta" },
  { t: "note", variant: "tip", html: "<code>open(path)</code> with no mode means <code>\"r\"</code> — read. That is the safe default, and it is why the read example above does not need to name a mode at all." },

  { t: "h2", n: "2", text: "The four modes" },
  { t: "p", html: "<code>\"r\"</code> reads and requires the file to exist. <code>\"w\"</code> writes and <b>empties the file first</b>. <code>\"a\"</code> appends to the end. <code>\"x\"</code> creates a new file and refuses if one is already there — which makes it the mode to reach for when overwriting would be a disaster." },
  { t: "code", file: "modes.py", code: "with open(\"log.txt\", \"w\") as f:\n    f.write(\"first run\\n\")\n\nwith open(\"log.txt\", \"w\") as f:      # this line EMPTIES the file\n    f.write(\"second run\\n\")\n\nwith open(\"log.txt\", \"a\") as f:      # this one adds to it\n    f.write(\"third run\\n\")\n\nprint(open(\"log.txt\").read().strip())", output: "second run\nthird run" },
  { t: "p", html: "\"first run\" is gone, and nothing told you. Press the modes in the panel below and watch the file itself — the point is that <code>\"w\"</code> truncates on <b>open</b>, not on write." },
  { t: "viz", name: "file-lab" },
  { t: "note", variant: "warn", html: "Try this order in the panel: press <code>\"w\"</code>, then <b>open</b>, and stop there. Two lines are already gone and you have not written a single byte. That is why a script that opens the wrong path in <code>\"w\"</code> and then crashes has still destroyed the file." },
  { t: "analogy", concept: "File modes and the cursor", real: "A notebook and your finger on the page", html: "The file is a notebook and the cursor is your finger. <code>\"r\"</code> puts your finger at the top and lets you only read. <code>\"a\"</code> flips to the last written page so anything new goes after. <code>\"w\"</code> <b>tears out every page</b> before handing you the notebook. And once your finger has travelled to the end, reading again gives you nothing — not because the notebook is empty, but because there is nothing left <i>ahead of your finger</i>." },

  { t: "h2", n: "3", text: "Reading — and the cursor that catches everyone" },
  { t: "p", html: "<code>f.read()</code> returns everything from the cursor onward and leaves the cursor at the end. So the second <code>f.read()</code> on the same handle returns an empty string. <code>f.readline()</code> takes one line, newline included." },
  { t: "code", file: "reading.py", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"alpha\\nbeta\\ngamma\\n\")\n\nf = open(\"notes.txt\")\nprint(repr(f.readline()))       # one line, newline included\nprint(f.read().splitlines())    # everything still ahead of the cursor\nprint(repr(f.read()))           # nothing left\nf.close()", output: "'alpha\\n'\n['beta', 'gamma']\n''" },
  { t: "p", html: "The best way to read a text file is to loop over the handle directly. It hands you one line at a time and never holds more than one line in memory." },
  { t: "code", file: "loop.py", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"alpha\\nbeta\\ngamma\\n\")\n\nwith open(\"notes.txt\") as f:\n    for i, line in enumerate(f, 1):\n        print(i, line.strip())", output: "1 alpha\n2 beta\n3 gamma" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is not a style preference, it is the difference between a script that runs and one that dies. A 4 GB CSV of transactions read with <code>f.read()</code> tries to build a 4 GB string and the process is killed; the same file looped line by line uses a few kilobytes and finishes. Data engineers stream files for exactly this reason — and when you meet Pandas' <code>chunksize</code> in a later track, this is the idea it is built on." },

  { t: "h2", n: "4", text: "When the file is not there" },
  { t: "p", html: "Reading a file that does not exist raises <code>FileNotFoundError</code>. You can either catch it or check first — catching is usually better, because between your check and your open, the file could still disappear." },
  { t: "code", file: "missing.py", code: "try:\n    with open(\"nope.txt\") as f:\n        print(f.read())\nexcept FileNotFoundError:\n    print(\"no such file - carrying on with a default\")\n\nimport os\nprint(os.path.exists(\"nope.txt\"))", output: "no such file - carrying on with a default\nFalse" },
  { t: "code", file: "exclusive.py", code: "with open(\"fresh.txt\", \"w\") as f:\n    f.write(\"data\\n\")\n\ntry:\n    with open(\"fresh.txt\", \"x\") as f:   # x = create, refuse to overwrite\n        f.write(\"data\\n\")\nexcept FileExistsError:\n    print(\"refused - the file is already there\")", output: "refused - the file is already there" },
  { t: "note", variant: "tip", html: "<b>These snippets do run in the practice editor.</b> The browser gives Python a small in-memory filesystem, so <code>open()</code>, <code>write()</code> and <code>read()</code> all behave exactly as they do on your machine — but the files live at <code>/home/pyodide</code> and vanish when you close the tab. Real, permanent files need Python on your own computer." },

  { t: "trace", intro: "Three writes, then two reads. Work out each value before you open it.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"alpha\\n\")\n\nwith open(\"notes.txt\", \"w\") as f:\n    f.write(\"beta\\n\")\n\nwith open(\"notes.txt\", \"a\") as f:\n    f.write(\"gamma\\n\")\n\nf = open(\"notes.txt\")\nrows = f.read().splitlines()\ncount = len(rows)\nagain = f.read()\nleft = len(again)\nf.close()\n\nwith open(\"notes.txt\", \"a\") as f:\n    f.write(\"delta\\n\")\n\ntotal = len(open(\"notes.txt\").read().splitlines())", steps: [
    { q: "After line 11, <code>rows</code> is", answer: "['beta', 'gamma']", accept: ["['beta','gamma']", "[\"beta\", \"gamma\"]", "[\"beta\",\"gamma\"]"], why: "\"alpha\" never survives. The second <code>open(..., \"w\")</code> on line 4 emptied the file before writing \"beta\", and line 7 opened in <code>\"a\"</code>, which adds without wiping." },
    { q: "After line 12, <code>count</code> is", answer: "2", why: "Two lines, not three — one <code>\"w\"</code> in the middle of that sequence quietly cost you a line of data." },
    { q: "After line 14, <code>left</code> is", answer: "0", why: "Line 11 already read to the end, so the cursor has nowhere left to go. <code>f.read()</code> returns an empty string, not the file again. This is the bug that makes people think the file emptied itself." },
    { q: "After line 20, <code>total</code> is", answer: "3", why: "<code>\"a\"</code> appended \"delta\" to the two lines already there. Swap that <code>\"a\"</code> for a <code>\"w\"</code> and the answer becomes 1 — the entire difference is one letter." },
  ]},

  { t: "drills", intro: "One per idea. Each is self-contained — write it yourself before opening the answer.", items: [
    { task: "Write one line to <code>notes.txt</code>, then read it back.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"first line\\n\")\n\nprint(open(\"notes.txt\").read().strip())", out: "first line" },
    { task: "Append a second line — the first one must survive.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"first line\\n\")\n\nwith open(\"notes.txt\", \"a\") as f:\n    f.write(\"second line\\n\")\n\nprint(open(\"notes.txt\").read().strip())", out: "first line\nsecond line" },
    { task: "Prove that <code>\"w\"</code> wipes on open: open in <code>\"w\"</code> and write <b>nothing</b>.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"keep me\\n\")\n\nwith open(\"notes.txt\", \"w\") as f:\n    pass\n\nprint(repr(open(\"notes.txt\").read()))", out: "''" },
    { task: "Read a file into a list of lines, without the newline characters.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"a\\nb\\nc\\n\")\n\nwith open(\"notes.txt\") as f:\n    rows = f.read().splitlines()\n\nprint(rows)", out: "['a', 'b', 'c']" },
    { task: "Loop over a file and number each line.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"alpha\\nbeta\\n\")\n\nwith open(\"notes.txt\") as f:\n    for i, line in enumerate(f, 1):\n        print(i, line.strip())", out: "1 alpha\n2 beta" },
    { task: "Count the lines in a file without loading it all into memory.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"x\\ny\\nz\\n\")\n\nwith open(\"notes.txt\") as f:\n    print(sum(1 for _ in f))", out: "3" },
    { task: "Read only the first line of a file.", code: "with open(\"notes.txt\", \"w\") as f:\n    f.write(\"header\\nrow one\\n\")\n\nwith open(\"notes.txt\") as f:\n    print(f.readline().strip())", out: "header" },
    { task: "Write several lines at once with <code>writelines</code>.", code: "rows = [\"one\\n\", \"two\\n\", \"three\\n\"]\n\nwith open(\"notes.txt\", \"w\") as f:\n    f.writelines(rows)\n\nprint(open(\"notes.txt\").read().strip())", out: "one\ntwo\nthree" },
    { task: "Open a file that does not exist, without crashing.", code: "try:\n    with open(\"ghost.txt\") as f:\n        print(f.read())\nexcept FileNotFoundError:\n    print(\"file not found\")", out: "file not found" },
    { task: "Check whether a file exists before you touch it.", code: "import os\n\nprint(os.path.exists(\"ghost.txt\"))", out: "False" },
  ]},

  { t: "mistakes", items: [
    { bad: "with open(\"data.csv\", \"w\") as f:\n    rows = f.read()", why: "Two disasters in two lines. <code>\"w\"</code> <b>deleted data.csv</b> the instant it opened, and then <code>read()</code> fails anyway because a file opened for writing is not readable. The data is gone before the error appears.", fix: "with open(\"data.csv\") as f:\n    rows = f.read()" },
    { bad: "def log(msg):\n    with open(\"app.log\", \"w\") as f:\n        f.write(msg + \"\\n\")", why: "Every call empties the log and writes one line, so the file only ever holds the <b>last</b> message. Nothing errors — you simply lose the history, and you notice weeks later when you need it.", fix: "def log(msg):\n    with open(\"app.log\", \"a\") as f:\n        f.write(msg + \"\\n\")" },
    { bad: "f = open(\"report.txt\", \"w\")\nf.write(build_report())\nf.close()", why: "If <code>build_report()</code> raises, <code>f.close()</code> never runs — the handle stays open and buffered text is never flushed to disk. You get an empty or half-written file.", fix: "with open(\"report.txt\", \"w\") as f:\n    f.write(build_report())" },
    { bad: "with open(\"huge.csv\") as f:\n    for line in f.readlines():\n        process(line)", why: "<code>readlines()</code> builds a list of <b>every</b> line in memory first. On a 4 GB file the process is killed before the loop starts. The handle itself is already iterable, so the list buys you nothing.", fix: "with open(\"huge.csv\") as f:\n    for line in f:\n        process(line)" },
  ]},

  { t: "debug", intro: "A logger that should record three events. It crashes on nothing and the output is still wrong. Read it before opening the fix.", code: "def log(msg):\n    with open(\"app.log\", \"w\") as f:\n        f.write(msg + \"\\n\")\n\nlog(\"started\")\nlog(\"loading scores\")\nlog(\"done\")\n\nprint(open(\"app.log\").read().strip())", symptom: "prints only: done", q: "Three calls, three writes, no crash — so where did the first two lines go?", fix: "open(\"app.log\", \"w\").close()      # empty the log ONCE, at startup\n\ndef log(msg):\n    with open(\"app.log\", \"a\") as f:\n        f.write(msg + \"\\n\")\n\nlog(\"started\")\nlog(\"loading scores\")\nlog(\"done\")\n\nprint(open(\"app.log\").read().strip())", why: "All three writes happened. The problem is that each one was preceded by an <b>open in <code>\"w\"</code></b>, which empties the file first — so every call deleted the previous message before adding its own, and only the last survived.<br/><br/>The fix is the pattern real logging code uses: truncate <b>once</b> at startup if you want a fresh file, then open in <code>\"a\"</code> for every write after that. Note how quiet this bug is — no exception, no warning, and the program is doing precisely what you told it to. You would only discover it the day you needed the log to find another bug." },

  { t: "recap", items: [
    "<code>with open(...) as f:</code> — always, because it closes the handle even when the code inside crashes",
    "<code>\"r\"</code> read (the default) · <code>\"w\"</code> write · <code>\"a\"</code> append · <code>\"x\"</code> create-or-refuse",
    "<code>\"w\"</code> empties the file at <b>open</b> time, before you write anything",
    "To add to a file, the mode is <code>\"a\"</code>",
    "<code>f.read()</code> twice gives <code>''</code> the second time — the cursor is at the end",
    "Loop over the handle for big files; <code>read()</code> and <code>readlines()</code> load the whole thing",
    "A missing file raises <code>FileNotFoundError</code> — catch it, do not assume",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>\"w\"</code> and <code>\"a\"</code>?", a: "Both open a file for writing and both create it if it does not exist. <code>\"w\"</code> truncates the file to zero length as it opens, so the previous contents are gone. <code>\"a\"</code> puts the cursor at the end and leaves everything intact. Anything that accumulates — logs, exports appended in batches — wants <code>\"a\"</code>." },
    { level: "beginner", q: "Why use <code>with open(...)</code> instead of <code>open()</code> and <code>close()</code>?", a: "<code>with</code> is a context manager: it guarantees the file is closed when the block exits, including when an exception is raised inside it. With a manual <code>close()</code>, any error in between skips the close, so the handle leaks and buffered writes are never flushed — you end up with a truncated file. It is also shorter and impossible to forget." },
    { level: "intermediate", q: "How would you process a file too large to fit in memory?", a: "Iterate over the file handle directly — <code>for line in f</code> — which reads one line at a time and keeps memory flat regardless of file size. Avoid <code>read()</code> and <code>readlines()</code>, since both materialise the whole file. For fixed-size chunks of a binary file, loop on <code>f.read(8192)</code> until it returns empty. In Pandas the same idea appears as <code>read_csv(..., chunksize=...)</code>." },
    { level: "intermediate", q: "What does <code>f.read()</code> return the second time you call it?", a: "An empty string. A handle keeps a cursor, and the first <code>read()</code> consumed everything and left the cursor at the end of the file. To read again you either reopen the file or call <code>f.seek(0)</code> to move the cursor back to the start. This surprises people because it looks as though the file emptied itself." },
    { level: "intermediate", q: "When would you choose mode <code>\"x\"</code>?", a: "When silently overwriting would be a real loss and you would rather fail loudly. <code>\"x\"</code> creates the file and raises <code>FileExistsError</code> if it already exists, which makes it a good fit for writing a report or an export under a computed filename — a name collision becomes a visible error instead of a destroyed file. It is also atomic, so it doubles as a simple lock." },
  ]},
];

const L13 = [
  { t: "objectives", items: [
    "Use <code>import</code>, <code>from … import</code> and <code>as</code> — and know what each one binds",
    "Understand that importing <b>runs</b> the file, once",
    "Write your own module, and guard it with <code>if __name__ == \"__main__\"</code>",
    "Avoid the trap of naming your file after a module you import",
    "Know what <code>pip</code> and a virtual environment are actually for",
  ]},
  { t: "hook", q: "You save a file called <code>random.py</code> to practise random numbers. The next day a different script in the same folder does <code>import random</code> and dies with <code>AttributeError: module 'random' has no attribute 'randint'</code>. Is Python broken?", why: "No — Python found <b>your</b> file first. The folder your script lives in is searched <b>before</b> the standard library, so your little practice file quietly replaced a module the whole language depends on. Nothing warns you, and the error names <code>random</code>, which sends you looking in exactly the wrong place." },
  { t: "think", q: "If <code>import math</code> gives you <code>math.sqrt</code>, why does <code>from math import sqrt</code> make <code>math.sqrt</code> stop working?", a: "Because the two statements bind <b>different names</b>. <code>import math</code> puts one name in your file — <code>math</code> — and everything is reached through it. <code>from math import sqrt</code> puts <code>sqrt</code> in your file and <b>never binds <code>math</code> at all</b>.<br/><br/>So <code>math.sqrt(16)</code> after a <code>from</code> import is not a typo — <code>math</code> genuinely does not exist in that file." },

  { t: "h2", n: "1", text: "The three ways to import" },
  { t: "def", term: "Module", en: "A module is simply a Python file, and importing it makes the names defined inside it available in the file doing the import.", hi: "In plain words: there is nothing special about a module. Any <code>.py</code> file you write is one — <code>import</code> is just Python running that file and handing you its names." },
  { t: "p", html: "<code>import math</code> binds the module. <code>import math as m</code> binds only the nickname. <code>from math import sqrt</code> binds only that one name. Which you choose decides what is legal on the next line." },
  { t: "code", file: "forms.py", code: "import math\nprint(math.sqrt(16))\n\nimport statistics as st\nprint(st.mean([2, 4, 6, 8]))\n\nfrom math import ceil, floor\nprint(ceil(4.2), floor(4.8))", output: "4.0\n5\n5 4" },
  { t: "viz", name: "import-lab" },
  { t: "p", html: "Click through the five statements above. Every one of them &quot;imports math&quot;, and every one leaves a different set of names in your file — which is the whole reason <code>NameError</code> shows up on a line that looks obviously correct." },
  { t: "analogy", concept: "import vs from-import", real: "A labelled toolbox", html: "<code>import math</code> puts the whole <b>labelled toolbox</b> on your bench: you must say <code>math.sqrt</code>, but you always know where a tool came from. <code>from math import sqrt</code> takes the one spanner out and <b>leaves the box in the van</b> — <code>sqrt</code> works bare, and <code>math</code> is simply not there. <code>from math import *</code> tips all 61 tools onto the bench at once, and if one has the same name as a tool you already had, yours is buried." },

  { t: "h2", n: "2", text: "Importing runs the file — once" },
  { t: "p", html: "An import is not a lookup, it is an <b>execution</b>. Python runs the whole file top to bottom, keeps the result in <code>sys.modules</code>, and every later import of the same module reuses that — it does not run again." },
  { t: "code", file: "helpers.py", code: "# helpers.py — a module of your own\n\ndef clean(name):\n    return name.strip().title()\n\nprint(\"helpers loaded\")\n\nif __name__ == \"__main__\":\n    print(\"running helpers.py directly\")\n    print(clean(\"  aarav  \"))", output: "helpers loaded\nrunning helpers.py directly\nAarav" },
  { t: "p", html: "Run that file directly and you see all three lines. <code>import helpers</code> from another file and you see only <b>helpers loaded</b> — because <code>__name__</code> is <code>\"helpers\"</code> then, not <code>\"__main__\"</code>." },
  { t: "note", variant: "key", html: "📌 <b>That is what the <code>__main__</code> guard is for.</b> Anything outside it runs on <b>every</b> import. Test code, a <code>print</code>, a database call left at the bottom of a file — all of it fires the moment somebody imports your module. The guard is how you say &quot;only when this file is the one being run&quot;." },

  { t: "h2", n: "3", text: "Your own modules, and the name that bites" },
  { t: "p", html: "Any <code>.py</code> file next to your script can be imported by its filename without the extension. That convenience is also the trap: Python searches <b>your folder first</b>, so a file named after a real module hides the real one." },
  { t: "code", file: "which_one.py", code: "import json\n\n# When an import misbehaves, ask the module where it was loaded FROM.\n# A path inside your own project means you have shadowed the real one.\nprint(\"json\" in json.__file__)\nprint(json.__name__)", output: "True\njson" },
  { t: "p", html: "<code>__file__</code> is the diagnostic. If <code>import random</code> starts failing, print <code>random.__file__</code> — when it points at your own folder instead of Python's <code>Lib</code>, you have found the culprit in one line." },
  { t: "note", variant: "warn", html: "<b>Never name a file after something you import.</b> <code>random.py</code>, <code>math.py</code>, <code>json.py</code>, <code>csv.py</code>, <code>email.py</code> and <code>test.py</code> are the ones that catch people. If it has already happened, delete the stray <code>.py</code> <b>and</b> its <code>.pyc</code> in <code>__pycache__</code>, or the broken import survives the fix." },

  { t: "h2", n: "4", text: "pip and virtual environments" },
  { t: "p", html: "The standard library ships with Python. Everything else — pandas, numpy, matplotlib, scikit-learn — is installed with <code>pip</code>, which downloads from PyPI. A <b>virtual environment</b> gives each project its own private set of those packages." },
  { t: "note", variant: "tip", html: "<b>The four commands worth memorising</b> (these run in the terminal, not in a <code>.py</code> file):<pre>python -m venv .venv          # create the environment\n.venv\\Scripts\\activate        # Windows  (mac/Linux: source .venv/bin/activate)\npip install pandas            # install into THIS project only\npip freeze > requirements.txt # record exactly what you installed</pre>" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> without a venv, every project shares one global set of packages — so upgrading pandas for a new project silently breaks the one you shipped last month, and there is no record of which versions ever worked. <code>requirements.txt</code> is what lets a teammate reproduce your environment exactly, and it is the first thing an interviewer looks for in a GitHub repo." },

  { t: "trace", intro: "Two imports of the same module, done two different ways. Work out each value.", code: "import math\n\na = math.sqrt(16)\nb = math.floor(3.9)\n\nfrom math import pi\n\nc = round(pi, 2)\nd = \"math\" in dir()\ne = \"pi\" in dir()\nf = \"sqrt\" in dir()", steps: [
    { q: "After line 3, <code>a</code> is", answer: "4.0", why: "<code>math.sqrt</code> always returns a float, even for a perfect square — so 4.0, not 4." },
    { q: "After line 8, <code>c</code> is", answer: "3.14", why: "<code>from math import pi</code> bound the bare name <code>pi</code>, so it can be used without a prefix." },
    { q: "After line 10, <code>e</code> is", answer: "True", why: "<code>pi</code> is now a name in this file, because the <code>from</code> import put it there directly." },
    { q: "After line 11, <code>f</code> is", answer: "False", why: "This is the point of the whole lesson. <code>from math import pi</code> brought <b>only</b> <code>pi</code> — <code>sqrt</code> was never bound as a bare name, even though <code>math.sqrt</code> works fine, because <code>math</code> is still imported from line 1." },
  ]},

  { t: "drills", intro: "One per idea. Each runs on its own — write it before opening the answer.", items: [
    { task: "Import <code>math</code> and print the square root of 81.", code: "import math\n\nprint(math.sqrt(81))", out: "9.0" },
    { task: "Import <code>math</code> under the nickname <code>m</code> and round 7.8 down.", code: "import math as m\n\nprint(m.floor(7.8))", out: "7" },
    { task: "Bring in just <code>ceil</code>, and use it bare.", code: "from math import ceil\n\nprint(ceil(4.2))", out: "5" },
    { task: "Bring in <code>pi</code> and <code>e</code> together, each rounded to 2 places.", code: "from math import pi, e\n\nprint(round(pi, 2), round(e, 2))", out: "3.14 2.72" },
    { task: "Show that <code>random.seed</code> makes results repeatable.", code: "import random\n\nrandom.seed(42)\na = random.randint(1, 100)\n\nrandom.seed(42)\nb = random.randint(1, 100)\n\nprint(a == b)", out: "True" },
    { task: "Use <code>statistics.mean</code> on a list of marks.", code: "from statistics import mean\n\nprint(mean([2, 4, 6, 8]))", out: "5" },
    { task: "Format a fixed date as day-month-year.", code: "from datetime import date\n\nprint(date(2026, 7, 23).strftime(\"%d-%m-%Y\"))", out: "23-07-2026" },
    { task: "Ask a module what it contains, without leaving Python.", code: "import math\n\nprint(\"sqrt\" in dir(math))", out: "True" },
    { task: "Print the special name Python gives the file being run.", code: "print(__name__)", out: "__main__" },
    { task: "Turn a dictionary into JSON text with the <code>json</code> module.", code: "import json\n\nprint(json.dumps({\"name\": \"Aarav\", \"marks\": 91}))", out: "{\"name\": \"Aarav\", \"marks\": 91}" },
  ]},

  { t: "mistakes", items: [
    { bad: "from math import sqrt\n\nprint(math.sqrt(16))", why: "<code>from math import sqrt</code> never binds <code>math</code>, so this is a <code>NameError</code> — not a typo. Either use <code>sqrt(16)</code>, or import the module instead.", fix: "import math\n\nprint(math.sqrt(16))" },
    { bad: "# a file you saved as random.py\nimport random\n\nprint(random.randint(1, 6))", why: "Your own folder is searched first, so <code>import random</code> imports <b>this very file</b> and then cannot find <code>randint</code> in it. Renaming the file fixes it — but delete <code>__pycache__/random.pyc</code> too, or the stale copy keeps winning.", fix: "# rename the file to dice_practice.py\nimport random\n\nprint(random.randint(1, 6))" },
    { bad: "from math import *\nfrom statistics import *\n\nprint(pow(2, 3))", why: "Two star-imports means 61 names from one module and more from the next, and you cannot see which came from where. Here <code>math.pow</code> quietly replaces the builtin <code>pow</code>, so a whole number turns into <code>8.0</code>.", fix: "import math\nimport statistics\n\nprint(pow(2, 3))" },
    { bad: "# helpers.py\ndef clean(s):\n    return s.strip()\n\nprint(clean(\"  test  \"))", why: "That <code>print</code> is outside a <code>__main__</code> guard, so it runs every single time anybody imports <code>helpers</code> — test output appearing in the middle of somebody else's program.", fix: "# helpers.py\ndef clean(s):\n    return s.strip()\n\nif __name__ == \"__main__\":\n    print(clean(\"  test  \"))" },
  ]},

  { t: "debug", intro: "A script counting how many password combinations are possible. No error, no warning — and the answer is the wrong type. Read it before opening the fix.", code: "from math import *\n\nsymbols = 26\nlength = 4\n\ncombos = pow(symbols, length)\n\nprint(\"combinations:\", combos)\nprint(\"type:\", type(combos).__name__)", symptom: "prints combinations: 456976.0 and type: float", q: "Nothing here mentions floats, and pow() on two whole numbers should give a whole number. Where did the decimal come from?", fix: "import math\n\nsymbols = 26\nlength = 4\n\ncombos = pow(symbols, length)\n\nprint(\"combinations:\", combos)\nprint(\"type:\", type(combos).__name__)", why: "<code>from math import *</code> poured all 61 of math's public names into the file, and exactly one of them — <code>pow</code> — has the same name as a Python builtin. So the <code>pow</code> being called on that line is <b>math.pow</b>, which always returns a float, not the builtin <code>pow</code>, which returns an int for integer arguments.<br/><br/>Nothing is misspelled and nothing errors: a name you never wrote was silently replaced by one you never asked for. Switching to <code>import math</code> leaves the builtin alone, and the count is an <code>int</code> again. This is the concrete reason <code>from x import *</code> is banned in production code — you cannot tell, by reading the file, which <code>pow</code> you are calling." },

  { t: "recap", items: [
    "<code>import math</code> binds <b>math</b> · <code>import math as m</code> binds <b>only m</b> · <code>from math import sqrt</code> binds <b>only sqrt</b>",
    "After a <code>from</code> import, <code>math.…</code> is a <code>NameError</code> — <code>math</code> was never bound",
    "Importing <b>runs</b> the file, top to bottom, and only the first time",
    "<code>if __name__ == \"__main__\":</code> keeps your test code from firing on import",
    "Your own folder is searched first — never name a file <code>random.py</code>, <code>json.py</code>, <code>csv.py</code>",
    "<code>from x import *</code> hides where names came from and can replace builtins",
    "<code>python -m venv .venv</code> per project, then <code>pip install</code> and <code>pip freeze &gt; requirements.txt</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>import math</code> and <code>from math import sqrt</code>?", a: "They bind different names. <code>import math</code> puts the module object in your namespace, so everything is reached as <code>math.something</code> and the origin of each name stays obvious. <code>from math import sqrt</code> puts only <code>sqrt</code> in your namespace and does not bind <code>math</code> at all, so <code>math.sqrt</code> would raise <code>NameError</code>. The first is preferred in most code precisely because it keeps the source of a name visible." },
    { level: "beginner", q: "What does <code>if __name__ == \"__main__\":</code> do?", a: "Python sets a module's <code>__name__</code> to <code>\"__main__\"</code> when that file is the one being run, and to the module's own name when it is imported. So the guard runs a block only on direct execution. Without it, any demo code, prints or test calls at the bottom of a file execute every time somebody imports it." },
    { level: "intermediate", q: "Why is <code>from module import *</code> discouraged?", a: "It binds every public name at once — <code>math</code> alone is 61 — so a reader cannot tell which module a name came from, and static analysis cannot either. Worse, it silently overwrites names you already have, including builtins: after <code>from math import *</code>, <code>pow</code> is <code>math.pow</code> and returns a float instead of an int. With two star-imports, whichever came last wins, so the bug depends on line order." },
    { level: "intermediate", q: "What happens if you name your file <code>random.py</code>?", a: "The directory of the running script sits at the front of <code>sys.path</code>, so <code>import random</code> finds your file instead of the standard library one. Everything that depends on the real module then fails with confusing <code>AttributeError</code>s naming <code>random</code>. Renaming the file fixes it, but the cached <code>__pycache__/random.pyc</code> has to go too, or the stale bytecode keeps being used." },
    { level: "intermediate", q: "Why use a virtual environment instead of installing packages globally?", a: "Because projects need different, often conflicting, versions of the same library. A venv gives each project an isolated <code>site-packages</code>, so upgrading pandas for a new project cannot break one you already shipped. Paired with <code>pip freeze > requirements.txt</code>, it also makes the environment reproducible — a colleague, a CI runner or a server can install the exact versions you tested against." },
  ]},
];

const L14 = [
  { t: "objectives", items: [
    "Tell <code>int</code> from <code>float</code>, and <code>/</code> from <code>//</code> from <code>%</code>",
    "Use <code>round</code>, <code>abs</code>, <code>**</code> and the <code>math</code> module",
    "Understand why <code>0.1 + 0.2</code> is not <code>0.3</code>",
    "Compare decimals safely — and know when money needs <code>Decimal</code>",
  ]},
  { t: "hook", q: "Ask Python what <code>0.1 + 0.2</code> is. You expect <code>0.3</code>. It answers <code>0.30000000000000004</code>. Why?", why: "This is not a bug and not a Python quirk — every language storing decimals in binary does it. Some decimals, 0.1 among them, simply <b>cannot be written exactly</b> in binary, the same way 1/3 cannot be written exactly in decimal. Which is why doing money in floats is genuinely dangerous." },
  { t: "think", q: "If <code>0.1</code> cannot be stored exactly, why does <code>print(0.1)</code> show a clean <code>0.1</code>?", a: "Because printing <b>rounds for you</b>. Python shows the shortest text that would read back as the same stored number, so the mess stays hidden until two of them are added and the error becomes big enough to surface.<br/><br/>That is what makes this bug so slippery: everything looks perfect right up until a comparison fails or a total is a paisa short." },

  { t: "h2", n: "1", text: "The three kinds of division" },
  { t: "def", term: "int and float", en: "An int is a whole number of unlimited size; a float is a decimal number held in limited binary precision.", hi: "In plain words: an <code>int</code> is exact however large it gets, while a <code>float</code> trades exactness for the ability to hold decimals." },
  { t: "p", html: "<code>/</code> is ordinary division and <b>always</b> gives a float. <code>//</code> is floor division — the whole number below. <code>%</code> is the remainder, and <code>**</code> is power." },
  { t: "code", file: "div.py", code: "print(7 / 2)    # ordinary division -> always a float\nprint(7 // 2)   # floor division -> the whole number below\nprint(7 % 2)    # remainder\nprint(2 ** 5)   # power\n\nprint(-7 // 2)  # careful: floor means DOWN, not towards zero", output: "3.5\n3\n1\n32\n-4" },
  { t: "note", variant: "warn", html: "That last line surprises people. <code>//</code> rounds <b>down</b>, not towards zero — so <code>-7 // 2</code> is <code>-4</code>, not <code>-3</code>. If you want to chop towards zero, use <code>int(-7 / 2)</code>." },

  { t: "h2", n: "2", text: "round, abs and the math module" },
  { t: "p", html: "<code>round(x, n)</code> rounds to n decimal places, <code>abs(x)</code> drops the sign. Import <code>math</code> for the rest." },
  { t: "code", file: "math_tools.py", code: "import math\n\nprint(round(3.567, 1))\nprint(abs(-7))\nprint(math.sqrt(16))\nprint(math.ceil(4.1))    # always up\nprint(math.floor(4.9))   # always down", output: "3.6\n7\n4.0\n5\n4" },
  { t: "note", variant: "tip", html: "<b>Python rounds half to even.</b> <code>round(2.5)</code> is <code>2</code> and <code>round(3.5)</code> is <code>4</code> — not a mistake, it is banker's rounding, which stops a long column of numbers drifting upward. It catches almost everybody once." },

  { t: "h2", n: "3", text: "Why decimals go wrong" },
  { t: "p", html: "Binary can write halves and quarters perfectly. It cannot finish writing 0.1, so what gets stored is very slightly off — and two slightly-off numbers add up to a visibly-off answer." },
  { t: "viz", name: "float-lab" },
  { t: "p", html: "Press <b>Add 0.1</b> ten times in that panel. Each step looks fine, and the total lands on <code>0.9999999999999999</code>. Nothing errored, nothing warned you, and <code>total == 1.0</code> is now <code>False</code>." },
  { t: "analogy", concept: "Float precision", real: "Writing 1/3 in decimal", html: "Write <code>1/3</code> as a decimal and you get 0.3333… forever, so you stop somewhere and accept a tiny error. The computer has the same problem in <b>binary</b>, just with different fractions — 0.1 is one it cannot finish. It is arithmetic, not a defect." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is a real bug class in data work. A revenue total summed over a million float rows can land a fraction off, and a report that must balance to the paisa will not. The rule money systems follow: <b>store amounts as integer paise</b>, or use <code>Decimal</code> — and never compare two floats with <code>==</code>." },

  { t: "h2", n: "4", text: "Comparing decimals safely" },
  { t: "code", file: "compare.py", code: "total = 0.1 + 0.2\n\nprint(total == 0.3)                 # False — do not do this\nprint(round(total, 2) == 0.3)       # fine for a fixed number of places\n\nimport math\nprint(math.isclose(total, 0.3))     # the general answer", output: "False\nTrue\nTrue" },
  { t: "note", variant: "tip", html: "<code>math.isclose</code> is the one to reach for when you do not know the scale in advance — it compares relative to the size of the numbers instead of a fixed number of decimals." },

  { t: "trace", intro: "Work out each value. Two of these are the traps.", code: "a = 7 / 2\nb = 7 // 2\nc = -7 // 2\nd = round(2.5)\ne = 0.1 + 0.2 == 0.3", steps: [
    { q: "After line 2, <code>b</code> is", answer: "3", why: "Floor division throws the decimal away and hands back an int — 3, not 3.5." },
    { q: "After line 3, <code>c</code> is", answer: "-4", why: "Floor means <b>down the number line</b>, not towards zero. -3.5 rounds down to -4. This is the one people get wrong." },
    { q: "After line 4, <code>d</code> is", answer: "2", why: "Banker's rounding: a value sitting exactly halfway goes to the nearest <b>even</b> number, so 2.5 becomes 2 while 3.5 becomes 4." },
    { q: "After line 5, <code>e</code> is", answer: "False", why: "0.1 + 0.2 stores as 0.30000000000000004, so the comparison is False. Correct arithmetic, wrong test." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Print <code>17 / 5</code> and <code>17 // 5</code> side by side.", code: "print(17 / 5, 17 // 5)", out: "3.4 3" },
    { task: "Find the remainder when 17 is divided by 5.", code: "print(17 % 5)", out: "2" },
    { task: "Check whether a number is even, using <code>%</code>.", code: "n = 14\nprint(n % 2 == 0)", out: "True" },
    { task: "Raise 3 to the power 4.", code: "print(3 ** 4)", out: "81" },
    { task: "Round 3.14159 to two decimal places.", code: "print(round(3.14159, 2))", out: "3.14" },
    { task: "Get the square root of 144.", code: "import math\nprint(math.sqrt(144))", out: "12.0" },
    { task: "Round 4.1 up, and 4.9 down.", code: "import math\nprint(math.ceil(4.1), math.floor(4.9))", out: "5 4" },
    { task: "Show that <code>0.1 + 0.2 == 0.3</code> is False.", code: "print(0.1 + 0.2 == 0.3)", out: "False" },
    { task: "Compare the same two numbers <b>safely</b>.", code: "import math\nprint(math.isclose(0.1 + 0.2, 0.3))", out: "True" },
    { task: "Split 1000 rupees between 3 people — whole rupees each, and what is left over.", code: "each = 1000 // 3\nleft = 1000 % 3\nprint(each, left)", out: "333 1" },
  ]},

  { t: "mistakes", items: [
    { bad: "total = 0.1 + 0.2\nif total == 0.3:\n    print(\"exact\")", why: "<code>0.1 + 0.2</code> is stored as <code>0.30000000000000004</code>, so this is <b>never</b> True. Never compare two floats with <code>==</code>.", fix: "import math\nif math.isclose(total, 0.3):\n    print(\"close enough\")" },
    { bad: "half = 7 / 2\nprint(items[half])", why: "<code>/</code> always produces a float, and an index has to be an int — so this raises <code>TypeError</code>. Use <code>//</code> when you want a position.", fix: "half = 7 // 2\nprint(items[half])" },
    { bad: "price = 0.1\ntotal = 0\nfor _ in range(10):\n    total += price", why: "Ten additions of a value binary cannot store exactly leaves <code>0.9999999999999999</code>. On an invoice that is a paisa short, and no error is raised to tell you.", fix: "paise = 10\ntotal = 0\nfor _ in range(10):\n    total += paise   # keep money in whole paise" },
    { bad: "print(round(2.5))", why: "This gives <b>2</b>, not 3. Python rounds a value sitting exactly halfway to the nearest <b>even</b> number. It is deliberate — it stops long columns of numbers drifting upward — but it surprises everyone the first time.", fix: "import math\nprint(math.floor(2.5 + 0.5))   # if you really want half-up" },
  ]},

  { t: "debug", intro: "A bill for five items at ₹19.99 each. The total prints perfectly and the check still fails. Read it before opening the fix.", code: "price = 19.99\ntotal = 0\n\nfor _ in range(5):\n    total += price\n\nprint(\"Total:\", round(total, 2))\nprint(total == 99.95)", symptom: "prints Total: 99.95 and then False", q: "The total on screen is exactly right. So how can the comparison be False?", fix: "import math\n\nprice = 19.99\ntotal = 0\n\nfor _ in range(5):\n    total += price\n\nprint(\"Total:\", round(total, 2))\nprint(math.isclose(total, 99.95))", why: "You are looking at two different numbers. <code>round(total, 2)</code> makes a <b>tidied copy</b> for display — that is the 99.95 on screen. The comparison on the next line tests the <b>stored</b> value, which is <code>99.94999999999999</code>, because five additions of a number binary cannot hold exactly have drifted. So the screen and the verdict disagree, and the bug looks impossible. <code>math.isclose</code> asks the question you actually meant. For money the sturdier answer is to keep amounts in whole paise as integers, or use <code>Decimal</code>." },

  { t: "recap", items: [
    "<code>/</code> always gives a float · <code>//</code> floors <b>downward</b> · <code>%</code> is the remainder · <code>**</code> is power",
    "<code>-7 // 2</code> is <code>-4</code> — floor means down, not towards zero",
    "<code>round(2.5)</code> is <code>2</code> — Python rounds half to even",
    "Binary cannot store 0.1 exactly, so decimal sums drift",
    "Never compare floats with <code>==</code> — use <code>round()</code> or <code>math.isclose()</code>",
    "For money: whole paise as integers, or <code>Decimal</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>/</code> and <code>//</code>?", a: "<code>/</code> is true division and always returns a float, even for <code>4 / 2</code>, which gives <code>2.0</code>. <code>//</code> is floor division and returns the whole number below the result — an int when both operands are ints. Indexes and counts want <code>//</code>." },
    { level: "beginner", q: "Why does <code>0.1 + 0.2 == 0.3</code> return False?", a: "Floats are stored in binary, and 0.1 has no exact binary representation — the same way 1/3 has no exact decimal one. The stored value is fractionally off, so the sum is <code>0.30000000000000004</code>. Compare with <code>math.isclose</code> or round both sides first." },
    { level: "intermediate", q: "How would you handle currency in Python?", a: "Not with floats. Either store amounts as integers in the smallest unit — paise rather than rupees — or use <code>decimal.Decimal</code>, which does base-10 arithmetic exactly and lets you set the rounding rule. Financial code that sums millions of float rows will not balance, and the discrepancy is very hard to trace afterwards." },
    { level: "intermediate", q: "What does <code>round(2.5)</code> return, and why?", a: "<code>2</code>. Python uses banker's rounding — a value exactly halfway goes to the nearest even number — so <code>round(2.5)</code> is 2 and <code>round(3.5)</code> is 4. Always rounding halves up biases a long column of numbers upward; alternating removes that bias." },
    { level: "intermediate", q: "Is there a limit to how large an <code>int</code> can be in Python?", a: "No fixed limit — Python ints grow to whatever memory allows, so <code>2 ** 1000</code> is exact. Floats are the opposite: fixed 64-bit precision, roughly 15–17 significant digits, and they lose exactness well before ints do. It is one reason to keep counters and money as ints." },
  ]},
];
const L15 = [
  { t: "objectives", items: [
    "Build strings with <b>f-strings</b>, and know why they beat <code>+</code> and <code>%</code>",
    "Round, pad, align and add thousands separators with format specs",
    "Read the grammar <code>{value:align width .precision type}</code> instead of memorising recipes",
    "Spot the missing <code>f</code> — the bug that prints your placeholder instead of your data",
    "Use <code>{x=}</code> to debug without writing a label twice",
  ]},
  { t: "hook", q: "This line runs perfectly and prints <code>Hello, {name}! You scored {marks}%</code> on screen. Not the values — the <b>braces</b>. What is missing?", why: "The letter <code>f</code>. Without it Python sees an ordinary string and has no reason to look inside the braces, so it prints them literally. There is no error, no warning, and the line looks completely correct — which is why this one costs beginners so much time." },
  { t: "think", q: "<code>f\"{price:.2f}\"</code> shows <code>19.99</code>. Has the value of <code>price</code> changed?", a: "No. A format spec only decides how the value is <b>drawn</b> — it builds a new string and leaves the original number exactly as it was.<br/><br/>That matters more than it sounds. A total can print as a tidy <code>99.95</code> while the number still stored is <code>99.94999999999999</code>, so the screen and a later comparison disagree. Formatting is for humans; it is not rounding your data." },

  { t: "h2", n: "1", text: "f-strings, and the two older ways" },
  { t: "def", term: "f-string", en: "An f-string is a string literal prefixed with f, in which any expression written inside braces is evaluated and inserted at that position.", hi: "In plain words: the <code>f</code> is what gives the braces meaning. Inside them you can put a variable, a calculation, a function call — anything that produces a value." },
  { t: "p", html: "You will meet all three styles in real code. Write f-strings; recognise the others when you read them." },
  { t: "code", file: "three_ways.py", code: "name = \"Aarav\"\nmarks = 91\n\nprint(f\"{name} scored {marks}%\")           # f-string  - use this\nprint(\"{} scored {}%\".format(name, marks))  # .format() - older\nprint(\"%s scored %d%%\" % (name, marks))     # %         - oldest\n\n# an f-string holds any expression, not just a name\nprint(f\"{name.upper()} needs {100 - marks} more\")", output: "Aarav scored 91%\nAarav scored 91%\nAarav scored 91%\nAARAV needs 9 more" },
  { t: "note", variant: "warn", html: "<b>The missing <code>f</code>.</b> <code>print(\"{name} scored\")</code> prints <code>{name} scored</code> — literally. Python raises nothing, because a plain string with braces in it is perfectly valid. If your output contains braces, that is the first thing to check." },

  { t: "h2", n: "2", text: "The bit after the colon" },
  { t: "p", html: "Everything after the <code>:</code> is the <b>format spec</b>, and it has a grammar: <code>{value:[fill][align][sign][width][,][.precision][type]}</code>. You never need all of it at once." },
  { t: "viz", name: "format-lab" },
  { t: "p", html: "Click through those specs. <code>.2f</code> rounds for display, <code>,</code> groups thousands, <code>&gt;12</code> pads to twelve characters — and the column above shows exactly where the padding goes." },
  { t: "code", file: "specs.py", code: "price = 1234.5678\nrate = 0.8756\n\nprint(f\"{price:.2f}\")\nprint(f\"{price:,.2f}\")\nprint(f\"{price:>12.2f}|\")\nprint(f\"{price:<12.2f}|\")\nprint(f\"{price:012.2f}\")\nprint(f\"{rate:.1%}\")", output: "1234.57\n1,234.57\n     1234.57|\n1234.57     |\n000001234.57\n87.6%" },
  { t: "note", variant: "tip", html: "<b><code>%</code> multiplies by 100 for you.</b> <code>rate</code> is <code>0.8756</code> and prints as <code>87.6%</code> — so never write <code>f\"{rate * 100:.1f}%\"</code> and <code>:.1%</code> together, or you will ship 8756%." },
  { t: "analogy", concept: "A format spec", real: "A printed form with fixed boxes", html: "Think of a printed invoice where the amount box is exactly twelve characters wide. <code>:.2f</code> decides <b>how the number is written</b>, <code>:,</code> adds the separators a reader expects, and <code>&gt;12</code> decides <b>where in the box it sits</b> — pushed right, so every row's decimal point lines up in a column. The number in your program never changes; only the printing on the form does." },

  { t: "h2", n: "3", text: "Lining data up in columns" },
  { t: "p", html: "Alignment is what turns a pile of prints into a readable table. Text defaults to left, numbers to right — and that default is usually what you want." },
  { t: "code", file: "table.py", code: "rows = [(\"Aarav\", 91), (\"Diya\", 8), (\"Kabir\", 100)]\n\nfor name, marks in rows:\n    print(f\"{name:<10}{marks:>5}\")", output: "Aarav        91\nDiya          8\nKabir       100" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> a data script that prints a summary is read by a human every morning, and misaligned numbers make it unreadable — <code>8</code> and <code>100</code> in the same ragged column force the reader to check every row. One <code>:&gt;5</code> makes the units line up under each other. The same specs feed straight into Pandas' <code>to_string</code> and report formatting later." },

  { t: "h2", n: "4", text: "The = spec, for debugging" },
  { t: "p", html: "Putting <code>=</code> at the end of an expression prints the expression itself along with its value. It is the fastest way to check a variable without typing its name twice." },
  { t: "code", file: "debugging.py", code: "marks = 91\nbonus = 4\n\nprint(f\"{marks=}\")\nprint(f\"{marks + bonus=}\")\nprint(f\"{marks / 3=:.2f}\")", output: "marks=91\nmarks + bonus=95\nmarks / 3=30.33" },

  { t: "trace", intro: "Formatting only changes the drawing, never the value. Work each one out.", code: "price = 19.995\n\nshown = f\"{price:.2f}\"\nsame = price == 19.995\nlength = len(shown)\n\nname = \"Diya\"\npadded = f\"{name:>8}\"\nwidth = len(padded)\n\nrate = 0.5\npercent = f\"{rate:.0%}\"", steps: [
    { q: "After line 3, <code>shown</code> is", answer: "20.00", why: "<code>.2f</code> rounds to two decimals for display — 19.995 draws as 20.00. It is a new string, not a change to <code>price</code>." },
    { q: "After line 4, <code>same</code> is", answer: "True", why: "This is the point. <code>price</code> is untouched and still equals 19.995 — the formatting produced a separate string and left the number alone." },
    { q: "After line 9, <code>width</code> is", answer: "8", why: "<code>&gt;8</code> pads the 4-letter name with 4 spaces to reach a width of exactly 8." },
    { q: "After line 12, <code>percent</code> is", answer: "50%", why: "<code>%</code> multiplies by 100 and adds the sign, and <code>.0%</code> asks for no decimals — so 0.5 becomes 50%." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Print <code>Aarav scored 91</code> using an f-string.", code: "name = \"Aarav\"\nmarks = 91\n\nprint(f\"{name} scored {marks}\")", out: "Aarav scored 91" },
    { task: "Put a calculation directly inside the braces.", code: "marks = 91\n\nprint(f\"{marks} out of 100, missing {100 - marks}\")", out: "91 out of 100, missing 9" },
    { task: "Show a price with exactly two decimals.", code: "price = 1234.5678\n\nprint(f\"{price:.2f}\")", out: "1234.57" },
    { task: "Add thousands separators to a big number.", code: "salary = 1250000\n\nprint(f\"{salary:,}\")", out: "1,250,000" },
    { task: "Format money: separators <b>and</b> two decimals.", code: "price = 1234.5678\n\nprint(f\"{price:,.2f}\")", out: "1,234.57" },
    { task: "Right-align a number in a column 8 wide, with a <code>|</code> to show the edge.", code: "n = 42\n\nprint(f\"{n:>8}|\")", out: "      42|" },
    { task: "Left-align a name in a column 8 wide.", code: "name = \"Diya\"\n\nprint(f\"{name:<8}|\")", out: "Diya    |" },
    { task: "Pad an id to 5 digits with leading zeros.", code: "student_id = 42\n\nprint(f\"{student_id:05}\")", out: "00042" },
    { task: "Show 0.8756 as a percentage with one decimal.", code: "rate = 0.8756\n\nprint(f\"{rate:.1%}\")", out: "87.6%" },
    { task: "Use the <code>=</code> spec to print a name and its value at once.", code: "total = 250\n\nprint(f\"{total=}\")", out: "total=250" },
  ]},

  { t: "mistakes", items: [
    { bad: "name = \"Aarav\"\nprint(\"Hello, {name}\")", why: "No <code>f</code>, so the braces are just characters. This prints <code>Hello, {name}</code> and raises nothing at all — the most common formatting bug there is.", fix: "name = \"Aarav\"\nprint(f\"Hello, {name}\")" },
    { bad: "total = 99.94999999999999\nprint(f\"Total: {total:.2f}\")\nif total == 99.95:\n    print(\"balanced\")", why: "The screen shows <code>99.95</code>, so the <code>if</code> looks like it must be True — but formatting made a <b>separate string</b> and the stored number is unchanged, so the comparison fails. The display and the logic are looking at different things.", fix: "import math\n\ntotal = 99.94999999999999\nprint(f\"Total: {total:.2f}\")\nif math.isclose(total, 99.95):\n    print(\"balanced\")" },
    { bad: "rate = 0.8756\nprint(f\"{rate * 100:.1%}\")", why: "<code>%</code> already multiplies by 100, so multiplying first gives <b>8756.0%</b>. Pick one or the other.", fix: "rate = 0.8756\nprint(f\"{rate:.1%}\")" },
    { bad: "name = \"Aarav\"\nprint(\"Hi \" + name + \", you scored \" + 91 + \" marks\")", why: "<code>+</code> cannot join a string and an int — this is a <code>TypeError</code>. Concatenation also gets unreadable fast and forces you to manage every space by hand.", fix: "name = \"Aarav\"\nprint(f\"Hi {name}, you scored {91} marks\")" },
  ]},

  { t: "debug", intro: "A receipt printer. It runs, prints something that looks like a receipt, and the numbers are wrong in a way nobody notices until a customer complains.", code: "items = [(\"Chai\", 0.2), (\"Samosa\", 0.35)]\n\nprint(\"Discount applied:\")\nfor name, discount in items:\n    print(f\"{name:<10}{discount * 100:.1%}\")", symptom: "prints Chai 20.0% as 2000.0%", q: "The discount really is 20 percent, and the code says .1% which is a percentage. So why 2000?", fix: "items = [(\"Chai\", 0.2), (\"Samosa\", 0.35)]\n\nprint(\"Discount applied:\")\nfor name, discount in items:\n    print(f\"{name:<10}{discount:.1%}\")", why: "The value is multiplied <b>twice</b>. <code>discount * 100</code> turns 0.2 into 20, and then the <code>%</code> spec multiplies by 100 again on its way to the screen, giving 2000.0%.<br/><br/>The <code>%</code> type does the conversion for you — that is its entire job. It expects the raw fraction, so <code>0.2</code> goes in and <code>20.0%</code> comes out. This is a bug that survives review because both halves look individually reasonable: multiplying by 100 is what you do for a percentage, and <code>.1%</code> is obviously a percentage spec. Only together are they wrong." },

  { t: "recap", items: [
    "<code>f\"...\"</code> — the <code>f</code> is what makes braces mean anything; without it they print literally",
    "Anything that produces a value can go inside the braces, including calls and arithmetic",
    "<code>{v:.2f}</code> decimals · <code>{v:,}</code> thousands · <code>{v:,.2f}</code> money",
    "<code>{v:&gt;10}</code> right · <code>{v:&lt;10}</code> left · <code>{v:^10}</code> centre · <code>{v:05}</code> zero-pad",
    "<code>{v:.1%}</code> multiplies by 100 itself — do not multiply as well",
    "Formatting builds a <b>new string</b>; the original value is never changed",
    "<code>f\"{x=}\"</code> prints the expression and its value — the quickest debug print there is",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Why are f-strings preferred over <code>+</code> concatenation?", a: "They read in the order the output appears, they interpolate any expression without extra calls, and they convert types for you — <code>+</code> raises <code>TypeError</code> the moment an int meets a string. They are also the fastest of the three styles, because the interpolation is compiled into the bytecode rather than dispatched at runtime like <code>.format()</code>." },
    { level: "beginner", q: "What does <code>{value:.2f}</code> actually do to the value?", a: "Nothing. It produces a new string in which the number is drawn with two decimal places; the original object is unchanged. That distinction matters because a total can display as 99.95 while the stored float is 99.94999999999999, so a later <code>==</code> against 99.95 fails even though the screen looks right." },
    { level: "intermediate", q: "How would you print a table of names and marks so the columns line up?", a: "Give each field a fixed width and an alignment: <code>f\"{name:&lt;12}{marks:&gt;5}\"</code> — text left, numbers right, so the units digits sit under each other. Right-aligning numbers is what makes different magnitudes comparable at a glance; 8 and 100 in a left-aligned column force the reader to inspect every row." },
    { level: "intermediate", q: "What is the difference between <code>{x:.1f}</code> and <code>{x:.1%}</code>?", a: "<code>f</code> is fixed-point: it prints the number as-is to one decimal. <code>%</code> multiplies the value by 100, prints it to one decimal and appends a percent sign. So 0.8756 gives 0.9 with <code>.1f</code> and 87.6% with <code>.1%</code>. Multiplying by 100 yourself and then using <code>%</code> is a classic double-conversion bug." },
    { level: "intermediate", q: "What does <code>f\"{total=}\"</code> print, and when is it useful?", a: "It prints <code>total=250</code> — the literal expression text, an equals sign, then the value. It is a debugging shortcut added in Python 3.8 that stops you writing the name twice and getting the label out of step with the variable after a rename. It also works on whole expressions, so <code>f\"{a + b=}\"</code> shows both the expression and its result." },
  ]},
];
const L16 = [
  { t: "objectives", items: [
    "Work with <code>True</code> / <code>False</code> and the comparisons that produce them",
    "Say which values are <b>falsy</b>, and why <code>if items:</code> is better than <code>if len(items) &gt; 0:</code>",
    "Tell <code>==</code> from <code>is</code>, and know which one you actually want",
    "Avoid the trap where <code>0</code> and <code>\"\"</code> are mistaken for missing data",
  ]},
  { t: "hook", q: "A form field comes back as <code>0</code>. Your code says <code>if not value: return \"missing\"</code>. Is 0 missing?", why: "To Python, <code>0</code> is falsy — so that line reports it as missing. But a score of zero, a price of zero and a count of zero are all real answers. This one confusion quietly corrupts more beginner code than any syntax error, because nothing ever crashes." },
  { t: "def", term: "Truthiness", en: "Truthiness is the boolean value Python assigns to any object when it is used in a condition.", hi: "Every value answers true or false in an <code>if</code>, not just <code>True</code> and <code>False</code>. Empty things — <code>0</code>, <code>\"\"</code>, <code>[]</code>, <code>{}</code>, <code>None</code> — are <b>falsy</b>; everything else is <b>truthy</b>." },

  { t: "h2", n: "1", text: "Booleans and comparisons" },
  { t: "p", html: "There are exactly two boolean values. Every comparison produces one of them." },
  { t: "code", file: "basic.py", code: "print(True)\nprint(type(True).__name__)\nprint(5 > 3)\nprint(bool(0))", output: "True\nbool\nTrue\nFalse" },

  { t: "h2", n: "2", text: "Truthy and falsy" },
  { t: "p", html: "Anything can be used as a condition. The rule is short enough to memorise: <b>empty is false, everything else is true</b>." },
  { t: "code", file: "truthy.py", code: "print(bool(0), bool(1))\nprint(bool(\"\"), bool(\"a\"))\nprint(bool([]), bool([1]))\nprint(bool(None))", output: "False True\nFalse True\nFalse True\nFalse" },
  { t: "viz", name: "truthiness-tester" },
  { t: "p", html: "Try each value in that panel. The falsy list is complete and worth knowing by heart: <code>False</code>, <code>0</code>, <code>0.0</code>, <code>\"\"</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code> and <code>None</code>. Nothing else is falsy — not <code>\"0\"</code>, not <code>\" \"</code>, not <code>[0]</code>." },
  { t: "note", variant: "tip", html: "This is why <code>if items:</code> is the idiomatic way to ask \"does this list have anything in it\". <code>if len(items) &gt; 0:</code> says the same thing in more words, and reads as though the length mattered when it does not." },

  { t: "h2", n: "3", text: "and, or, not — and what they return" },
  { t: "p", html: "You met these with operators. The part worth repeating here: <code>and</code> and <code>or</code> return an <b>operand</b>, not a boolean, and that is what makes the default-value idiom work." },
  { t: "code", file: "shortcircuit.py", code: "name = \"\"\nprint(name or \"Guest\")\nprint(0 and 99)\nprint(2 and 99)", output: "Guest\n0\n99" },

  { t: "h2", n: "4", text: "== compares values, is compares identity" },
  { t: "p", html: "<code>==</code> asks whether two things <b>hold the same value</b>. <code>is</code> asks whether they are <b>the same object</b> in memory. They are different questions and they can disagree." },
  { t: "code", file: "isvsequals.py", code: "a = [1, 2]\nb = [1, 2]\nprint(a == b)\nprint(a is b)\nprint(a is a)", output: "True\nFalse\nTrue" },
  { t: "note", variant: "warn", html: "Use <code>==</code> for values, and reserve <code>is</code> for <code>None</code>, <code>True</code> and <code>False</code> — the singletons, where there genuinely is only one object. <code>if x is 5</code> may appear to work on small numbers because Python caches them, and then fail on larger ones. That is not a rule you want your correctness resting on." },
  { t: "think", q: "<code>True + True</code> — is that an error?", a: "No. It is <b>2</b>.<br/><br/><code>bool</code> is a subclass of <code>int</code>: <code>True</code> is 1 and <code>False</code> is 0. That is not a curiosity — it is genuinely useful, because <code>sum(flags)</code> counts how many are true in one call." },
  { t: "code", file: "boolint.py", code: "flags = [True, False, True, True]\nprint(sum(flags))\nprint(True + True)\nprint(isinstance(True, int))", output: "3\n2\nTrue" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> <code>sum()</code> over a list of conditions is how you count matching rows without a loop — how many orders were late, how many values were missing. In pandas the same idea becomes <code>(df[\"amount\"] &gt; 1000).sum()</code>. The truthiness rule is also why filtering out empty strings is written <code>[v for v in values if v]</code> and not a comparison." },
  { t: "analogy", concept: "Truthiness", real: "An empty box on a shelf", html: "Nobody asks whether a box's contents count is greater than zero. They pick it up: if it feels empty, it is empty. Python does the same — <code>if items:</code> is picking the box up. The catch is that Python calls a box holding a single <code>0</code> empty too, and that is where the bug in the debug task comes from." },

  { t: "trace", intro: "Filtering a list on truthiness. Work out what each name holds once the line has run.", code: "values = [0, \"\", \"data\", 5]\nkept = [v for v in values if v]\ncount = len(kept)\nfirst = kept[0]", steps: [
    { q: "After line 2, <code>kept</code> is", answer: "['data', 5]", accept: ["['data',5]", "[data, 5]", "[\"data\", 5]"], why: "<code>0</code> and <code>\"\"</code> are both falsy, so the filter dropped them. Note it dropped a real number — a zero measurement would be lost by this line." },
    { q: "After line 3, <code>count</code> is", answer: "2", why: "Two of the four survived. Four went in and two came out, which is what a filtering <code>if</code> does." },
    { q: "After line 4, <code>first</code> is", answer: "data", why: "The first surviving item. The original <code>values</code> is untouched — the comprehension built a new list." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Is zero truthy or falsy?", code: "print(bool(0))", out: "False" },
    { task: "Is a non-empty string truthy?", code: "print(bool(\"a\"))", out: "True" },
    { task: "Is an empty list truthy?", code: "print(bool([]))", out: "False" },
    { task: "Print the result of a comparison.", code: "print(5 > 3)", out: "True" },
    { task: "Flip a boolean with <code>not</code>.", code: "print(not True)", out: "False" },
    { task: "Combine two conditions with <code>and</code>.", code: "print(True and False)", out: "False" },
    { task: "Fall back to a default when the name is empty.", code: "print(\"\" or \"Guest\")", out: "Guest" },
    { task: "Count how many conditions are true, without a loop.", code: "print(sum([True, False, True]))", out: "2" },
    { task: "Compare two lists by value.", code: "print([1, 2] == [1, 2])", out: "True" },
    { task: "Ask whether they are the same object.", code: "print([1, 2] is [1, 2])", out: "False" },
    { task: "Drop the empty values from a list.", code: "print([v for v in [0, 1, \"\", \"a\"] if v])", out: "[1, 'a']" },
    { task: "Check that a value is genuinely absent rather than empty.", code: "x = 0\nprint(x is None)", out: "False" },
  ]},

  { t: "mistakes", items: [
    { bad: "if x == True:", why: "Redundant, and narrower than you meant. <code>if x:</code> accepts anything truthy; <code>x == True</code> only accepts the boolean itself, so a non-empty string or a list of results would fail it.", fix: "if x:" },
    { bad: "if len(items) > 0:", why: "Correct, but it says the length matters when what you actually want to know is whether there is anything there. The shorter form is the one every Python reader expects.", fix: "if items:" },
    { bad: "if name is \"admin\":", why: "<code>is</code> asks whether these are the <b>same object</b>, not whether the text matches. It sometimes appears to work because Python reuses short strings, and then fails on a string built at runtime — the worst kind of bug, one that passes your test and fails in production.", fix: "if name == \"admin\":" },
    { bad: "if not value:\n    return \"missing\"", why: "This treats <code>0</code>, <code>\"\"</code> and <code>[]</code> as missing. A price of zero, an empty note and an empty basket are all real answers. If you mean absent, say absent.", fix: "if value is None:\n    return \"missing\"" },
  ]},

  { t: "debug", intro: "This should print the score, whatever it is. A score of 0 is reported as no score at all. Nothing crashes. Read it before opening the fix.", code: "def label(score):\n    if not score:\n        return \"no score\"\n    return \"score: \" + str(score)\n\nprint(label(10))\nprint(label(0))", symptom: "prints 'no score' for a score of 0, which is a real score", q: "Zero was passed in and the function was given no reason to reject it. So why was it treated as nothing?", fix: "def label(score):\n    if score is None:\n        return \"no score\"\n    return \"score: \" + str(score)\n\nprint(label(10))\nprint(label(0))", why: "<code>not score</code> is a <b>truthiness</b> test, and <code>0</code> is falsy — so it means \"empty or absent or zero\", which is three different questions rolled into one. The function was asked whether a score existed and answered whether it was non-zero.<br/><br/>Say what you mean: <code>is None</code> for absent, <code>== 0</code> for zero, <code>not items</code> for empty. This bug is common in exactly the places it matters most — a zero balance, a zero count, an empty comment field — and it never announces itself, because a wrong label is not an error." },

  { t: "recap", items: [
    "Every value answers true or false in a condition — <b>empty is falsy</b>, everything else truthy",
    "Falsy in full: <code>False, 0, 0.0, \"\", [], (), {}, set(), None</code>",
    "<code>if items:</code> beats <code>if len(items) &gt; 0:</code>",
    "<code>==</code> compares values, <code>is</code> compares identity — use <code>is</code> only for <code>None</code>, <code>True</code>, <code>False</code>",
    "<code>True</code> is <code>1</code>, so <code>sum(flags)</code> counts the true ones",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Which values are falsy in Python?", a: "<code>False</code>, <code>0</code>, <code>0.0</code>, the empty string, the empty list, tuple, dict and set, and <code>None</code>. Everything else is truthy — including <code>\"0\"</code>, <code>\" \"</code> and <code>[0]</code>, which look empty but are not." },
    { level: "beginner", q: "What is the difference between <code>==</code> and <code>is</code>?", a: "<code>==</code> compares values; <code>is</code> compares identity — whether both names point at the same object. Two lists with identical contents are <code>==</code> but not <code>is</code>. Use <code>is</code> only for <code>None</code>, <code>True</code> and <code>False</code>." },
    { level: "intermediate", q: "Why is <code>if x is None</code> preferred over <code>if not x</code> for checking a missing value?", a: "Because <code>not x</code> is also true for <code>0</code>, <code>\"\"</code> and <code>[]</code>, which are real values rather than missing ones. <code>is None</code> asks the exact question. Mixing the two is a classic source of silently wrong results." },
    { level: "intermediate", q: "Is <code>True</code> really an integer?", a: "Yes — <code>bool</code> subclasses <code>int</code>, with <code>True == 1</code> and <code>False == 0</code>. It is why <code>sum(flags)</code> counts the true values, and why <code>True + True</code> is 2 rather than an error." },
    { level: "advanced", q: "How does an object decide its own truthiness?", a: "Python calls <code>__bool__</code> if the class defines it. If not, it falls back to <code>__len__</code> and treats zero length as false. If neither exists, the object is always truthy. This is why an empty custom collection can be falsy for free by defining <code>__len__</code> — and why a class defining neither will pass an <code>if</code> even when it is conceptually empty." },
  ]},
];
const L17 = [
  { t: "objectives", items: [
    "Write a <code>lambda</code>, and know it is just a function with no name",
    "See why it holds <b>one expression</b> and no statements",
    "Use it as the throwaway argument to <code>map</code>, <code>filter</code> and <code>sorted</code>",
    "Sort by a computed key, including two keys at once",
    "Avoid the late-binding trap when you build lambdas in a loop",
  ]},
  { t: "hook", q: "You build a list of ten tiny functions in a loop, one per number, each meant to add its own number. You call them all — and every single one adds <b>9</b>. Not 0, 1, 2… nine, nine, nine. What happened?", why: "The lambdas did not capture the <b>value</b> of the loop variable, they captured the <b>variable itself</b>. By the time you call them, the loop is long over and that variable holds its last value. It is the single most famous lambda trap, it raises no error, and the fix is one small word you would never guess." },
  { t: "think", q: "<code>double = lambda x: x * 2</code>. How is this different from <code>def double(x): return x * 2</code>?", a: "In what it <b>does</b>, not at all — both build a function that doubles its argument, and <code>double(5)</code> gives 10 either way.<br/><br/>The differences are that the lambda has <b>no name of its own</b> (the name <code>double</code> is just a variable you happened to point at it) and it can hold only a <b>single expression</b> — no <code>if</code> statement, no loop, no second line. That limit is the whole personality of a lambda: it exists for the one-liner you do not want to name." },

  { t: "h2", n: "1", text: "A function with the ceremony removed" },
  { t: "def", term: "Lambda", en: "A lambda is an anonymous function written as a single expression: the word lambda, its parameters, a colon, and one expression whose value is returned automatically.", hi: "In plain words: <code>lambda x: x * 2</code> is <code>def</code> with everything optional stripped away — no name, no <code>return</code> (the expression is the return), and exactly one line." },
  { t: "p", html: "<code>lambda arguments: expression</code>. There is no <code>return</code> because the expression <b>is</b> the return value. Assigning one to a name is legal but rare — its real home is being passed straight into another function." },
  { t: "code", file: "lambda.py", code: "double = lambda x: x * 2\nprint(double(5))\n\nadd = lambda a, b: a + b\nprint(add(3, 4))\n\n# it is genuinely a function\nprint(type(double).__name__)\nprint((lambda x: x + 1)(5))   # define and call on the spot", output: "10\n7\nfunction\n6" },
  { t: "note", variant: "warn", html: "<b>A lambda holds one expression, not statements.</b> <code>lambda x: return x*2</code> is a <code>SyntaxError</code> — there is no <code>return</code>, and <code>lambda x: if x: …</code> is illegal too. The moment you need an <code>if</code> statement, a loop, or a second line, you need <code>def</code>. (A conditional <i>expression</i>, <code>a if cond else b</code>, is fine — that is one expression.)" },

  { t: "h2", n: "2", text: "Where lambdas actually earn their keep" },
  { t: "p", html: "You rarely name a lambda. You hand it to a function that will call it for you — <code>map</code> to transform every element, <code>filter</code> to keep some, <code>sorted</code> to decide the order." },
  { t: "code", file: "hof.py", code: "nums = [5, 2, 8, 1, 4]\n\nprint(list(map(lambda x: x * x, nums)))       # transform each\nprint(list(filter(lambda x: x % 2 == 0, nums)))  # keep the even ones\nprint(sorted(nums, key=lambda x: -x))            # order by a computed key", output: "[25, 4, 64, 1, 16]\n[2, 8, 4]\n[8, 5, 4, 2, 1]" },
  { t: "viz", name: "lambda-lab" },
  { t: "p", html: "Notice in that panel that the lambda always does the same small job — one value in, one value out. What changes is the function around it: <code>map</code> keeps the count, <code>filter</code> shrinks it, <code>sorted</code> reorders and throws the keys away." },
  { t: "analogy", concept: "A lambda passed to sorted", real: "Telling a librarian how to sort", html: "<code>sorted(books)</code> sorts by the books themselves, alphabetically. <code>sorted(books, key=lambda b: b.year)</code> is you telling the librarian <b>&quot;sort by the year printed inside, not the title&quot;</b> — the key function is the one instruction that changes everything, and it never appears on the finished shelf. The books that come back are the same books, just in a new order." },

  { t: "h2", n: "3", text: "Sorting by one key, or two" },
  { t: "p", html: "The <code>key</code> function is computed once per element and the list is ordered by its result. Return a <b>tuple</b> to sort by several things at once — the second only breaks ties in the first." },
  { t: "code", file: "sorting.py", code: "people = [(\"Aarav\", 91), (\"Diya\", 91), (\"Kabir\", 80)]\n\n# by marks, highest first\nprint(sorted(people, key=lambda p: -p[1]))\n\n# marks high-to-low, then name A-Z to break ties\nprint(sorted(people, key=lambda p: (-p[1], p[0])))", output: "[('Aarav', 91), ('Diya', 91), ('Kabir', 80)]\n[('Aarav', 91), ('Diya', 91), ('Kabir', 80)]" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> ranking rows by a computed value is daily data work — leaderboards, top-N reports, \"newest first\". A tuple key is how you express \"sort by score descending, then by name\" in one line, and the exact same <code>key=lambda …</code> idea drives Pandas' <code>df.sort_values</code> and <code>df.apply</code> later. Learn it on a plain list now and the DataFrame version is free." },

  { t: "h2", n: "4", text: "The trap: lambdas built in a loop" },
  { t: "p", html: "A lambda remembers the <b>variable</b> it used, not the value that was in it at the time. Build lambdas in a loop over <code>i</code> and they all share the one <code>i</code> — which, by the time you call them, holds its final value." },
  { t: "code", file: "trap.py", code: "funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])          # NOT [0, 1, 2]\n\n# bind the value now, with a default argument\nfixed = [lambda i=i: i for i in range(3)]\nprint([f() for f in fixed])", output: "[2, 2, 2]\n[0, 1, 2]" },
  { t: "note", variant: "warn", html: "<b>The fix is <code>i=i</code>.</b> A default argument is evaluated <b>when the lambda is defined</b>, so <code>lambda i=i: i</code> snapshots the current value into the parameter. It looks strange the first time, but it is the standard cure for late binding — and the reason to prefer a named <code>def</code> or a comprehension when the logic grows." },

  { t: "trace", intro: "Each line uses a lambda a different way. Work out the value.", code: "sq = lambda x: x * x\na = sq(4)\n\nnums = [3, 1, 2]\nb = sorted(nums, key=lambda x: -x)\n\nwords = [\"bbb\", \"a\", \"cc\"]\nc = sorted(words, key=lambda w: len(w))\n\nd = list(filter(lambda x: x > 1, nums))\ne = (lambda x, y: x + y)(10, 5)", steps: [
    { q: "After line 2, <code>a</code> is", answer: "16", why: "<code>sq</code> is an ordinary function that squares its argument, so <code>sq(4)</code> is 16." },
    { q: "After line 5, <code>b</code> is", answer: "[3, 2, 1]", why: "The key <code>-x</code> makes the largest number sort first, so ascending order of the keys is descending order of the values." },
    { q: "After line 8, <code>c</code> is", answer: "['a', 'cc', 'bbb']", why: "Sorting by <code>len</code> orders the words shortest to longest: 1, 2, 3 characters." },
    { q: "After line 10, <code>d</code> is", answer: "[3, 2]", why: "<code>filter</code> keeps the elements where the lambda is True — the numbers greater than 1, in their original order." },
    { q: "After line 11, <code>e</code> is", answer: "15", why: "The lambda is defined and immediately called with 10 and 5, so it returns their sum." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make a lambda that cubes a number, and call it on 3.", code: "cube = lambda x: x ** 3\n\nprint(cube(3))", out: "27" },
    { task: "Square every number in a list with <code>map</code>.", code: "nums = [1, 2, 3, 4]\n\nprint(list(map(lambda x: x * x, nums)))", out: "[1, 4, 9, 16]" },
    { task: "Keep only the even numbers with <code>filter</code>.", code: "nums = [1, 2, 3, 4, 5, 6]\n\nprint(list(filter(lambda x: x % 2 == 0, nums)))", out: "[2, 4, 6]" },
    { task: "Sort words from longest to shortest.", code: "words = [\"a\", \"bbb\", \"cc\"]\n\nprint(sorted(words, key=lambda w: -len(w)))", out: "['bbb', 'cc', 'a']" },
    { task: "Sort names by their last character.", code: "names = [\"Diya\", \"Aarav\", \"Kabir\"]\n\nprint(sorted(names, key=lambda n: n[-1]))", out: "['Diya', 'Kabir', 'Aarav']" },
    { task: "Sort pairs by the second item, largest first.", code: "pairs = [(\"a\", 2), (\"b\", 5), (\"c\", 1)]\n\nprint(sorted(pairs, key=lambda p: -p[1]))", out: "[('b', 5), ('a', 2), ('c', 1)]" },
    { task: "Use <code>map</code> to get the length of each word.", code: "words = [\"hi\", \"hello\", \"hey\"]\n\nprint(list(map(lambda w: len(w), words)))", out: "[2, 5, 3]" },
    { task: "Define and call a two-argument lambda on the spot.", code: "print((lambda a, b: a * b)(6, 7))", out: "42" },
    { task: "Filter a list of names down to those longer than 3 letters.", code: "names = [\"Diya\", \"Om\", \"Aarav\"]\n\nprint(list(filter(lambda n: len(n) > 3, names)))", out: "['Diya', 'Aarav']" },
    { task: "Use a conditional expression inside a lambda: 'even' or 'odd'.", code: "parity = lambda x: \"even\" if x % 2 == 0 else \"odd\"\n\nprint(parity(4), parity(7))", out: "even odd" },
  ]},

  { t: "mistakes", items: [
    { bad: "add = lambda a, b: return a + b", why: "A lambda has no <code>return</code> — the expression already <b>is</b> the return value, so writing <code>return</code> is a <code>SyntaxError</code>.", fix: "add = lambda a, b: a + b" },
    { bad: "squares = map(lambda x: x * x, nums)\nprint(squares)", why: "<code>map</code> returns a lazy map object, not a list — this prints something like <code>&lt;map object at 0x…&gt;</code>. You have to consume it, usually with <code>list()</code>.", fix: "squares = list(map(lambda x: x * x, nums))\nprint(squares)" },
    { bad: "big = lambda x: \n    if x > 100:\n        return \"big\"\n    return \"small\"", why: "This is a whole function's worth of logic — statements and multiple lines — crammed into a form built for one expression. It will not parse. Once you need an <code>if</code> statement, use <code>def</code>.", fix: "def big(x):\n    if x > 100:\n        return \"big\"\n    return \"small\"" },
    { bad: "funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])", why: "Late binding: all three lambdas share the same <code>i</code>, which is 2 by the time they run, so this prints <code>[2, 2, 2]</code>. The lambda captured the variable, not the value.", fix: "funcs = [lambda i=i: i for i in range(3)]\nprint([f() for f in funcs])" },
  ]},

  { t: "debug", intro: "A dashboard builds one label function per metric in a loop, then calls them to render. Every label comes out wrong in the same way. No error is raised.", code: "metrics = [\"cpu\", \"ram\", \"disk\"]\nlabelers = []\n\nfor name in metrics:\n    labelers.append(lambda v: name + \": \" + str(v))\n\nprint(labelers[0](10))\nprint(labelers[1](20))\nprint(labelers[2](30))", symptom: "every line starts with disk:, even labelers[0]", q: "Three different lambdas were built for three different names. So why do all three say disk?", fix: "metrics = [\"cpu\", \"ram\", \"disk\"]\nlabelers = []\n\nfor name in metrics:\n    labelers.append(lambda v, name=name: name + \": \" + str(v))\n\nprint(labelers[0](10))\nprint(labelers[1](20))\nprint(labelers[2](30))", why: "Every lambda closed over the <b>same variable</b> <code>name</code>, not a copy of its value. The loop finished with <code>name</code> holding its last value, <code>\"disk\"</code>, and only then were the lambdas called — so all three read <code>\"disk\"</code>.<br/><br/>The cure is <code>name=name</code>: a default argument is evaluated at the moment the lambda is <b>defined</b>, so each lambda captures the value <code>name</code> had on that turn of the loop. This is the exact bug from the hook, and it is why building closures in a loop is one of the few places lambdas bite hard — a named function or binding the value explicitly is the honest fix." },

  { t: "recap", items: [
    "<code>lambda args: expression</code> — a function with no name and no <code>return</code>",
    "It holds <b>one expression</b>; need a statement, an <code>if</code>, or a loop → use <code>def</code>",
    "<code>map</code> transforms every element · <code>filter</code> keeps some · <code>sorted(key=…)</code> reorders",
    "<code>map</code> and <code>filter</code> return lazy objects — wrap them in <code>list()</code>",
    "A tuple key sorts by several things: <code>key=lambda p: (-p[1], p[0])</code>",
    "Lambdas in a loop capture the <b>variable</b>, not its value — bind it with <code>x=x</code>",
    "The same <code>key=lambda</code> idea drives Pandas <code>sort_values</code> and <code>apply</code> later",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a lambda and how does it differ from a normal function?", a: "It is an anonymous function written as a single expression — <code>lambda x: x * 2</code>. Functionally it is identical to the equivalent <code>def</code>, but it has no name of its own and is restricted to one expression, with no statements and an implicit return. You reach for it when you need a small throwaway function to pass to something like <code>sorted</code> or <code>map</code> and naming it would just be noise." },
    { level: "beginner", q: "Why can't a lambda contain an <code>if</code> statement or a loop?", a: "Because a lambda's body is a single expression, and statements like <code>if</code>, <code>for</code> and <code>return</code> are not expressions. You can use a conditional <i>expression</i> — <code>a if cond else b</code> — because that evaluates to a value, but the moment you need real control flow the right tool is <code>def</code>." },
    { level: "intermediate", q: "What does the <code>key</code> argument to <code>sorted</code> do?", a: "It is a function called once per element to produce the value the list is actually sorted by; the elements themselves are returned, just reordered. <code>sorted(words, key=len)</code> sorts by length, and returning a tuple such as <code>key=lambda p: (-p[1], p[0])</code> sorts by several fields at once, with later fields breaking ties in earlier ones. It computes each key once, so it is efficient even on large lists." },
    { level: "intermediate", q: "What is the late-binding closure problem with lambdas in a loop?", a: "A lambda captures the variables in its enclosing scope by reference, not by value. If you build lambdas in a loop that all refer to the loop variable, they end up sharing it, and by the time they are called the loop has finished and the variable holds its final value — so every lambda sees the same thing. The usual fix is a default argument, <code>lambda x=x: …</code>, which snapshots the value at definition time." },
    { level: "intermediate", q: "When would you use <code>map</code>/<code>filter</code> with a lambda versus a comprehension?", a: "They overlap heavily, and a list comprehension is usually more readable — <code>[x*x for x in nums]</code> beats <code>list(map(lambda x: x*x, nums))</code>. Reach for <code>map</code>/<code>filter</code> when you already have a named function to pass, when you want the lazy iterator rather than a materialised list, or when passing a function object reads more cleanly than rewriting its body inline. For anything with a condition and a transform together, the comprehension almost always wins." },
  ]},
];
const L18 = [
  { t: "objectives", items: [
    "Tell a <b>local</b> variable from a <b>global</b> one",
    "Follow Python's search order: <b>Local → Enclosing → Global → Built-in</b>",
    "Know that an <b>assignment</b> makes a name local for the <b>whole</b> function",
    "Explain and fix <code>UnboundLocalError</code> — the scope bug everyone hits",
    "Use <code>global</code> and <code>nonlocal</code>, and know why you rarely should",
  ]},
  { t: "hook", q: "This function reads a global counter and adds one. It has worked in your head a hundred times. You run it and get <code>UnboundLocalError: cannot access local variable 'count'</code> — on the <b>print</b> line, before the line that changes anything. How can reading a variable fail when the variable clearly exists?", why: "Because Python decided <code>count</code> was <b>local</b> before it ran a single line — it saw the <code>count += 1</code> further down and marked the name local for the entire function. So the <code>print</code> reads a local that has not been given a value yet, and the global <code>count</code> sitting right there cannot help. One line at the bottom changed the meaning of a line at the top." },
  { t: "think", q: "A function does <code>x = 5</code> inside it, while a global <code>x = 100</code> exists outside. After the function runs, what is the global <code>x</code>?", a: "Still <code>100</code>. The assignment inside built a <b>new local</b> <code>x</code> that lived only for that call and vanished when the function returned — it never touched the global.<br/><br/>This is the safety rule that makes functions trustworthy: what happens inside a function stays inside, unless you go out of your way with <code>global</code>. A function cannot quietly corrupt a variable somewhere else just by using the same name." },

  { t: "h2", n: "1", text: "Local and global" },
  { t: "def", term: "Scope", en: "Scope is the region of code where a name is visible; a variable created inside a function is local to it and does not exist outside.", hi: "In plain words: a name lives in the block that created it. A variable born inside a function is <b>local</b> — the rest of the program cannot see it — while one defined at the top level is <b>global</b>." },
  { t: "p", html: "<b>Reading</b> a global from inside a function is fine. <b>Assigning</b> is where it changes: an assignment creates a local, separate from any global of the same name." },
  { t: "code", file: "scope.py", code: "x = 10                 # global\n\ndef show():\n    y = 5              # local to show\n    print(x + y)       # reading the global x is fine\n\nshow()\n\n# print(y)  ->  NameError: y only existed inside show()\nprint(\"done\")", output: "15\ndone" },
  { t: "note", variant: "tip", html: "A local name is <b>gone</b> the moment the function returns. That is a feature: two functions can both use <code>i</code> or <code>total</code> without ever colliding, because each call gets its own private set of names." },

  { t: "h2", n: "2", text: "The search order: L → E → G → B" },
  { t: "p", html: "When you use a name, Python looks in four places in order — <b>L</b>ocal, then any <b>E</b>nclosing function, then <b>G</b>lobal, then <b>B</b>uilt-in — and stops at the first one that has it." },
  { t: "viz", name: "scope-lab" },
  { t: "p", html: "Click <b>the trap 💥</b> in that panel. The name <code>count</code> is found in the Local box — but it has no value yet, because the assignment that made it local runs <i>later</i>. That is exactly what <code>UnboundLocalError</code> is." },
  { t: "analogy", concept: "The LEGB search", real: "Looking for scissors in the house", html: "You need scissors. You check the <b>drawer in this room</b> first (Local), then the <b>shared cupboard</b> (Global), then the <b>house toolkit</b> (Built-in), and take the first pair you find. But the moment you write &quot;I keep scissors in this room&quot; on the door — an assignment — Python stops checking the cupboard entirely, even if this room's drawer is still empty. That empty-drawer-with-a-label is <code>UnboundLocalError</code>." },

  { t: "h2", n: "3", text: "Changing a global on purpose" },
  { t: "p", html: "If you genuinely need a function to rebind a global, say so with <code>global</code>. Without it, <code>count += 1</code> assumes a local and fails; with it, the assignment reaches out to the global." },
  { t: "code", file: "globalkw.py", code: "score = 0\n\ndef bump():\n    global score      # \"score means the global one\"\n    score += 10\n\nbump()\nbump()\nprint(score)", output: "20" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> reach for <code>global</code> rarely. A function that edits globals is hard to test and hard to trust — its result depends on hidden state, and two of them fighting over the same global is a classic source of bugs. The clean pattern is to <b>take values in as arguments and hand the result back with <code>return</code></b>, so everything the function touches is visible in its signature." },

  { t: "h2", n: "4", text: "Mutating is not rebinding" },
  { t: "p", html: "There is one subtlety worth knowing. <b>Changing the contents</b> of a global list or dict needs no <code>global</code> — you are not rebinding the name, only editing the object it points at. Only <b>reassignment</b> needs the keyword." },
  { t: "code", file: "mutate.py", code: "items = []\n\ndef add(x):\n    items.append(x)   # mutating the list - no `global` needed\n\ndef reset():\n    global items\n    items = []        # rebinding the name - `global` required\n\nadd(1)\nadd(2)\nprint(items)", output: "[1, 2]" },
  { t: "note", variant: "warn", html: "This asymmetry surprises people: <code>items.append(x)</code> works on a global list without a keyword, but <code>items = []</code> does not. The test is simple — does the line put a <b>new object</b> on the name (rebinding, needs <code>global</code>) or change the <b>existing one</b> (mutating, does not)?" },

  { t: "trace", intro: "Reading versus assigning is the whole game. Work out each value.", code: "x = 10\n\ndef read_it():\n    return x + 1\n\ndef local_it():\n    x = 99\n    return x\n\na = read_it()\nb = local_it()\nc = x", steps: [
    { q: "After line 10, <code>a</code> is", answer: "11", why: "<code>read_it</code> never assigns <code>x</code>, so <code>x</code> is not local — Python reads the global 10 and adds 1." },
    { q: "After line 11, <code>b</code> is", answer: "99", why: "<code>local_it</code> assigns <code>x = 99</code>, making a local <code>x</code> that it then returns. The global is not involved." },
    { q: "After line 12, <code>c</code> is", answer: "10", why: "The global <code>x</code> was never changed — <code>local_it</code>'s assignment only ever touched its own private local. This is the point of the lesson." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Read a global from inside a function and return it plus 1.", code: "base = 100\n\ndef next_one():\n    return base + 1\n\nprint(next_one())", out: "101" },
    { task: "Show that an inner assignment does NOT change the global.", code: "x = 5\n\ndef change():\n    x = 999\n\nchange()\nprint(x)", out: "5" },
    { task: "Use <code>global</code> to actually change a global counter.", code: "count = 0\n\ndef tick():\n    global count\n    count += 1\n\ntick()\ntick()\nprint(count)", out: "2" },
    { task: "Prove a local variable does not exist outside its function.", code: "def make():\n    secret = 42\n    return secret\n\nprint(make())", out: "42" },
    { task: "Mutate a global list from inside a function (no <code>global</code>).", code: "log = []\n\ndef record(x):\n    log.append(x)\n\nrecord(\"a\")\nrecord(\"b\")\nprint(log)", out: "['a', 'b']" },
    { task: "Two functions each use <code>total</code> — show they do not collide.", code: "def sum_two(a, b):\n    total = a + b\n    return total\n\ndef sum_three(a, b, c):\n    total = a + b + c\n    return total\n\nprint(sum_two(1, 2), sum_three(1, 2, 3))", out: "3 6" },
    { task: "Read a built-in name — <code>len</code> — inside a function.", code: "def size(seq):\n    return len(seq)\n\nprint(size([1, 2, 3, 4]))", out: "4" },
    { task: "A nested function reads the enclosing variable.", code: "def outer():\n    msg = \"hi\"\n    def inner():\n        return msg\n    return inner()\n\nprint(outer())", out: "hi" },
    { task: "Use <code>nonlocal</code> to change an enclosing variable.", code: "def counter():\n    n = 0\n    def tick():\n        nonlocal n\n        n += 1\n        return n\n    return tick()\n\nprint(counter())", out: "1" },
    { task: "Return a value instead of using <code>global</code> — the clean way.", code: "def bump(count):\n    return count + 1\n\ncount = 0\ncount = bump(count)\ncount = bump(count)\nprint(count)", out: "2" },
  ]},

  { t: "mistakes", items: [
    { bad: "total = 0\n\ndef add(x):\n    total = total + x\n\nadd(5)", why: "Assigning <code>total</code> inside makes it local for the whole function, so <code>total + x</code> reads a local that has no value yet — <code>UnboundLocalError</code>. The global <code>total</code> does not help.", fix: "total = 0\n\ndef add(x):\n    global total\n    total = total + x\n\nadd(5)" },
    { bad: "def show():\n    print(msg)\n\nshow()\nmsg = \"hi\"", why: "<code>msg</code> does not exist yet when <code>show()</code> runs — it is defined on the next line. Globals are looked up <b>when the function runs</b>, not when it is defined, so this is a <code>NameError</code>.", fix: "def show():\n    print(msg)\n\nmsg = \"hi\"\nshow()" },
    { bad: "def get_total():\n    return total\n\ntotal = 10\nresult = get_total()\ntotal = 20\nprint(result)", why: "Not an error, but a surprise: <code>result</code> is 10. The function read <code>total</code> at the moment it was called, and changing the global afterwards does nothing to a value already returned.", fix: "def get_total(total):\n    return total\n\nresult = get_total(20)\nprint(result)" },
    { bad: "count = 0\n\ndef reset():\n    count = 0    # meant to clear the global\n\ncount = 5\nreset()\nprint(count)", why: "This prints <code>5</code>, not 0. Without <code>global</code>, <code>count = 0</code> just makes and discards a local — the global is untouched, and the reset silently does nothing.", fix: "count = 0\n\ndef reset():\n    global count\n    count = 0\n\ncount = 5\nreset()\nprint(count)" },
  ]},

  { t: "debug", intro: "A running total for a shopping cart. The first call crashes, on the line that only READS the total. Read it before opening the fix.", code: "cart_total = 0\n\ndef add_item(price):\n    print(\"was:\", cart_total)\n    cart_total = cart_total + price\n    print(\"now:\", cart_total)\n\nadd_item(50)", symptom: "UnboundLocalError: cannot access local variable 'cart_total'", q: "The global cart_total is 0, right there. So why does reading it — on the 'was:' line, before anything is changed — raise an error?", fix: "cart_total = 0\n\ndef add_item(price):\n    global cart_total\n    print(\"was:\", cart_total)\n    cart_total = cart_total + price\n    print(\"now:\", cart_total)\n\nadd_item(50)", why: "Python scans the whole function <b>before</b> running it and sees <code>cart_total = cart_total + price</code>, an assignment. That decision — &quot;cart_total is local in this function&quot; — applies to <b>every</b> line, including the <code>print</code> above it. So the <code>print</code> tries to read a local that has not been assigned yet, and you get <code>UnboundLocalError</code>. The global with the same name is simply not consulted, because Python already committed to local.<br/><br/><code>global cart_total</code> undoes that: it tells Python the name refers to the global throughout, so the read finds 0 and the write updates the real total. The cleaner design, though, is to avoid the global entirely — <code>return cart_total + price</code> and let the caller keep the running total. A function that reaches out and edits module-level state is the thing that is hard to test later." },

  { t: "recap", items: [
    "<b>Reading</b> a global inside a function is fine; <b>assigning</b> creates a separate local",
    "Search order is <b>L → E → G → B</b> (Local, Enclosing, Global, Built-in) — first match wins",
    "An assignment <b>anywhere</b> in a function makes that name local for the <b>whole</b> function",
    "<code>UnboundLocalError</code> = you read a name that is local but not yet assigned",
    "<code>global x</code> lets a function rebind a global; <code>nonlocal x</code> rebinds an enclosing one",
    "<b>Mutating</b> a global list/dict needs no keyword; only <b>rebinding</b> the name does",
    "Prefer arguments in and <code>return</code> out over <code>global</code> — it keeps functions testable",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between a local and a global variable?", a: "A local variable is created inside a function and exists only while that function runs; it is invisible to the rest of the program and gone when the function returns. A global is defined at module level and readable from anywhere. The key asymmetry is that a function can <b>read</b> a global freely but <b>assigning</b> to that name creates a local instead, unless you use the <code>global</code> keyword." },
    { level: "beginner", q: "What is the LEGB rule?", a: "It is the order Python searches for a name: Local, then any Enclosing function's scope, then the module's Global scope, then Built-ins like <code>len</code> and <code>print</code>. The first scope that contains the name wins, which is why a local variable can shadow a global, and a variable named <code>list</code> can shadow the built-in <code>list</code> type." },
    { level: "intermediate", q: "Why would <code>print(x)</code> raise <code>UnboundLocalError</code> when a global <code>x</code> exists?", a: "Because there is an assignment to <code>x</code> somewhere later in the same function. Python determines a variable's scope at compile time by scanning the whole function body, so a single assignment marks the name local for every line, including reads that come before it. The read then fails because the local has not been given a value yet — and the global is never consulted. Adding <code>global x</code>, or not assigning to the name, resolves it." },
    { level: "intermediate", q: "When do you need <code>global</code>, and when do you not?", a: "You need it only to <b>rebind</b> a global name — point it at a new object with <code>=</code>, or use <code>+=</code>, which is an assignment. You do <b>not</b> need it to mutate the object a global refers to: <code>my_list.append(x)</code> or <code>my_dict[k] = v</code> change the existing object without rebinding the name, so they work from inside a function directly. The distinction is rebinding the name versus mutating its value." },
    { level: "intermediate", q: "What does <code>nonlocal</code> do, and how is it different from <code>global</code>?", a: "<code>nonlocal</code> lets an inner function rebind a variable in its nearest enclosing function, rather than creating a new local. <code>global</code> reaches all the way out to module scope. The classic use of <code>nonlocal</code> is a closure that keeps state between calls — an inner <code>tick</code> that does <code>nonlocal n; n += 1</code> — where you want to update the enclosing counter, not a global one." },
  ]},
];
const L19 = [
  { t: "objectives", items: [
    "Say what JSON is and why every API speaks it",
    "Turn JSON text into Python with <code>loads</code>, and back with <code>dumps</code>",
    "Map the types across: <code>true</code>→<code>True</code>, <code>null</code>→<code>None</code>, object→dict",
    "Read nested JSON, and pretty-print with <code>indent</code>",
    "Avoid the round-trip traps: string-only keys, and single quotes",
  ]},
  { t: "hook", q: "You save a scores dictionary <code>{1: 95, 2: 88}</code> to a JSON file and load it back. The data looks identical. Then <code>scores[1]</code> throws <code>KeyError: 1</code> — for a key that is plainly sitting right there. What changed?", why: "The key. JSON has no integer keys — every key in JSON is a <b>string</b>. So the moment your dict went out to text, <code>1</code> became <code>\"1\"</code>, and it came back as <code>\"1\"</code>. The data looks the same when printed, but <code>scores[1]</code> and <code>scores[\"1\"]</code> are now two different lookups. A round-trip through JSON quietly rewrote your keys." },
  { t: "think", q: "Why can't you just paste a chunk of JSON straight into a Python file as a dict?", a: "Because JSON is <b>text</b> that only looks like a Python dict — and the spellings differ. JSON writes <code>true</code>, <code>false</code> and <code>null</code> in lowercase, where Python needs <code>True</code>, <code>False</code> and <code>None</code>, and JSON insists on <b>double</b> quotes.<br/><br/>So <code>{\"ok\": true}</code> is valid JSON and a <code>NameError</code> in Python (there is no <code>true</code>). The right move is never to paste it as code — feed it to <code>json.loads</code>, which does the translation for you." },

  { t: "h2", n: "1", text: "loads and dumps" },
  { t: "def", term: "JSON", en: "JSON (JavaScript Object Notation) is a text format for structured data — objects, arrays, strings, numbers, booleans and null — that almost every web API and config file uses to exchange information.", hi: "In plain words: JSON is how programs send data to each other as <b>text</b>. It looks like a Python dict, but it is a string until you parse it." },
  { t: "p", html: "The <b>s</b> in <code>loads</code>/<code>dumps</code> stands for <b>string</b>. <code>json.loads</code> reads a string <b>in</b> to Python; <code>json.dumps</code> writes Python <b>out</b> to a string." },
  { t: "code", file: "roundtrip.py", code: "import json\n\ntext = '{\"name\": \"Freya\", \"age\": 21, \"active\": true}'\ndata = json.loads(text)      # string -> dict\nprint(data[\"name\"], data[\"age\"])\nprint(type(data).__name__)\n\nback = json.dumps(data)      # dict -> string\nprint(back)", output: "Freya 21\ndict\n{\"name\": \"Freya\", \"age\": 21, \"active\": true}" },
  { t: "note", variant: "tip", html: "Notice <code>true</code> in the text became Python <code>True</code> on the way in, and turned back into <code>true</code> on the way out. <code>loads</code> and <code>dumps</code> translate the spellings for you — which is exactly why you use them instead of pasting." },

  { t: "h2", n: "2", text: "The type bridge" },
  { t: "p", html: "Each JSON type maps to a Python one. Most keep their shape; three change their <b>spelling</b>, and those three are where beginners get caught." },
  { t: "viz", name: "json-bridge" },
  { t: "p", html: "Flip between <code>loads</code> and <code>dumps</code> in that panel, then open <b>the round-trip trap</b> — it walks an int-keyed dict through <code>dumps</code> and back, and shows where <code>KeyError</code> comes from." },
  { t: "analogy", concept: "loads and dumps", real: "Translating a letter", html: "JSON text is a letter written in a shared language that every service understands. <code>json.loads</code> is <b>translating it into your own language</b> so you can work with it — a Python dict — and <code>json.dumps</code> is translating your reply <b>back</b> so the next service can read it. The letter and your working notes carry the same meaning, but they are not the same object, and a couple of words (<code>true</code>/<code>True</code>) are simply spelled differently in each." },

  { t: "h2", n: "3", text: "Nested data and pretty-printing" },
  { t: "p", html: "Real JSON nests — objects inside arrays inside objects. You reach in with the same <code>[key]</code> and <code>[index]</code> you already know. <code>dumps</code> with <code>indent</code> makes it readable." },
  { t: "code", file: "nested.py", code: "import json\n\ntext = '{\"user\": {\"name\": \"Freya\", \"roles\": [\"admin\", \"editor\"]}}'\ndata = json.loads(text)\n\nprint(data[\"user\"][\"name\"])\nprint(data[\"user\"][\"roles\"][0])\n\nprint(json.dumps(data, indent=2, sort_keys=True))", output: "Freya\nadmin\n{\n  \"user\": {\n    \"name\": \"Freya\",\n    \"roles\": [\n      \"admin\",\n      \"editor\"\n    ]\n  }\n}" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is the single most common shape of real data-science input. You call an API, get JSON back, <code>json.loads</code> it, dig out the fields you need, and hand a list of flat dicts to <code>pandas.DataFrame(...)</code>. Every dataset that starts life as an API response passes through exactly these two functions — learning them here is learning the front door of most data work." },

  { t: "h2", n: "4", text: "The two traps" },
  { t: "p", html: "JSON keys are <b>always strings</b>, so an int-keyed dict does not survive a round-trip. And JSON demands <b>double</b> quotes — single quotes are a parse error, not a nicety." },
  { t: "code", file: "traps.py", code: "import json\n\n# keys always come back as strings\nscores = {1: 95, 2: 88}\nback = json.loads(json.dumps(scores))\nprint(back)                 # {'1': 95, '2': 88}\nprint(back[\"1\"])            # works\n\n# single quotes are not valid JSON\ntry:\n    json.loads(\"{'name': 'Freya'}\")\nexcept json.JSONDecodeError:\n    print(\"single quotes are invalid JSON\")", output: "{'1': 95, '2': 88}\n95\nsingle quotes are invalid JSON" },
  { t: "note", variant: "warn", html: "A few Python values simply cannot be written as JSON — a <code>set</code>, a <code>tuple</code> (it comes back as a list), a <code>datetime</code>. <code>json.dumps({1, 2})</code> raises <code>TypeError: Object of type set is not JSON serializable</code>. Convert to a list or a string first." },

  { t: "trace", intro: "Reading and writing JSON, plus one trap. Work out each value.", code: "import json\n\ntext = '{\"n\": 5, \"ok\": true, \"tags\": [\"a\", \"b\"]}'\ndata = json.loads(text)\n\na = data[\"n\"]\nb = data[\"ok\"]\nc = len(data[\"tags\"])\nd = json.dumps({\"x\": None})\ne = type(json.loads(\"42\")).__name__", steps: [
    { q: "After line 6, <code>a</code> is", answer: "5", why: "The JSON number 5 parses to a Python int, read straight out of the dict by its key." },
    { q: "After line 7, <code>b</code> is", answer: "True", why: "JSON <code>true</code> (lowercase) becomes Python <code>True</code> — the spelling changes crossing the bridge." },
    { q: "After line 8, <code>c</code> is", answer: "2", why: "The JSON array became a Python list of two items, so <code>len</code> is 2." },
    { q: "After line 9, <code>d</code> is", answer: "{\"x\": null}", why: "Going out, Python <code>None</code> is written as JSON <code>null</code>, and the result is a string." },
    { q: "After line 10, <code>e</code> is", answer: "int", why: "<code>json.loads(\"42\")</code> parses the text 42 into a Python int." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Parse a JSON string and print one field.", code: "import json\n\ntext = '{\"city\": \"Delhi\"}'\ndata = json.loads(text)\nprint(data[\"city\"])", out: "Delhi" },
    { task: "Turn a Python dict into a JSON string.", code: "import json\n\nuser = {\"name\": \"Freya\", \"age\": 21}\nprint(json.dumps(user))", out: "{\"name\": \"Freya\", \"age\": 21}" },
    { task: "Show that JSON <code>true</code> becomes Python <code>True</code>.", code: "import json\n\nprint(json.loads('{\"ok\": true}')[\"ok\"])", out: "True" },
    { task: "Show that Python <code>None</code> becomes JSON <code>null</code>.", code: "import json\n\nprint(json.dumps({\"x\": None}))", out: "{\"x\": null}" },
    { task: "Read a value from a nested JSON object.", code: "import json\n\ntext = '{\"user\": {\"name\": \"Freya\"}}'\ndata = json.loads(text)\nprint(data[\"user\"][\"name\"])", out: "Freya" },
    { task: "Get the first item of a JSON array field.", code: "import json\n\ntext = '{\"tags\": [\"a\", \"b\", \"c\"]}'\nprint(json.loads(text)[\"tags\"][0])", out: "a" },
    { task: "Pretty-print a dict with 2-space indent.", code: "import json\n\nprint(json.dumps({\"a\": 1}, indent=2))", out: "{\n  \"a\": 1\n}" },
    { task: "Count the keys in a parsed JSON object.", code: "import json\n\ntext = '{\"a\": 1, \"b\": 2, \"c\": 3}'\nprint(len(json.loads(text)))", out: "3" },
    { task: "Show that an int key comes back as a string.", code: "import json\n\nback = json.loads(json.dumps({7: \"seven\"}))\nprint(list(back.keys()))", out: "['7']" },
    { task: "Sort keys alphabetically in the output.", code: "import json\n\nprint(json.dumps({\"b\": 1, \"a\": 2}, sort_keys=True))", out: "{\"a\": 2, \"b\": 1}" },
  ]},

  { t: "mistakes", items: [
    { bad: "config = {\"debug\": true}", why: "This is JSON spelling in Python code. There is no <code>true</code> in Python, so this is a <code>NameError</code> — the keyword is capitalised <code>True</code>.", fix: "config = {\"debug\": True}" },
    { bad: "import json\ndata = json.loads(\"{'name': 'Freya'}\")", why: "JSON requires <b>double</b> quotes. Single quotes make this invalid JSON, so <code>loads</code> raises <code>JSONDecodeError</code>. If the source really uses single quotes, it is a Python-dict string, not JSON.", fix: "import json\ndata = json.loads('{\"name\": \"Freya\"}')" },
    { bad: "import json\nscores = {1: 95, 2: 88}\nback = json.loads(json.dumps(scores))\nprint(back[1])", why: "After a round-trip the keys are strings, so <code>back[1]</code> is a <code>KeyError</code> — the key is <code>\"1\"</code> now. JSON has no integer keys.", fix: "import json\nscores = {1: 95, 2: 88}\nback = json.loads(json.dumps(scores))\nprint(back[\"1\"])" },
    { bad: "import json\nprint(json.dumps({1, 2, 3}))", why: "A <code>set</code> has no JSON equivalent, so <code>dumps</code> raises <code>TypeError: Object of type set is not JSON serializable</code>. Convert it first.", fix: "import json\nprint(json.dumps(list({1, 2, 3})))" },
  ]},

  { t: "debug", intro: "A leaderboard reads player scores from a saved JSON file, then looks up player 1. It crashes on the lookup, and the printed data looks completely correct. Read it before opening the fix.", code: "import json\n\nscores = {1: 95, 2: 88, 3: 76}\nsaved = json.dumps(scores)\n\nloaded = json.loads(saved)\nprint(\"data:\", loaded)\n\nprint(\"player 1:\", loaded[1])", symptom: "KeyError: 1", q: "The printed data shows the same numbers, and player 1 is obviously in there. So why does looking up key 1 fail?", fix: "import json\n\nscores = {1: 95, 2: 88, 3: 76}\nsaved = json.dumps(scores)\n\nloaded = json.loads(saved)\nprint(\"data:\", loaded)\n\nprint(\"player 1:\", loaded[str(1)])", why: "JSON keys can only be strings. When <code>json.dumps</code> wrote the dict out, it converted every int key to text — <code>1</code> became <code>\"1\"</code> — and <code>json.loads</code> read them straight back as strings. So <code>loaded</code> is <code>{'1': 95, '2': 88, '3': 76}</code>, and <code>loaded[1]</code> looks for an integer key that no longer exists.<br/><br/>It prints deceptively: <code>'1'</code> and <code>1</code> look the same in the output, which is why the data seems fine right up until the lookup. The direct fix is <code>loaded[str(1)]</code>. The better design is to use string keys from the start when data will travel through JSON, so the round-trip changes nothing — this is also why real APIs return <code>{\"userId\": ...}</code> objects rather than integer-keyed maps." },

  { t: "recap", items: [
    "JSON is <b>text</b> that looks like a dict; every API and config file speaks it",
    "<code>json.loads</code>: string → Python · <code>json.dumps</code>: Python → string (the <b>s</b> is \"string\")",
    "<code>true</code>/<code>false</code>/<code>null</code> ↔ <code>True</code>/<code>False</code>/<code>None</code> — spelling changes",
    "JSON needs <b>double</b> quotes; single quotes are a parse error",
    "JSON keys are <b>always strings</b> — an int-keyed dict does not survive a round-trip",
    "<code>indent=</code> pretty-prints; <code>sort_keys=True</code> orders the keys",
    "<code>set</code>, <code>tuple</code>, <code>datetime</code> are not serializable — convert first",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What do <code>json.loads</code> and <code>json.dumps</code> do?", a: "<code>loads</code> parses a JSON string into Python objects — an object becomes a dict, an array a list, and so on. <code>dumps</code> does the reverse, serialising a Python object into a JSON string. The <code>s</code> suffix means \"string\"; the versions without it, <code>load</code> and <code>dump</code>, read from and write to a file object directly." },
    { level: "beginner", q: "How does JSON represent true, false and null compared with Python?", a: "JSON uses lowercase <code>true</code>, <code>false</code> and <code>null</code>, while Python uses <code>True</code>, <code>False</code> and <code>None</code>. <code>json.loads</code> and <code>json.dumps</code> translate between them automatically, which is why you must parse JSON rather than paste it into code — pasted <code>true</code> is a NameError in Python." },
    { level: "intermediate", q: "Why can a dictionary change after a JSON round-trip?", a: "Because JSON keys are always strings. If you serialise a dict with integer keys and read it back, the keys come back as strings — <code>{1: \"a\"}</code> becomes <code>{\"1\": \"a\"}</code> — so a later <code>d[1]</code> raises KeyError. Tuples are similar: they serialise as arrays and return as lists. Anywhere data crosses JSON, assume keys are strings and sequences are lists." },
    { level: "intermediate", q: "What kinds of Python values can't be serialised to JSON, and how do you handle them?", a: "Sets, tuples-as-distinct-from-lists, <code>datetime</code> objects, and arbitrary class instances have no JSON equivalent; <code>json.dumps</code> raises <code>TypeError</code> on a set or datetime. You convert first — a set to a list, a datetime to an ISO string with <code>.isoformat()</code> — or pass a <code>default=</code> function to <code>dumps</code> that tells it how to render the unusual type." },
    { level: "intermediate", q: "What is the difference between <code>json.load</code> and <code>json.loads</code>?", a: "<code>loads</code> takes a string, while <code>load</code> takes a file object and reads the JSON directly from it — you would use <code>json.load(open(\"data.json\"))</code>. The same pairing exists for output: <code>dumps</code> returns a string, <code>dump</code> writes to a file. Choosing the right one saves you manually reading or writing the file's contents." },
  ]},
];
const L20 = [
  { t: "objectives", items: [
    "Build a date with <code>datetime</code>, and read its parts",
    "Format a date to text with <code>strftime</code> — and read the %-codes",
    "Parse text back into a date with <code>strptime</code>",
    "Add and subtract time with <code>timedelta</code>",
    "Never confuse <code>%m</code> (month) with <code>%M</code> (minute)",
  ]},
  { t: "hook", q: "Your log timestamps look perfect for months — <code>14:07</code>, <code>09:07</code>, <code>23:07</code>. Then someone asks why every single event happened at 7 minutes past the hour. What went wrong?", why: "The format string said <code>%H:%m</code>, not <code>%H:%M</code>. Lowercase <code>%m</code> is the <b>month</b> — and it was July, so every timestamp printed 07 where the minutes should be. The codes are case-sensitive, nothing ever errored, and the logs were quietly wrong from the first day." },
  { t: "think", q: "Why does <code>strftime</code> need a format string at all — why not just print the date?", a: "Because there is no single right way to write a date. <code>23/07/2026</code>, <code>July 23, 2026</code>, <code>2026-07-23</code> and <code>Thu 23 Jul</code> are all the same instant, and different places, files and APIs each expect a different one.<br/><br/>The format string is you saying <b>exactly</b> which arrangement you want. <code>strftime</code> takes the date's parts and drops each one into the slot you marked with a %-code." },

  { t: "h2", n: "1", text: "Building and reading a date" },
  { t: "def", term: "datetime", en: "datetime is an object holding a specific point in time — year, month, day, and optionally hour, minute and second — with methods to format it, compare it, and do arithmetic on it.", hi: "In plain words: a <code>datetime</code> is not text. It is a real object that knows it is the 23rd of July; turning it into readable text is a separate step (<code>strftime</code>)." },
  { t: "p", html: "You can build a fixed date with <code>datetime(year, month, day, ...)</code>, or get the current moment with <code>datetime.now()</code>. Its parts are plain attributes." },
  { t: "code", file: "build.py", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23, 14, 5, 9)   # 23 Jul 2026, 14:05:09\n\nprint(dt.year, dt.month, dt.day)\nprint(dt.hour, dt.minute, dt.second)\nprint(dt.weekday())    # 0 = Monday ... 3 = Thursday", output: "2026 7 23\n14 5 9\n3" },
  { t: "note", variant: "tip", html: "<b><code>datetime.now()</code> gives the current moment</b> — but because it changes every time, the examples here use a <b>fixed</b> date so the output is stable. In your own code, <code>now()</code> is what you will usually call." },

  { t: "h2", n: "2", text: "strftime — date to text" },
  { t: "p", html: "<code>strftime</code> (\"string-format-time\") walks your format string and replaces each %-code with a part of the date. Everything that is not a code — dashes, colons, spaces — is printed unchanged." },
  { t: "viz", name: "strftime-lab" },
  { t: "p", html: "Click through those presets. Each %-code pulls out one piece; the last one, <code>%H:%m</code>, is the trap — lowercase <code>%m</code> is the month, so a clock reads <code>14:07</code> instead of <code>14:05</code>." },
  { t: "code", file: "format.py", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23, 14, 5, 9)\n\nprint(dt.strftime(\"%d-%m-%Y\"))       # day-month-year\nprint(dt.strftime(\"%A, %d %B %Y\"))   # weekday and month names\nprint(dt.strftime(\"%I:%M %p\"))       # 12-hour clock", output: "23-07-2026\nThursday, 23 July 2026\n02:05 PM" },
  { t: "note", variant: "warn", html: "<b>Case matters, and it matters most for <code>m</code>.</b> <code>%m</code> is the month (01–12); <code>%M</code> is the minute (00–59). Same letter, different case, completely different number — and swapping them never raises an error." },
  { t: "analogy", concept: "A format string", real: "Filling in a rubber stamp", html: "<code>strftime</code> is a rubber stamp with labelled slots. <code>%Y</code> is the slot that always gets the year, <code>%d</code> the day, <code>%B</code> the month's name. You arrange the slots and the fixed ink — the dashes and spaces — however you like, press it onto the date, and out comes the text. The date object is untouched; you just took an imprint of it in the shape you asked for." },

  { t: "h2", n: "3", text: "strptime — text back to a date" },
  { t: "p", html: "The reverse of <code>strftime</code> is <code>strptime</code> (\"string-parse-time\"). You give it the text <b>and</b> the format it is in, and it hands back a real <code>datetime</code> you can do maths on." },
  { t: "code", file: "parse.py", code: "from datetime import datetime\n\ntext = \"25-12-2026\"\ndt = datetime.strptime(text, \"%d-%m-%Y\")\n\nprint(dt.year, dt.month, dt.day)\nprint(dt.strftime(\"%A\"))    # what weekday is that?", output: "2026 12 25\nFriday" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> dates almost always arrive as <b>text</b> — a CSV column, a JSON field, a log line. Until you <code>strptime</code> them into real datetimes, you cannot sort by date, filter a range, or compute \"how many days between\" — you just have strings, where <code>\"09/2026\"</code> sorts before <code>\"10/2025\"</code>. Parsing dates on the way in is the first step of almost every time-series task, and Pandas' <code>pd.to_datetime</code> is this same idea at scale." },

  { t: "h2", n: "4", text: "timedelta — date arithmetic" },
  { t: "p", html: "Subtract two dates and you get a <code>timedelta</code> — a span of time. Add a <code>timedelta</code> to a date to move it forward or back." },
  { t: "code", file: "delta.py", code: "from datetime import date, timedelta\n\nstart = date(2026, 7, 23)\n\ndeadline = start + timedelta(days=10)\nprint(deadline)                       # 10 days later\n\ngap = date(2026, 12, 25) - start\nprint(gap.days, \"days to go\")", output: "2026-08-02\n155 days to go" },
  { t: "note", variant: "tip", html: "A subtraction gives a <code>timedelta</code>, and its <code>.days</code> is the whole number of days. <code>timedelta</code> takes <code>days</code>, <code>hours</code>, <code>minutes</code>, <code>seconds</code>, <code>weeks</code> — but <b>not</b> months or years, because those are not fixed lengths." },

  { t: "trace", intro: "One fixed date, formatted and shifted several ways. Work out each value.", code: "from datetime import datetime, date, timedelta\n\ndt = datetime(2026, 7, 23, 14, 5, 9)\n\na = dt.strftime(\"%Y-%m-%d\")\nb = dt.strftime(\"%H:%M\")\nc = dt.month\nd = (date(2026, 7, 30) - date(2026, 7, 23)).days\ne = (date(2026, 7, 23) + timedelta(days=3)).strftime(\"%d-%m\")", steps: [
    { q: "After line 5, <code>a</code> is", answer: "2026-07-23", why: "<code>%Y-%m-%d</code> is year, month, day with dashes — the ISO order." },
    { q: "After line 6, <code>b</code> is", answer: "14:05", why: "<code>%H:%M</code> is hour then minute, both capital-M for minute. 14:05, not 14:07." },
    { q: "After line 7, <code>c</code> is", answer: "7", why: "<code>.month</code> is the integer 7 — an attribute of the datetime, no formatting involved." },
    { q: "After line 8, <code>d</code> is", answer: "7", why: "The 30th minus the 23rd is a 7-day <code>timedelta</code>, and <code>.days</code> reads out 7." },
    { q: "After line 9, <code>e</code> is", answer: "26-07", why: "Add 3 days to the 23rd to get the 26th, then format as day-month: 26-07." },
  ]},

  { t: "drills", intro: "One per idea. All use a fixed date so the answer is stable — write each before opening it.", items: [
    { task: "Build 23 July 2026 and print its year, month, day.", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23)\nprint(dt.year, dt.month, dt.day)", out: "2026 7 23" },
    { task: "Format that date as day-month-year with dashes.", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23)\nprint(dt.strftime(\"%d-%m-%Y\"))", out: "23-07-2026" },
    { task: "Print the full weekday name of 23 July 2026.", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23)\nprint(dt.strftime(\"%A\"))", out: "Thursday" },
    { task: "Format a time as HH:MM (24-hour). Mind the capital M.", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23, 14, 5)\nprint(dt.strftime(\"%H:%M\"))", out: "14:05" },
    { task: "Parse the text \"01-01-2027\" into a date.", code: "from datetime import datetime\n\ndt = datetime.strptime(\"01-01-2027\", \"%d-%m-%Y\")\nprint(dt.year, dt.month, dt.day)", out: "2027 1 1" },
    { task: "Add 7 days to 23 July 2026.", code: "from datetime import date, timedelta\n\nprint(date(2026, 7, 23) + timedelta(days=7))", out: "2026-07-30" },
    { task: "How many days between 23 July and 2 August 2026?", code: "from datetime import date\n\nprint((date(2026, 8, 2) - date(2026, 7, 23)).days)", out: "10" },
    { task: "Show the month as a short name (Jul).", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23)\nprint(dt.strftime(\"%b\"))", out: "Jul" },
    { task: "Format in 12-hour clock with AM/PM.", code: "from datetime import datetime\n\ndt = datetime(2026, 7, 23, 14, 5)\nprint(dt.strftime(\"%I:%M %p\"))", out: "02:05 PM" },
    { task: "Go back 1 day from 1 January 2027 (crosses the year).", code: "from datetime import date, timedelta\n\nprint(date(2027, 1, 1) - timedelta(days=1))", out: "2026-12-31" },
  ]},

  { t: "mistakes", items: [
    { bad: "from datetime import datetime\ndt = datetime(2026, 7, 23, 14, 5)\nprint(dt.strftime(\"%H:%m\"))", why: "<code>%m</code> is the <b>month</b>, so this prints <code>14:07</code> — the minute should be capital <code>%M</code>. No error, just a wrong time in every log line.", fix: "from datetime import datetime\ndt = datetime(2026, 7, 23, 14, 5)\nprint(dt.strftime(\"%H:%M\"))" },
    { bad: "from datetime import datetime\ndt = datetime.strptime(\"23/07/2026\", \"%d-%m-%Y\")", why: "The text uses slashes but the format says dashes, so the pattern does not match and <code>strptime</code> raises <code>ValueError</code>. The format string must mirror the text <b>exactly</b>, separators included.", fix: "from datetime import datetime\ndt = datetime.strptime(\"23/07/2026\", \"%d/%m/%Y\")" },
    { bad: "from datetime import date, timedelta\nnext_month = date(2026, 7, 23) + timedelta(months=1)", why: "<code>timedelta</code> has no <code>months</code> argument — a month is not a fixed number of days, so this is a <code>TypeError</code>. Use <code>days</code>, or a library like <code>dateutil</code> for calendar months.", fix: "from datetime import date, timedelta\nlater = date(2026, 7, 23) + timedelta(days=30)" },
    { bad: "birthday = \"1995-08-15\"\nage_days = \"2026-07-23\" - birthday", why: "These are <b>strings</b>, and you cannot subtract text. They look like dates but Python sees two str objects — a <code>TypeError</code>. Parse them first.", fix: "from datetime import datetime\nb = datetime.strptime(\"1995-08-15\", \"%Y-%m-%d\")\nn = datetime.strptime(\"2026-07-23\", \"%Y-%m-%d\")\nage_days = (n - b).days" },
  ]},

  { t: "debug", intro: "A function stamps each log line with a timestamp. It runs cleanly and the format looks right, but the minutes are wrong on every line. Read it before opening the fix.", code: "from datetime import datetime\n\ndef stamp(dt):\n    return dt.strftime(\"%H:%m\")\n\nprint(stamp(datetime(2026, 7, 23, 14, 5)))\nprint(stamp(datetime(2026, 7, 23, 9, 30)))", symptom: "prints 14:07 and 09:07 — every minute is 07", q: "Both times end in 07, and the real minutes are 05 and 30. Where is 07 coming from?", fix: "from datetime import datetime\n\ndef stamp(dt):\n    return dt.strftime(\"%H:%M\")\n\nprint(stamp(datetime(2026, 7, 23, 14, 5)))\nprint(stamp(datetime(2026, 7, 23, 9, 30)))", why: "The format is <code>%H:%m</code>, and lowercase <code>%m</code> is the <b>month</b>. Both datetimes are in July, so the second half always renders as <code>07</code> — the month — no matter what the real minutes are. The minute code is capital <code>%M</code>.<br/><br/>It is invisible because the output still looks like a time: two digits, a colon, two digits. Nothing is out of range (a month is 01–12, so it even passes for plausible minutes), nothing raises, and the bug only shows up when someone notices every event happened at :07. This is the single most common strftime mistake, and the reason to say the codes out loud — \"capital M for minute\" — when you write them." },

  { t: "recap", items: [
    "<code>datetime(y, m, d, ...)</code> builds a date; <code>.year</code>, <code>.month</code>, <code>.day</code> read its parts",
    "<code>datetime.now()</code> is the current moment (non-deterministic, so examples use fixed dates)",
    "<code>strftime(fmt)</code> = date → text; each %-code is one part, other characters print as-is",
    "<code>strptime(text, fmt)</code> = text → date; the format must match the text exactly",
    "<b><code>%m</code> is month, <code>%M</code> is minute</b> — case-sensitive, and swapping them is silent",
    "<code>%Y</code> year · <code>%d</code> day · <code>%H</code> hour · <code>%B</code>/<code>%A</code> month/weekday names · <code>%p</code> AM/PM",
    "Subtract dates → <code>timedelta</code>; <code>.days</code> reads the span; add one to shift a date",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>strftime</code> and <code>strptime</code>?", a: "<code>strftime</code> is string-<b>format</b>-time: it turns a datetime object into text using a format string. <code>strptime</code> is string-<b>parse</b>-time: it does the reverse, reading text plus the format it is in and producing a datetime. A memory aid is the extra letters — f for format (out), p for parse (in)." },
    { level: "beginner", q: "What do <code>%m</code> and <code>%M</code> mean, and why does it matter?", a: "Lowercase <code>%m</code> is the month (01–12); capital <code>%M</code> is the minute (00–59). It matters because the codes are case-sensitive and swapping them raises no error — a format like <code>%H:%m</code> silently prints the month where the minutes should be, which is one of the most common date bugs there is." },
    { level: "intermediate", q: "Why should you parse date strings into datetime objects instead of leaving them as text?", a: "Because comparisons and arithmetic on date strings are wrong or impossible. Lexicographic string order does not match chronological order unless the format is strictly year-first with zero-padding, and you cannot subtract two strings to get a duration. Parsing to real datetimes lets you sort, filter ranges, and compute differences correctly — it is the first step of essentially every time-series workflow." },
    { level: "intermediate", q: "What is a <code>timedelta</code>, and what can't it represent?", a: "A <code>timedelta</code> is a duration — a fixed span of days, seconds and microseconds — that you get by subtracting two datetimes or construct directly to shift a date. It deliberately has no months or years arguments, because those are not fixed lengths: a month can be 28 to 31 days. For calendar-aware offsets like \"one month later\" you use a library such as <code>dateutil</code>'s <code>relativedelta</code>." },
    { level: "intermediate", q: "How would you find the number of days between two dates?", a: "Subtract them — <code>(end - start)</code> — which yields a <code>timedelta</code>, and read its <code>.days</code> attribute. Both operands must be real date or datetime objects, so if they arrived as text you <code>strptime</code> them first. If the two are different types (a <code>date</code> and a <code>datetime</code>) Python raises a TypeError, so keep them consistent." },
  ]},
];

const L21 = [
  { t: "objectives", items: [
    "Test membership with <code>in</code> and <code>not in</code>",
    "Know that <code>in</code> on a dict checks its <b>keys</b>, not its values",
    "Tell <code>is</code> (same object) from <code>==</code> (same value) — and when each is right",
    "Use <code>is None</code> for the singletons <code>None</code>, <code>True</code>, <code>False</code>",
    "Read the bitwise operators <code>&amp;</code> <code>|</code> <code>^</code> as working bit by bit",
  ]},
  { t: "hook", q: "You compare two shopping carts that hold exactly the same items with <code>cart_a is cart_b</code>, expecting <code>True</code>. You get <code>False</code> — even though every item matches. Meanwhile <code>==</code> would have said <code>True</code>. What is <code>is</code> actually asking?", why: "<code>is</code> does not ask &quot;are these equal?&quot; It asks &quot;are these the <b>same object</b> — the same box in memory?&quot; Two carts built separately are two different boxes that happen to hold identical things, so <code>is</code> is <code>False</code> and <code>==</code> is <code>True</code>. Using <code>is</code> to compare values is a bug that passes every test where the two happen to be the same object, then fails the day they are not." },
  { t: "think", q: "Why should you always write <code>if x is None</code>, never <code>if x == None</code>?", a: "Because there is only ever <b>one</b> <code>None</code> in a running program — it is a singleton. So &quot;is this value None?&quot; is genuinely an identity question, and <code>is</code> answers it directly and fast.<br/><br/><code>==</code> can also be <i>fooled</i>: a class can define <code>__eq__</code> so that <code>x == None</code> returns True for something that is not None. <code>is None</code> cannot be overridden, so it is both the correct question and the safe one." },

  { t: "h2", n: "1", text: "Membership: in and not in" },
  { t: "def", term: "Membership test", en: "The in operator returns True if a value is found within a container — a list, string, tuple, set or dictionary — and not in is its negation.", hi: "In plain words: <code>in</code> poochta hai \"kya ye cheez andar hai?\" and gives back a plain <code>True</code> or <code>False</code>." },
  { t: "p", html: "<code>in</code> works across containers. On a string it checks for a substring; on a list, tuple or set it checks the elements." },
  { t: "code", file: "member.py", code: "nums = [1, 2, 3]\nprint(2 in nums)          # is 2 an element?\nprint(5 not in nums)      # is 5 absent?\n\nprint(\"cat\" in \"category\") # substring test\nprint(\"x\" in \"category\")", output: "True\nTrue\nTrue\nFalse" },
  { t: "note", variant: "warn", html: "<b>On a dict, <code>in</code> checks the KEYS, not the values.</b> <code>\"name\" in user</code> is True if <code>name</code> is a key; <code>\"Freya\" in user</code> is False even when Freya is a value. To search values, write <code>in user.values()</code>." },

  { t: "h2", n: "2", text: "Identity vs equality: is vs ==" },
  { t: "def", term: "is versus ==", en: "== compares values — are these two things equal? is compares identity — are these two names bound to the very same object in memory?", hi: "In plain words: <code>==</code> \"same value?\" poochta hai, <code>is</code> \"same object?\". Do alag lists same values ki ho sakti hain (<code>==</code> True) but same object nahi (<code>is</code> False)." },
  { t: "code", file: "identity.py", code: "a = [1, 2, 3]\nb = [1, 2, 3]     # a separate list with equal contents\nc = a             # the SAME list, another name\n\nprint(a == b)     # equal values?\nprint(a is b)     # same object?\nprint(a is c)     # same object?", output: "True\nFalse\nTrue" },
  { t: "note", variant: "key", html: "📌 <b>The rule:</b> use <code>==</code> to compare <b>values</b> — which is what you want almost every time. Use <code>is</code> only to compare <b>identity</b>, and in practice that means one thing: checking against the singletons <code>None</code>, <code>True</code> and <code>False</code>. <code>if x is None</code>, never <code>if x == None</code>." },
  { t: "analogy", concept: "is vs ==", real: "Two identical twins", html: "Two identical twins are <b>equal</b> in every feature you can list — <code>==</code> would say True. But they are still two different people, not one — so <code>is</code> says False. <code>c = a</code> is not a twin; it is the <b>same</b> person answering to a second name, so <code>a is c</code> is True. <code>==</code> looks at the features; <code>is</code> asks whether it is literally the same individual." },

  { t: "h2", n: "3", text: "Bitwise operators" },
  { t: "p", html: "A whole number is a row of bits, and <code>&amp;</code>, <code>|</code>, <code>^</code> combine two numbers one bit-column at a time. <code>&amp;</code> keeps a 1 only where <b>both</b> have 1; <code>|</code> where <b>either</b> does; <code>^</code> where they <b>differ</b>." },
  { t: "viz", name: "bitwise-lab" },
  { t: "code", file: "bitwise.py", code: "print(6 & 3)    # 110 & 011 -> 010\nprint(6 | 3)    # 110 | 011 -> 111\nprint(6 ^ 3)    # 110 ^ 011 -> 101\nprint(5 << 1)   # shift left: 101 -> 1010\nprint(20 >> 2)  # shift right: 10100 -> 101", output: "2\n7\n5\n10\n5" },
  { t: "note", variant: "tip", html: "<b>Where you meet these:</b> permission flags packed into one integer (read=4, write=2, execute=1, combined with <code>|</code> and tested with <code>&amp;</code>), and later NumPy/Pandas, where <code>&amp;</code> and <code>|</code> — not <code>and</code>/<code>or</code> — combine boolean masks like <code>df[(df.a &gt; 0) &amp; (df.b &lt; 5)]</code>." },

  { t: "trace", intro: "Membership, identity, and a bit of bitwise. Work out each value.", code: "user = {\"name\": \"Freya\", \"age\": 21}\nnums = [1, 2, 3]\n\na = \"name\" in user\nb = \"Freya\" in user\nc = 5 not in nums\nx = [1, 2]\ny = [1, 2]\nd = x == y\ne = x is y\nf = 6 & 3", steps: [
    { q: "After line 4, <code>a</code> is", answer: "True", why: "<code>in</code> on a dict tests the keys, and <code>name</code> is a key." },
    { q: "After line 5, <code>b</code> is", answer: "False", why: "<code>Freya</code> is a value, not a key — and <code>in</code> only looks at keys. This is the dict trap." },
    { q: "After line 6, <code>c</code> is", answer: "True", why: "5 is not an element of <code>nums</code>, so <code>not in</code> is True." },
    { q: "After line 9, <code>d</code> is", answer: "True", why: "<code>x</code> and <code>y</code> hold equal contents, and <code>==</code> compares value." },
    { q: "After line 10, <code>e</code> is", answer: "False", why: "They are two separate lists — equal in value but different objects — so <code>is</code> is False." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Check whether 3 is in a list.", code: "nums = [1, 2, 3, 4]\nprint(3 in nums)", out: "True" },
    { task: "Check whether a substring is inside a word.", code: "print(\"pen\" in \"open\")", out: "True" },
    { task: "Check whether a key is in a dict.", code: "user = {\"name\": \"Freya\", \"age\": 21}\nprint(\"age\" in user)", out: "True" },
    { task: "Show that a value is NOT found by <code>in</code> on a dict.", code: "user = {\"name\": \"Freya\"}\nprint(\"Freya\" in user)", out: "False" },
    { task: "Search a dict's values instead of its keys.", code: "user = {\"name\": \"Freya\"}\nprint(\"Freya\" in user.values())", out: "True" },
    { task: "Compare two equal lists with <code>==</code> and with <code>is</code>.", code: "a = [1, 2]\nb = [1, 2]\nprint(a == b, a is b)", out: "True False" },
    { task: "Check a value against None the correct way.", code: "x = None\nprint(x is None)", out: "True" },
    { task: "Bitwise AND of 12 and 10.", code: "print(12 & 10)", out: "8" },
    { task: "Bitwise OR and XOR of 6 and 3.", code: "print(6 | 3, 6 ^ 3)", out: "7 5" },
    { task: "Double a number by shifting its bits left once.", code: "print(5 << 1)", out: "10" },
  ]},

  { t: "mistakes", items: [
    { bad: "if user_input == None:\n    print(\"nothing entered\")", why: "<code>== None</code> works by luck and can be fooled by a class that defines <code>__eq__</code>. <code>None</code> is a singleton, so the correct and safe test is identity.", fix: "if user_input is None:\n    print(\"nothing entered\")" },
    { bad: "config_a = [\"dark\", \"en\"]\nconfig_b = [\"dark\", \"en\"]\nif config_a is config_b:\n    print(\"same settings\")", why: "<code>is</code> asks whether they are the same object, and two separately-built lists never are — so this is <code>False</code> even though the settings match. Value comparison needs <code>==</code>.", fix: "config_a = [\"dark\", \"en\"]\nconfig_b = [\"dark\", \"en\"]\nif config_a == config_b:\n    print(\"same settings\")" },
    { bad: "user = {\"name\": \"Freya\", \"age\": 21}\nif \"Freya\" in user:\n    print(\"found the user\")", why: "<code>in</code> on a dict checks keys, and <code>Freya</code> is a value — so this is False and the message never prints. Search <code>user.values()</code> to look at values.", fix: "user = {\"name\": \"Freya\", \"age\": 21}\nif \"Freya\" in user.values():\n    print(\"found the user\")" },
    { bad: "flags = 4\nif flags and 2:\n    print(\"write enabled\")", why: "<code>and</code> is logical, not bitwise — <code>flags and 2</code> just evaluates to 2 (truthy), so this is always True. To test a bit you need <code>&amp;</code>.", fix: "flags = 4\nif flags & 2:\n    print(\"write enabled\")" },
  ]},

  { t: "debug", intro: "A settings screen checks whether the user's chosen theme matches the saved one before showing 'no changes'. The values are identical, yet it always reports a change. Read it before opening the fix.", code: "def unchanged(current, saved):\n    return current is saved\n\nsaved = [\"dark\", \"english\"]\ncurrent = [\"dark\", \"english\"]   # rebuilt from the form, same values\n\nprint(\"unchanged?\", unchanged(current, saved))", symptom: "prints unchanged? False, even though the lists match", q: "Both lists clearly hold the same two strings. So why does the check say they are not unchanged?", fix: "def unchanged(current, saved):\n    return current == saved\n\nsaved = [\"dark\", \"english\"]\ncurrent = [\"dark\", \"english\"]   # rebuilt from the form, same values\n\nprint(\"unchanged?\", unchanged(current, saved))", why: "<code>is</code> compares <b>identity</b> — whether the two names point at the very same list object in memory. <code>current</code> was rebuilt from the form, so it is a brand-new list that merely holds the same values; it is a different object, and <code>is</code> is <code>False</code>.<br/><br/>What the function actually means to ask is &quot;do these hold the same values?&quot;, which is <code>==</code>. The bug is invisible in quick tests because if you ever compare a list with itself — <code>unchanged(saved, saved)</code> — <code>is</code> returns True and everything looks fine. It only fails once the two are separate objects, which in real use they always are. Reserve <code>is</code> for <code>None</code> and the other singletons; use <code>==</code> for values." },

  { t: "recap", items: [
    "<code>in</code> / <code>not in</code> test membership and return a bool",
    "On a <b>dict</b>, <code>in</code> checks the <b>keys</b> — use <code>.values()</code> to search values",
    "<code>==</code> compares <b>value</b>; <code>is</code> compares <b>identity</b> (same object)",
    "Two equal lists are <code>==</code> True but <code>is</code> False — they are different objects",
    "Use <code>is</code> only for the singletons: <code>is None</code>, not <code>== None</code>",
    "<code>&amp;</code> <code>|</code> <code>^</code> combine numbers bit by bit; <code>&lt;&lt;</code> <code>&gt;&gt;</code> shift bits",
    "In NumPy/Pandas, boolean masks combine with <code>&amp;</code>/<code>|</code>, not <code>and</code>/<code>or</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>==</code> and <code>is</code>?", a: "<code>==</code> tests whether two objects have equal values, calling the type's <code>__eq__</code>. <code>is</code> tests identity — whether two names refer to the exact same object in memory. Two separately created lists with the same contents are <code>==</code> equal but not <code>is</code> identical. You want <code>==</code> almost always; <code>is</code> is for singletons like <code>None</code>." },
    { level: "beginner", q: "What does <code>in</code> do on a dictionary?", a: "It checks membership against the dictionary's <b>keys</b>, not its values — <code>\"name\" in user</code> is True only if <code>name</code> is a key. This surprises people who expect it to search values; for that you write <code>value in user.values()</code>, and to search key–value pairs, <code>user.items()</code>." },
    { level: "intermediate", q: "Why is <code>if x is None</code> preferred over <code>if x == None</code>?", a: "<code>None</code> is a singleton — there is exactly one of it — so the meaningful question is identity, which <code>is</code> answers directly and cannot be overridden. <code>==</code> dispatches to <code>__eq__</code>, which a class can define to return True when compared to None, giving a false positive. <code>is None</code> is both semantically correct and immune to that." },
    { level: "intermediate", q: "When would you actually use bitwise operators?", a: "Packing several boolean flags into one integer — permissions like read/write/execute as 4/2/1, combined with <code>|</code> and tested with <code>&</code> — is the classic case, along with low-level protocol and hardware work. In data science specifically, NumPy and Pandas overload <code>&</code> and <code>|</code> to combine boolean masks element-wise, so <code>df[(df.a &gt; 0) &amp; (df.b &lt; 5)]</code> uses bitwise operators, not <code>and</code>/<code>or</code>, which would raise." },
    { level: "intermediate", q: "Can you rely on <code>is</code> for comparing integers or strings?", a: "No. Whether two equal ints or strings are the same object is an implementation detail — CPython caches small integers and some short strings, so <code>256 is 256</code> may be True while <code>257 is 257</code> is not, and the behaviour can differ between versions or interpreters. Never use <code>is</code> to compare numeric or string values; use <code>==</code>. Reserve <code>is</code> for <code>None</code>, <code>True</code> and <code>False</code>." },
  ]},
];
const L22 = [
  { t: "objectives", items: [
    "Replace a long <code>if-elif</code> chain with <code>match-case</code> (Python 3.10+)",
    "Combine values in one case with <code>|</code>, and catch the rest with <code>case _</code>",
    "Match the <b>shape</b> of data — lists and dicts — not just single values",
    "Add a condition to a case with a <code>if</code> guard",
    "Avoid the capture trap: a bare name matches <b>anything</b> and binds it",
  ]},
  { t: "hook", q: "You write <code>case WEEKEND:</code> meaning \"if the day equals my WEEKEND constant\". Every day — Monday, Tuesday, all of them — comes back as a weekend. The variable was set correctly. What did <code>case</code> actually do with that name?", why: "It did not compare against <code>WEEKEND</code>. A bare name in a <code>case</code> is a <b>capture</b> — it matches <b>any</b> value and binds it to that name, exactly like an assignment. So <code>case WEEKEND:</code> catches everything and quietly overwrites your constant. To compare against a value, you use a literal, a dotted name, or a guard — never a bare name." },
  { t: "think", q: "<code>match-case</code> looks like a <code>switch</code> from other languages. What can it do that a switch cannot?", a: "It matches the <b>shape</b> of data, not just equality. A single case can say \"a list of exactly two things\", pull those two things out into names, and even add a condition — <code>case [x, y] if x == y</code>.<br/><br/>A <code>switch</code> only asks \"is this value equal to that one?\". <code>match</code> asks \"does this value have this structure?\" and hands you the pieces. That is why it is called <b>structural pattern matching</b>, not a switch." },

  { t: "h2", n: "1", text: "The basics: cases, |, and _" },
  { t: "def", term: "match-case", en: "A match statement compares a value against a series of patterns, running the block of the first pattern that matches; case _ is the catch-all, and | offers alternatives within one case.", hi: "In plain words: <code>match</code> ek value ko upar se neeche har <code>case</code> se check karta hai, aur <b>pehla</b> jo match kare wahi chalta hai." },
  { t: "p", html: "Cases are tried top to bottom, and the <b>first</b> match wins — so order matters. <code>|</code> lists alternatives; <code>case _</code> is the wildcard that catches whatever is left." },
  { t: "code", file: "basic.py", code: "def status_msg(code):\n    match code:\n        case 200:\n            return \"OK\"\n        case 404:\n            return \"Not Found\"\n        case 500 | 502 | 503:\n            return \"Server Error\"\n        case _:\n            return \"Unknown\"\n\nprint(status_msg(200))\nprint(status_msg(503))\nprint(status_msg(999))", output: "OK\nServer Error\nUnknown" },
  { t: "note", variant: "tip", html: "<code>case _</code> is the default, like <code>else</code>. Put it <b>last</b> — it matches everything, so any case below it can never run. <code>match-case</code> needs Python 3.10 or newer." },

  { t: "h2", n: "2", text: "First match wins" },
  { t: "p", html: "Because Python stops at the first matching case, a broad pattern placed too high hides the specific ones below it. Watch a value fall through the cases in this panel." },
  { t: "viz", name: "match-lab" },
  { t: "p", html: "Notice the ticked case is the <b>first</b> that fits, and everything below it is greyed — never reached. Move <code>case [x, y]</code> above <code>case [0, 0]</code> and the origin case would become dead code." },
  { t: "analogy", concept: "match-case order", real: "Sorting mail into pigeonholes", html: "You sort a letter by checking pigeonholes in order and dropping it in the <b>first</b> one that fits. If you hang a giant \"anything\" box at the front, every letter lands there and the labelled boxes behind it never get used. <code>case _</code> is that anything-box — useful, but only at the <b>end</b>. The specific patterns go first, the catch-all last." },

  { t: "h2", n: "3", text: "Matching shape: lists and dicts" },
  { t: "p", html: "This is where <code>match</code> earns its keep. A pattern can describe the structure of a list or dict and <b>capture</b> the parts you care about into names." },
  { t: "code", file: "shape.py", code: "def describe(point):\n    match point:\n        case [0, 0]:\n            return \"origin\"\n        case [0, y]:\n            return f\"y-axis at {y}\"\n        case [x, y]:\n            return f\"point {x},{y}\"\n        case _:\n            return \"not a pair\"\n\nprint(describe([0, 0]))\nprint(describe([0, 5]))\nprint(describe([3, 4]))", output: "origin\ny-axis at 5\npoint 3,4" },
  { t: "code", file: "mapping.py", code: "def greet(user):\n    match user:\n        case {\"name\": name, \"vip\": True}:\n            return f\"Welcome back, {name}!\"\n        case {\"name\": name}:\n            return f\"Hi {name}\"\n        case _:\n            return \"Hi guest\"\n\nprint(greet({\"name\": \"Freya\", \"vip\": True}))\nprint(greet({\"name\": \"Om\"}))\nprint(greet({}))", output: "Welcome back, Freya!\nHi Om\nHi guest" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is tailor-made for JSON from an API. Instead of a ladder of <code>if \"vip\" in user and user[\"vip\"]</code> checks, one <code>case {\"name\": name, \"vip\": True}</code> both tests the shape and pulls out the name. A dict pattern ignores extra keys, so it stays robust when the API adds fields — exactly what you want when parsing responses." },

  { t: "h2", n: "4", text: "Guards, and the capture trap" },
  { t: "p", html: "A capture like <code>x</code> matches anything and binds it. Add <code>if</code> to turn a case into a real condition — that is how you compare against a variable or a range." },
  { t: "code", file: "guard.py", code: "def size(n):\n    match n:\n        case n if n < 0:\n            return \"negative\"\n        case 0:\n            return \"zero\"\n        case n if n < 10:\n            return \"small\"\n        case _:\n            return \"big\"\n\nprint(size(-5), size(0), size(7), size(100))", output: "negative zero small big" },
  { t: "note", variant: "warn", html: "<b>The capture trap.</b> <code>case some_variable:</code> does <b>not</b> compare against <code>some_variable</code> — it captures any value into that name. To match a constant, use a literal (<code>case \"Sat\"</code>), a dotted name (<code>case Day.SAT</code>), or a guard (<code>case d if d == WEEKEND</code>). Worse, Python raises <code>SyntaxError: name capture makes remaining patterns unreachable</code> if a bare-name case is followed by more cases — so it sometimes bites at compile time and sometimes silently at runtime." },

  { t: "trace", intro: "First match wins, and guards add conditions. Work out each value.", code: "def check(v):\n    match v:\n        case 0:\n            return \"zero\"\n        case [x]:\n            return f\"one item: {x}\"\n        case [x, y] if x == y:\n            return \"equal pair\"\n        case [x, y]:\n            return \"pair\"\n        case _:\n            return \"other\"\n\na = check(0)\nb = check([9])\nc = check([4, 4])\nd = check([3, 5])\ne = check(\"hi\")", steps: [
    { q: "After line 14, <code>a</code> is", answer: "zero", why: "The first case, <code>case 0</code>, matches the literal 0 and wins immediately." },
    { q: "After line 15, <code>b</code> is", answer: "one item: 9", why: "A list of exactly one element matches <code>case [x]</code>, capturing 9 into x." },
    { q: "After line 16, <code>c</code> is", answer: "equal pair", why: "<code>[4, 4]</code> matches <code>[x, y]</code> and the guard <code>x == y</code> holds, so it stops there — before the plainer pair case." },
    { q: "After line 17, <code>d</code> is", answer: "pair", why: "<code>[3, 5]</code> fails the guard (3 ≠ 5), so it falls through to the next case, a plain two-element list." },
    { q: "After line 18, <code>e</code> is", answer: "other", why: "A string is neither 0 nor a list of one or two items, so only the wildcard <code>case _</code> catches it." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Return \"weekend\" for Sat or Sun, else \"weekday\".", code: "def day_type(day):\n    match day:\n        case \"Sat\" | \"Sun\":\n            return \"weekend\"\n        case _:\n            return \"weekday\"\n\nprint(day_type(\"Sat\"), day_type(\"Mon\"))", out: "weekend weekday" },
    { task: "Map HTTP 200 to OK, 404 to Not Found, anything else to Unknown.", code: "def msg(code):\n    match code:\n        case 200:\n            return \"OK\"\n        case 404:\n            return \"Not Found\"\n        case _:\n            return \"Unknown\"\n\nprint(msg(200), msg(500))", out: "OK Unknown" },
    { task: "Group 500, 502 and 503 into one case with <code>|</code>.", code: "def kind(code):\n    match code:\n        case 500 | 502 | 503:\n            return \"server error\"\n        case _:\n            return \"ok\"\n\nprint(kind(502), kind(200))", out: "server error ok" },
    { task: "Return \"empty\" for [], else the first element.", code: "def head(items):\n    match items:\n        case []:\n            return \"empty\"\n        case [first, *rest]:\n            return first\n\nprint(head([]), head([9, 8, 7]))", out: "empty 9" },
    { task: "Match the origin point [0, 0].", code: "def at_origin(p):\n    match p:\n        case [0, 0]:\n            return True\n        case _:\n            return False\n\nprint(at_origin([0, 0]), at_origin([1, 0]))", out: "True False" },
    { task: "Capture y when a point is on the y-axis [0, y].", code: "def y_of(p):\n    match p:\n        case [0, y]:\n            return y\n        case _:\n            return None\n\nprint(y_of([0, 7]))", out: "7" },
    { task: "Use a guard to label a number positive, zero or negative.", code: "def sign(n):\n    match n:\n        case n if n > 0:\n            return \"pos\"\n        case 0:\n            return \"zero\"\n        case _:\n            return \"neg\"\n\nprint(sign(5), sign(0), sign(-2))", out: "pos zero neg" },
    { task: "Pull name out of a dict with a mapping pattern.", code: "def name_of(user):\n    match user:\n        case {\"name\": name}:\n            return name\n        case _:\n            return \"guest\"\n\nprint(name_of({\"name\": \"Freya\", \"age\": 21}))", out: "Freya" },
    { task: "Match a VIP user (name present and vip True).", code: "def is_vip(user):\n    match user:\n        case {\"vip\": True}:\n            return \"vip\"\n        case _:\n            return \"regular\"\n\nprint(is_vip({\"name\": \"Om\", \"vip\": True}), is_vip({\"name\": \"Om\"}))", out: "vip regular" },
    { task: "Split a list into first and rest with <code>*rest</code>.", code: "def split(items):\n    match items:\n        case [first, *rest]:\n            return first, rest\n        case _:\n            return None, []\n\nprint(split([1, 2, 3]))", out: "(1, [2, 3])" },
  ]},

  { t: "mistakes", items: [
    { bad: "match code:\n    case _:\n        return \"unknown\"\n    case 200:\n        return \"OK\"", why: "<code>case _</code> matches everything, so any case after it is dead code — Python never reaches <code>case 200</code>. The wildcard must come <b>last</b>.", fix: "match code:\n    case 200:\n        return \"OK\"\n    case _:\n        return \"unknown\"" },
    { bad: "WEEKEND = \"Sat\"\nmatch day:\n    case WEEKEND:\n        return \"weekend\"\n    case _:\n        return \"weekday\"", why: "A bare name is a capture, not a comparison — and here it makes <code>case _</code> unreachable, so Python raises <code>SyntaxError: name capture makes remaining patterns unreachable</code>. Use a guard to compare against the variable.", fix: "WEEKEND = \"Sat\"\nmatch day:\n    case d if d == WEEKEND:\n        return \"weekend\"\n    case _:\n        return \"weekday\"" },
    { bad: "match command.split():\n    case [\"go\", direction]:\n        move(direction)\n    case ['go']:\n        print(\"go where?\")", why: "Not wrong, but the order is fragile: put the two-element case first only if you mean it to win. Here it is fine, but if you swap them, <code>[\"go\"]</code> would be shadowed. Always order specific-to-general.", fix: "match command.split():\n    case [\"go\"]:\n        print(\"go where?\")\n    case [\"go\", direction]:\n        move(direction)" },
    { bad: "match point:\n    if point == [0, 0]:\n        return \"origin\"", why: "You cannot put an <code>if</code> statement directly inside <code>match</code>. The body of a match is made of <code>case</code> clauses; a condition attaches to a case with a guard, not a bare <code>if</code>.", fix: "match point:\n    case [0, 0]:\n        return \"origin\"" },
  ]},

  { t: "debug", intro: "A function is meant to flag only the weekend day stored in a constant. Instead it calls every day a weekend. It runs without error. Read it before opening the fix.", code: "WEEKEND = \"Sun\"\n\ndef classify(day):\n    match day:\n        case WEEKEND:\n            return \"weekend\"\n    return \"weekday\"\n\nprint(classify(\"Mon\"))\nprint(classify(\"Sun\"))", symptom: "prints weekend for BOTH Mon and Sun", q: "WEEKEND is 'Sun', so how does 'Mon' match case WEEKEND and come back as a weekend?", fix: "WEEKEND = \"Sun\"\n\ndef classify(day):\n    match day:\n        case d if d == WEEKEND:\n            return \"weekend\"\n    return \"weekday\"\n\nprint(classify(\"Mon\"))\nprint(classify(\"Sun\"))", why: "<code>case WEEKEND:</code> is not a comparison. A bare name in a pattern is a <b>capture</b>: it matches <b>any</b> value and binds it to that name — so it behaves like <code>case anything:</code> and always succeeds, quietly rebinding <code>WEEKEND</code> to whatever <code>day</code> was. That is why every input, Monday included, returns \"weekend\".<br/><br/>To compare a value against a variable you need a <b>guard</b>: <code>case d if d == WEEKEND</code> captures the day as <code>d</code>, then tests it. (Matching against a literal like <code>case \"Sun\"</code> or a dotted constant like <code>case Weekday.SUN</code> also works, because those are value patterns, not captures.) This trap is common enough that Python will even raise a SyntaxError if a bare-name case is followed by other cases — but with a fall-through <code>return</code> like this one, it fails silently instead." },

  { t: "recap", items: [
    "<code>match value:</code> then <code>case pattern:</code> — the <b>first</b> matching case runs (Python 3.10+)",
    "<code>|</code> lists alternatives in one case; <code>case _</code> is the catch-all — put it <b>last</b>",
    "Patterns match <b>shape</b>: <code>case [x, y]</code>, <code>case {\"name\": n}</code> — and capture the parts",
    "Add a condition with a guard: <code>case [x, y] if x == y</code>",
    "A <b>bare name</b> captures anything and binds it — it does NOT compare",
    "To match a variable's value, use a guard, a literal, or a dotted name",
    "Great for parsing JSON/API shapes — one pattern tests structure and extracts fields",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is <code>match-case</code> and when was it added?", a: "It is Python's structural pattern matching, added in 3.10. It compares a subject value against a series of <code>case</code> patterns and runs the block of the first that matches, with <code>case _</code> as the catch-all. It reads like a switch but does much more, because patterns can match the structure of data, not just equality." },
    { level: "beginner", q: "How do you write a default case, and where does it go?", a: "<code>case _</code> is the wildcard default — the underscore matches anything. It has to be the last case, because it always matches, so any case placed after it would be unreachable. Cases are tried top to bottom and the first match wins, so you order them specific-to-general with the catch-all at the bottom." },
    { level: "intermediate", q: "How is <code>match</code> more powerful than a switch statement?", a: "It matches structure, not just values. A single case can require a list of a certain length, a dict with certain keys, or a particular class, and bind the interesting parts to names in the process — <code>case [x, y]</code> or <code>case {\"name\": n}</code>. You can also attach a guard, <code>case [x, y] if x == y</code>. A switch only tests equality against constants; match does destructuring plus conditions." },
    { level: "intermediate", q: "What is the capture trap in pattern matching?", a: "A bare name in a pattern is a capture, not a comparison: <code>case WEEKEND</code> matches any value and binds it to <code>WEEKEND</code>, rather than testing equality against the existing variable. To compare against a value you use a literal, a dotted name (<code>case Color.RED</code>), or a guard (<code>case x if x == WEEKEND</code>). Python guards against the obvious form by raising a SyntaxError when a bare-name case is followed by others." },
    { level: "intermediate", q: "Does a dict pattern require an exact key match?", a: "No — a mapping pattern matches if the required keys are present, and it ignores any extra keys. So <code>case {\"name\": n}</code> matches a dict that also has an <code>age</code>, an <code>email</code>, and so on. That makes it well suited to API payloads, which often carry more fields than you care about; you match on the ones you need and let the rest through." },
  ]},
];
const L23 = [
  { t: "objectives", items: [
    "Accept any number of arguments with <code>*args</code> (a tuple) and <code>**kwargs</code> (a dict)",
    "Unpack a list or dict <b>into</b> a call with <code>*</code> and <code>**</code>",
    "Write a recursive function with a <b>base case</b> that stops it",
    "See a recursive call as a stack that builds up, then unwinds",
    "Avoid the mutable-default-argument trap — the most famous function bug",
  ]},
  { t: "hook", q: "You write <code>def add_item(item, cart=[]):</code> that appends an item to a fresh cart and returns it. The first call gives <code>['apple']</code>. The second call, with a different item, gives <code>['apple', 'banana']</code> — the apple from the <b>last</b> call is still there. Where is it hiding?", why: "In the default value itself. <code>cart=[]</code> is evaluated <b>once</b>, when the function is defined — not each time it is called. So every call that relies on the default shares the <b>same one list</b>, and it keeps everything ever appended to it. It is the single most famous trap in Python, and the fix is a one-line habit." },
  { t: "think", q: "<code>def total(*args)</code> — what type is <code>args</code> inside the function when you call <code>total(1, 2, 3)</code>?", a: "A <b>tuple</b>: <code>(1, 2, 3)</code>. The <code>*</code> gathers however many positional arguments you pass into one tuple, so <code>len(args)</code> is 3 and you can loop over it or call <code>sum(args)</code>.<br/><br/>Its partner <code>**kwargs</code> does the same for named arguments, but collects them into a <b>dict</b> — <code>{\"x\": 10}</code> for a call like <code>f(x=10)</code>. One star for positional, two for keyword." },

  { t: "h2", n: "1", text: "*args and **kwargs" },
  { t: "def", term: "*args and **kwargs", en: "In a function definition, *args collects any extra positional arguments into a tuple, and **kwargs collects any extra keyword arguments into a dictionary.", hi: "In plain words: <code>*args</code> se function kitne bhi positional arguments le sakta hai (tuple ban jaate hain), <code>**kwargs</code> se kitne bhi named (dict ban jaate hain)." },
  { t: "p", html: "The names <code>args</code> and <code>kwargs</code> are just convention — the <code>*</code> and <code>**</code> do the work. Order in the signature is fixed: normal parameters, then <code>*args</code>, then <code>**kwargs</code>." },
  { t: "code", file: "args.py", code: "def describe(*args, **kwargs):\n    print(\"positional:\", args)\n    print(\"named:\", kwargs)\n\ndescribe(1, 2, 3, name=\"Freya\", age=21)", output: "positional: (1, 2, 3)\nnamed: {'name': 'Freya', 'age': 21}" },
  { t: "code", file: "mix.py", code: "def order(first, *rest, **opts):\n    return first, rest, opts\n\nprint(order(1, 2, 3, debug=True))", output: "(1, (2, 3), {'debug': True})" },
  { t: "note", variant: "tip", html: "<b>Why it matters:</b> <code>print</code> itself is <code>print(*args, sep=' ', end='\\n')</code> — that is how it takes any number of things to print. Wrappers and decorators use <code>*args, **kwargs</code> to accept <b>whatever</b> the wrapped function takes and pass it straight through." },

  { t: "h2", n: "2", text: "Unpacking: the star on the call side" },
  { t: "p", html: "The same stars work in reverse. At a <b>call</b>, <code>*</code> spreads a list into positional arguments and <code>**</code> spreads a dict into keyword arguments." },
  { t: "code", file: "unpack.py", code: "def point(x, y, z):\n    return f\"({x}, {y}, {z})\"\n\ncoords = [1, 2, 3]\nprint(point(*coords))         # spread the list\n\nvals = {\"x\": 4, \"y\": 5, \"z\": 6}\nprint(point(**vals))          # spread the dict by name", output: "(1, 2, 3)\n(4, 5, 6)" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> unpacking is everywhere in real code. You build a dict of options and splat it into a function — <code>plot(**config)</code> — or forward arguments through a wrapper with <code>func(*args, **kwargs)</code>. In data work you will unpack rows and configuration dicts constantly; it keeps calls short and lets settings live in one place." },

  { t: "h2", n: "3", text: "Recursion: a function that calls itself" },
  { t: "def", term: "Recursion", en: "Recursion is when a function solves a problem by calling itself on a smaller version of it, stopping at a base case that can be answered directly.", hi: "In plain words: function khud ko chhoti problem pe call karta hai, jab tak ek <b>base case</b> na aa jaye jise seedha answer de sakein." },
  { t: "p", html: "Every recursion needs two things: a <b>base case</b> that returns without recursing, and a step that moves <b>towards</b> it. Miss the base case and it never stops — <code>RecursionError</code>." },
  { t: "code", file: "factorial.py", code: "def factorial(n):\n    if n <= 1:            # base case - stops here\n        return 1\n    return n * factorial(n - 1)   # steps towards the base\n\nprint(factorial(5))", output: "120" },
  { t: "viz", name: "recursion-lab" },
  { t: "p", html: "Step through that panel. The calls <b>pile up unfinished</b> — each <code>factorial(n)</code> is stuck waiting on <code>factorial(n-1)</code> — until the base case returns 1, and only then do the answers flow back up, multiplying at each step: 1, 2, 6, 24." },
  { t: "analogy", concept: "Recursion", real: "Nested Russian dolls", html: "Opening recursion is like a stack of Russian dolls. You keep opening each doll to get to the one inside — that is the recursive call going <b>down</b> — until you reach the tiny solid doll that does not open: the <b>base case</b>. Then you close them back up one by one, each doll now holding its answer — that is the stack <b>unwinding</b>. Forget the solid doll and you would open forever; forget the base case and recursion never stops." },

  { t: "h2", n: "4", text: "The mutable default trap" },
  { t: "p", html: "A default argument is evaluated <b>once</b>, when the function is defined — not on every call. So a mutable default like <code>[]</code> or <code>{}</code> is <b>shared</b> across all calls, and it remembers everything." },
  { t: "code", file: "trap.py", code: "def add_item(item, cart=[]):    # the [] is created ONCE\n    cart.append(item)\n    return cart\n\nprint(add_item(\"apple\"))\nprint(add_item(\"banana\"))   # apple is still here!", output: "['apple']\n['apple', 'banana']" },
  { t: "note", variant: "warn", html: "<b>The fix is always the same:</b> default to <code>None</code>, then make the real object inside. <code>def add_item(item, cart=None): if cart is None: cart = []</code>. Now every call that does not pass a cart gets a fresh one. Use this any time a default would be a list, dict, or set." },

  { t: "trace", intro: "Args collection, unpacking, and one recursion. Work out each value.", code: "def collect(*args):\n    return len(args)\n\ndef power(base, exp):\n    return base ** exp\n\ndef countdown(n):\n    if n == 0:\n        return \"done\"\n    return countdown(n - 1)\n\na = collect(4, 5, 6)\nvals = [2, 10]\nb = power(*vals)\nc = countdown(3)", steps: [
    { q: "After line 14, <code>a</code> is", answer: "3", why: "<code>*args</code> gathered the three arguments into a tuple, and <code>len</code> of it is 3." },
    { q: "After line 16, <code>b</code> is", answer: "1024", why: "<code>*vals</code> spread <code>[2, 10]</code> into <code>power(2, 10)</code>, which is 2 to the 10th — 1024." },
    { q: "After line 17, <code>c</code> is", answer: "done", why: "<code>countdown</code> calls itself with n-1 until n hits 0, the base case, which returns \"done\"." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Sum any number of arguments with <code>*args</code>.", code: "def total(*args):\n    return sum(args)\n\nprint(total(1, 2, 3, 4))", out: "10" },
    { task: "Collect named arguments and return the dict.", code: "def opts(**kwargs):\n    return kwargs\n\nprint(opts(a=1, b=2))", out: "{'a': 1, 'b': 2}" },
    { task: "Count how many positional arguments were passed.", code: "def count(*args):\n    return len(args)\n\nprint(count(10, 20, 30))", out: "3" },
    { task: "Unpack a list into a three-argument function.", code: "def add3(a, b, c):\n    return a + b + c\n\nnums = [4, 5, 6]\nprint(add3(*nums))", out: "15" },
    { task: "Unpack a dict into keyword arguments.", code: "def greet(name, city):\n    return f\"{name} from {city}\"\n\ninfo = {\"name\": \"Freya\", \"city\": \"Delhi\"}\nprint(greet(**info))", out: "Freya from Delhi" },
    { task: "Write factorial with recursion.", code: "def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(5))", out: "120" },
    { task: "Sum numbers from n down to 1 recursively.", code: "def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)\n\nprint(sum_to(5))", out: "15" },
    { task: "Recursively count down to a base case.", code: "def down(n):\n    if n == 0:\n        return \"liftoff\"\n    return down(n - 1)\n\nprint(down(4))", out: "liftoff" },
    { task: "Fix the mutable default: give each call a fresh list.", code: "def add(item, cart=None):\n    if cart is None:\n        cart = []\n    cart.append(item)\n    return cart\n\nprint(add(\"a\"))\nprint(add(\"b\"))", out: "['a']\n['b']" },
    { task: "Mix a normal parameter with <code>*args</code>.", code: "def scale(factor, *nums):\n    return [factor * n for n in nums]\n\nprint(scale(2, 1, 2, 3))", out: "[2, 4, 6]" },
  ]},

  { t: "mistakes", items: [
    { bad: "def add_item(item, cart=[]):\n    cart.append(item)\n    return cart", why: "The <code>[]</code> is made once at definition, so every call shares it and it accumulates across calls. The fix is to default to <code>None</code> and build the list inside.", fix: "def add_item(item, cart=None):\n    if cart is None:\n        cart = []\n    cart.append(item)\n    return cart" },
    { bad: "def countdown(n):\n    print(n)\n    countdown(n - 1)", why: "There is no base case, so it recurses forever and dies with <code>RecursionError</code>. Every recursion needs a condition that returns <b>without</b> recursing.", fix: "def countdown(n):\n    if n < 0:\n        return\n    print(n)\n    countdown(n - 1)" },
    { bad: "def f(**kwargs, *args):\n    pass", why: "The order is wrong — <code>**kwargs</code> must come <b>last</b>. The signature order is fixed: normal parameters, then <code>*args</code>, then <code>**kwargs</code>. This is a <code>SyntaxError</code>.", fix: "def f(*args, **kwargs):\n    pass" },
    { bad: "nums = [1, 2, 3]\ntotal = sum(nums)\nresult = add3(nums)", why: "Passing the list itself sends <b>one</b> argument (the list) where three are expected. To spread its items into separate arguments you need the star: <code>add3(*nums)</code>.", fix: "nums = [1, 2, 3]\nresult = add3(*nums)" },
  ]},

  { t: "debug", intro: "A helper builds a shopping cart, one call per customer. Each customer should start empty — but the second customer somehow inherits the first one's items. It runs without error. Read it before opening the fix.", code: "def new_cart(item, cart=[]):\n    cart.append(item)\n    return cart\n\nalice = new_cart(\"apple\")\nbob = new_cart(\"banana\")\n\nprint(\"alice:\", alice)\nprint(\"bob:\", bob)", symptom: "bob's cart is ['apple', 'banana'] — it has alice's apple", q: "Each call passes only its own item and no cart. So how does bob's cart already contain alice's apple?", fix: "def new_cart(item, cart=None):\n    if cart is None:\n        cart = []\n    cart.append(item)\n    return cart\n\nalice = new_cart(\"apple\")\nbob = new_cart(\"banana\")\n\nprint(\"alice:\", alice)\nprint(\"bob:\", bob)", why: "The default <code>cart=[]</code> is created a <b>single time</b>, when the function is defined — not once per call. Every call that does not supply its own cart reuses that one shared list, so alice's <code>append</code> and bob's <code>append</code> both land in it. By bob's turn it already holds <code>\"apple\"</code>.<br/><br/>Worse, <code>alice</code> and <code>bob</code> are now the <b>same list object</b>, so a later change to one silently changes the other. The rule: never use a mutable value (<code>[]</code>, <code>{}</code>, <code>set()</code>) as a default. Default to <code>None</code> and create the real object inside the function, which guarantees each call gets its own." },

  { t: "recap", items: [
    "<code>*args</code> collects extra positional arguments into a <b>tuple</b>",
    "<code>**kwargs</code> collects extra keyword arguments into a <b>dict</b>",
    "Signature order is fixed: normal params, then <code>*args</code>, then <code>**kwargs</code>",
    "At a call, <code>*list</code> and <code>**dict</code> <b>unpack</b> into arguments",
    "Recursion needs a <b>base case</b> that returns without recursing — miss it and get <code>RecursionError</code>",
    "The stack builds up on the way down, then unwinds with the answers on the way up",
    "<b>Never</b> use <code>[]</code> or <code>{}</code> as a default — default to <code>None</code> and build it inside",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What do <code>*args</code> and <code>**kwargs</code> do?", a: "In a function definition, <code>*args</code> collects any extra positional arguments into a tuple and <code>**kwargs</code> collects any extra keyword arguments into a dict, so the function can accept a variable number of each. The names are convention; the <code>*</code> and <code>**</code> are what matter. They are essential for writing wrappers that accept and forward whatever arguments the wrapped function takes." },
    { level: "beginner", q: "What is a base case in recursion and why is it required?", a: "The base case is the condition under which the function returns an answer directly, without calling itself. It is what stops the recursion. Without one, the function calls itself endlessly and Python eventually raises <code>RecursionError</code> when the call stack exceeds its limit (about 1000 frames by default). Every recursive function needs a base case and a step that moves towards it." },
    { level: "intermediate", q: "Explain the mutable default argument problem.", a: "A default argument is evaluated once, when the function is defined, and that single object is reused on every call that relies on the default. So a default like <code>cart=[]</code> is one shared list across all calls, accumulating state and causing separate calls to affect each other. The fix is to default to <code>None</code> and create the mutable object inside the function body, guaranteeing a fresh one per call." },
    { level: "intermediate", q: "What is the difference between <code>*</code> in a definition versus in a call?", a: "In a definition, <code>*args</code> <b>collects</b> loose positional arguments into a tuple. In a call, <code>*iterable</code> does the reverse — it <b>spreads</b> a list or tuple out into separate positional arguments. Likewise <code>**</code> collects keyword arguments into a dict in a definition, and unpacks a dict into keyword arguments in a call. Same symbols, opposite directions." },
    { level: "intermediate", q: "When is recursion a good choice, and when is it not?", a: "Recursion shines on problems with a naturally nested or tree-like structure — traversing a file system, walking a JSON tree, divide-and-conquer algorithms — where it mirrors the shape of the data and reads cleanly. It is a poor choice when a simple loop would do, because each call adds a stack frame: deep recursion risks <code>RecursionError</code> and is slower, and naive recursive Fibonacci recomputes the same values exponentially. For linear repetition, prefer a loop; reach for recursion when the problem itself is recursive." },
  ]},
];
const L24 = [
  { t: "objectives", items: [
    "Make one class inherit another with <code>class Child(Parent)</code>",
    "Override a method — and know the child's version wins",
    "Call the parent from the child with <code>super()</code>",
    "See why a child <code>__init__</code> must call <code>super().__init__()</code>",
    "Test type with <code>isinstance</code> — a Dog is also an Animal",
  ]},
  { t: "hook", q: "Your <code>Dog</code> class inherits <code>Animal</code>. You give <code>Dog</code> its own <code>__init__</code> to store the breed. Now <code>dog.describe()</code> — a method you did not touch, inherited straight from Animal — crashes with <code>AttributeError: 'Dog' object has no attribute 'name'</code>. You never removed name. Where did it go?", why: "It was never set. Writing a new <code>__init__</code> in <code>Dog</code> <b>replaces</b> Animal's — it does not add to it — so Animal's <code>__init__</code>, the one that does <code>self.name = name</code>, never runs. The fix is one line: <code>super().__init__(name)</code>, which calls the parent's setup before you add your own. Override <code>__init__</code> and you take responsibility for the parent's too." },
  { t: "think", q: "If <code>Dog</code> inherits <code>Animal</code>, and both define <code>speak()</code>, which one runs when you call <code>dog.speak()</code>?", a: "Dog's. Python looks for a method on the <b>child first</b>, and only walks up to the parent if the child does not have it. Since <code>Dog</code> defines its own <code>speak()</code>, that one wins — the parent's is shadowed.<br/><br/>This is what override means: the child's version replaces the parent's <b>for that method only</b>. Every other method the child did not redefine is still inherited unchanged." },

  { t: "h2", n: "1", text: "Inheriting and overriding" },
  { t: "def", term: "Inheritance", en: "Inheritance lets a child class reuse a parent class's attributes and methods, adding or replacing only what differs, so shared behaviour is written once.", hi: "In plain words: <code>class Dog(Animal)</code> likhne se Dog ko Animal ke saare methods mil jaate hain — dobara likhne ki zaroorat nahi. Jo alag chahiye sirf wahi likho." },
  { t: "p", html: "<code>class Child(Parent):</code> gives the child everything the parent has. Redefine a method in the child and it <b>overrides</b> the parent's; leave it out and it is <b>inherited</b> as-is." },
  { t: "code", file: "override.py", code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"some sound\"\n    def describe(self):\n        return f\"{self.name} is an animal\"\n\nclass Dog(Animal):\n    def speak(self):                 # override\n        return f\"{self.name} says woof\"\n\nd = Dog(\"Bruno\")\nprint(d.speak())        # Dog's version\nprint(d.describe())     # inherited from Animal", output: "Bruno says woof\nBruno is an animal" },
  { t: "viz", name: "inheritance-lab" },
  { t: "p", html: "In that panel, <code>speak()</code> is found on <b>Dog</b> (overridden), while <code>describe()</code> falls through to <b>Animal</b> (inherited). Python always checks the child first and stops at the first place the name exists." },

  { t: "h2", n: "2", text: "super(): calling the parent" },
  { t: "p", html: "<code>super()</code> reaches the parent's version of a method. The most important use is in <code>__init__</code>: run the parent's setup, then add the child's." },
  { t: "code", file: "super.py", code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)     # run Animal's __init__ first\n        self.breed = breed         # then add Dog's own\n\nd = Dog(\"Bruno\", \"Lab\")\nprint(d.name, d.breed)", output: "Bruno Lab" },
  { t: "note", variant: "warn", html: "<b>If a child defines <code>__init__</code>, it must call <code>super().__init__(...)</code></b> — otherwise the parent's <code>__init__</code> never runs and the attributes it would set (like <code>name</code>) simply do not exist. This is the number-one inheritance bug, and it surfaces later, as an <code>AttributeError</code> in some inherited method." },
  { t: "analogy", concept: "super() in __init__", real: "Building on a foundation", html: "A parent's <code>__init__</code> lays the <b>foundation</b> — it sets up <code>name</code> and whatever else every animal needs. When <code>Dog</code> writes its own <code>__init__</code> to add a breed, it is building a room on that foundation. <code>super().__init__(name)</code> is pouring the foundation <b>first</b>. Skip it and you are building a room on bare ground — it looks fine until someone leans on <code>self.name</code> and the whole thing falls through." },

  { t: "h2", n: "3", text: "super() to extend, not just replace" },
  { t: "p", html: "<code>super()</code> also lets a child <b>build on</b> a parent's method instead of fully replacing it — call the parent's version, then add to its result." },
  { t: "code", file: "extend.py", code: "class Animal:\n    def speak(self):\n        return \"some sound\"\n\nclass Puppy(Animal):\n    def speak(self):\n        return super().speak() + \" (but tiny)\"\n\nprint(Puppy().speak())", output: "some sound (but tiny)" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> inheritance models an <b>is-a</b> relationship — a Dog <i>is an</i> Animal — and it is how frameworks let you customise their behaviour. You subclass a base <code>Model</code>, <code>Exception</code>, or <code>TestCase</code> and override one or two methods while inheriting the rest. In data science you will subclass scikit-learn estimators and custom exception types the same way. Prefer <b>composition</b> (an object holding another) when the relationship is really <i>has-a</i>, not <i>is-a</i>." },

  { t: "h2", n: "4", text: "isinstance: a Dog is an Animal" },
  { t: "p", html: "Because a child <b>is a</b> kind of its parent, <code>isinstance</code> against either class is True. This is what lets a function written for <code>Animal</code> accept any subclass." },
  { t: "code", file: "isinstance.py", code: "class Animal: pass\nclass Dog(Animal): pass\n\nd = Dog()\nprint(isinstance(d, Dog))       # yes, obviously\nprint(isinstance(d, Animal))    # yes - a Dog IS an Animal\nprint(isinstance(Animal(), Dog))  # no - an Animal is not a Dog", output: "True\nTrue\nFalse" },

  { t: "trace", intro: "Override, inherit, and super. Work out each value.", code: "class Base:\n    def __init__(self, x):\n        self.x = x\n    def show(self):\n        return f\"base {self.x}\"\n\nclass Child(Base):\n    def show(self):\n        return f\"child {self.x}\"\n\nc = Child(5)\na = c.show()\nb = isinstance(c, Base)\nd = c.x", steps: [
    { q: "After line 12, <code>a</code> is", answer: "child 5", why: "Child overrides <code>show()</code>, so its version runs — and <code>self.x</code> is 5, set by the inherited __init__." },
    { q: "After line 13, <code>b</code> is", answer: "True", why: "A Child is a Base, so <code>isinstance(c, Base)</code> is True." },
    { q: "After line 14, <code>d</code> is", answer: "5", why: "Child has no __init__, so it inherited Base's, which set <code>self.x = 5</code>." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make Dog inherit Animal and inherit its method.", code: "class Animal:\n    def speak(self):\n        return \"sound\"\n\nclass Dog(Animal):\n    pass\n\nprint(Dog().speak())", out: "sound" },
    { task: "Override speak() in Dog.", code: "class Animal:\n    def speak(self):\n        return \"sound\"\n\nclass Dog(Animal):\n    def speak(self):\n        return \"woof\"\n\nprint(Dog().speak())", out: "woof" },
    { task: "Use super().__init__ to set an inherited attribute.", code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed\n\nd = Dog(\"Bruno\", \"Lab\")\nprint(d.name, d.breed)", out: "Bruno Lab" },
    { task: "Call an inherited method that uses an inherited attribute.", code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def describe(self):\n        return f\"{self.name}\"\n\nclass Cat(Animal):\n    pass\n\nprint(Cat(\"Kitty\").describe())", out: "Kitty" },
    { task: "Extend a parent method with super().", code: "class Animal:\n    def speak(self):\n        return \"sound\"\n\nclass Puppy(Animal):\n    def speak(self):\n        return super().speak() + \"!\"\n\nprint(Puppy().speak())", out: "sound!" },
    { task: "Check that a Dog is an Animal.", code: "class Animal:\n    pass\n\nclass Dog(Animal):\n    pass\n\nprint(isinstance(Dog(), Animal))", out: "True" },
    { task: "Show a parent is NOT an instance of its child.", code: "class Animal:\n    pass\n\nclass Dog(Animal):\n    pass\n\nprint(isinstance(Animal(), Dog))", out: "False" },
    { task: "Inherit an attribute set in the parent __init__.", code: "class Vehicle:\n    def __init__(self):\n        self.wheels = 4\n\nclass Car(Vehicle):\n    pass\n\nprint(Car().wheels)", out: "4" },
    { task: "Override one method, inherit another.", code: "class Shape:\n    def name(self):\n        return \"shape\"\n    def sides(self):\n        return 0\n\nclass Square(Shape):\n    def sides(self):\n        return 4\n\ns = Square()\nprint(s.name(), s.sides())", out: "shape 4" },
    { task: "Use issubclass to check the class relationship.", code: "class Animal:\n    pass\n\nclass Dog(Animal):\n    pass\n\nprint(issubclass(Dog, Animal))", out: "True" },
  ]},

  { t: "mistakes", items: [
    { bad: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, breed):\n        self.breed = breed\n\nd = Dog(\"Lab\")\nprint(d.name)", why: "Dog's __init__ replaced Animal's and never called <code>super().__init__</code>, so <code>self.name</code> was never set — <code>AttributeError</code>. Call the parent's init first.", fix: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed\n\nd = Dog(\"Bruno\", \"Lab\")\nprint(d.name)" },
    { bad: "class Dog(Animal):\n    def speak(self):\n        return Animal.speak() + \" woof\"", why: "Calling <code>Animal.speak()</code> with no instance skips <code>self</code>. Use <code>super().speak()</code>, which passes the current instance automatically.", fix: "class Dog(Animal):\n    def speak(self):\n        return super().speak() + \" woof\"" },
    { bad: "class Dog extends Animal:\n    pass", why: "<code>extends</code> is Java, not Python. Python puts the parent in parentheses after the class name.", fix: "class Dog(Animal):\n    pass" },
    { bad: "class Animal:\n    def __init__(self, name):\n        name = name", why: "<code>name = name</code> just reassigns the local parameter to itself — it never stores anything on the object. Attributes must be set on <code>self</code>.", fix: "class Animal:\n    def __init__(self, name):\n        self.name = name" },
  ]},

  { t: "debug", intro: "A BankAccount base class sets the balance; a SavingsAccount adds an interest rate. Creating a savings account works, but reading its balance crashes. Read it before opening the fix.", code: "class BankAccount:\n    def __init__(self, balance):\n        self.balance = balance\n\nclass SavingsAccount(BankAccount):\n    def __init__(self, balance, rate):\n        self.rate = rate\n\ns = SavingsAccount(1000, 0.05)\nprint(\"rate:\", s.rate)\nprint(\"balance:\", s.balance)", symptom: "AttributeError: 'SavingsAccount' object has no attribute 'balance'", q: "SavingsAccount was created with a balance of 1000. So why does reading s.balance say it does not exist?", fix: "class BankAccount:\n    def __init__(self, balance):\n        self.balance = balance\n\nclass SavingsAccount(BankAccount):\n    def __init__(self, balance, rate):\n        super().__init__(balance)\n        self.rate = rate\n\ns = SavingsAccount(1000, 0.05)\nprint(\"rate:\", s.rate)\nprint(\"balance:\", s.balance)", why: "Defining <code>__init__</code> in <code>SavingsAccount</code> <b>replaced</b> the parent's — it did not extend it. So <code>BankAccount.__init__</code>, the only place <code>self.balance</code> is ever set, never ran. The 1000 was passed in and then dropped on the floor, because nothing assigned it.<br/><br/>The rate works because <code>SavingsAccount.__init__</code> sets it directly; the balance fails because it belongs to the parent's setup. <code>super().__init__(balance)</code> runs the parent's __init__ first, storing the balance, and then the child adds its rate. The rule: whenever a subclass writes its own <code>__init__</code>, it is responsible for calling the parent's." },

  { t: "recap", items: [
    "<code>class Child(Parent):</code> — the child inherits the parent's methods and attributes",
    "Redefine a method to <b>override</b> it; the child's version wins for that method only",
    "Python looks on the <b>child first</b>, then walks up to the parent",
    "<code>super().__init__(...)</code> runs the parent's setup — required when the child defines <code>__init__</code>",
    "<code>super().method()</code> also lets you <b>extend</b> a parent method, not just replace it",
    "A child <b>is a</b> parent, so <code>isinstance(child, Parent)</code> is True",
    "Miss <code>super().__init__</code> and inherited methods crash with <code>AttributeError</code> later",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is inheritance and why use it?", a: "Inheritance lets one class, the child, reuse the attributes and methods of another, the parent, so shared behaviour is written once and specialised where it differs. You write <code>class Dog(Animal)</code> and Dog gets everything Animal has, overriding only what should behave differently. It models an <b>is-a</b> relationship and reduces duplication." },
    { level: "beginner", q: "What does it mean to override a method?", a: "It means the child class defines a method with the same name as one in the parent, and the child's version runs for instances of the child. Python resolves methods by looking at the child's class first and walking up to the parent only if it is not found, so the override shadows the parent's version for that one method while everything else stays inherited." },
    { level: "intermediate", q: "What does <code>super()</code> do, and why is it important in <code>__init__</code>?", a: "<code>super()</code> gives access to the parent class's methods from within the child. In <code>__init__</code> it is essential: defining an <code>__init__</code> in the child replaces the parent's entirely, so the parent's initialisation — the code that sets its attributes — will not run unless you call <code>super().__init__(...)</code>. Skip it and any attribute the parent was supposed to set is missing, which later surfaces as an AttributeError." },
    { level: "intermediate", q: "How does Python decide which method to run on an object?", a: "It follows the Method Resolution Order (MRO) — the chain from the object's class up through its parents to <code>object</code>. For a call like <code>d.speak()</code> Python checks Dog, then Animal, then object, and runs the first <code>speak</code> it finds. You can inspect this chain with <code>Dog.__mro__</code>. With multiple inheritance the MRO also determines which parent's method wins." },
    { level: "intermediate", q: "When should you prefer composition over inheritance?", a: "When the relationship is really <b>has-a</b> rather than <b>is-a</b>. A Car <i>has an</i> Engine, so the Car should hold an Engine object, not inherit from Engine. Inheritance couples the child tightly to the parent's implementation, so deep or inappropriate hierarchies become fragile; composition keeps the pieces independent and easier to change. A common guideline is to use inheritance only for genuine is-a relationships and reach for composition otherwise." },
  ]},
];
const L25 = [
  { t: "objectives", items: [
    "Hide a class's data behind methods — the point of <b>encapsulation</b>",
    "Tell the levels apart: public, <code>_protected</code>, <code>__private</code>",
    "Know that <code>__name</code> is <b>mangled</b>, not truly locked",
    "Expose a computed value as an attribute with <code>@property</code>",
    "Use one interface for many types — <b>polymorphism</b> and duck typing",
  ]},
  { t: "hook", q: "You mark a balance <code>self.__balance</code> — two underscores, private. Then in a <code>Savings</code> subclass you read <code>self.__balance</code> and get <code>AttributeError: 'Savings' object has no attribute '_Savings__balance'</code>. You never wrote that weird name. Where did it come from?", why: "Python <b>mangled</b> it. A name starting with two underscores is secretly rewritten to <code>_ClassName__name</code> — using the class where the code is <b>written</b>. In <code>Account</code> it became <code>_Account__balance</code>; in <code>Savings</code> the same <code>__balance</code> became <code>_Savings__balance</code>, which was never set. Double-underscore is not a lock — it is a rename to avoid clashes, and it bites when a subclass reaches for a parent's private name." },
  { t: "think", q: "If Python does not really stop you reading a private attribute, what is the point of encapsulation?", a: "Control, not secrecy. The value of hiding data behind a method is that <b>every</b> change goes through code you control — where you can validate it, keep two fields in sync, or log it.<br/><br/>A bank account that only changes through <code>deposit()</code> and <code>withdraw()</code> can refuse a negative amount or an overdraft. If the balance were public, any line anywhere could set it to nonsense and skip every check. Encapsulation is about protecting the <b>rules</b>, not locking the door." },

  { t: "h2", n: "1", text: "The three levels" },
  { t: "def", term: "Encapsulation", en: "Encapsulation is bundling data with the methods that operate on it, and restricting direct access so all changes go through those methods.", hi: "In plain words: data ko methods ke peeche rakho, taaki har badlav tumhare control me rahe — koi bahar se seedha ulta-seedha na kar de." },
  { t: "p", html: "Python marks intent with underscores: no underscore is <b>public</b>, one <code>_</code> means <b>protected</b> (internal — please don't), two <code>__</code> triggers <b>name mangling</b>." },
  { t: "code", file: "levels.py", code: "class Account:\n    def __init__(self):\n        self.owner = \"Freya\"      # public\n        self._bank = \"HDFC\"       # protected (convention)\n        self.__balance = 100      # private (mangled)\n    def balance(self):\n        return self.__balance\n\na = Account()\nprint(a.owner)                # fine\nprint(a._bank)                # works, but you shouldn't\nprint(a.balance())            # the intended way", output: "Freya\nHDFC\n100" },
  { t: "viz", name: "encapsulation-lab" },
  { t: "p", html: "Try each access in that panel. <code>a.__balance</code> fails, but <code>a._Account__balance</code> — the mangled name — still returns 100. Python's privacy is a speed bump, not a wall: it stops accidents, not determined access." },
  { t: "note", variant: "warn", html: "<b>Single vs double underscore.</b> One <code>_</code> is pure convention — nothing changes, it just signals \"internal\". Two <code>__</code> actually renames the attribute to <code>_ClassName__name</code>. Use one <code>_</code> for \"protected\" so subclasses can still see it; reach for <code>__</code> only when you specifically want to avoid a name clash with a subclass." },

  { t: "h2", n: "2", text: "Why hide it: the validated setter" },
  { t: "p", html: "The real payoff is that a method can <b>guard</b> the data. Route every change through <code>deposit</code> and it can reject anything that would break the rules." },
  { t: "code", file: "guard.py", code: "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        if amt <= 0:\n            raise ValueError(\"amount must be positive\")\n        self.__balance += amt\n    def balance(self):\n        return self.__balance\n\na = Account()\na.deposit(100)\nprint(a.balance())\ntry:\n    a.deposit(-50)          # blocked by the guard\nexcept ValueError as e:\n    print(\"rejected:\", e)", output: "100\nrejected: amount must be positive" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is why data classes expose methods, not raw fields. A validated setter keeps an object from ever holding an impossible state — a negative balance, an out-of-range date, a total that no longer matches its parts. When you later build a Pandas accessor or a model wrapper, the same instinct applies: guard the invariant in one place so callers cannot break it." },

  { t: "h2", n: "3", text: "@property: a method that reads like an attribute" },
  { t: "p", html: "Sometimes you want a computed value to look like a plain attribute — no parentheses. <code>@property</code> does exactly that: a method you call as if it were data." },
  { t: "code", file: "property.py", code: "class Circle:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def area(self):\n        return round(3.14159 * self._r ** 2, 2)\n\nc = Circle(5)\nprint(c.area)     # no parentheses - reads like an attribute", output: "78.54" },
  { t: "note", variant: "tip", html: "<code>@property</code> lets you start with a simple public attribute and later turn it into a computed or validated one <b>without changing how callers use it</b>. They still write <code>c.area</code>; you just moved logic behind it. That is encapsulation without ceremony." },

  { t: "h2", n: "4", text: "Polymorphism: one name, many types" },
  { t: "def", term: "Polymorphism", en: "Polymorphism is one interface working across different types — the same function, operator, or method name doing the right thing for whatever it is given.", hi: "In plain words: ek hi naam alag types pe alag sahi kaam kare. <code>len()</code> string aur list dono pe chalta hai; <code>+</code> numbers jodta hai par strings ko concatenate karta hai." },
  { t: "code", file: "poly.py", code: "print(len(\"cat\"), len([1, 2, 3, 4]))   # same len(), different types\nprint(3 + 4, \"ab\" + \"cd\")              # + adds, or concatenates\n\nclass Dog:\n    def speak(self): return \"woof\"\nclass Cat:\n    def speak(self): return \"meow\"\n\nfor a in [Dog(), Cat()]:\n    print(a.speak())                     # same call, right behaviour", output: "3 4\n7 abcd\nwoof\nmeow" },
  { t: "analogy", concept: "Polymorphism / duck typing", real: "\"If it quacks, it's a duck\"", html: "The loop over <code>[Dog(), Cat()]</code> never checks the type — it just calls <code>speak()</code> and trusts each object to answer. That is <b>duck typing</b>: \"if it walks like a duck and quacks like a duck, treat it as a duck\". Python does not ask <i>what</i> an object is, only whether it <i>can do</i> what you need. Any class with a <code>speak()</code> slots straight into that loop — no shared parent required." },

  { t: "trace", intro: "Levels, a guard, and a property. Work out each value.", code: "class Box:\n    def __init__(self, n):\n        self._n = n\n        self.__secret = n * 2\n    @property\n    def doubled(self):\n        return self.__secret\n    def reveal(self):\n        return self.__secret\n\nb = Box(5)\na = b._n\nc = b.doubled\nd = b.reveal()\ne = b._Box__secret", steps: [
    { q: "After line 13, <code>a</code> is", answer: "5", why: "<code>_n</code> is protected by convention only, so reading it from outside works and gives 5." },
    { q: "After line 14, <code>c</code> is", answer: "10", why: "<code>doubled</code> is a property, read without parentheses; it returns <code>__secret</code>, which is 5 × 2." },
    { q: "After line 15, <code>d</code> is", answer: "10", why: "<code>reveal()</code> is a normal method returning the same private value, 10." },
    { q: "After line 16, <code>e</code> is", answer: "10", why: "<code>__secret</code> was mangled to <code>_Box__secret</code>, and that name does work from outside — 10. Privacy is a speed bump." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make a private balance and read it through a method.", code: "class Account:\n    def __init__(self):\n        self.__balance = 50\n    def balance(self):\n        return self.__balance\n\nprint(Account().balance())", out: "50" },
    { task: "Reach a private attribute through its mangled name.", code: "class Account:\n    def __init__(self):\n        self.__balance = 50\n\na = Account()\nprint(a._Account__balance)", out: "50" },
    { task: "Read a protected (single _) attribute from outside.", code: "class Config:\n    def __init__(self):\n        self._debug = True\n\nprint(Config()._debug)", out: "True" },
    { task: "Guard a setter: reject a negative deposit.", code: "class Account:\n    def __init__(self):\n        self.__b = 0\n    def deposit(self, amt):\n        if amt <= 0:\n            return \"rejected\"\n        self.__b += amt\n        return self.__b\n\na = Account()\nprint(a.deposit(-5))", out: "rejected" },
    { task: "Expose a computed value with @property.", code: "class Square:\n    def __init__(self, side):\n        self._side = side\n    @property\n    def area(self):\n        return self._side ** 2\n\nprint(Square(4).area)", out: "16" },
    { task: "Show len() is polymorphic across types.", code: "print(len(\"hello\"), len([1, 2, 3]))", out: "5 3" },
    { task: "Show + behaves differently on numbers and strings.", code: "print(2 + 3, \"a\" + \"b\")", out: "5 ab" },
    { task: "Call the same method on two unrelated classes.", code: "class Dog:\n    def sound(self):\n        return \"woof\"\nclass Duck:\n    def sound(self):\n        return \"quack\"\n\nfor a in [Dog(), Duck()]:\n    print(a.sound())", out: "woof\nquack" },
    { task: "Total any deposits through a guarded method.", code: "class Wallet:\n    def __init__(self):\n        self.__total = 0\n    def add(self, x):\n        self.__total += x\n    def total(self):\n        return self.__total\n\nw = Wallet()\nfor x in [10, 20, 5]:\n    w.add(x)\nprint(w.total())", out: "35" },
    { task: "Use a property to format a full name.", code: "class Person:\n    def __init__(self, first, last):\n        self.first = first\n        self.last = last\n    @property\n    def full(self):\n        return f\"{self.first} {self.last}\"\n\nprint(Person(\"Freya\", \"T\").full)", out: "Freya T" },
  ]},

  { t: "mistakes", items: [
    { bad: "class Account:\n    def __init__(self, balance):\n        self.balance = balance   # public\n\na = Account(100)\na.balance = -9999             # anyone can wreck it", why: "A public balance can be set to anything from anywhere, skipping every rule. Make it private and change it only through a validated method.", fix: "class Account:\n    def __init__(self, balance):\n        self.__balance = balance\n    def withdraw(self, amt):\n        if amt > self.__balance:\n            raise ValueError(\"insufficient funds\")\n        self.__balance -= amt" },
    { bad: "class Circle:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def area(self):\n        return 3.14 * self._r ** 2\n\nc = Circle(5)\nprint(c.area())", why: "A <code>@property</code> is read like an attribute, <b>without</b> parentheses. <code>c.area()</code> tries to call the number it returns — <code>TypeError</code>. Write <code>c.area</code>.", fix: "c = Circle(5)\nprint(c.area)" },
    { bad: "class Savings(Account):\n    def show(self):\n        return self.__balance", why: "Inside <code>Savings</code>, <code>__balance</code> mangles to <code>_Savings__balance</code>, not the parent's <code>_Account__balance</code> — so it is not found. Use a single underscore for attributes subclasses must see.", fix: "class Account:\n    def __init__(self):\n        self._balance = 100   # protected, visible to subclasses\n\nclass Savings(Account):\n    def show(self):\n        return self._balance" },
    { bad: "class Dog:\n    def speak(self): return \"woof\"\nclass Cat:\n    def talk(self): return \"meow\"\n\nfor a in [Dog(), Cat()]:\n    print(a.speak())", why: "Polymorphism needs the <b>same</b> method name on each type. Cat has <code>talk</code>, not <code>speak</code>, so the loop hits <code>AttributeError</code>. Give them a shared method name.", fix: "class Dog:\n    def speak(self): return \"woof\"\nclass Cat:\n    def speak(self): return \"meow\"\n\nfor a in [Dog(), Cat()]:\n    print(a.speak())" },
  ]},

  { t: "debug", intro: "A Savings account inherits from Account and tries to print its balance. Creating it works, but printing the balance crashes with a strangely-named attribute. Read it before opening the fix.", code: "class Account:\n    def __init__(self, balance):\n        self.__balance = balance\n\nclass Savings(Account):\n    def show(self):\n        return self.__balance\n\ns = Savings(500)\nprint(s.show())", symptom: "AttributeError: 'Savings' object has no attribute '_Savings__balance'", q: "The balance was set in the parent's __init__. So why does the subclass look for '_Savings__balance', a name nobody wrote?", fix: "class Account:\n    def __init__(self, balance):\n        self._balance = balance\n\nclass Savings(Account):\n    def show(self):\n        return self._balance\n\ns = Savings(500)\nprint(s.show())", why: "A double-underscore name is mangled using the class where the code is <b>written</b>, not the object's runtime type. In <code>Account.__init__</code>, <code>self.__balance</code> became <code>_Account__balance</code>. But <code>Savings.show</code> is written inside <code>Savings</code>, so its <code>self.__balance</code> mangles to <code>_Savings__balance</code> — a different name that was never set, hence the AttributeError.<br/><br/>Name mangling exists precisely to keep a subclass's private names from colliding with a parent's, so by design a subclass cannot see the parent's <code>__private</code>. When you <b>want</b> subclasses to access an attribute, use a single underscore — <code>_balance</code> — which is protected by convention and not mangled. Reserve <code>__</code> for the rare case where you specifically want that isolation." },

  { t: "recap", items: [
    "Encapsulation = bundle data with methods, route every change through them",
    "No underscore = public · one <code>_</code> = protected (convention) · two <code>__</code> = name-mangled",
    "<code>__name</code> becomes <code>_ClassName__name</code> — reachable, so it is a speed bump, not a lock",
    "The real value is the <b>validated setter</b> — an object can never hold an impossible state",
    "<code>@property</code> makes a method read like an attribute (no parentheses)",
    "Polymorphism = one name across types: <code>len()</code>, <code>+</code>, a shared method",
    "Duck typing: Python checks what an object <b>can do</b>, not what it <b>is</b>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is encapsulation?", a: "Encapsulation is bundling an object's data together with the methods that operate on it, and restricting direct outside access so every change goes through those methods. The benefit is control: a validated method can reject bad input and keep the object in a consistent state, whereas a public field can be set to anything by any code. It is one of the core ideas of object-oriented design." },
    { level: "beginner", q: "What do one and two leading underscores mean on an attribute?", a: "A single underscore, like <code>_bank</code>, is a convention meaning \"internal, please don't touch\" — Python does nothing to enforce it. A double underscore, like <code>__balance</code>, triggers name mangling: the attribute is renamed to <code>_ClassName__balance</code>. That is not real privacy either — you can still reach the mangled name — but it prevents accidental clashes between a class and its subclasses." },
    { level: "intermediate", q: "Is anything in Python truly private?", a: "No. Python's model is \"we are all adults here\" — privacy is signalled by convention, not enforced. A single underscore is a hint; a double underscore is mangled to <code>_ClassName__name</code> but still accessible if you use that name. The intent is to prevent accidents and name collisions, not to lock data away. Code that respects the underscores is being polite, not obeying a rule." },
    { level: "intermediate", q: "What is a @property and why use one?", a: "A <code>@property</code> turns a method into something you read like a plain attribute, without parentheses. Its main value is evolution: you can expose a simple attribute now and later replace it with a computed or validated version behind the same name, so callers who write <code>obj.area</code> never change. You can also add a setter to validate assignments, giving controlled access with attribute-style syntax." },
    { level: "intermediate", q: "What is polymorphism, and how does duck typing relate to it?", a: "Polymorphism is one interface working across many types — the same operation doing the right thing for whatever it receives, like <code>len()</code> on a string or a list, or a shared <code>speak()</code> method on unrelated classes. Duck typing is Python's flavour of it: instead of checking an object's type, you just call the method you need and trust the object to support it — \"if it quacks like a duck\". Any object with the right methods fits, no common base class required." },
  ]},
];
const L26 = [
  { t: "objectives", items: [
    "Recognise that <code>len()</code>, <code>+</code>, <code>[]</code>, <code>==</code> secretly call <b>dunder</b> methods",
    "Give your class <code>__str__</code> and <code>__repr__</code> — and know which one runs where",
    "Make <code>==</code> compare values by defining <code>__eq__</code>",
    "Make an object behave like a container with <code>__len__</code>, <code>__getitem__</code>, <code>__contains__</code>",
    "Tell <code>@staticmethod</code> and <code>@classmethod</code> from a normal method",
  ]},
  { t: "hook", q: "You build two carts with the exact same items and check <code>cart_a == cart_b</code>. It says <code>False</code>. You are certain the contents match. Why does Python disagree?", why: "Because you never told it how to compare two carts. By default, <code>==</code> on your own objects falls back to <b>identity</b> — are these the same object in memory? — not value. Two separately-built carts are different objects, so <code>==</code> is False. Define <code>__eq__</code> and you decide what \"equal\" means: same items. Almost every built-in operator works this way — it is really a call to a double-underscore method you can supply." },
  { t: "think", q: "You give a class <code>__str__</code> so <code>print(obj)</code> looks nice. But <code>print([obj])</code> — the same object in a list — shows an ugly <code>&lt;__main__.X object at 0x...&gt;</code>. Why the difference?", a: "Containers use <code>__repr__</code>, not <code>__str__</code>. <code>print(obj)</code> reaches for the friendly <code>__str__</code>, but a list prints the <b>repr</b> of each item — the unambiguous, developer-facing form.<br/><br/>So if you only define <code>__str__</code>, anything inside a list, dict, or shown in a debugger falls back to the default repr, which is that ugly memory address. The habit: always define <code>__repr__</code>; add <code>__str__</code> only when you want a separate pretty form." },

  { t: "h2", n: "1", text: "Operators are dunder calls in disguise" },
  { t: "def", term: "Dunder (magic) method", en: "A dunder method is a double-underscore method like __len__ or __add__ that Python calls automatically when you use built-in syntax such as len(x) or a + b.", hi: "In plain words: <code>len(x)</code> actually <code>x.__len__()</code> chalata hai, <code>a + b</code> actually <code>a.__add__(b)</code>. Ye \"magic\" methods Python khud call karta hai." },
  { t: "p", html: "Everyday syntax is a thin layer over dunder methods. Define the method on your class and your object plugs straight into the built-in syntax." },
  { t: "code", file: "container.py", code: "class Playlist:\n    def __init__(self, songs):\n        self.songs = songs\n    def __len__(self):\n        return len(self.songs)\n    def __getitem__(self, i):\n        return self.songs[i]\n    def __contains__(self, s):\n        return s in self.songs\n\np = Playlist([\"A\", \"B\", \"C\"])\nprint(len(p))          # calls __len__\nprint(p[0])            # calls __getitem__\nprint(\"B\" in p)        # calls __contains__", output: "3\nA\nTrue" },
  { t: "viz", name: "dunder-lab" },
  { t: "p", html: "In that panel, each piece of syntax on the left is really the dunder call in the middle. <code>len(p)</code> is <code>p.__len__()</code>; <code>p + q</code> is <code>p.__add__(q)</code>. Nothing is built into your object until you write the method." },

  { t: "h2", n: "2", text: "__str__ and __repr__" },
  { t: "p", html: "<code>__str__</code> is the friendly form for users (<code>print</code>); <code>__repr__</code> is the unambiguous form for developers, and it is what containers and the debugger show." },
  { t: "code", file: "strrepr.py", code: "class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\np = Point(3, 4)\nprint(p)         # __str__\nprint(repr(p))   # __repr__\nprint([p])       # a list uses __repr__", output: "(3, 4)\nPoint(3, 4)\n[Point(3, 4)]" },
  { t: "note", variant: "warn", html: "<b>Define <code>__repr__</code> first.</b> If a class has only <code>__str__</code>, then lists, dicts and your debugger fall back to the default repr — the useless <code>&lt;object at 0x...&gt;</code>. If you write only one, make it <code>__repr__</code>: Python uses it as the fallback for <code>__str__</code> too." },

  { t: "h2", n: "3", text: "__eq__ and operator overloading" },
  { t: "p", html: "<code>__eq__</code> defines what <code>==</code> means for your type; <code>__add__</code> defines <code>+</code>. Without <code>__eq__</code>, <code>==</code> compares identity, so two equal-looking objects are \"not equal\"." },
  { t: "code", file: "eq.py", code: "class Money:\n    def __init__(self, rupees):\n        self.rupees = rupees\n    def __eq__(self, other):\n        return self.rupees == other.rupees\n    def __add__(self, other):\n        return Money(self.rupees + other.rupees)\n    def __repr__(self):\n        return f\"Money({self.rupees})\"\n\nprint(Money(100) == Money(100))   # __eq__ -> True\nprint(Money(50) + Money(30))      # __add__ -> Money(80)", output: "True\nMoney(80)" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> dunder methods are how a library makes its objects feel native. A NumPy array supports <code>+</code>, <code>[]</code>, <code>len()</code> and comparisons because it defines these methods — that is why <code>df[df.age &gt; 30]</code> reads so naturally. When you build a small domain type (a Money, a Vector, a date range), the same handful of dunders makes it behave like a built-in, and callers get clean, familiar syntax for free." },

  { t: "h2", n: "4", text: "Static and class methods" },
  { t: "p", html: "A normal method takes <code>self</code> (the instance). <code>@staticmethod</code> takes neither — it is a plain function living in the class. <code>@classmethod</code> takes <code>cls</code> (the class), often to build alternative constructors." },
  { t: "code", file: "methods.py", code: "class Temperature:\n    @staticmethod\n    def c_to_f(c):                 # no self - a utility\n        return c * 9 // 5 + 32\n    @classmethod\n    def freezing(cls):             # gets the class\n        return cls(0)\n    def __init__(self, c):\n        self.c = c\n\nprint(Temperature.c_to_f(100))     # 212, no instance needed\nprint(Temperature.freezing().c)    # 0", output: "212\n0" },
  { t: "analogy", concept: "static vs class vs instance method", real: "A restaurant", html: "An <b>instance</b> method is a waiter serving <i>your</i> table — it needs <code>self</code>, your specific order. A <b>class</b> method is the manager who knows how the whole restaurant works — it gets <code>cls</code> and can, say, open a new table (an alternative constructor). A <b>static</b> method is a recipe pinned on the wall: it lives in the restaurant for convenience but needs nothing about any table or the restaurant to follow — just inputs and outputs." },

  { t: "trace", intro: "Dunders and method types. Work out each value.", code: "class Bag:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n    def __contains__(self, x):\n        return x in self.items\n    def __eq__(self, other):\n        return self.items == other.items\n\nb = Bag([1, 2, 3])\na = len(b)\nc = 2 in b\nd = b == Bag([1, 2, 3])\ne = b == Bag([9])", steps: [
    { q: "After line 12, <code>a</code> is", answer: "3", why: "<code>len(b)</code> calls <code>__len__</code>, which returns the length of the inner list, 3." },
    { q: "After line 13, <code>c</code> is", answer: "True", why: "<code>2 in b</code> calls <code>__contains__</code>, and 2 is in the items." },
    { q: "After line 14, <code>d</code> is", answer: "True", why: "<code>__eq__</code> compares the items lists, which are equal, so True." },
    { q: "After line 15, <code>e</code> is", answer: "False", why: "The items differ ([1,2,3] vs [9]), so <code>__eq__</code> returns False." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make len() work on a class via __len__.", code: "class Box:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n\nprint(len(Box([1, 2, 3, 4])))", out: "4" },
    { task: "Make print() show a friendly form with __str__.", code: "class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\nprint(Point(3, 4))", out: "(3, 4)" },
    { task: "Give a class a developer __repr__.", code: "class Point:\n    def __init__(self, x):\n        self.x = x\n    def __repr__(self):\n        return f\"Point({self.x})\"\n\nprint(repr(Point(7)))", out: "Point(7)" },
    { task: "Make == compare values with __eq__.", code: "class Money:\n    def __init__(self, r):\n        self.r = r\n    def __eq__(self, other):\n        return self.r == other.r\n\nprint(Money(100) == Money(100))", out: "True" },
    { task: "Overload + with __add__.", code: "class V:\n    def __init__(self, n):\n        self.n = n\n    def __add__(self, other):\n        return V(self.n + other.n).n\n\nprint(V(3) + V(4))", out: "7" },
    { task: "Support indexing with __getitem__.", code: "class Deck:\n    def __init__(self, cards):\n        self.cards = cards\n    def __getitem__(self, i):\n        return self.cards[i]\n\nprint(Deck([\"A\", \"K\", \"Q\"])[1])", out: "K" },
    { task: "Support the in operator with __contains__.", code: "class Deck:\n    def __init__(self, cards):\n        self.cards = cards\n    def __contains__(self, c):\n        return c in self.cards\n\nprint(\"K\" in Deck([\"A\", \"K\"]))", out: "True" },
    { task: "Write a @staticmethod utility (no self).", code: "class MathUtil:\n    @staticmethod\n    def double(n):\n        return n * 2\n\nprint(MathUtil.double(21))", out: "42" },
    { task: "Use a @classmethod as an alternative constructor.", code: "class Temp:\n    def __init__(self, c):\n        self.c = c\n    @classmethod\n    def freezing(cls):\n        return cls(0)\n\nprint(Temp.freezing().c)", out: "0" },
    { task: "Combine __len__ and __getitem__ in one class.", code: "class Row:\n    def __init__(self, cells):\n        self.cells = cells\n    def __len__(self):\n        return len(self.cells)\n    def __getitem__(self, i):\n        return self.cells[i]\n\nr = Row([10, 20, 30])\nprint(len(r), r[2])", out: "3 30" },
  ]},

  { t: "mistakes", items: [
    { bad: "class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\nprint([Point(1, 2)])", why: "Only <code>__str__</code> is defined, so the list falls back to the default repr and prints <code>&lt;__main__.Point object at 0x...&gt;</code>. Define <code>__repr__</code> for containers and debuggers.", fix: "class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\nprint([Point(1, 2)])" },
    { bad: "class Money:\n    def __init__(self, r):\n        self.r = r\n\nprint(Money(100) == Money(100))", why: "With no <code>__eq__</code>, <code>==</code> compares identity, not value — two separate objects are never identical, so this prints <code>False</code>. Define <code>__eq__</code> to compare by value.", fix: "class Money:\n    def __init__(self, r):\n        self.r = r\n    def __eq__(self, other):\n        return self.r == other.r\n\nprint(Money(100) == Money(100))" },
    { bad: "class MathUtil:\n    @staticmethod\n    def double(self, n):\n        return n * 2\n\nprint(MathUtil.double(21))", why: "A <code>@staticmethod</code> takes <b>no</b> <code>self</code>. Leaving it in means <code>21</code> is bound to <code>self</code> and <code>n</code> is missing — a <code>TypeError</code>. Drop <code>self</code>.", fix: "class MathUtil:\n    @staticmethod\n    def double(n):\n        return n * 2\n\nprint(MathUtil.double(21))" },
    { bad: "class Team:\n    def __init__(self, members):\n        self.members = members\n    def size(self):\n        return len(self.members)\n\nprint(len(Team([\"a\", \"b\"])))", why: "<code>len()</code> only works if the class defines <code>__len__</code>. A method called <code>size</code> is not enough — <code>len(team)</code> raises <code>TypeError</code>. Rename it to <code>__len__</code>.", fix: "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        return len(self.members)\n\nprint(len(Team([\"a\", \"b\"])))" },
  ]},

  { t: "debug", intro: "A cart class compares two carts to decide whether the order changed. Two carts with identical items keep coming back as different, so it re-saves every time. It runs without error. Read it before opening the fix.", code: "class Cart:\n    def __init__(self, items):\n        self.items = items\n\nsaved = Cart([\"apple\", \"milk\"])\ncurrent = Cart([\"apple\", \"milk\"])\n\nprint(\"same order?\", current == saved)", symptom: "prints same order? False, even though the items are identical", q: "Both carts hold the same two items. So why does == say they are different?", fix: "class Cart:\n    def __init__(self, items):\n        self.items = items\n    def __eq__(self, other):\n        return self.items == other.items\n\nsaved = Cart([\"apple\", \"milk\"])\ncurrent = Cart([\"apple\", \"milk\"])\n\nprint(\"same order?\", current == saved)", why: "The <code>Cart</code> class never defines <code>__eq__</code>, so <code>==</code> uses the default: <b>identity</b>, not value. It asks \"are these the same object in memory?\", and two separately-built carts are two different objects — so it is always False, no matter how identical the contents.<br/><br/>Defining <code>__eq__</code> tells Python what equality means for a Cart: same items. Now <code>current == saved</code> compares the item lists and returns True. This is the same reason <code>[1,2] == [1,2]</code> is True (list defines <code>__eq__</code>) but a custom object without it is not — value comparison is a method you have to provide. If you add <code>__eq__</code>, it is also good practice to add <code>__hash__</code> if the object needs to go in a set or dict key." },

  { t: "recap", items: [
    "Built-in syntax is dunder calls: <code>len(x)</code>→<code>__len__</code>, <code>a+b</code>→<code>__add__</code>, <code>a==b</code>→<code>__eq__</code>",
    "<code>__str__</code> = friendly (print); <code>__repr__</code> = developer form, used by lists and debuggers",
    "Define <code>__repr__</code> first — it is the fallback when <code>__str__</code> is missing",
    "Without <code>__eq__</code>, <code>==</code> compares identity, so equal objects look unequal",
    "<code>__len__</code> / <code>__getitem__</code> / <code>__contains__</code> make an object act like a container",
    "<code>@staticmethod</code> takes no <code>self</code>; <code>@classmethod</code> takes <code>cls</code> (often for alternative constructors)",
    "Dunders are how libraries make custom objects feel native (NumPy's <code>+</code> and <code>[]</code>)",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a dunder method?", a: "A dunder (\"double underscore\") method is a special method like <code>__init__</code>, <code>__len__</code> or <code>__add__</code> that Python calls automatically in response to built-in syntax. Writing <code>len(x)</code> calls <code>x.__len__()</code>, and <code>a + b</code> calls <code>a.__add__(b)</code>. Defining them lets your own objects work with Python's operators and built-in functions." },
    { level: "beginner", q: "What is the difference between <code>__str__</code> and <code>__repr__</code>?", a: "<code>__str__</code> is the human-friendly string used by <code>print()</code> and <code>str()</code>. <code>__repr__</code> is the unambiguous, developer-facing string used by the interactive prompt, the debugger, and containers — printing a list shows each item's repr. If you define only one, define <code>__repr__</code>, because Python falls back to it for <code>__str__</code> when the latter is missing." },
    { level: "intermediate", q: "Why might <code>==</code> return False for two objects that look equal?", a: "Because the class does not define <code>__eq__</code>, so <code>==</code> uses the default identity comparison — whether the two names refer to the same object in memory. Two separately-created instances with identical attributes are still different objects, so it returns False. Defining <code>__eq__</code> to compare the relevant attributes makes <code>==</code> a value comparison. If you do, consider defining <code>__hash__</code> too so the object can be used in sets and as dict keys." },
    { level: "intermediate", q: "When do you use <code>@staticmethod</code> versus <code>@classmethod</code>?", a: "Use <code>@staticmethod</code> for a function that logically belongs to the class but needs neither the instance nor the class — a pure utility, grouped for organisation. Use <code>@classmethod</code> when the method needs the class itself, via <code>cls</code>; the classic use is an alternative constructor, like <code>Date.from_string(...)</code>, that builds and returns <code>cls(...)</code>. A normal method, taking <code>self</code>, is for behaviour that depends on a specific instance." },
    { level: "intermediate", q: "How do dunder methods relate to duck typing and libraries like NumPy?", a: "They are what make duck typing powerful: an object supports <code>+</code>, indexing, iteration or <code>len()</code> purely by defining the right dunders, with no shared base class required. That is how NumPy arrays and Pandas objects feel native — they implement <code>__add__</code>, <code>__getitem__</code>, <code>__len__</code> and comparison operators, so ordinary Python syntax like <code>arr + 1</code> or <code>df[mask]</code> just works. Implementing the same handful on your own types buys the same seamless feel." },
  ]},
];
const L27 = [
  { t: "objectives", items: [
    "Tell an <b>iterable</b> (loop-able) from an <b>iterator</b> (produces one value at a time)",
    "Use <code>iter()</code> and <code>next()</code>, and know <code>StopIteration</code> ends the loop",
    "Write a <b>generator</b> with <code>yield</code> — lazy, one value at a time",
    "Understand why generators save memory on huge data",
    "Avoid the trap: a generator runs <b>once</b>, then it is empty",
  ]},
  { t: "hook", q: "You have a generator of sensor readings. You add them up with <code>sum(readings)</code> — get 100, correct. Then you count them with <code>len(list(readings))</code> — and get <b>0</b>. The readings did not vanish. So where did they go?", why: "They were <b>consumed</b>. A generator produces each value once, on demand, and does not keep them. <code>sum</code> pulled every value out to add them, which left the generator empty — so <code>len(list(...))</code> found nothing. A generator is a one-time stream, not a stored list. Iterate it once, and the second pass sees an empty sequence." },
  { t: "think", q: "A list of a million numbers and a generator of a million numbers both let you loop. What is the difference in memory?", a: "The list holds all million values in memory at once. The generator holds almost <b>nothing</b> — just its current position and the recipe for the next value.<br/><br/>That is the whole point of generators: they produce values <b>lazily</b>, one at a time, so a billion-row file can be processed with a few kilobytes of memory. The list would need gigabytes; the generator streams through it. On big data, this is the difference between a script that runs and one that is killed." },

  { t: "h2", n: "1", text: "Iterables and iterators" },
  { t: "def", term: "Iterable vs iterator", en: "An iterable is anything you can loop over, like a list or string; an iterator is the object that actually produces the items one at a time via next(), raising StopIteration when done.", hi: "In plain words: <b>iterable</b> woh jispe <code>for</code> chal sake (list, string). <b>iterator</b> woh jo <code>next()</code> pe ek-ek value deta hai. <code>for</code> loop andar-andar iterator hi banata hai." },
  { t: "p", html: "<code>iter()</code> turns an iterable into an iterator; <code>next()</code> pulls the next value. When there are no more, <code>next()</code> raises <code>StopIteration</code> — which is exactly how a <code>for</code> loop knows to stop." },
  { t: "code", file: "iter.py", code: "it = iter([10, 20, 30])   # make an iterator\nprint(next(it))           # 10\nprint(next(it))           # 20\nprint(next(it))           # 30\nprint(next(it, \"done\"))   # a default avoids StopIteration", output: "10\n20\n30\ndone" },
  { t: "note", variant: "tip", html: "A <code>for</code> loop is just this with the plumbing hidden: it calls <code>iter()</code> on your iterable, then <code>next()</code> over and over, and stops when it sees <code>StopIteration</code>. Passing a default to <code>next(it, default)</code> hands back the default instead of raising at the end." },

  { t: "h2", n: "2", text: "Generators: yield" },
  { t: "def", term: "Generator", en: "A generator is a function that uses yield to produce a sequence of values lazily — it pauses at each yield, hands back one value, and resumes from there on the next call.", hi: "In plain words: <code>yield</code> wali function poori list banaye bina ek-ek value 'produce' karti hai, aur har <code>yield</code> pe ruk jaati hai — agli baar wahin se chalti hai." },
  { t: "p", html: "A generator function looks normal but uses <code>yield</code> instead of <code>return</code>. Calling it does not run the body — it hands back a generator object that runs a little more each time you ask for a value." },
  { t: "code", file: "gen.py", code: "def squares(n):\n    for i in range(1, n + 1):\n        yield i * i        # produce, then pause\n\ng = squares(4)\nprint(type(g).__name__)   # generator, not list\nprint(next(g))            # 1\nprint(list(g))            # the rest: [4, 9, 16]", output: "generator\n1\n[4, 9, 16]" },
  { t: "viz", name: "generator-lab" },
  { t: "p", html: "Press <code>next()</code> in that panel. Each press runs the function only as far as the next <code>yield</code>, hands back one value, and pauses. After the last one, <code>next()</code> raises <code>StopIteration</code> — and the generator is spent." },

  { t: "h2", n: "3", text: "Lazy means memory-light" },
  { t: "p", html: "Because a generator computes one value at a time, it never holds the whole sequence. A <b>generator expression</b> — comprehension syntax with round brackets — is the quick way to make one." },
  { t: "code", file: "lazy.py", code: "# a list builds every value now; a genexp builds them on demand\nnums = [x * x for x in range(1, 5)]      # list: all in memory\ngen = (x * x for x in range(1, 5))       # genexp: lazy\n\nprint(nums)\nprint(type(gen).__name__)   # a generator object, not the values yet\nprint(sum(gen))             # pulls them one at a time", output: "[1, 4, 9, 16]\ngenerator\n30" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is how you process data too big for memory. Reading a 10 GB log line by line, <code>sum(len(line) for line in file)</code> streams it in a few kilobytes; building a list first would try to load all 10 GB and be killed. Pandas' <code>read_csv(..., chunksize=...)</code> is the same idea — hand back pieces lazily. Prefer a generator whenever you only need to pass through data once." },
  { t: "analogy", concept: "List vs generator", real: "Downloading vs streaming a film", html: "A <b>list</b> is downloading the whole film before you watch — every frame sits on your disk at once, which is fine for a short clip and impossible for a 4K movie on a small phone. A <b>generator</b> is <b>streaming</b>: it fetches the next second only as you watch it, holding almost nothing, so a film of any size plays on any device. The catch is the same too — a live stream plays <b>once</b> as it goes by; to watch again you restart it, exactly as you must rebuild an exhausted generator." },

  { t: "h2", n: "4", text: "The one-pass trap" },
  { t: "p", html: "A generator is a stream, not a container. Once you have iterated it, it is <b>empty</b> — iterating again yields nothing, with no error to warn you." },
  { t: "code", file: "onepass.py", code: "g = (x for x in [1, 2, 3])\n\nprint(list(g))   # [1, 2, 3]\nprint(list(g))   # []  - already consumed, no error", output: "[1, 2, 3]\n[]" },
  { t: "note", variant: "warn", html: "<b>Need the values more than once?</b> Store them in a list — <code>data = list(gen)</code> — and reuse the list, or build a fresh generator each time. Silent emptiness on the second pass is one of the most confusing generator bugs, because nothing errors." },

  { t: "trace", intro: "Iterators and generators, including the one-pass trap. Work out each value.", code: "def evens(n):\n    for i in range(n):\n        if i % 2 == 0:\n            yield i\n\nit = iter([5, 6, 7])\na = next(it)\nb = next(it)\n\ng = evens(6)\nc = list(g)\nd = list(g)\ne = sum(x for x in [1, 2, 3, 4])", steps: [
    { q: "After line 7, <code>a</code> is", answer: "5", why: "<code>next</code> on a fresh iterator returns the first element, 5." },
    { q: "After line 8, <code>b</code> is", answer: "6", why: "The next call advances to the second element, 6." },
    { q: "After line 11, <code>c</code> is", answer: "[0, 2, 4]", why: "<code>evens(6)</code> yields the even numbers below 6: 0, 2, 4." },
    { q: "After line 12, <code>d</code> is", answer: "[]", why: "The generator was fully consumed on line 11, so the second <code>list(g)</code> is empty — the one-pass trap." },
    { q: "After line 13, <code>e</code> is", answer: "10", why: "The generator expression yields 1, 2, 3, 4 into <code>sum</code>, giving 10." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make an iterator and pull the first value.", code: "it = iter([100, 200, 300])\nprint(next(it))", out: "100" },
    { task: "Use next() with a default so the end doesn't error.", code: "it = iter([])\nprint(next(it, \"empty\"))", out: "empty" },
    { task: "Write a generator that yields 1, 2, 3.", code: "def one_two_three():\n    yield 1\n    yield 2\n    yield 3\n\nprint(list(one_two_three()))", out: "[1, 2, 3]" },
    { task: "Generate the squares from 1 to 4.", code: "def squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\nprint(list(squares(4)))", out: "[1, 4, 9, 16]" },
    { task: "Yield only the even numbers below 6.", code: "def evens(n):\n    for i in range(n):\n        if i % 2 == 0:\n            yield i\n\nprint(list(evens(6)))", out: "[0, 2, 4]" },
    { task: "Sum a generator expression without building a list.", code: "print(sum(x * x for x in range(1, 4)))", out: "14" },
    { task: "Show a generator is empty after one pass.", code: "g = (x for x in [1, 2])\nprint(list(g))\nprint(list(g))", out: "[1, 2]\n[]" },
    { task: "Count matches with a generator expression.", code: "words = [\"cat\", \"dog\", \"cow\"]\nprint(sum(1 for w in words if w.startswith(\"c\")))", out: "2" },
    { task: "Take the first two values of an endless generator.", code: "def naturals():\n    n = 1\n    while True:\n        yield n\n        n += 1\n\ng = naturals()\nprint(next(g), next(g))", out: "1 2" },
    { task: "Turn a generator into a reusable list.", code: "def squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\ndata = list(squares(3))\nprint(data, sum(data))", out: "[1, 4, 9] 14" },
  ]},

  { t: "mistakes", items: [
    { bad: "g = (x for x in [1, 2, 3])\ntotal = sum(g)\ncount = len(list(g))", why: "<code>sum(g)</code> consumes the generator, so <code>list(g)</code> is empty and <code>count</code> is 0. Materialise once into a list and reuse it.", fix: "data = list(x for x in [1, 2, 3])\ntotal = sum(data)\ncount = len(data)" },
    { bad: "def squares(n):\n    for i in range(n):\n        return i * i", why: "<code>return</code> makes it a normal function that stops at the first value — not a generator. Use <code>yield</code> to produce a sequence.", fix: "def squares(n):\n    for i in range(n):\n        yield i * i" },
    { bad: "g = (x for x in range(3))\nprint(g[0])", why: "A generator is not indexable — it has no <code>[0]</code>, only <code>next()</code> or iteration. Convert to a list first if you need indexing.", fix: "g = list(x for x in range(3))\nprint(g[0])" },
    { bad: "gen = squares(1000000)\nbig = list(gen)\nfirst = big[0]", why: "Calling <code>list()</code> on a huge generator defeats the point — it pulls every value into memory, the very thing the generator avoided. Iterate it lazily instead.", fix: "gen = squares(1000000)\nfirst = next(gen)     # just the first, nothing else built" },
  ]},

  { t: "debug", intro: "A function reports on a stream of temperature readings: the average and how many readings there were. The average is right, but the count always comes back as 0. It runs without error. Read it before opening the fix.", code: "def report(readings):\n    total = sum(readings)\n    count = len(list(readings))\n    avg = total / count if count else 0\n    return avg, count\n\nstream = (t for t in [20, 30, 40, 50])\nprint(report(stream))", symptom: "prints (0, 0) — the count is 0 and so the average is 0 too", q: "The readings are clearly there, and sum() saw them. So why does the count come out as 0?", fix: "def report(readings):\n    data = list(readings)\n    total = sum(data)\n    count = len(data)\n    avg = total / count if count else 0\n    return avg, count\n\nstream = (t for t in [20, 30, 40, 50])\nprint(report(stream))", why: "A generator is a one-time stream. <code>sum(readings)</code> walked through <b>every</b> value to add them up, which left the generator exhausted. By the time <code>len(list(readings))</code> runs, there is nothing left to collect, so the list is empty and the count is 0 — which then makes the average 0 as well.<br/><br/>Nothing errors because an empty generator is perfectly valid; it just yields nothing. The fix is to pull the values into a list <b>once</b> — <code>data = list(readings)</code> — and then compute both the sum and the count from that list, which you can read as many times as you like. Reach for this whenever you need to traverse the same data more than once." },

  { t: "recap", items: [
    "<b>Iterable</b> = loop-able (list, string) · <b>iterator</b> = produces one value at a time via <code>next()</code>",
    "<code>next()</code> raises <code>StopIteration</code> at the end — how a <code>for</code> loop knows to stop",
    "A <b>generator</b> uses <code>yield</code> to produce values lazily, pausing at each one",
    "Generators are memory-light — they never hold the whole sequence, so they scale to huge data",
    "A <b>generator expression</b> is a comprehension in round brackets: <code>(x for x in ...)</code>",
    "A generator runs <b>once</b> — after one pass it is empty, with no error",
    "Need the values twice? <code>list(gen)</code> once and reuse the list",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between an iterable and an iterator?", a: "An iterable is any object you can loop over — a list, string, dict — because it can produce an iterator. An iterator is the object that does the actual work of yielding items one at a time through <code>next()</code>, raising <code>StopIteration</code> when exhausted. A <code>for</code> loop calls <code>iter()</code> on the iterable to get an iterator, then repeatedly calls <code>next()</code>. Lists are iterable but not their own iterators; a generator is both." },
    { level: "beginner", q: "What does <code>yield</code> do?", a: "<code>yield</code> turns a function into a generator. Instead of running to completion and returning once, the function pauses at each <code>yield</code>, hands back that value, and resumes from the same spot on the next request. This lets it produce a sequence lazily, one value at a time, keeping its local state between calls without building the whole result in memory." },
    { level: "intermediate", q: "Why do generators save memory, and when does that matter?", a: "Because they compute values on demand and hold only the current position, never the full sequence. A list of a billion items needs memory for all billion; a generator streams them one at a time in near-constant memory. It matters whenever the data is large or unbounded — reading a huge file, a network stream, or an infinite sequence — where materialising everything would exhaust memory. The trade-off is that you can only pass through the data once." },
    { level: "intermediate", q: "What happens if you iterate a generator twice?", a: "The second iteration yields nothing, because a generator is consumed as it runs and is not reset. After the first full pass it is exhausted, so a second <code>for</code> or <code>list()</code> sees an empty sequence — and crucially, no error is raised, which makes it a subtle bug. If you need the data more than once, store it in a list and reuse that, or create a new generator each time." },
    { level: "intermediate", q: "What is the difference between a list comprehension and a generator expression?", a: "Syntax and evaluation. <code>[x for x in it]</code> with square brackets builds a list eagerly, computing and storing every element immediately. <code>(x for x in it)</code> with round brackets creates a generator that computes each element lazily as it is requested. Use the list when you need the values repeatedly, indexing, or a length; use the generator when you only pass through once and want to avoid holding everything in memory — for example <code>sum(x*x for x in big)</code>." },
  ]},
];
const L28 = [
  { t: "objectives", items: [
    "Understand a <b>closure</b> — an inner function that remembers outer variables",
    "See that a <b>decorator</b> is a function that wraps another function",
    "Read <code>@decorator</code> as sugar for <code>func = decorator(func)</code>",
    "Write a wrapper with <code>*args, **kwargs</code> so it fits any function",
    "Preserve the wrapped function's name with <code>functools.wraps</code>",
  ]},
  { t: "hook", q: "You write a <code>@timer</code> decorator and add it to a function called <code>load_data</code>. Later a log line prints the function's name — and it says <code>wrapper</code>, not <code>load_data</code>. Every decorated function in your app now answers to the same name. What happened?", why: "The decorator replaced your function with its inner <code>wrapper</code> function — that is what a decorator does — and <code>wrapper</code> carries its own name, not the original's. So <code>load_data.__name__</code> is now <code>\"wrapper\"</code>. One line fixes it: <code>@functools.wraps(func)</code> copies the original's name, docstring and signature onto the wrapper, so the disguise is invisible." },
  { t: "think", q: "In <code>double = multiplier(2)</code>, the outer function has already returned. So how does <code>double(5)</code> still know that <code>n</code> is 2?", a: "Because the inner function captured it. When <code>multiply</code> was created inside <code>multiplier</code>, it kept a live reference to <code>n</code> — that bundle of an inner function plus the variables it remembers is a <b>closure</b>.<br/><br/>So even after <code>multiplier</code> has finished and its frame is gone, <code>double</code> still carries <code>n = 2</code> with it. Closures are what make decorators possible: the wrapper remembers the original function it is wrapping." },

  { t: "h2", n: "1", text: "Closures" },
  { t: "def", term: "Closure", en: "A closure is an inner function together with the outer-scope variables it references, which it keeps alive even after the outer function has returned.", hi: "In plain words: andar wala function bahar wale ki variable ko 'yaad' rakh leta hai, chahe bahar wala function khatam ho jaye. Yehi closure hai." },
  { t: "p", html: "A function defined inside another can use the outer function's variables, and it remembers them after the outer call ends. That is what lets a factory function produce customised functions." },
  { t: "code", file: "closure.py", code: "def multiplier(n):\n    def multiply(x):\n        return x * n        # n is remembered\n    return multiply\n\ndouble = multiplier(2)\ntriple = multiplier(3)\nprint(double(5))            # 10\nprint(triple(5))            # 15 - its own remembered n", output: "10\n15" },
  { t: "note", variant: "tip", html: "<code>double</code> and <code>triple</code> are the <b>same</b> inner function, but each closed over a different <code>n</code>. That independent memory is the whole idea — and it is exactly how a decorator's wrapper remembers which function it wraps." },

  { t: "h2", n: "2", text: "Decorators" },
  { t: "def", term: "Decorator", en: "A decorator is a function that takes another function and returns a new one that adds behaviour around it, applied with the @name syntax above a definition.", hi: "In plain words: decorator ek function ko 'wrap' karke uske aage-peeche extra kaam jodta hai, bina uska code chhue. <code>@name</code> se lagate hain." },
  { t: "p", html: "A decorator takes a function, defines a <code>wrapper</code> around it, and returns the wrapper. <code>@shout</code> above <code>greet</code> is just a shorthand." },
  { t: "code", file: "dec.py", code: "def shout(func):\n    def wrapper(name):\n        return func(name).upper()   # call the original, then add to it\n    return wrapper\n\n@shout\ndef greet(name):\n    return \"hi \" + name\n\nprint(greet(\"freya\"))", output: "HI FREYA" },
  { t: "viz", name: "decorator-lab" },
  { t: "p", html: "Follow the value in that panel: the input reaches the original <code>greet</code>, its result comes back, and the decorator's wrapper transforms it on the way out. The original function never changed — the behaviour lives in the layer around it." },
  { t: "analogy", concept: "A decorator", real: "Gift-wrapping a box", html: "The function is a box; the decorator is the wrapping. You do not open the box or change what is inside — you put paper, a ribbon and a label <b>around</b> it. Anyone receiving it gets the same box, now with the extra layer. <code>@shout</code> wraps <code>greet</code> so callers get greet's result plus the upper-casing, without a single line of greet being touched. And you can wrap a wrapped box again — decorators stack." },

  { t: "h2", n: "3", text: "@ is sugar for func = decorator(func)" },
  { t: "p", html: "The <code>@</code> syntax is not magic. <code>@shout</code> above <code>greet</code> does exactly one thing: it reassigns <code>greet</code> to <code>shout(greet)</code>. Writing it by hand makes that obvious." },
  { t: "code", file: "sugar.py", code: "def shout(func):\n    def wrapper(name):\n        return func(name).upper()\n    return wrapper\n\ndef greet(name):\n    return \"hi \" + name\n\ngreet = shout(greet)     # exactly what @shout does\nprint(greet(\"om\"))", output: "HI OM" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> decorators are everywhere in real frameworks. Flask and FastAPI use <code>@app.route(\"/\")</code> to attach a URL to a function; test suites use <code>@pytest.fixture</code>; you will meet <code>@property</code>, <code>@staticmethod</code>, and caching with <code>@functools.lru_cache</code>. They keep the cross-cutting concern — routing, timing, caching, auth — out of the function's own body, so the function stays about its one job." },

  { t: "h2", n: "4", text: "*args, **kwargs and functools.wraps" },
  { t: "p", html: "A real decorator should wrap <b>any</b> function, so the wrapper takes <code>*args, **kwargs</code> and passes them through. And it should not hide the original's identity — <code>functools.wraps</code> copies its name and docstring onto the wrapper." },
  { t: "code", file: "wraps.py", code: "import functools\n\ndef logged(func):\n    @functools.wraps(func)          # keep func's name and docstring\n    def wrapper(*args, **kwargs):  # accept any arguments\n        result = func(*args, **kwargs)\n        return f\"[{func.__name__}] {result}\"\n    return wrapper\n\n@logged\ndef add(a, b):\n    return a + b\n\nprint(add(3, 4))\nprint(add.__name__)     # still 'add', thanks to wraps", output: "[add] 7\nadd" },
  { t: "note", variant: "warn", html: "<b>Always add <code>@functools.wraps(func)</code>.</b> Without it, the decorated function's <code>__name__</code> becomes <code>\"wrapper\"</code> and its docstring vanishes — which breaks logging, debugging, and any tool that reads a function's name. It is one line and it saves a genuinely confusing class of bug." },

  { t: "trace", intro: "Closures and decorators. Work out each value.", code: "def adder(n):\n    def add(x):\n        return x + n\n    return add\n\ndef loud(func):\n    def wrapper(s):\n        return func(s) + \"!\"\n    return wrapper\n\n@loud\ndef say(s):\n    return s\n\nadd10 = adder(10)\na = add10(5)\nb = adder(100)(1)\nc = say(\"hi\")", steps: [
    { q: "After line 16, <code>a</code> is", answer: "15", why: "<code>adder(10)</code> returns a closure that remembers n=10, so <code>add10(5)</code> is 5 + 10 = 15." },
    { q: "After line 17, <code>b</code> is", answer: "101", why: "<code>adder(100)</code> makes a fresh closure with n=100, called immediately with 1: 100 + 1 = 101." },
    { q: "After line 18, <code>c</code> is", answer: "hi!", why: "<code>@loud</code> wrapped <code>say</code>, so <code>say(\"hi\")</code> returns the original \"hi\" with a \"!\" appended." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Make a closure that remembers a multiplier.", code: "def multiplier(n):\n    def mul(x):\n        return x * n\n    return mul\n\ntriple = multiplier(3)\nprint(triple(4))", out: "12" },
    { task: "Two closures with independent state.", code: "def adder(n):\n    def add(x):\n        return x + n\n    return add\n\nprint(adder(5)(1), adder(10)(1))", out: "6 11" },
    { task: "Write a decorator that upper-cases the result.", code: "def shout(func):\n    def wrapper(s):\n        return func(s).upper()\n    return wrapper\n\n@shout\ndef greet(s):\n    return \"hi \" + s\n\nprint(greet(\"om\"))", out: "HI OM" },
    { task: "Apply a decorator by hand (no @).", code: "def loud(func):\n    def wrapper(s):\n        return func(s) + \"!\"\n    return wrapper\n\ndef say(s):\n    return s\n\nsay = loud(say)\nprint(say(\"hey\"))", out: "hey!" },
    { task: "Write a decorator that works for any arguments.", code: "def logged(func):\n    def wrapper(*args, **kwargs):\n        return f\"[{func.__name__}] {func(*args, **kwargs)}\"\n    return wrapper\n\n@logged\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))", out: "[add] 5" },
    { task: "Preserve the name with functools.wraps.", code: "import functools\n\ndef deco(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@deco\ndef task():\n    return 1\n\nprint(task.__name__)", out: "task" },
    { task: "Show the name is lost WITHOUT wraps.", code: "def deco(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@deco\ndef task():\n    return 1\n\nprint(task.__name__)", out: "wrapper" },
    { task: "Decorate a function that returns a number, doubling it.", code: "def double(func):\n    def wrapper(*args):\n        return func(*args) * 2\n    return wrapper\n\n@double\ndef total(a, b):\n    return a + b\n\nprint(total(3, 4))", out: "14" },
    { task: "Stack two decorators on one function.", code: "def loud(f):\n    def w(s): return f(s) + \"!\"\n    return w\ndef shout(f):\n    def w(s): return f(s).upper()\n    return w\n\n@loud\n@shout\ndef say(s):\n    return s\n\nprint(say(\"hi\"))", out: "HI!" },
    { task: "A closure-based counter.", code: "def make_counter():\n    count = 0\n    def step():\n        nonlocal count\n        count += 1\n        return count\n    return step\n\nc = make_counter()\nprint(c(), c(), c())", out: "1 2 3" },
  ]},

  { t: "mistakes", items: [
    { bad: "def logged(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@logged\ndef load():\n    return 1\n\nprint(load.__name__)", why: "No <code>functools.wraps</code>, so <code>load.__name__</code> is <code>\"wrapper\"</code>, not <code>\"load\"</code>. Add <code>@functools.wraps(func)</code> to the wrapper.", fix: "import functools\n\ndef logged(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper" },
    { bad: "def shout(func):\n    def wrapper(name):\n        return func(name).upper()\n\n@shout\ndef greet(name):\n    return \"hi \" + name", why: "The decorator never <code>return</code>s <code>wrapper</code>, so it returns <code>None</code> — and <code>greet</code> becomes <code>None</code>. Calling it raises <code>TypeError: 'NoneType' object is not callable</code>. Always return the wrapper.", fix: "def shout(func):\n    def wrapper(name):\n        return func(name).upper()\n    return wrapper" },
    { bad: "def logged(func):\n    def wrapper(name):\n        return func(name)\n    return wrapper\n\n@logged\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))", why: "The wrapper only accepts one argument, <code>name</code>, but <code>add</code> needs two — so this raises <code>TypeError</code>. Use <code>*args, **kwargs</code> so the wrapper fits any function.", fix: "def logged(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper" },
    { bad: "def multiplier(n):\n    def mul(x):\n        return x * n\n    # forgot to return mul\n\ndouble = multiplier(2)\nprint(double(5))", why: "<code>multiplier</code> never returns the inner function, so <code>double</code> is <code>None</code> and <code>double(5)</code> is a <code>TypeError</code>. A factory must return its inner function.", fix: "def multiplier(n):\n    def mul(x):\n        return x * n\n    return mul" },
  ]},

  { t: "debug", intro: "A logging decorator is added to several functions. Everything runs fine, but the log output names every function 'wrapper', so the logs are useless for telling calls apart. Read it before opening the fix.", code: "def logged(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@logged\ndef fetch_user():\n    return \"user\"\n\n@logged\ndef fetch_orders():\n    return \"orders\"\n\nprint(fetch_user.__name__)\nprint(fetch_orders.__name__)", symptom: "both print 'wrapper' instead of their real names", q: "These are two different functions with clear names. So why do both report their name as 'wrapper'?", fix: "import functools\n\ndef logged(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@logged\ndef fetch_user():\n    return \"user\"\n\n@logged\ndef fetch_orders():\n    return \"orders\"\n\nprint(fetch_user.__name__)\nprint(fetch_orders.__name__)", why: "A decorator <b>replaces</b> the original function with the inner <code>wrapper</code>. So after <code>@logged</code>, the name <code>fetch_user</code> actually points at <code>wrapper</code> — and <code>wrapper.__name__</code> is <code>\"wrapper\"</code>. Both functions were wrapped by the same decorator, so both now carry the wrapper's name, its docstring is gone, and any log or debugger that reads <code>__name__</code> shows the same useless label for all of them.<br/><br/><code>functools.wraps(func)</code> fixes it in one line: it copies the original's <code>__name__</code>, <code>__doc__</code> and signature onto the wrapper, so the wrapped function keeps its own identity. It is considered mandatory on any decorator you write — omitting it is the most common decorator bug there is." },

  { t: "recap", items: [
    "A <b>closure</b> is an inner function that remembers its outer variables after the outer call ends",
    "A <b>decorator</b> is a function that wraps another to add behaviour around it",
    "<code>@shout</code> above <code>greet</code> is exactly <code>greet = shout(greet)</code>",
    "The wrapper calls the original, then adds before/after — the original code is untouched",
    "Use <code>*args, **kwargs</code> in the wrapper so it fits any function",
    "Always add <code>@functools.wraps(func)</code> or the name becomes <code>\"wrapper\"</code>",
    "Decorators stack, and power <code>@app.route</code>, <code>@property</code>, <code>@lru_cache</code> and more",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a closure?", a: "A closure is an inner function bundled with the variables it references from the enclosing scope, which it keeps alive even after the outer function has returned. It is what lets a factory function like <code>multiplier(n)</code> return a function that remembers its own <code>n</code>. Closures are also the mechanism underneath decorators — the wrapper closes over the function it is decorating." },
    { level: "beginner", q: "What is a decorator?", a: "A decorator is a function that takes another function and returns a new function that adds behaviour around it, without modifying the original's code. You apply it with <code>@name</code> above a definition, which is shorthand for reassigning the function to <code>name(function)</code>. Decorators are used for cross-cutting concerns — logging, timing, caching, access control, routing — keeping that logic out of the function's own body." },
    { level: "intermediate", q: "What does <code>@decorator</code> actually do to the function below it?", a: "It rebinds the name to the decorator's return value: <code>@shout</code> above <code>def greet</code> is exactly <code>greet = shout(greet)</code>. So after decoration, the original function object is passed into the decorator, and the name now refers to whatever the decorator returned — usually an inner wrapper that calls the original. There is nothing magic about the <code>@</code>; it is pure syntactic sugar for that reassignment." },
    { level: "intermediate", q: "Why should a decorator use <code>functools.wraps</code>?", a: "Because a decorator replaces the original with a wrapper, and the wrapper has its own <code>__name__</code> (\"wrapper\"), no docstring, and a generic signature. <code>functools.wraps(func)</code> copies the original function's name, docstring and metadata onto the wrapper, so introspection, logging, and debuggers still see the real function. Without it, every decorated function reports the same name, which is confusing and breaks tools that rely on <code>__name__</code>." },
    { level: "intermediate", q: "Why does a decorator's wrapper usually take <code>*args, **kwargs</code>?", a: "So it can decorate functions with any signature. The wrapper does not know in advance how many arguments the wrapped function takes, so it accepts everything with <code>*args, **kwargs</code> and forwards them unchanged with <code>func(*args, **kwargs)</code>. Hard-coding specific parameters would tie the decorator to one function shape and raise a TypeError on any other, so the general form is standard." },
  ]},
];
const L29 = [
  { t: "objectives", items: [
    "Search and extract text patterns with the <code>re</code> module",
    "Use the core tools: <code>findall</code>, <code>search</code>, <code>sub</code>",
    "Read the common symbols: <code>\\d</code>, <code>\\w</code>, <code>+</code>, <code>{n}</code>, <code>[…]</code>, <code>^</code>, <code>$</code>",
    "Know why regex patterns must be <b>raw strings</b> (<code>r\"…\"</code>)",
    "Tell <code>match</code> (start only) from <code>search</code> (anywhere)",
  ]},
  { t: "hook", q: "You write <code>re.search(\"\\bcat\", \"the cat\")</code> to find the word <code>cat</code>. It returns nothing — no match, in a string that obviously contains \"cat\". Drop nothing but add one letter, <code>r</code>, and it works. What was wrong?", why: "The missing <code>r</code>. In an ordinary Python string, <code>\\b</code> is not \"word boundary\" — it is the <b>backspace</b> character. So <code>\"\\bcat\"</code> is a backspace followed by <code>cat</code>, which is nowhere in your text. Only in a <b>raw</b> string, <code>r\"\\bcat\"</code>, does <code>\\b</code> stay as the two characters the regex engine reads as a word boundary. This is why every regex pattern should be a raw string." },
  { t: "think", q: "Why do regex patterns almost always start with <code>r</code>, as in <code>r\"\\d+\"</code>?", a: "Because regex is built from backslash sequences — <code>\\d</code>, <code>\\w</code>, <code>\\b</code>, <code>\\s</code> — and Python's normal strings <b>also</b> use the backslash for escapes. Without the <code>r</code>, Python tries to interpret <code>\\d</code> as a string escape (it is not a valid one and warns), and <code>\\b</code> silently becomes a backspace.<br/><br/>A raw string, <code>r\"…\"</code>, turns that off: the backslash stays a literal backslash, and the regex engine gets exactly the characters you typed. It is a habit, not a special case — always make regex patterns raw." },

  { t: "h2", n: "1", text: "findall, search and existence" },
  { t: "def", term: "Regular expression", en: "A regular expression is a pattern describing a set of strings, used to search, extract, validate and replace text; Python's re module compiles and runs them.", hi: "In plain words: regex ek pattern hai jo batata hai \"aisi text dhoondho\". <code>import re</code> karke text me se numbers, emails, dates nikaal sakte ho." },
  { t: "p", html: "<code>re.findall</code> returns every match as a list. <code>re.search</code> returns the first match object (or <code>None</code>), so <code>bool(re.search(...))</code> answers \"is it there at all?\"." },
  { t: "code", file: "basics.py", code: "import re\n\ntext = \"Order 123, bill 456\"\nprint(re.findall(r\"\\d+\", text))          # every run of digits\n\nprint(bool(re.search(r\"\\d\", \"abc7\")))    # is there a digit?\nprint(bool(re.search(r\"\\d\", \"abc\")))", output: "['123', '456']\nTrue\nFalse" },
  { t: "note", variant: "tip", html: "<code>findall</code> gives you the <b>strings</b> directly, which is what you usually want for extraction. <code>search</code> gives a <b>match object</b> — call <code>.group()</code> on it to get the text, or just wrap it in <code>bool()</code> to test existence." },

  { t: "h2", n: "2", text: "The common symbols" },
  { t: "p", html: "A handful of symbols cover most needs: <code>\\d</code> a digit, <code>\\w</code> a letter/digit/underscore, <code>+</code> one-or-more, <code>{n}</code> exactly n, <code>[…]</code> any one listed character." },
  { t: "viz", name: "regex-lab" },
  { t: "code", file: "symbols.py", code: "import re\n\ntext = \"Call 98765 or 43210, code A7\"\nprint(re.findall(r\"\\d+\", text))       # runs of digits\nprint(re.findall(r\"\\d{5}\", text))     # exactly five digits\nprint(re.findall(r\"[A-Z]\\d\", text))    # a capital then a digit", output: "['98765', '43210', '7']\n['98765', '43210']\n['A7']" },
  { t: "note", variant: "tip", html: "Click the patterns in the panel above and watch them light up the matches. <code>\\d{5}</code> catches the two phone numbers but not the lone <code>7</code>; <code>[A-Z]\\d</code> catches only <code>A7</code>. Seeing what a pattern grabs is far faster than decoding the symbols in your head." },

  { t: "h2", n: "3", text: "Groups and sub" },
  { t: "p", html: "Parentheses <b>capture</b> parts of a match, read back with <code>.group(n)</code>. <code>re.sub</code> replaces every match with something else." },
  { t: "code", file: "groups.py", code: "import re\n\nm = re.search(r\"(\\w+)@(\\w+)\", \"user@gmail\")\nprint(m.group(1))        # before the @\nprint(m.group(2))        # after the @\n\nprint(re.sub(r\"\\d+\", \"#\", \"a1b22c333\"))   # mask every number", output: "user\ngmail\na#b#c#" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> regex is a data-cleaning workhorse. Pulling order ids out of free-text notes, validating email or phone formats, stripping currency symbols before <code>float()</code>, masking sensitive digits in logs — all a line or two of <code>re</code>. In Pandas, <code>df[\"col\"].str.extract(r\"…\")</code> and <code>.str.replace(r\"…\")</code> run regex across a whole column at once, so the patterns you learn here scale straight to a DataFrame." },

  { t: "h2", n: "4", text: "match vs search, and anchors" },
  { t: "p", html: "<code>re.match</code> only looks at the <b>start</b> of the string; <code>re.search</code> looks anywhere. <code>^</code> and <code>$</code> anchor a pattern to the start and end — useful for validating a whole string." },
  { t: "code", file: "anchors.py", code: "import re\n\nprint(bool(re.match(r\"cat\", \"the cat\")))   # False - not at the START\nprint(bool(re.search(r\"cat\", \"the cat\")))  # True  - found anywhere\n\nprint(bool(re.match(r\"^\\d+$\", \"12345\")))    # whole string is digits\nprint(bool(re.match(r\"^\\d+$\", \"12a45\")))    # has a letter -> False", output: "False\nTrue\nTrue\nFalse" },
  { t: "analogy", concept: "match vs search", real: "Reading a name tag vs scanning a crowd", html: "<code>re.match</code> is checking the <b>name tag at the door</b> — it only reads the very start of the string and answers whether that begins with your pattern. <code>re.search</code> is <b>scanning the whole crowd</b> for anyone matching. Most of the time you want <code>search</code>; reach for <code>match</code> only when the thing genuinely has to be at the beginning, and use <code>^…$</code> when the pattern must cover the <b>entire</b> string, like validating that an input is all digits." },

  { t: "trace", intro: "findall, search, match, sub. Work out each value.", code: "import re\n\ntext = \"a1 b22 c333\"\n\na = re.findall(r\"\\d+\", text)\nb = len(a)\nc = bool(re.search(r\"z\", text))\nd = bool(re.match(r\"\\d\", text))\ne = re.sub(r\"\\d\", \"*\", \"a1b2\")", steps: [
    { q: "After line 5, <code>a</code> is", answer: "['1', '22', '333']", why: "<code>\\d+</code> grabs each run of digits: 1, 22, 333." },
    { q: "After line 6, <code>b</code> is", answer: "3", why: "There are three matches in the list, so its length is 3." },
    { q: "After line 7, <code>c</code> is", answer: "False", why: "There is no <code>z</code> anywhere in the text, so <code>search</code> finds nothing." },
    { q: "After line 8, <code>d</code> is", answer: "False", why: "<code>match</code> only checks the start, and the text begins with <code>a</code>, not a digit." },
    { q: "After line 9, <code>e</code> is", answer: "a*b*", why: "<code>sub</code> replaces every single digit with <code>*</code>: a1b2 becomes a*b*." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Find all runs of digits in a string.", code: "import re\n\nprint(re.findall(r\"\\d+\", \"a12 b3 c456\"))", out: "['12', '3', '456']" },
    { task: "Test whether a string contains any digit.", code: "import re\n\nprint(bool(re.search(r\"\\d\", \"hello2\")))", out: "True" },
    { task: "Find all whole words with \\w+.", code: "import re\n\nprint(re.findall(r\"\\w+\", \"hi there_42!\"))", out: "['hi', 'there_42']" },
    { task: "Match exactly three digits.", code: "import re\n\nprint(re.findall(r\"\\d{3}\", \"12 345 6789\"))", out: "['345', '678']" },
    { task: "Find every vowel with a character class.", code: "import re\n\nprint(re.findall(r\"[aeiou]\", \"education\"))", out: "['e', 'u', 'a', 'i', 'o']" },
    { task: "Replace every digit with a hash.", code: "import re\n\nprint(re.sub(r\"\\d\", \"#\", \"a1b2c3\"))", out: "a#b#c#" },
    { task: "Capture the two parts around an @.", code: "import re\n\nm = re.search(r\"(\\w+)@(\\w+)\", \"om@mail\")\nprint(m.group(1), m.group(2))", out: "om mail" },
    { task: "Validate a whole string is digits with ^ and $.", code: "import re\n\nprint(bool(re.match(r\"^\\d+$\", \"90210\")))", out: "True" },
    { task: "Show match only checks the start.", code: "import re\n\nprint(bool(re.match(r\"\\d\", \"abc9\")))", out: "False" },
    { task: "Extract simple emails from text.", code: "import re\n\nprint(re.findall(r\"\\w+@\\w+\\.\\w+\", \"a@b.com and c@d.org\"))", out: "['a@b.com', 'c@d.org']" },
  ]},

  { t: "mistakes", items: [
    { bad: "import re\nprint(bool(re.search(\"\\bcat\", \"the cat\")))", why: "Without the <code>r</code>, <code>\\b</code> is a backspace character, not a word boundary — so this searches for something that is not there and returns False. Make the pattern raw.", fix: "import re\nprint(bool(re.search(r\"\\bcat\", \"the cat\")))" },
    { bad: "import re\nprint(bool(re.match(r\"cat\", \"the cat\")))", why: "<code>re.match</code> only checks the <b>start</b> of the string, and \"the cat\" begins with \"the\" — so this is False even though \"cat\" is present. Use <code>re.search</code> to look anywhere.", fix: "import re\nprint(bool(re.search(r\"cat\", \"the cat\")))" },
    { bad: "import re\nm = re.search(r\"\\d+\", \"no digits here\")\nprint(m.group())", why: "When nothing matches, <code>re.search</code> returns <code>None</code>, and <code>None.group()</code> raises <code>AttributeError</code>. Check the match before using it.", fix: "import re\nm = re.search(r\"\\d+\", \"no digits here\")\nprint(m.group() if m else \"no match\")" },
    { bad: "import re\nprint(re.findall(r\"\\d\", \"12 34\"))", why: "Not an error, but a surprise: <code>\\d</code> without <code>+</code> matches <b>single</b> digits, giving ['1','2','3','4'] — not the numbers 12 and 34. Add <code>+</code> to grab whole runs.", fix: "import re\nprint(re.findall(r\"\\d+\", \"12 34\"))" },
  ]},

  { t: "debug", intro: "A function scans support tickets for the word 'urgent' anywhere in the message. It keeps reporting False on tickets that clearly contain the word. It runs without error. Read it before opening the fix.", code: "import re\n\ndef is_urgent(msg):\n    return bool(re.match(r\"urgent\", msg))\n\nprint(is_urgent(\"urgent: server down\"))\nprint(is_urgent(\"the issue is urgent\"))", symptom: "prints True then False, though both messages contain 'urgent'", q: "The second message clearly contains 'urgent'. So why does the check say False?", fix: "import re\n\ndef is_urgent(msg):\n    return bool(re.search(r\"urgent\", msg))\n\nprint(is_urgent(\"urgent: server down\"))\nprint(is_urgent(\"the issue is urgent\"))", why: "<code>re.match</code> only anchors at the <b>start</b> of the string. The first message begins with \"urgent\", so it matches; the second begins with \"the\", so <code>match</code> gives up immediately even though \"urgent\" appears later. The function meant to look <b>anywhere</b> in the message, which is exactly what <code>re.search</code> does.<br/><br/>This is the most common regex mix-up: <code>match</code> is start-anchored, <code>search</code> is not. A quick way to remember it — <code>re.match(p, s)</code> behaves like <code>re.search(\"^\" + p, s)</code>. Use <code>search</code> for \"is this pattern present\", <code>match</code> only when it truly must be at the beginning, and <code>^…$</code> when it must span the whole string." },

  { t: "recap", items: [
    "<code>import re</code> · <code>findall</code> = all matches (list) · <code>search</code> = first match or None · <code>sub</code> = replace",
    "Always make patterns <b>raw</b>: <code>r\"\\d+\"</code>, or <code>\\b</code> and friends misbehave",
    "<code>\\d</code> digit · <code>\\w</code> word char · <code>+</code> one-or-more · <code>{n}</code> exactly n · <code>[…]</code> any listed",
    "Parentheses <b>capture</b> groups, read with <code>.group(n)</code>",
    "<code>re.match</code> checks the <b>start</b> only; <code>re.search</code> looks <b>anywhere</b>",
    "<code>^</code> and <code>$</code> anchor to start and end — validate a whole string with <code>^…$</code>",
    "A failed <code>search</code> returns <code>None</code> — check before calling <code>.group()</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between <code>re.findall</code> and <code>re.search</code>?", a: "<code>findall</code> returns a list of every non-overlapping match as strings, which is what you use to extract all occurrences. <code>search</code> scans for the first match and returns a match object, or <code>None</code> if there is none — so it is what you use to test existence, usually as <code>bool(re.search(...))</code>, or to grab one match and read its groups with <code>.group()</code>." },
    { level: "beginner", q: "Why should regex patterns be raw strings?", a: "Because regex uses backslash sequences like <code>\\d</code>, <code>\\w</code> and <code>\\b</code>, and Python's normal strings also treat the backslash as an escape character. In a normal string, <code>\\b</code> becomes a backspace and <code>\\d</code> triggers an invalid-escape warning, so the pattern the regex engine receives is not what you typed. A raw string, <code>r\"…\"</code>, disables string escaping so the backslashes reach the regex engine intact." },
    { level: "intermediate", q: "What is the difference between <code>re.match</code> and <code>re.search</code>?", a: "<code>re.match</code> only succeeds if the pattern matches at the <b>beginning</b> of the string; <code>re.search</code> looks for a match anywhere in it. So <code>re.match(r\"cat\", \"the cat\")</code> is None while <code>re.search</code> finds it. <code>match</code> is effectively <code>search</code> with an implicit <code>^</code> anchor. Most \"does this contain\" checks should use <code>search</code>; reserve <code>match</code> for genuinely start-anchored logic." },
    { level: "intermediate", q: "What do capturing groups do?", a: "Parentheses in a pattern capture the part of the match they enclose, so you can pull out sub-parts. After <code>m = re.search(r\"(\\w+)@(\\w+)\", s)</code>, <code>m.group(1)</code> and <code>m.group(2)</code> are the pieces before and after the @, and <code>m.group(0)</code> is the whole match. Groups are also how <code>re.sub</code> can reference matched text in its replacement, and how <code>findall</code> returns tuples when a pattern has several groups." },
    { level: "intermediate", q: "How do <code>^</code> and <code>$</code> help validate input?", a: "They anchor the pattern to the start and end of the string, so <code>^…$</code> forces the <b>whole</b> string to match rather than just a part of it. For example <code>re.match(r\"^\\d+$\", s)</code> is True only if <code>s</code> is entirely digits; without the anchors, a pattern could match a substring and wrongly accept \"12a45\". Anchoring is essential when checking that an input has exactly the expected format." },
  ]},
];

const L30 = [
  { t: "objectives", items: [
    "Run several tasks concurrently with <code>threading</code>",
    "Understand the <b>GIL</b>: only one thread runs Python at a time",
    "Choose <b>threads for I/O-bound</b> work, <b>processes for CPU-bound</b>",
    "Collect results cleanly with <code>ThreadPoolExecutor</code>",
    "Protect shared state with a <code>Lock</code> to avoid race conditions",
  ]},
  { t: "hook", q: "You have 100 web pages to download, each taking a second of waiting. You add threads, expecting it to still take ~100 seconds — the GIL only lets one thread run at a time, right? Instead it finishes in about <b>one</b> second. How, if threads can't run in parallel?", why: "Because downloading is <b>waiting</b>, not computing. While one thread sits idle waiting for a page to arrive, Python hands the GIL to another thread to start its own download. The GIL only blocks two threads from running Python <b>code</b> at once — it does nothing to stop them <b>waiting</b> at the same time. So for I/O-bound work, threads overlap all the waiting and the speedup is huge. For CPU-bound work, where every thread wants to compute, the GIL really does serialise them — and there you need processes." },
  { t: "think", q: "If Python's GIL means only one thread runs at a time, when are threads actually worth using?", a: "Whenever the work is mostly <b>waiting</b> — network requests, reading files, database calls. During the wait, a thread is not running Python code, so the GIL is free for another thread to make progress. That is <b>I/O-bound</b> work, and threads overlap the idle time beautifully.<br/><br/>For <b>CPU-bound</b> work — crunching numbers, processing images — every thread wants the GIL to compute, so they take turns and there is no speedup. That is when you reach for <code>multiprocessing</code>, which gives each task its own interpreter and its own GIL, so they run truly in parallel across cores." },

  { t: "h2", n: "1", text: "Running a thread" },
  { t: "def", term: "Concurrency", en: "Concurrency is structuring a program so multiple tasks can be in progress at once; with threads, one interpreter interleaves them, overlapping the time any of them spends waiting.", hi: "In plain words: kai kaam ek saath 'chalu' rakhna. Threads se ek hi interpreter unhe baari-baari aage badhata hai — khaas kar jab koi kaam wait kar raha ho." },
  { t: "p", html: "<code>threading.Thread(target=func, args=(...))</code> creates a thread; <code>.start()</code> runs it, and <code>.join()</code> waits for it to finish before the main program continues." },
  { t: "code", file: "thread.py", code: "import threading\n\nresult = []\ndef work(x):\n    result.append(x * x)\n\nt = threading.Thread(target=work, args=(5,))\nt.start()      # run the thread\nt.join()       # wait for it to finish\nprint(result)", output: "[25]" },
  { t: "note", variant: "warn", html: "<b>Always <code>join()</code> before reading a thread's results.</b> Without it, the main program races ahead and may read the result before the thread has written it. And note <code>args=(5,)</code> needs the trailing comma — <code>(5)</code> is just the number 5, not a tuple." },

  { t: "h2", n: "2", text: "The GIL: why it matters" },
  { t: "p", html: "Python's <b>Global Interpreter Lock</b> lets only one thread execute Python bytecode at a time. So threads overlap <b>waiting</b> (I/O) but not <b>computing</b> (CPU). That one rule decides which tool to use." },
  { t: "viz", name: "concurrency-lab" },
  { t: "p", html: "Click through those scenarios. Threads collapse three I/O tasks into one time slot, because the waiting overlaps — but three CPU tasks still take the full time, because the GIL serialises the computing. Only separate <b>processes</b> speed up CPU work." },
  { t: "analogy", concept: "The GIL", real: "One kitchen, one chef", html: "Picture a kitchen with a single chef (the GIL). If three dishes each need 10 minutes in the <b>oven</b>, the chef starts all three and waits — the oven does the work in parallel, so all three finish together. That is I/O-bound: the waiting overlaps. But if three dishes each need 10 minutes of <b>the chef chopping</b>, one chef can only chop one at a time — 30 minutes total. That is CPU-bound. To chop in parallel you need <b>more chefs</b> (more processes), not a busier single chef (more threads)." },

  { t: "h2", n: "3", text: "ThreadPoolExecutor: results made easy" },
  { t: "p", html: "Managing threads by hand gets fiddly. <code>ThreadPoolExecutor</code> runs a pool of workers and hands back results — and <code>.map</code> returns them <b>in order</b>, however the threads finished." },
  { t: "code", file: "pool.py", code: "from concurrent.futures import ThreadPoolExecutor\n\ndef square(n):\n    return n * n\n\nwith ThreadPoolExecutor(max_workers=3) as ex:\n    results = list(ex.map(square, [1, 2, 3, 4]))\n\nprint(results)     # in the SAME order as the input", output: "[1, 4, 9, 16]" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> this is the pattern you will actually reach for. Scraping many URLs, calling several APIs, reading a folder of files — wrap the per-item work in a function and hand the list to <code>ThreadPoolExecutor().map</code>. It parallelises the waiting, returns results in order, and cleans up the threads for you. For CPU-heavy work — resizing thousands of images, heavy numeric loops — swap in <code>ProcessPoolExecutor</code>, which sidesteps the GIL with real processes." },

  { t: "h2", n: "4", text: "Shared state and locks" },
  { t: "p", html: "When threads share data, two of them updating it at once can corrupt it — a <b>race condition</b>. A <code>Lock</code> makes a section run one-thread-at-a-time, so the updates stay correct." },
  { t: "code", file: "lock.py", code: "import threading\n\ncounter = 0\nlock = threading.Lock()\n\ndef add_1000():\n    global counter\n    for _ in range(1000):\n        with lock:          # only one thread inside at a time\n            counter += 1\n\nthreads = [threading.Thread(target=add_1000) for _ in range(5)]\nfor t in threads: t.start()\nfor t in threads: t.join()\n\nprint(counter)     # exactly 5000, thanks to the lock", output: "5000" },
  { t: "note", variant: "warn", html: "Without the lock, <code>counter += 1</code> is not atomic — it reads, adds, and writes in separate steps, and two threads can interleave and lose an update, giving a number <b>less</b> than 5000. The result would also vary run to run. A <code>Lock</code> (or keeping shared state to a minimum) is how you keep concurrent code correct." },

  { t: "trace", intro: "Threads, a pool, and a lock. All outputs here are deterministic. Work out each value.", code: "import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nout = [None, None, None]\ndef store(i):\n    out[i] = i * 10\n\nts = [threading.Thread(target=store, args=(i,)) for i in range(3)]\nfor t in ts: t.start()\nfor t in ts: t.join()\n\na = out\n\ndef cube(n):\n    return n ** 3\nwith ThreadPoolExecutor() as ex:\n    b = list(ex.map(cube, [1, 2, 3]))\n\nc = len(b)", steps: [
    { q: "After line 12, <code>a</code> is", answer: "[0, 10, 20]", why: "Each thread wrote its own index, so the result is deterministic: out[0]=0, out[1]=10, out[2]=20." },
    { q: "After line 17, <code>b</code> is", answer: "[1, 8, 27]", why: "<code>ex.map</code> applies cube to 1, 2, 3 and returns the results in input order: 1, 8, 27." },
    { q: "After line 19, <code>c</code> is", answer: "3", why: "There are three results in <code>b</code>, so its length is 3." },
  ]},

  { t: "drills", intro: "One per idea. Outputs are deterministic. Write each yourself before opening the answer.", items: [
    { task: "Run one thread that stores a result, then join.", code: "import threading\n\nresult = []\ndef work(x):\n    result.append(x + 1)\n\nt = threading.Thread(target=work, args=(9,))\nt.start()\nt.join()\nprint(result)", out: "[10]" },
    { task: "Use ThreadPoolExecutor.map to double a list.", code: "from concurrent.futures import ThreadPoolExecutor\n\ndef double(n):\n    return n * 2\n\nwith ThreadPoolExecutor() as ex:\n    print(list(ex.map(double, [1, 2, 3])))", out: "[2, 4, 6]" },
    { task: "Run several threads that each write their own index.", code: "import threading\n\nout = [0, 0, 0, 0]\ndef put(i):\n    out[i] = i * i\n\nts = [threading.Thread(target=put, args=(i,)) for i in range(4)]\nfor t in ts: t.start()\nfor t in ts: t.join()\nprint(out)", out: "[0, 1, 4, 9]" },
    { task: "Protect a shared counter with a Lock.", code: "import threading\n\ncount = 0\nlock = threading.Lock()\ndef inc():\n    global count\n    for _ in range(100):\n        with lock:\n            count += 1\n\nts = [threading.Thread(target=inc) for _ in range(3)]\nfor t in ts: t.start()\nfor t in ts: t.join()\nprint(count)", out: "300" },
    { task: "Get a return value with submit().result().", code: "from concurrent.futures import ThreadPoolExecutor\n\ndef square(n):\n    return n * n\n\nwith ThreadPoolExecutor() as ex:\n    print(ex.submit(square, 6).result())", out: "36" },
    { task: "Count how many threads you started.", code: "import threading\n\nts = [threading.Thread(target=lambda: None) for _ in range(5)]\nfor t in ts: t.start()\nfor t in ts: t.join()\nprint(len(ts))", out: "5" },
    { task: "Map a function over a range with a pool.", code: "from concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor() as ex:\n    print(sum(ex.map(lambda n: n, range(5))))", out: "10" },
    { task: "Use the pool result to build a total.", code: "from concurrent.futures import ThreadPoolExecutor\n\ndef length(s):\n    return len(s)\n\nwith ThreadPoolExecutor() as ex:\n    print(list(ex.map(length, [\"a\", \"bb\", \"ccc\"])))", out: "[1, 2, 3]" },
    { task: "Join in a loop over many threads.", code: "import threading\n\ntotal = []\ndef add(x):\n    total.append(x)\n\nts = [threading.Thread(target=add, args=(i,)) for i in range(3)]\nfor t in ts: t.start()\nfor t in ts: t.join()\nprint(sorted(total))", out: "[0, 1, 2]" },
    { task: "Square a list in order with the pool.", code: "from concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor() as ex:\n    print(list(ex.map(lambda n: n * n, [2, 3, 4])))", out: "[4, 9, 16]" },
  ]},

  { t: "mistakes", items: [
    { bad: "import threading\ndef greet(name):\n    print(\"hi\", name)\n\nt = threading.Thread(target=greet, args=(\"Freya\"))\nt.start()", why: "<code>args=(\"Freya\")</code> is just the string \"Freya\", not a tuple — so the thread calls <code>greet('F','r','e','y','a')</code> and raises TypeError. Add the trailing comma: <code>args=(\"Freya\",)</code>.", fix: "t = threading.Thread(target=greet, args=(\"Freya\",))\nt.start()" },
    { bad: "import threading\ndef work():\n    return 1\n\nt = threading.Thread(target=work())\nt.start()", why: "<code>target=work()</code> <b>calls</b> work immediately and passes its return value as the target, so nothing runs in the thread. Pass the function itself, without parentheses: <code>target=work</code>.", fix: "t = threading.Thread(target=work)\nt.start()" },
    { bad: "counter = 0\ndef inc():\n    global counter\n    for _ in range(100000):\n        counter += 1\n# many threads run inc() with no lock", why: "<code>counter += 1</code> is read-modify-write, not atomic, so threads interleave and lose updates — the total comes out less than expected, and differs each run. Guard shared writes with a <code>Lock</code>.", fix: "lock = threading.Lock()\ndef inc():\n    global counter\n    for _ in range(100000):\n        with lock:\n            counter += 1" },
    { bad: "import threading\ncpu_heavy = lambda: sum(i*i for i in range(10**7))\nts = [threading.Thread(target=cpu_heavy) for _ in range(4)]", why: "This is CPU-bound work, and the GIL means the four threads take turns rather than run in parallel — no speedup, sometimes slower. Use <code>ProcessPoolExecutor</code> for CPU work.", fix: "from concurrent.futures import ProcessPoolExecutor\nwith ProcessPoolExecutor() as ex:\n    ex.map(cpu_heavy, range(4))" },
  ]},

  { t: "debug", intro: "A function starts a thread to square a number and tries to use the result. It runs without error, but the result is always None instead of the number. Read it before opening the fix.", code: "import threading\n\ndef square(n):\n    return n * n\n\nresult = threading.Thread(target=square, args=(5,)).start()\nprint(result)", symptom: "prints None instead of 25", q: "The square function clearly returns n*n. So why is the result None?", fix: "from concurrent.futures import ThreadPoolExecutor\n\ndef square(n):\n    return n * n\n\nwith ThreadPoolExecutor() as ex:\n    result = ex.submit(square, 5).result()\nprint(result)", why: "A thread does not hand its return value back to the caller. <code>Thread.start()</code> returns <code>None</code> — it starts the thread and returns immediately — so <code>result</code> is None, and the value <code>square</code> computed is simply lost. Threads communicate through <b>shared state</b> (writing into a list or dict the caller can read afterwards), not through a return value.<br/><br/>The clean fix is <code>ThreadPoolExecutor</code>: <code>ex.submit(square, 5)</code> returns a <code>Future</code>, and <code>.result()</code> waits for the thread and gives you the return value — 25. This is exactly why the executor API exists: it handles collecting results (and re-raising any exception from the worker) so you do not have to wire up shared containers by hand." },

  { t: "recap", items: [
    "<code>threading.Thread(target=f, args=(...))</code> · <code>.start()</code> runs · <code>.join()</code> waits",
    "The <b>GIL</b> lets one thread run Python at a time — threads overlap <b>waiting</b>, not <b>computing</b>",
    "Use <b>threads for I/O-bound</b> work (network, files), <b>processes for CPU-bound</b>",
    "<code>ThreadPoolExecutor().map</code> runs a pool and returns results <b>in order</b>",
    "A thread does not return a value — use shared state, or <code>submit().result()</code>",
    "Shared writes need a <code>Lock</code>, or a race condition loses updates",
    "<code>args=(x,)</code> needs the comma, and <code>target=f</code> takes the function, not <code>f()</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between concurrency with threads and with processes?", a: "Threads live inside one interpreter and share memory, so they are light and communicate easily, but the GIL means only one runs Python bytecode at a time. Processes each have their own interpreter and memory, so they run in true parallel across cores but are heavier and must pass data explicitly. Threads suit I/O-bound work; processes suit CPU-bound work." },
    { level: "beginner", q: "What is the GIL?", a: "The Global Interpreter Lock is a mutex in CPython that allows only one thread to execute Python bytecode at any moment. It simplifies memory management but means threads cannot run Python code in parallel. Crucially, a thread releases the GIL while waiting on I/O, so threads still overlap waiting — which is why they help I/O-bound programs but not CPU-bound ones." },
    { level: "intermediate", q: "When should you use threads versus multiprocessing?", a: "Use threads for I/O-bound work — network requests, file and database access — where tasks spend most of their time waiting, because threads overlap that waiting despite the GIL and are cheap to create. Use multiprocessing for CPU-bound work — heavy computation — because separate processes each have their own GIL and run in genuine parallel across cores. Picking the wrong one is a common cause of code that adds complexity without any speedup." },
    { level: "intermediate", q: "What is a race condition, and how do you prevent it?", a: "A race condition is when two threads access shared mutable state concurrently and the outcome depends on their timing — for example, two threads both doing <code>counter += 1</code>, which is a non-atomic read-modify-write, can interleave and lose an update. You prevent it by serialising access to the shared state, typically with a <code>Lock</code> using <code>with lock:</code>, or by avoiding shared mutable state altogether and passing results back through a queue or executor." },
    { level: "intermediate", q: "How do you get a return value out of a thread?", a: "You cannot get it from <code>Thread.start()</code>, which returns None. With the raw threading API you write the result into a shared container — a list or dict the caller reads after <code>join()</code>. The cleaner approach is <code>concurrent.futures</code>: <code>ex.submit(fn, *args)</code> returns a Future whose <code>.result()</code> blocks until the thread finishes and returns the value, re-raising any exception the worker hit. <code>ex.map</code> does the same across an iterable, preserving input order." },
  ]},
];
const L31 = [
  { t: "objectives", items: [
    "Write a coroutine with <code>async def</code> and run it with <code>asyncio.run</code>",
    "Use <code>await</code> to pause for a result without blocking the thread",
    "Run coroutines concurrently with <code>asyncio.gather</code>",
    "See that async is <b>one thread</b> switching at each <code>await</code>",
    "Avoid the top bug: forgetting <code>await</code> leaves you a coroutine, not a value",
  ]},
  { t: "hook", q: "You call an <code>async def</code> function like a normal one — <code>price = get_price()</code> — and then use <code>price</code> in a sum. It fails with <code>unsupported operand type: 'coroutine' and 'int'</code>. You never made a coroutine on purpose. Where did it come from?", why: "Calling an <code>async def</code> does <b>not</b> run it — it hands you a <b>coroutine object</b>, a paused plan of the work, and runs nothing until you <code>await</code> it (or pass it to <code>asyncio.run</code>/<code>gather</code>). So <code>get_price()</code> without <code>await</code> is not the number 100, it is the recipe for getting 100. Add <code>await</code> — <code>price = await get_price()</code> — and it actually runs and gives you the value. Forgetting <code>await</code> is the single most common async mistake." },
  { t: "think", q: "If async runs on a single thread, how can it do many things \"at once\"?", a: "It does not run them at once — it <b>interleaves</b> them. A coroutine runs until it hits an <code>await</code> on something slow (a network call), and at that point it <b>pauses and hands control back</b> to the event loop, which starts or resumes another coroutine.<br/><br/>So while one coroutine is waiting for a response, the single thread is busy making progress on another. Nothing runs in parallel — but the <b>waiting</b> overlaps, which is exactly what I/O-bound work needs. It is cooperative: each coroutine voluntarily yields at every <code>await</code>." },

  { t: "h2", n: "1", text: "async, await, and asyncio.run" },
  { t: "def", term: "Coroutine", en: "A coroutine is a function defined with async def; calling it returns a coroutine object that does nothing until it is awaited or run by the event loop, at which point it executes and can pause at each await.", hi: "In plain words: <code>async def</code> wali function ko call karne se kaam <b>chalta nahi</b> — ek coroutine object milta hai. Use <code>await</code> ya <code>asyncio.run</code> se chalao." },
  { t: "p", html: "<code>async def</code> makes a coroutine. Inside it, <code>await</code> pauses until the awaited thing is ready. At the top level, <code>asyncio.run(coro())</code> starts the event loop and runs it to completion." },
  { t: "code", file: "basic.py", code: "import asyncio\n\nasync def get_value():\n    await asyncio.sleep(0)   # yield to the loop, then continue\n    return 42\n\nasync def main():\n    v = await get_value()    # wait for the coroutine's result\n    return v + 1\n\nprint(asyncio.run(main()))", output: "43" },
  { t: "note", variant: "warn", html: "<b><code>await</code> only works inside an <code>async def</code>.</b> At the top level of a script you cannot <code>await</code> directly — you use <code>asyncio.run(coro())</code> to start the loop. And <code>await</code> works on coroutines and other awaitables, not on ordinary values." },

  { t: "h2", n: "2", text: "gather: running coroutines concurrently" },
  { t: "p", html: "Awaiting coroutines one after another runs them in sequence. <code>asyncio.gather</code> schedules them together so their waits overlap, and returns the results <b>in order</b>." },
  { t: "code", file: "gather.py", code: "import asyncio\n\nasync def square(n):\n    await asyncio.sleep(0)\n    return n * n\n\nasync def main():\n    results = await asyncio.gather(square(1), square(2), square(3))\n    return results\n\nprint(asyncio.run(main()))     # in input order, waits overlapped", output: "[1, 4, 9]" },
  { t: "viz", name: "async-lab" },
  { t: "p", html: "Step through that panel. Each coroutine runs until its <code>await</code>, then hands the single thread back to the loop — so at one point <b>both are waiting at once</b>, even though only one ever runs. That overlap of waits, with no threads, is what <code>gather</code> buys you." },

  { t: "h2", n: "3", text: "Why async: overlapping the waiting" },
  { t: "p", html: "The win is the same as threads for I/O — overlap the waiting — but on one thread with explicit pause points, so there is no GIL contention and no locks for shared state within a task." },
  { t: "analogy", concept: "The event loop", real: "One waiter, many tables", html: "A single waiter (the thread) serves many tables. They take table 1's order and, instead of standing at the kitchen waiting for the food, they go take table 2's order, then table 3's — that is <code>await</code>, handing control to the next job while the kitchen (the network) works. When a dish is ready, they deliver it. One waiter, but almost no time spent standing still. Add a second waiter (a thread) and you could carry two plates at once — but for taking-orders-and-waiting, one well-organised waiter is plenty." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> async powers modern Python web servers. FastAPI route handlers are <code>async def</code>, so a single worker can handle thousands of concurrent requests by overlapping their database and API waits — no thread per request. The same pattern fits any I/O-heavy service: scraping, chat, streaming. Reach for async when the bottleneck is waiting on the network, and reach for multiprocessing when it is CPU. Mixing blocking calls into async code is the classic trap — one blocking call stalls the whole loop." },

  { t: "h2", n: "4", text: "The forgotten await" },
  { t: "p", html: "Calling a coroutine without <code>await</code> is the mistake everyone makes. You get a coroutine object, not the value, and the work never runs." },
  { t: "code", file: "forgot.py", code: "import asyncio\n\nasync def get_price():\n    return 100\n\nasync def main():\n    a = get_price()          # forgot await -> a coroutine\n    b = await get_price()    # correct -> the value 100\n    return type(a).__name__, type(b).__name__\n\nprint(asyncio.run(main()))", output: "('coroutine', 'int')" },
  { t: "note", variant: "warn", html: "If you ever see <code>&lt;coroutine object …&gt;</code> in your output, or a <code>RuntimeWarning: coroutine '…' was never awaited</code>, you forgot an <code>await</code>. The value you wanted is still locked inside the unrun coroutine." },

  { t: "trace", intro: "Coroutines, await, and gather. All outputs are deterministic. Work out each value.", code: "import asyncio\n\nasync def double(n):\n    await asyncio.sleep(0)\n    return n * 2\n\na = asyncio.run(double(5))\n\nasync def three():\n    return await asyncio.gather(double(1), double(2), double(3))\n\nb = asyncio.run(three())\nc = len(b)\nd = type(double(9)).__name__", steps: [
    { q: "After line 7, <code>a</code> is", answer: "10", why: "<code>asyncio.run(double(5))</code> runs the coroutine and returns 5 × 2 = 10." },
    { q: "After line 12, <code>b</code> is", answer: "[2, 4, 6]", why: "<code>gather</code> runs the three coroutines and returns their results in input order: 1×2, 2×2, 3×2." },
    { q: "After line 13, <code>c</code> is", answer: "3", why: "<code>b</code> has three results, so its length is 3." },
    { q: "After line 14, <code>d</code> is", answer: "coroutine", why: "<code>double(9)</code> without <code>await</code> or <code>run</code> is a coroutine object — calling an async function does not run it." },
  ]},

  { t: "drills", intro: "One per idea. Outputs are deterministic. Write each yourself before opening the answer.", items: [
    { task: "Run a simple coroutine with asyncio.run.", code: "import asyncio\n\nasync def hello():\n    return \"hi\"\n\nprint(asyncio.run(hello()))", out: "hi" },
    { task: "Await a coroutine inside another.", code: "import asyncio\n\nasync def inner():\n    return 5\n\nasync def outer():\n    return await inner() + 1\n\nprint(asyncio.run(outer()))", out: "6" },
    { task: "Use await with asyncio.sleep(0), then return.", code: "import asyncio\n\nasync def task():\n    await asyncio.sleep(0)\n    return \"done\"\n\nprint(asyncio.run(task()))", out: "done" },
    { task: "Gather three coroutines and get results in order.", code: "import asyncio\n\nasync def sq(n):\n    return n * n\n\nasync def main():\n    return await asyncio.gather(sq(2), sq(3), sq(4))\n\nprint(asyncio.run(main()))", out: "[4, 9, 16]" },
    { task: "Gather over a list comprehension.", code: "import asyncio\n\nasync def dbl(n):\n    return n * 2\n\nasync def main():\n    return await asyncio.gather(*[dbl(i) for i in range(4)])\n\nprint(asyncio.run(main()))", out: "[0, 2, 4, 6]" },
    { task: "Show a called coroutine is a coroutine object.", code: "import asyncio\n\nasync def f():\n    return 1\n\nasync def main():\n    return type(f()).__name__\n\nprint(asyncio.run(main()))", out: "coroutine" },
    { task: "Sum the results of a gather.", code: "import asyncio\n\nasync def n(x):\n    return x\n\nasync def main():\n    return sum(await asyncio.gather(*[n(i) for i in range(5)]))\n\nprint(asyncio.run(main()))", out: "10" },
    { task: "Return a value from main and print it.", code: "import asyncio\n\nasync def main():\n    total = 0\n    for i in range(4):\n        total += i\n    return total\n\nprint(asyncio.run(main()))", out: "6" },
    { task: "Await two coroutines sequentially and combine.", code: "import asyncio\n\nasync def a():\n    return 10\nasync def b():\n    return 20\n\nasync def main():\n    return await a() + await b()\n\nprint(asyncio.run(main()))", out: "30" },
    { task: "Gather and check the length of the results.", code: "import asyncio\n\nasync def one():\n    return 1\n\nasync def main():\n    return len(await asyncio.gather(one(), one(), one()))\n\nprint(asyncio.run(main()))", out: "3" },
  ]},

  { t: "mistakes", items: [
    { bad: "import asyncio\n\nasync def get_data():\n    return 100\n\nasync def main():\n    data = get_data()      # forgot await\n    return data + 1\n\nasyncio.run(main())", why: "<code>get_data()</code> without <code>await</code> is a coroutine, not 100 — so <code>data + 1</code> raises TypeError. Add <code>await</code>.", fix: "async def main():\n    data = await get_data()\n    return data + 1" },
    { bad: "import asyncio\n\nasync def get():\n    return 1\n\ndata = await get()", why: "<code>await</code> only works <b>inside</b> an <code>async def</code>. At the top level you must start the loop with <code>asyncio.run</code>.", fix: "import asyncio\n\nasync def get():\n    return 1\n\ndata = asyncio.run(get())" },
    { bad: "import asyncio\n\nasync def a():\n    return 1\nasync def b():\n    return 2\n\nasync def main():\n    x = await a()\n    y = await b()\n    return x + y", why: "Not wrong, but if <code>a</code> and <code>b</code> each waited on I/O, awaiting them one after another runs them in sequence — no overlap. Use <code>gather</code> to run them concurrently.", fix: "async def main():\n    x, y = await asyncio.gather(a(), b())\n    return x + y" },
    { bad: "import time\n\nasync def slow():\n    time.sleep(2)     # blocking!\n    return \"done\"", why: "<code>time.sleep</code> blocks the whole event loop, freezing every other coroutine. In async code you must use the awaitable version, <code>await asyncio.sleep</code>, which yields control.", fix: "import asyncio\n\nasync def slow():\n    await asyncio.sleep(2)\n    return \"done\"" },
  ]},

  { t: "debug", intro: "A checkout coroutine fetches a price and reports it. It runs without crashing, but the report says the price is a 'coroutine' instead of a number. Read it before opening the fix.", code: "import asyncio\n\nasync def get_price():\n    return 100\n\nasync def checkout():\n    price = get_price()\n    return f\"got a {type(price).__name__}\"\n\nprint(asyncio.run(checkout()))", symptom: "prints got a coroutine, not got a int", q: "get_price clearly returns 100. So why is price a coroutine instead of the number?", fix: "import asyncio\n\nasync def get_price():\n    return 100\n\nasync def checkout():\n    price = await get_price()\n    return f\"got a {type(price).__name__}\"\n\nprint(asyncio.run(checkout()))", why: "Calling an <code>async def</code> function does not run it — it builds and returns a <b>coroutine object</b>, a paused plan of the work. Nothing inside <code>get_price</code> executes until that coroutine is awaited. So <code>price = get_price()</code> binds <code>price</code> to the coroutine itself, not to 100, and its type is 'coroutine'.<br/><br/>Adding <code>await</code> — <code>price = await get_price()</code> — tells the event loop to actually run the coroutine and give you back its return value. This is the defining difference between a normal function (calling it runs it) and a coroutine (calling it only prepares it; awaiting runs it). The tell-tale signs are a <code>&lt;coroutine object&gt;</code> in your output or a <code>RuntimeWarning: coroutine '…' was never awaited</code> — both mean a missing <code>await</code>." },

  { t: "recap", items: [
    "<code>async def</code> makes a <b>coroutine</b>; calling it returns a coroutine object that runs nothing yet",
    "<code>await coro()</code> runs it and gives the result; <code>asyncio.run(coro())</code> starts the loop at the top level",
    "<code>await</code> only works inside an <code>async def</code>",
    "<code>asyncio.gather(*coros)</code> runs them concurrently and returns results <b>in order</b>",
    "Async is <b>one thread</b> that switches at each <code>await</code> — waits overlap, nothing runs in parallel",
    "Use async for <b>I/O-bound</b> work (network, DB); it powers FastAPI and modern web servers",
    "Forgetting <code>await</code> leaves you a coroutine, not a value — the top async bug",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a coroutine, and what does calling one return?", a: "A coroutine is a function defined with <code>async def</code>. Calling it does not execute the body — it returns a coroutine object, which is a paused representation of the work. Nothing runs until you await that object or hand it to the event loop with <code>asyncio.run</code> or <code>gather</code>. This is the key difference from a normal function, where calling it runs it immediately." },
    { level: "beginner", q: "What does <code>await</code> do?", a: "<code>await</code> runs an awaitable — usually a coroutine — and pauses the current coroutine until it produces a result, without blocking the thread. At that pause point, control returns to the event loop, which can run other coroutines. So <code>await</code> both retrieves the result and marks a place where the coroutine is willing to yield. It can only be used inside an <code>async def</code>." },
    { level: "intermediate", q: "How does single-threaded async achieve concurrency?", a: "Through cooperative scheduling on an event loop. A coroutine runs until it reaches an <code>await</code> on something slow, then yields control back to the loop, which resumes or starts another coroutine. Nothing runs in parallel — only one coroutine executes at a time — but their <b>waiting</b> overlaps, so many I/O-bound tasks make progress together on one thread. The programmer marks the yield points explicitly with <code>await</code>, unlike threads, which the OS can preempt anywhere." },
    { level: "intermediate", q: "When would you choose async over threads?", a: "For high-concurrency I/O-bound work where you want many tasks in flight cheaply — thousands of network connections, a web server handling many requests. Async avoids the overhead and locking complexity of threads and sidesteps the GIL contention, since it is one thread with explicit yield points. Threads still suit simpler I/O concurrency or when integrating blocking libraries, and CPU-bound work needs multiprocessing regardless. A major caveat: any blocking call inside async code stalls the whole loop, so the ecosystem has to be async-aware." },
    { level: "intermediate", q: "What is the most common async bug?", a: "Forgetting <code>await</code>. Calling a coroutine without awaiting it returns a coroutine object that never runs, so you end up with the wrong type — often surfacing as a <code>TypeError</code> when you use it, or a <code>RuntimeWarning: coroutine was never awaited</code>. The fix is to await the call, or schedule it with <code>asyncio.gather</code> or <code>create_task</code>. Related mistakes are trying to <code>await</code> at the top level instead of using <code>asyncio.run</code>, and calling a blocking function like <code>time.sleep</code> instead of <code>await asyncio.sleep</code>." },
  ]},
];
const L32 = [
  { t: "objectives", items: [
    "Count frequencies in one line with <code>Counter</code>",
    "Group items without a KeyError using <code>defaultdict</code>",
    "Make readable records with <code>namedtuple</code>",
    "Chain, accumulate and combine with <code>itertools</code>",
    "Fold a whole list into one value with <code>functools.reduce</code>",
  ]},
  { t: "hook", q: "You count how often each letter appears by looping and writing <code>counts[ch] += 1</code>. It crashes on the very first letter with <code>KeyError</code>, before it has counted anything. Why?", why: "Because <code>counts[ch] += 1</code> means <b>read</b> <code>counts[ch]</code>, add one, write it back — and on the first letter that key does not exist yet, so the <b>read</b> fails. A plain dict has no notion of a default. This is the exact problem <code>collections</code> was built to remove: <code>Counter</code> counts for you in one line, and <code>defaultdict(int)</code> starts every missing key at 0. You almost never need to hand-roll a counting loop again." },
  { t: "think", q: "When would you reach for <code>Counter</code> instead of a plain dictionary?", a: "Any time you are tallying — counting words, votes, dice rolls, error codes, anything. <code>Counter(items)</code> does the whole loop for you, a missing key returns <code>0</code> instead of raising, and <code>.most_common(n)</code> hands back the top n already sorted.<br/><br/>A plain dict makes you initialise every key, guard every lookup, and sort by value yourself. <code>Counter</code> is a dict subclass built exactly for frequencies, so it is both shorter and harder to get wrong. Frequency counting is one of the most common things you do with data, which is why it earns a dedicated tool." },

  { t: "h2", n: "1", text: "Counter: frequencies in one line" },
  { t: "def", term: "collections", en: "collections is a standard-library module of specialised container types — Counter, defaultdict, namedtuple, deque — that solve common data-shaping tasks more directly than a plain dict or list.", hi: "In plain words: <code>collections</code> me ready-made containers hain jo roz ke kaam (ginti, grouping, records) aasaan kar dete hain." },
  { t: "p", html: "<code>Counter(iterable)</code> tallies every item. Index it like a dict — but a missing key is <code>0</code>, not an error — and <code>.most_common(n)</code> returns the top n by count." },
  { t: "code", file: "counter.py", code: "from collections import Counter\n\nvotes = [\"a\", \"b\", \"a\", \"c\", \"a\", \"b\"]\nc = Counter(votes)\n\nprint(c[\"a\"])              # 3\nprint(c[\"z\"])              # 0, not a KeyError\nprint(c.most_common(2))    # top two", output: "3\n0\n[('a', 3), ('b', 2)]" },
  { t: "viz", name: "counter-lab" },
  { t: "p", html: "Try the inputs in that panel — the counts appear as sorted bars, most common on top, which is exactly what <code>most_common</code> returns. One call replaces the whole count-and-sort loop." },

  { t: "h2", n: "2", text: "defaultdict and namedtuple" },
  { t: "p", html: "<code>defaultdict(factory)</code> gives every missing key a fresh default — <code>int</code> for counting, <code>list</code> for grouping. <code>namedtuple</code> makes a lightweight record with named fields." },
  { t: "code", file: "defaultdict.py", code: "from collections import defaultdict\n\ngroups = defaultdict(list)      # missing key -> a new []\nfor n in [1, 2, 3, 4, 5]:\n    key = \"even\" if n % 2 == 0 else \"odd\"\n    groups[key].append(n)\n\nprint(dict(groups))", output: "{'odd': [1, 3, 5], 'even': [2, 4]}" },
  { t: "code", file: "namedtuple.py", code: "from collections import namedtuple\n\nPoint = namedtuple(\"Point\", [\"x\", \"y\"])\np = Point(3, 4)\n\nprint(p.x, p.y)       # named access, not p[0], p[1]\nprint(tuple(p))       # still a real tuple", output: "3 4\n(3, 4)" },
  { t: "note", variant: "tip", html: "<b>Reach for the right one:</b> <code>defaultdict(int)</code> to count, <code>defaultdict(list)</code> to group items under keys, <code>namedtuple</code> when a tuple's positions need names so <code>p.x</code> reads better than <code>p[0]</code>. There is also <code>deque</code> for fast adds and pops at <b>both</b> ends." },

  { t: "h2", n: "3", text: "itertools: smart looping" },
  { t: "p", html: "<code>itertools</code> builds efficient iterators. <code>accumulate</code> gives a running total, <code>chain</code> joins iterables end to end, <code>combinations</code> lists every pairing." },
  { t: "code", file: "itertools.py", code: "from itertools import accumulate, chain, combinations\n\nprint(list(accumulate([1, 2, 3, 4])))       # running total\nprint(list(chain([1, 2], [3, 4])))          # joined\nprint(list(combinations([1, 2, 3], 2)))     # every pair", output: "[1, 3, 6, 10]\n[1, 2, 3, 4]\n[(1, 2), (1, 3), (2, 3)]" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> these are everyday data moves. <code>Counter</code> for frequency tables and top-N (most common word, busiest hour, top error). <code>defaultdict(list)</code> to group rows under a key before aggregating — the same shape as a SQL <code>GROUP BY</code>. <code>accumulate</code> for cumulative sums in a time series. They are also lazy where it counts, so they scale, and they read clearly — which matters more than a clever one-liner when a teammate reads your code next week." },

  { t: "h2", n: "4", text: "functools.reduce: fold to one value" },
  { t: "p", html: "<code>reduce</code> combines a whole list into a single value by applying a function pairwise, left to right. It is how you express \"multiply everything\" or \"combine all\" when there is no built-in like <code>sum</code>." },
  { t: "code", file: "reduce.py", code: "from functools import reduce\n\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]))     # 1*2*3*4\nprint(reduce(lambda a, b: a + b, [1, 2, 3], 100))  # start from 100", output: "24\n106" },
  { t: "analogy", concept: "reduce", real: "Folding a strip of paper", html: "<code>reduce</code> is folding a long strip of paper down to one square. You fold the first two sections together, then fold that result into the third, then into the fourth — each fold combines \"everything so far\" with the next piece, until one square remains. The function you pass is the fold; the optional starting value is the square you begin with. <code>sum</code> and <code>max</code> are just named folds you use so often they got their own name." },

  { t: "trace", intro: "Counter, defaultdict, itertools and reduce. Work out each value.", code: "from collections import Counter\nfrom itertools import accumulate\nfrom functools import reduce\n\nc = Counter([\"x\", \"y\", \"x\", \"x\", \"z\"])\na = c[\"x\"]\nb = c[\"q\"]\nd = c.most_common(1)\ne = list(accumulate([2, 2, 2]))\nf = reduce(lambda p, n: p + n, [10, 20, 30])", steps: [
    { q: "After line 6, <code>a</code> is", answer: "3", why: "x appears three times in the list, and <code>c[\"x\"]</code> reads its count." },
    { q: "After line 7, <code>b</code> is", answer: "0", why: "q is not in the list, and a Counter returns 0 for a missing key rather than raising KeyError." },
    { q: "After line 8, <code>d</code> is", answer: "[('x', 3)]", why: "<code>most_common(1)</code> returns the single most frequent item as a (item, count) pair in a list." },
    { q: "After line 9, <code>e</code> is", answer: "[2, 4, 6]", why: "<code>accumulate</code> gives the running total: 2, then 2+2, then 2+2+2." },
    { q: "After line 10, <code>f</code> is", answer: "60", why: "<code>reduce</code> adds left to right: (10+20)=30, then 30+30 = 60." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Count the items in a list with Counter.", code: "from collections import Counter\n\nprint(dict(Counter([\"a\", \"b\", \"a\"])))", out: "{'a': 2, 'b': 1}" },
    { task: "Find the single most common item.", code: "from collections import Counter\n\nprint(Counter([1, 2, 2, 3, 2]).most_common(1))", out: "[(2, 3)]" },
    { task: "Show a missing key returns 0, not an error.", code: "from collections import Counter\n\nprint(Counter(\"aab\")[\"z\"])", out: "0" },
    { task: "Group numbers into odd and even with defaultdict.", code: "from collections import defaultdict\n\ng = defaultdict(list)\nfor n in [1, 2, 3, 4]:\n    g[n % 2].append(n)\nprint(dict(g))", out: "{1: [1, 3], 0: [2, 4]}" },
    { task: "Count letters with defaultdict(int).", code: "from collections import defaultdict\n\nd = defaultdict(int)\nfor ch in \"banana\":\n    d[ch] += 1\nprint(dict(d))", out: "{'b': 1, 'a': 3, 'n': 2}" },
    { task: "Make a namedtuple and read a field by name.", code: "from collections import namedtuple\n\nCar = namedtuple(\"Car\", [\"make\", \"year\"])\nc = Car(\"Tata\", 2024)\nprint(c.make, c.year)", out: "Tata 2024" },
    { task: "Get the running total of a list.", code: "from itertools import accumulate\n\nprint(list(accumulate([5, 5, 5, 5])))", out: "[5, 10, 15, 20]" },
    { task: "Join two lists into one iterator with chain.", code: "from itertools import chain\n\nprint(list(chain([1, 2], [3, 4], [5])))", out: "[1, 2, 3, 4, 5]" },
    { task: "Multiply every number in a list with reduce.", code: "from functools import reduce\n\nprint(reduce(lambda a, b: a * b, [2, 3, 4]))", out: "24" },
    { task: "Sum a list with reduce and a starting value.", code: "from functools import reduce\n\nprint(reduce(lambda a, b: a + b, [1, 2, 3], 10))", out: "16" },
  ]},

  { t: "mistakes", items: [
    { bad: "counts = {}\nfor ch in \"hello\":\n    counts[ch] += 1", why: "On the first sight of a letter, <code>counts[ch]</code> does not exist, so the read half of <code>+= 1</code> raises <code>KeyError</code>. Use <code>Counter</code> or <code>defaultdict(int)</code>.", fix: "from collections import Counter\ncounts = Counter(\"hello\")" },
    { bad: "from collections import Counter\ntop = Counter(votes).most_common(1)\nwinner = top", why: "<code>most_common(1)</code> returns a <b>list of one (item, count) pair</b>, like <code>[('a', 3)]</code> — not the item. Index into it: <code>[0][0]</code> for the item.", fix: "top = Counter(votes).most_common(1)\nwinner = top[0][0]" },
    { bad: "from collections import namedtuple\nPoint = namedtuple(\"Point\", [\"x\", \"y\"])\np = Point(3)", why: "A namedtuple needs a value for <b>every</b> field, so <code>Point(3)</code> raises <code>TypeError</code> — <code>y</code> is missing. Pass all fields, or give some a default.", fix: "p = Point(3, 4)" },
    { bad: "from functools import reduce\ntotal = reduce(lambda a, b: a + b, [])", why: "<code>reduce</code> on an <b>empty</b> list with no starting value raises <code>TypeError</code> — there is nothing to fold. Pass an initial value to make it safe.", fix: "total = reduce(lambda a, b: a + b, [], 0)" },
  ]},

  { t: "debug", intro: "A function counts how many times each word appears in a list. It crashes with a KeyError on the first word, before counting anything. Read it before opening the fix.", code: "def word_counts(words):\n    counts = {}\n    for w in words:\n        counts[w] += 1\n    return counts\n\nprint(word_counts([\"a\", \"b\", \"a\"]))", symptom: "KeyError: 'a'", q: "The loop clearly adds 1 for each word. So why does it fail on the very first word, 'a'?", fix: "from collections import Counter\n\ndef word_counts(words):\n    return dict(Counter(words))\n\nprint(word_counts([\"a\", \"b\", \"a\"]))", why: "<code>counts[w] += 1</code> expands to <code>counts[w] = counts[w] + 1</code>, which must first <b>read</b> <code>counts[w]</code>. On the first word that key is not in the dict yet, so the read raises <code>KeyError</code> — the increment never even happens. A plain dict has no default for a missing key.<br/><br/><code>Counter</code> is built for exactly this: <code>Counter(words)</code> tallies the whole list in one call, treating any unseen key as 0. If you want to keep the loop, <code>defaultdict(int)</code> also works — it creates a missing key as 0 on first access. Either way you stop hand-writing the initialise-then-increment dance, which is where this bug always comes from." },

  { t: "recap", items: [
    "<code>Counter(iterable)</code> tallies frequencies; a missing key is <b>0</b>, and <code>.most_common(n)</code> gives the top n",
    "<code>defaultdict(int)</code> to count, <code>defaultdict(list)</code> to group — no KeyError on missing keys",
    "<code>namedtuple</code> makes a tuple with named fields: <code>p.x</code> instead of <code>p[0]</code>",
    "<code>itertools.accumulate</code> running total · <code>chain</code> join · <code>combinations</code> pairings",
    "<code>functools.reduce(fn, seq)</code> folds a list into one value; give it an initial value for safety",
    "<code>most_common(1)</code> returns <code>[(item, count)]</code> — index <code>[0][0]</code> for just the item",
    "These are the everyday tools of frequency, grouping and aggregation in data work",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What does <code>collections.Counter</code> do?", a: "It is a dict subclass built for counting: <code>Counter(iterable)</code> tallies how many times each element appears, indexing a missing key returns 0 instead of raising, and <code>.most_common(n)</code> returns the n highest-count items already sorted. It replaces the common initialise-and-increment loop, and is the go-to for frequency tables and top-N questions." },
    { level: "beginner", q: "What problem does <code>defaultdict</code> solve?", a: "It removes the KeyError you get when updating a key that does not exist yet. You pass a factory — <code>int</code>, <code>list</code>, <code>set</code> — and any missing key is created with that default on first access. <code>defaultdict(int)</code> is ideal for counting and <code>defaultdict(list)</code> for grouping items under keys, so you can write <code>d[key].append(x)</code> without checking whether <code>key</code> is present." },
    { level: "intermediate", q: "When would you use a namedtuple?", a: "When you have a small, fixed record and want named, self-documenting fields without the weight of a class. <code>namedtuple(\"Point\", [\"x\", \"y\"])</code> gives you <code>p.x</code> and <code>p.y</code> while remaining a real, immutable tuple — it unpacks, compares and indexes like one. It is clearer than positional tuple access for things like coordinates, database rows, or return values with several parts. For mutable or behaviour-rich records, a dataclass or class is the next step up." },
    { level: "intermediate", q: "What does <code>functools.reduce</code> do, and when is it appropriate?", a: "It folds an iterable into a single value by applying a two-argument function cumulatively from left to right — <code>reduce(mul, [1,2,3,4])</code> gives 24. It is appropriate when you are aggregating to one result and there is no dedicated built-in; for sums and maxes you should prefer <code>sum</code> and <code>max</code>, which are clearer and faster. Always pass an initial value if the iterable might be empty, or reduce raises a TypeError." },
    { level: "intermediate", q: "Why use <code>itertools</code> functions instead of writing the loops yourself?", a: "They are lazy iterators implemented in C, so they are memory-efficient and fast, and they express intent clearly — <code>accumulate</code>, <code>chain</code>, <code>groupby</code>, <code>combinations</code> each name a common pattern. Using them avoids off-by-one bugs and materialising large intermediate lists, and a reader instantly recognises the operation. They compose well too, letting you build a pipeline of transformations that streams data rather than building it all in memory." },
  ]},
];
const L33 = [
  { t: "objectives", items: [
    "Pull a filename, stem and extension apart with <code>pathlib</code>",
    "Build paths that work on Windows, Mac and Linux",
    "Check whether a file exists before you open it",
    "Read environment variables safely with <code>os.environ.get</code>",
    "Know what <code>sys</code> gives you: version, arguments, exit",
  ]},
  { t: "hook", q: "You build a file path by hand — <code>folder + \"\\\\\" + name</code> — and it works perfectly on your Windows laptop. You deploy to a Linux server and every file is suddenly \"not found\". What broke?", why: "The separator. Windows uses <code>\\</code> between folders, but Mac and Linux use <code>/</code> — so a path you glued together with a hardcoded backslash is meaningless on the server. This is exactly what <code>pathlib</code> exists to fix: <code>Path(folder) / name</code> uses the right separator for whatever machine it runs on. You never type a slash again, and the same code works everywhere." },
  { t: "think", q: "To get a file's extension, why not just do <code>filename.split(\".\")[-1]</code>?", a: "Because it breaks on the edge cases. For <code>\"data.csv\"</code> it returns <code>\"csv\"</code> — fine. But for <code>\"README\"</code> with no extension it returns the <b>whole name</b>, <code>\"README\"</code>, because there is no dot to split on. And it drops the dot you often want.<br/><br/><code>Path(\"README\").suffix</code> returns <code>\"\"</code> — correctly, no extension — and <code>Path(\"data.csv\").suffix</code> returns <code>\".csv\"</code> with the dot. pathlib knows what a path actually <i>is</i>, so it handles the cases your <code>split</code> forgets." },

  { t: "h2", n: "1", text: "pathlib: reading a path apart" },
  { t: "def", term: "pathlib", en: "pathlib is the modern standard-library module for filesystem paths; a Path object exposes a path's parts — name, stem, suffix, parent — and joins paths with the / operator using the correct OS separator.", hi: "In plain words: <code>pathlib</code> paths ke saath kaam ka aadhunik tareeka hai — filename, extension, parent sab seedha nikaal deta hai, aur Windows/Mac dono pe sahi separator use karta hai." },
  { t: "p", html: "A <code>Path</code> exposes the pieces of a path as properties, so you never split strings by hand. <code>.name</code>, <code>.stem</code>, <code>.suffix</code> and <code>.parent</code> cover most needs." },
  { t: "code", file: "parts.py", code: "from pathlib import Path\n\np = Path(\"reports/2024/sales.csv\")\nprint(p.name)      # file plus extension\nprint(p.stem)      # name without the suffix\nprint(p.suffix)    # the extension, with the dot\nprint(p.parent.name)  # the folder above the file", output: "sales.csv\nsales\n.csv\n2024" },
  { t: "viz", name: "path-lab" },
  { t: "p", html: "Click the paths in that panel. The same string is a name, a stem, a suffix, a parent and a tuple of parts all at once — pathlib reads each out for you, correctly, including the awkward cases like a file with no extension." },

  { t: "h2", n: "2", text: "Joining paths that work everywhere" },
  { t: "p", html: "The <code>/</code> operator joins path pieces with the correct separator for the current OS. To print a path with forward slashes on <b>any</b> machine, use <code>.as_posix()</code>." },
  { t: "code", file: "join.py", code: "from pathlib import Path\n\nfull = Path(\"data\") / \"2024\" / \"sales.csv\"\nprint(full.as_posix())      # forward slashes on every OS\nprint(full.name)\nprint(full.suffix)", output: "data/2024/sales.csv\nsales.csv\n.csv" },
  { t: "note", variant: "warn", html: "<b>Printing a joined path is the one thing that differs by OS.</b> <code>str(Path(\"a\") / \"b\")</code> is <code>a\\b</code> on Windows and <code>a/b</code> on Mac/Linux — so never compare or hardcode a path's string form. Use <code>.as_posix()</code> for a consistent display, and the pieces (<code>.name</code>, <code>.suffix</code>) for logic." },

  { t: "h2", n: "3", text: "os: existence, and the environment" },
  { t: "p", html: "<code>os.path.exists</code> checks whether a path is there before you open it. <code>os.environ.get(name, default)</code> reads an environment variable without crashing when it is unset." },
  { t: "code", file: "os.py", code: "import os\n\nprint(os.path.exists(\"definitely_not_here.txt\"))   # False\nprint(os.path.basename(\"reports/data.csv\"))         # just the file\nprint(os.path.splitext(\"data.csv\"))                 # name and ext\n\n# a missing variable returns the default, not a KeyError\nprint(os.environ.get(\"NOT_A_REAL_VAR\", \"fallback\"))", output: "False\ndata.csv\n('data', '.csv')\nfallback" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> real programs read configuration and secrets from <b>environment variables</b> — database URLs, API keys — never hardcoded. <code>os.environ.get(\"DATABASE_URL\")</code> is how a deployed app finds its database, and <code>os.path.exists</code> guards a data-loading step so a missing file gives a clear message instead of a crash. pathlib then keeps those paths portable across your laptop and the server, which almost never run the same OS." },

  { t: "h2", n: "4", text: "sys: Python and the runtime" },
  { t: "p", html: "<code>sys</code> exposes the interpreter and how it was launched: the version, the command-line arguments (<code>sys.argv</code>), and <code>sys.exit</code> to stop with a status code." },
  { t: "code", file: "sys.py", code: "import sys\n\nprint(sys.version_info.major)   # 3 on any Python 3\nprint(sys.maxsize > 0)          # a huge platform-dependent int\nprint(type(sys.argv).__name__)  # the command-line args, a list", output: "3\nTrue\nlist" },
  { t: "analogy", concept: "os / sys / pathlib", real: "Tools for the building your program lives in", html: "Your program runs inside a building — the operating system. <code>pathlib</code> is the <b>floor plan</b>: it names rooms and hallways (paths) correctly no matter which building you are in. <code>os</code> is the <b>facilities desk</b>: it tells you whether a room exists and reads the building's settings (environment variables). <code>sys</code> is information about the <b>building itself and how you entered</b> — which version, which door (arguments), and the exit. You reach for each depending on whether you are asking about a path, the surroundings, or the runtime." },

  { t: "trace", intro: "pathlib properties and os helpers. All outputs are deterministic. Work out each value.", code: "from pathlib import Path\nimport os\n\np = Path(\"docs/notes/todo.md\")\n\na = p.name\nb = p.suffix\nc = p.stem\nd = (Path(\"a\") / \"b\" / \"c.txt\").as_posix()\ne = os.path.splitext(\"photo.jpg\")[1]", steps: [
    { q: "After line 6, <code>a</code> is", answer: "todo.md", why: "<code>.name</code> is the final component of the path, file plus extension." },
    { q: "After line 7, <code>b</code> is", answer: ".md", why: "<code>.suffix</code> is the extension including the dot." },
    { q: "After line 8, <code>c</code> is", answer: "todo", why: "<code>.stem</code> is the name without its suffix." },
    { q: "After line 9, <code>d</code> is", answer: "a/b/c.txt", why: "The <code>/</code> operator joins the pieces, and <code>.as_posix()</code> prints them with forward slashes on any OS." },
    { q: "After line 10, <code>e</code> is", answer: ".jpg", why: "<code>os.path.splitext</code> returns (name, ext); index [1] is the extension, <code>.jpg</code>." },
  ]},

  { t: "drills", intro: "One per idea. Write each yourself before opening the answer.", items: [
    { task: "Get the filename from a path.", code: "from pathlib import Path\n\nprint(Path(\"reports/2024/data.csv\").name)", out: "data.csv" },
    { task: "Get the extension of a file.", code: "from pathlib import Path\n\nprint(Path(\"photo.jpg\").suffix)", out: ".jpg" },
    { task: "Get the name without its extension.", code: "from pathlib import Path\n\nprint(Path(\"archive.zip\").stem)", out: "archive" },
    { task: "Show a file with no extension has an empty suffix.", code: "from pathlib import Path\n\nprint(repr(Path(\"README\").suffix))", out: "''" },
    { task: "Join folders into a path, printed with forward slashes.", code: "from pathlib import Path\n\nprint((Path(\"data\") / \"raw\" / \"a.csv\").as_posix())", out: "data/raw/a.csv" },
    { task: "Get the parent folder's name.", code: "from pathlib import Path\n\nprint(Path(\"a/b/c.txt\").parent.name)", out: "b" },
    { task: "Check whether a missing file exists.", code: "import os\n\nprint(os.path.exists(\"no_such_file_xyz.txt\"))", out: "False" },
    { task: "Split a filename into name and extension.", code: "import os\n\nprint(os.path.splitext(\"report.pdf\"))", out: "('report', '.pdf')" },
    { task: "Read an environment variable with a default.", code: "import os\n\nprint(os.environ.get(\"UNSET_VARIABLE_XYZ\", \"default\"))", out: "default" },
    { task: "Get the Python major version from sys.", code: "import sys\n\nprint(sys.version_info.major)", out: "3" },
  ]},

  { t: "mistakes", items: [
    { bad: "path = folder + \"\\\\\" + filename", why: "A hardcoded <code>\\</code> only works on Windows — on Mac and Linux it becomes part of the filename and the path is wrong. Join with pathlib's <code>/</code>, which uses the right separator everywhere.", fix: "from pathlib import Path\npath = Path(folder) / filename" },
    { bad: "ext = filename.split(\".\")[-1]", why: "For <code>\"README\"</code> with no dot this returns the whole name, and it drops the leading dot you usually want. <code>Path.suffix</code> handles both correctly.", fix: "from pathlib import Path\next = Path(filename).suffix" },
    { bad: "import os\nkey = os.environ[\"API_KEY\"]", why: "Indexing <code>os.environ</code> for a variable that is not set raises <code>KeyError</code> and crashes the program. Use <code>.get</code> with a default, or handle the missing case.", fix: "import os\nkey = os.environ.get(\"API_KEY\", \"\")" },
    { bad: "with open(\"data.csv\") as f:\n    rows = f.read()", why: "If the file is not there this raises <code>FileNotFoundError</code>. When a path might be missing, check first (or catch), so you can give a clear message instead of a crash.", fix: "import os\nif os.path.exists(\"data.csv\"):\n    with open(\"data.csv\") as f:\n        rows = f.read()" },
  ]},

  { t: "debug", intro: "A function pulls the extension off a filename to route files by type. It works for normal files, but a file with no extension gets routed completely wrong. Read it before opening the fix.", code: "def extension(filename):\n    return filename.split(\".\")[-1]\n\nprint(extension(\"data.csv\"))\nprint(extension(\"README\"))", symptom: "prints csv, then README (a file with no extension reports its whole name as the extension)", q: "For data.csv it returns csv, which looks right. So why does README come back as its own extension?", fix: "from pathlib import Path\n\ndef extension(filename):\n    return Path(filename).suffix\n\nprint(extension(\"data.csv\"))\nprint(extension(\"README\"))", why: "<code>filename.split(\".\")[-1]</code> takes the last piece after splitting on dots. When there is <b>no</b> dot, <code>split</code> returns a single-element list — the whole string — so <code>[-1]</code> is the entire filename. <code>\"README\"</code> has no extension, but the code confidently reports its extension as <code>\"README\"</code>, and any routing that switches on the result sends it to the wrong place.<br/><br/><code>Path(filename).suffix</code> understands paths: it returns <code>\".csv\"</code> for a real extension (with the dot) and <code>\"\"</code> for a file with none. pathlib also gets the other tricky cases right — a leading-dot dotfile like <code>\".bashrc\"</code> has no suffix, and <code>\"archive.tar.gz\"</code> gives <code>\".gz\"</code>. Whenever you are picking a path apart, reach for pathlib rather than string splitting." },

  { t: "recap", items: [
    "<code>Path(...).name</code> file · <code>.stem</code> name-without-ext · <code>.suffix</code> ext-with-dot · <code>.parent</code> folder",
    "A file with no extension has <code>.suffix == \"\"</code> — string splitting gets this wrong",
    "Join paths with <code>/</code>; it uses the right separator for the OS — never hardcode <code>\\</code> or <code>/</code>",
    "Only <b>displaying</b> a joined path differs by OS — use <code>.as_posix()</code> for consistent forward slashes",
    "<code>os.path.exists(path)</code> checks a file before you open it",
    "<code>os.environ.get(name, default)</code> reads config safely — indexing raises KeyError when unset",
    "<code>sys</code> gives the version (<code>sys.version_info</code>), arguments (<code>sys.argv</code>) and <code>sys.exit</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Why use pathlib instead of building path strings by hand?", a: "Because pathlib is portable and structured. The <code>/</code> operator joins path pieces with the correct separator for the operating system, so the same code runs on Windows and Linux, and properties like <code>.name</code>, <code>.stem</code>, <code>.suffix</code> and <code>.parent</code> extract parts correctly, including edge cases that string splitting gets wrong. Hand-built paths with a hardcoded separator break the moment the code moves to a different OS." },
    { level: "beginner", q: "How do you safely read an environment variable?", a: "With <code>os.environ.get(name, default)</code>, which returns the default (or None) when the variable is not set, rather than raising. Indexing directly with <code>os.environ[name]</code> raises <code>KeyError</code> if it is missing, which crashes the program. Environment variables are how deployed apps receive configuration and secrets like database URLs and API keys, so reading them defensively matters." },
    { level: "intermediate", q: "Why can <code>str(Path(\"a\") / \"b\")</code> differ between machines, and how do you avoid surprises?", a: "Because pathlib renders a path using the running OS's separator — a backslash on Windows, a forward slash on Mac and Linux — so the string form is platform-dependent. You avoid trouble by never comparing or hardcoding a path's string form: use the structured properties for logic, and call <code>.as_posix()</code> when you specifically need forward slashes, for example in a URL or a cross-platform config file." },
    { level: "intermediate", q: "What is the difference between <code>os</code>, <code>sys</code> and <code>pathlib</code>?", a: "<code>pathlib</code> is about filesystem paths — constructing, joining and dissecting them portably. <code>os</code> is a broader interface to the operating system: checking whether files exist, listing directories, reading environment variables, and lower-level path helpers in <code>os.path</code>. <code>sys</code> is about the Python runtime itself — the interpreter version, the command-line arguments in <code>sys.argv</code>, the module search path, and <code>sys.exit</code>. You pick based on whether the question is about a path, the surrounding system, or the interpreter." },
    { level: "intermediate", q: "How would you make a script's file handling work on both Windows and Linux?", a: "Use pathlib for every path: build them with <code>Path</code> and the <code>/</code> operator so separators are handled automatically, extract parts with the properties rather than string operations, and avoid embedding literal separators. Read any machine-specific locations from environment variables through <code>os.environ.get</code> instead of hardcoding them, and when you must serialise a path to text, normalise it with <code>.as_posix()</code>. That keeps the logic identical across operating systems." },
  ]},
];
const L34 = [
  { t: "objectives", items: [
    "Read and write <b>CSV</b> — and know every value comes back a <b>string</b>",
    "Read named columns cleanly with <code>csv.DictReader</code>",
    "Save any Python object with <b>pickle</b> — and why you must not trust one",
    "Store and query data with the built-in <b>sqlite3</b> database",
    "Use <code>?</code> placeholders to avoid SQL injection",
  ]},
  { t: "hook", q: "You read a CSV of prices and add them up — <code>total += row[\"price\"]</code> — and it crashes with <code>unsupported operand: 'int' and 'str'</code>. The file plainly contains numbers. Why are they strings?", why: "Because CSV is <b>text</b>. There are no types in a CSV file — <code>21</code> and <code>\"21\"</code> look identical on disk, so <code>csv.reader</code> hands everything back as a <code>str</code>. It cannot know you meant a number. You convert the columns you need: <code>int(row[\"price\"])</code>. This single fact — CSV loses all types — is behind most CSV bugs, and it is exactly why <code>pandas.read_csv</code> later spends effort <i>inferring</i> types for you." },
  { t: "think", q: "CSV, pickle and SQLite all save data. When would you pick each?", a: "It depends on who reads it back and what you need to do with it.<br/><br/><b>CSV</b> when a human or another program (Excel, R, anything) must open it — readable text, but flat and untyped. <b>Pickle</b> when you want to save an <b>arbitrary Python object</b> — a nested dict, a trained model — and only Python will read it back. <b>SQLite</b> when you need to <b>query, filter and update</b> data — a real database in one file, no server. Reach for the one whose trade-off matches the job, not whichever you used last." },

  { t: "h2", n: "1", text: "CSV: the everyday format" },
  { t: "def", term: "CSV", en: "CSV (comma-separated values) is a plain-text table format where each line is a row and commas separate the columns; because it is text, it carries no type information — every field reads back as a string.", hi: "In plain words: CSV ek text table hai — har line ek row, comma se columns alag. Sab kuch string ban ke aata hai, kyunki text me types hote hi nahi." },
  { t: "p", html: "<code>csv.reader</code> gives you each row as a list of strings; <code>csv.DictReader</code> uses the header row to give you a dict per row, keyed by column name — much easier to read." },
  { t: "code", file: "csv_read.py", code: "import csv, io\n\ntext = \"name,age\\nFreya,21\\nOm,25\"\n\nrows = list(csv.reader(io.StringIO(text)))\nprint(rows)                         # lists of strings\nprint(type(rows[1][1]).__name__)    # 'str' - not int!\n\nfor r in csv.DictReader(io.StringIO(text)):\n    print(r[\"name\"], r[\"age\"])", output: "[['name', 'age'], ['Freya', '21'], ['Om', '25']]\nstr\nFreya 21\nOm 25" },
  { t: "note", variant: "warn", html: "<b>Every CSV value is a string.</b> To do maths you must convert: <code>int(row[\"age\"])</code> or <code>float(row[\"price\"])</code>. And when <b>writing</b> a CSV to a real file, open it with <code>newline=\"\"</code> — otherwise Windows inserts a blank line between every row." },

  { t: "h2", n: "2", text: "pickle: save any Python object" },
  { t: "p", html: "<code>pickle</code> serialises almost any Python object — nested dicts, lists, custom classes — to bytes, and loads it straight back, types intact. <code>dumps</code>/<code>loads</code> work in memory; <code>dump</code>/<code>load</code> use a file." },
  { t: "code", file: "pickle.py", code: "import pickle\n\ndata = {\"scores\": [90, 85], \"name\": \"Freya\"}\n\nblob = pickle.dumps(data)       # object -> bytes\nback = pickle.loads(blob)       # bytes -> object\n\nprint(back)\nprint(back == data)             # a faithful copy\nprint(type(blob).__name__)      # bytes", output: "{'scores': [90, 85], 'name': 'Freya'}\nTrue\nbytes" },
  { t: "note", variant: "warn", html: "<b>Never unpickle data you did not create.</b> Loading a pickle can execute <b>arbitrary code</b> hidden inside it, so a malicious pickle can take over your program. Pickle is for your own trusted data only — for anything crossing a trust boundary, use JSON or CSV. Pickle is also Python-only: other languages cannot read it." },

  { t: "h2", n: "3", text: "sqlite3: a real database, no server" },
  { t: "p", html: "<code>sqlite3</code> is a full SQL database built into Python, stored in a single file (or in memory). You <code>connect</code>, get a <code>cursor</code>, <code>execute</code> SQL, and <code>fetchall</code> the results." },
  { t: "code", file: "sqlite.py", code: "import sqlite3\n\nconn = sqlite3.connect(\":memory:\")   # in-memory DB\ncur = conn.cursor()\ncur.execute(\"CREATE TABLE users (name TEXT, age INTEGER)\")\ncur.execute(\"INSERT INTO users VALUES (?, ?)\", (\"Freya\", 21))\ncur.execute(\"INSERT INTO users VALUES (?, ?)\", (\"Om\", 25))\n\ncur.execute(\"SELECT name FROM users WHERE age > ?\", (22,))\nprint(cur.fetchall())\nconn.close()", output: "[('Om',)]" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> these are the persistence layers under real work. Datasets arrive as CSV — you will read thousands of them, and <code>pandas.read_csv</code> builds on exactly this. SQLite backs local apps, test databases, and analytics prototypes because it needs no server. Pickle caches expensive results — a fitted model, a parsed dataset — so you compute once and load instantly next run. Knowing which to reach for, and CSV's string trap, saves hours of confusing type bugs." },
  { t: "viz", name: "storage-lab" },
  { t: "p", html: "Flip between the three in that panel. The same two rows are readable text in CSV, opaque bytes in pickle, and a queryable table in SQLite — and the flags show what each keeps and gives up. Match the format to the job, not to habit." },

  { t: "h2", n: "4", text: "Placeholders, not string-building" },
  { t: "p", html: "Always pass values with <code>?</code> placeholders, never by formatting them into the SQL string. Placeholders are safe from <b>SQL injection</b> and handle quoting and types for you." },
  { t: "code", file: "safe.py", code: "import sqlite3\n\nconn = sqlite3.connect(\":memory:\")\ncur = conn.cursor()\ncur.execute(\"CREATE TABLE t (name TEXT)\")\ncur.execute(\"INSERT INTO t VALUES (?)\", (\"O'Brien\",))   # quote handled safely\n\ncur.execute(\"SELECT COUNT(*) FROM t WHERE name = ?\", (\"O'Brien\",))\nprint(cur.fetchone()[0])\nconn.close()", output: "1" },
  { t: "analogy", concept: "? placeholders vs f-string SQL", real: "A fill-in form vs letting a stranger write the sentence", html: "A <code>?</code> placeholder is a <b>form with a labelled blank</b>: the database treats whatever you put in the blank strictly as a <b>value</b>, never as commands. Building SQL with an f-string is like letting the input <b>write part of the sentence</b> — if someone types <code>'; DROP TABLE users; --</code>, that becomes SQL and runs. The placeholder keeps data as data. It is not just safety: it also handles quotes (like the apostrophe in O'Brien) and types correctly, so it is less code too." },

  { t: "trace", intro: "CSV strings, pickle round-trip, and a SQLite query. All deterministic. Work out each value.", code: "import csv, io, pickle, sqlite3\n\nrows = list(csv.reader(io.StringIO(\"a,b\\n1,2\\n3,4\")))\nx = rows[1][0]\ny = type(x).__name__\n\nz = pickle.loads(pickle.dumps([10, 20]))\n\nconn = sqlite3.connect(\":memory:\")\nc = conn.cursor()\nc.execute(\"CREATE TABLE n (v INTEGER)\")\nc.executemany(\"INSERT INTO n VALUES (?)\", [(5,), (10,), (15,)])\nc.execute(\"SELECT SUM(v) FROM n\")\nw = c.fetchone()[0]", steps: [
    { q: "After line 4, <code>x</code> is", answer: "1", why: "The first data row is <code>['1','2']</code>, and <code>rows[1][0]</code> is the string '1'." },
    { q: "After line 5, <code>y</code> is", answer: "str", why: "CSV values are always strings — the number in the file comes back as <code>str</code>, not int." },
    { q: "After line 7, <code>z</code> is", answer: "[10, 20]", why: "<code>pickle.dumps</code> then <code>loads</code> round-trips the list back to an identical list." },
    { q: "After line 14, <code>w</code> is", answer: "30", why: "The table holds 5, 10, 15, and <code>SUM(v)</code> adds them to 30." },
  ]},

  { t: "drills", intro: "One per idea. All in-memory and deterministic. Write each before opening the answer.", items: [
    { task: "Read a CSV string into rows.", code: "import csv, io\n\nprint(list(csv.reader(io.StringIO(\"x,y\\n1,2\"))))", out: "[['x', 'y'], ['1', '2']]" },
    { task: "Show a CSV number comes back as a string.", code: "import csv, io\n\nrows = list(csv.reader(io.StringIO(\"n\\n42\")))\nprint(type(rows[1][0]).__name__)", out: "str" },
    { task: "Read named columns with DictReader.", code: "import csv, io\n\nfor r in csv.DictReader(io.StringIO(\"name,age\\nOm,25\")):\n    print(r[\"name\"], r[\"age\"])", out: "Om 25" },
    { task: "Sum a CSV column, converting to int.", code: "import csv, io\n\nrows = csv.DictReader(io.StringIO(\"v\\n10\\n20\\n30\"))\nprint(sum(int(r[\"v\"]) for r in rows))", out: "60" },
    { task: "Round-trip a dict through pickle.", code: "import pickle\n\nd = {\"a\": 1, \"b\": [2, 3]}\nprint(pickle.loads(pickle.dumps(d)) == d)", out: "True" },
    { task: "Confirm pickle produces bytes.", code: "import pickle\n\nprint(type(pickle.dumps([1, 2, 3])).__name__)", out: "bytes" },
    { task: "Create a SQLite table and count rows.", code: "import sqlite3\n\nc = sqlite3.connect(\":memory:\").cursor()\nc.execute(\"CREATE TABLE t (x INTEGER)\")\nc.execute(\"INSERT INTO t VALUES (1)\")\nc.execute(\"INSERT INTO t VALUES (2)\")\nc.execute(\"SELECT COUNT(*) FROM t\")\nprint(c.fetchone()[0])", out: "2" },
    { task: "Query with a ? placeholder.", code: "import sqlite3\n\nc = sqlite3.connect(\":memory:\").cursor()\nc.execute(\"CREATE TABLE p (age INTEGER)\")\nc.executemany(\"INSERT INTO p VALUES (?)\", [(20,), (30,)])\nc.execute(\"SELECT COUNT(*) FROM p WHERE age > ?\", (25,))\nprint(c.fetchone()[0])", out: "1" },
    { task: "Insert many rows with executemany.", code: "import sqlite3\n\nc = sqlite3.connect(\":memory:\").cursor()\nc.execute(\"CREATE TABLE t (v INTEGER)\")\nc.executemany(\"INSERT INTO t VALUES (?)\", [(1,), (2,), (3,)])\nc.execute(\"SELECT SUM(v) FROM t\")\nprint(c.fetchone()[0])", out: "6" },
    { task: "Fetch all rows from a query.", code: "import sqlite3\n\nc = sqlite3.connect(\":memory:\").cursor()\nc.execute(\"CREATE TABLE t (name TEXT)\")\nc.executemany(\"INSERT INTO t VALUES (?)\", [(\"a\",), (\"b\",)])\nc.execute(\"SELECT name FROM t ORDER BY name\")\nprint(c.fetchall())", out: "[('a',), ('b',)]" },
  ]},

  { t: "mistakes", items: [
    { bad: "import csv, io\ntotal = 0\nfor row in csv.reader(io.StringIO(\"5\\n10\")):\n    total += row[0]", why: "CSV values are strings, so <code>total += row[0]</code> tries to add an int and a str — <code>TypeError</code>. Convert first with <code>int(row[0])</code>.", fix: "for row in csv.reader(io.StringIO(\"5\\n10\")):\n    total += int(row[0])" },
    { bad: "import sqlite3\nname = user_input\ncur.execute(f\"SELECT * FROM users WHERE name = '{name}'\")", why: "Formatting input into the SQL string is a <b>SQL injection</b> hole — input like <code>'; DROP TABLE users; --</code> becomes runnable SQL. Use a <code>?</code> placeholder.", fix: "cur.execute(\"SELECT * FROM users WHERE name = ?\", (name,))" },
    { bad: "import pickle\ndata = pickle.loads(bytes_from_the_internet)", why: "Unpickling untrusted bytes can execute arbitrary code and compromise your machine. Only unpickle data you produced; for external data use JSON.", fix: "import json\ndata = json.loads(text_from_the_internet)" },
    { bad: "import csv\nwith open(\"out.csv\", \"w\") as f:\n    csv.writer(f).writerow([\"a\", \"b\"])", why: "Without <code>newline=\"\"</code>, the csv module and Windows both add line endings, so you get a blank row between each line. Always open CSV files with <code>newline=\"\"</code>.", fix: "with open(\"out.csv\", \"w\", newline=\"\") as f:\n    csv.writer(f).writerow([\"a\", \"b\"])" },
  ]},

  { t: "debug", intro: "A function totals the prices in a small CSV of purchases. It crashes on the first row instead of returning a total. Read it before opening the fix.", code: "import csv, io\n\ndef total_price(text):\n    total = 0\n    for row in csv.DictReader(io.StringIO(text)):\n        total += row[\"price\"]\n    return total\n\nprint(total_price(\"item,price\\napple,10\\nmilk,20\"))", symptom: "TypeError: unsupported operand type(s) for +=: 'int' and 'str'", q: "The prices in the CSV are clearly 10 and 20. So why can't they be added to the total?", fix: "import csv, io\n\ndef total_price(text):\n    total = 0\n    for row in csv.DictReader(io.StringIO(text)):\n        total += int(row[\"price\"])\n    return total\n\nprint(total_price(\"item,price\\napple,10\\nmilk,20\"))", why: "A CSV file is plain text with no type information, so <code>csv.DictReader</code> returns every field as a <b>string</b> — <code>row[\"price\"]</code> is <code>\"10\"</code>, not <code>10</code>. Adding a string to the integer <code>total</code> raises <code>TypeError</code> on the very first row.<br/><br/>The fix is to convert each value as you read it: <code>int(row[\"price\"])</code> (or <code>float</code> for decimals). This is the defining gotcha of raw CSV work — the numbers <i>look</i> like numbers but are text until you cast them. It is also exactly the problem <code>pandas.read_csv</code> solves by inferring column types automatically, which is why data scientists reach for pandas the moment a CSV has more than a few columns." },

  { t: "recap", items: [
    "<b>CSV</b> is text: <code>csv.reader</code> gives lists, <code>DictReader</code> gives named dicts — every value a <b>string</b>",
    "Convert CSV numbers with <code>int()</code>/<code>float()</code>; write files with <code>newline=\"\"</code>",
    "<b>pickle</b> saves any Python object (<code>dumps</code>/<code>loads</code>) — binary, Python-only",
    "<b>Never</b> unpickle untrusted data — it can run arbitrary code",
    "<b>sqlite3</b> is a real SQL database in one file: <code>connect</code> → <code>cursor</code> → <code>execute</code> → <code>fetchall</code>",
    "Always use <code>?</code> placeholders, never f-strings, in SQL — safe from injection",
    "Choose by need: CSV to share, pickle to snapshot Python objects, SQLite to query",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Why do numbers read from a CSV come back as strings?", a: "Because CSV is a plain-text format with no type information — on disk, <code>21</code> and <code>\"21\"</code> are identical characters. The <code>csv</code> module therefore returns every field as a <code>str</code>, and it is up to you to convert the columns you need with <code>int</code> or <code>float</code>. Forgetting this conversion is the most common CSV bug, and it is one reason libraries like pandas add automatic type inference on top of CSV." },
    { level: "beginner", q: "What is pickle for, and what is its main danger?", a: "Pickle serialises almost any Python object — nested structures, custom class instances — into bytes and reconstructs it exactly, which is ideal for caching computed results or saving Python-specific state. Its main danger is security: unpickling data can execute arbitrary code embedded in it, so you must never load a pickle from an untrusted source. It is also Python-only, so it is unsuitable for sharing data with other languages, where JSON or CSV fit better." },
    { level: "intermediate", q: "Why should you use parameterised queries instead of formatting values into SQL?", a: "To prevent SQL injection. When you build a query with an f-string, any special characters in the input are interpreted as SQL, so a crafted value like <code>'; DROP TABLE users; --</code> can run destructive commands. A parameterised query with <code>?</code> placeholders sends the values separately from the SQL text, so the database always treats them as data, never as code. It also handles quoting and type conversion for you, so it is safer and simpler." },
    { level: "intermediate", q: "When would you choose CSV, pickle, or SQLite?", a: "CSV when the data is tabular and must be readable by humans or other tools — it is universal but flat and untyped. Pickle when you need to persist an arbitrary Python object exactly and only Python will read it back, such as caching a model or a parsed structure — but never for untrusted or cross-language data. SQLite when you need to query, filter, join or update data efficiently and want a real database without running a server. The decision is about readability, type fidelity, and whether you need to query." },
    { level: "intermediate", q: "What is the role of a cursor in sqlite3?", a: "A cursor is the object you use to execute SQL statements and step through their results. You get one from a connection with <code>conn.cursor()</code>, call <code>execute</code> (or <code>executemany</code>) on it, then retrieve rows with <code>fetchone</code>, <code>fetchmany</code> or <code>fetchall</code>. The connection represents the database session and handles transactions — you call <code>conn.commit()</code> to persist changes — while the cursor is the handle for running queries and reading their output." },
  ]},
];
const L35 = [
  { t: "objectives", items: [
    "Check your own code with <code>assert</code>, and read what a failure tells you",
    "Write a small <code>unittest</code> class and run it",
    "Choose test cases that catch real bugs — the empty case, the single case, the edge",
    "Explain why a passing test suite is a claim, not a proof",
  ]},
  { t: "hook", q: "You change one line in a function that six other functions call. How do you know you have not broken any of them?", why: "You run the program and try a few things — and you check the cases you happened to think of, in the mood you happened to be in. A test suite is the same checking, written down once, and repeated identically every time you touch the code. That is the entire idea." },
  { t: "def", term: "Test", en: "A test is code that runs your code with known input and fails loudly if the result is not what was expected.", hi: "It is not a special skill or a separate tool. A test is an ordinary function that calls your function and complains when the answer is wrong." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> the first thing an interviewer looks for in a GitHub project is whether there is a <code>tests/</code> folder — it separates someone who writes scripts from someone who ships. And in real data work the value is concrete: a cleaning function tested on the empty file, the one-row file and the file with a missing column will not take your Sunday away." },

  { t: "h2", n: "1", text: "assert — the smallest test there is" },
  { t: "p", html: "<code>assert</code> takes a condition. If it is true, nothing happens and the program moves on. If it is false, Python raises <code>AssertionError</code> and stops." },
  { t: "code", file: "assert_basic.py", code: "def average(nums):\n    if not nums:\n        return 0.0\n    return sum(nums) / len(nums)\n\nassert average([2, 4, 6]) == 4.0\nassert average([5]) == 5.0\nassert average([]) == 0.0\n\nprint(\"all 3 passed\")", output: "all 3 passed" },
  { t: "viz", name: "test-lab" },
  { t: "p", html: "Swap the implementation in that panel. Notice the middle one: it passes both ordinary cases and fails only on the empty list — which is exactly the shape of a bug that survives review and then arrives at two in the morning." },
  { t: "code", file: "failing.py", code: "def double(n):\n    return n + n\n\ntry:\n    assert double(3) == 7\nexcept AssertionError:\n    print(\"AssertionError: double(3) was not 7\")", output: "AssertionError: double(3) was not 7" },

  { t: "h2", n: "2", text: "unittest — tests with names" },
  { t: "p", html: "Once there is more than a handful, tests want names and a runner that reports them. <code>unittest</code> ships with Python, so there is nothing to install." },
  { t: "code", file: "unittest_run.py", code: "import unittest\nimport io\n\ndef add(a, b):\n    return a + b\n\nclass TestAdd(unittest.TestCase):\n    def test_positive(self):\n        self.assertEqual(add(2, 3), 5)\n\n    def test_negative(self):\n        self.assertEqual(add(-1, 1), 0)\n\nsuite = unittest.TestLoader().loadTestsFromTestCase(TestAdd)\nresult = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\n\nprint(\"ran\", result.testsRun, \"tests, failures:\", len(result.failures))", output: "ran 2 tests, failures: 0" },
  { t: "note", variant: "tip", html: "Every test method must start with <code>test_</code> — that is how the runner finds them. A method named <code>check_positive</code> is simply never run, and a suite that silently skips half its tests still reports success." },

  { t: "h2", n: "3", text: "Which cases are worth writing" },
  { t: "p", html: "A test that only tries the case you had in mind while writing the code proves very little. The cases that earn their keep are the ones at the boundaries." },
  { t: "code", file: "edge.py", code: "def first_word(text):\n    parts = text.split()\n    if not parts:\n        return \"\"\n    return parts[0]\n\nassert first_word(\"hello world\") == \"hello\"\nassert first_word(\"  padded  \") == \"padded\"\nassert first_word(\"\") == \"\"\n\nprint(\"edges covered\")", output: "edges covered" },
  { t: "think", q: "Your tests all pass. Does that mean the code is correct?", a: "No. It means it is correct <b>for the cases you thought of</b>.<br/><br/>A passing suite is a claim with a known scope, not a proof. That is why bugs found in production are worth turning into tests: the bug proved that a case existed which nobody had imagined, and adding it means that particular surprise can only happen once." },
  { t: "analogy", concept: "A test suite", real: "The checks before a flight", html: "A pilot does not inspect an aircraft by feel each time, in whatever order occurs to them. There is a list, it is the same list every flight, and it is worked through even when everything looks fine. It does not make a crash impossible; it makes the <b>known</b> failures impossible to forget. A test suite is that list for your code." },

  { t: "trace", intro: "A clamp function that keeps a number inside a range. Work out what each name holds once the line has run.", code: "def clamp(n, low, high):\n    if n < low:\n        return low\n    if n > high:\n        return high\n    return n\n\na = clamp(5, 1, 10)\nb = clamp(-3, 1, 10)\nc = clamp(99, 1, 10)", steps: [
    { q: "After line 8, <code>a</code> is", answer: "5", why: "5 is inside the range, so neither guard fires and the value comes back unchanged. This is the case everybody tests first." },
    { q: "After line 9, <code>b</code> is", answer: "1", why: "Below the floor, so the first guard returns <code>low</code>. This is a boundary case, and it is where a wrong comparison would show up." },
    { q: "After line 10, <code>c</code> is", answer: "10", why: "Above the ceiling. Three assertions covering these three lines would catch almost any mistake in this function — which is what makes it a good size to test." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Assert something true, then print a confirmation.", code: "assert 1 + 1 == 2\nprint(\"ok\")", out: "ok" },
    { task: "Write a function and assert its result.", code: "def double(n):\n    return n * 2\n\nassert double(4) == 8\nprint(\"passed\")", out: "passed" },
    { task: "Catch a failing assertion.", code: "try:\n    assert 1 == 2\nexcept AssertionError:\n    print(\"caught\")", out: "caught" },
    { task: "Give an assertion a message and print it.", code: "try:\n    assert False, \"boom\"\nexcept AssertionError as e:\n    print(e)", out: "boom" },
    { task: "Test the empty case of a function.", code: "def total(nums):\n    return sum(nums)\n\nassert total([]) == 0\nprint(\"empty case ok\")", out: "empty case ok" },
    { task: "Test a negative input.", code: "def sign(n):\n    return \"neg\" if n < 0 else \"pos\"\n\nassert sign(-4) == \"neg\"\nprint(\"passed\")", out: "passed" },
    { task: "Assert on a string result.", code: "assert \"data\".upper() == \"DATA\"\nprint(\"ok\")", out: "ok" },
    { task: "Assert on a list result.", code: "assert sorted([3, 1, 2]) == [1, 2, 3]\nprint(\"ok\")", out: "ok" },
    { task: "Check that a value round-trips.", code: "n = 42\nassert int(str(n)) == n\nprint(\"round trip ok\")", out: "round trip ok" },
    { task: "Run several checks in a loop and count the passes.", code: "cases = [(1, 2), (2, 4), (3, 6)]\npassed = 0\nfor n, want in cases:\n    if n * 2 == want:\n        passed += 1\nprint(passed, \"of\", len(cases), \"passed\")", out: "3 of 3 passed" },
    { task: "Use <code>unittest</code>'s <code>assertEqual</code> directly.", code: "import unittest\n\ntc = unittest.TestCase()\ntc.assertEqual(2 + 2, 4)\nprint(\"assertEqual ok\")", out: "assertEqual ok" },
  ]},

  { t: "mistakes", items: [
    { bad: "def check_addition(self):\n    self.assertEqual(add(2, 3), 5)", why: "The runner only collects methods whose name begins with <code>test_</code>. This one is never called, and the suite reports success while testing nothing at all.", fix: "def test_addition(self):\n    self.assertEqual(add(2, 3), 5)" },
    { bad: "assert average([2, 4, 6]) == 4.0", why: "One test, and it is the case you already had in your head while writing the function. It cannot catch the empty list, the single item, or the negative number — which is where the bugs live.", fix: "assert average([2, 4, 6]) == 4.0\nassert average([5]) == 5.0\nassert average([]) == 0.0" },
    { bad: "assert clean(row) is not None", why: "This passes for almost any return value, including a wrong one. A test that cannot fail is worse than no test, because it produces confidence without evidence.", fix: "assert clean(\"  A1 \") == \"a1\"" },
    { bad: "python -O script.py   # with asserts as your safety net", why: "The <code>-O</code> flag <b>removes every assert</b> from the running program. That is fine for tests, which never run under it, and dangerous for validating real input — use a real check and <code>raise</code> for that.", fix: "if value < 0:\n    raise ValueError(\"value must not be negative\")" },
  ]},

  { t: "debug", intro: "Three test cases are collected and counted, and the suite reports that all of them passed. One of them is plainly wrong. Nothing crashes. Read it before opening the fix.", code: "def double(n):\n    return n * 2\n\ncases = [(1, 2), (2, 4), (3, 7)]\npassed = 0\n\nfor n, want in cases:\n    if double(n) == want:\n        passed += 1\n    continue\n\nprint(\"passed\", len(cases), \"of\", len(cases))", symptom: "prints passed 3 of 3, but double(3) is 6 and the case expects 7", q: "The comparison is right and the loop visits every case. So why does the report say everything passed?", fix: "def double(n):\n    return n * 2\n\ncases = [(1, 2), (2, 4), (3, 7)]\npassed = 0\n\nfor n, want in cases:\n    if double(n) == want:\n        passed += 1\n\nprint(\"passed\", passed, \"of\", len(cases))", why: "The loop counted correctly into <code>passed</code> — and then the report printed <code>len(cases)</code> instead. The number shown was never the number measured.<br/><br/>This is the most embarrassing failure a test suite can have, and it is common: the tests are fine, the <b>reporting</b> lies. It is exactly why you should watch a new test <b>fail</b> before you make it pass. A test you have only ever seen green might be checking nothing." },

  { t: "recap", items: [
    "<code>assert condition</code> is the smallest possible test — silent on success, loud on failure",
    "<code>unittest</code> is in the standard library; every test method must start with <code>test_</code>",
    "Test the boundaries: empty, one item, negative, too large",
    "A passing suite proves the cases you thought of, nothing more",
    "Watch a new test fail once, so you know it can",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What does <code>assert</code> do?", a: "It checks a condition. If it holds, execution continues silently; if not, Python raises <code>AssertionError</code> and stops. It is the simplest way to state what your code should be true of." },
    { level: "beginner", q: "Why write tests at all when you can just run the program?", a: "Because running it checks the cases you happen to try, in the order you happen to try them, and only today. A test suite writes those checks down once and repeats them identically after every change — which is when things break." },
    { level: "intermediate", q: "What makes a good test case?", a: "The boundaries rather than the middle: empty input, exactly one item, the largest allowed value, a negative, a wrong type. The happy path is the case you already had in mind while writing the code, so it is the least likely to find anything." },
    { level: "intermediate", q: "Your tests all pass. Is the code correct?", a: "It is correct for the cases that were written. A suite is a claim with a known scope, not a proof. That is why every bug found in production is worth converting into a test — it documents a case nobody had imagined." },
    { level: "advanced", q: "Why should you see a test fail before you trust it?", a: "Because a test that cannot fail proves nothing, and there are many ways to write one by accident — an assertion so loose that anything satisfies it, a method the runner never collects because of its name, or a report that prints the total instead of the count. Watching it go red first is the cheapest available evidence that it is actually connected to the code." },
  ]},
];
const L36 = [
  { t: "objectives", items: [
    "Say why <code>logging</code> replaces <code>print</code> once code leaves your laptop",
    "Use the five levels, and set the one that decides what you see",
    "Log a skipped row inside <code>except</code> so failures are recorded rather than hidden",
    "Read a traceback from the bottom up, and find the line that actually broke",
  ]},
  { t: "hook", q: "Your cleaning script ran overnight and finished. It kept 4,900 rows out of 5,000. Which hundred did it drop, and why?", why: "If the answer is \"no idea\", the script did not fail — it lied. Work that runs unattended has to leave a record behind, and that record is what logging is. A <code>print</code> can tell you something today; a log can tell you what happened last Tuesday at 3am." },
  { t: "def", term: "Logging", en: "Logging is recording events from a running program, each tagged with a severity level so the volume can be tuned without changing the code.", hi: "The important half is the <b>level</b>. Every message carries one, and one setting decides how much of it reaches you — the same code can be silent in production and fully detailed while you debug." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> a scheduled job with no logs is unmaintainable, because the only debugging tool left is running it again and hoping. The habit worth forming now is small: log <b>what was skipped and why</b>. Almost every data incident is a silently dropped row that nobody noticed for a month." },

  { t: "h2", n: "1", text: "Why not print?" },
  { t: "p", html: "<code>print</code> has one volume: on. It cannot be turned down, it carries no severity, no timestamp and no source, and it goes to standard output whether that is a terminal, a file or nowhere at all." },
  { t: "code", file: "first_log.py", code: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\nlogging.debug(\"row 41 raw value\")\nlogging.info(\"loaded 5000 rows\")\nlogging.warning(\"row 41 had a comma in a number\")", output: "INFO: loaded 5000 rows\nWARNING: row 41 had a comma in a number" },
  { t: "p", html: "Three messages were written and two appeared. The <code>debug</code> line is still in the code, doing nothing, costing nothing — and one setting away from coming back." },
  { t: "viz", name: "log-levels" },
  { t: "p", html: "Move the level in that panel. The code never changes; only how much of it reaches you does. That is the whole reason logging exists, and the thing <code>print</code> can never do." },

  { t: "h2", n: "2", text: "The five levels" },
  { t: "p", html: "<code>DEBUG</code> for detail you want while hunting, <code>INFO</code> for milestones, <code>WARNING</code> for something odd that was handled, <code>ERROR</code> for something that failed, <code>CRITICAL</code> for the run being over. Setting the level shows that level <b>and everything above it</b>." },
  { t: "code", file: "levels.py", code: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.WARNING,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\nlogging.info(\"this is hidden\")\nlogging.warning(\"this shows\")\nlogging.error(\"this shows too\")", output: "WARNING: this shows\nERROR: this shows too" },

  { t: "h2", n: "3", text: "Logging what you skipped" },
  { t: "p", html: "The most valuable line of logging in a data script sits inside an <code>except</code>. It turns a silently discarded row into a recorded one." },
  { t: "code", file: "skiplog.py", code: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\ndef parse(text):\n    try:\n        return int(text)\n    except ValueError:\n        logging.warning(\"could not parse %s, skipping\", text)\n        return None\n\nprint(parse(\"12\"))\nprint(parse(\"x\"))", output: "12\nWARNING: could not parse x, skipping\nNone" },
  { t: "note", variant: "tip", html: "Pass values as arguments — <code>logging.warning(\"skipped %s\", row)</code> — rather than building the string with <code>+</code> or an f-string. The formatting is then only done if the message is actually going to be shown, which matters when a <code>debug</code> line sits inside a loop over a million rows." },

  { t: "h2", n: "4", text: "Reading a traceback" },
  { t: "p", html: "A traceback is printed in call order, so the <b>last</b> lines are the ones that matter: the final line names the exception, and the frame just above it is where it happened. Everything higher up is how the program got there." },
  { t: "code", file: "logexc.py", code: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.ERROR,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    logging.error(\"division failed\")\n\nprint(\"carried on\")", output: "ERROR: division failed\ncarried on" },
  { t: "think", q: "You have a wrong number coming out of a 200-line script. What is the fastest way to find where it goes wrong?", a: "<b>Halve it.</b> Check the value at the midpoint. If it is already wrong there, the fault is in the first half; if it is still right, it is in the second. Repeat.<br/><br/>Ten steps of this locate a bad line in a thousand. Reading the whole file from the top is the slowest available method, and it is what most people do first." },
  { t: "analogy", concept: "Log levels", real: "A hospital triage desk", html: "Everyone who walks in is recorded, but not everyone interrupts the surgeon. Triage assigns a severity, and the setting decides who gets attention right now. <code>DEBUG</code> is the note in the file, <code>CRITICAL</code> is the alarm in the corridor — and crucially, the notes are still written even when nobody is reading them, so they are there when someone asks what happened." },

  { t: "trace", intro: "A small calculation with a bug hunt in mind. Work out what each name holds once the line has run.", code: "def net(price, tax):\n    total = price + tax\n    return total\n\na = net(100, 18)\nb = net(0, 0)\nc = a - b", steps: [
    { q: "After line 5, <code>a</code> is", answer: "118", why: "100 plus 18. Checking a known input like this is the first move when a result looks wrong — if the simple case is already broken, you can stop reading the rest." },
    { q: "After line 6, <code>b</code> is", answer: "0", why: "The zero case. It is worth checking precisely because it is the one nobody writes down, and it is where division and averaging tend to fail." },
    { q: "After line 7, <code>c</code> is", answer: "118", why: "118 minus 0. Narrowing a bug is exactly this: evaluate the pieces you can predict, and the first one that surprises you is where to look." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Log an informational message.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.info(\"started\")", out: "INFO: started" },
    { task: "Set the level so an <code>info</code> message is hidden.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.WARNING, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.info(\"hidden\")\nlogging.warning(\"shown\")", out: "WARNING: shown" },
    { task: "Log an error.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.error(\"bad row\")", out: "ERROR: bad row" },
    { task: "Put a value into the message the lazy way.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.warning(\"row %s skipped\", 41)", out: "WARNING: row 41 skipped" },
    { task: "Log from inside an <code>except</code>.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s: %(message)s\", force=True)\ntry:\n    int(\"x\")\nexcept ValueError:\n    logging.warning(\"could not parse\")", out: "WARNING: could not parse" },
    { task: "Give the logger a name and show it in the output.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(name)s: %(message)s\", force=True)\nlog = logging.getLogger(\"etl\")\nlog.warning(\"starting\")", out: "etl: starting" },
    { task: "Turn the detail back on with <code>DEBUG</code>.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.DEBUG, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.debug(\"raw value = ' 12 '\")", out: "DEBUG: raw value = ' 12 '" },
    { task: "Log a critical failure.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.critical(\"database unreachable\")", out: "CRITICAL: database unreachable" },
    { task: "Print the numeric value of the WARNING level.", code: "import logging\nprint(logging.WARNING)", out: "30" },
    { task: "Show that two messages at or above the level both appear.", code: "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.WARNING, format=\"%(levelname)s: %(message)s\", force=True)\nlogging.warning(\"first\")\nlogging.error(\"second\")", out: "WARNING: first\nERROR: second" },
    { task: "Read the last line of a caught exception, the way a traceback ends.", code: "try:\n    int(\"x\")\nexcept ValueError as e:\n    print(type(e).__name__)", out: "ValueError" },
  ]},

  { t: "mistakes", items: [
    { bad: "print(\"row\", n, \"skipped\")", why: "It cannot be turned off, carries no severity, and disappears entirely when the script runs as a scheduled job with nowhere to print to. Fine while writing; not what you leave behind.", fix: "logging.warning(\"row %s skipped\", n)" },
    { bad: "logging.debug(\"row \" + str(row))", why: "The string is built <b>every time</b>, even when the level means nobody will ever see it. Inside a loop over a million rows that is a million wasted concatenations.", fix: "logging.debug(\"row %s\", row)" },
    { bad: "except Exception:\n    logging.error(\"failed\")", why: "You have recorded that something failed and thrown away what it was. <code>logging.exception</code> logs the message <b>and</b> the traceback, which is the part that tells you where to look.", fix: "except Exception:\n    logging.exception(\"failed while saving\")" },
    { bad: "logging.info(\"starting\")\nlogging.basicConfig(level=logging.DEBUG)", why: "<code>basicConfig</code> only takes effect if no handler exists yet, and that first <code>info</code> call installs one. The configuration is silently ignored and the level never changes — configure before you log anything, or pass <code>force=True</code>.", fix: "logging.basicConfig(level=logging.DEBUG)\nlogging.info(\"starting\")" },
  ]},

  { t: "debug", intro: "This cleans three values and reports how many it kept. One row was dropped and there is a warning in the code for exactly that — but nothing about it appears. Read it before opening the fix.", code: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.ERROR,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\nrows = [\"12\", \"x\", \"7\"]\nclean = []\n\nfor r in rows:\n    try:\n        clean.append(int(r))\n    except ValueError:\n        logging.warning(\"skipped %s\", r)\n\nprint(\"kept\", len(clean), \"rows\")", symptom: "prints only 'kept 2 rows' - one row was dropped and nothing said so", q: "The warning is written, the except block definitely runs, and nothing crashes. So where did the message go?", fix: "import logging\nimport sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.WARNING,\n                    format=\"%(levelname)s: %(message)s\", force=True)\n\nrows = [\"12\", \"x\", \"7\"]\nclean = []\n\nfor r in rows:\n    try:\n        clean.append(int(r))\n    except ValueError:\n        logging.warning(\"skipped %s\", r)\n\nprint(\"kept\", len(clean), \"rows\")", why: "The level was set to <code>ERROR</code>, and a warning is below that, so the message was created and then discarded. The code was doing its job perfectly; the <b>dial</b> was set to hide it.<br/><br/>What makes this dangerous is the shape of the remaining output. \"kept 2 rows\" looks like a clean success, and there is no hint that a third row ever existed. If a log line matters enough to write, make sure the level it is written at is one you are actually listening to — and when a number looks slightly low, check the level before you check the logic." },

  { t: "recap", items: [
    "<code>print</code> has one volume; a log message carries a <b>level</b> you can tune",
    "DEBUG · INFO · WARNING · ERROR · CRITICAL — setting one shows it and everything above",
    "Log inside <code>except</code>, so a skipped row is recorded rather than lost",
    "Pass values as arguments (<code>\"%s\"</code>), not by building the string yourself",
    "Read a traceback from the <b>bottom</b>; narrow a bug by halving, not by re-reading",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "Why use <code>logging</code> instead of <code>print</code>?", a: "Because a log message has a severity and can be turned up or down without touching the code, and it can be sent to a file or a service rather than a terminal that may not exist. Print is a debugging aid; logging is what you leave in." },
    { level: "beginner", q: "Name the levels in order.", a: "DEBUG, INFO, WARNING, ERROR, CRITICAL. Setting the level to one of them shows that level and everything more severe, so a level of WARNING hides DEBUG and INFO." },
    { level: "intermediate", q: "How do you read a traceback?", a: "From the bottom. The last line names the exception and its message; the frame directly above it is the line that raised it. The frames further up are the path that got you there, which matters only once you know what broke." },
    { level: "intermediate", q: "Why write <code>logging.debug(\"row %s\", row)</code> instead of an f-string?", a: "Because the formatting is deferred until the message is known to be needed. With an f-string the text is built on every call even when the level means it will be thrown away — measurable inside a large loop, and free to avoid." },
    { level: "advanced", q: "What is the difference between <code>logging.error</code> and <code>logging.exception</code>?", a: "<code>logging.exception</code> is <code>error</code> plus the current traceback, and it is only meaningful inside an <code>except</code> block. It preserves the part that identifies the failing line — without it you have recorded that something went wrong and destroyed the evidence of what." },
  ]},
];
const L37 = [
  { t: "objectives", items: [
    "Name things so the code explains itself, in the style PEP 8 expects",
    "Space and lay out code the way every Python reader is used to",
    "Write a docstring and type hints, and know what each one is for",
    "Recognise the habits that make code hard to change — magic numbers, long functions, stale comments",
  ]},
  { t: "hook", q: "You open a file you wrote four months ago and the first function is <code>def calc(x, y, z):</code>. How long before you can safely change one line?", why: "Long enough to be annoying, and the person paying for that time is you. Code is read far more often than it is written, and almost always by someone who has forgotten it — which is why clean code is not politeness. It is the cheapest speed-up available." },
  { t: "def", term: "PEP 8", en: "PEP 8 is Python's official style guide: the shared conventions for naming, spacing and layout that make unfamiliar Python readable.", hi: "None of it changes what the code does. All of it changes how quickly the next person understands it — and it is a <b>convention</b>, so the value comes from everyone following the same one." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> the first real judgement anyone makes about you is reading your code. In a review, unclear names and hundred-line functions get more comments than algorithms do — because a reviewer who cannot follow the code cannot approve it. Teams automate the mechanical half with <code>black</code> and <code>ruff</code>; naming and structure stay yours." },

  { t: "h2", n: "1", text: "Names" },
  { t: "p", html: "PEP 8 asks for <code>lower_case_with_underscores</code> for functions and variables, <code>CapWords</code> for classes and <code>UPPER_CASE</code> for constants. Beyond the shape: a name should say what the thing <b>is</b>, not what type it happens to be." },
  { t: "code", file: "names.py", code: "def area(width, height):\n    return width * height\n\nprint(area(3, 4))", output: "12" },
  { t: "viz", name: "style-lab" },
  { t: "p", html: "Step through the rules in that panel. Every pair does exactly the same thing — the difference is entirely in how long it takes to be sure of that." },

  { t: "h2", n: "2", text: "Spacing and layout" },
  { t: "p", html: "One space around operators and after commas, none just inside brackets or before a colon, four spaces per indent level, and a blank line to separate ideas." },
  { t: "code", file: "spacing.py", code: "price = 250\nqty = 3\ntotal = price * qty\n\nif total > 500:\n    discount = total * 0.1\nelse:\n    discount = 0\n\nprint(total, discount)", output: "750 75.0" },

  { t: "h2", n: "3", text: "Docstrings" },
  { t: "p", html: "A docstring is the first string in a function, and it goes <b>inside</b> the definition. That position is what makes it reachable by <code>help()</code>, by your editor's tooltip and by documentation tools — a comment above the <code>def</code> reaches none of them." },
  { t: "code", file: "docstring.py", code: "def area(width, height):\n    \"\"\"Return the area of a rectangle.\"\"\"\n    return width * height\n\nprint(area.__doc__)\nprint(area(2, 5))", output: "Return the area of a rectangle.\n10" },

  { t: "h2", n: "4", text: "Type hints" },
  { t: "p", html: "Hints say what a function expects and returns. Python does not enforce them at all — they are for the reader, the editor and the type checker." },
  { t: "code", file: "hints.py", code: "def area(width: float, height: float) -> float:\n    return width * height\n\nprint(area(2.5, 4))\nprint(area.__annotations__[\"width\"].__name__)", output: "10.0\nfloat" },
  { t: "note", variant: "tip", html: "Because they are not enforced, a hint that has drifted out of date is <b>worse than none</b> — it is a confident statement that happens to be false. Either keep them true or leave them off; a type checker such as <code>mypy</code> is what keeps them honest at scale." },
  { t: "think", q: "Should a comment explain <b>what</b> the code does, or <b>why</b> it does it?", a: "<b>Why.</b> The code already says what it does, and says it more reliably — a comment can go stale while the line beneath it changes.<br/><br/><code># add 1 to i</code> is noise. <code># the vendor's export is 1-indexed</code> is information that exists nowhere else in the file, and it is exactly what the next reader will need." },

  { t: "h2", n: "5", text: "One job per function" },
  { t: "p", html: "A function that does one thing can be named accurately, tested on its own, and reused. A function that does three cannot be named at all — which is why the vague ones tend to be called <code>process</code> or <code>handle</code>." },
  { t: "code", file: "onejob.py", code: "def clean(name):\n    \"\"\"Strip surrounding spaces and lower-case a name.\"\"\"\n    return name.strip().lower()\n\ndef label(name):\n    \"\"\"Format a cleaned name for display.\"\"\"\n    return \"user: \" + clean(name)\n\nprint(label(\"  Freya  \"))", output: "user: freya" },
  { t: "analogy", concept: "Clean code", real: "A kitchen at the end of the shift", html: "Every cook can work in their own mess for one evening. The rule exists because tomorrow morning someone else opens the kitchen — and the time they spend finding the knives is time the food does not get made. Naming things well is putting the knives back in the block. It costs you seconds and saves the next person minutes, and often the next person is you." },

  { t: "trace", intro: "A small cleaning helper. Work out what each name holds once the line has run.", code: "def clean(name):\n    \"\"\"Strip surrounding spaces and lower-case a name.\"\"\"\n    return name.strip().lower()\n\nraw = \"  Freya  \"\ntidy = clean(raw)\nsize = len(tidy)\nshout = tidy.upper()", steps: [
    { q: "After line 6, <code>tidy</code> is", answer: "freya", why: "Stripped and lower-cased. The function name says exactly this, which is the point — you did not have to read its body to answer." },
    { q: "After line 7, <code>size</code> is", answer: "5", why: "Five letters, because the spaces were removed first. Had <code>raw</code> been measured instead it would be 9." },
    { q: "After line 8, <code>shout</code> is", answer: "FREYA", why: "Upper-cased from the cleaned value. Note that <code>raw</code> is still the original padded string — none of these steps changed it." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Write a function with a name that explains it.", code: "def area(width, height):\n    return width * height\n\nprint(area(2, 6))", out: "12" },
    { task: "Space an expression the way PEP 8 asks.", code: "total = 3 * 4 + 2\nprint(total)", out: "14" },
    { task: "Read a function's docstring.", code: "def greet():\n    \"\"\"Say hello.\"\"\"\n    return \"hi\"\n\nprint(greet.__doc__)", out: "Say hello." },
    { task: "Add type hints and read one back.", code: "def double(n: int) -> int:\n    return n * 2\n\nprint(double.__annotations__[\"n\"].__name__)", out: "int" },
    { task: "Name a constant the way PEP 8 expects.", code: "GST_RATE = 0.18\nprint(GST_RATE)", out: "0.18" },
    { task: "Replace a magic number with a named constant.", code: "MAX_ROWS = 500\nrows = 620\nprint(rows > MAX_ROWS)", out: "True" },
    { task: "Split one job out into its own function.", code: "def clean(name):\n    return name.strip().lower()\n\nprint(clean(\"  Freya \"))", out: "freya" },
    { task: "Use an early return instead of nesting.", code: "def sign(n):\n    if n < 0:\n        return \"neg\"\n    return \"pos\"\n\nprint(sign(-2))", out: "neg" },
    { task: "Give a boolean a name that reads as a question.", code: "is_adult = 20 >= 18\nprint(is_adult)", out: "True" },
    { task: "Build a message with an f-string rather than joining pieces.", code: "name = \"Freya\"\nprint(f\"user: {name}\")", out: "user: Freya" },
    { task: "Say the same thing in one readable comprehension.", code: "prices = [100, 250]\nprint([p * 2 for p in prices])", out: "[200, 500]" },
  ]},

  { t: "mistakes", items: [
    { bad: "def calc(x, y, z):\n    return (x * y) - z", why: "Four names and not one of them says anything. The reader has to reconstruct the intent from the arithmetic every single time, and can never be quite sure they got it right.", fix: "def net_total(price, qty, discount):\n    return (price * qty) - discount" },
    { bad: "if total > 5000:\n    discount = total * 0.2", why: "Two magic numbers. Nobody can tell whether 5000 is a business rule or a guess, and when it changes it has to be found in every file it was copied into.", fix: "BULK_THRESHOLD = 5000\nBULK_DISCOUNT = 0.2\n\nif total > BULK_THRESHOLD:\n    discount = total * BULK_DISCOUNT" },
    { bad: "def process(rows):\n    # reads the file, cleans it,\n    # writes it, and emails a report\n    ...", why: "A function that does four things cannot be named after any of them — which is why it ended up called <code>process</code>. It also cannot be tested in pieces or reused for three of the four.", fix: "rows = read_rows(path)\nclean = clean_rows(rows)\nwrite_rows(clean, out_path)\nsend_report(clean)" },
    { bad: "i = i + 1   # add 1 to i", why: "The comment repeats the line without adding anything, and it will still say this after the line changes. Comments should carry what the code cannot: the reason.", fix: "i = i + 1   # the vendor's export is 1-indexed" },
  ]},

  { t: "debug", intro: "Each call adds one item to a fresh basket and returns it. The second call comes back with two items in it. Nothing crashes. Read it before opening the fix.", code: "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item(\"pen\"))\nprint(add_item(\"book\"))", symptom: "prints ['pen', 'book'] on the second call, but each call was given only one item", q: "The default is an empty list and the function was called twice. So why is the second basket not empty?", fix: "def add_item(item, basket=None):\n    if basket is None:\n        basket = []\n    basket.append(item)\n    return basket\n\nprint(add_item(\"pen\"))\nprint(add_item(\"book\"))", why: "A default argument is evaluated <b>once</b>, when the <code>def</code> line runs — not on each call. So there is exactly one list, created at import time, and every call that omits the argument appends to that same one.<br/><br/>This is the most famous trap in Python, and it is here rather than in a chapter on functions for a reason: it is invisible in a single call, it never raises, and it looks like the tidiest possible way to write the signature. The fix is the standard idiom — default to <code>None</code> and build the real default inside. Any mutable default (list, dict, set) is the same bug waiting." },

  { t: "recap", items: [
    "<code>snake_case</code> for functions and variables, <code>CapWords</code> for classes, <code>UPPER_CASE</code> for constants",
    "One space around operators, four per indent, blank lines between ideas",
    "A <b>docstring</b> goes inside the function; a comment above the <code>def</code> reaches nothing",
    "Comments explain <b>why</b>; the code already says what",
    "One job per function — and never a mutable default argument",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is PEP 8?", a: "Python's official style guide — naming, spacing, indentation and layout. None of it changes behaviour; all of it makes unfamiliar Python readable, and the value comes precisely from everyone following the same conventions." },
    { level: "beginner", q: "Where does a docstring go, and why does the position matter?", a: "As the first string <b>inside</b> the function or class. That is where <code>help()</code>, editors and documentation tools look for it. A comment placed above the <code>def</code> reads the same to a human and is invisible to all of them." },
    { level: "intermediate", q: "Do type hints change how Python runs?", a: "No — they are not enforced at runtime. They exist for readers, editors and type checkers such as <code>mypy</code>. That is also why a stale hint is worse than none: it is a confident claim that is no longer true." },
    { level: "intermediate", q: "What should a comment say?", a: "Why, not what. The code states what it does more reliably than any comment, and a comment describing it goes stale the moment the line changes. The reason behind a decision exists nowhere else in the file." },
    { level: "advanced", q: "Why is <code>def f(items=[])</code> a bug?", a: "The default is evaluated once, when the function is defined, so every call sharing that default shares <b>one</b> list — appends accumulate across calls. It is invisible with a single call and never raises. The idiom is <code>def f(items=None)</code> with <code>if items is None: items = []</code> inside, and it applies to any mutable default." },
  ]},
];
const L38 = [
  { t: "objectives", items: [
    "Lay a project out in files and folders instead of one long script",
    "Use <code>if __name__ == \"__main__\"</code>, and say what it actually guards against",
    "Track work with the four git commands that cover almost everything",
    "Keep secrets and generated files out of the repository with <code>.gitignore</code>",
  ]},
  { t: "hook", q: "Your analysis works. It is one file, 800 lines, called <code>final_v3_FINAL.py</code>, and yesterday's working version is gone. What do you do?", why: "Everyone does this once. The fix is not discipline — it is two habits: split the file so each part can be understood alone, and let git keep the history so no version is ever lost. Neither takes more than a minute to start." },
  { t: "def", term: "Repository", en: "A repository is a project folder whose full history of changes is tracked by git, so any previous state can be recovered.", hi: "Git does not save files; it saves <b>changes</b>, each with a message and an author. That is why you can ask what a file looked like last Tuesday, and why nothing needs a <code>_final_v3</code> in its name ever again." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> a GitHub link is on your CV whether you plan it or not, and it is opened. What is looked at is not cleverness — it is whether the repository has a readable structure, a README, real commit messages, and no <code>.env</code> full of passwords. Those four things put a project ahead of most of what gets submitted." },

  { t: "h2", n: "1", text: "A layout instead of a script" },
  { t: "p", html: "Split by responsibility, not by length. Each file should be describable in one sentence." },
  { t: "note", variant: "tip", html: "<pre>sales-report/\n├── README.md          what it is, how to run it\n├── requirements.txt   the packages it needs\n├── .gitignore         what git must never track\n├── src/\n│   ├── load.py        reading the data\n│   ├── clean.py       fixing the data\n│   └── report.py      producing the output\n└── tests/\n    └── test_clean.py  proof that clean.py works</pre>" },
  { t: "viz", name: "git-flow" },
  { t: "p", html: "Step through that panel before reading further. The reason git confuses people is that three different places are all called \"my code\", and a change has to be moved through them deliberately." },

  { t: "h2", n: "2", text: "The __main__ guard" },
  { t: "p", html: "When a file is run directly, Python sets <code>__name__</code> to <code>\"__main__\"</code>. When it is <b>imported</b>, <code>__name__</code> is the module's own name instead. The guard uses that difference." },
  { t: "code", file: "name_main.py", code: "def build():\n    return \"report built\"\n\nprint(__name__)\nprint(build())", output: "__main__\nreport built" },
  { t: "p", html: "Without the guard, everything at the top level of a file runs the moment somebody imports it — so importing one helper function from <code>report.py</code> would run the whole report. With it, the file can be both a reusable module and a runnable script." },
  { t: "code", file: "guard.py", code: "def build():\n    return \"report built\"\n\nif __name__ == \"__main__\":\n    print(build())", output: "report built" },

  { t: "h2", n: "3", text: "Modules are objects too" },
  { t: "p", html: "An import binds a module to a name, and you can inspect it like anything else. This is worth seeing once, because it demystifies what <code>import</code> actually does." },
  { t: "code", file: "modules.py", code: "import json\n\nprint(json.__name__)\nprint(type(json).__name__)\nprint(hasattr(json, \"dumps\"))", output: "json\nmodule\nTrue" },

  { t: "h2", n: "4", text: "Configuration that does not leak" },
  { t: "p", html: "Shared defaults belong in one place — and must be <b>copied</b> when used, or one caller's changes reach everyone. This is the list-aliasing trap wearing a project-sized hat." },
  { t: "code", file: "config.py", code: "DEFAULTS = {\"rows\": 100, \"debug\": False}\n\ndef make_config(extra):\n    cfg = dict(DEFAULTS)\n    cfg.update(extra)\n    return cfg\n\na = make_config({\"rows\": 500})\nb = make_config({})\n\nprint(a[\"rows\"], b[\"rows\"])", output: "500 100" },

  { t: "h2", n: "5", text: "The four git commands" },
  { t: "p", html: "There are hundreds. These four cover almost every day of ordinary work, and they map exactly onto the panel above." },
  { t: "note", variant: "tip", html: "<pre>git status                 what has changed, and what is staged\ngit add report.py          stage this change for the next commit\ngit commit -m \"Add report\" save it to local history, with a message\ngit push                   send local history to GitHub</pre>" },
  { t: "note", variant: "warn", html: "<b>Never commit secrets.</b> A password pushed once stays in the history even after you delete the file, and public repositories are scanned for keys within minutes. Put <code>.env</code> in <code>.gitignore</code> <b>before</b> the first commit, along with <code>venv/</code>, <code>__pycache__/</code> and any generated data — a repository should hold what you wrote, not what your machine produced." },
  { t: "think", q: "What makes a good commit message?", a: "It says <b>what changed and why</b>, in a line someone can read in a list six months later.<br/><br/><code>update</code>, <code>fix</code> and <code>changes</code> say nothing — and a history of forty of them is no history at all. <code>Fix date parsing for rows exported from the vendor portal</code> is the whole story, and it is the message you will be grateful for when a bug appears and you are reading back through the log." },
  { t: "analogy", concept: "Git's three places", real: "Writing, then posting, a letter", html: "The <b>working directory</b> is the page you are writing on — changeable, unsaved, yours. <b>Staging</b> is choosing which pages go in the envelope, and you may choose only some. The <b>commit</b> is sealing it with a note on the front saying what it is. <b>Pushing</b> is putting it in the postbox. Until that last step, only your desk has a copy." },

  { t: "trace", intro: "A shared defaults dictionary, used twice. Work out what each name holds once the line has run.", code: "DEFAULTS = {\"rows\": 100}\n\ndef make_config(extra):\n    cfg = dict(DEFAULTS)\n    cfg.update(extra)\n    return cfg\n\nbig = make_config({\"rows\": 500})[\"rows\"]\nplain = make_config({})[\"rows\"]\noriginal = DEFAULTS[\"rows\"]", steps: [
    { q: "After line 8, <code>big</code> is", answer: "500", why: "The copy was updated with the caller's value. The copy is the important word — <code>dict(DEFAULTS)</code> built a new dictionary before touching anything." },
    { q: "After line 9, <code>plain</code> is", answer: "100", why: "No overrides were given, so the defaults come through untouched. This only holds because the previous call worked on a copy." },
    { q: "After line 10, <code>original</code> is", answer: "100", why: "The shared defaults survived both calls. Remove the <code>dict(...)</code> and this would be 500 — which is the debug task below." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the name Python gives a file that is run directly.", code: "print(__name__)", out: "__main__" },
    { task: "Guard code so it only runs as a script.", code: "def build():\n    return \"built\"\n\nif __name__ == \"__main__\":\n    print(build())", out: "built" },
    { task: "Import a module and print its name.", code: "import json\nprint(json.__name__)", out: "json" },
    { task: "Check that a module has a function before using it.", code: "import math\nprint(hasattr(math, \"sqrt\"))", out: "True" },
    { task: "Import one name out of a module.", code: "from math import sqrt\nprint(sqrt(9))", out: "3.0" },
    { task: "Import a module under a shorter alias.", code: "import math as m\nprint(m.floor(2.7))", out: "2" },
    { task: "Name a configuration constant the way PEP 8 expects.", code: "MAX_ROWS = 500\nprint(MAX_ROWS)", out: "500" },
    { task: "Copy a defaults dictionary before changing it.", code: "DEFAULTS = {\"rows\": 100}\ncfg = dict(DEFAULTS)\ncfg[\"rows\"] = 500\nprint(DEFAULTS[\"rows\"])", out: "100" },
    { task: "Read the major number out of a version string.", code: "VERSION = \"1.2.0\"\nprint(VERSION.split(\".\")[0])", out: "1" },
    { task: "Confirm a module is loaded after importing it.", code: "import json\nimport sys\nprint(\"json\" in sys.modules)", out: "True" },
    { task: "Build a message from a module-level constant.", code: "VERSION = \"1.2.0\"\n\ndef describe():\n    return f\"report v{VERSION}\"\n\nprint(describe())", out: "report v1.2.0" },
  ]},

  { t: "mistakes", items: [
    { bad: "# report.py\nrows = load_everything()\nbuild_report(rows)", why: "There is no guard, so this runs the entire report the moment anything imports <code>report.py</code> — including your test file, which now takes four minutes and hits the database.", fix: "def main():\n    rows = load_everything()\n    build_report(rows)\n\nif __name__ == \"__main__\":\n    main()" },
    { bad: "git add .\ngit commit -m \"update\"", why: "Two problems. <code>add .</code> sweeps in whatever happens to be in the folder — the virtual environment, cached files, the <code>.env</code> with your database password. And \"update\" tells the next reader nothing at all.", fix: "git add src/clean.py\ngit commit -m \"Fix date parsing for vendor exports\"" },
    { bad: "def make_config(extra):\n    cfg = DEFAULTS\n    cfg.update(extra)\n    return cfg", why: "<code>cfg = DEFAULTS</code> is a second name, not a copy, so the first caller's overrides become everybody's defaults for the rest of the run.", fix: "def make_config(extra):\n    cfg = dict(DEFAULTS)\n    cfg.update(extra)\n    return cfg" },
    { bad: "DB_PASSWORD = \"hunter2\"   # committed to the repo", why: "Once pushed it is in the history <b>permanently</b>, and deleting the line later does not remove it. Public repositories are scanned for keys within minutes of a push.", fix: "import os\nDB_PASSWORD = os.environ[\"DB_PASSWORD\"]   # and .env is in .gitignore" },
  ]},

  { t: "debug", intro: "A defaults dictionary is used to build two configurations. The second asks for no overrides at all and still comes back with the first one's value. Nothing crashes. Read it before opening the fix.", code: "DEFAULTS = {\"rows\": 100}\n\ndef make_config(extra):\n    cfg = DEFAULTS\n    cfg.update(extra)\n    return cfg\n\na = make_config({\"rows\": 500})\nb = make_config({})\n\nprint(b[\"rows\"])", symptom: "prints 500, but b asked for no overrides and the default is 100", q: "The second call passed an empty dictionary, so nothing should have been overridden. Where did 500 come from?", fix: "DEFAULTS = {\"rows\": 100}\n\ndef make_config(extra):\n    cfg = dict(DEFAULTS)\n    cfg.update(extra)\n    return cfg\n\na = make_config({\"rows\": 500})\nb = make_config({})\n\nprint(b[\"rows\"])", why: "<code>cfg = DEFAULTS</code> does not copy anything — it is a second name for the one shared dictionary. The first call updated it in place, so the defaults themselves became 500 and every later caller inherited that.<br/><br/>It is the list-aliasing bug from earlier in the course, at project scale, and that is why it belongs here: shared module-level state is exactly where it does the most damage. One function quietly changed a value that the whole program depends on, and the only visible symptom was a number being slightly wrong somewhere else entirely. Treat anything defined at module level as read-only, and copy it before you modify it." },

  { t: "recap", items: [
    "Split by responsibility — each file describable in one sentence, plus a README",
    "<code>if __name__ == \"__main__\"</code> keeps a file importable as well as runnable",
    "<code>status</code> → <code>add</code> → <code>commit</code> → <code>push</code> covers almost every day",
    "A commit message says what changed and <b>why</b>, not \"update\"",
    "<code>.gitignore</code> before the first commit — secrets in history are permanent",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What does <code>if __name__ == \"__main__\"</code> do?", a: "<code>__name__</code> is <code>\"__main__\"</code> when a file is run directly and the module's own name when it is imported. The guard therefore runs the script part only in the first case, which lets one file be both a reusable module and a runnable program." },
    { level: "beginner", q: "What are the everyday git commands?", a: "<code>git status</code> to see what changed, <code>git add</code> to stage the changes you want, <code>git commit -m</code> to save them to local history with a message, and <code>git push</code> to send that history to GitHub. Everything else is occasional." },
    { level: "intermediate", q: "What belongs in <code>.gitignore</code>, and why does it matter so much?", a: "Anything your machine produced rather than you: <code>venv/</code>, <code>__pycache__/</code>, generated data, and above all <code>.env</code>. Secrets are the reason it is urgent — once a password is pushed it stays in the history even after the file is deleted, and public repos are scanned for keys within minutes." },
    { level: "intermediate", q: "What makes a good commit message?", a: "One line saying what changed and why, readable in a list months later. \"Fix date parsing for vendor exports\" is useful; \"update\" is not, and forty commits called \"update\" leave you with no history worth reading." },
    { level: "advanced", q: "Why is mutable module-level state a problem in a multi-file project?", a: "Because every module that imports it shares the same object, so one function mutating it changes the program's behaviour everywhere — with no error and no obvious cause. It also makes tests order-dependent, since one test can leave the state altered for the next. Treat module-level values as read-only and copy before modifying, or hand configuration in as an argument instead." },
  ]},
];

/* ------------------------------------------------------------------ */
/* Lessons + their problems                                            */
/* ------------------------------------------------------------------ */
const pythonLessons = [
  { slug: "getting-started", order: 1, title: "Meet Python — Your First Program", minutes: 14, content: L0, problems: [] },
  { slug: "variables-data-types", order: 2, title: "Variables & Data Types", minutes: 18, content: L1, problems: [
    P(1, "marks-total", "Marks Total", "add_marks",
      "A student's marks for two subjects are given to you as **strings** (like `\"85\"`). Write a function `add_marks(a, b)` that converts both to **int** and returns the **total**.",
      [{ input: 'a="85", b="5"', output: "90" }, { input: 'a="40", b="60"', output: "100" }],
      "def add_marks(a, b):\n    # convert strings to int, return total\n    pass\n",
      "def add_marks(a, b):\n    return int(a) + int(b)\n",
      [{ args: ["85","5"], expected: 90 }, { args: ["40","60"], expected: 100 }, { args: ["0","0"], expected: 0 }],
      ["int() is used to turn a string into a number.", "Convert both, then add them with +.", 'If you just do a + b you will get "855", which is wrong!'],
      ["variables","type casting"]),
    P(2, "make-greeting", "Make a Greeting", "greet",
      'Write a function `greet(name)` that returns `Hello, <name>!`. For example, `greet("Freya")` gives `Hello, Freya!`.',
      [{ input: 'name="Freya"', output: '"Hello, Freya!"' }, { input: 'name="Cappy"', output: '"Hello, Cappy!"' }],
      "def greet(name):\n    # return  Hello, <name>!\n    pass\n",
      'def greet(name):\n    return f"Hello, {name}!"\n',
      [{ args: ["Freya"], expected: "Hello, Freya!" }, { args: ["Cappy"], expected: "Hello, Cappy!" }, { args: ["Jugendra"], expected: "Hello, Jugendra!" }],
      ["You can join strings with +.", 'An f-string is easiest: f"Hello, {name}!"'],
      ["strings","variables"]),
    P(3, "rectangle-area", "Rectangle Area", "area",
      "Write a function `area(length, width)` that returns the area of a rectangle (length x width).",
      [{ input: "length=5, width=3", output: "15" }, { input: "length=10, width=2", output: "20" }],
      "def area(length, width):\n    pass\n",
      "def area(length, width):\n    return length * width\n",
      [{ args: [5,3], expected: 15 }, { args: [10,2], expected: 20 }, { args: [7,7], expected: 49 }],
      ["The operator for multiplication is *.", "return length * width"],
      ["variables","int"]) ]},

  { slug: "operators", order: 3, title: "Operators & Expressions", minutes: 10, content: L2, problems: [
    P(1, "add-two", "Add Two Numbers", "add_two",
      "Write a function `add_two(a, b)` that returns the sum of the two numbers.",
      [{ input: "a=3, b=4", output: "7" }, { input: "a=10, b=-2", output: "8" }],
      "def add_two(a, b):\n    pass\n", "def add_two(a, b):\n    return a + b\n",
      [{ args: [3,4], expected: 7 }, { args: [10,-2], expected: 8 }, { args: [0,0], expected: 0 }],
      ["Use the + operator.", "return a + b"], ["arithmetic"]),
    P(2, "is-even", "Even or Odd", "is_even",
      "Write a function `is_even(n)` that returns `True` if n is even, otherwise `False`. **Hint:** even means it divides fully by 2 (remainder 0).",
      [{ input: "n=4", output: "True" }, { input: "n=7", output: "False" }],
      "def is_even(n):\n    pass\n", "def is_even(n):\n    return n % 2 == 0\n",
      [{ args: [4], expected: true }, { args: [7], expected: false }, { args: [0], expected: true }],
      ["% is used to get the remainder.", "It is even when n % 2 == 0."], ["modulo","comparison"]),
    P(3, "power-of", "Power Of", "power_of",
      "Write a function `power_of(base, exp)` that returns base raised to the power exp (base^exp).",
      [{ input: "base=2, exp=3", output: "8" }, { input: "base=5, exp=2", output: "25" }],
      "def power_of(base, exp):\n    pass\n", "def power_of(base, exp):\n    return base ** exp\n",
      [{ args: [2,3], expected: 8 }, { args: [5,2], expected: 25 }, { args: [10,0], expected: 1 }],
      ["The operator for power is **.", "return base ** exp"], ["power"]) ]},

  { slug: "conditionals", order: 4, title: "Conditionals (if / else)", minutes: 11, content: L3, problems: [
    P(1, "grade", "Grade Calculator", "grade",
      'Write a function `grade(marks)` that returns: `"A"` (>=90), `"B"` (>=75), `"C"` (>=40), otherwise `"Fail"`.',
      [{ input: "marks=95", output: '"A"' }, { input: "marks=50", output: '"C"' }],
      "def grade(marks):\n    pass\n",
      'def grade(marks):\n    if marks >= 90:\n        return "A"\n    elif marks >= 75:\n        return "B"\n    elif marks >= 40:\n        return "C"\n    else:\n        return "Fail"\n',
      [{ args: [95], expected: "A" }, { args: [80], expected: "B" }, { args: [50], expected: "C" }, { args: [30], expected: "Fail" }],
      ["Use if / elif / else.", "Check the biggest condition first (>=90)."], ["conditionals"]),
    P(2, "bigger", "Bigger Number", "bigger",
      "Write a function `bigger(a, b)` that returns the bigger of the two numbers (if they are equal, return either one).",
      [{ input: "a=3, b=9", output: "9" }, { input: "a=10, b=2", output: "10" }],
      "def bigger(a, b):\n    pass\n", "def bigger(a, b):\n    if a >= b:\n        return a\n    return b\n",
      [{ args: [3,9], expected: 9 }, { args: [10,2], expected: 10 }, { args: [5,5], expected: 5 }],
      ["If a > b, return a.", "Otherwise return b."], ["conditionals","comparison"]),
    P(3, "sign", "Positive, Negative, Zero", "sign",
      'Write a function `sign(n)` that returns `"positive"`, `"negative"`, or `"zero"`.',
      [{ input: "n=5", output: '"positive"' }, { input: "n=-3", output: '"negative"' }],
      "def sign(n):\n    pass\n",
      'def sign(n):\n    if n > 0:\n        return "positive"\n    elif n < 0:\n        return "negative"\n    else:\n        return "zero"\n',
      [{ args: [5], expected: "positive" }, { args: [-3], expected: "negative" }, { args: [0], expected: "zero" }],
      ["Three cases: >0, <0, and the rest (0).", "if / elif / else."], ["conditionals"]) ]},

  { slug: "loops", order: 5, title: "Loops (for / while)", minutes: 12, content: L4, problems: [
    P(1, "sum-to-n", "Sum 1 to N", "sum_to_n",
      "Write a function `sum_to_n(n)` that returns the total of `1 + 2 + ... + n`.",
      [{ input: "n=5", output: "15" }, { input: "n=10", output: "55" }],
      "def sum_to_n(n):\n    pass\n", "def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n",
      [{ args: [5], expected: 15 }, { args: [1], expected: 1 }, { args: [10], expected: 55 }],
      ["range(1, n+1) gives 1 up to n.", "Keep adding into a total variable."], ["loops","range"]),
    P(2, "count-vowels", "Count Vowels", "count_vowels",
      "Write a function `count_vowels(s)` that returns the count of vowels (a, e, i, o, u) in the string.",
      [{ input: 's="hello"', output: "2" }, { input: 's="aeiou"', output: "5" }],
      "def count_vowels(s):\n    pass\n", "def count_vowels(s):\n    count = 0\n    for c in s.lower():\n        if c in \"aeiou\":\n            count += 1\n    return count\n",
      [{ args: ["hello"], expected: 2 }, { args: ["sky"], expected: 0 }, { args: ["aeiou"], expected: 5 }],
      ["Loop over every char of the string.", 'Check with if c in "aeiou".'], ["loops","strings"]),
    P(3, "factorial", "Factorial", "factorial",
      "Write a function `factorial(n)` that returns n! (`5! = 5×4×3×2×1 = 120`). `factorial(0)` = 1.",
      [{ input: "n=5", output: "120" }, { input: "n=3", output: "6" }],
      "def factorial(n):\n    pass\n", "def factorial(n):\n    r = 1\n    for i in range(1, n + 1):\n        r *= i\n    return r\n",
      [{ args: [5], expected: 120 }, { args: [0], expected: 1 }, { args: [3], expected: 6 }],
      ["Start with r = 1 and multiply inside the loop.", "range(1, n+1)."], ["loops"]) ]},

  { slug: "lists-tuples", order: 6, title: "Lists & Tuples", minutes: 13, content: L5, problems: [
    P(1, "list-sum", "List Sum", "list_sum",
      "Write a function `list_sum(nums)` that returns the total of all the numbers in the list.",
      [{ input: "nums=[1,2,3]", output: "6" }, { input: "nums=[10]", output: "10" }],
      "def list_sum(nums):\n    pass\n", "def list_sum(nums):\n    return sum(nums)\n",
      [{ args: [[1,2,3]], expected: 6 }, { args: [[10]], expected: 10 }, { args: [[]], expected: 0 }],
      ["Python has a built-in sum().", "return sum(nums)"], ["lists"]),
    P(2, "get-max", "Largest in List", "get_max",
      "Write a function `get_max(nums)` that returns the largest number in the list.",
      [{ input: "nums=[3,9,2]", output: "9" }, { input: "nums=[-1,-5]", output: "-1" }],
      "def get_max(nums):\n    pass\n", "def get_max(nums):\n    return max(nums)\n",
      [{ args: [[3,9,2]], expected: 9 }, { args: [[5]], expected: 5 }, { args: [[-1,-5]], expected: -1 }],
      ["Try the built-in max().", "return max(nums)"], ["lists"]),
    P(3, "reverse-list", "Reverse a List", "reverse_list",
      "Write a function `reverse_list(lst)` that returns the list reversed.",
      [{ input: "lst=[1,2,3]", output: "[3,2,1]" }, { input: 'lst=["a","b"]', output: '["b","a"]' }],
      "def reverse_list(lst):\n    pass\n", "def reverse_list(lst):\n    return lst[::-1]\n",
      [{ args: [[1,2,3]], expected: [3,2,1] }, { args: [["a","b"]], expected: ["b","a"] }, { args: [[7]], expected: [7] }],
      ["Slicing trick: lst[::-1] reverses a list.", "Or use reversed() + list()."], ["lists","slicing"]) ]},

  { slug: "dicts-sets", order: 7, title: "Dictionaries & Sets", minutes: 12, content: L6, problems: [
    P(1, "get-value", "Get Value by Key", "get_value",
      "Write a function `get_value(d, key)` that returns the value of `key` from the dict `d`.",
      [{ input: 'd={"a":1,"b":2}, key="b"', output: "2" }],
      "def get_value(d, key):\n    pass\n", "def get_value(d, key):\n    return d[key]\n",
      [{ args: [{ a: 1, b: 2 }, "b"], expected: 2 }, { args: [{ x: 10 }, "x"], expected: 10 }],
      ["Value from a dict: d[key].", "return d[key]"], ["dict"]),
    P(2, "count-unique", "Count Unique", "count_unique",
      "Write a function `count_unique(lst)` that returns how many **different** (unique) items are in the list.",
      [{ input: "lst=[1,2,2,3]", output: "3" }, { input: "lst=[5,5,5]", output: "1" }],
      "def count_unique(lst):\n    pass\n", "def count_unique(lst):\n    return len(set(lst))\n",
      [{ args: [[1,2,2,3]], expected: 3 }, { args: [[5,5,5]], expected: 1 }, { args: [[]], expected: 0 }],
      ["set() removes duplicates.", "len(set(lst))."], ["set"]),
    P(3, "has-key", "Has Key?", "has_key",
      "Write a function `has_key(d, key)` that returns `True`/`False` for whether `key` is in the dict.",
      [{ input: 'd={"a":1}, key="a"', output: "True" }, { input: 'd={"a":1}, key="z"', output: "False" }],
      "def has_key(d, key):\n    pass\n", "def has_key(d, key):\n    return key in d\n",
      [{ args: [{ a: 1 }, "a"], expected: true }, { args: [{ a: 1 }, "z"], expected: false }],
      ["The 'in' operator checks this.", "return key in d"], ["dict"]) ]},

  { slug: "functions", order: 8, title: "Functions", minutes: 14, content: L7, problems: [
    P(1, "square", "Square a Number", "square",
      "Write a function `square(n)` that returns the square of n (n x n).",
      [{ input: "n=5", output: "25" }, { input: "n=-3", output: "9" }],
      "def square(n):\n    pass\n", "def square(n):\n    return n * n\n",
      [{ args: [5], expected: 25 }, { args: [0], expected: 0 }, { args: [-3], expected: 9 }],
      ["Multiply n by itself.", "return n * n"], ["functions"]),
    P(2, "final-price", "Apply Discount", "final_price",
      "Write a function `final_price(price, pct)` that returns the price after a `pct`% discount.",
      [{ input: "price=100, pct=10", output: "90" }, { input: "price=200, pct=50", output: "100" }],
      "def final_price(price, pct):\n    pass\n", "def final_price(price, pct):\n    return price - price * pct / 100\n",
      [{ args: [100,10], expected: 90 }, { args: [200,50], expected: 100 }, { args: [50,0], expected: 50 }],
      ["Discount = price * pct / 100.", "Final = price - discount."], ["functions"]),
    P(3, "to-fahrenheit", "Celsius to Fahrenheit", "to_fahrenheit",
      "Write a function `to_fahrenheit(c)` that converts Celsius to Fahrenheit. Formula: `c * 9/5 + 32`.",
      [{ input: "c=0", output: "32" }, { input: "c=100", output: "212" }],
      "def to_fahrenheit(c):\n    pass\n", "def to_fahrenheit(c):\n    return c * 9 / 5 + 32\n",
      [{ args: [0], expected: 32 }, { args: [100], expected: 212 }, { args: [37], expected: 98.6 }],
      ["Apply the formula directly: c * 9/5 + 32.", "Watch the order of operations: * and / come first."], ["functions","math"]) ]},

  { slug: "strings", order: 9, title: "String Methods & Slicing", minutes: 12, content: L8, problems: [
    P(1, "reverse-string", "Reverse a String", "reverse_string",
      "Write a function `reverse_string(s)` that returns the string reversed.",
      [{ input: 's="abc"', output: '"cba"' }, { input: 's="hello"', output: '"olleh"' }],
      "def reverse_string(s):\n    pass\n", "def reverse_string(s):\n    return s[::-1]\n",
      [{ args: ["abc"], expected: "cba" }, { args: ["hello"], expected: "olleh" }, { args: ["a"], expected: "a" }],
      ["Slicing trick: s[::-1].", "This reverses a string too."], ["strings","slicing"]),
    P(2, "shout", "Shout It", "shout",
      "Write a function `shout(s)` that makes the string UPPERCASE and adds a `!` at the end.",
      [{ input: 's="hi"', output: '"HI!"' }, { input: 's="data"', output: '"DATA!"' }],
      "def shout(s):\n    pass\n", 'def shout(s):\n    return s.upper() + "!"\n',
      [{ args: ["hi"], expected: "HI!" }, { args: ["data"], expected: "DATA!" }, { args: ["ok"], expected: "OK!" }],
      [".upper() makes it uppercase.", 'Then add + "!".'], ["strings"]),
    P(3, "count-char", "Count a Character", "count_char",
      "Write a function `count_char(s, ch)` that returns how many times `ch` appears in `s`.",
      [{ input: 's="banana", ch="a"', output: "3" }, { input: 's="hello", ch="l"', output: "2" }],
      "def count_char(s, ch):\n    pass\n", "def count_char(s, ch):\n    return s.count(ch)\n",
      [{ args: ["banana", "a"], expected: 3 }, { args: ["hello", "l"], expected: 2 }, { args: ["abc", "z"], expected: 0 }],
      ["Strings have a built-in .count().", "return s.count(ch)"], ["strings"]) ]},

  { slug: "comprehensions", order: 10, title: "List Comprehensions", minutes: 11, content: L9, problems: [
    P(1, "squares", "List of Squares", "squares",
      "Write a function `squares(n)` that returns the list `[1², 2², ..., n²]`. Use a comprehension.",
      [{ input: "n=3", output: "[1, 4, 9]" }, { input: "n=4", output: "[1, 4, 9, 16]" }],
      "def squares(n):\n    pass\n", "def squares(n):\n    return [i * i for i in range(1, n + 1)]\n",
      [{ args: [3], expected: [1,4,9] }, { args: [1], expected: [1] }, { args: [4], expected: [1,4,9,16] }],
      ["[i*i for i in range(1, n+1)].", "range(1, n+1) goes from 1 to n."], ["comprehension"]),
    P(2, "evens", "Only Evens", "evens",
      "Write a function `evens(nums)` that returns a new list with only the even numbers from the list.",
      [{ input: "nums=[1,2,3,4]", output: "[2, 4]" }, { input: "nums=[1,3,5]", output: "[]" }],
      "def evens(nums):\n    pass\n", "def evens(nums):\n    return [x for x in nums if x % 2 == 0]\n",
      [{ args: [[1,2,3,4]], expected: [2,4] }, { args: [[1,3,5]], expected: [] }, { args: [[2,4,6]], expected: [2,4,6] }],
      ["[x for x in nums if x % 2 == 0].", "The if part does the filtering."], ["comprehension"]),
    P(3, "word-lengths", "Word Lengths", "word_lengths",
      "Write a function `word_lengths(words)` that returns a list with the length of each word.",
      [{ input: 'words=["hi","bye"]', output: "[2, 3]" }, { input: 'words=["a"]', output: "[1]" }],
      "def word_lengths(words):\n    pass\n", "def word_lengths(words):\n    return [len(w) for w in words]\n",
      [{ args: [["hi","bye"]], expected: [2,3] }, { args: [["a"]], expected: [1] }, { args: [[]], expected: [] }],
      ["[len(w) for w in words].", "len() gives you the length."], ["comprehension"]) ]},

  { slug: "oop", order: 11, title: "Classes & Objects (OOP)", minutes: 15, content: L10, problems: [
    P(1, "circle-area", "Circle Area (OOP)", "circle_area",
      "Complete the `area()` method in the `Circle` class - area = `3 × r × r` (take pi as 3). `circle_area(r)` gives you its area.",
      [{ input: "r=2", output: "12" }, { input: "r=3", output: "27" }],
      "class Circle:\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        # return 3 * r * r  (use self.r)\n        pass\n\ndef circle_area(r):\n    return Circle(r).area()\n",
      "class Circle:\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3 * self.r * self.r\n\ndef circle_area(r):\n    return Circle(r).area()\n",
      [{ args: [2], expected: 12 }, { args: [3], expected: 27 }, { args: [1], expected: 3 }],
      ["self.r gives you the radius.", "return 3 * self.r * self.r"], ["oop","class"]),
    P(2, "dog-sound", "Dog Sound (OOP)", "dog_sound",
      "Complete the `bark()` method of the `Dog` class so that it returns `<name> woof`. `dog_sound(name)` calls it.",
      [{ input: 'name="Bruno"', output: '"Bruno woof"' }],
      "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        # return name + \" woof\"\n        pass\n\ndef dog_sound(name):\n    return Dog(name).bark()\n",
      'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return self.name + " woof"\n\ndef dog_sound(name):\n    return Dog(name).bark()\n',
      [{ args: ["Bruno"], expected: "Bruno woof" }, { args: ["Tommy"], expected: "Tommy woof" }],
      ["self.name gives you the name.", 'return self.name + " woof"'], ["oop","class"]) ]},

  { slug: "error-handling", order: 12, title: "Error Handling (try / except)", minutes: 11, content: L11, problems: [
    P(1, "safe-divide", "Safe Divide", "safe_divide",
      "Write a function `safe_divide(a, b)` that returns `a / b`, but if `b` is zero it returns `0` (use try/except).",
      [{ input: "a=10, b=2", output: "5" }, { input: "a=5, b=0", output: "0" }],
      "def safe_divide(a, b):\n    pass\n", "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return 0\n",
      [{ args: [10,2], expected: 5 }, { args: [5,0], expected: 0 }, { args: [9,3], expected: 3 }],
      ["Write a / b inside try.", "except ZeroDivisionError: return 0"], ["error-handling"]),
    P(2, "to-int-safe", "Safe to Int", "to_int_safe",
      "Write a function `to_int_safe(s)` that converts a string to an int, but returns `0` if that goes wrong.",
      [{ input: 's="42"', output: "42" }, { input: 's="abc"', output: "0" }],
      "def to_int_safe(s):\n    pass\n", "def to_int_safe(s):\n    try:\n        return int(s)\n    except ValueError:\n        return 0\n",
      [{ args: ["42"], expected: 42 }, { args: ["abc"], expected: 0 }, { args: ["7"], expected: 7 }],
      ["int(s) inside try.", "except ValueError: return 0"], ["error-handling"]) ]},

  { slug: "file-handling", order: 13, title: "File Handling", minutes: 9, content: L12, problems: [] },

  { slug: "modules", order: 14, title: "Modules, pip & venv", minutes: 9, content: L13, problems: [] },

  { slug: "numbers-math", order: 15, title: "Numbers & the Math Module", minutes: 11, content: L14, problems: [
    P(1, "round-to", "Round a Number", "round_to",
      "Write a function `round_to(n, digits)` that rounds `n` to `digits` decimal places.",
      [{ input: "n=3.14159, digits=2", output: "3.14" }, { input: "n=5.6789, digits=2", output: "5.68" }],
      "def round_to(n, digits):\n    pass\n", "def round_to(n, digits):\n    return round(n, digits)\n",
      [{ args: [3.14159, 2], expected: 3.14 }, { args: [5.6789, 2], expected: 5.68 }, { args: [2.4, 0], expected: 2 }],
      ["round(n, digits) is built in.", "return round(n, digits)"], ["numbers","math"]),
    P(2, "abs-diff", "Absolute Difference", "abs_diff",
      "Write a function `abs_diff(a, b)` that returns the difference between `a` and `b` (always positive).",
      [{ input: "a=5, b=8", output: "3" }, { input: "a=10, b=3", output: "7" }],
      "def abs_diff(a, b):\n    pass\n", "def abs_diff(a, b):\n    return abs(a - b)\n",
      [{ args: [5, 8], expected: 3 }, { args: [10, 3], expected: 7 }, { args: [4, 4], expected: 0 }],
      ["abs() makes a value positive.", "return abs(a - b)"], ["numbers","math"]) ]},

  { slug: "string-formatting", order: 16, title: "String Formatting & f-strings", minutes: 11, content: L15, problems: [
    P(1, "greet-age", "Greet with Age", "greet_age",
      "Write a function `greet_age(name, age)` that returns `<name> is <age>`. Use an f-string.",
      [{ input: 'name="Freya", age=21', output: '"Freya is 21"' }],
      "def greet_age(name, age):\n    pass\n", 'def greet_age(name, age):\n    return f"{name} is {age}"\n',
      [{ args: ["Freya", 21], expected: "Freya is 21" }, { args: ["Cappy", 3], expected: "Cappy is 3" }],
      ['Use f"{name} is {age}".', "In an f-string, variables go inside {}."], ["strings","format"]),
    P(2, "cost-line", "Cost Line", "cost_line",
      "Write a function `cost_line(item, price)` that returns `<item> costs <price>`.",
      [{ input: 'item="Pen", price=10', output: '"Pen costs 10"' }],
      "def cost_line(item, price):\n    pass\n", 'def cost_line(item, price):\n    return f"{item} costs {price}"\n',
      [{ args: ["Pen", 10], expected: "Pen costs 10" }, { args: ["Book", 250], expected: "Book costs 250" }],
      ['f"{item} costs {price}".', "Both variables in one string."], ["strings","format"]),
    P(3, "to-title", "Title Case", "to_title",
      "Write a function `to_title(s)` that makes the first letter of each word capital.",
      [{ input: 's="hello world"', output: '"Hello World"' }],
      "def to_title(s):\n    pass\n", "def to_title(s):\n    return s.title()\n",
      [{ args: ["hello world"], expected: "Hello World" }, { args: ["data science"], expected: "Data Science" }],
      ["Use the .title() method.", "return s.title()"], ["strings"]) ]},

  { slug: "booleans", order: 17, title: "Booleans & Truthiness", minutes: 10, content: L16, problems: [
    P(1, "is-adult", "Is Adult?", "is_adult",
      "Write a function `is_adult(age)` that returns `True` if age is 18 or more.",
      [{ input: "age=18", output: "True" }, { input: "age=10", output: "False" }],
      "def is_adult(age):\n    pass\n", "def is_adult(age):\n    return age >= 18\n",
      [{ args: [18], expected: true }, { args: [10], expected: false }, { args: [25], expected: true }],
      ["A comparison gives you a bool.", "return age >= 18"], ["boolean"]),
    P(2, "is-empty", "Is Empty String?", "is_empty",
      "Write a function `is_empty(s)` that returns `True` if the string is empty.",
      [{ input: 's=""', output: "True" }, { input: 's="a"', output: "False" }],
      "def is_empty(s):\n    pass\n", "def is_empty(s):\n    return len(s) == 0\n",
      [{ args: [""], expected: true }, { args: ["a"], expected: false }, { args: ["hi"], expected: false }],
      ["len(s) gives the length.", "It is empty when len(s) == 0."], ["boolean","strings"]) ]},

  { slug: "lambda", order: 18, title: "Lambda Functions", minutes: 11, content: L17, problems: [
    P(1, "square-all", "Square All (map + lambda)", "square_all",
      "Write a function `square_all(nums)` that returns the square of every number. Use `map` + `lambda`.",
      [{ input: "nums=[1,2,3]", output: "[1, 4, 9]" }, { input: "nums=[0,5]", output: "[0, 25]" }],
      "def square_all(nums):\n    pass\n", "def square_all(nums):\n    return list(map(lambda x: x * x, nums))\n",
      [{ args: [[1,2,3]], expected: [1,4,9] }, { args: [[0,5]], expected: [0,25] }, { args: [[]], expected: [] }],
      ["map(lambda x: x*x, nums).", "Use list() to turn it back into a list."], ["lambda"]),
    P(2, "sort-by-length", "Sort by Length", "sort_by_length",
      "Write a function `sort_by_length(words)` that sorts the words by length (shortest to longest). Use `sorted` + `lambda`.",
      [{ input: 'words=["bbb","a","cc"]', output: '["a", "cc", "bbb"]' }],
      "def sort_by_length(words):\n    pass\n", "def sort_by_length(words):\n    return sorted(words, key=lambda w: len(w))\n",
      [{ args: [["bbb","a","cc"]], expected: ["a","cc","bbb"] }, { args: [["hi","a"]], expected: ["a","hi"] }],
      ["sorted(words, key=lambda w: len(w)).", "key tells it what to sort by."], ["lambda"]) ]},

  { slug: "scope", order: 19, title: "Variable Scope", minutes: 9, content: L18, problems: [] },

  { slug: "json", order: 20, title: "Working with JSON", minutes: 11, content: L19, problems: [
    P(1, "get-json-field", "Read a JSON Field", "get_json_field",
      "Write a function `get_json_field(text, key)` that returns the value of `key` from a JSON string.",
      [{ input: 'text=\'{"name":"Freya","age":21}\', key="age"', output: "21" }],
      "import json\n\ndef get_json_field(text, key):\n    pass\n", "import json\n\ndef get_json_field(text, key):\n    data = json.loads(text)\n    return data[key]\n",
      [{ args: ['{"name":"Freya","age":21}', "age"], expected: 21 }, { args: ['{"city":"Delhi"}', "city"], expected: "Delhi" }],
      ["json.loads(text) turns the string into a dict.", "Then data[key]."], ["json"]) ]},

  { slug: "dates", order: 21, title: "Dates & Time", minutes: 9, content: L20, problems: [] },

  { slug: "more-operators", order: 22, title: "More Operators (Membership, Identity, Bitwise)", minutes: 10, content: L21, problems: [
    P(1, "is-member", "Is Member?", "is_member",
      "Write a function `is_member(item, items)` that returns `True` if `item` is in the list `items`.",
      [{ input: "item=2, items=[1,2,3]", output: "True" }, { input: "item=5, items=[1,2]", output: "False" }],
      "def is_member(item, items):\n    pass\n", "def is_member(item, items):\n    return item in items\n",
      [{ args: [2, [1,2,3]], expected: true }, { args: [5, [1,2]], expected: false }, { args: ["a", ["a","b"]], expected: true }],
      ["Use the 'in' operator.", "return item in items"], ["operators"]),
    P(2, "bitwise-and", "Bitwise AND", "bitwise_and",
      "Write a function `bitwise_and(a, b)` that returns `a & b` (bitwise AND).",
      [{ input: "a=6, b=3", output: "2" }, { input: "a=12, b=10", output: "8" }],
      "def bitwise_and(a, b):\n    pass\n", "def bitwise_and(a, b):\n    return a & b\n",
      [{ args: [6, 3], expected: 2 }, { args: [12, 10], expected: 8 }, { args: [5, 5], expected: 5 }],
      ["The & operator does a bitwise AND.", "return a & b"], ["operators","bitwise"]) ]},

  { slug: "match-case", order: 23, title: "Match-Case Statement", minutes: 9, content: L22, problems: [
    P(1, "day-type", "Weekend or Weekday", "day_type",
      'Write a function `day_type(day)` that returns `"weekend"` if day is `"Sat"` or `"Sun"`, otherwise `"weekday"`. Use match-case.',
      [{ input: 'day="Sat"', output: '"weekend"' }, { input: 'day="Mon"', output: '"weekday"' }],
      "def day_type(day):\n    pass\n", 'def day_type(day):\n    match day:\n        case "Sat" | "Sun":\n            return "weekend"\n        case _:\n            return "weekday"\n',
      [{ args: ["Sat"], expected: "weekend" }, { args: ["Sun"], expected: "weekend" }, { args: ["Mon"], expected: "weekday" }],
      ['case "Sat" | "Sun": weekend.', "case _: default (weekday)."], ["match"]) ]},

  { slug: "advanced-functions", order: 24, title: "Advanced Functions (*args, recursion)", minutes: 13, content: L23, problems: [
    P(1, "sum-all", "Sum All (*args)", "sum_all",
      "Write a function `sum_all(*args)` that returns the total of any number of numbers.",
      [{ input: "1, 2, 3", output: "6" }, { input: "5, 10", output: "15" }],
      "def sum_all(*args):\n    pass\n", "def sum_all(*args):\n    return sum(args)\n",
      [{ args: [1,2,3], expected: 6 }, { args: [5,10], expected: 15 }, { args: [], expected: 0 }],
      ["*args collects all the arguments into a tuple.", "return sum(args)"], ["functions","args"]),
    P(2, "factorial-rec", "Recursive Factorial", "factorial_rec",
      "Write a function `factorial_rec(n)` that works out n! using **recursion**. Base case: 1 when n <= 1.",
      [{ input: "n=5", output: "120" }, { input: "n=0", output: "1" }],
      "def factorial_rec(n):\n    pass\n", "def factorial_rec(n):\n    if n <= 1:\n        return 1\n    return n * factorial_rec(n - 1)\n",
      [{ args: [5], expected: 120 }, { args: [0], expected: 1 }, { args: [4], expected: 24 }],
      ["Base case: if n <= 1: return 1.", "Otherwise n * factorial_rec(n-1)."], ["functions","recursion"]) ]},

  { slug: "inheritance", order: 25, title: "OOP: Inheritance", minutes: 13, content: L24, problems: [
    P(1, "cat-speak", "Inherit & Override", "cat_speak",
      "The `Cat` class inherits from `Animal`. Override `speak()` so that it returns `<name> says meow`.",
      [{ input: 'name="Kitty"', output: '"Kitty says meow"' }],
      "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"some sound\"\n\nclass Cat(Animal):\n    def speak(self):\n        # return name + \" says meow\"\n        pass\n\ndef cat_speak(name):\n    return Cat(name).speak()\n",
      'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "some sound"\n\nclass Cat(Animal):\n    def speak(self):\n        return self.name + " says meow"\n\ndef cat_speak(name):\n    return Cat(name).speak()\n',
      [{ args: ["Kitty"], expected: "Kitty says meow" }, { args: ["Tom"], expected: "Tom says meow" }],
      ["self.name is inherited from Animal.", 'return self.name + " says meow"'], ["oop","inheritance"]) ]},

  { slug: "encapsulation", order: 26, title: "OOP: Encapsulation & Polymorphism", minutes: 12, content: L25, problems: [
    P(1, "final-balance", "Bank Account (Encapsulation)", "final_balance",
      "Complete the `deposit()` method in the `Account` class (add the amount into the private `__balance`). `final_balance(deposits)` gives the balance after all the deposits.",
      [{ input: "deposits=[100,50,25]", output: "175" }],
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        # self.__balance me amt jodo\n        pass\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        self.__balance += amt\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      [{ args: [[100,50,25]], expected: 175 }, { args: [[10]], expected: 10 }, { args: [[]], expected: 0 }],
      ["self.__balance += amt.", "A private variable is only changed through methods."], ["oop","encapsulation"]) ]},

  { slug: "dunder-methods", order: 27, title: "OOP: Static & Dunder Methods", minutes: 12, content: L26, problems: [
    P(1, "team-size", "Team Size (__len__)", "team_size",
      "Complete the `__len__` method of the `Team` class so that `len(team)` gives the count of members. `team_size(members)` calls it.",
      [{ input: 'members=["a","b","c"]', output: "3" }],
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        # return how many members there are\n        pass\n\ndef team_size(members):\n    return len(Team(members))\n",
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        return len(self.members)\n\ndef team_size(members):\n    return len(Team(members))\n",
      [{ args: [["a","b","c"]], expected: 3 }, { args: [[]], expected: 0 }, { args: [["x"]], expected: 1 }],
      ["Inside __len__, return len(self.members).", "len(obj) automatically calls __len__."], ["oop","dunder"]) ]},

  { slug: "iterators-generators", order: 28, title: "Iterators & Generators", minutes: 13, content: L27, problems: [
    P(1, "first-squares", "Generator: First Squares", "first_squares",
      "Complete a generator `gen_squares(n)` that yields from 1^2 up to n^2. `first_squares(n)` gives their list.",
      [{ input: "n=3", output: "[1, 4, 9]" }, { input: "n=4", output: "[1, 4, 9, 16]" }],
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        # yield the square of i\n        pass\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      [{ args: [3], expected: [1,4,9] }, { args: [1], expected: [1] }, { args: [4], expected: [1,4,9,16] }],
      ["yield i * i inside the loop.", "yield gives one value at a time."], ["generators"]) ]},

  { slug: "decorators", order: 29, title: "Decorators & Closures", minutes: 12, content: L28, problems: [] },

  { slug: "regex", order: 30, title: "Regular Expressions (RegEx)", minutes: 12, content: L29, problems: [
    P(1, "find-numbers", "Find All Numbers", "find_numbers",
      "Write a function `find_numbers(text)` that returns a list of all the numbers (as strings) in the text. Use `re.findall`.",
      [{ input: 'text="Order 123, bill 456"', output: '["123", "456"]' }],
      "import re\n\ndef find_numbers(text):\n    pass\n", "import re\n\ndef find_numbers(text):\n    return re.findall(r\"\\d+\", text)\n",
      [{ args: ["Order 123, bill 456"], expected: ["123","456"] }, { args: ["no numbers"], expected: [] }, { args: ["a1b2c3"], expected: ["1","2","3"] }],
      ['re.findall(r"\\d+", text).', "\\d+ = one or more digits."], ["regex"]),
    P(2, "has-digit", "Has a Digit?", "has_digit",
      "Write a function `has_digit(s)` that returns `True` if the string has any digit. Use `re.search`.",
      [{ input: 's="abc7"', output: "True" }, { input: 's="abc"', output: "False" }],
      "import re\n\ndef has_digit(s):\n    pass\n", "import re\n\ndef has_digit(s):\n    return bool(re.search(r\"\\d\", s))\n",
      [{ args: ["abc7"], expected: true }, { args: ["abc"], expected: false }, { args: ["12"], expected: true }],
      ['re.search(r"\\d", s) looks for a digit.', "Use bool() to get True/False."], ["regex"]) ]},

  { slug: "concurrency", order: 31, title: "Concurrency — Threads & Processes", minutes: 11, content: L30, problems: [] },
  { slug: "async", order: 32, title: "Async Programming (asyncio)", minutes: 11, content: L31, problems: [] },

  { slug: "collections-itertools", order: 33, title: "collections, itertools & functools", minutes: 13, content: L32, problems: [
    P(1, "top-item", "Most Common Item", "top_item",
      "Write a function `top_item(items)` that returns the item that appears the most times in the list. Use `Counter`.",
      [{ input: 'items=["a","b","a"]', output: '"a"' }, { input: "items=[1,2,2,3,2]", output: "2" }],
      "from collections import Counter\n\ndef top_item(items):\n    pass\n", "from collections import Counter\n\ndef top_item(items):\n    return Counter(items).most_common(1)[0][0]\n",
      [{ args: [["a","b","a"]], expected: "a" }, { args: [[1,2,2,3,2]], expected: 2 }, { args: [["x"]], expected: "x" }],
      ["Counter(items).most_common(1) gives the top item.", "Use [0][0] to pull out just the item."], ["collections"]),
    P(2, "running-total", "Running Total", "running_total",
      "Write a function `running_total(nums)` that returns the list of cumulative (running) totals. Use `itertools.accumulate`.",
      [{ input: "nums=[1,2,3]", output: "[1, 3, 6]" }, { input: "nums=[1,1,1,1]", output: "[1, 2, 3, 4]" }],
      "from itertools import accumulate\n\ndef running_total(nums):\n    pass\n", "from itertools import accumulate\n\ndef running_total(nums):\n    return list(accumulate(nums))\n",
      [{ args: [[1,2,3]], expected: [1,3,6] }, { args: [[5]], expected: [5] }, { args: [[1,1,1,1]], expected: [1,2,3,4] }],
      ["accumulate(nums) gives the running total.", "Use list() to make it a list."], ["itertools"]),
    P(3, "product-of", "Product of List", "product_of",
      "Write a function `product_of(nums)` that returns the product of all the numbers. Use `functools.reduce`.",
      [{ input: "nums=[1,2,3,4]", output: "24" }, { input: "nums=[2,3]", output: "6" }],
      "from functools import reduce\n\ndef product_of(nums):\n    pass\n", "from functools import reduce\n\ndef product_of(nums):\n    return reduce(lambda a, b: a * b, nums)\n",
      [{ args: [[1,2,3,4]], expected: 24 }, { args: [[5]], expected: 5 }, { args: [[2,3]], expected: 6 }],
      ["reduce(lambda a,b: a*b, nums).", "reduce squeezes a list down into a single value."], ["functools"]) ]},

  { slug: "system-modules", order: 34, title: "System Modules — os, sys, pathlib", minutes: 10, content: L33, problems: [] },
  { slug: "data-persistence", order: 35, title: "CSV, Pickle & SQLite", minutes: 11, content: L34, problems: [] },
  { slug: "testing", order: 36, title: "Testing — unittest & pytest", minutes: 11, content: L35, problems: [] },
  { slug: "debugging-logging", order: 37, title: "Debugging & Logging", minutes: 10, content: L36, problems: [] },

  { slug: "clean-code", order: 38, title: "Clean Code — PEP 8, Docstrings, Type Hints", minutes: 11, content: L37, problems: [
    P(1, "repeat-text", "Repeat with Type Hints", "repeat",
      "Write a function `repeat(text, n)` (with type hints) that repeats `text` `n` times.",
      [{ input: 'text="ab", n=3', output: '"ababab"' }, { input: 'text="x", n=0', output: '""' }],
      "def repeat(text: str, n: int) -> str:\n    pass\n", "def repeat(text: str, n: int) -> str:\n    return text * n\n",
      [{ args: ["ab", 3], expected: "ababab" }, { args: ["x", 0], expected: "" }, { args: ["hi", 2], expected: "hihi" }],
      ["You can multiply a string by a number: text * n.", 'With text="x" and n=0, the result is an empty string.'], ["clean-code"]) ]},

  { slug: "project-git", order: 39, title: "Project Structure & Git Basics", minutes: 10, content: L38, problems: [] },
];

/* ===================== STATISTICS lessons ===================== */
const S1 = [
  { t: "objectives", items: [
    "Work out the <b>mean</b>, <b>median</b> and <b>mode</b> of a set of numbers",
    "Say which of them to trust when the data has an outlier",
    "Measure spread at its simplest, with the <b>range</b>",
    "Use the <code>statistics</code> module instead of writing it yourself",
  ]},
  { t: "hook", q: "Ten people in a room earn about ₹30,000 a month. Mukesh Ambani walks in. What is the average salary now?", why: "Somewhere in the crores — and not one person in that room earns it. The average is arithmetically perfect and completely useless, and this is not a trick question: it is what happens to every salary report, every house-price average and every \"average order value\" in a real dataset. Knowing which number to reach for is the whole skill." },
  { t: "def", term: "Descriptive statistics", en: "Descriptive statistics are the summary numbers that describe a dataset — where its values sit and how spread out they are.", hi: "They do not predict anything or prove anything. They answer one question: if you could only say a couple of numbers about this data, which ones?" },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> the first thing anyone does with a new dataset is describe it — mean, median, min, max, count of missing values. Not because it is interesting, but because it is how you catch that a column of ages contains a 500, or that half the rows are empty, <i>before</i> you build anything on top of it. In pandas this is one call, <code>df.describe()</code>, and every number it prints is on this page." },

  { t: "h2", n: "1", text: "The three middles" },
  { t: "p", html: "<b>Mean</b> is the average: add everything, divide by how many. <b>Median</b> is the middle value once the numbers are in order. <b>Mode</b> is the value that appears most often." },
  { t: "code", file: "central.py", code: "nums = [4, 8, 6, 8, 10]\n\nprint(sum(nums) / len(nums))\nprint(sorted(nums)[len(nums) // 2])", output: "7.2\n8" },
  { t: "viz", name: "central-tendency" },
  { t: "p", html: "Drag a value in that panel and watch the two numbers move apart. Pull one point far away and the mean chases it while the median barely notices — that difference is the entire reason both exist." },

  { t: "h2", n: "2", text: "Let the library do it" },
  { t: "p", html: "You should be able to write these by hand once. After that, use <code>statistics</code> — it ships with Python and it handles the awkward cases for you." },
  { t: "code", file: "stats_module.py", code: "import statistics\n\nnums = [4, 8, 6, 8, 10]\n\nprint(statistics.mean(nums))\nprint(statistics.median(nums))\nprint(statistics.mode(nums))", output: "7.2\n8\n8" },
  { t: "note", variant: "tip", html: "An <b>even</b> number of values has no single middle, so the median is the average of the two in the centre. <code>statistics.median</code> already does this; by hand it is <code>(ordered[mid - 1] + ordered[mid]) / 2</code>." },
  { t: "code", file: "even_median.py", code: "nums = [4, 6, 8, 10]\nordered = sorted(nums)\nmid = len(ordered) // 2\n\nprint((ordered[mid - 1] + ordered[mid]) / 2)", output: "7.0" },

  { t: "h2", n: "3", text: "When the mean lies" },
  { t: "p", html: "Here is the room from the hook, in numbers. Four ordinary salaries and one that is not." },
  { t: "code", file: "outlier.py", code: "salaries = [30000, 32000, 35000, 31000, 2000000]\n\nprint(sum(salaries) / len(salaries))\nprint(sorted(salaries)[2])", output: "425600.0\n32000" },
  { t: "p", html: "The mean says <b>425,600</b>. Nobody in that list earns anything close. The median says <b>32,000</b>, which describes four of the five people accurately. Neither number is wrong — but only one of them is <i>useful</i>." },
  { t: "think", q: "So should you always use the median?", a: "No — and this is where people over-correct.<br/><br/>The mean uses <b>every</b> value, so it is the right choice when the data is reasonably even and when totals matter: revenue, hours worked, marks out of 100.<br/><br/>The median ignores how extreme the extremes are, which is exactly what you want for <b>skewed</b> data — salaries, house prices, response times. The rule of thumb: if a single value can drag the answer somewhere no real data point lives, use the median." },
  { t: "analogy", concept: "Mean versus median", real: "A seesaw and a queue", html: "The <b>mean</b> is the balance point of a seesaw: put a very heavy person on one end and the balance point slides right across, even though nobody is standing there. The <b>median</b> is the person standing in the middle of a queue: someone at the back being enormously rich does not move who is standing in the middle. Same crowd, two honest answers to two different questions." },

  { t: "h2", n: "4", text: "Mode, and the simplest spread" },
  { t: "p", html: "Mode is the only one of the three that works on text — the most common category, not the average of one. And the <b>range</b>, <code>max - min</code>, is the crudest measure of spread there is." },
  { t: "code", file: "mode_range.py", code: "from collections import Counter\n\ngrades = [\"A\", \"B\", \"A\", \"C\", \"A\"]\nprint(Counter(grades).most_common(1)[0][0])\nprint(Counter(grades)[\"A\"])\n\nmarks = [45, 78, 91, 40]\nprint(max(marks) - min(marks))", output: "A\n3\n51" },
  { t: "note", variant: "warn", html: "The range is built from the two most extreme values in the data, which makes it the measure an outlier damages most. It is useful for a quick look and almost never the number you report. The next lesson replaces it with something that uses every value." },

  { t: "trace", intro: "The mean and median of one small list. Work out what each name holds once the line has run.", code: "nums = [4, 8, 6, 8, 10]\ntotal = sum(nums)\nmean = total / len(nums)\nordered = sorted(nums)\nmedian = ordered[2]", steps: [
    { q: "After line 2, <code>total</code> is", answer: "36", why: "4 + 8 + 6 + 8 + 10. The mean is nothing more than this divided by how many there were." },
    { q: "After line 3, <code>mean</code> is", answer: "7.2", why: "36 divided by 5. Note it is a float — <code>/</code> always is, and a mean that came out as a whole number would still be one." },
    { q: "After line 5, <code>median</code> is", answer: "8", why: "<code>sorted</code> gives [4, 6, 8, 8, 10] and index 2 is the middle of five. Sorting first is not optional — that is the debug task below." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the mean of the three numbers.", code: "nums = [2, 4, 6]\nprint(sum(nums) / len(nums))", out: "4.0" },
    { task: "Print the median of an odd-length list.", code: "print(sorted([5, 1, 3])[1])", out: "3" },
    { task: "Print the median of an even-length list.", code: "ordered = sorted([4, 6, 8, 10])\nprint((ordered[1] + ordered[2]) / 2)", out: "7.0" },
    { task: "Print the range of the marks.", code: "marks = [3, 9, 1]\nprint(max(marks) - min(marks))", out: "8" },
    { task: "Use the <code>statistics</code> module for the mean.", code: "import statistics\nprint(statistics.mean([2, 4, 6]))", out: "4" },
    { task: "Use it for the median too.", code: "import statistics\nprint(statistics.median([5, 1, 3]))", out: "3" },
    { task: "Find the most common grade.", code: "from collections import Counter\nprint(Counter([\"A\", \"B\", \"A\"]).most_common(1)[0][0])", out: "A" },
    { task: "Count how many times a value appears.", code: "from collections import Counter\nprint(Counter([1, 2, 2, 3])[2])", out: "2" },
    { task: "Print the mean rounded to 2 decimals.", code: "nums = [1, 2, 4]\nprint(round(sum(nums) / len(nums), 2))", out: "2.33" },
    { task: "Show what one outlier does to the mean.", code: "print(sum([10, 12, 500]) / 3)", out: "174.0" },
    { task: "Show that the median barely moves.", code: "print(sorted([10, 12, 500])[1])", out: "12" },
  ]},

  { t: "mistakes", items: [
    { bad: "median = nums[len(nums) // 2]", why: "The middle <b>position</b> of an unsorted list is not the middle <b>value</b>. This returns whatever happened to be sitting there, and it looks right often enough to survive testing.", fix: "ordered = sorted(nums)\nmedian = ordered[len(ordered) // 2]" },
    { bad: "mean = sum(nums) // len(nums)", why: "Floor division throws away the decimal, so a mean of 7.2 is reported as 7. On marks or money that is a real error hiding behind a number that looks fine.", fix: "mean = sum(nums) / len(nums)" },
    { bad: "average_salary = sum(salaries) / len(salaries)", why: "Not wrong, but it is the wrong summary for skewed data. Report the mean of a salary column and you describe a person who does not exist. Say which one you used and why.", fix: "typical_salary = statistics.median(salaries)" },
    { bad: "statistics.mode([1, 1, 2, 2])", why: "Two values tie. Older Python raised <code>StatisticsError</code> here, and newer versions quietly return the first one — either way you were not told about the tie.", fix: "Counter([1, 1, 2, 2]).most_common()   # see every count" },
  ]},

  { t: "debug", intro: "This should return the middle value of the list. Given 10, 2 and 8 it returns 2, which is the smallest of the three. Nothing crashes. Read it before opening the fix.", code: "def median(nums):\n    return nums[len(nums) // 2]\n\nprint(median([10, 2, 8]))", symptom: "prints 2, but the middle value of 10, 2 and 8 is 8", q: "The index is right for a three-item list. So why is the answer the smallest number?", fix: "def median(nums):\n    ordered = sorted(nums)\n    return ordered[len(ordered) // 2]\n\nprint(median([10, 2, 8]))", why: "It took the middle <b>position</b> without putting the numbers in order first, so it returned whatever happened to be sitting in the middle of the list as given — here, the 2.<br/><br/>What makes this dangerous is that it is right by accident quite often. Test it on <code>[1, 2, 3]</code> and it passes; on data that arrives roughly sorted it passes for months. The median is defined by <b>order</b>, and the sort is not a tidying step you can skip — it is the definition." },

  { t: "recap", items: [
    "<b>Mean</b> = total ÷ count · <b>median</b> = middle after sorting · <b>mode</b> = most frequent",
    "An even-length median is the average of the middle two",
    "One extreme value drags the mean and barely moves the median",
    "Use the mean for even data and totals, the median for skewed data",
    "<code>range = max - min</code> is the crudest spread, and the easiest to distort",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the difference between mean and median?", a: "The mean is the total divided by the count and uses every value. The median is the middle value after sorting and cares only about order. They agree on even data and separate as soon as it is skewed." },
    { level: "beginner", q: "When would you report the median instead of the mean?", a: "When the data is skewed or has outliers — salaries, house prices, response times. The classic answer: report the median income, because a handful of very large incomes pull the mean somewhere nobody actually is." },
    { level: "intermediate", q: "How do you find the median of an even number of values?", a: "Sort, then average the two middle values. With six items that is the third and fourth. <code>statistics.median</code> does it for you, and it is the one place a hand-written median usually goes wrong." },
    { level: "intermediate", q: "What is the mode useful for that the mean is not?", a: "Categories. The mean of \"A, B, A, C\" is meaningless, but the mode says A — the most common size, the most common city, the busiest hour. It is also the only one of the three that can have no single answer, when two values tie." },
    { level: "advanced", q: "Why is the range a poor measure of spread?", a: "Because it is built from exactly two values — the largest and the smallest — so it ignores everything in between and moves the moment either extreme is unusual. Two datasets with the same range can be shaped completely differently. Variance and standard deviation use every value, which is why they replace it." },
  ]},
];
const S2 = [
  { t: "objectives", items: [
    "Explain what <b>variance</b> measures, and why every distance gets squared",
    "Work out variance and <b>standard deviation</b> by hand, then with <code>statistics</code>",
    "Say why the standard deviation is the number you report, not the variance",
    "Tell <b>population</b> from <b>sample</b>, and know which one your data is",
  ]},
  { t: "hook", q: "Two classes both average 50 out of 100. In one, everybody scored between 48 and 52. In the other, half scored 10 and half scored 90. Same average — is it the same class?", why: "Obviously not, and the average cannot tell them apart. The centre of a dataset is only half of what describes it; the other half is how far the values sit from that centre. Report a mean without a spread and you have described two completely different classes with one identical sentence." },
  { t: "def", term: "Standard deviation", en: "The standard deviation is the typical distance between a value and the mean of its dataset.", hi: "Read it as: on average, how far off is a value? A small one means the data is huddled around the mean; a large one means it is scattered." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> spread is what turns a number into a decision. A delivery time averaging 30 minutes with a standard deviation of 2 is a business you can promise on; the same average with a deviation of 25 is one that keeps apologising. It is also how outliers get found in practice — anything more than about three standard deviations from the mean is worth a second look before you trust it." },

  { t: "h2", n: "1", text: "Building it by hand, once" },
  { t: "p", html: "Take each value's distance from the mean, <b>square</b> it, and average those squares. That average is the <b>variance</b>. Its square root is the <b>standard deviation</b>." },
  { t: "code", file: "byhand.py", code: "nums = [2, 4, 4, 4, 5, 5, 7, 9]\n\nmean = sum(nums) / len(nums)\nsquared = [(n - mean) ** 2 for n in nums]\nvariance = sum(squared) / len(nums)\n\nprint(mean)\nprint(variance)\nprint(round(variance ** 0.5, 2))", output: "5.0\n4.0\n2.0" },
  { t: "viz", name: "spread-lab" },
  { t: "p", html: "Switch to the outlier set in that panel and look at the squared column. One value contributes more than all the others put together — that is not a flaw in the formula, it is the formula doing its job." },
  { t: "think", q: "Why square the distances? Why not just average them as they are?", a: "Because they would cancel out. Distances above the mean are positive and below it negative, and by the definition of the mean they always sum to exactly <b>zero</b> — for every dataset, always. An average of zero would tell you nothing.<br/><br/>Squaring removes the sign, and it does something else on purpose: it makes far-away values count far more than near ones. A point twice as far contributes four times as much. That is why variance is sensitive to outliers, and why that sensitivity is a feature." },

  { t: "h2", n: "2", text: "Let the library do it" },
  { t: "p", html: "<code>pvariance</code> and <code>pstdev</code> are the population versions; <code>variance</code> and <code>stdev</code> are the sample ones. The difference is in section 4." },
  { t: "code", file: "module.py", code: "import statistics\n\nnums = [2, 4, 4, 4, 5, 5, 7, 9]\n\nprint(float(statistics.pvariance(nums)))\nprint(float(statistics.pstdev(nums)))\nprint(round(statistics.variance(nums), 4))", output: "4.0\n2.0\n4.5714" },

  { t: "h2", n: "3", text: "Same mean, different world" },
  { t: "p", html: "Here are the two classes from the hook, shortened. The mean cannot separate them; the standard deviation separates them instantly." },
  { t: "code", file: "same_mean.py", code: "import statistics\n\ntight = [49, 50, 51]\nwide = [10, 50, 90]\n\nprint(sum(tight) / len(tight), sum(wide) / len(wide))\nprint(round(statistics.pstdev(tight), 2), round(statistics.pstdev(wide), 2))", output: "50.0 50.0\n0.82 32.66" },
  { t: "note", variant: "tip", html: "This is why a mean should almost never travel alone. <b>50 ± 0.82</b> and <b>50 ± 32.66</b> are two different findings, and only one of them is worth acting on." },

  { t: "h2", n: "4", text: "Why report the deviation, not the variance" },
  { t: "p", html: "Squaring the distances also squares the <b>units</b>. Variance on a list of heights in centimetres comes out in centimetres <i>squared</i>, which is not a thing anybody can picture. Taking the square root puts it back into centimetres." },
  { t: "code", file: "units.py", code: "import statistics\n\nheights = [160, 170, 180]\n\nprint(round(float(statistics.pvariance(heights)), 2))\nprint(round(statistics.pstdev(heights), 2))", output: "66.67\n8.16" },
  { t: "p", html: "\"Heights vary by about 8 cm\" is a sentence. \"Heights vary by 66.67 square centimetres\" is not. Variance is the number the maths runs on; the standard deviation is the number you say out loud." },
  { t: "note", variant: "warn", html: "<b>Population or sample?</b> Dividing by <code>n</code> assumes you measured <b>everyone</b>. If your data is a sample standing in for a larger group — which it nearly always is — divide by <code>n - 1</code> instead, because a sample under-estimates the true spread. That is the difference between <code>pstdev</code> and <code>stdev</code>, and picking the wrong one on a small sample is a real error." },
  { t: "analogy", concept: "Mean and standard deviation", real: "A dartboard", html: "The <b>mean</b> is where your darts land on average — the centre of the cluster. The <b>standard deviation</b> is how tight the cluster is. Two players can have the same average position, one with every dart in a fist-sized group and the other with darts all over the wall. Only the second number tells you which is which, and only the second number tells you who to bet on." },

  { t: "trace", intro: "Variance built up one step at a time. Work out what each name holds once the line has run.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nsquares = [(n - mean) ** 2 for n in nums]\nvariance = round(sum(squares) / len(nums), 2)", steps: [
    { q: "After line 2, <code>mean</code> is", answer: "4.0", why: "12 divided by 3. A float, because <code>/</code> always is." },
    { q: "After line 3, <code>squares</code> is", answer: "[4.0, 0.0, 4.0]", accept: ["[4.0,0.0,4.0]", "[4, 0, 4]", "[4,0,4]"], why: "Distances of -2, 0 and 2, each squared. The two signs disappeared, which is the point - unsquared they would have summed to zero." },
    { q: "After line 4, <code>variance</code> is", answer: "2.67", why: "8 divided by 3, rounded. Its square root, about 1.63, is the standard deviation - the number you would actually report." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Print the mean of the list.", code: "nums = [2, 4, 6]\nprint(sum(nums) / len(nums))", out: "4.0" },
    { task: "Print each value's distance from the mean.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nprint([n - mean for n in nums])", out: "[-2.0, 0.0, 2.0]" },
    { task: "Show that those distances always add up to zero.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nprint(sum(n - mean for n in nums))", out: "0.0" },
    { task: "Square them instead, and print the total.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nprint(sum((n - mean) ** 2 for n in nums))", out: "8.0" },
    { task: "Print the population variance, rounded to 2 decimals.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nprint(round(sum((n - mean) ** 2 for n in nums) / len(nums), 2))", out: "2.67" },
    { task: "Print the standard deviation, rounded to 2 decimals.", code: "nums = [2, 4, 6]\nmean = sum(nums) / len(nums)\nvar = sum((n - mean) ** 2 for n in nums) / len(nums)\nprint(round(var ** 0.5, 2))", out: "1.63" },
    { task: "Use the <code>statistics</code> module for the population deviation.", code: "import statistics\nprint(round(statistics.pstdev([2, 4, 6]), 2))", out: "1.63" },
    { task: "Use it for the <b>sample</b> deviation and see the difference.", code: "import statistics\nprint(round(statistics.stdev([2, 4, 6]), 2))", out: "2.0" },
    { task: "Compare the spread of two lists with the same mean.", code: "import statistics\nprint(round(statistics.pstdev([49, 50, 51]), 2), round(statistics.pstdev([10, 50, 90]), 2))", out: "0.82 32.66" },
    { task: "Print the variance of a list where every value is the same.", code: "import statistics\nprint(float(statistics.pvariance([7, 7, 7])))", out: "0.0" },
    { task: "Flag anything more than 2 standard deviations from the mean.", code: "import statistics\nnums = [10, 11, 9, 60]\nmean = statistics.mean(nums)\nsd = statistics.pstdev(nums)\nprint([n for n in nums if abs(n - mean) > 2 * sd])", out: "[]" },
  ]},

  { t: "mistakes", items: [
    { bad: "spread = sum(n - mean for n in nums) / len(nums)", why: "The distances cancel out and this is <b>always zero</b>, for every dataset that has ever existed. It runs, it returns a number, and the number means nothing. Square the distances first.", fix: "spread = sum((n - mean) ** 2 for n in nums) / len(nums)" },
    { bad: "print(\"variance:\", variance, \"cm\")", why: "Variance is in <b>squared</b> units. Whatever your data was measured in, the variance is not in that unit and cannot be compared to it. Report the standard deviation when a human is reading.", fix: "print(\"std dev:\", variance ** 0.5, \"cm\")" },
    { bad: "statistics.pstdev(sample_of_100_customers)", why: "<code>pstdev</code> divides by <code>n</code>, which assumes you measured every customer there is. On a sample it under-estimates the real spread, and the smaller the sample the worse it gets.", fix: "statistics.stdev(sample_of_100_customers)   # divides by n - 1" },
    { bad: "if value > mean + 3 * variance:", why: "Mixing units again. The rule of thumb is three <b>standard deviations</b>, not three variances - and on this data those two thresholds are nowhere near each other.", fix: "if value > mean + 3 * stdev:" },
  ]},

  { t: "debug", intro: "This is meant to measure how spread out the numbers are. It returns 0 for every list it is given, including one that is obviously spread out. Nothing crashes. Read it before opening the fix.", code: "def spread(nums):\n    mean = sum(nums) / len(nums)\n    return round(sum(n - mean for n in nums) / len(nums), 4)\n\nprint(spread([2, 4, 6]))", symptom: "prints 0.0, but 2, 4 and 6 are clearly not all the same number", q: "The mean is right and every value is visited. So why is the answer zero - and why would it be zero for any list at all?", fix: "def spread(nums):\n    mean = sum(nums) / len(nums)\n    return round(sum((n - mean) ** 2 for n in nums) / len(nums), 4)\n\nprint(spread([2, 4, 6]))", why: "The distances were never squared. Values above the mean give positive distances and values below give negative ones, and by the <b>definition</b> of the mean those cancel exactly — the sum is zero for every dataset, always.<br/><br/>So this function does not fail on unusual input; it fails identically on all input, and returns a plausible-looking 0.0 while doing it. That is the tell: a statistic that comes out the same for every dataset is not measuring anything. Squaring is not a tidying detail in the formula, it is the only reason the formula works at all." },

  { t: "recap", items: [
    "<b>Variance</b> = average of the squared distances from the mean",
    "<b>Standard deviation</b> = square root of the variance, and back in the original units",
    "Distances are squared because unsquared they always sum to zero",
    "Report the standard deviation; keep the variance for the maths",
    "Divide by <code>n</code> for a population, <code>n - 1</code> for a sample",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What does the standard deviation tell you?", a: "How far a typical value sits from the mean, in the same units as the data. Small means the values are huddled around the mean; large means they are scattered. It is the second number that should always travel with an average." },
    { level: "beginner", q: "Why are the distances squared?", a: "Because unsquared they cancel — positives and negatives around the mean always sum to exactly zero. Squaring removes the sign, and it also makes distant values count much more, which is what makes variance sensitive to outliers." },
    { level: "intermediate", q: "Why report the standard deviation rather than the variance?", a: "Units. Squaring the distances squares the units, so variance on centimetres is in square centimetres, which nobody can picture. The square root brings it back to centimetres, where it can be compared to the data and to the mean." },
    { level: "intermediate", q: "What is the difference between population and sample standard deviation?", a: "The divisor. Population divides by <code>n</code> and assumes you measured everyone; sample divides by <code>n - 1</code> because a sample systematically under-estimates the spread of the group it came from. The correction matters most when the sample is small." },
    { level: "advanced", q: "Two datasets have the same mean and the same standard deviation. Are they the same shape?", a: "No. Mean and standard deviation fix the centre and the spread, and nothing else — a symmetric bell and a heavily skewed distribution can match on both. That is what skewness and kurtosis describe, and it is why plotting the data is not an optional extra: Anscombe's quartet is four datasets that agree on almost every summary statistic and look nothing alike." },
  ]},
];
const S3 = [
  { t: "objectives", items: [
    "Work out a probability by counting favourable outcomes against all outcomes",
    "Use the <b>complement</b> — often the fastest route to an answer",
    "Multiply for <b>independent</b> events, and add only when events cannot overlap",
    "Spot the double-count that makes \"or\" questions go wrong",
  ]},
  { t: "hook", q: "Roll two dice. Which is more likely — a total of 7, or a total of 2?", why: "Both are single totals, so it feels like a coin flip between them. It is not close: 7 happens six times as often. The reason is that 2 can only be made one way and 7 can be made six, and you cannot see that until you count the outcomes instead of the totals. Probability is counting, and almost every mistake in it is a counting mistake." },
  { t: "def", term: "Probability", en: "The probability of an event is the number of outcomes that satisfy it, divided by the number of possible outcomes, when every outcome is equally likely.", hi: "Always between 0 and 1. Zero means it cannot happen, one means it must, and everything real sits in between." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> every model you will meet outputs a probability, not an answer — a spam filter says 0.93, not \"spam\". Deciding where to cut that number is a business decision, and it is the same counting logic underneath. This lesson is also the floor under A/B testing and p-values later in this track." },

  { t: "h2", n: "1", text: "Counting, not guessing" },
  { t: "p", html: "Count the outcomes that satisfy the event, count all the outcomes, divide." },
  { t: "code", file: "basic.py", code: "favourable = 3\ntotal = 6\n\nprint(favourable / total)\nprint(round(favourable / total * 100, 1))", output: "0.5\n50.0" },
  { t: "viz", name: "probability-lab" },
  { t: "p", html: "That panel draws all 36 ways two dice can land. Switch between the events and watch the shape of the highlighted set change — same grid, completely different counts. This is what a probability actually is before it becomes a fraction." },
  { t: "code", file: "dice.py", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\nsevens = [o for o in outcomes if o[0] + o[1] == 7]\n\nprint(len(outcomes))\nprint(len(sevens))\nprint(round(len(sevens) / len(outcomes), 4))", output: "36\n6\n0.1667" },
  { t: "p", html: "Six ways out of thirty-six. A total of 2 has exactly one way, which is where the hook's answer comes from — and the code counted it rather than arguing about it." },

  { t: "h2", n: "2", text: "The complement" },
  { t: "p", html: "Everything that is not the event is its <b>complement</b>, and the two must add to 1. When the question says \"at least one\", the complement is nearly always the shorter road." },
  { t: "code", file: "complement.py", code: "p_rain = 0.3\nprint(round(1 - p_rain, 2))\n\n# \"at least one head in 3 flips\" = 1 - \"no heads at all\"\nprint(round(1 - 0.5 ** 3, 3))", output: "0.7\n0.875" },
  { t: "think", q: "Why is \"at least one\" easier through the complement?", a: "Because \"at least one\" is a pile of separate cases — exactly one, exactly two, exactly three — and each needs its own count.<br/><br/>Its complement is a single case: <b>none</b>. Work that out, subtract from 1, and you are done. With three coin flips it is the difference between adding three probabilities and computing <code>1 - 0.5 ** 3</code>." },

  { t: "h2", n: "3", text: "Independent events multiply" },
  { t: "p", html: "Two events are <b>independent</b> when one happening tells you nothing about the other. Then the probability of both is the product." },
  { t: "code", file: "independent.py", code: "p_head = 0.5\n\nprint(round(p_head * p_head, 2))\nprint(round(p_head ** 5, 5))", output: "0.25\n0.03125" },
  { t: "note", variant: "warn", html: "<b>A coin has no memory.</b> After four heads in a row, the next flip is still 0.5 — the coin does not know and cannot correct. Believing otherwise is the gambler's fallacy, and it is the reason casinos display the last twenty results on a screen." },

  { t: "h2", n: "4", text: "Adding — and the trap in it" },
  { t: "p", html: "For \"A <b>or</b> B\" you add — but only when the two cannot happen together. If they can, the overlap has been counted twice and must be subtracted." },
  { t: "code", file: "addition.py", code: "p_king = 4 / 52\np_heart = 13 / 52\np_king_of_hearts = 1 / 52\n\nprint(round(p_king + p_heart, 4))\nprint(round(p_king + p_heart - p_king_of_hearts, 4))", output: "0.3269\n0.3077" },
  { t: "p", html: "The first line is wrong. There is one card that is both a king and a heart, and adding the two probabilities counts it in each — so it is counted twice and the answer comes out too high. The second line subtracts it back." },
  { t: "analogy", concept: "Probability", real: "Tickets in a hat", html: "Every possible outcome is one ticket, and the hat holds all of them. A probability is just: how many of these tickets say yes, out of how many tickets there are. \"Or\" means counting the tickets in two piles — and if a ticket sits in both piles, you have to notice you picked it up twice. The whole subject is honest counting of the hat." },

  { t: "trace", intro: "Counting a two-dice event from the outcomes up. Work out what each name holds once the line has run.", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\ntotal = len(outcomes)\ndoubles = [o for o in outcomes if o[0] == o[1]]\nhits = len(doubles)\nchance = round(hits / total, 4)", steps: [
    { q: "After line 2, <code>total</code> is", answer: "36", why: "Six faces on the first die times six on the second. Every one of them is equally likely, which is what makes plain counting valid here." },
    { q: "After line 4, <code>hits</code> is", answer: "6", why: "(1,1) through (6,6). Note this is the same count as a total of 7, and the two look nothing alike on the grid." },
    { q: "After line 5, <code>chance</code> is", answer: "0.1667", why: "6 divided by 36, rounded. About one roll in six - the same as a single die showing a chosen face, which is a coincidence worth not reading anything into." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Probability of an even number on one die.", code: "print(3 / 6)", out: "0.5" },
    { task: "The same, as a percentage.", code: "print(round(3 / 6 * 100, 1))", out: "50.0" },
    { task: "Build every outcome of two dice and count them.", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\nprint(len(outcomes))", out: "36" },
    { task: "Count the ways to total 7.", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\nprint(len([o for o in outcomes if o[0] + o[1] == 7]))", out: "6" },
    { task: "Count the ways to total 2.", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\nprint(len([o for o in outcomes if o[0] + o[1] == 2]))", out: "1" },
    { task: "The complement of a 0.3 chance of rain.", code: "print(round(1 - 0.3, 2))", out: "0.7" },
    { task: "Two heads in a row.", code: "print(round(0.5 * 0.5, 2))", out: "0.25" },
    { task: "At least one head in three flips, using the complement.", code: "print(round(1 - 0.5 ** 3, 3))", out: "0.875" },
    { task: "Probability of drawing a king from a full deck.", code: "print(round(4 / 52, 4))", out: "0.0769" },
    { task: "King or heart, with the overlap subtracted.", code: "print(round(4 / 52 + 13 / 52 - 1 / 52, 4))", out: "0.3077" },
    { task: "Count \"at least one six\" on two dice - carefully.", code: "outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]\nprint(len([o for o in outcomes if o[0] == 6 or o[1] == 6]))", out: "11" },
  ]},

  { t: "mistakes", items: [
    { bad: "p_six_on_two_dice = 1/6 + 1/6", why: "This counts the double six twice, because it appears in both the \"first die is 6\" set and the \"second die is 6\" set. The honest count is <b>11</b> out of 36, not 12.", fix: "p = 11 / 36   # count the grid, or subtract the overlap" },
    { bad: "# four heads already, so tails is due\np_tails_next = 0.7", why: "The coin has no memory. Each flip is independent and stays at 0.5 forever, however lopsided the run has been. This is the gambler's fallacy, and it has cost more money than any other error in this topic.", fix: "p_tails_next = 0.5" },
    { bad: "p_a_and_b = p_a * p_b   # for any two events", why: "Multiplying only works when the events are <b>independent</b>. Drawing two kings without replacement is 4/52 then 3/51, not 4/52 twice - the first draw changed the deck.", fix: "p_two_kings = (4 / 52) * (3 / 51)" },
    { bad: "if probability > 1:", why: "A probability above 1 is not a large probability, it is a bug - almost always a double-count from adding overlapping events. Treat it as an assertion failure rather than a value to handle.", fix: "assert 0 <= probability <= 1" },
  ]},

  { t: "debug", intro: "This works out the chance of drawing a card that is a king or a heart. It returns 0.3269, which is 17 cards out of 52. There are not 17 such cards. Nothing crashes. Read it before opening the fix.", code: "def king_or_heart():\n    p_king = 4 / 52\n    p_heart = 13 / 52\n    return round(p_king + p_heart, 4)\n\nprint(king_or_heart())", symptom: "prints 0.3269, which is 17 cards out of 52, but only 16 cards are a king or a heart", q: "Four kings and thirteen hearts. Adding gives seventeen. Why is the real answer sixteen?", fix: "def king_or_heart():\n    p_king = 4 / 52\n    p_heart = 13 / 52\n    p_both = 1 / 52\n    return round(p_king + p_heart - p_both, 4)\n\nprint(king_or_heart())", why: "The king of hearts is a king <b>and</b> a heart. It is in both groups, so adding the two counts it twice and invents a card that does not exist.<br/><br/>The rule is <code>P(A or B) = P(A) + P(B) - P(A and B)</code>, and the subtraction is only zero when the two events genuinely cannot happen together. Plain addition is the special case, not the default — which is exactly backwards from how most people remember it. The tell here was that the answer implied a number of cards you could go and count." },

  { t: "recap", items: [
    "Probability = favourable outcomes ÷ all outcomes, when outcomes are equally likely",
    "Every probability sits between 0 and 1 — above 1 means a double-count",
    "<b>Complement</b>: <code>P(not A) = 1 - P(A)</code>, and it is the short road for \"at least one\"",
    "Independent events <b>multiply</b>; a coin has no memory",
    "\"Or\" adds, then subtracts the overlap — <code>P(A) + P(B) - P(A and B)</code>",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is the probability of rolling a 7 with two dice?", a: "Six of the thirty-six equally likely outcomes total seven, so 6/36, about 0.167. The way to get it right is to count outcomes rather than totals — 7 has six ways, 2 has one, and the totals are not equally likely even though the outcomes are." },
    { level: "beginner", q: "What is the complement rule?", a: "<code>P(not A) = 1 - P(A)</code>. It is most useful for \"at least one\" questions, where the event itself is many cases and its complement — none — is a single one." },
    { level: "intermediate", q: "When can you multiply two probabilities?", a: "When the events are independent, meaning one happening does not change the other's chances. Two coin flips qualify; drawing two cards without replacement does not, because the first draw changes what is left." },
    { level: "intermediate", q: "Why is P(king or heart) not 4/52 + 13/52?", a: "Because the king of hearts belongs to both groups and gets counted twice. The general rule is <code>P(A) + P(B) - P(A and B)</code>; plain addition is only valid when the events are mutually exclusive." },
    { level: "advanced", q: "What is the gambler's fallacy, and why does it feel so convincing?", a: "It is the belief that a run of one outcome makes the other \"due\". Independent trials have no memory, so the next flip is 0.5 regardless. It feels convincing because the law of large numbers is real — the long-run proportion does settle at 0.5 — but it settles by <b>diluting</b> the early run across many more trials, not by correcting it. Nothing ever pushes back the other way." },
  ]},
];
const S4 = [
  { t: "objectives", items: [
    "Recognise the <b>normal distribution</b> and the two numbers that describe it completely",
    "Turn any value into a <b>z-score</b> — how many standard deviations it sits from the mean",
    "Use the <b>68-95-99.7 rule</b> to judge how unusual a value is, without a lookup table",
    "Compare results measured on completely different scales by standardising them",
  ]},
  { t: "hook", q: "A student scores 78 in Physics and 82 in Chemistry. Which is the better result?", why: "82 is the obvious answer and it is the wrong one. Physics averaged 60 that year with a standard deviation of 6, so 78 sits three standard deviations above the class — roughly the top student in a thousand. Chemistry averaged 80 with a standard deviation of 10, so 82 is barely above the middle of the room. The raw marks cannot tell you any of this, because they are measured on two scales that only look alike. Converting both to a z-score is what makes the comparison honest, and that conversion is this whole lesson." },
  { t: "def", term: "Normal distribution", en: "A symmetric, bell-shaped distribution where most values cluster near the mean and fewer appear the further out you go — described completely by just two numbers, its mean and its standard deviation.", hi: "Because it is symmetric, its mean, median and mode all land on the same point: the peak. Every rule in this lesson leans on that symmetry, which is why the first thing to check is whether your data is actually shaped like this." },
  { t: "note", variant: "key", html: "💼 <b>On the job:</b> standardising is the first step of most machine-learning pipelines. scikit-learn's <code>StandardScaler</code> is exactly the formula in §2, applied one column at a time. Skip it and a model reads a salary in the lakhs as more important than an age in the tens — purely because the numbers are bigger, not because the feature matters more. The same z-score is what fraud systems use to flag a transaction as unusual, and what the A/B testing lesson at the end of this track is built on." },

  { t: "h2", n: "1", text: "The shape that keeps turning up" },
  { t: "p", html: "Heights, exam marks, measurement errors, the combined effect of many small independent causes — they all drift towards the same bell shape. When data really is normal, the mean sits at the peak and the median lands on top of it." },
  { t: "code", file: "shape.py", code: "import statistics\n\nmarks = [72, 85, 78, 90, 65, 88, 75, 82]\n\nprint(statistics.mean(marks))\nprint(statistics.median(marks))\nprint(round(statistics.pstdev(marks), 2))", output: "79.375\n80.0\n7.97" },
  { t: "p", html: "Mean 79.375, median 80.0. Those two being close is the quickest test that data is roughly symmetric, and it is worth running before you trust anything else here. When the mean drifts well away from the median the data is <b>skewed</b>, and every tool in this lesson starts quietly lying to you." },
  { t: "viz", name: "bell-curve" },
  { t: "p", html: "Drag the slider and watch the shaded region. The percentage it reports is how much of the data lies to the <b>left</b> of that z-score — so z = 0 reads 50%, because a symmetric curve is split in half by its own mean. Push it out to z = 2 and the shade covers about 97.7%, which is the same fact stated backwards: only about 2.3% of values sit further right than two standard deviations. Slide it to −1 and +1 and notice the gap between them is roughly 68%. That is the rule in §3, and it is worth seeing as an area before meeting it as a number." },

  { t: "h2", n: "2", text: "The z-score" },
  { t: "p", html: "A z-score rewrites a value as a distance: <code>z = (value - mean) / std</code>. It answers exactly one question — how many standard deviations from the mean is this? Positive means above, negative means below, and the units of the original data vanish completely." },
  { t: "code", file: "zscore.py", code: "import statistics\n\nmarks = [72, 85, 78, 90, 65, 88, 75, 82]\nmean = statistics.mean(marks)\nstd = statistics.pstdev(marks)\n\nprint(round((90 - mean) / std, 2))\nprint(round((65 - mean) / std, 2))", output: "1.33\n-1.8" },
  { t: "p", html: "The top mark is 1.33 standard deviations above average and the bottom is 1.8 below. Neither is remarkable — in a class of eight you would expect the spread to be about this wide. Note that the marks were out of 100 but the z-scores have no units at all, which is precisely what makes them portable." },

  { t: "h2", n: "3", text: "The 68-95-99.7 rule" },
  { t: "p", html: "For data that genuinely is normal, the proportion inside each band is fixed: about <b>68%</b> of values fall within one standard deviation of the mean, about <b>95%</b> within two, and about <b>99.7%</b> within three. Three numbers, and you can judge almost any value on sight." },
  { t: "code", file: "rule.py", code: "import statistics\n\nmarks = [72, 85, 78, 90, 65, 88, 75, 82]\nmean = statistics.mean(marks)\nstd = statistics.pstdev(marks)\n\nwithin = [m for m in marks if abs((m - mean) / std) <= 1]\nprint(len(within))\nprint(round(len(within) / len(marks) * 100, 1))", output: "5\n62.5" },
  { t: "p", html: "Five of eight, or 62.5%, against a predicted 68% — and the gap is the lesson, not an error. Eight values is nowhere near enough for the rule to land on the nose. It describes the shape data settles into across many observations; it promises nothing about any particular handful." },
  { t: "note", variant: "warn", html: "<b>The rule assumes normality, and a lot of real data is not normal.</b> Income, city populations, website session lengths and wealth are all heavily skewed — a few enormous values drag the mean far above the median. Apply 68-95-99.7 to those and you get confident nonsense. Run the mean-versus-median check from §1 first; when they disagree badly, reach for percentiles instead, which is the next lesson." },

  { t: "h2", n: "4", text: "Comparing across different scales" },
  { t: "p", html: "This is what standardising is really for. Two marks out of a hundred are not comparable when the two classes had different averages and different spreads. Their z-scores are, because both have been converted into the same unit." },
  { t: "code", file: "compare.py", code: "# (score, class mean, class std)\nphysics = (78, 60, 6)\nchemistry = (82, 80, 10)\n\nfor score, mean, std in (physics, chemistry):\n    print(round((score - mean) / std, 2))", output: "3.0\n0.2" },
  { t: "p", html: "There is the hook's answer, in four lines. The 78 stands three standard deviations above its class; the 82 stands a fifth of one above its own. The lower raw mark is the far stronger result, and no amount of staring at 78 and 82 would ever have revealed it." },

  { t: "think", q: "Why does subtracting the mean and then dividing by the standard deviation make two different exams comparable?", a: "Because the two steps strip out the two things that differ between them.<br/><br/><b>Subtracting the mean</b> slides both distributions until their centres sit at zero. That cancels one class simply being marked more generously than the other.<br/><br/><b>Dividing by the standard deviation</b> then rescales both so that one unit means the same thing in each: one typical distance from the centre. A class where everyone scores within a few marks of each other and a class spread across the whole range are put on equal footing.<br/><br/>What survives both steps is a pure position — where this student sits inside their own class. That is the only quantity the two exams genuinely share, and standardising is the operation that isolates it." },
  { t: "analogy", concept: "Z-score", real: "Measuring a walk in steps, not in metres", html: "Two people walk away from the same door and you want to know who went further. One says \"40 steps\", the other says \"30 steps\". But the first is a small child and the second is very tall, so a step means something different for each of them and the two counts cannot be compared as they stand.<br/><br/>The standard deviation is a dataset's step length: the typical distance one of its values sits from the centre. A z-score reports the journey in steps rather than in marks, rupees or centimetres. Once both walks are written in their own steps, the comparison finally means something — and that is the entire trick." },

  { t: "trace", intro: "Standardising a single value, from the raw list upwards. Work out what each name holds once the line has run.", code: "import statistics\nmarks = [70, 80, 90]\nmean = statistics.mean(marks)\nstd = round(statistics.pstdev(marks), 2)\nz = round((90 - mean) / std, 2)", steps: [
    { q: "After line 3, <code>mean</code> is", answer: "80", why: "70 + 80 + 90 is 240, divided by 3. The three values are evenly spaced, so the middle one is also the mean — which will not usually be true." },
    { q: "After line 4, <code>std</code> is", answer: "8.16", why: "The deviations are -10, 0 and +10. Squared they are 100, 0 and 100; the average of those is 66.67, and its square root is 8.1649…, rounded here to 8.16." },
    { q: "After line 5, <code>z</code> is", answer: "1.23", why: "90 is 10 above the mean, and 10 divided by 8.16 is 1.2254…, which rounds to 1.23. So the top of these three sits a little over one standard deviation above the centre." },
  ]},

  { t: "drills", intro: "One idea each. Write it yourself before you open the answer.", items: [
    { task: "Z-score of 85 when the mean is 75 and the standard deviation is 5.", code: "print(round((85 - 75) / 5, 2))", out: "2.0" },
    { task: "A value below the mean: 68, same mean and standard deviation.", code: "print(round((68 - 75) / 5, 2))", out: "-1.4" },
    { task: "Population standard deviation of [70, 80, 90].", code: "import statistics\nprint(round(statistics.pstdev([70, 80, 90]), 2))", out: "8.16" },
    { task: "Is a mark of 92 an outlier by the |z| > 2 rule, with mean 75 and std 5?", code: "print(abs(round((92 - 75) / 5, 2)) > 2)", out: "True" },
    { task: "Count how many marks fall within one standard deviation of the mean.", code: "import statistics\nd = [72, 85, 78, 90, 65, 88, 75, 82]\nm = statistics.mean(d)\ns = statistics.pstdev(d)\nprint(len([x for x in d if abs((x - m) / s) <= 1]))", out: "5" },
    { task: "The same, as a percentage of the class.", code: "import statistics\nd = [72, 85, 78, 90, 65, 88, 75, 82]\nm = statistics.mean(d)\ns = statistics.pstdev(d)\nprint(round(len([x for x in d if abs((x - m) / s) <= 1]) / len(d) * 100, 1))", out: "62.5" },
    { task: "Standardise the whole list in one comprehension.", code: "import statistics\nd = [72, 85, 78, 90, 65, 88, 75, 82]\nm = statistics.mean(d)\ns = statistics.pstdev(d)\nprint([round((x - m) / s, 2) for x in d])", out: "[-0.93, 0.71, -0.17, 1.33, -1.8, 1.08, -0.55, 0.33]" },
    { task: "Go backwards: what raw mark has a z-score of 1.5, when the mean is 75 and the std is 8?", code: "print(round(75 + 1.5 * 8, 2))", out: "87.0" },
    { task: "Population variance of [70, 80, 90] — the standard deviation before the square root.", code: "import statistics\nprint(round(statistics.pvariance([70, 80, 90]), 2))", out: "66.67" },
    { task: "The skew check: how far apart are the mean and the median?", code: "import statistics\nd = [72, 85, 78, 90, 65, 88, 75, 82]\nprint(round(statistics.mean(d) - statistics.median(d), 3))", out: "-0.625" },
    { task: "Whose result is better — 170cm where mean is 165 and std 8, or 60kg where mean is 55 and std 10?", code: "print(round((170 - 165) / 8, 2) > round((60 - 55) / 10, 2))", out: "True" },
  ]},

  { t: "mistakes", items: [
    { bad: "z = (value - mean) / mean", why: "Dividing by the mean gives a percentage difference, not a z-score. It has no idea how spread out the data is, so a value 10 above the mean scores the same whether the class was tightly bunched or scattered across the whole range.", fix: "z = (value - mean) / std" },
    { bad: "std = statistics.stdev(all_marks)   # every student in the class", why: "<code>stdev</code> divides by n-1 because it is estimating a population from a <b>sample</b>. When the list already is the whole population — every student in the class — the right function is <code>pstdev</code>, which divides by n. On small lists the two differ enough to change an answer.", fix: "std = statistics.pstdev(all_marks)" },
    { bad: "if abs(z) > 2:\n    data.remove(value)", why: "A high z-score means <b>look at this</b>, not <b>delete this</b>. Genuine extremes are often the most valuable rows you have — the fraud, the outage, the record-breaking day. Quietly dropping them is how a dataset gets tidied into uselessness.", fix: "if abs(z) > 2:\n    flag_for_review(value)" },
    { bad: "test_z = (test_value - test_mean) / test_std", why: "Standardising test data with its own mean and standard deviation leaks information and makes the model look better than it is. The test set has to be scaled with the numbers learned from the <b>training</b> set, because at prediction time that is all you would have.", fix: "test_z = (test_value - train_mean) / train_std" },
  ]},

  { t: "debug", intro: "This standardises a class's marks. It runs cleanly and returns a plausible-looking list, but every number in it is slightly too small — worked by hand, the lowest mark should score -1.8 and this reports -1.69. Read it before opening the fix.", code: "import statistics\n\ndef z_scores(values):\n    m = statistics.mean(values)\n    s = statistics.stdev(values)\n    return [round((v - m) / s, 2) for v in values]\n\nmarks = [72, 85, 78, 90, 65, 88, 75, 82]\nprint(z_scores(marks))", symptom: "every z-score is slightly too small in magnitude: the lowest mark reports -1.69 where hand-working the same numbers gives -1.8", q: "The formula is right and the mean is right. So why is every result pulled towards zero?", fix: "import statistics\n\ndef z_scores(values):\n    m = statistics.mean(values)\n    s = statistics.pstdev(values)\n    return [round((v - m) / s, 2) for v in values]\n\nmarks = [72, 85, 78, 90, 65, 88, 75, 82]\nprint(z_scores(marks))", why: "<code>statistics.stdev</code> and <code>statistics.pstdev</code> are different functions, and the difference is one character in the name and one character in the arithmetic.<br/><br/><code>stdev</code> divides the squared deviations by <b>n-1</b>, because it assumes the list is a sample being used to estimate a larger population it cannot see. <code>pstdev</code> divides by <b>n</b>, because the list is the whole population. Here the marks <i>are</i> the entire class, so <code>pstdev</code> is correct — and it returns 7.97 where <code>stdev</code> returns 8.52.<br/><br/>A larger denominator makes every z-score smaller, which is why the whole list is squashed towards zero rather than one entry being wrong. That uniformity is the tell: a bug that shifts every value by the same factor is almost always in a shared divisor, not in the loop.<br/><br/>This is the single most common silent error in this topic, and nothing crashes to warn you — on eight values it is a 7% difference, quite big enough to move a number across a threshold somebody is making a decision with." },

  { t: "recap", items: [
    "The <b>normal distribution</b> is symmetric and fully described by its mean and standard deviation",
    "<code>z = (value - mean) / std</code> — how many standard deviations from the centre, with no units left",
    "<b>68-95-99.7</b>: that share of normal data lies within 1, 2 and 3 standard deviations of the mean",
    "Z-scores make different scales comparable, which is why models standardise before training",
    "Use <code>pstdev</code> for a whole population and <code>stdev</code> for a sample — the two do not agree",
  ]},

  { t: "interview", items: [
    { level: "beginner", q: "What is a z-score and what does it tell you?", a: "It is <code>(value - mean) / std</code>: how many standard deviations a value sits from the mean. Positive is above the mean, negative below, and the result carries no units — which is exactly what lets you compare values that were measured on different scales." },
    { level: "beginner", q: "State the 68-95-99.7 rule.", a: "In a normal distribution, roughly 68% of values fall within one standard deviation of the mean, 95% within two and 99.7% within three. It only holds for data that is actually normal, so it is worth checking that the mean and median are close before leaning on it." },
    { level: "intermediate", q: "Why do machine-learning pipelines standardise features?", a: "Because algorithms that measure distance or weight coefficients — k-NN, SVM, PCA, anything gradient-descent based — treat a bigger number as a more important one. A salary in the lakhs would swamp an age in the tens purely on magnitude. Standardising puts every feature on the same footing so the model weighs them on evidence rather than on units. Tree-based models are the exception; they split on order, so scale does not affect them." },
    { level: "intermediate", q: "What is the difference between stdev and pstdev, and when does it matter?", a: "<code>pstdev</code> divides by n and is right when your data is the entire population. <code>stdev</code> divides by n-1, the Bessel correction, because a sample's spread systematically underestimates the population's and the smaller denominator compensates. The difference shrinks as n grows and is negligible in the thousands, but on small datasets it is easily enough to change a reported answer." },
    { level: "advanced", q: "A colleague flags every row with |z| > 3 as an outlier and drops it. What would you push back on?", a: "Three things. First, the rule assumes normality — on skewed data like income, the mean and standard deviation are themselves dragged by the extreme values, so the very rows you are hunting corrupt the threshold used to find them. Second, the mean and standard deviation are not robust: one enormous value inflates the std and can mask itself, which is why the median and IQR are the safer tools on messy data. Third, and most important, an outlier is not automatically an error. It may be the fraud, the outage or the record day — the row with the most information in it. The right move is to flag and investigate, and to delete only once you know it is a genuine data-quality fault." },
  ]},
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
      "Write a function `mean_of(nums)` that returns the average (mean) of the list.",
      [{ input: "nums=[2,4,6]", output: "4" }, { input: "nums=[10,20,30,40]", output: "25" }],
      "def mean_of(nums):\n    pass\n", "def mean_of(nums):\n    return sum(nums) / len(nums)\n",
      [{ args: [[2,4,6]], expected: 4 }, { args: [[10,20,30,40]], expected: 25 }, { args: [[5]], expected: 5 }],
      ["Mean = sum(nums) / len(nums).", "sum() and len() are built in."], ["mean","stats"]),
    P(2, "median-of", "Median", "median_of",
      "Write a function `median_of(nums)` that returns the median (sort the values and take the middle one). If the count is even, take the average of the two middle values.",
      [{ input: "nums=[1,2,3]", output: "2" }, { input: "nums=[1,2,3,4]", output: "2.5" }],
      "def median_of(nums):\n    pass\n", "def median_of(nums):\n    s = sorted(nums)\n    n = len(s)\n    m = n // 2\n    return s[m] if n % 2 else (s[m-1] + s[m]) / 2\n",
      [{ args: [[1,2,3]], expected: 2 }, { args: [[1,2,3,4]], expected: 2.5 }, { args: [[7,3,5]], expected: 5 }],
      ["First do sorted(nums).", "The middle index is len//2."], ["median","stats"]),
    P(3, "data-range", "Data Range", "data_range",
      "Write a function `data_range(nums)` that returns the range (max - min).",
      [{ input: "nums=[3,7,2]", output: "5" }, { input: "nums=[10,10]", output: "0" }],
      "def data_range(nums):\n    pass\n", "def data_range(nums):\n    return max(nums) - min(nums)\n",
      [{ args: [[3,7,2]], expected: 5 }, { args: [[10,10]], expected: 0 }, { args: [[1,9,4]], expected: 8 }],
      ["Use max() and min().", "return max(nums) - min(nums)"], ["range","stats"]) ]},

  { slug: "spread", order: 2, title: "Variance & Standard Deviation", minutes: 12, content: S2, problems: [
    P(1, "variance", "Variance", "variance",
      "Write a function `variance(nums)` that returns the variance = the average of (value - mean) squared for every value.",
      [{ input: "nums=[2,4,6,8]", output: "5" }, { input: "nums=[4,4,4]", output: "0" }],
      "def variance(nums):\n    pass\n", "def variance(nums):\n    m = sum(nums) / len(nums)\n    return sum((x - m) ** 2 for x in nums) / len(nums)\n",
      [{ args: [[2,4,6,8]], expected: 5 }, { args: [[4,4,4]], expected: 0 }, { args: [[1,3,5,7]], expected: 5 }],
      ["First work out the mean.", "Then sum((x-mean)**2) / len."], ["variance","stats"]),
    P(2, "std-dev", "Standard Deviation", "std_dev",
      "Write a function `std_dev(nums)` that returns the standard deviation (the square root of the variance), rounded to 2 decimals.",
      [{ input: "nums=[1,3,5,7]", output: "2.24" }, { input: "nums=[4,4,4]", output: "0" }],
      "import math\n\ndef std_dev(nums):\n    pass\n", "import math\n\ndef std_dev(nums):\n    m = sum(nums) / len(nums)\n    var = sum((x - m) ** 2 for x in nums) / len(nums)\n    return round(math.sqrt(var), 2)\n",
      [{ args: [[1,3,5,7]], expected: 2.24 }, { args: [[2,4,6,8]], expected: 2.24 }, { args: [[4,4,4]], expected: 0 }],
      ["math.sqrt(variance).", "Do not forget round(result, 2)."], ["std","stats"]) ]},

  { slug: "probability-basics", order: 3, title: "Probability Basics", minutes: 11, content: S3, problems: [
    P(1, "probability", "Probability", "probability",
      "Write a function `probability(favorable, total)` that returns the probability = favorable / total.",
      [{ input: "favorable=1, total=2", output: "0.5" }, { input: "favorable=1, total=4", output: "0.25" }],
      "def probability(favorable, total):\n    pass\n", "def probability(favorable, total):\n    return favorable / total\n",
      [{ args: [1,2], expected: 0.5 }, { args: [3,6], expected: 0.5 }, { args: [1,4], expected: 0.25 }],
      ["The operator for division is /.", "return favorable / total"], ["probability","stats"]),
    P(2, "complement", "Complement", "complement",
      "Write a function `complement(p)` that returns the probability of it 'not happening' = 1 - p (rounded to 2 decimals).",
      [{ input: "p=0.3", output: "0.7" }, { input: "p=0.5", output: "0.5" }],
      "def complement(p):\n    pass\n", "def complement(p):\n    return round(1 - p, 2)\n",
      [{ args: [0.3], expected: 0.7 }, { args: [0.5], expected: 0.5 }, { args: [1], expected: 0 }],
      ["1 - p.", "round(1 - p, 2)"], ["probability","stats"]) ]},

  { slug: "normal-distribution", order: 4, title: "Normal Distribution & Z-Score", minutes: 13, content: S4, problems: [
    P(1, "z-score", "Z-Score", "z_score",
      "Write a function `z_score(x, mean, std)` that returns the z-score = (x - mean) / std.",
      [{ input: "x=85, mean=75, std=5", output: "2" }, { input: "x=70, mean=75, std=5", output: "-1" }],
      "def z_score(x, mean, std):\n    pass\n", "def z_score(x, mean, std):\n    return (x - mean) / std\n",
      [{ args: [85,75,5], expected: 2 }, { args: [70,75,5], expected: -1 }, { args: [80,75,5], expected: 1 }],
      ["Formula: (x - mean) / std.", "Watch the brackets."], ["z-score","stats"]),
    P(2, "is-outlier", "Detect Outlier", "is_outlier",
      "Write a function `is_outlier(z)` that returns `True` if |z| > 2 (that is, an outlier), otherwise `False`.",
      [{ input: "z=3", output: "True" }, { input: "z=1", output: "False" }],
      "def is_outlier(z):\n    pass\n", "def is_outlier(z):\n    return abs(z) > 2\n",
      [{ args: [3], expected: true }, { args: [1], expected: false }, { args: [-2.5], expected: true }],
      ["abs() gives you the positive value.", "return abs(z) > 2"], ["z-score","stats"]) ]},

  { slug: "percentiles-iqr", order: 5, title: "Percentiles, Quartiles & IQR", minutes: 12, content: S5, problems: [
    P(1, "percentile-rank", "Percentile Rank", "percentile_rank",
      "Write a function `percentile_rank(nums, value)` that returns what % of the values are smaller than `value` (1 decimal).",
      [{ input: "nums=[1,2,3,4], value=3", output: "50" }], "def percentile_rank(nums, value):\n    pass\n",
      "def percentile_rank(nums, value):\n    return round(sum(1 for x in nums if x < value) / len(nums) * 100, 1)\n",
      [{ args: [[1,2,3,4], 3], expected: 50 }, { args: [[10,20,30,40,50], 30], expected: 40 }, { args: [[5,5,5], 5], expected: 0 }],
      ["Count how many are smaller than value.", "/ len * 100, then round(..., 1)."], ["stats"], "Easy"),
    P(2, "iqr", "Interquartile Range", "iqr",
      "Write a function `iqr(nums)` that returns the IQR = Q3 - Q1 (median of the upper half - median of the lower half).",
      [{ input: "nums=[1,2,3,4,5,6,7,8]", output: "4" }], "def iqr(nums):\n    pass\n",
      "def iqr(nums):\n    s = sorted(nums)\n    n = len(s)\n    def med(a):\n        k = len(a); m = k // 2\n        return a[m] if k % 2 else (a[m-1] + a[m]) / 2\n    lower = s[:n//2]\n    upper = s[n//2+1:] if n % 2 else s[n//2:]\n    return med(upper) - med(lower)\n",
      [{ args: [[1,2,3,4,5,6,7,8]], expected: 4 }, { args: [[1,2,3,4,5,6,7]], expected: 4 }, { args: [[10,20,30,40]], expected: 20 }],
      ["Split the data into a lower and an upper half.", "Take the median of each and subtract."], ["stats"], "Medium") ]},

  { slug: "correlation", order: 6, title: "Correlation & Covariance", minutes: 13, content: S6, problems: [
    P(1, "covariance", "Covariance", "covariance",
      "Write a function `covariance(x, y)` that returns the population covariance (2 decimals).",
      [{ input: "x=[1,2,3], y=[2,4,6]", output: "1.33" }], "def covariance(x, y):\n    pass\n",
      "def covariance(x, y):\n    n = len(x)\n    mx = sum(x) / n\n    my = sum(y) / n\n    return round(sum((x[i]-mx)*(y[i]-my) for i in range(n)) / n, 2)\n",
      [{ args: [[1,2,3],[2,4,6]], expected: 1.33 }, { args: [[1,2,3],[1,2,3]], expected: 0.67 }, { args: [[2,4,6],[1,3,5]], expected: 2.67 }],
      ["Work out the means of both.", "mean((x-mx)*(y-my)), rounded to 2."], ["stats"], "Medium"),
    P(2, "correlation", "Correlation Coefficient", "correlation",
      "Write a function `correlation(x, y)` that returns the Pearson correlation (-1 to +1, 2 decimals).",
      [{ input: "x=[1,2,3], y=[2,4,6]", output: "1" }, { input: "x=[1,2,3], y=[3,2,1]", output: "-1" }],
      "import math\n\ndef correlation(x, y):\n    pass\n",
      "import math\n\ndef correlation(x, y):\n    n = len(x)\n    mx = sum(x) / n\n    my = sum(y) / n\n    cov = sum((x[i]-mx)*(y[i]-my) for i in range(n))\n    dx = math.sqrt(sum((v-mx)**2 for v in x))\n    dy = math.sqrt(sum((v-my)**2 for v in y))\n    return round(cov / (dx * dy), 2)\n",
      [{ args: [[1,2,3],[2,4,6]], expected: 1 }, { args: [[1,2,3],[3,2,1]], expected: -1 }, { args: [[1,2,3,4],[1,3,2,5]], expected: 0.83 }],
      ["cov / (std_x * std_y).", "round(..., 2)."], ["stats"], "Hard") ]},

  { slug: "bayes", order: 7, title: "Conditional Probability & Bayes", minutes: 12, content: S7, problems: [
    P(1, "bayes", "Bayes' Theorem", "bayes",
      "Write a function `bayes(p_a, p_b_given_a, p_b)` that returns P(A|B) = P(B|A) * P(A) / P(B) (2 decimals).",
      [{ input: "p_a=0.01, p_b_given_a=0.9, p_b=0.05", output: "0.18" }], "def bayes(p_a, p_b_given_a, p_b):\n    pass\n",
      "def bayes(p_a, p_b_given_a, p_b):\n    return round(p_b_given_a * p_a / p_b, 2)\n",
      [{ args: [0.01, 0.9, 0.05], expected: 0.18 }, { args: [0.5, 0.8, 0.5], expected: 0.8 }, { args: [0.2, 0.5, 0.4], expected: 0.25 }],
      ["Apply the formula directly: P(B|A)*P(A)/P(B).", "round(..., 2)."], ["stats"], "Hard") ]},

  { slug: "distributions", order: 8, title: "Common Distributions", minutes: 12, content: S8, problems: [
    P(1, "binomial-prob", "Binomial Probability", "binomial_prob",
      "Write a function `binomial_prob(n, k, p)` that returns the probability of exactly k successes in n trials (4 decimals). Formula: C(n,k) * p^k * (1-p)^(n-k).",
      [{ input: "n=2, k=1, p=0.5", output: "0.5" }], "import math\n\ndef binomial_prob(n, k, p):\n    pass\n",
      "import math\n\ndef binomial_prob(n, k, p):\n    return round(math.comb(n, k) * p**k * (1-p)**(n-k), 4)\n",
      [{ args: [2,1,0.5], expected: 0.5 }, { args: [3,2,0.5], expected: 0.375 }, { args: [5,0,0.5], expected: 0.0312 }],
      ["math.comb(n, k) gives the combinations.", "round(..., 4)."], ["stats"], "Hard") ]},

  { slug: "sampling-clt", order: 9, title: "Sampling & Central Limit Theorem", minutes: 12, content: S9, problems: [
    P(1, "standard-error", "Standard Error", "standard_error",
      "Write a function `standard_error(std, n)` that returns the standard error = std / sqrt(n) (2 decimals).",
      [{ input: "std=10, n=4", output: "5" }], "import math\n\ndef standard_error(std, n):\n    pass\n",
      "import math\n\ndef standard_error(std, n):\n    return round(std / math.sqrt(n), 2)\n",
      [{ args: [10,4], expected: 5 }, { args: [6,9], expected: 2 }, { args: [20,100], expected: 2 }],
      ["math.sqrt(n) gives the root.", "std / sqrt(n), rounded to 2."], ["stats"], "Medium") ]},

  { slug: "hypothesis-testing", order: 10, title: "Hypothesis Testing & p-value", minutes: 13, content: S10, problems: [
    P(1, "z-test-stat", "Z-Test Statistic", "z_test_stat",
      "Write a function `z_test_stat(sample_mean, pop_mean, std, n)` that returns z = (sample_mean - pop_mean) / (std / sqrt(n)) (2 decimals).",
      [{ input: "sample_mean=105, pop_mean=100, std=15, n=9", output: "1" }], "import math\n\ndef z_test_stat(sample_mean, pop_mean, std, n):\n    pass\n",
      "import math\n\ndef z_test_stat(sample_mean, pop_mean, std, n):\n    return round((sample_mean - pop_mean) / (std / math.sqrt(n)), 2)\n",
      [{ args: [105,100,15,9], expected: 1 }, { args: [110,100,20,16], expected: 2 }, { args: [100,100,5,25], expected: 0 }],
      ["Denominator = std / sqrt(n).", "Divide (sample_mean - pop_mean) by that."], ["stats"], "Hard") ]},

  { slug: "ab-testing", order: 11, title: "A/B Testing", minutes: 12, content: S11, problems: [
    P(1, "conversion-rate", "Conversion Rate", "conversion_rate",
      "Write a function `conversion_rate(conversions, visitors)` that returns the conversion % (2 decimals).",
      [{ input: "conversions=50, visitors=1000", output: "5" }], "def conversion_rate(conversions, visitors):\n    pass\n",
      "def conversion_rate(conversions, visitors):\n    return round(conversions / visitors * 100, 2)\n",
      [{ args: [50,1000], expected: 5 }, { args: [30,200], expected: 15 }, { args: [0,50], expected: 0 }],
      ["conversions / visitors * 100.", "round(..., 2)."], ["stats"], "Easy"),
    P(2, "lift", "A/B Lift", "lift",
      "Write a function `lift(control, variant)` that returns by what % the variant is better than the control (2 decimals). Formula: (variant - control) / control * 100.",
      [{ input: "control=0.10, variant=0.12", output: "20" }], "def lift(control, variant):\n    pass\n",
      "def lift(control, variant):\n    return round((variant - control) / control * 100, 2)\n",
      [{ args: [0.10,0.12], expected: 20 }, { args: [0.05,0.06], expected: 20 }, { args: [0.2,0.2], expected: 0 }],
      ["(variant - control) / control * 100.", "round(..., 2)."], ["stats"], "Medium") ]},
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

const PDrec = "records is a list of dicts (like database rows). Build the DataFrame with `pd.DataFrame(records)`.";
const pandasLessons = [
  { slug: "numpy-arrays", order: 1, title: "NumPy Arrays & Vectorization", minutes: 11, content: PD1, problems: [] },
  { slug: "series-dataframe", order: 2, title: "Series & DataFrame", minutes: 13, content: PD2, problems: [
    P(1, "df-row-count", "Count Rows", "row_count",
      "Write a function `row_count(records)` that returns how many rows the DataFrame has. " + PDrec,
      [{ input: 'records=[{"a":1},{"a":2}]', output: "2" }], "import pandas as pd\n\ndef row_count(records):\n    pass\n",
      "import pandas as pd\n\ndef row_count(records):\n    df = pd.DataFrame(records)\n    return len(df)\n",
      [{ args: [[{ a: 1 }, { a: 2 }]], expected: 2 }, { args: [[{ x: 1 }]], expected: 1 }, { args: [[{ a: 1 }, { a: 2 }, { a: 3 }]], expected: 3 }],
      ["pd.DataFrame(records) gives the DataFrame.", "len(df) gives the rows."], ["pandas"], "Easy"),
    P(2, "df-column-total", "Column Total", "column_total",
      "Write a function `column_total(records, col)` that returns the total (sum) of the `col` column. " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200}], col="sales"', output: "300" }], "import pandas as pd\n\ndef column_total(records, col):\n    pass\n",
      "import pandas as pd\n\ndef column_total(records, col):\n    return int(pd.DataFrame(records)[col].sum())\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 350 }, { args: [[{ x: 5 }, { x: 5 }], "x"], expected: 10 }, { args: [[{ n: 1 }, { n: 2 }, { n: 3 }], "n"], expected: 6 }],
      ["df[col].sum() gives the total.", "int() gives a plain number."], ["pandas"], "Easy") ]},
  { slug: "select-filter", order: 3, title: "Selecting & Filtering", minutes: 13, content: PD3, problems: [
    P(1, "df-column-mean", "Column Average", "column_mean",
      "Write a function `column_mean(records, col)` that returns the average of `col` (2 decimals). " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200},{"sales":50}], col="sales"', output: "116.67" }], "import pandas as pd\n\ndef column_mean(records, col):\n    pass\n",
      "import pandas as pd\n\ndef column_mean(records, col):\n    return round(float(pd.DataFrame(records)[col].mean()), 2)\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 116.67 }, { args: [[{ n: 2 }, { n: 4 }], "n"], expected: 3 }, { args: [[{ n: 10 }], "n"], expected: 10 }],
      ["df[col].mean() gives the average.", "round(float(...), 2)."], ["pandas"], "Medium"),
    P(2, "df-filter-count", "Filter & Count", "filter_count",
      "Write a function `filter_count(records, col, value)` that counts how many rows have `col` equal to `value`. " + PDrec,
      [{ input: 'records=[{"city":"Delhi"},{"city":"Mumbai"}], col="city", value="Delhi"', output: "1" }], "import pandas as pd\n\ndef filter_count(records, col, value):\n    pass\n",
      "import pandas as pd\n\ndef filter_count(records, col, value):\n    df = pd.DataFrame(records)\n    return int((df[col] == value).sum())\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "Delhi"], expected: 2 }, { args: [[{ city: "Delhi" }, { city: "Mumbai" }], "city", "Mumbai"], expected: 1 }, { args: [[{ x: 1 }, { x: 1 }, { x: 2 }], "x", 1], expected: 2 }],
      ["df[col] == value gives a True/False series.", ".sum() counts the Trues."], ["pandas"], "Medium") ]},
  { slug: "missing-data", order: 4, title: "Handling Missing Data", minutes: 12, content: PD4, problems: [
    P(1, "df-count-missing", "Count Missing Values", "count_missing",
      "Write a function `count_missing(records, col)` that returns how many values in `col` are missing (null/NaN). " + PDrec,
      [{ input: 'records=[{"a":1},{"a":null},{"a":3}], col="a"', output: "1" }], "import pandas as pd\n\ndef count_missing(records, col):\n    pass\n",
      "import pandas as pd\n\ndef count_missing(records, col):\n    return int(pd.DataFrame(records)[col].isnull().sum())\n",
      [{ args: [[{ a: 1 }, { a: null }, { a: 3 }], "a"], expected: 1 }, { args: [[{ a: 1 }, { a: 2 }], "a"], expected: 0 }, { args: [[{ a: null }, { a: 5 }], "a"], expected: 1 }],
      ["df[col].isnull() is True where a value is missing.", ".sum() gives the count."], ["pandas"], "Medium") ]},
  { slug: "groupby", order: 5, title: "GroupBy & Aggregation", minutes: 14, content: PD5, problems: [
    P(1, "df-group-max-sum", "Highest Group Total", "group_max_sum",
      "Write a function `group_max_sum(records, group_col, value_col)` that returns the largest total among all the group totals. " + PDrec,
      [{ input: 'group by city, sum sales', output: "200" }], "import pandas as pd\n\ndef group_max_sum(records, group_col, value_col):\n    pass\n",
      "import pandas as pd\n\ndef group_max_sum(records, group_col, value_col):\n    df = pd.DataFrame(records)\n    return int(df.groupby(group_col)[value_col].sum().max())\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "sales"], expected: 200 }, { args: [[{ c: "x", v: 10 }, { c: "y", v: 50 }], "c", "v"], expected: 50 }],
      ["df.groupby(group_col)[value_col].sum() gives the per-group total.", ".max() gives the largest."], ["pandas"], "Medium"),
    P(2, "df-top-group", "Top Group", "top_group",
      "Write a function `top_group(records, group_col, value_col)` that returns the name of the group whose total is the highest. " + PDrec,
      [{ input: 'group by city, sum sales', output: '"Mumbai"' }], "import pandas as pd\n\ndef top_group(records, group_col, value_col):\n    pass\n",
      "import pandas as pd\n\ndef top_group(records, group_col, value_col):\n    df = pd.DataFrame(records)\n    return df.groupby(group_col)[value_col].sum().idxmax()\n",
      [{ args: [[{ city: "Delhi", sales: 100 }, { city: "Mumbai", sales: 200 }, { city: "Delhi", sales: 50 }], "city", "sales"], expected: "Mumbai" }, { args: [[{ c: "x", v: 10 }, { c: "y", v: 5 }, { c: "x", v: 10 }], "c", "v"], expected: "x" }],
      ["After .sum(), .idxmax() gives the label of the largest one."], ["pandas"], "Hard") ]},
  { slug: "sorting-unique", order: 6, title: "Sorting, Unique & Cleaning", minutes: 12, content: PD6, problems: [
    P(1, "df-max-column", "Max of Column", "max_of_column",
      "Write a function `max_of_column(records, col)` that returns the largest value in `col`. " + PDrec,
      [{ input: 'records=[{"sales":100},{"sales":200}], col="sales"', output: "200" }], "import pandas as pd\n\ndef max_of_column(records, col):\n    pass\n",
      "import pandas as pd\n\ndef max_of_column(records, col):\n    return int(pd.DataFrame(records)[col].max())\n",
      [{ args: [[{ sales: 100 }, { sales: 200 }, { sales: 50 }], "sales"], expected: 200 }, { args: [[{ n: 3 }, { n: 9 }], "n"], expected: 9 }, { args: [[{ n: -1 }, { n: -5 }], "n"], expected: -1 }],
      ["df[col].max() gives the largest value."], ["pandas"], "Easy"),
    P(2, "df-unique-count", "Unique Count", "unique_count",
      "Write a function `unique_count(records, col)` that returns how many different (unique) values are in `col`. " + PDrec,
      [{ input: 'records=[{"c":"a"},{"c":"a"},{"c":"b"}], col="c"', output: "2" }], "import pandas as pd\n\ndef unique_count(records, col):\n    pass\n",
      "import pandas as pd\n\ndef unique_count(records, col):\n    return int(pd.DataFrame(records)[col].nunique())\n",
      [{ args: [[{ c: "a" }, { c: "a" }, { c: "b" }], "c"], expected: 2 }, { args: [[{ city: "Delhi", sales: 1 }, { city: "Mumbai", sales: 2 }, { city: "Delhi", sales: 3 }], "city"], expected: 2 }, { args: [[{ c: "x" }], "c"], expected: 1 }],
      ["df[col].nunique() gives the count of different values."], ["pandas"], "Easy"),
    P(3, "df-sorted-column", "Sorted Column", "sorted_column",
      "Write a function `sorted_column(records, col)` that sorts the values of `col` and returns them as a list. " + PDrec,
      [{ input: 'records=[{"n":3},{"n":1},{"n":2}], col="n"', output: "[1, 2, 3]" }], "import pandas as pd\n\ndef sorted_column(records, col):\n    pass\n",
      "import pandas as pd\n\ndef sorted_column(records, col):\n    return pd.DataFrame(records).sort_values(col)[col].tolist()\n",
      [{ args: [[{ n: 3 }, { n: 1 }, { n: 2 }], "n"], expected: [1, 2, 3] }, { args: [[{ n: 5 }, { n: 2 }], "n"], expected: [2, 5] }, { args: [[{ n: 1 }], "n"], expected: [1] }],
      ["df.sort_values(col) sorts the rows.", "[col].tolist() gives the list."], ["pandas"], "Medium") ]},
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
      "Write a function `accuracy(predicted, actual)` that returns the accuracy = (correct predictions / total), 2 decimals.",
      [{ input: "predicted=[1,0,1,1], actual=[1,0,0,1]", output: "0.75" }], "def accuracy(predicted, actual):\n    pass\n",
      "def accuracy(predicted, actual):\n    correct = sum(1 for p, a in zip(predicted, actual) if p == a)\n    return round(correct / len(actual), 2)\n",
      [{ args: [[1,0,1,1],[1,0,0,1]], expected: 0.75 }, { args: [[1,1],[1,1]], expected: 1 }, { args: [[0],[1]], expected: 0 }],
      ["Use zip to walk both lists together.", "correct / total, rounded to 2."], ["ml"], "Medium"),
    P(2, "mae", "Mean Absolute Error", "mae",
      "Write a function `mae(predicted, actual)` that returns the Mean Absolute Error = the average of |predicted - actual|, 2 decimals.",
      [{ input: "predicted=[3,5], actual=[2,5]", output: "0.5" }], "def mae(predicted, actual):\n    pass\n",
      "def mae(predicted, actual):\n    return round(sum(abs(p - a) for p, a in zip(predicted, actual)) / len(actual), 2)\n",
      [{ args: [[3,5],[2,5]], expected: 0.5 }, { args: [[10],[10]], expected: 0 }, { args: [[1,2,3],[4,2,0]], expected: 2 }],
      ["abs(p - a) is the error for each pair.", "Sum / total, rounded to 2."], ["ml"], "Medium"),
    P(3, "test-size", "Train-Test Split Size", "test_size",
      "Write a function `test_size(n, test_ratio)` that returns the size of the test set = int(n * test_ratio).",
      [{ input: "n=100, test_ratio=0.2", output: "20" }], "def test_size(n, test_ratio):\n    pass\n",
      "def test_size(n, test_ratio):\n    return int(n * test_ratio)\n",
      [{ args: [100, 0.2], expected: 20 }, { args: [50, 0.3], expected: 15 }, { args: [200, 0.25], expected: 50 }],
      ["n * test_ratio, then int() for a whole number."], ["ml"], "Easy") ], content: [
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
// Every extra problem used to be created with order 50, so nine problems on the
// strings lesson all sorted identically and their order on the page was whatever
// the database felt like. Counting up from 50 keeps them after a lesson's inline
// problems (which start at 1) and gives each a stable place.
let exOrder = 50;

const EX = (lessonSlug, diff, slug, title, fn, desc, examples, starter, solution, tests, hints, tags) =>
  ({ lessonSlug, ...P(exOrder++, slug, title, fn, desc, examples, starter, solution, tests, hints, tags, diff) });


export const extraProblems = [
  /* ---------- LOOPS ---------- */
  EX("loops", "Easy", "count-positives", "Count Positives", "count_positives",
    "Write a function `count_positives(nums)` that counts how many numbers in the list are greater than 0.",
    [{ input: "nums=[1,-2,3]", output: "2" }], "def count_positives(nums):\n    pass\n",
    "def count_positives(nums):\n    c = 0\n    for n in nums:\n        if n > 0:\n            c += 1\n    return c\n",
    [{ args: [[1,-2,3]], expected: 2 }, { args: [[-1,-5]], expected: 0 }, { args: [[5,5]], expected: 2 }],
    ["In the loop, if n > 0: increase the count."], ["loops"]),
  EX("loops", "Easy", "sum-digits", "Sum of Digits", "sum_digits",
    "Write a function `sum_digits(n)` that returns the sum of all the digits of the number.",
    [{ input: "n=123", output: "6" }], "def sum_digits(n):\n    pass\n",
    "def sum_digits(n):\n    return sum(int(d) for d in str(n))\n",
    [{ args: [123], expected: 6 }, { args: [0], expected: 0 }, { args: [45], expected: 9 }],
    ["str(n) lets you loop over each digit.", "int(d) turns it back into a number."], ["loops"]),
  EX("loops", "Medium", "is-prime", "Prime Number?", "is_prime",
    "Write a function `is_prime(n)` that returns `True` if n is prime (divides only by 1 and itself).",
    [{ input: "n=7", output: "True" }, { input: "n=4", output: "False" }], "def is_prime(n):\n    pass\n",
    "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n",
    [{ args: [7], expected: true }, { args: [4], expected: false }, { args: [2], expected: true }, { args: [1], expected: false }],
    ["Check from 2 up to sqrt(n).", "If anything divides it, it is not prime."], ["loops"]),
  EX("loops", "Medium", "fizzbuzz-value", "FizzBuzz Value", "fizzbuzz_value",
    'Write a function `fizzbuzz_value(n)`: if it divides by both 3 and 5 return `"FizzBuzz"`, if only by 3 return `"Fizz"`, if only by 5 return `"Buzz"`, otherwise the number as a string.',
    [{ input: "n=15", output: '"FizzBuzz"' }, { input: "n=7", output: '"7"' }], "def fizzbuzz_value(n):\n    pass\n",
    'def fizzbuzz_value(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)\n',
    [{ args: [15], expected: "FizzBuzz" }, { args: [3], expected: "Fizz" }, { args: [5], expected: "Buzz" }, { args: [7], expected: "7" }],
    ["Check 15 (both) first.", "str(n) turns the number into a string."], ["loops"]),
  EX("loops", "Hard", "nth-fibonacci", "Nth Fibonacci", "nth_fibonacci",
    "Write a function `nth_fibonacci(n)` that returns the 0-indexed nth Fibonacci number (0,1,1,2,3,5,8...).",
    [{ input: "n=6", output: "8" }, { input: "n=0", output: "0" }], "def nth_fibonacci(n):\n    pass\n",
    "def nth_fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n",
    [{ args: [0], expected: 0 }, { args: [1], expected: 1 }, { args: [6], expected: 8 }, { args: [10], expected: 55 }],
    ["Track it with two variables a,b.", "a,b = b, a+b"], ["loops"]),
  EX("loops", "Hard", "gcd", "Greatest Common Divisor", "gcd",
    "Write a function `gcd(a, b)` that returns the HCF (greatest common divisor) of `a` and `b`.",
    [{ input: "a=12, b=8", output: "4" }], "def gcd(a, b):\n    pass\n",
    "def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n",
    [{ args: [12, 8], expected: 4 }, { args: [17, 5], expected: 1 }, { args: [100, 10], expected: 10 }],
    ["Euclid's algorithm: a,b = b, a%b while b != 0."], ["loops"]),
  EX("loops", "Super Hard", "collatz-steps", "Collatz Steps", "collatz_steps",
    "Write a function `collatz_steps(n)` that counts how many steps it takes for n to reach 1. Rule: if even then /2, if odd then *3+1.",
    [{ input: "n=6", output: "8" }], "def collatz_steps(n):\n    pass\n",
    "def collatz_steps(n):\n    steps = 0\n    while n != 1:\n        n = n // 2 if n % 2 == 0 else 3 * n + 1\n        steps += 1\n    return steps\n",
    [{ args: [1], expected: 0 }, { args: [6], expected: 8 }, { args: [16], expected: 4 }],
    ["A while n != 1 loop.", "even: n//2, odd: 3n+1."], ["loops"]),
  EX("loops", "Super Hard", "count-primes-below", "Count Primes Below N", "count_primes_below",
    "Write a function `count_primes_below(n)` that counts how many prime numbers are smaller than n (not counting n itself).",
    [{ input: "n=10", output: "4" }], "def count_primes_below(n):\n    pass\n",
    "def count_primes_below(n):\n    def prime(x):\n        if x < 2:\n            return False\n        for i in range(2, int(x ** 0.5) + 1):\n            if x % i == 0:\n                return False\n        return True\n    return sum(1 for x in range(2, n) if prime(x))\n",
    [{ args: [10], expected: 4 }, { args: [2], expected: 0 }, { args: [20], expected: 8 }],
    ["Check each number for whether it is prime.", "Count inside range(2, n)."], ["loops"]),

  /* ---------- STRINGS ---------- */
  EX("strings", "Easy", "to-lower", "Lowercase", "to_lower",
    "Write a function `to_lower(s)` that returns the string in lowercase.",
    [{ input: 's="ABC"', output: '"abc"' }], "def to_lower(s):\n    pass\n", "def to_lower(s):\n    return s.lower()\n",
    [{ args: ["ABC"], expected: "abc" }, { args: ["Hello"], expected: "hello" }],
    ["Use the .lower() method."], ["strings"]),
  EX("strings", "Easy", "first-last", "First + Last Char", "first_last",
    "Write a function `first_last(s)` that joins the first and last character of the string and returns it.",
    [{ input: 's="hello"', output: '"ho"' }], "def first_last(s):\n    pass\n", "def first_last(s):\n    return s[0] + s[-1]\n",
    [{ args: ["hello"], expected: "ho" }, { args: ["ab"], expected: "ab" }, { args: ["x"], expected: "xx" }],
    ["s[0] is the first, s[-1] is the last."], ["strings"]),
  EX("strings", "Medium", "is-palindrome", "Palindrome?", "is_palindrome",
    "Write a function `is_palindrome(s)` that returns `True` if the string is the same when reversed.",
    [{ input: 's="level"', output: "True" }], "def is_palindrome(s):\n    pass\n", "def is_palindrome(s):\n    return s == s[::-1]\n",
    [{ args: ["level"], expected: true }, { args: ["hello"], expected: false }, { args: ["a"], expected: true }],
    ["s[::-1] gives the reversed string.", "Compare s == s[::-1]."], ["strings"]),
  EX("strings", "Medium", "count-words", "Count Words", "count_words",
    "Write a function `count_words(s)` that counts how many words are in the string.",
    [{ input: 's="hi there world"', output: "3" }], "def count_words(s):\n    pass\n", "def count_words(s):\n    return len(s.split())\n",
    [{ args: ["hi there world"], expected: 3 }, { args: ["one"], expected: 1 }, { args: [""], expected: 0 }],
    ["s.split() gives a list of the words.", "len() gives the count."], ["strings"]),
  EX("strings", "Medium", "remove-vowels", "Remove Vowels", "remove_vowels",
    "Write a function `remove_vowels(s)` that removes all the vowels (a,e,i,o,u) from the string.",
    [{ input: 's="hello"', output: '"hll"' }], "def remove_vowels(s):\n    pass\n",
    'def remove_vowels(s):\n    return "".join(c for c in s if c not in "aeiou")\n',
    [{ args: ["hello"], expected: "hll" }, { args: ["aeiou"], expected: "" }, { args: ["xyz"], expected: "xyz" }],
    ["Check each char for whether it is a vowel.", 'if c not in "aeiou".'], ["strings"]),
  EX("strings", "Hard", "is-anagram", "Anagram Check", "is_anagram",
    "Write a function `is_anagram(a, b)` that returns `True` if the two strings are anagrams of each other (same letters).",
    [{ input: 'a="listen", b="silent"', output: "True" }], "def is_anagram(a, b):\n    pass\n",
    "def is_anagram(a, b):\n    return sorted(a) == sorted(b)\n",
    [{ args: ["listen", "silent"], expected: true }, { args: ["abc", "abd"], expected: false }, { args: ["aab", "aba"], expected: true }],
    ["sorted(a) puts the letters in order.", "sorted(a) == sorted(b)."], ["strings"]),
  EX("strings", "Hard", "most-frequent-char", "Most Frequent Char", "most_frequent_char",
    "Write a function `most_frequent_char(s)` that returns the character that appears the most times in the string.",
    [{ input: 's="aabbbc"', output: '"b"' }], "from collections import Counter\n\ndef most_frequent_char(s):\n    pass\n",
    "from collections import Counter\n\ndef most_frequent_char(s):\n    return Counter(s).most_common(1)[0][0]\n",
    [{ args: ["aabbbc"], expected: "b" }, { args: ["abc"], expected: "a" }, { args: ["xxy"], expected: "x" }],
    ["Counter(s).most_common(1).", "Use [0][0] to pull out the char."], ["strings"]),
  EX("strings", "Super Hard", "caesar-cipher", "Caesar Cipher", "caesar_cipher",
    "Write a function `caesar_cipher(s, shift)` that moves each letter of a lowercase string `shift` places forward (after z it wraps back to a). Only lowercase letters.",
    [{ input: 's="abc", shift=1', output: '"bcd"' }, { input: 's="xyz", shift=3', output: '"abc"' }],
    "def caesar_cipher(s, shift):\n    pass\n",
    "def caesar_cipher(s, shift):\n    return ''.join(chr((ord(c) - 97 + shift) % 26 + 97) for c in s)\n",
    [{ args: ["abc", 1], expected: "bcd" }, { args: ["xyz", 3], expected: "abc" }, { args: ["hello", 0], expected: "hello" }],
    ["ord(c) gives a number, chr() gives the letter back.", "% 26 handles the wrap-around (after z comes a)."], ["strings"]),
  EX("strings", "Super Hard", "longest-word", "Longest Word", "longest_word",
    "Write a function `longest_word(s)` that returns the longest word in the sentence.",
    [{ input: 's="I love python"', output: '"python"' }], "def longest_word(s):\n    pass\n",
    "def longest_word(s):\n    return max(s.split(), key=len)\n",
    [{ args: ["I love python"], expected: "python" }, { args: ["a bb ccc"], expected: "ccc" }, { args: ["hi"], expected: "hi" }],
    ["s.split() gives a list of the words.", "max(words, key=len)."], ["strings"]),

  /* ---------- LISTS ---------- */
  EX("lists-tuples", "Easy", "list-average", "List Average", "list_average",
    "Write a function `list_average(nums)` that returns the average of the list.",
    [{ input: "nums=[2,4]", output: "3" }], "def list_average(nums):\n    pass\n", "def list_average(nums):\n    return sum(nums) / len(nums)\n",
    [{ args: [[2,4]], expected: 3 }, { args: [[1,2,3]], expected: 2 }, { args: [[10]], expected: 10 }],
    ["sum(nums) / len(nums)."], ["lists"]),
  EX("lists-tuples", "Medium", "second-largest", "Second Largest", "second_largest",
    "Write a function `second_largest(nums)` that returns the second largest (distinct) number.",
    [{ input: "nums=[1,5,3]", output: "3" }], "def second_largest(nums):\n    pass\n",
    "def second_largest(nums):\n    return sorted(set(nums))[-2]\n",
    [{ args: [[1,5,3]], expected: 3 }, { args: [[4,4,2]], expected: 2 }, { args: [[10,20,5]], expected: 10 }],
    ["Use set() to drop duplicates, then sorted().", "[-2] = the second largest."], ["lists"]),
  EX("lists-tuples", "Medium", "remove-duplicates", "Remove Duplicates", "remove_duplicates",
    "Write a function `remove_duplicates(lst)` that removes duplicates but keeps the order the same.",
    [{ input: "lst=[1,2,2,3,1]", output: "[1, 2, 3]" }], "def remove_duplicates(lst):\n    pass\n",
    "def remove_duplicates(lst):\n    return list(dict.fromkeys(lst))\n",
    [{ args: [[1,2,2,3,1]], expected: [1,2,3] }, { args: [[5,5]], expected: [5] }, { args: [[]], expected: [] }],
    ["dict.fromkeys(lst) keeps the order and removes duplicates.", "list() turns it back into a list."], ["lists"]),
  EX("lists-tuples", "Hard", "rotate-left", "Rotate Left", "rotate_left",
    "Write a function `rotate_left(lst, k)` that rotates the list left by k positions.",
    [{ input: "lst=[1,2,3,4], k=1", output: "[2, 3, 4, 1]" }], "def rotate_left(lst, k):\n    pass\n",
    "def rotate_left(lst, k):\n    if not lst:\n        return lst\n    k = k % len(lst)\n    return lst[k:] + lst[:k]\n",
    [{ args: [[1,2,3,4], 1], expected: [2,3,4,1] }, { args: [[1,2,3], 2], expected: [3,1,2] }, { args: [[1,2,3], 0], expected: [1,2,3] }],
    ["lst[k:] + lst[:k] does the rotation.", "Use k % len to handle a large k."], ["lists"]),
  EX("lists-tuples", "Hard", "two-sum", "Two Sum (Indices)", "two_sum",
    "Write a function `two_sum(nums, target)` that returns the **indices** [i, j] of the two numbers whose sum is target.",
    [{ input: "nums=[2,7,11], target=9", output: "[0, 1]" }], "def two_sum(nums, target):\n    pass\n",
    "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n",
    [{ args: [[2,7,11], 9], expected: [0,1] }, { args: [[3,2,4], 6], expected: [1,2] }, { args: [[1,2,3], 5], expected: [1,2] }],
    ["Keep checking in a dict whether 'target - n' has come up before.", "enumerate gives you the index."], ["lists"]),
  EX("lists-tuples", "Super Hard", "max-subarray-sum", "Max Subarray Sum", "max_subarray_sum",
    "Write a function `max_subarray_sum(nums)` that returns the maximum sum of a continuous subarray (Kadane's algorithm).",
    [{ input: "nums=[1,-2,3,4]", output: "7" }], "def max_subarray_sum(nums):\n    pass\n",
    "def max_subarray_sum(nums):\n    best = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best\n",
    [{ args: [[1,-2,3,4]], expected: 7 }, { args: [[-1,-2]], expected: -1 }, { args: [[5]], expected: 5 }],
    ["Kadane: cur = max(n, cur+n).", "Keep the largest in best."], ["lists"]),
  EX("lists-tuples", "Super Hard", "move-zeros", "Move Zeros to End", "move_zeros",
    "Write a function `move_zeros(nums)` that moves all the 0s to the end and keeps the order of the rest the same.",
    [{ input: "nums=[0,1,0,3]", output: "[1, 3, 0, 0]" }], "def move_zeros(nums):\n    pass\n",
    "def move_zeros(nums):\n    non_zero = [x for x in nums if x != 0]\n    zeros = [0] * nums.count(0)\n    return non_zero + zeros\n",
    [{ args: [[0,1,0,3]], expected: [1,3,0,0] }, { args: [[1,2]], expected: [1,2] }, { args: [[0,0,1]], expected: [1,0,0] }],
    ["First the non-zero elements, then add the zeros.", "nums.count(0) gives the count of zeros."], ["lists"]),

  /* ---------- FUNCTIONS ---------- */
  EX("functions", "Easy", "cube", "Cube a Number", "cube",
    "Write a function `cube(n)` that returns the cube of n (n * n * n).",
    [{ input: "n=3", output: "27" }], "def cube(n):\n    pass\n", "def cube(n):\n    return n ** 3\n",
    [{ args: [3], expected: 27 }, { args: [0], expected: 0 }, { args: [2], expected: 8 }],
    ["n ** 3 gives the cube."], ["functions"]),
  EX("functions", "Medium", "count-greater", "Count Greater Than", "count_greater",
    "Write a function `count_greater(nums, x)` that counts how many numbers are greater than x.",
    [{ input: "nums=[1,5,3,8], x=4", output: "2" }], "def count_greater(nums, x):\n    pass\n",
    "def count_greater(nums, x):\n    return sum(1 for n in nums if n > x)\n",
    [{ args: [[1,5,3,8], 4], expected: 2 }, { args: [[1,2], 5], expected: 0 }, { args: [[5,5], 4], expected: 2 }],
    ["In the loop, count n > x."], ["functions"]),
  EX("functions", "Hard", "sum-of-squares", "Sum of Squares", "sum_of_squares",
    "Write a function `sum_of_squares(n)` that returns 1^2 + 2^2 + ... + n^2.",
    [{ input: "n=3", output: "14" }], "def sum_of_squares(n):\n    pass\n",
    "def sum_of_squares(n):\n    return sum(i * i for i in range(1, n + 1))\n",
    [{ args: [3], expected: 14 }, { args: [1], expected: 1 }, { args: [4], expected: 30 }],
    ["In range(1, n+1), add the square of each i."], ["functions"]),
  EX("functions", "Super Hard", "is-perfect", "Perfect Number?", "is_perfect",
    "Write a function `is_perfect(n)` that returns `True` if n is perfect (the sum of its divisors, not counting itself, = n). For example 6 = 1+2+3.",
    [{ input: "n=6", output: "True" }], "def is_perfect(n):\n    pass\n",
    "def is_perfect(n):\n    return sum(i for i in range(1, n) if n % i == 0) == n\n",
    [{ args: [6], expected: true }, { args: [28], expected: true }, { args: [10], expected: false }],
    ["Sum the divisors from 1 to n-1.", "It is perfect when sum == n."], ["functions"]),

  /* ---------- DICTIONARIES ---------- */
  EX("dicts-sets", "Easy", "dict-size", "Dictionary Size", "dict_size",
    "Write a function `dict_size(d)` that returns how many keys are in the dict.",
    [{ input: 'd={"a":1,"b":2}', output: "2" }], "def dict_size(d):\n    pass\n", "def dict_size(d):\n    return len(d)\n",
    [{ args: [{ a: 1, b: 2 }], expected: 2 }, { args: [{}], expected: 0 }, { args: [{ x: 5 }], expected: 1 }],
    ["len(d) gives the count of keys."], ["dict"]),
  EX("dicts-sets", "Medium", "sum-values", "Sum of Values", "sum_values",
    "Write a function `sum_values(d)` that returns the sum of all the values in the dict.",
    [{ input: 'd={"a":1,"b":2,"c":3}', output: "6" }], "def sum_values(d):\n    pass\n", "def sum_values(d):\n    return sum(d.values())\n",
    [{ args: [{ a: 1, b: 2, c: 3 }], expected: 6 }, { args: [{ x: 10 }], expected: 10 }, { args: [{}], expected: 0 }],
    ["d.values() gives all the values.", "Add them up with sum()."], ["dict"]),
  EX("dicts-sets", "Hard", "max-value-key", "Key with Max Value", "max_value_key",
    "Write a function `max_value_key(d)` that returns the key whose value is the highest.",
    [{ input: 'd={"a":5,"b":9,"c":2}', output: '"b"' }], "def max_value_key(d):\n    pass\n",
    "def max_value_key(d):\n    return max(d, key=d.get)\n",
    [{ args: [{ a: 5, b: 9, c: 2 }], expected: "b" }, { args: [{ x: 1 }], expected: "x" }, { args: [{ p: 3, q: 7 }], expected: "q" }],
    ["max(d, key=d.get) gives the key with the largest value."], ["dict"]),

  /* ---------- CONDITIONALS ---------- */
  EX("conditionals", "Easy", "is-positive", "Positive Check", "is_positive",
    "Write a function `is_positive(n)` that returns `True` if n is greater than 0.",
    [{ input: "n=5", output: "True" }], "def is_positive(n):\n    pass\n", "def is_positive(n):\n    return n > 0\n",
    [{ args: [5], expected: true }, { args: [-1], expected: false }, { args: [0], expected: false }],
    ["return n > 0"], ["conditionals"]),
  EX("conditionals", "Medium", "leap-year", "Leap Year?", "is_leap_year",
    "Write a function `is_leap_year(year)` that returns `True` if it is a leap year (divides by 4, but not by 100 - unless by 400).",
    [{ input: "year=2024", output: "True" }, { input: "year=1900", output: "False" }], "def is_leap_year(year):\n    pass\n",
    "def is_leap_year(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)\n",
    [{ args: [2024], expected: true }, { args: [1900], expected: false }, { args: [2000], expected: true }, { args: [2023], expected: false }],
    ["Divides by 4 AND (not by 100 OR by 400).", "2000 is a leap year, 1900 is not."], ["conditionals"]),
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
    data: { name: "Jugendra Pratap", email: "jugendra@dataquest.dev", passwordHash: hashPassword("dataquest"), role: "Aspiring Data Analyst", xp: 2480 },
  });

  // Demo classmates so the leaderboard feels alive.
  await prisma.user.createMany({
    data: [
      { name: "Ananya Sharma", email: "ananya@dq.dev", passwordHash: hashPassword("demo1234"), xp: 3940 },
      { name: "Rohit Mehta", email: "rohit@dq.dev", passwordHash: hashPassword("demo1234"), xp: 3120 },
      { name: "Priya Kumar", email: "priya@dq.dev", passwordHash: hashPassword("demo1234"), xp: 2880 },
      { name: "Sameer Thakur", email: "sameer@dq.dev", passwordHash: hashPassword("demo1234"), xp: 2210 },
      { name: "Neha Verma", email: "neha@dq.dev", passwordHash: hashPassword("demo1234"), xp: 1450 },
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
          data: { slug: l.slug, order: l.order, title: l.title, minutes: l.minutes, level: l.level || "Beginner", contentJson: JSON.stringify(lessonContent(l)), trackId: track.id },
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
      { userId: user.id, topic: "Python", title: "Slicing reverse", body: "The trick for reversing a list.", code: "lst[::-1]" },
      { userId: user.id, topic: "Pandas", title: "GroupBy pattern", body: "Split → Apply → Combine.", code: "df.groupby('city')['sales'].sum()" },
      { userId: user.id, topic: "Statistics", title: "What a p-value is", body: "If p < 0.05 the result is significant — reject the null hypothesis.", code: "" },
    ],
  });

  const counts = { users: await prisma.user.count(), tracks: await prisma.track.count(), lessons: await prisma.lesson.count(), problems: await prisma.problem.count() };
  console.log("✅ Done:", counts);
}

/** End-of-lesson quizzes, keyed by lesson slug. Application-level MCQs (predict
 *  the output, spot the bug, apply to a new case) — so the answer can't be found
 *  by re-reading the lesson; it only clears if the concept actually clicked.
 *  Appended to a lesson's content by lessonContent(), so quizzes live in one
 *  place instead of scattered through every lesson array. */
export const QUIZZES = {
  "normal-distribution": [
    // Easy — did the core idea land?
    { level: "easy", q: "What does a z-score measure?", options: ["How many standard deviations a value is from the mean", "The average of the dataset", "The largest value in the dataset", "How many values there are"], correct: 0, why: "It rewrites a value as a distance from the centre, measured in standard deviations — which is what makes it unit-free and comparable across datasets." },
    { level: "easy", q: "A value lands exactly on the mean. What is its z-score?", options: ["1", "0", "-1", "It depends on the standard deviation"], correct: 1, why: "The numerator is value minus mean, which is zero, and zero divided by any standard deviation is still zero." },
    { level: "easy", q: "In a normal distribution, roughly what share of values lie within one standard deviation of the mean?", options: ["50%", "95%", "68%", "99.7%"], correct: 2, why: "68 within one, 95 within two, 99.7 within three. 95% is the two-standard-deviation band." },
    // Medium — apply it
    { level: "medium", q: "The mean is 75 and the standard deviation is 5. What is the z-score of 85?", options: ["1.0", "10.0", "0.5", "2.0"], correct: 3, why: "85 is 10 above the mean, and 10 divided by 5 is 2. So the value sits two standard deviations up." },
    { level: "medium", q: "Why do most machine-learning pipelines standardise features first?", options: ["So features on larger scales do not dominate purely because their numbers are bigger", "To make the data normally distributed", "To remove outliers from the dataset", "To reduce the number of columns"], correct: 0, why: "Distance-based and gradient-based models read a bigger number as a more important one. Standardising puts every feature in the same units so the model weighs them on evidence. Note it does not make skewed data normal — it only recentres and rescales it." },
    { level: "medium", q: "Physics: 78 with class mean 60 and std 6. Chemistry: 82 with class mean 80 and std 10. Which is the stronger result?", options: ["Chemistry, because 82 is higher", "Physics, because its z-score is 3.0 against 0.2", "They are equivalent", "There is not enough information"], correct: 1, why: "78 is three standard deviations above its class; 82 is a fifth of one above its own. The lower raw mark is by far the better performance." },
    { level: "medium", q: "Your data's mean is far above its median. Is the 68-95-99.7 rule safe to use?", options: ["Yes, the rule always holds", "Yes, provided the sample is large", "No — that gap signals skew, and the rule assumes a symmetric normal curve", "Only if you remove the mean first"], correct: 2, why: "Mean well above median is the classic signature of a right skew, as in income data. The rule is a property of the normal distribution, so applying it to skewed data produces confident nonsense. Percentiles are the right tool there." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "You use statistics.stdev on a list that is actually the whole population. What happens to the z-scores?", options: ["They come out too large", "They are unaffected", "The code raises an error", "They all come out slightly too small"], correct: 3, why: "stdev divides by n-1 instead of n, so it returns a larger standard deviation than pstdev. A bigger divisor pulls every z-score towards zero. Nothing crashes, which is what makes it a genuinely dangerous mistake." },
    { level: "hard", q: "Why should test data be standardised with the training set's mean and standard deviation rather than its own?", options: ["Using the test set's own statistics leaks information and inflates the reported score", "Because the test set is always smaller", "Because the test set is not normally distributed", "It makes no difference either way"], correct: 0, why: "At prediction time you only have what was learned during training. Scaling the test set with numbers derived from itself lets information about the held-out data reach the model, so the evaluation flatters it — and the model then behaves differently in production." },
    { level: "hard", q: "Why is the |z| > 3 rule unreliable for finding outliers in heavily skewed data?", options: ["Because z-scores cannot be negative", "Because the extreme values themselves inflate the mean and standard deviation that define the threshold", "Because three standard deviations is too strict a cut-off", "Because skewed data has no mean"], correct: 1, why: "The mean and standard deviation are not robust: a single enormous value drags both upwards, widening the very threshold meant to catch it. This is called masking. The median and IQR resist it, which is why they are the safer tools on messy data — and that is the next lesson." },
  ],
  "probability-basics": [
    // Easy — did the core idea land?
    { level: "easy", q: "What range must every probability fall in?", options: ["0 to 1", "1 to 100", "-1 to 1", "Any number"], correct: 0, why: "Zero means it cannot happen and one means it must. A value above 1 is a bug, almost always a double-count." },
    { level: "easy", q: "How do you compute a probability when every outcome is equally likely?", options: ["Total outcomes divided by favourable ones", "Favourable outcomes divided by total outcomes", "Favourable minus total", "Favourable times total"], correct: 1, why: "Probability is counting: how many outcomes say yes, out of how many there are." },
    { level: "easy", q: "The chance of rain is 0.3. What is the chance of no rain?", options: ["0.3", "1.3", "0.7", "0"], correct: 2, why: "An event and its complement must add to 1." },
    // Medium — apply it
    { level: "medium", q: "Two dice. How many of the 36 outcomes total 7?", options: ["1", "3", "6", "7"], correct: 2, why: "Six ways, which is why 7 is the most common total. A total of 2 has only one way, and that is the whole point of counting outcomes rather than totals." },
    { level: "medium", q: "What is the probability of three heads in three flips?", options: ["0.5", "0.125", "1.5", "0.375"], correct: 1, why: "Independent events multiply: 0.5 to the power of 3." },
    { level: "medium", q: "You have flipped four heads in a row. What is the chance of tails next?", options: ["Higher than 0.5, because tails is due", "0.5", "Lower than 0.5", "It depends on the coin's history"], correct: 1, why: "A coin has no memory. Each flip is independent and stays at 0.5 however lopsided the run has been." },
    { level: "medium", q: "Why is \"at least one head in 3 flips\" easier via the complement?", options: ["The complement is a single case - no heads at all", "Complements are always faster", "Because 3 is an odd number", "It is not easier"], correct: 0, why: "The event itself is three separate cases; its complement is one. Work that out and subtract from 1." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "Two dice. How many outcomes have at least one six?", options: ["12", "6", "11", "36"], correct: 2, why: "Six in the row plus six in the column, minus the double six that sits in both. Counting it twice is the commonest error in this topic." },
    { level: "hard", q: "Why is P(king or heart) not 4/52 + 13/52?", options: ["Hearts are not a valid event", "The king of hearts is in both groups and gets counted twice", "Cards are not equally likely", "You should multiply instead"], correct: 1, why: "The general rule is P(A) + P(B) - P(A and B). Plain addition is the special case, valid only when the events cannot both happen." },
    { level: "hard", q: "You draw two cards without replacement. Is P(two kings) equal to (4/52) squared?", options: ["Yes, the draws are independent", "No - the first draw changes the deck, so it is (4/52) x (3/51)", "Yes, if you shuffle between draws", "No, you should add them"], correct: 1, why: "Multiplying requires independence. Removing a card changes both the favourable count and the total, so the second probability is different." },
  ],
  "spread": [
    // Easy — did the core idea land?
    { level: "easy", q: "What does the standard deviation measure?", options: ["How far a typical value is from the mean", "The middle value", "The largest value", "How many values there are"], correct: 0, why: "It is the second number an average should always travel with - the centre alone describes two very different datasets identically." },
    { level: "easy", q: "How do you get the standard deviation from the variance?", options: ["Square it", "Take its square root", "Divide it by the mean", "Multiply by the count"], correct: 1, why: "The square root also puts the answer back into the data's own units." },
    { level: "easy", q: "Every value in a list is exactly 7. What is the variance?", options: ["7", "1", "0", "49"], correct: 2, why: "No value is any distance from the mean, so every squared distance is zero." },
    // Medium — apply it
    { level: "medium", q: "Why are the distances from the mean squared before averaging?", options: ["To make the numbers larger", "To convert them to integers", "Because Python cannot add negatives", "Because unsquared they always sum to exactly zero"], correct: 3, why: "Positives and negatives around the mean cancel by definition. Squaring removes the sign, and makes distant values count much more." },
    { level: "medium", q: "Two classes both average 50. One has a standard deviation of 1, the other 30. What does that tell you?", options: ["The first class is better", "They are the same class described twice", "The first is tightly grouped, the second is scattered", "The second has more students"], correct: 2, why: "Same centre, completely different shape. This is exactly why a mean should not be reported alone." },
    { level: "medium", q: "Your data is a sample of 100 customers, not every customer. Which do you use?", options: ["pstdev, dividing by n", "stdev, dividing by n - 1", "Either, they are identical", "Neither, use the range"], correct: 1, why: "A sample under-estimates the spread of the group it came from, and dividing by n - 1 corrects for that. The smaller the sample, the more it matters." },
    { level: "medium", q: "Heights are in centimetres. What unit is the variance in?", options: ["Square centimetres", "Centimetres", "No units", "Metres"], correct: 0, why: "Squaring the distances squares the units, which is why the variance is not a number to report to a human." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A function averages the distances from the mean without squaring them. What does it return?", options: ["The standard deviation", "The range", "An error", "0.0 for every dataset"], correct: 3, why: "It fails identically on all input rather than on unusual input - and returns a plausible-looking 0.0 while doing it. A statistic that is the same for every dataset is measuring nothing." },
    { level: "hard", q: "Which threshold is normally used to flag an outlier?", options: ["More than 3 variances from the mean", "More than 3 standard deviations from the mean", "More than the range", "More than twice the median"], correct: 1, why: "Standard deviations, because they are in the data's own units. Three variances is a unit mismatch and lands nowhere near the intended threshold." },
    { level: "hard", q: "Two datasets share the same mean AND the same standard deviation. Are they the same shape?", options: ["No - they fix the centre and the spread, and nothing else", "Yes, those two numbers fix the shape", "Only if both are sorted", "Only if they have the same count"], correct: 0, why: "A symmetric bell and a heavily skewed distribution can agree on both. It is why plotting the data is not optional - see Anscombe's quartet." },
  ],
  "descriptive-stats": [
    // Easy — did the core idea land?
    { level: "easy", q: "What is the mean of 2, 4 and 6?", options: ["4", "6", "12", "3"], correct: 0, why: "Add them to get 12, divide by the three values." },
    { level: "easy", q: "What must you do before taking the median?", options: ["Add the values up", "Sort them", "Remove the largest", "Count how many are even"], correct: 1, why: "The median is defined by order. Taking the middle position of an unsorted list gives whatever happened to be sitting there." },
    { level: "easy", q: "Which measure works on categories like A, B and C?", options: ["Mean", "Range", "Mode", "Median"], correct: 2, why: "You cannot average a letter, but you can count which appears most often." },
    // Medium — apply it
    { level: "medium", q: "Salaries are 30k, 32k, 35k, 31k and 20 lakh. Which summary describes the group better?", options: ["The mean, because it uses every value", "The median, because one extreme value drags the mean somewhere nobody is", "Both are equally good", "The range"], correct: 1, why: "The mean here is over 4 lakh and not one person earns close to it. The median, 32k, describes four of the five accurately." },
    { level: "medium", q: "What is the median of 4, 6, 8 and 10?", options: ["6", "8", "7", "9"], correct: 2, why: "An even count has no single middle, so it is the average of the middle two: (6 + 8) / 2." },
    { level: "medium", q: "<code>sum(nums) // len(nums)</code> is used for the mean. What goes wrong?", options: ["It raises an error", "Floor division drops the decimal, so 7.2 is reported as 7", "It sorts the list first", "Nothing, it is the same"], correct: 1, why: "The number still looks reasonable, which is what makes it dangerous on marks or money." },
    { level: "medium", q: "What is the range of 45, 78, 91 and 40?", options: ["51", "46", "91", "13"], correct: 0, why: "Largest minus smallest: 91 - 40." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A median function takes <code>nums[len(nums) // 2]</code> without sorting. Why does the bug survive so long?", options: ["It raises an error only on large lists", "It is right by accident whenever the data happens to be in order", "Python caches the result", "It only fails on even-length lists"], correct: 1, why: "It passes on [1, 2, 3] and on any data that arrives roughly sorted, so tests go green for months before a shuffled list exposes it." },
    { level: "hard", q: "<code>statistics.mode([1, 1, 2, 2])</code> — what is the problem?", options: ["It is always 1", "It raises TypeError", "Two values tie, and you are not told about it", "Mode does not work on numbers"], correct: 2, why: "Older Python raised StatisticsError and newer versions return the first. Either way the tie is invisible - Counter.most_common() shows you every count." },
    { level: "hard", q: "Why is the range considered a weak measure of spread?", options: ["It is slow to compute", "It only works on sorted data", "It cannot handle negative numbers", "It uses only the two most extreme values and ignores everything between them"], correct: 3, why: "Two datasets with the same range can be shaped completely differently, and a single unusual value moves it entirely. Variance uses every value instead." },
  ],
  "project-git": [
    // Easy — did the core idea land?
    { level: "easy", q: "What is <code>__name__</code> when a file is run directly?", options: ["the file name", "__main__", "None", "the folder name"], correct: 1, why: "When the same file is imported instead, __name__ is the module's own name. The guard uses exactly that difference." },
    { level: "easy", q: "Which command saves your staged changes to local history?", options: ["git push", "git add", "git commit", "git status"], correct: 2, why: "add stages, commit saves with a message, push sends it to GitHub. Three different places, three different commands." },
    { level: "easy", q: "What belongs in <code>.gitignore</code>?", options: ["Your source files", "The README", "Generated files, venv/ and .env", "Everything in the project"], correct: 2, why: "A repository should hold what you wrote, not what your machine produced - and above all not your secrets." },
    // Medium — apply it
    { level: "medium", q: "A file has no <code>__main__</code> guard and loads a database at the top level. What happens when a test imports one function from it?", options: ["Only that function is loaded", "The whole file runs, including the database load", "Python raises ImportError", "The import is ignored"], correct: 1, why: "Importing a module executes everything at its top level. That is why the guard exists, and why a test suite can mysteriously start hitting production." },
    { level: "medium", q: "Which is the better commit message?", options: ["update", "Fix date parsing for vendor exports", "changes", "final version"], correct: 1, why: "A message is read in a list months later. It should say what changed and why - forty commits called update leave you with no history worth reading." },
    { level: "medium", q: "You accidentally committed and pushed a password, then deleted the line in a later commit. Is the password safe?", options: ["Yes, the deletion removes it", "Yes, if the repo is private", "No - it stays in the history permanently and must be rotated", "Only if you also push again"], correct: 2, why: "Git saves history, not just the current state. Public repositories are scanned for keys within minutes of a push, so the only real fix is changing the secret." },
    { level: "medium", q: "<code>cfg = DEFAULTS</code> inside a function that then calls <code>cfg.update(extra)</code>. What is the effect?", options: ["A copy is modified, defaults are safe", "The shared defaults themselves are changed for the whole program", "It raises TypeError", "Nothing, update returns a new dict"], correct: 1, why: "It is a second name for one dictionary, not a copy. One caller's overrides silently become everyone's defaults for the rest of the run." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "Why is mutable module-level state a problem across a multi-file project?", options: ["It uses more memory", "Python forbids it", "Every importer shares the same object, so one mutation changes behaviour everywhere with no error", "It cannot be imported twice"], correct: 2, why: "It also makes tests order-dependent, since one test can leave the state altered for the next. Treat module-level values as read-only and copy before modifying." },
    { level: "hard", q: "What does <code>git add .</code> risk that naming a file does not?", options: ["It is slower", "It sweeps in whatever is in the folder - venv, caches, .env", "It skips new files", "It commits immediately"], correct: 1, why: "Staging everything present is how secrets and hundred-megabyte virtual environments end up in history. A .gitignore written before the first commit is the real protection." },
    { level: "hard", q: "A module is imported twice in the same program. How many times does its top-level code run?", options: ["Once - the module is cached in sys.modules", "Twice, once per import", "Once per function that imports it", "It raises an error on the second import"], correct: 0, why: "Python caches modules on first import, which is why an expensive top-level load is paid once - and why a module that mutates its own state keeps that mutation for the rest of the run." },
  ],
  "clean-code": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which name follows PEP 8 for a function?", options: ["NetTotal", "NET_TOTAL", "net_total", "nettotal"], correct: 2, why: "Functions and variables use lower_case_with_underscores. CapWords is for classes and UPPER_CASE for constants." },
    { level: "easy", q: "Where must a docstring go?", options: ["In a comment above the def", "As the first string inside the function", "At the end of the function", "In a separate file"], correct: 1, why: "That position is what makes it reachable by help(), editors and documentation tools. A comment above the def reaches none of them." },
    { level: "easy", q: "How many spaces does PEP 8 use for one indent level?", options: ["2", "8", "A tab", "4"], correct: 3, why: "Four spaces. What matters most is consistency, and four is the convention everyone else is already using." },
    // Medium — apply it
    { level: "medium", q: "Do type hints change how the code runs?", options: ["No - they are for readers, editors and type checkers", "Yes, they enforce the types", "Yes, they make it faster", "Only inside classes"], correct: 0, why: "Python ignores them at runtime. That is also why a stale hint is worse than none: it is a confident claim that is no longer true." },
    { level: "medium", q: "What should a comment explain?", options: ["What the line does", "Why the line is there", "Who wrote it", "When it was written"], correct: 1, why: "The code already states what it does, and states it more reliably. The reason behind a decision exists nowhere else in the file." },
    { level: "medium", q: "Why replace <code>if total > 5000</code> with a named constant?", options: ["It runs faster", "It is required by Python", "Nobody can tell whether 5000 is a business rule or a guess, and it has to be found everywhere when it changes", "Constants use less memory"], correct: 2, why: "A magic number carries no meaning and no single place to change it. A name gives it both." },
    { level: "medium", q: "A function is called <code>process</code>. What does that usually signal?", options: ["It is well named", "It is a built-in", "It is too short", "It does several unrelated things, so it could not be named after any of them"], correct: 3, why: "A function that does one thing can be named accurately. Vague names are usually a symptom of doing too much, and such a function cannot be tested in pieces either." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>def add(item, basket=[])</code> is called twice with one item each. What does the second call return?", options: ["A list with one item", "A list with both items", "An empty list", "TypeError"], correct: 1, why: "The default is evaluated once when the def runs, so every call sharing it appends to the same list. It is invisible with a single call and never raises." },
    { level: "hard", q: "What is the correct way to give a function a mutable default?", options: ["def f(items=[])", "def f(items=list())", "def f(items=None), then build the list inside", "You cannot have one at all"], correct: 2, why: "Defaulting to None and creating the real value inside the body means a fresh object per call. The same applies to dicts and sets." },
    { level: "hard", q: "Why is a type hint that has drifted out of date worse than no hint at all?", options: ["It is a confident statement that happens to be false, and readers trust it", "It slows the function down", "It stops the function from running", "Python raises a warning"], correct: 0, why: "Nothing enforces it, so nothing corrects it. A reader who believes it is misled by a line that looks authoritative - which is why a type checker is what keeps hints honest at scale." },
  ],
  "debugging-logging": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which is the least severe logging level?", options: ["INFO", "DEBUG", "WARNING", "CRITICAL"], correct: 1, why: "DEBUG is the most detailed and the first to be hidden when you raise the level." },
    { level: "easy", q: "The level is set to WARNING. Which of these appears?", options: ["A debug message", "An info message", "An error message", "Nothing at all"], correct: 2, why: "Setting a level shows that level and everything above it, so ERROR and CRITICAL still come through while DEBUG and INFO are hidden." },
    { level: "easy", q: "What can logging do that <code>print</code> cannot?", options: ["Be turned down or off without changing the code", "Show text on screen", "Run inside a function", "Handle numbers"], correct: 0, why: "Print has one volume: on. The level is the whole reason logging exists." },
    // Medium — apply it
    { level: "medium", q: "Where is the most valuable place to put a log line in a data script?", options: ["At the very top of the file", "After every single line", "Only at the end", "Inside except, recording what was skipped and why"], correct: 3, why: "A silently discarded row is the most common data incident there is. One warning inside except turns it into something you can find later." },
    { level: "medium", q: "Why write <code>logging.debug(\"row %s\", row)</code> rather than an f-string?", options: ["The formatting is skipped entirely if the message will not be shown", "f-strings do not work with logging", "It is required by PEP 8", "It makes the message shorter"], correct: 0, why: "With an f-string the text is built on every call even when the level throws it away. Inside a loop over a million rows that is a million wasted operations." },
    { level: "medium", q: "You call <code>logging.info(...)</code> and then <code>logging.basicConfig(level=logging.DEBUG)</code>. What happens?", options: ["The level changes to DEBUG", "It raises an error", "The configuration is ignored, because logging is already configured", "Both lines are ignored"], correct: 2, why: "basicConfig only acts when no handler exists, and that first info call installs one. Configure before you log, or pass force=True." },
    { level: "medium", q: "Which line of a traceback tells you what actually went wrong?", options: ["The first line", "The middle frame", "The last line", "The file path at the top"], correct: 2, why: "A traceback is printed in call order. The final line names the exception, and the frame just above it is where it was raised." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "The level is ERROR and a warning is logged inside an except. The run reports 'kept 2 rows' and nothing else. What went wrong?", options: ["The except block never ran", "The warning was created and then discarded, because it is below the level", "logging is broken without a file handler", "The rows were never read"], correct: 1, why: "The code was doing its job; the dial was set to hide it. The output looks like a clean success, which is exactly what makes it dangerous." },
    { level: "hard", q: "What does <code>logging.exception</code> add over <code>logging.error</code>?", options: ["It exits the program", "It retries the operation", "It raises the exception again", "It records the traceback as well, so the failing line is preserved"], correct: 3, why: "It is only meaningful inside an except block. Without it you have logged that something failed and destroyed the evidence of what." },
    { level: "hard", q: "A wrong number comes out of a 200-line script. What is the fastest way to locate the fault?", options: ["Check the value at the midpoint and halve the search each time", "Read the file from the top", "Add a print to every line", "Rewrite the script"], correct: 0, why: "Ten halvings locate a bad line among a thousand. Reading from the top is the slowest available method and the one most people try first." },
  ],
  "testing": [
    // Easy — did the core idea land?
    { level: "easy", q: "What happens when an <code>assert</code> condition is true?", options: ["It prints OK", "Nothing - execution continues silently", "It returns True", "It stops the program"], correct: 1, why: "An assert is silent on success and loud on failure. That is what makes a file full of them readable." },
    { level: "easy", q: "Which exception does a failed <code>assert</code> raise?", options: ["ValueError", "TestError", "AssertionError", "RuntimeError"], correct: 2, why: "The name is the message: an assertion about your code did not hold." },
    { level: "easy", q: "Do you need to install anything to use <code>unittest</code>?", options: ["Yes, with pip", "No - it ships with Python", "Only on Windows", "Yes, it needs pytest first"], correct: 1, why: "It is part of the standard library, which is why it is the safest thing to reach for in a course or on a machine you do not control." },
    // Medium — apply it
    { level: "medium", q: "A test method is named <code>check_addition</code> instead of <code>test_addition</code>. What happens?", options: ["It runs normally", "The runner never collects it, and the suite still reports success", "unittest raises an error at import", "It runs but the result is ignored"], correct: 1, why: "Only methods starting with test_ are collected. A suite that silently skips half its tests still comes back green." },
    { level: "medium", q: "You have one test: <code>assert average([2, 4, 6]) == 4.0</code>. Which bug can it NOT catch?", options: ["A wrong operator in the sum", "Dividing by the wrong number", "Crashing on an empty list", "Returning a string"], correct: 2, why: "The empty list is never passed in, so nothing exercises that path. Boundaries are where the bugs are, and that test only visits the middle." },
    { level: "medium", q: "Which of these is the strongest assertion about a cleaning function?", options: ["assert clean(row) is not None", "assert clean(row)", "assert len(clean(row)) >= 0", "assert clean(\"  A1 \") == \"a1\""], correct: 3, why: "The first three pass for almost any return value, including a wrong one. Only the last states what the answer should actually be." },
    { level: "medium", q: "Which case is most worth adding to a test suite?", options: ["Another ordinary input similar to the first", "The empty input", "The same input twice", "A very long comment explaining the function"], correct: 1, why: "The boundaries earn their keep. The happy path is the case you already had in mind while writing the code." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "What does running Python with the <code>-O</code> flag do to <code>assert</code> statements?", options: ["Makes them run faster", "Turns failures into warnings", "Removes them from the running program entirely", "Nothing at all"], correct: 2, why: "Asserts are stripped under -O. Fine for tests, which never run that way, and dangerous if you were relying on them to validate real input - use an explicit check and raise." },
    { level: "hard", q: "Why should you watch a new test fail before making it pass?", options: ["It is required by unittest", "To measure how slow it is", "Because a test that cannot fail proves nothing, and there are many ways to write one by accident", "To generate a coverage report"], correct: 2, why: "An assertion that is too loose, a method the runner never collects, or a report printing the total instead of the count all look green. Seeing red once is the cheapest proof that the test is connected to the code." },
    { level: "hard", q: "Your entire test suite passes. What has that proved?", options: ["The code is correct", "The code is correct for the cases that were written", "There are no bugs left", "The code is faster than before"], correct: 1, why: "A suite is a claim with a known scope. It is why a bug found in production is worth turning into a test - it records a case nobody had imagined." },
  ],
  "getting-started": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which line prints the word <b>Hello</b> on screen?", options: ["print(\"Hello\")", "print(Hello)", "Print(\"Hello\")", "say(\"Hello\")"], correct: 0, why: "Text needs quotes, and the instruction is lowercase <code>print</code>. Without quotes Python looks for something you stored called <code>Hello</code>." },
    { level: "easy", q: "In what order does Python run the lines of your file?", options: ["Top to bottom, one at a time", "All at once", "Bottom to top", "Whatever order is fastest"], correct: 0, why: "Top to bottom, finishing each line before starting the next. Most beginner bugs come from forgetting this." },
    { level: "easy", q: "What does Python do with a line starting with <code>#</code>?", options: ["Prints it", "Treats it as an error", "Runs it twice", "Ignores it completely"], correct: 3, why: "It is a comment — a note for humans. Python skips it entirely." },
    // Medium — apply it
    { level: "medium", q: "<code>marks = 90</code> is the whole program. What appears on screen?", options: ["90", "marks = 90", "Nothing", "An error"], correct: 2, why: "Storing is <b>silent</b>. Without a <code>print()</code>, a working program can look like it did nothing at all." },
    { level: "medium", q: "<code>print(\"Total:\", 90)</code> — what exactly is printed?", options: ["Total:90", "Total: 90", "\"Total:\" 90", "Total:, 90"], correct: 1, why: "A comma inside <code>print()</code> prints each piece with a <b>single space</b> between them." },
    { level: "medium", q: "<code>x = 5</code>, then <code>x = x + 3</code>, then <code>print(x)</code>. What prints?", options: ["5", "8", "53", "x + 3"], correct: 1, why: "The right side is worked out first (5 + 3), and 8 goes back under the same name." },
    { level: "medium", q: "A person types <code>7</code> at <code>age = input()</code>. What is in <code>age</code>?", options: ["the text \"7\"", "the number 7", "nothing", "an error"], correct: 0, why: "<code>input()</code> <b>always</b> hands back text, even when it looks like a number. This is the single most common beginner bug." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>print(\"Total:\", 90)</code> vs <code>print(\"Total:\" + 90)</code> — what happens with the second one?", options: ["Same output", "TypeError", "Total:90", "Total: 90"], correct: 1, why: "A comma prints things side by side whatever their type. A <code>+</code> means <i>join</i>, and you cannot join text to a number — <code>TypeError</code>. Same-looking line, completely different rule." },
    { level: "hard", q: "<code>x = print(\"hi\")</code>. What ends up inside <code>x</code>?", options: ["\"hi\"", "an error", "None", "an empty string"], correct: 2, why: "<code>print()</code> puts text on screen and <b>returns <code>None</code></b>. Showing something and handing something back are different actions — a distinction that catches people well past their first week." },
    { level: "hard", q: "A file has <code>print(total)</code> on line 1 and <code>total = 5</code> on line 2. What happens?", options: ["Prints 5", "Prints nothing", "Prints None", "NameError"], correct: 3, why: "Both lines are fine; the <b>order</b> is wrong. On line 1 nothing called <code>total</code> exists yet, so Python stops with <code>NameError</code>. You must store before you use." },
  ],
  "variables-data-types": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which line correctly stores the text <b>Priya</b> in a variable?", options: ["name = \"Priya\"", "name = Priya", "\"name\" = Priya", "Priya = name"], correct: 0, why: "Text must sit inside quotes, and the <b>name goes on the left</b> of <code>=</code>. Without quotes Python would look for a variable called <code>Priya</code>." },
    { level: "easy", q: "<code>print(type(21))</code> prints what?", options: ["<class 'int'>", "<class 'float'>", "21", "<class 'str'>"], correct: 0, why: "<code>21</code> is a whole number with no decimal point and no quotes, so its type is <code>int</code>." },
    { level: "easy", q: "Which of these is a <b>valid</b> variable name?", options: ["2nd_place", "my-score", "for", "_total"], correct: 3, why: "It must not start with a digit, cannot contain a hyphen, and cannot be a keyword like <code>for</code>. A leading underscore is allowed, so <code>_total</code> is fine." },
    // Medium — can you apply it to a new case?
    { level: "medium", q: "<code>x = 10</code>, then <code>x = \"ten\"</code>, then <code>print(type(x))</code> — what appears?", options: ["<class 'int'>", "TypeError", "<class 'str'>", "10"], correct: 2, why: "Python is <b>dynamically typed</b> — the type belongs to the value, not the name. <code>x</code> now points at a string, so <code>str</code>." },
    { level: "medium", q: "<code>age = input()</code> and the user types <code>5</code>. What does <code>age + 1</code> do?", options: ["6", "TypeError", "51", "'6'"], correct: 1, why: "<code>input()</code> always returns a <b>string</b>, so <code>age</code> is <code>\"5\"</code>. String + int raises <code>TypeError</code>. Convert it first with <code>int(age)</code>." },
    { level: "medium", q: "What is the output of <code>print(10 / 2)</code>?", options: ["5", "5.0", "\"5\"", "2.5"], correct: 1, why: "<code>/</code> <b>always</b> produces a float — <code>5.0</code>, not <code>5</code>. Use <code>//</code> when you want a whole number." },
    { level: "medium", q: "<code>a, b = 1, 2</code> then <code>a, b = b, a</code> then <code>print(a)</code> — what prints?", options: ["2", "1", "3", "SyntaxError"], correct: 0, why: "Python builds the whole right side <b>first</b> (<code>2, 1</code>) and then assigns, so the swap works without a temp variable. <code>a</code> is now 2." },
    // Hard — edge cases and bugs; the answers are not written in the lesson.
    { level: "hard", q: "<code>price = 100</code>, <code>total = price</code>, <code>price = 200</code>. What does <code>print(total)</code> show?", options: ["200", "100", "300", "None"], correct: 1, why: "<code>total = price</code> copied the <b>value that price pointed at</b>, not a live link to the name. Re-labelling <code>price</code> afterwards leaves <code>total</code> exactly where it was — 100." },
    { level: "hard", q: "<code>marks = input(\"Marks: \")</code> and the user types <code>50</code>. The next line is <code>if marks > 40:</code> — what happens?", options: ["The block runs", "The block is skipped", "TypeError", "It prints 50"], correct: 2, why: "<code>marks</code> is the string <code>\"50\"</code>, and Python refuses to compare a string with an int — <code>TypeError</code>. Note it is not a silent wrong answer, it is a crash; the fix is <code>int(input(...))</code>." },
    { level: "hard", q: "What does <code>print(bool(\"False\"))</code> show?", options: ["False", "TypeError", "None", "True"], correct: 3, why: "The <b>text</b> \"False\" is not the value <code>False</code>. For strings, <code>bool()</code> only asks one thing: is it empty? It has five characters, so it is <code>True</code>. Only <code>\"\"</code> would be False." },
  ],
  "operators": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>print(7 % 3)</code> — what appears?", options: ["1", "2", "3", "2.33"], correct: 0, why: "<code>%</code> gives the <b>remainder</b>, not the number of times it divides. 3 goes into 7 twice, using up 6, and <code>1</code> is what is left. The 2 is the answer to <code>7 // 3</code>." },
    { level: "easy", q: "Which operator divides and keeps only the whole part?", options: ["/", "%", "//", "**"], correct: 2, why: "<code>//</code> is floor division. <code>/</code> would give a float, <code>%</code> gives what is left over, and <code>**</code> is power." },
    { level: "easy", q: "<code>print(10 == 10)</code> prints what?", options: ["True", "False", "10", "SyntaxError"], correct: 0, why: "A comparison always produces <code>True</code> or <code>False</code>, and 10 does equal 10." },
    // Medium — apply it
    { level: "medium", q: "<code>print(2 + 3 * 2)</code> — what appears?", options: ["10", "8", "12", "7"], correct: 1, why: "Multiplication runs before addition, so it is <code>2 + 6</code>. Python is not reading left to right." },
    { level: "medium", q: "<code>print(10 / 2)</code> — what exactly appears?", options: ["5.0", "5", "5.5", "TypeError"], correct: 0, why: "In Python 3 <code>/</code> <b>always</b> returns a float, even when the division comes out exact. For <code>5</code> you would need <code>10 // 2</code>." },
    { level: "medium", q: "<code>print(0 and 5)</code> — what appears?", options: ["False", "0", "5", "True"], correct: 1, why: "<code>and</code> hands back an <b>operand</b>, not a boolean. <code>0</code> is falsy, so it settles the answer immediately and is returned as-is." },
    { level: "medium", q: "<code>name = \"\"</code>, then <code>print(name or \"default\")</code>. What appears?", options: ["an empty string", "True", "default", "TypeError"], correct: 2, why: "An empty string is falsy, so <code>or</code> moves on and returns the second operand. This is the standard way to supply a fallback value." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>print(-7 // 2)</code> — what appears?", options: ["-3", "-3.5", "-4", "3"], correct: 2, why: "Floor division rounds <b>down</b>, not toward zero. -7/2 is -3.5, and the value below that is <b>-4</b>. With positive numbers the two ideas agree, which is why this only ever catches you once." },
    { level: "hard", q: "<code>print(2 ** 3 ** 2)</code> — what appears?", options: ["512", "64", "36", "81"], correct: 0, why: "<code>**</code> is <b>right</b>-associative, unlike almost every other operator, so it groups as <code>2 ** (3 ** 2)</code> = <code>2 ** 9</code>. Reading left to right gives 64 — the wrong answer for a very reasonable reason." },
    { level: "hard", q: "What does Python do with <code>13 &lt; age &lt; 60</code>?", options: ["Compares 13 with age, then compares that True/False with 60", "Raises a SyntaxError, since it is not valid Python", "Checks only the first comparison and ignores the rest", "Expands it to 13 < age and age < 60, evaluating age once"], correct: 3, why: "It is a <b>chained comparison</b>. Python expands it and evaluates the middle term only once — which matters when that term is an expensive call. Most other languages do the first option and produce nonsense." },
  ],
  "conditionals": [
    // Easy
    { level: "easy", q: "When does the block under an <code>if</code> run?", options: ["Only when the condition is True", "Always", "Only when the condition is False", "Once per program"], correct: 0, why: "The condition answers True or False, and only True runs the block underneath." },
    { level: "easy", q: "What makes a block belong to an <code>if</code> in Python?", options: ["Indentation", "Curly braces", "A semicolon", "The word then"], correct: 0, why: "Python has no braces — the indentation <b>is</b> the syntax. Four spaces is the convention." },
    { level: "easy", q: "<code>marks = 30</code>. Which prints with <code>if marks >= 40: print(\"Pass\") else: print(\"Fail\")</code>?", options: ["Pass", "both", "nothing", "Fail"], correct: 3, why: "<code>30 >= 40</code> is False, so the <code>else</code> branch runs." },
    // Medium
    { level: "medium", q: "<code>x = 5</code>. <code>if x > 3:</code> prints A, <code>elif x > 4:</code> prints B. What appears?", options: ["B", "A and B", "A", "nothing"], correct: 2, why: "The <code>if</code> matched, so the <code>elif</code> is never checked — even though <code>5 > 4</code> is also true. Only <b>A</b>." },
    { level: "medium", q: "<code>if marks >= 40:</code> printing C, then a <b>separate</b> <code>if marks >= 75:</code> printing B. With marks = 82?", options: ["only B", "C and B both print", "only C", "SyntaxError"], correct: 1, why: "Separate <code>if</code>s are separate questions, both asked. 82 satisfies both, so both print — this is why mutually exclusive cases need one <code>elif</code> chain." },
    { level: "medium", q: "What does <code>if marks = 40:</code> do?", options: ["Sets marks to 40", "SyntaxError", "Compares marks with 40", "Always True"], correct: 1, why: "<code>=</code> assigns, <code>==</code> compares. Python refuses this outright rather than letting it silently assign inside a condition." },
    { level: "medium", q: "<code>status = \"Adult\" if age >= 18 else \"Minor\"</code> with <code>age = 15</code> gives?", options: ["Minor", "Adult", "True", "SyntaxError"], correct: 0, why: "In Python's ternary the condition sits in the middle. It is False, so the <code>else</code> value is chosen." },
    // Hard — not answerable by re-reading
    { level: "hard", q: "A discount chain checks <code>amount >= 1000</code> first and <code>amount >= 5000</code> second. What happens at amount = 6000?", options: ["Gets the 5000 tier", "Gets the 1000 tier", "Gets both", "Crashes"], correct: 1, why: "It stops at the first true branch, so the higher tier is unreachable for every amount. No error, just a permanently wrong answer — put the strictest condition first." },
    { level: "hard", q: "<code>items = []</code>. What does <code>if not items:</code> do?", options: ["Skips the block", "TypeError", "Runs the block", "Depends on the contents"], correct: 2, why: "An empty list is falsy, so <code>not items</code> is True and the block runs. That is why <code>if not items:</code> is the Pythonic empty check." },
    { level: "hard", q: "<code>count = 0</code>. Why can <code>if count:</code> be a bug where <code>if count is not None:</code> is not?", options: ["They are identical", "if count: raises an error", "is not None is slower", "0 is falsy, so a real value of zero is treated as missing"], correct: 3, why: "Truthiness collapses \"empty\" and \"zero\" into the same answer. If <b>0</b> is a legitimate value — zero sales, zero errors — the truthy shortcut silently skips it. Check against <code>None</code> when zero means something." },
  ],
  "loops": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>print(list(range(5)))</code> — what appears?", options: ["[0, 1, 2, 3, 4]", "[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4, 5]", "[1, 2, 3, 4]"], correct: 0, why: "<code>range</code> starts at 0 by default and stops <b>before</b> the number you give it, so you get five values ending at 4." },
    { level: "easy", q: "You have a list of names and want to greet each one. Which loop fits?", options: ["while", "for", "if", "break"], correct: 1, why: "You know exactly what you are looping over, so <code>for</code> is the natural choice. <code>while</code> is for when you only know the stopping condition." },
    { level: "easy", q: "What does <code>break</code> do inside a loop?", options: ["Skips the current pass and continues", "Restarts the loop from the beginning", "Ends the loop completely", "Pauses until the next input"], correct: 2, why: "<code>break</code> leaves the loop entirely. Skipping just one pass is <code>continue</code>." },
    // Medium — apply it
    { level: "medium", q: "<code>for n in [1, 2, 3, 4]:</code> then <code>if n == 2: continue</code>, then <code>print(n)</code>. What is printed?", options: ["1 2 3 4", "1 3 4", "1", "2"], correct: 1, why: "<code>continue</code> skips only the pass where <code>n</code> is 2. The loop carries on with 3 and 4." },
    { level: "medium", q: "<code>print(list(range(1, 10, 3)))</code> — what appears?", options: ["[1, 4, 7]", "[1, 3, 6, 9]", "[1, 4, 7, 10]", "[3, 6, 9]"], correct: 0, why: "Start at 1, step by 3, stop before 10: 1, 4, 7. The next would be 10, which is excluded." },
    { level: "medium", q: "A <code>while</code> loop's condition uses a variable that is never changed inside the loop. What happens?", options: ["It runs exactly once", "It never runs at all", "It runs forever", "Python raises a SyntaxError"], correct: 2, why: "Nothing moves the condition towards false, so it stays true and the program hangs. Every <code>while</code> needs something inside it that changes the outcome." },
    { level: "medium", q: "<code>total = 0</code> is written <b>inside</b> a loop that adds each of [5, 10, 15, 20]. What does it print at the end?", options: ["50", "20", "0", "5"], correct: 1, why: "The total is reset at the start of every pass, so only the last number survives. The accumulator has to be set up <b>before</b> the loop." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A <code>for</code> loop has an <code>else</code>. When does the <code>else</code> block run?", options: ["Always, once the loop ends", "Only if the loop finished without hitting break", "Only if the loop body never ran", "Only if break was used"], correct: 1, why: "It is really a \"nobreak\" clause. It runs when the loop completed normally, which is what makes it useful for handling the not-found case in a search." },
    { level: "hard", q: "You remove items from a list while looping over that same list. What happens?", options: ["Python raises an error immediately", "It works correctly", "Some items get silently skipped", "The loop never ends"], correct: 2, why: "The loop tracks position by index. Each removal shifts the rest back while the index moves forward, so items are stepped over. No error appears - just a quietly wrong answer." },
    { level: "hard", q: "<code>for i, c in enumerate(\"ab\"): print(i, c)</code> — what is printed?", options: ["a 0 then b 1", "0 then 1", "a then b", "0 a then 1 b"], correct: 3, why: "<code>enumerate</code> yields the index first and the item second, so each line is the position followed by the character." },
  ],
  "lists-tuples": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>fruits = [\"apple\", \"mango\", \"kiwi\"]</code>. What is <code>fruits[1]</code>?", options: ["apple", "mango", "kiwi", "IndexError"], correct: 1, why: "Indexing starts at 0, so index 1 is the <b>second</b> item." },
    { level: "easy", q: "Which of these reads the last item of a list of any length?", options: ["fruits[-1]", "fruits[last]", "fruits[len]", "fruits[0]"], correct: 0, why: "Negative indexes count from the back, and -1 is always the final item. No need to work out the length first." },
    { level: "easy", q: "Which one can be changed after it is created?", options: ["tuple", "list", "neither of them", "both of them"], correct: 1, why: "A list is mutable; a tuple is immutable. That single difference is the reason to pick one over the other." },
    // Medium — apply it
    { level: "medium", q: "<code>print([10, 20, 30, 40][1:3])</code> — what appears?", options: ["[20, 30]", "[10, 20, 30]", "[20, 30, 40]", "[10, 20]"], correct: 0, why: "Indexes 1 and 2. The stop value is excluded, exactly like range()." },
    { level: "medium", q: "<code>a = [1, 2, 3]</code>, then <code>b = a</code>, then <code>b.append(4)</code>. What does <code>print(a)</code> show?", options: ["[1, 2, 3]", "[1, 2, 3, 4]", "an error", "[4]"], correct: 1, why: "<code>b = a</code> is a second name for the same list, not a copy - so the append is visible through both names." },
    { level: "medium", q: "<code>a = [1, 2]</code>, then <code>a.append([3, 4])</code>. What is <code>a</code> now?", options: ["[1, 2, [3, 4]]", "[1, 2, 3, 4]", "an error", "[3, 4]"], correct: 0, why: "<code>append</code> adds its argument as a single item, so the whole list goes in as one nested item. <code>extend</code> is what flattens it." },
    { level: "medium", q: "You call <code>.append()</code> on a tuple. What happens?", options: ["It appends normally", "It returns a new tuple", "AttributeError", "The tuple becomes a list"], correct: 2, why: "A tuple has no <code>append</code> method at all, because it cannot be changed - so Python reports the missing attribute." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>print([1, 2, 3][::-1])</code> — what appears?", options: ["[1, 2, 3]", "[3, 2, 1]", "an error", "[1, 3]"], correct: 1, why: "A step of -1 walks the list backwards, which is the shortest way to reverse one. It also returns a new list, leaving the original as it was." },
    { level: "hard", q: "Why can a tuple be used as a dictionary key when a list cannot?", options: ["Tuples are faster to compare", "Tuples use less memory", "Keys must be hashable, and only an unchangeable value has a stable hash", "Lists are not ordered"], correct: 2, why: "A key's hash decides where it is stored. A list could change after being stored and would then be unfindable, so Python refuses it outright." },
    { level: "hard", q: "<code>a = [[1, 2], [3, 4]]</code> and <code>b = a[:]</code>. You then run <code>b[0].append(99)</code>. What is <code>a[0]</code>?", options: ["[1, 2]", "an error", "[]", "[1, 2, 99]"], correct: 3, why: "<code>a[:]</code> is a <b>shallow</b> copy - the outer list is new, but the inner lists are still the same objects. Copying all the way down needs <code>copy.deepcopy()</code>." },
  ],
  "dicts-sets": [
    // Easy
    { level: "easy", q: "How do you read the value stored under the key <code>\"age\"</code>?", options: ["student[\"age\"]", "student(\"age\")", "student.age()", "student->age"], correct: 0, why: "Square brackets with the key. A dictionary is looked up by name, not by position." },
    { level: "easy", q: "<code>set([1, 2, 2, 3, 3, 3])</code> holds how many items?", options: ["3", "6", "2", "1"], correct: 0, why: "A set keeps each item once, so the repeats are dropped: {1, 2, 3} — three items." },
    { level: "easy", q: "What does <code>s = {}</code> create?", options: ["An empty set", "An empty list", "An error", "An empty dictionary"], correct: 3, why: "Braces belonged to dictionaries first. An empty set has to be written <code>set()</code> — and getting this wrong fails later, at the first <code>.add()</code>, not here." },
    // Medium
    { level: "medium", q: "<code>d = {\"a\": 1}</code>. What does <code>print(d[\"b\"])</code> do?", options: ["Prints None", "Prints 0", "Raises KeyError", "Adds the key b"], correct: 2, why: "A missing key stops the program with <code>KeyError</code>. Use <code>d.get(\"b\")</code> when the key may not be there." },
    { level: "medium", q: "<code>d = {\"a\": 1}</code>, then <code>d[\"a\"] = 5</code>. What is in <code>d</code>?", options: ["{'a': 1, 'a': 5}", "{'a': 5}", "{'a': 1}", "TypeError"], correct: 1, why: "A key appears at most once, so assigning to it <b>replaces</b> the value. There is no way to get a second entry under the same key." },
    { level: "medium", q: "<code>d.get(\"missing\", 0)</code> returns what?", options: ["KeyError", "0", "None", "False"], correct: 1, why: "<code>.get()</code> hands back the default you pass, which is why <code>0</code> is so useful when you are counting." },
    { level: "medium", q: "Why does <code>d = {[\"a\"]: 1}</code> fail?", options: ["A list is mutable, so it cannot be hashed", "Lists are too long", "You need double quotes", "It does not fail"], correct: 0, why: "The slot a key lives in is computed from its hash. A mutable key could change and strand its own value — hence <code>TypeError: unhashable type</code>. A tuple works." },
    // Hard — the silent ones
    { level: "hard", q: "You loop over 5 orders doing <code>counts[city] = 1</code>. Every city shows 1. Why?", options: ["The loop runs once", "Each pass overwrites the key instead of adding to it", "Dictionaries cannot hold numbers", "It should raise KeyError"], correct: 1, why: "The loop runs all five times — and each time replaces the value with 1, wiping the previous count. The fix is <code>counts.get(city, 0) + 1</code>, which reads the old number first. This bug never crashes; it just reports the wrong number." },
    { level: "hard", q: "A list of 5 order IDs contains a genuine repeat. You do <code>ids = set(ids)</code> then sum them. What happened?", options: ["Nothing, the total is right", "It raises an error", "A real order was silently deleted from the total", "The sum doubles"], correct: 2, why: "Converting to a set removes duplicates, including the ones that were real data. If a customer genuinely ordered twice, that order is gone from the total — with no error to warn you. Deduplicate only when duplicates are actually unwanted." },
    { level: "hard", q: "Which is safe to rely on: the printed order of a dictionary, or of a set?", options: ["Both", "Neither", "The set only", "The dictionary only"], correct: 3, why: "Since Python 3.7 a dictionary preserves <b>insertion order</b> as a language guarantee. A set gives no order guarantee at all, so code that depends on how a set prints will work on your machine and fail somewhere else." },
  ],
  "functions": [
    // Easy
    { level: "easy", q: "Which keyword defines a function in Python?", options: ["def", "function", "fun", "define"], correct: 0, why: "<code>def name(parameters):</code> — the body is the indented block underneath." },
    { level: "easy", q: "What does <code>return</code> do?", options: ["Hands the value back to the caller", "Prints the value", "Ends the program", "Saves it to a file"], correct: 0, why: "It passes a value back to whoever called the function — and ends the function immediately." },
    { level: "easy", q: "<code>def f(a, b=2): return a + b</code>. What is <code>f(3)</code>?", options: ["3", "error", "32", "5"], correct: 3, why: "<code>b</code> falls back to its default of 2, so 3 + 2 = 5." },
    // Medium
    { level: "medium", q: "<code>def f(): print(\"hi\")</code>, then <code>x = f()</code>. What is in <code>x</code>?", options: ["\"hi\"", "an error", "None", "an empty string"], correct: 2, why: "It printed rather than returned, so the call evaluates to <code>None</code>. \"hi\" reached the screen and nothing reached <code>x</code>." },
    { level: "medium", q: "<code>def f(): x = 5</code>, then <code>print(x)</code> outside. What happens?", options: ["Prints 5", "NameError", "Prints None", "Prints 0"], correct: 1, why: "<code>x</code> lives only inside that call and is gone once it ends. To get a value out, return it." },
    { level: "medium", q: "Does code written after <code>return</code> run?", options: ["Yes", "No", "Only in loops", "Only if indented"], correct: 1, why: "<code>return</code> ends the function on the spot. Anything below it is dead code, and Python gives no warning." },
    { level: "medium", q: "<code>def rate(price, qty): return price * qty</code>. What does <code>rate(qty=3, price=20)</code> give?", options: ["60", "an error — wrong order", "23", "None"], correct: 0, why: "Naming the arguments makes their order irrelevant. Keyword arguments also make a call far easier to read than three bare numbers." },
    // Hard
    { level: "hard", q: "<code>def add(item, items=[]): items.append(item); return items</code>. You call it twice with 1 then 2. What does the second call return?", options: ["[2]", "[1, 2]", "[]", "an error"], correct: 1, why: "Python's most famous trap. The default list is created <b>once</b>, when the function is defined, so every call shares it — the first item is still in there. Use <code>items=None</code> and build the list inside the body." },
    { level: "hard", q: "A function prints its result. A loop does <code>total = total + f(x)</code>. What happens?", options: ["It works", "It prints twice", "TypeError, because the call gives None", "total stays 0"], correct: 2, why: "The screen shows correct numbers, which is what makes it confusing — but the call itself returns <code>None</code>, and <code>int + None</code> raises <code>TypeError</code>. The values were computed and never handed back." },
    { level: "hard", q: "<code>return min(x), max(x)</code> — what does the caller actually receive?", options: ["Two separate values", "Only the min", "An error", "One tuple, which can be unpacked"], correct: 3, why: "A function returns one object. The comma builds a tuple, and <code>low, high = stats(x)</code> unpacks it — which is why it feels like returning two things. Past two or three values, a dictionary reads better than positional unpacking." },
  ],
  "strings": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>print(\"Python\"[0])</code> — what appears?", options: ["P", "p", "y", "n"], correct: 0, why: "Indexing starts at 0, so index 0 is the very first character, capital P included." },
    { level: "easy", q: "What does <code>.strip()</code> remove?", options: ["Every space in the text", "The first character", "Whitespace at the start and end only", "All punctuation"], correct: 2, why: "It trims both ends. Spaces sitting between words are part of the text and are left alone." },
    { level: "easy", q: "<code>print(\"abc\"[::-1])</code> — what appears?", options: ["abc", "cba", "a", "an error"], correct: 1, why: "A step of -1 walks the string backwards, which is the shortest way to reverse one." },
    // Medium — apply it
    { level: "medium", q: "<code>name = \"  Freya  \"</code>, then <code>name.strip()</code> on its own line, then <code>print(name)</code>. What is printed?", options: ["Freya", "  Freya  ", "an error", "an empty string"], correct: 1, why: "Strings are immutable. <code>.strip()</code> returned a cleaned copy which was never stored, so <code>name</code> is untouched. No error is raised - the line simply did nothing." },
    { level: "medium", q: "<code>print(\"a,b,c\".split(\",\"))</code> — what appears?", options: ["['a', 'b', 'c']", "a,b,c", "['a,b,c']", "abc"], correct: 0, why: "<code>split</code> returns a <b>list</b> of the pieces between the separators." },
    { level: "medium", q: "How do you join <code>[\"a\", \"b\"]</code> into <code>a-b</code>?", options: ["[\"a\", \"b\"].join(\"-\")", "join([\"a\", \"b\"], \"-\")", "\"-\".split([\"a\", \"b\"])", "\"-\".join([\"a\", \"b\"])"], correct: 3, why: "<code>join</code> is called on the <b>separator</b>, with the list as its argument. It reads backwards at first and then never confuses you again." },
    { level: "medium", q: "<code>print(\"DATAMARG\"[::2])</code> — what appears?", options: ["DATA", "DTMR", "GRAM", "AAAG"], correct: 1, why: "A step of 2 takes every second character starting at index 0: D, T, M, R." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>s = \"Hi\"</code>. What is the difference between <code>s[5]</code> and <code>s[5:]</code>?", options: ["Both raise IndexError", "Both return an empty string", "s[5] raises IndexError, but s[5:] returns an empty string", "Both return Hi"], correct: 2, why: "Indexing past the end is an error; <b>slicing</b> past the end is not. It is the one place Python is more forgiving with slices than with indexes." },
    { level: "hard", q: "On the text <code>\"  a   b  \"</code>, how do <code>split(\" \")</code> and <code>split()</code> differ?", options: ["They give the same result", "split() is only faster", "split(\" \") produces empty strings for repeated spaces, split() ignores runs of whitespace", "split() only works on tabs"], correct: 2, why: "<code>split()</code> with no argument is a different rule, not a default: it treats any run of whitespace as one separator and drops the empty pieces. For messy real text it is nearly always the right call." },
    { level: "hard", q: "Why is <code>\"\".join(parts)</code> preferred over building a string with <code>+=</code> inside a loop?", options: ["+= changes the string in place, which is unsafe", "+= returns None", "+= raises an error on long strings", "Strings are immutable, so += copies the whole string every pass, while join allocates once"], correct: 3, why: "Each <code>+=</code> builds an entirely new string and copies everything over, which becomes quadratic work. <code>join</code> looks at all the pieces once and copies once." },
  ],
  "comprehensions": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>print([n * 2 for n in [1, 2, 3]])</code> — what appears?", options: ["[2, 4, 6]", "[1, 2, 3]", "[6]", "an error"], correct: 0, why: "Each item is doubled and the results are collected into a new list." },
    { level: "easy", q: "What does a list comprehension give you back?", options: ["Nothing, it works in place", "A new list", "The original list, modified", "A single number"], correct: 1, why: "It always builds a <b>new</b> list. The list you looped over is left exactly as it was." },
    { level: "easy", q: "Where does the <code>if</code> go when you want to filter items out?", options: ["Comprehensions cannot filter", "Before the for", "After the for", "Outside the brackets"], correct: 2, why: "A filtering <code>if</code> comes after the <code>for</code>. An item that fails it is never produced at all." },
    // Medium — apply it
    { level: "medium", q: "<code>print([x * x for x in [1, 2, 3, 4] if x % 2 == 0])</code> — what appears?", options: ["[1, 4, 9, 16]", "[4, 16]", "[2, 4]", "[1, 9]"], correct: 1, why: "The filter keeps 2 and 4, and only those two reach the expression, giving 4 and 16." },
    { level: "medium", q: "<code>print([\"even\" if n % 2 == 0 else \"odd\" for n in [1, 2]])</code> — what appears?", options: ["['odd', 'even']", "['even', 'odd']", "an error", "['odd']"], correct: 0, why: "1 is odd and 2 is even, in that order. This <code>if/else</code> chooses a value rather than removing anything, so both items survive." },
    { level: "medium", q: "<code>[x for x in nums if x > 0 else 0]</code> — what happens?", options: ["It works and replaces negatives with 0", "SyntaxError", "It returns an empty list", "It filters out the negatives"], correct: 1, why: "A filtering <code>if</code> has no <code>else</code> - there is nowhere for a rejected item to go. To substitute a value instead, the <code>if/else</code> must move before the <code>for</code>." },
    { level: "medium", q: "<code>print({w: len(w) for w in [\"ai\"]})</code> — what appears?", options: ["['ai']", "{'ai'}", "{'ai': 2}", "2"], correct: 2, why: "Curly brackets with a <code>key: value</code> expression build a dictionary, so the word maps to its length." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "You write <code>[print(x) for x in nums]</code> instead of a loop. What actually happens?", options: ["Nothing is printed", "It raises an error", "Each item prints twice", "Each item prints, and a throwaway list of None is built"], correct: 3, why: "<code>print</code> returns <code>None</code>, so the comprehension dutifully collects one <code>None</code> per item into a list nobody wanted. Use a plain loop for side effects." },
    { level: "hard", q: "What is the difference between <code>sum([x*x for x in xs])</code> and <code>sum(x*x for x in xs)</code>?", options: ["Without the brackets it is a generator, so the whole list is never held in memory", "They are identical in every way", "The generator version is always slower", "The bracketed version cannot be summed"], correct: 0, why: "A generator expression produces one value at a time, so memory stays flat however large the input. When the result is consumed once, drop the brackets." },
    { level: "hard", q: "In Python 3, what happens to the loop variable of a comprehension after it finishes?", options: ["It overwrites any outer variable of the same name", "It becomes a global variable", "Accessing it raises NameError inside the comprehension", "It stays inside the comprehension and does not leak out"], correct: 3, why: "A comprehension has its own scope in Python 3, so it cannot clobber an outer name. It did leak in Python 2, which is where the old warnings come from." },
  ],
  "oop": [
    // Easy — did the core idea land?
    { level: "easy", q: "What is the difference between a class and an object?", options: ["A class is the blueprint; an object is one thing built from it", "A class is one thing; an object is the blueprint", "They are two words for the same thing", "A class holds data; an object holds methods"], correct: 0, why: "One blueprint, many objects. Each object carries its own data while sharing the methods written once in the class." },
    { level: "easy", q: "Which method runs automatically the moment you create an object?", options: ["bark()", "__init__", "self", "class"], correct: 1, why: "<code>__init__</code> is the constructor. You never call it yourself - creating the object calls it for you." },
    { level: "easy", q: "What does <code>self</code> refer to inside a method?", options: ["The class itself", "A reserved keyword Python fills with None", "The object the method was called on", "A global variable"], correct: 2, why: "It is this particular object. Python passes it in automatically, which is why it is written as the first parameter but never supplied at the call." },
    // Medium — apply it
    { level: "medium", q: "Inside <code>__init__</code> you write <code>name = name</code> instead of <code>self.name = name</code>. What happens?", options: ["TypeError", "The value is not stored on the object, and nothing errors", "SyntaxError", "It works exactly the same"], correct: 1, why: "It creates a local variable that disappears when the method ends. The failure shows up much later as an AttributeError, far from the line that caused it." },
    { level: "medium", q: "<code>d.bark()</code> is shorthand for which of these?", options: ["Dog.bark(d)", "Dog.bark()", "bark(Dog)", "d.bark(d)"], correct: 0, why: "The dot passes the object in as the first argument. Seeing that is what makes <code>self</code> stop feeling like an arbitrary rule." },
    { level: "medium", q: "Two objects are built from the same class. Do they share their attribute values?", options: ["Yes, always", "No - each object gets its own", "Only string attributes are shared", "Only if the class was inherited"], correct: 1, why: "Attributes set on <code>self</code> in <code>__init__</code> belong to that object alone. The methods are shared; the data is not." },
    { level: "medium", q: "A class has <code>items = []</code> in its body. You create carts <code>a</code> and <code>b</code>, then append to <code>a</code>. What does <code>b.items</code> show?", options: ["[]", "an error", "the appended item", "None"], correct: 2, why: "An attribute in the class body belongs to the class, so all objects share one list. Per-object data has to be created in <code>__init__</code>." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A method is defined as <code>def bark():</code> with no parameters, then called on an instance. What happens?", options: ["It works normally", "SyntaxError at definition", "It returns None", "TypeError - it takes 0 arguments but 1 was given"], correct: 3, why: "The dot passes the object whether the method wanted it or not, so a method with no parameters receives one it cannot accept." },
    { level: "hard", q: "<code>__init__</code> sets a plain local <code>size = 10</code> without self. What does <code>hasattr(obj, \"size\")</code> return?", options: ["False", "True", "It raises AttributeError", "None"], correct: 0, why: "The local variable was discarded when the method returned, so the attribute was never created. hasattr answers honestly." },
    { level: "hard", q: "Why does Python make you write <code>self</code> explicitly, when many languages hide it?", options: ["To make classes run faster", "Because it is required by the parser", "Only for backwards compatibility with Python 2", "It makes the object visible in the signature, so methods are ordinary functions and the scope is never guessed"], correct: 3, why: "A method really is a plain function that takes the object as its first argument - which is why <code>Dog.bark(d)</code> works. Explicit self keeps that honest, and means an attribute read is never confused with a local variable." },
  ],
  "error-handling": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which block holds the code that might fail?", options: ["except", "try", "finally", "else"], correct: 1, why: "<code>try</code> wraps the risky work. <code>except</code> is what runs if that work raises." },
    { level: "easy", q: "<code>int(\"abc\")</code> raises which exception?", options: ["TypeError", "KeyError", "ValueError", "IndexError"], correct: 2, why: "The type is right - it is a string - but the value cannot be read as a number, which is exactly what ValueError means." },
    { level: "easy", q: "When does a <code>finally</code> block run?", options: ["Only when an exception was raised", "Only when nothing was raised", "Never, unless you call it", "Always, raised or not"], correct: 3, why: "That is what makes it the place for cleanup - closing a file or a connection has to happen either way." },
    // Medium — apply it
    { level: "medium", q: "An exception is raised on the first line inside a three-line <code>try</code>. What happens to the other two lines?", options: ["They run anyway", "They are skipped entirely", "They run after the except block", "Python retries them"], correct: 1, why: "Control jumps straight to the matching <code>except</code>. Nothing between the failing line and the end of the try block executes." },
    { level: "medium", q: "When does an <code>else</code> block on a try run?", options: ["Only if an exception was raised", "Only if the try finished without raising", "Always", "Only if there is no finally"], correct: 1, why: "It is the success path, kept outside the <code>try</code> so it is not accidentally protected by the same except." },
    { level: "medium", q: "You want a dictionary value with a fallback when the key is missing. What is the plainest way?", options: ["d.get(\"name\", \"\")", "try / except KeyError", "if d != None", "d[\"name\"] or \"\""], correct: 0, why: "Exceptions are for the unexpected. A key that is known to be optional is ordinary logic, and <code>.get</code> says so in one line." },
    { level: "medium", q: "What does <code>raise ValueError(\"bad age\")</code> do?", options: ["Prints a warning and continues", "Catches an error", "Raises an exception your own code detected", "Ends the program silently"], correct: 2, why: "<code>raise</code> reports a problem you found yourself. Refusing bad input loudly beats storing it and discovering it later." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A bare <code>except:</code> wraps code containing a misspelt variable name. What happens?", options: ["SyntaxError at import", "The NameError is caught and hidden, and the function returns its fallback", "Python warns about the bare except", "Only the misspelt line is skipped"], correct: 1, why: "A bare except catches everything, including bugs in your own code. The function then returns a plausible wrong answer forever, with no warning anywhere." },
    { level: "hard", q: "Why is <code>except Exception: pass</code> considered harmful even though it looks tidy?", options: ["It is slower than naming the exception", "It only works inside functions", "It throws the evidence away, so the program continues in a state nobody understands", "It stops finally from running"], correct: 2, why: "Silencing a failure does not remove it. It removes your ability to find out about it, and the wrong result ships as if it were right." },
    { level: "hard", q: "What does <code>raise NewError(\"...\") from e</code> add?", options: ["It retries the failed operation", "It suppresses the original exception", "It converts the exception into a warning", "It records the original exception as the cause, so the traceback shows both"], correct: 3, why: "It chains them. You can translate a low-level failure into a meaningful one without losing the line that actually broke." },
  ],
  "booleans": [
    // Easy — did the core idea land?
    { level: "easy", q: "<code>print(bool(0))</code> — what appears?", options: ["True", "False", "0", "an error"], correct: 1, why: "Zero is falsy. Empty things are false and everything else is true - that is the whole rule." },
    { level: "easy", q: "Which of these is <b>truthy</b>?", options: ["\"0\"", "0", "[]", "None"], correct: 0, why: "It is a non-empty string, so it is truthy - even though the character inside it is a zero. Only the empty string is falsy." },
    { level: "easy", q: "What does a comparison like <code>5 > 3</code> produce?", options: ["5", "the number 1", "True or False", "nothing"], correct: 2, why: "Every comparison evaluates to a boolean, which is what makes it usable directly in an if." },
    // Medium — apply it
    { level: "medium", q: "Which is the idiomatic way to check that a list has items?", options: ["if len(items) > 0:", "if items != []:", "if items:", "if bool(items) == True:"], correct: 2, why: "All four work. Only the third says what you mean without extra words, and it is what every Python reader expects." },
    { level: "medium", q: "<code>a = [1, 2]</code> and <code>b = [1, 2]</code>. What are <code>a == b</code> and <code>a is b</code>?", options: ["True and True", "True and False", "False and False", "False and True"], correct: 1, why: "The values match, so <code>==</code> is True. They are two separate objects in memory, so <code>is</code> is False." },
    { level: "medium", q: "<code>print(sum([True, False, True]))</code> — what appears?", options: ["2", "True", "an error", "3"], correct: 0, why: "<code>bool</code> subclasses <code>int</code>, so True is 1 and False is 0. Summing conditions is how you count matching rows without a loop." },
    { level: "medium", q: "<code>print(\"\" or \"Guest\")</code> — what appears?", options: ["True", "an empty string", "Guest", "an error"], correct: 2, why: "The empty string is falsy, so <code>or</code> moves on and returns the second operand. This is the standard default-value idiom." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "A function uses <code>if not score: return \"no score\"</code>. A real score of 0 is passed in. What happens?", options: ["It returns \"score: 0\"", "It raises TypeError", "It returns \"no score\", because 0 is falsy", "It returns None"], correct: 2, why: "<code>not score</code> asks about truthiness, not about absence. Zero is a real value and a falsy one, so the check answers a different question than the one intended." },
    { level: "hard", q: "Why is <code>if name is \"admin\"</code> unreliable?", options: ["is cannot be used on strings at all", "It compares identity, and may only appear to work because Python reuses short strings", "It is slower than ==", "It raises a SyntaxError"], correct: 1, why: "It asks whether they are the same object. Small literals are often cached so it seems to work, then fails on a string built at runtime - a bug that passes tests and fails in production." },
    { level: "hard", q: "How does a custom object decide whether it is truthy?", options: ["Every custom object is always falsy", "Python compares it to None", "Only classes with a __bool__ method can be used in an if", "Python calls __bool__, falls back to __len__, and otherwise treats it as truthy"], correct: 3, why: "Defining <code>__len__</code> is enough to make an empty collection falsy for free. A class defining neither will pass an if even when it is conceptually empty." },
  ],
  "numbers-math": [
    // Easy
    { level: "easy", q: "What is <code>10 // 3</code>?", options: ["3", "3.33", "4", "1"], correct: 0, why: "Floor division keeps the whole number below the answer, and drops the decimal entirely." },
    { level: "easy", q: "What is <code>10 % 3</code>?", options: ["1", "3", "0", "3.33"], correct: 0, why: "<code>%</code> is the remainder: 3 goes into 10 three times with 1 left over." },
    { level: "easy", q: "What is <code>2 ** 10</code>?", options: ["20", "100", "512", "1024"], correct: 3, why: "<code>**</code> is power, not multiplication — 2 raised to the 10th is 1024." },
    // Medium
    { level: "medium", q: "What is the type and value of <code>4 / 2</code>?", options: ["int, 2", "int, 2.0", "float, 2.0", "float, 2"], correct: 2, why: "<code>/</code> always produces a float, even when the division is exact. Use <code>//</code> if you need an int." },
    { level: "medium", q: "<code>half = 7 / 2</code>, then <code>items[half]</code>. What happens?", options: ["Works fine", "TypeError — an index must be an int", "Returns None", "Rounds automatically"], correct: 1, why: "<code>7 / 2</code> is <code>3.5</code>, a float, and a list index has to be an int. <code>7 // 2</code> gives 3." },
    { level: "medium", q: "What does <code>print(0.1 + 0.2 == 0.3)</code> show?", options: ["True", "False", "0.3", "an error"], correct: 1, why: "The sum is stored as <code>0.30000000000000004</code>, so the comparison is False. Correct arithmetic, wrong kind of test." },
    { level: "medium", q: "Which is the safe way to compare two decimals?", options: ["math.isclose(a, b)", "a == b", "str(a) == str(b)", "a - b == 0"], correct: 0, why: "<code>math.isclose</code> compares relative to the size of the numbers, so it works without you having to guess how many decimal places matter." },
    // Hard
    { level: "hard", q: "What is <code>-7 // 2</code>?", options: ["-3", "-4", "-3.5", "3"], correct: 1, why: "Floor means <b>down the number line</b>, not towards zero — so -3.5 floors to -4. If you want to chop towards zero, use <code>int(-7 / 2)</code>, which gives -3." },
    { level: "hard", q: "What does <code>round(2.5)</code> return?", options: ["3", "2.5", "2", "an error"], correct: 2, why: "Python rounds a value sitting exactly halfway to the nearest <b>even</b> number, so 2.5 goes to 2 while 3.5 goes to 4. It is deliberate: always rounding halves up would bias a long column of numbers upward." },
    { level: "hard", q: "A bill prints <code>Total: 99.95</code> and then <code>total == 99.95</code> is False. Why?", options: ["Python is buggy", "== does not work on floats at all", "The total is a string", "The printed value was rounded; the stored one has drifted"], correct: 3, why: "Rounding for display makes a tidied copy — the stored value is <code>99.94999999999999</code> after five additions of 19.99. The screen and the comparison are looking at two different numbers, which is why the bug seems impossible. For money, keep whole paise as integers or use <code>Decimal</code>." },
  ],

  "data-persistence": [
    // Easy
    { level: "easy", q: "When you read a number from a CSV, what type is it?", options: ["str — CSV has no types", "int", "float", "It depends"], correct: 0, why: "CSV is plain text with no type info, so every value comes back a string. Convert with int()/float()." },
    { level: "easy", q: "What does <code>csv.DictReader</code> give you per row?", options: ["A list", "A dict keyed by column name", "A tuple", "A string"], correct: 1, why: "DictReader uses the header row to return a dict per row, so you access fields by name like row['age']." },
    { level: "easy", q: "What does <code>pickle.dumps(obj)</code> return?", options: ["A string", "A file", "bytes", "A dict"], correct: 2, why: "pickle serialises an object to bytes; pickle.loads reconstructs it. dump/load use a file instead." },
    // Medium
    { level: "medium", q: "Why must you never unpickle untrusted data?", options: ["It's slow", "Loading a pickle can execute arbitrary code", "It corrupts the file", "It needs a password"], correct: 1, why: "A malicious pickle can run arbitrary code on load and compromise your machine. Use JSON for external data." },
    { level: "medium", q: "What does <code>sqlite3.connect(\":memory:\")</code> create?", options: ["A file on disk", "A remote database", "An in-memory database, no file", "A CSV"], correct: 2, why: "<code>:memory:</code> makes a temporary in-memory database — deterministic and leaving no file behind." },
    { level: "medium", q: "Why use <code>?</code> placeholders in a SQL query?", options: ["They're faster", "They're required syntax", "They prevent SQL injection and handle quoting", "They sort results"], correct: 2, why: "Placeholders send values separately from the SQL, so input can't become code — safe from injection." },
    { level: "medium", q: "When writing a CSV to a file, why open it with <code>newline=\"\"</code>?", options: ["To compress it", "To avoid blank rows between lines on Windows", "To make it faster", "It's optional"], correct: 1, why: "Without it, the csv module and the OS both add line endings, producing a blank row between each line." },
    // Hard
    { level: "hard", q: "<code>total += row[\"price\"]</code> on CSV data raises what?", options: ["Nothing", "KeyError", "IndexError", "TypeError — price is a string"], correct: 3, why: "CSV values are strings, so adding one to an int total raises TypeError. Convert with int(row['price'])." },
    { level: "hard", q: "Which format lets you QUERY and filter data efficiently?", options: ["CSV", "Pickle", "Plain text", "SQLite"], correct: 3, why: "SQLite is a real SQL database in one file — you can query, filter, join and update. CSV and pickle can't." },
    { level: "hard", q: "You need to cache a nested Python dict and only Python will read it. Best choice?", options: ["Pickle", "CSV", "A .txt file", "SQL"], correct: 0, why: "Pickle preserves any Python object exactly. CSV is flat and untyped; use pickle for trusted Python-only snapshots." },
  ],

  "system-modules": [
    // Easy
    { level: "easy", q: "What does <code>Path(\"data/sales.csv\").name</code> return?", options: ["sales.csv", "data", ".csv", "sales"], correct: 0, why: "<code>.name</code> is the final component — the file plus its extension." },
    { level: "easy", q: "What does <code>Path(\"photo.jpg\").suffix</code> return?", options: ["jpg", "photo", ".jpg", "photo.jpg"], correct: 2, why: "<code>.suffix</code> is the extension WITH the dot. <code>.stem</code> would give the name without it." },
    { level: "easy", q: "How do you join path pieces portably across OSes?", options: ["Path(folder) / name", "folder + \"/\" + name", "folder + name", "os.sep.join manually"], correct: 0, why: "The <code>/</code> operator uses the correct separator for the current OS — the whole reason pathlib exists." },
    // Medium
    { level: "medium", q: "What is <code>Path(\"README\").suffix</code> for a file with no extension?", options: ["\"README\"", "\"\" (empty string)", "\".README\"", "None"], correct: 1, why: "pathlib correctly returns an empty suffix. <code>\"README\".split(\".\")[-1]</code> would wrongly return 'README'." },
    { level: "medium", q: "Why can <code>str(Path(\"a\") / \"b\")</code> differ between machines?", options: ["It uses the OS's separator — backslash on Windows, slash elsewhere", "It's random", "pathlib is buggy", "It depends on Python version"], correct: 0, why: "The string form is platform-dependent. Use <code>.as_posix()</code> for consistent forward slashes." },
    { level: "medium", q: "How do you read an environment variable safely?", options: ["os.environ[name]", "sys.argv[name]", "os.environ.get(name, default)", "os.getenv only"], correct: 2, why: "<code>.get</code> returns the default when the variable is unset; indexing raises KeyError and crashes." },
    { level: "medium", q: "What does <code>os.path.exists(path)</code> do?", options: ["Creates the file", "Deletes it", "Opens it", "Returns True/False for whether it's there"], correct: 3, why: "It checks whether a path exists — useful to guard a file read before opening it." },
    // Hard
    { level: "hard", q: "Why is <code>filename.split(\".\")[-1]</code> a bad way to get an extension?", options: ["It's slow", "For a name with no dot it returns the whole name", "It only works on Windows", "It needs import re"], correct: 1, why: "With no dot, split returns a one-element list, so [-1] is the entire filename. Use <code>Path.suffix</code>." },
    { level: "hard", q: "What does <code>.as_posix()</code> give you?", options: ["The file size", "The parent folder", "The absolute path", "The path with forward slashes on any OS"], correct: 3, why: "It renders the path with forward slashes regardless of OS — useful for URLs, configs, and consistent display." },
    { level: "hard", q: "Which module gives you the command-line arguments and Python version?", options: ["os", "pathlib", "collections", "sys"], correct: 3, why: "<code>sys.argv</code> holds the command-line args and <code>sys.version_info</code> the version — sys is about the runtime." },
  ],

  "collections-itertools": [
    // Easy
    { level: "easy", q: "What does <code>Counter(items)</code> do?", options: ["Tallies how often each item appears", "Sorts the list", "Removes duplicates", "Reverses the list"], correct: 0, why: "<code>Counter</code> counts frequencies in one call; index it like a dict, and a missing key returns 0." },
    { level: "easy", q: "What does <code>Counter(items)[missing_key]</code> return?", options: ["A KeyError", "None", "0", "An empty list"], correct: 2, why: "A Counter returns 0 for a key it hasn't seen — no KeyError, unlike a plain dict." },
    { level: "easy", q: "What does <code>most_common(1)</code> return?", options: ["The count only", "A list with the top (item, count) pair", "The item only", "All items"], correct: 1, why: "It returns <code>[(item, count)]</code> — a list of one pair. Index <code>[0][0]</code> for just the item." },
    // Medium
    { level: "medium", q: "Why use <code>defaultdict(int)</code> for counting?", options: ["It's faster to type", "It sorts keys", "Missing keys start at 0, so += never KeyErrors", "It removes duplicates"], correct: 2, why: "A defaultdict creates a missing key with its factory's default (0 for int), so <code>d[k] += 1</code> just works." },
    { level: "medium", q: "What does <code>itertools.accumulate([1,2,3,4])</code> give?", options: ["[10]", "[1, 2, 3, 4]", "24", "[1, 3, 6, 10]"], correct: 3, why: "<code>accumulate</code> returns the running total: 1, 1+2, 1+2+3, 1+2+3+4." },
    { level: "medium", q: "What is a <code>namedtuple</code> good for?", options: ["Counting", "A tuple with named fields (p.x not p[0])", "A mutable list", "Sorting"], correct: 1, why: "It gives a lightweight immutable record with named, self-documenting fields, while still being a real tuple." },
    { level: "medium", q: "<code>defaultdict(list)</code> is typically used to…", options: ["count items", "group items under keys", "sort a list", "reverse a dict"], correct: 1, why: "With a list default you can <code>d[key].append(x)</code> without checking the key — the GROUP BY pattern." },
    // Hard
    { level: "hard", q: "<code>counts = {}; counts[ch] += 1</code> on a new key raises what?", options: ["Nothing", "TypeError", "IndexError", "KeyError (the read half fails)"], correct: 3, why: "<code>+= 1</code> reads then writes; the read of a missing key raises KeyError. Use Counter or defaultdict(int)." },
    { level: "hard", q: "What does <code>functools.reduce(lambda a,b: a*b, [1,2,3,4])</code> return?", options: ["24", "10", "[1,2,6,24]", "4"], correct: 0, why: "<code>reduce</code> folds left to right: ((1*2)*3)*4 = 24. It combines a list into one value." },
    { level: "hard", q: "<code>reduce</code> on an EMPTY list with no initial value does what?", options: ["Returns 0", "Returns None", "Returns an empty list", "Raises TypeError"], correct: 3, why: "There's nothing to fold, so it raises TypeError. Pass an initial value to make it safe on empty input." },
  ],

  "async": [
    // Easy
    { level: "easy", q: "What does calling an <code>async def</code> function return?", options: ["A coroutine object that runs nothing yet", "The result immediately", "A thread", "None"], correct: 0, why: "Calling a coroutine builds a paused coroutine object — it runs only when awaited or passed to asyncio.run/gather." },
    { level: "easy", q: "How do you run a coroutine at the top level of a script?", options: ["Just call it", "await coro()", "asyncio.run(coro())", "coro().start()"], correct: 2, why: "<code>asyncio.run</code> starts the event loop and runs the coroutine to completion. <code>await</code> only works inside an async def." },
    { level: "easy", q: "What does <code>await</code> do?", options: ["Blocks the whole program", "Creates a thread", "Runs an awaitable and pauses until it's ready", "Nothing"], correct: 2, why: "<code>await</code> runs the awaitable, pauses the coroutine until the result is ready, and yields control to the loop meanwhile." },
    // Medium
    { level: "medium", q: "What does <code>asyncio.gather</code> return?", options: ["The first result", "A set", "Nothing", "Results in input order"], correct: 3, why: "<code>gather</code> runs the coroutines concurrently and returns their results in the same order as the inputs." },
    { level: "medium", q: "How does single-threaded async run many tasks 'at once'?", options: ["It uses many CPUs", "It spawns threads", "It interleaves them, overlapping their waits at await points", "It doesn't"], correct: 2, why: "One thread runs a coroutine until an await, then switches to another — nothing runs in parallel, but the waiting overlaps." },
    { level: "medium", q: "Where can you use the <code>await</code> keyword?", options: ["Only inside an async def", "Anywhere", "Only at the top level", "Only in loops"], correct: 0, why: "<code>await</code> is only valid inside an <code>async def</code>. At the top level you start the loop with asyncio.run." },
    { level: "medium", q: "Async is the right tool for which kind of work?", options: ["CPU-heavy computation", "I/O-bound work like network and DB calls", "Sorting", "Nothing"], correct: 1, why: "Async overlaps waiting on I/O. For CPU-bound work you need multiprocessing, since one thread can't compute in parallel." },
    // Hard
    { level: "hard", q: "<code>price = get_price()</code> (an async def, no await). What is <code>price</code>?", options: ["The return value", "None", "An error", "A coroutine object, not the value"], correct: 3, why: "Without await, you get the coroutine object — the work never ran. This is the most common async bug." },
    { level: "hard", q: "What does <code>time.sleep(2)</code> inside a coroutine do?", options: ["Blocks the entire event loop", "Yields to other coroutines", "Raises an error", "Nothing"], correct: 0, why: "<code>time.sleep</code> is blocking and freezes the whole loop. Use <code>await asyncio.sleep</code>, which yields control." },
    { level: "hard", q: "You see <code>RuntimeWarning: coroutine was never awaited</code>. What did you forget?", options: ["import asyncio", "An await (or run/gather) on a coroutine", "A return", "A lock"], correct: 1, why: "The warning means a coroutine was created but never run — you forgot to await it or schedule it." },
  ],

  "concurrency": [
    // Easy
    { level: "easy", q: "What does <code>.join()</code> do on a thread?", options: ["Waits for it to finish", "Starts it", "Merges two threads", "Kills it"], correct: 0, why: "<code>join()</code> blocks the main program until the thread completes — call it before reading the thread's results." },
    { level: "easy", q: "What is the GIL?", options: ["A garbage collector", "A type of loop", "A lock that lets only one thread run Python at a time", "A logging tool"], correct: 2, why: "The Global Interpreter Lock serialises Python bytecode across threads — so threads overlap waiting, not computing." },
    { level: "easy", q: "Threads are best for which kind of work?", options: ["CPU-heavy computation", "I/O-bound work (network, files)", "Nothing", "Sorting"], correct: 1, why: "Threads overlap the waiting in I/O-bound tasks. For CPU-bound work the GIL blocks parallelism — use processes." },
    // Medium
    { level: "medium", q: "Why do threads NOT speed up CPU-bound work in Python?", options: ["Threads are disabled", "CPUs are too slow", "It needs a lock", "The GIL lets only one run Python at a time"], correct: 3, why: "Every thread needs the GIL to compute, so they take turns — no parallelism. Use multiprocessing for CPU work." },
    { level: "medium", q: "What does <code>ThreadPoolExecutor.map</code> guarantee about results?", options: ["They are sorted", "They are unique", "They come back in input order", "They are faster"], correct: 2, why: "<code>map</code> returns results in the same order as the inputs, no matter which thread finished first." },
    { level: "medium", q: "<code>threading.Thread(target=work())</code> — what's wrong?", options: ["work() runs immediately; pass target=work without ()", "Nothing", "It needs args", "It needs a lock"], correct: 0, why: "The parentheses call work now and pass its return value as target. Pass the function itself: <code>target=work</code>." },
    { level: "medium", q: "For CPU-bound parallelism, what do you use instead of threads?", options: ["More threads", "A bigger GIL", "multiprocessing / ProcessPoolExecutor", "Faster loops"], correct: 2, why: "Separate processes each have their own interpreter and GIL, so they run in true parallel across cores." },
    // Hard
    { level: "hard", q: "<code>result = threading.Thread(target=sq, args=(5,)).start()</code>. What is <code>result</code>?", options: ["25", "None", "the thread", "an error"], correct: 1, why: "<code>start()</code> returns None — a thread doesn't hand back a return value. Use ThreadPoolExecutor's submit().result()." },
    { level: "hard", q: "Two threads run <code>counter += 1</code> in a loop with no lock. The final count is…", options: ["Always correct", "Always zero", "Doubled", "Possibly less than expected, and varies each run"], correct: 3, why: "<code>+= 1</code> is a non-atomic read-modify-write; threads interleave and lose updates — a race condition. Guard it with a Lock." },
    { level: "hard", q: "How do you cleanly get a worker thread's return value?", options: ["ex.submit(fn, x).result()", "Read Thread.start()", "Thread.return", "It's impossible"], correct: 0, why: "<code>submit</code> returns a Future; <code>.result()</code> waits and returns the value (re-raising any worker exception)." },
  ],

  "regex": [
    // Easy
    { level: "easy", q: "What does <code>re.findall(r\"\\d+\", text)</code> return?", options: ["A list of every run of digits", "The first number", "True or False", "A single string"], correct: 0, why: "<code>findall</code> returns all matches as a list of strings; <code>\\d+</code> is one-or-more digits." },
    { level: "easy", q: "Why write regex patterns as raw strings <code>r\"...\"</code>?", options: ["It's faster", "It's required by import re", "So backslash sequences reach the regex engine intact", "To make them uppercase"], correct: 2, why: "Normal strings treat \\ as an escape (\\b becomes backspace), so raw strings keep the backslashes literal for regex." },
    { level: "easy", q: "What does <code>\\d</code> match?", options: ["Any letter", "A digit", "A space", "A word"], correct: 1, why: "<code>\\d</code> is a single digit 0-9; <code>\\w</code> is a letter/digit/underscore, <code>\\s</code> is whitespace." },
    // Medium
    { level: "medium", q: "What is the difference between <code>re.match</code> and <code>re.search</code>?", options: ["match is faster", "search only finds numbers", "They are identical", "match checks the START only; search looks anywhere"], correct: 3, why: "<code>re.match</code> anchors at the start of the string; <code>re.search</code> scans the whole thing." },
    { level: "medium", q: "<code>re.findall(r\"\\d\", \"12 34\")</code> returns what?", options: ["['12', '34']", "['1234']", "['1','2','3','4']", "4"], correct: 2, why: "Without <code>+</code>, <code>\\d</code> matches single digits — add <code>+</code> to grab whole runs like 12 and 34." },
    { level: "medium", q: "What does <code>re.sub(r\"\\d\", \"#\", \"a1b2\")</code> give?", options: ["a#b#", "####", "a1b2", "ab"], correct: 0, why: "<code>sub</code> replaces every match; each digit becomes #, so a1b2 → a#b#." },
    { level: "medium", q: "What does a failed <code>re.search</code> return?", options: ["An empty string", "None", "False", "An error"], correct: 1, why: "It returns None, so calling <code>.group()</code> on it raises AttributeError — check the match first." },
    // Hard
    { level: "hard", q: "<code>re.search(\"\\bcat\", \"the cat\")</code> (no r) returns no match. Why?", options: ["Without r, \\b is a backspace char, not a word boundary", "cat isn't there", "search is broken", "You need findall"], correct: 0, why: "In a normal string \\b is backspace; only r\"\\bcat\" reads \\b as a regex word boundary. Always use raw strings." },
    { level: "hard", q: "How do you validate that a whole string is only digits?", options: ["re.search(r\"\\d\", s)", "re.findall(r\"\\d\", s)", "re.match(r\"^\\d+$\", s)", "re.sub(r\"\\d\", s)"], correct: 2, why: "The <code>^</code> and <code>$</code> anchors force the entire string to be digits; without them a substring could match." },
    { level: "hard", q: "After <code>m = re.search(r\"(\\w+)@(\\w+)\", \"om@mail\")</code>, what is <code>m.group(2)</code>?", options: ["om", "om@mail", "@", "mail"], correct: 3, why: "Parentheses capture groups; group(1) is before the @ (om), group(2) is after it (mail), group(0) is the whole match." },
  ],

  "decorators": [
    // Easy
    { level: "easy", q: "What is a decorator?", options: ["A function that wraps another function to add behaviour", "A type of comment", "A CSS style", "A loop"], correct: 0, why: "A decorator takes a function and returns a new one that adds behaviour around it, applied with @name." },
    { level: "easy", q: "What is a closure?", options: ["A closed file", "An inner function that remembers its outer variables", "A finished loop", "A private class"], correct: 1, why: "A closure is an inner function bundled with the outer-scope variables it uses — it keeps them alive after the outer function returns." },
    { level: "easy", q: "<code>@shout</code> above <code>def greet</code> is shorthand for what?", options: ["greet.shout()", "shout.greet", "greet = shout(greet)", "import shout"], correct: 2, why: "The @ syntax just reassigns greet to shout(greet) — pure syntactic sugar." },
    // Medium
    { level: "medium", q: "Why does a decorator's wrapper usually take <code>*args, **kwargs</code>?", options: ["For speed", "So it can wrap a function with any signature", "To sort arguments", "It's required syntax"], correct: 1, why: "The wrapper doesn't know how many arguments the wrapped function takes, so *args/**kwargs lets it fit any function and forward them." },
    { level: "medium", q: "After <code>@logged</code> with no functools.wraps, what is <code>load.__name__</code>?", options: ["'load'", "'logged'", "None", "'wrapper'"], correct: 3, why: "The decorator replaced load with the inner wrapper, so its name is 'wrapper' — unless you copy the original's with functools.wraps." },
    { level: "medium", q: "What does <code>functools.wraps(func)</code> do?", options: ["Speeds up the function", "Copies the original's name and docstring onto the wrapper", "Caches the result", "Runs it twice"], correct: 1, why: "It preserves __name__, __doc__ and signature so the decorated function keeps its identity for logging and debuggers." },
    { level: "medium", q: "A decorator forgets to <code>return wrapper</code>. What happens to the decorated function?", options: ["It becomes None and calling it errors", "It runs normally", "It returns wrapper anyway", "It raises at definition"], correct: 0, why: "The decorator returns None, so the name is rebound to None — calling it raises 'NoneType is not callable'." },
    // Hard
    { level: "hard", q: "In <code>double = multiplier(2)</code>, how does <code>double(5)</code> still know n is 2?", options: ["It re-runs multiplier", "n is global", "The closure captured n and kept it alive", "It guesses"], correct: 2, why: "The inner function closed over n, so it keeps a live reference even after multiplier returned — that's a closure." },
    { level: "hard", q: "What's the most common bug when writing a decorator?", options: ["Using too many arguments", "Naming it @deco", "Returning a number", "Omitting functools.wraps, so the name becomes 'wrapper'"], correct: 3, why: "Without functools.wraps, every decorated function reports __name__ as 'wrapper' and loses its docstring — breaking logs and tools." },
    { level: "hard", q: "Which real-world features are built on decorators?", options: ["print() and len()", "for and while", "@app.route, @property, @lru_cache", "if and else"], correct: 2, why: "Frameworks use decorators heavily: Flask routing, properties, caching — all keep cross-cutting logic out of the function body." },
  ],

  "iterators-generators": [
    // Easy
    { level: "easy", q: "What does <code>next()</code> do on an iterator?", options: ["Returns the next value", "Resets it", "Sorts it", "Counts the items"], correct: 0, why: "<code>next()</code> pulls the next value; at the end it raises StopIteration (or returns a default if you pass one)." },
    { level: "easy", q: "Which keyword makes a function a generator?", options: ["return", "async", "yield", "gen"], correct: 2, why: "<code>yield</code> turns a function into a generator — it produces values lazily and pauses at each yield." },
    { level: "easy", q: "What is the main benefit of a generator over a list?", options: ["It's always faster", "It uses far less memory", "It can be indexed", "It sorts automatically"], correct: 1, why: "A generator computes one value at a time and never holds the whole sequence, so it scales to huge or infinite data." },
    // Medium
    { level: "medium", q: "<code>g = (x for x in [1,2,3])</code>. What does <code>list(g)</code> give the SECOND time?", options: ["[1, 2, 3] again", "An error", "None", "[] — it's already consumed"], correct: 3, why: "A generator runs once. After the first pass it's exhausted, so the second list(g) is empty — no error." },
    { level: "medium", q: "What raises when an iterator has no more values?", options: ["ValueError", "StopIteration", "IndexError", "KeyError"], correct: 1, why: "<code>next()</code> raises StopIteration at the end — which is exactly how a for loop knows to stop." },
    { level: "medium", q: "Which builds a generator, not a list?", options: ["[x for x in it]", "{x for x in it}", "(x for x in it)", "list(it)"], correct: 2, why: "Round brackets make a generator expression (lazy); square brackets make a list (eager)." },
    { level: "medium", q: "How does a <code>for</code> loop actually work internally?", options: ["It calls iter() then next() until StopIteration", "It copies the list", "It uses recursion", "It checks the length first"], correct: 0, why: "A for loop calls iter() on the iterable, then next() repeatedly, stopping when it sees StopIteration." },
    // Hard
    { level: "hard", q: "You need to sum AND count a generator. What must you do?", options: ["Call sum() then len()", "Nothing — it works", "Materialise it to a list once, then use both", "Use two generators"], correct: 2, why: "sum() consumes the generator, leaving nothing to count. Convert to a list once and read it as many times as needed." },
    { level: "hard", q: "Why does <code>sum(len(line) for line in huge_file)</code> scale to a 10 GB file?", options: ["Files are compressed", "It streams one line at a time, never holding all of it", "It skips most lines", "Python caches it"], correct: 1, why: "The generator expression yields one line at a time, so memory stays flat regardless of file size — building a list would try to load all 10 GB." },
    { level: "hard", q: "What does <code>next(iter([]), \"done\")</code> return?", options: ["StopIteration", "None", "An empty list", "\"done\""], correct: 3, why: "Passing a default to next() returns that default instead of raising StopIteration when the iterator is empty." },
  ],

  "dunder-methods": [
    // Easy
    { level: "easy", q: "What does <code>len(x)</code> actually call on the object?", options: ["x.__len__()", "x.size()", "x.length", "x.count()"], correct: 0, why: "Built-in syntax maps to dunders: <code>len(x)</code> is <code>x.__len__()</code>. Define __len__ and len() works on your class." },
    { level: "easy", q: "Which method does <code>print(obj)</code> use for its output?", options: ["__repr__", "__print__", "__str__", "__show__"], correct: 2, why: "<code>print</code> and <code>str()</code> use __str__ — the friendly form. Containers and the debugger use __repr__." },
    { level: "easy", q: "What does <code>@staticmethod</code> take as its first parameter?", options: ["self", "cls", "the instance", "nothing special"], correct: 3, why: "A static method takes neither self nor cls — it's a plain utility living in the class." },
    // Medium
    { level: "medium", q: "Two objects with identical attributes compare <code>==</code> as False. The likely cause?", options: ["The class doesn't define __eq__, so == uses identity", "A syntax error", "The attributes are private", "Python is broken"], correct: 0, why: "Without __eq__, == compares identity (same object?), not value — so two separate equal-looking objects are unequal." },
    { level: "medium", q: "You define only <code>__str__</code>. What does <code>print([obj])</code> show?", options: ["The __str__ output", "An error", "The ugly default <object at 0x...>", "None"], correct: 2, why: "Lists use __repr__, not __str__. With no __repr__, they fall back to the default. Always define __repr__." },
    { level: "medium", q: "Which dunder does the <code>+</code> operator call?", options: ["__add__", "__plus__", "__sum__", "__concat__"], correct: 0, why: "<code>a + b</code> calls <code>a.__add__(b)</code> — defining it is operator overloading." },
    { level: "medium", q: "What does <code>@classmethod</code> receive that a static method does not?", options: ["The instance self", "The class cls", "Nothing", "The parent class"], correct: 1, why: "A classmethod gets <code>cls</code>, the class itself — often used to build alternative constructors that return cls(...)." },
    // Hard
    { level: "hard", q: "If you define only ONE of __str__ / __repr__, which should it be?", options: ["__str__", "Either works the same", "__repr__", "Both are required"], correct: 2, why: "Python falls back to __repr__ when __str__ is missing, and containers/debuggers use __repr__ — so it's the more useful one to define." },
    { level: "hard", q: "Which set of dunders makes an object behave like a container?", options: ["__init__ only", "__str__ and __eq__", "__add__ and __sub__", "__len__, __getitem__, __contains__"], correct: 3, why: "These three give an object length, indexing, and membership tests — the core of container behaviour." },
    { level: "hard", q: "Why do NumPy arrays support <code>arr + 1</code> and <code>arr[mask]</code> so naturally?", options: ["They're built into Python", "They define dunder methods like __add__ and __getitem__", "They use a special compiler", "It's magic"], correct: 1, why: "Libraries implement the dunders so their objects plug into ordinary Python syntax — that's what makes them feel native." },
  ],

  "encapsulation": [
    // Easy
    { level: "easy", q: "What does encapsulation mean?", options: ["Bundling data with the methods that change it", "Making a class faster", "Copying a class", "Deleting attributes"], correct: 0, why: "Encapsulation hides data behind methods so every change goes through code you control — where you can validate it." },
    { level: "easy", q: "What does one leading underscore (<code>_bank</code>) signal?", options: ["It is truly private", "Internal, by convention — please don't touch", "It is a constant", "It errors on access"], correct: 1, why: "A single underscore is only a convention: Python still lets you read it. It just signals \"internal\"." },
    { level: "easy", q: "What is polymorphism?", options: ["A type of loop", "Copying objects", "One interface working across different types", "A private variable"], correct: 2, why: "The same name — <code>len()</code>, <code>+</code>, a shared method — doing the right thing for whatever type it gets." },
    // Medium
    { level: "medium", q: "<code>self.__balance</code> — what does Python do to that name?", options: ["Nothing special", "Deletes it", "Encrypts it", "Mangles it to _ClassName__balance"], correct: 3, why: "Double underscore triggers name mangling: the attribute is renamed to <code>_ClassName__balance</code> to avoid subclass clashes." },
    { level: "medium", q: "Can you still access a <code>__private</code> attribute from outside the class?", options: ["Yes, via its mangled name _Class__name", "No, never", "Only with a password", "Only inside a loop"], correct: 0, why: "Privacy is a speed bump, not a lock — <code>a._Account__balance</code> still works. It prevents accidents, not determined access." },
    { level: "medium", q: "How do you read a <code>@property</code> called <code>area</code>?", options: ["c.area", "c.area()", "c.get_area()", "area(c)"], correct: 0, why: "A property is read like an attribute — no parentheses. <code>c.area()</code> would try to call the value it returns." },
    { level: "medium", q: "What is the real benefit of hiding a balance behind <code>deposit()</code>?", options: ["It saves memory", "The method can validate and reject bad input", "It runs faster", "It hides it from Python"], correct: 1, why: "A validated setter keeps the object from ever holding an impossible state, like a negative balance." },
    // Hard
    { level: "hard", q: "Inside a subclass, <code>self.__balance</code> raises AttributeError for <code>_Subclass__balance</code>. Why?", options: ["The parent deleted it", "Subclasses can't have attributes", "It's a typo", "Name mangling uses the class where the code is written"], correct: 3, why: "The mangled name uses the defining class, so in the subclass __balance becomes _Subclass__balance — a name the parent never set." },
    { level: "hard", q: "You want an attribute that subclasses CAN see. Which do you use?", options: ["Double underscore __x", "No underscore, but hidden", "A property", "Single underscore _x"], correct: 3, why: "A single underscore is protected by convention and not mangled, so subclasses can access it. Double underscore isolates it." },
    { level: "hard", q: "What is duck typing?", options: ["Checking an object's exact type first", "Only using ducks", "Calling the method you need and trusting the object to support it", "A kind of inheritance"], correct: 2, why: "\"If it quacks like a duck.\" Python checks what an object can do, not what it is — any object with the right method fits." },
  ],

  "inheritance": [
    // Easy
    { level: "easy", q: "How does <code>Dog</code> inherit from <code>Animal</code>?", options: ["class Dog(Animal):", "class Dog extends Animal:", "class Dog: inherit Animal", "class Dog -> Animal:"], correct: 0, why: "Python puts the parent in parentheses: <code>class Dog(Animal):</code>. <code>extends</code> is Java." },
    { level: "easy", q: "If Dog and Animal both define <code>speak()</code>, which runs for a Dog?", options: ["Dog's — the child's version wins", "Animal's", "Both, in order", "It errors"], correct: 0, why: "Python looks on the child first, so Dog's <code>speak()</code> overrides Animal's for Dog instances." },
    { level: "easy", q: "What does <code>super()</code> give you access to?", options: ["The child's methods", "Global variables", "The parent class's methods", "A new object"], correct: 2, why: "<code>super()</code> reaches the parent class — most importantly <code>super().__init__()</code> to run the parent's setup." },
    // Medium
    { level: "medium", q: "A Dog defines its own <code>__init__</code> but never calls <code>super().__init__()</code>. What happens to the parent's attributes?", options: ["They are set automatically", "They are never set", "They become None", "Python calls it for you"], correct: 1, why: "Defining __init__ in the child replaces the parent's, so the parent's setup never runs and its attributes are missing." },
    { level: "medium", q: "<code>isinstance(dog, Animal)</code> where Dog inherits Animal — what is it?", options: ["False", "Error", "None", "True"], correct: 3, why: "A Dog is-a Animal, so isinstance against the parent is True. That's what lets Animal-typed code accept any subclass." },
    { level: "medium", q: "What does <code>super().speak()</code> inside Dog.speak() let you do?", options: ["Extend the parent's method instead of just replacing it", "Skip the parent entirely", "Delete the parent method", "Rename speak"], correct: 0, why: "Calling the parent's version and adding to its result lets the child build on it rather than replace it wholesale." },
    { level: "medium", q: "A child class with NO <code>__init__</code> is created. Which init runs?", options: ["None runs", "The parent's __init__", "An empty one", "It errors"], correct: 1, why: "If the child doesn't define __init__, the parent's is inherited and runs as-is." },
    // Hard
    { level: "hard", q: "Reading <code>dog.name</code> raises <code>AttributeError</code> even though Dog inherits Animal. The likely cause?", options: ["name is private", "Animal has no name", "isinstance failed", "Dog's __init__ skipped super().__init__, so name was never set"], correct: 3, why: "The parent's __init__ (which sets self.name) never ran because the child's __init__ didn't call super().__init__." },
    { level: "hard", q: "What is the MRO (method resolution order) for <code>class Dog(Animal)</code>?", options: ["Animal, Dog, object", "Dog, object, Animal", "Dog, Animal, object", "object, Animal, Dog"], correct: 2, why: "Python searches the child first, then parents, then object: Dog → Animal → object. Inspect it with <code>Dog.__mro__</code>." },
    { level: "hard", q: "When should you prefer composition over inheritance?", options: ["Always", "Never", "When the relationship is has-a, not is-a", "Only for exceptions"], correct: 2, why: "Inheritance models is-a (a Dog is an Animal). A Car has-a Engine, so it should hold an Engine object rather than inherit from it." },
  ],

  "advanced-functions": [
    // Easy
    { level: "easy", q: "Inside <code>def f(*args)</code>, what type is <code>args</code>?", options: ["A tuple", "A list", "A dict", "A set"], correct: 0, why: "<code>*args</code> gathers extra positional arguments into a tuple. <code>**kwargs</code> gathers keyword ones into a dict." },
    { level: "easy", q: "What does every recursive function need to stop?", options: ["A loop", "A base case", "A global variable", "A return type"], correct: 1, why: "A base case returns without recursing. Without it, the function calls itself forever and raises RecursionError." },
    { level: "easy", q: "What does <code>**kwargs</code> collect?", options: ["Positional arguments", "Nothing", "Keyword arguments into a dict", "The return value"], correct: 2, why: "<code>**kwargs</code> gathers any extra named arguments into a dictionary — one star for positional, two for keyword." },
    // Medium
    { level: "medium", q: "<code>add3(a,b,c)</code> and <code>nums=[1,2,3]</code>. How do you call it with the list?", options: ["add3(nums)", "add3(&nums)", "add3(*nums)", "add3([nums])"], correct: 2, why: "<code>*nums</code> at the call site spreads the list into three separate positional arguments." },
    { level: "medium", q: "When is a default argument value evaluated?", options: ["Once, when the function is defined", "On every call", "Only when passed", "When the module is imported each time"], correct: 0, why: "Defaults are evaluated once at definition. That is exactly why a mutable default like <code>[]</code> is shared across calls." },
    { level: "medium", q: "What is the correct signature order?", options: ["**kwargs, *args, params", "*args, params, **kwargs", "params, **kwargs, *args", "params, *args, **kwargs"], correct: 3, why: "Normal parameters first, then <code>*args</code>, then <code>**kwargs</code> — any other order is a SyntaxError." },
    { level: "medium", q: "<code>def greet(**k)</code> called as <code>greet(name=\"F\")</code>. What is <code>k</code>?", options: ["('F',)", "'name=F'", "['F']", "{'name': 'F'}"], correct: 3, why: "Keyword arguments are collected into a dict, so <code>k</code> is <code>{'name': 'F'}</code>." },
    // Hard
    { level: "hard", q: "<code>def f(item, cart=[])</code> appends and returns cart. Called twice with 'a' then 'b'. What is the second result?", options: ["['b']", "['a', 'b']", "['a']", "[]"], correct: 1, why: "The default list is created once and shared, so it keeps 'a' from the first call — the mutable default trap. The second call returns ['a', 'b']." },
    { level: "hard", q: "How do you fix the mutable-default bug?", options: ["Use cart=() instead", "Default to None, build the list inside", "Make cart global", "Add *args"], correct: 1, why: "Default to <code>None</code>, then <code>if cart is None: cart = []</code> — this creates a fresh list on every call that omits the argument." },
    { level: "hard", q: "What happens if a recursive function has no base case?", options: ["It returns None", "It runs once", "RecursionError when the stack limit is hit", "It becomes a loop"], correct: 2, why: "With nothing to stop it, the calls stack up past Python's limit (~1000) and it raises RecursionError." },
  ],

  "match-case": [
    // Easy
    { level: "easy", q: "What is <code>case _</code> in a match statement?", options: ["A syntax error", "The catch-all default, like else", "A comment", "A loop"], correct: 1, why: "The underscore is the wildcard — it matches anything, so it acts as the default and must come last." },
    { level: "easy", q: "How do you match several values in one case?", options: ["case 1 | 2 | 3:", "case 1, 2, 3:", "case 1 or 2 or 3:", "case [1,2,3]:"], correct: 0, why: "<code>|</code> lists alternatives: <code>case 500 | 502 | 503</code> matches any of the three." },
    { level: "easy", q: "In what order are cases tried?", options: ["Top to bottom, first match wins", "Bottom to top", "All at once", "Most specific automatically first"], correct: 0, why: "Python checks cases top to bottom and stops at the first that matches — so order matters and the catch-all goes last." },
    // Medium
    { level: "medium", q: "Which Python version introduced <code>match-case</code>?", options: ["3.6", "2.7", "3.8", "3.10"], correct: 3, why: "Structural pattern matching arrived in Python 3.10 (PEP 634)." },
    { level: "medium", q: "What does <code>case [0, y]</code> do with <code>[0, 5]</code>?", options: ["Nothing — lists can't be matched", "Errors", "Rejects it", "Matches, and binds y = 5"], correct: 3, why: "It matches a two-element list whose first item is 0, capturing the second into <code>y</code>. This structural matching is what sets match apart from a switch." },
    { level: "medium", q: "On a dict, does <code>case {\"name\": n}</code> require an exact key match?", options: ["Yes, only that one key", "No — it matches if that key is present, ignoring extras", "Only if the dict has no other keys", "It matches values, not keys"], correct: 1, why: "A mapping pattern matches when the required keys are present and ignores extra keys — ideal for API payloads with more fields than you need." },
    { level: "medium", q: "How do you add a condition to a case?", options: ["case x if x > 0:", "case x where x > 0:", "case x and x > 0:", "case (x > 0):"], correct: 0, why: "A guard is an <code>if</code> after the pattern: <code>case x if x > 0</code> matches, then checks the condition." },
    // Hard
    { level: "hard", q: "<code>WEEKEND='Sun'</code>. What does <code>case WEEKEND:</code> actually do?", options: ["Compares day to 'Sun'", "Errors immediately", "Captures ANY value into WEEKEND — matches everything", "Skips the case"], correct: 2, why: "A bare name is a capture, not a comparison: it matches any value and binds it. Use a literal, dotted name, or guard to compare." },
    { level: "hard", q: "Why must <code>case _</code> be the last case?", options: ["It runs fastest there", "It's just a style rule", "It matches everything, so later cases become unreachable", "It only works at the end technically"], correct: 2, why: "The wildcard matches any value, so any case placed after it can never run — Python treats those as dead code." },
    { level: "hard", q: "How do you compare a value against a variable in a case?", options: ["case variable:", "case ==variable:", "case x if x == variable:", "case (variable):"], correct: 2, why: "Because a bare name captures, you use a guard: <code>case x if x == variable</code> binds the value, then tests equality." },
  ],

  "more-operators": [
    // Easy
    { level: "easy", q: "What does <code>3 in [1, 2, 3]</code> return?", options: ["False", "3", "True", "[3]"], correct: 2, why: "<code>in</code> tests membership and gives back a bool — 3 is an element, so True." },
    { level: "easy", q: "<code>\"cat\" in \"category\"</code> — what does <code>in</code> check on a string?", options: ["Whether it is a substring", "Whether it is equal", "The length", "The first letter"], correct: 0, why: "On a string, <code>in</code> is a substring test, and \"cat\" starts \"category\", so it is True." },
    { level: "easy", q: "Which operator compares VALUE (are these equal)?", options: ["is", "&", "in", "=="], correct: 3, why: "<code>==</code> compares value. <code>is</code> compares identity — whether they are the same object." },
    // Medium
    { level: "medium", q: "On a dict, what does <code>in</code> check?", options: ["The values", "The keys", "Both keys and values", "The length"], correct: 1, why: "<code>in</code> on a dict tests the keys. To search values, use <code>in d.values()</code>." },
    { level: "medium", q: "<code>a = [1,2]; b = [1,2]</code>. What is <code>a is b</code>?", options: ["True", "Error", "None", "False"], correct: 3, why: "They are two separate lists — equal in value (<code>==</code> True) but different objects, so <code>is</code> is False." },
    { level: "medium", q: "How should you check whether <code>x</code> is None?", options: ["x is None", "x == None", "x = None", "x in None"], correct: 0, why: "<code>None</code> is a singleton, so identity is the right question. <code>is None</code> is correct and can't be fooled by a custom <code>__eq__</code>." },
    { level: "medium", q: "What is <code>6 & 3</code>?", options: ["9", "2", "7", "5"], correct: 1, why: "Bitwise AND keeps a 1 only where both bits are 1: 110 & 011 = 010 = 2." },
    // Hard
    { level: "hard", q: "Why can using <code>is</code> to compare two equal lists be a silent bug?", options: ["is only works on numbers", "is is slower", "is always returns False", "It's True only when they're literally the same object, not just equal"], correct: 3, why: "<code>is</code> compares identity. Two separately-built equal lists are different objects, so it returns False — and it passes any test where you accidentally compare an object with itself." },
    { level: "hard", q: "Can you rely on <code>is</code> to compare two equal integers?", options: ["Yes, always", "Only for numbers over 256", "No — int caching is implementation-specific, use ==", "Only inside functions"], correct: 2, why: "Whether equal ints are the same object depends on the interpreter's caching, so <code>256 is 256</code> may differ from <code>257 is 257</code>. Use <code>==</code> for values; reserve <code>is</code> for None." },
    { level: "hard", q: "In Pandas, how do you combine two boolean masks — <code>df.a > 0</code> and <code>df.b < 5</code>?", options: ["with and", "with &", "with +", "with is"], correct: 1, why: "NumPy/Pandas overload <code>&</code> and <code>|</code> for element-wise mask combining; <code>and</code>/<code>or</code> would raise on an array." },
  ],

  "dates": [
    // Easy
    { level: "easy", q: "What does <code>strftime</code> do?", options: ["Turns a datetime into formatted text", "Parses text into a date", "Adds days to a date", "Gets the current time"], correct: 0, why: "strftime = string-<b>format</b>-time: date object → text. Its opposite, <code>strptime</code>, parses text back into a date." },
    { level: "easy", q: "Which code gives the 4-digit year?", options: ["%y", "%m", "%D", "%Y"], correct: 3, why: "Capital <code>%Y</code> is the 4-digit year (2026); lowercase <code>%y</code> is the 2-digit form (26)." },
    { level: "easy", q: "You subtract two dates. What do you get back?", options: ["An int of days", "A string", "A timedelta", "A tuple"], correct: 2, why: "Subtracting dates yields a <code>timedelta</code> (a span). Its <code>.days</code> attribute reads out the whole number of days." },
    // Medium
    { level: "medium", q: "What does <code>%m</code> mean in a format string?", options: ["The minute", "The month", "The millisecond", "The meridian (AM/PM)"], correct: 1, why: "Lowercase <code>%m</code> is the month (01–12). The minute is capital <code>%M</code> — swapping them is the classic silent date bug." },
    { level: "medium", q: "<code>datetime.strptime(\"23/07/2026\", \"%d-%m-%Y\")</code> — what happens?", options: ["Works fine", "Returns None", "Swaps to slashes automatically", "ValueError — the separators don't match"], correct: 3, why: "The text uses slashes but the format says dashes. strptime needs the format to mirror the text exactly, so this raises ValueError." },
    { level: "medium", q: "Why do the lesson's examples use a fixed date instead of <code>datetime.now()</code>?", options: ["now() changes each run, so the output can't be verified", "now() is deprecated", "now() only works online", "Fixed dates are faster"], correct: 0, why: "<code>now()</code> returns a different value every time, so a snippet claiming a specific output would be wrong the next second. Fixed dates keep the output stable." },
    { level: "medium", q: "Which does <code>timedelta</code> NOT accept as an argument?", options: ["days", "hours", "months", "weeks"], correct: 2, why: "A month is not a fixed number of days, so <code>timedelta</code> has no <code>months</code>. It takes days, hours, minutes, seconds, weeks." },
    // Hard
    { level: "hard", q: "<code>datetime(2026, 7, 23, 14, 5).strftime(\"%H:%m\")</code> prints what?", options: ["14:05", "14:07", "02:05", "ValueError"], correct: 1, why: "Lowercase <code>%m</code> is the month, and it is July, so the minute slot shows 07. The correct code is capital <code>%M</code>, which gives 14:05." },
    { level: "hard", q: "You have two date strings and want the days between them. What must you do first?", options: ["Nothing — subtract the strings", "Concatenate them", "Sort them alphabetically", "strptime both into datetimes"], correct: 3, why: "You cannot subtract strings. Parse each with <code>strptime</code> into real datetimes, then subtract and read <code>.days</code>." },
    { level: "hard", q: "Why can sorting date STRINGS give the wrong chronological order?", options: ["Strings can't be sorted", "Python sorts dates randomly", "Lexicographic order only matches time if it's zero-padded year-first", "It always works"], correct: 2, why: "As text, <code>\"09/2026\"</code> sorts before <code>\"10/2025\"</code> even though it is later. Only strict year-first zero-padded strings sort chronologically — which is why you parse to real dates." },
  ],

  "json": [
    // Easy
    { level: "easy", q: "What does <code>json.loads</code> do?", options: ["Turns a JSON string into Python objects", "Writes JSON to a file", "Turns Python into a JSON string", "Downloads JSON from a URL"], correct: 0, why: "The <b>s</b> means string: <code>loads</code> reads a string IN to Python. <code>dumps</code> writes Python OUT to a string." },
    { level: "easy", q: "JSON <code>true</code> becomes which Python value after <code>json.loads</code>?", options: ["\"true\"", "1", "True", "true"], correct: 2, why: "JSON is lowercase <code>true</code>; Python is capitalised <code>True</code>. loads translates the spelling for you." },
    { level: "easy", q: "Which quotes does valid JSON require?", options: ["Single quotes", "Backticks", "No quotes on keys", "Double quotes"], correct: 3, why: "JSON demands double quotes. <code>json.loads(\"{'a': 1}\")</code> raises JSONDecodeError." },
    // Medium
    { level: "medium", q: "What does <code>json.dumps({\"x\": None})</code> produce?", options: ["{\"x\": null}", "{\"x\": None}", "{\"x\": \"None\"}", "{'x': null}"], correct: 0, why: "Python <code>None</code> is written as JSON <code>null</code>, and dumps always uses double quotes." },
    { level: "medium", q: "A JSON array like <code>[1, 2, 3]</code> parses into which Python type?", options: ["tuple", "list", "set", "dict"], correct: 1, why: "JSON arrays become Python lists; JSON objects become dicts." },
    { level: "medium", q: "Why can't you paste raw JSON as a Python dict literal?", options: ["JSON is always compressed", "Python dicts can't nest", "true/false/null and quote rules differ from Python", "It is too slow"], correct: 2, why: "JSON uses lowercase <code>true</code>/<code>false</code>/<code>null</code> and double quotes; pasted as code, <code>true</code> is a NameError. Use <code>json.loads</code>." },
    { level: "medium", q: "How do you pretty-print JSON with 2-space indentation?", options: ["json.dumps(d, pretty=True)", "json.dumps(d, indent=2)", "json.pretty(d)", "json.dumps(d, spaces=2)"], correct: 1, why: "The <code>indent=</code> argument controls pretty-printing; <code>sort_keys=True</code> can order the keys too." },
    // Hard
    { level: "hard", q: "<code>{1: 95}</code> is dumped to JSON and loaded back. What is the key now?", options: ["The int 1", "The string \"1\"", "Both 1 and \"1\"", "It raises an error"], correct: 1, why: "JSON keys are always strings, so <code>1</code> becomes <code>\"1\"</code> on the way out and stays a string on the way back. <code>back[1]</code> then raises KeyError." },
    { level: "hard", q: "What does <code>json.dumps({1, 2, 3})</code> do?", options: ["Returns [1, 2, 3]", "Returns {1, 2, 3}", "Raises TypeError — a set is not serializable", "Returns \"{1, 2, 3}\""], correct: 2, why: "A set has no JSON equivalent, so dumps raises <code>TypeError: Object of type set is not JSON serializable</code>. Convert to a list first." },
    { level: "hard", q: "What is the difference between <code>json.load</code> and <code>json.loads</code>?", options: ["load reads from a file object; loads reads from a string", "load is faster", "loads is for lists only", "They are identical"], correct: 0, why: "<code>loads</code> takes a string; <code>load</code> reads JSON straight from a file object. The same pairing exists for <code>dump</code> vs <code>dumps</code>." },
  ],

  "scope": [
    // Easy
    { level: "easy", q: "Where can a variable created inside a function be used?", options: ["Only inside that function", "Anywhere in the program", "Only after the function returns", "In any other function"], correct: 0, why: "A local variable exists only while its function runs and is invisible outside it — that isolation is what lets two functions reuse names like <code>total</code> without colliding." },
    { level: "easy", q: "Reading a global variable from inside a function (without assigning it)…", options: ["Raises an error", "Works fine", "Needs the global keyword", "Creates a copy"], correct: 1, why: "Reading is always allowed. It is only <b>assignment</b> that creates a local and changes the picture." },
    { level: "easy", q: "What does the LEGB rule describe?", options: ["The four data types", "How to import modules", "The order Python searches scopes for a name", "The steps to define a function"], correct: 2, why: "Local, Enclosing, Global, Built-in — Python checks them in that order and stops at the first scope that has the name." },
    // Medium
    { level: "medium", q: "<code>x = 100</code> globally. A function does <code>x = 5</code> then returns. What is the global <code>x</code> now?", options: ["5", "0", "None", "100"], correct: 3, why: "The inner <code>x = 5</code> made a separate local that vanished when the function returned. The global is untouched." },
    { level: "medium", q: "To make a function rebind a global counter with <code>count += 1</code>, you must…", options: ["declare global count in the function", "return count", "name it _count", "nothing — it just works"], correct: 0, why: "<code>+=</code> is an assignment, so without <code>global count</code> Python treats count as local and the read half fails with UnboundLocalError." },
    { level: "medium", q: "Which needs NO <code>global</code> keyword inside a function?", options: ["items = []", "items = items + [1]", "items.append(1)", "items += [1]"], correct: 2, why: "<code>append</code> mutates the existing list without rebinding the name. The other three all reassign <code>items</code>, which requires <code>global</code>." },
    { level: "medium", q: "When is a global name looked up — at define time or call time?", options: ["When the function is defined", "When Python starts", "Only once, cached forever", "When the function is called"], correct: 3, why: "Globals are resolved when the function runs, so a name defined later in the file is still found — as long as it exists by the time the call happens." },
    // Hard
    { level: "hard", q: "<code>print(count)</code> then <code>count += 1</code> in a function, with a global <code>count</code>. What happens on the print line?", options: ["Prints the global count", "UnboundLocalError", "Prints 0", "SyntaxError"], correct: 1, why: "The <code>count += 1</code> below marks <code>count</code> local for the whole function, so the print reads a local that has no value yet. The global is never consulted." },
    { level: "hard", q: "What does <code>nonlocal</code> do that <code>global</code> does not?", options: ["Nothing — they are aliases", "Rebinds a variable in the ENCLOSING function, not module scope", "Makes a variable read-only", "Creates a new global"], correct: 1, why: "<code>nonlocal</code> targets the nearest enclosing function's variable — the usual case is a closure whose inner function updates a counter held by the outer one." },
    { level: "hard", q: "Why is editing globals from inside functions discouraged?", options: ["It is slower", "Python forbids it", "It only works once", "It hides state, making functions hard to test and reason about"], correct: 3, why: "A function that depends on and edits hidden module state is unpredictable and hard to test. Passing values in as arguments and returning results keeps everything a function touches visible." },
  ],

  "lambda": [
    // Easy
    { level: "easy", q: "What is <code>lambda x: x * 2</code>?", options: ["A one-line anonymous function", "A loop over x", "A variable named lambda", "A type of list"], correct: 0, why: "It is a function with no name, holding a single expression. <code>(lambda x: x*2)(5)</code> gives 10, exactly like a <code>def</code> would." },
    { level: "easy", q: "Why does a lambda have no <code>return</code> keyword?", options: ["return is optional everywhere", "The expression is the return value", "It never returns anything", "return is spelled differently"], correct: 1, why: "A lambda's body is one expression, and that expression's value is returned automatically — writing <code>return</code> inside is a SyntaxError." },
    { level: "easy", q: "Which higher-order function KEEPS only some elements based on a test?", options: ["map", "sorted", "filter", "reduce"], correct: 2, why: "<code>filter</code> keeps an element only where the lambda returns True. <code>map</code> transforms every element; <code>sorted</code> reorders them." },
    // Medium
    { level: "medium", q: "What does <code>list(map(lambda x: x * x, [1, 2, 3]))</code> return?", options: ["[1, 2, 3]", "6", "[2, 4, 6]", "[1, 4, 9]"], correct: 3, why: "<code>map</code> replaces every element with the lambda's result, so each is squared: 1, 4, 9." },
    { level: "medium", q: "<code>print(map(lambda x: x, nums))</code> shows <code>&lt;map object at 0x…&gt;</code>. Why?", options: ["map is broken", "map returns a lazy object you must wrap in list()", "nums is empty", "The lambda is wrong"], correct: 1, why: "<code>map</code> and <code>filter</code> return lazy iterators, not lists. Consume them with <code>list()</code> to see the values." },
    { level: "medium", q: "What does <code>key</code> do in <code>sorted(words, key=lambda w: len(w))</code>?", options: ["Removes duplicates", "Reverses the list", "Filters short words", "Computes the value each element is sorted by"], correct: 3, why: "The key function runs once per element to produce a sort value; the elements themselves are returned, just reordered — here, by length." },
    { level: "medium", q: "When should you use <code>def</code> instead of a lambda?", options: ["When the body needs a statement, an if, or multiple lines", "When the function takes two arguments", "When you use it with map", "Whenever it returns a number"], correct: 0, why: "A lambda holds a single expression. The moment you need an <code>if</code> statement, a loop, or a second line, it will not parse — that is <code>def</code>'s job." },
    // Hard
    { level: "hard", q: "<code>funcs = [lambda: i for i in range(3)]</code>, then <code>[f() for f in funcs]</code>. What is printed?", options: ["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "[0, 0, 0]"], correct: 1, why: "Late binding: all three lambdas share the one variable <code>i</code>, which holds its final value 2 by the time they are called. Bind it with <code>lambda i=i: i</code> to get [0, 1, 2]." },
    { level: "hard", q: "How do you sort <code>[('Aarav',91),('Diya',91),('Kabir',80)]</code> by marks high-to-low, then name A-Z?", options: ["key=lambda p: p[1]", "key=lambda p: (p[0], p[1])", "key=lambda p: (-p[1], p[0])", "reverse=True"], correct: 2, why: "A tuple key sorts by each field in turn. <code>-p[1]</code> puts high marks first, and <code>p[0]</code> breaks ties by name ascending." },
    { level: "hard", q: "Why does <code>lambda i=i: i</code> fix the loop-closure bug?", options: ["Default arguments are evaluated when the lambda is defined", "It renames the variable", "It makes i global", "It runs the lambda immediately"], correct: 0, why: "A default argument is evaluated at definition time, so each lambda snapshots the current value of <code>i</code> into its own parameter instead of sharing the loop variable." },
  ],

  "string-formatting": [
    // Easy
    { level: "easy", q: "<code>name = \"Aarav\"</code>, then <code>print(\"Hello {name}\")</code>. What appears?", options: ["Hello Aarav", "A SyntaxError", "Hello {name}", "Hello"], correct: 2, why: "Without the <code>f</code> prefix the braces are ordinary characters, so they print literally. Nothing errors, which is exactly what makes this bug slow to find." },
    { level: "easy", q: "Which prints a price with exactly two decimal places?", options: ["f\"{price:2f}\"", "f\"{price:.2f}\"", "f\"{price:2}\"", "f\"{price:0.2}\""], correct: 1, why: "The dot is what marks precision, and <code>f</code> means fixed-point. Without the dot, 2 is read as a width instead." },
    { level: "easy", q: "What can you put inside the braces of an f-string?", options: ["Only a variable name", "Only strings and numbers", "Nothing that calls a function", "Any expression that produces a value"], correct: 3, why: "Arithmetic, method calls, indexing, comparisons — anything evaluating to a value works, so <code>f\"{100 - marks}\"</code> is fine." },
    // Medium
    { level: "medium", q: "<code>rate = 0.8756</code>. What does <code>f\"{rate:.1%}\"</code> give?", options: ["0.9%", "87.6%", "8756.0%", "0.8756%"], correct: 1, why: "The <code>%</code> type multiplies by 100 itself and appends the sign, then <code>.1</code> rounds to one decimal." },
    { level: "medium", q: "What does the <code>&gt;</code> in <code>f\"{n:&gt;8}\"</code> do?", options: ["Compares n with 8", "Truncates n to 8 characters", "Pads to width 8, value pushed right", "Prints 8 spaces after n"], correct: 2, why: "It is an alignment, not a comparison: pad the value to 8 characters wide and sit it against the right edge, which is how number columns line up." },
    { level: "medium", q: "Does <code>f\"{price:.2f}\"</code> change the value stored in <code>price</code>?", options: ["No — it only builds a new string", "Yes, it rounds price in place", "Only if price is a float", "Only inside a loop"], correct: 0, why: "Formatting produces a separate string for display. The original number is untouched, which is why a total can print as 99.95 while <code>total == 99.95</code> is still False." },
    { level: "medium", q: "Which format spec is the usual one for money?", options: ["{v:.2}", "{v:money}", "{v:0.2d}", "{v:,.2f}"], correct: 3, why: "The comma groups thousands and <code>.2f</code> fixes two decimals — together they give 1,234.57." },
    // Hard
    { level: "hard", q: "<code>discount = 0.2</code>. What does <code>f\"{discount * 100:.1%}\"</code> print?", options: ["20.0%", "0.2%", "2000.0%", "2.0%"], correct: 2, why: "Double conversion: your <code>* 100</code> makes it 20, and the <code>%</code> spec multiplies by 100 again. Drop one of the two — <code>f\"{discount:.1%}\"</code> is correct." },
    { level: "hard", q: "What does <code>f\"{marks=}\"</code> print when <code>marks</code> is 91?", options: ["91", "marks", "True", "marks=91"], correct: 3, why: "The <code>=</code> spec prints the expression text, an equals sign, then the value — a debugging shortcut that stops the label drifting out of step with the variable after a rename." },
    { level: "hard", q: "Why does <code>\"Hi \" + name + \" scored \" + 91</code> fail?", options: ["+ cannot join a string and an int", "name must be lowercase", "It needs an f prefix", "Too many + operators"], correct: 0, why: "Concatenation will not convert types for you, so joining a str and an int raises <code>TypeError</code>. An f-string converts each value as it inserts it, which is one of the reasons it is preferred." },
  ],

  "modules": [
    // Easy
    { level: "easy", q: "After <code>from math import sqrt</code>, what does <code>math.sqrt(16)</code> do?", options: ["Returns 4.0", "Raises NameError, because math was never bound", "Returns 4", "Returns None"], correct: 1, why: "The <code>from</code> form binds only <code>sqrt</code>. The name <code>math</code> is not in the file at all, so using it is a NameError — not a typo." },
    { level: "easy", q: "What does <code>import statistics as st</code> put in your file?", options: ["Both statistics and st", "Only statistics", "Every function inside statistics", "Only st"], correct: 3, why: "The <code>as</code> form binds the nickname and nothing else — after it, <code>statistics</code> itself is undefined." },
    { level: "easy", q: "What is a Python module?", options: ["A Python file whose names you can import", "A special file type only Python's authors can write", "A compiled binary", "A folder of scripts"], correct: 0, why: "There is nothing special about it — any <code>.py</code> file you write is a module, and importing it just runs that file and hands you its names." },
    // Medium
    { level: "medium", q: "What does <code>if __name__ == \"__main__\":</code> protect against?", options: ["Syntax errors in the module", "Importing the same module twice", "Code running every time the file is imported", "Circular imports"], correct: 2, why: "<code>__name__</code> is <code>\"__main__\"</code> only when the file is the one being run. Without the guard, demo prints and test calls fire on every import." },
    { level: "medium", q: "You save a file as <code>random.py</code>. Another script in that folder runs <code>import random</code>. What happens?", options: ["Python prefers the standard library", "Python imports YOUR file, because your folder is searched first", "Python raises ImportError", "Python merges both"], correct: 1, why: "The running script's own folder sits at the front of <code>sys.path</code>, so your file wins and everything expecting the real module fails with confusing AttributeErrors." },
    { level: "medium", q: "How many times does Python run a module's code if three different files import it?", options: ["Three times", "Zero times", "Once per function called", "Once"], correct: 3, why: "The first import executes the file and caches the result in <code>sys.modules</code>; later imports reuse it without re-running." },
    { level: "medium", q: "Which command records the exact package versions a project needs?", options: ["pip list --all", "python -m venv .venv", "pip freeze > requirements.txt", "pip install --record"], correct: 2, why: "<code>pip freeze</code> writes each installed package with its pinned version, which is what lets a teammate or a server reproduce your environment." },
    // Hard
    { level: "hard", q: "After <code>from math import *</code>, why does <code>pow(2, 3)</code> return <code>8.0</code> instead of <code>8</code>?", options: ["Python 3 changed pow to return floats", "The star import replaced the builtin pow with math.pow", "Because 2 and 3 are being coerced to floats", "It is a bug in math"], correct: 1, why: "The star import binds all 61 of math's public names, and exactly one — <code>pow</code> — collides with a builtin. <code>math.pow</code> always returns a float, so a whole-number count silently becomes a float." },
    { level: "hard", q: "You renamed your stray <code>random.py</code>, but the broken import persists. Why?", options: ["Python caches imports for 24 hours", "The rename needs a restart of the OS", "requirements.txt still lists it", "A stale random.pyc is left in __pycache__"], correct: 3, why: "Python caches compiled bytecode next to the source. Deleting the <code>__pycache__</code> entry as well as the <code>.py</code> is what actually clears it." },
    { level: "hard", q: "Why use a virtual environment instead of installing everything globally?", options: ["It makes pip install faster", "It compiles packages to machine code", "Projects need conflicting versions, and a venv isolates them", "It is required by PyPI"], correct: 2, why: "Two projects often need different versions of the same library. Without isolation, upgrading for one silently breaks the other, and nothing records which versions ever worked." },
  ],

  "file-handling": [
    // Easy
    { level: "easy", q: "Which mode <b>adds</b> to a file without destroying what is already in it?", options: ["a", "w", "r", "x"], correct: 0, why: "<code>\"a\"</code> is append — it opens with the cursor at the end and leaves the existing contents alone. <code>\"w\"</code> would empty the file first." },
    { level: "easy", q: "What does <code>open(\"notes.txt\")</code> with no mode given do?", options: ["Opens it for reading", "Opens it for writing", "Creates an empty file", "Raises an error — a mode is required"], correct: 0, why: "The default mode is <code>\"r\"</code>, read. That is a deliberately safe default: the one thing it cannot do is damage the file." },
    { level: "easy", q: "Why is <code>with open(...) as f:</code> preferred over calling <code>open()</code> yourself?", options: ["It runs faster", "It makes the file readable", "It is the only way to write files", "It closes the file even if the code inside crashes"], correct: 3, why: "<code>with</code> guarantees the handle is closed on the way out, including when an exception is raised. A manual <code>close()</code> gets skipped by any error above it, and buffered writes are then never flushed to disk." },
    // Medium
    { level: "medium", q: "<code>open(\"data.csv\", \"w\")</code> runs, and then the script crashes on the very next line. What happened to data.csv?", options: ["Nothing — nothing was written", "It is unchanged until close() is called", "It is empty; opening in w truncated it immediately", "Python rolls the change back"], correct: 2, why: "<code>\"w\"</code> truncates the file <b>as it opens</b>, not when you write. The crash is irrelevant — the data was already gone." },
    { level: "medium", q: "You call <code>f.read()</code> twice on the same open handle. What does the second call return?", options: ["The file contents again", "An empty string", "None", "An error"], correct: 1, why: "The first <code>read()</code> moved the cursor to the end of the file, and <code>read()</code> only returns what is ahead of the cursor. Use <code>f.seek(0)</code> to rewind, or just reopen the file." },
    { level: "medium", q: "A log function opens with <code>\"w\"</code> on every call. After three calls, what is in the file?", options: ["All three messages", "Only the last message", "Only the first message", "Nothing"], correct: 1, why: "Each call empties the file before writing its own line, so only the last one survives. Nothing errors — the history is simply lost. Open once in <code>\"w\"</code> at startup, then use <code>\"a\"</code>." },
    { level: "medium", q: "Which is the right way to process a 4 GB CSV line by line?", options: ["for line in f:", "for line in f.readlines():", "for line in f.read():", "for line in f.read().split()"], correct: 0, why: "Iterating the handle reads one line at a time and keeps memory flat. <code>readlines()</code> and <code>read()</code> both build the entire file in memory first, and on 4 GB the process is killed before the loop starts." },
    // Hard
    { level: "hard", q: "A file holds <code>alpha</code> and <code>beta</code>. You open it in <code>\"a\"</code> and write <code>gamma</code>. Where does gamma land?", options: ["At the start, pushing the others down", "At the end, after beta", "It replaces beta", "It replaces the whole file"], correct: 1, why: "Append mode parks the cursor at the end of the file when it opens, so every write goes after what is already there. That is the entire difference between <code>\"a\"</code> and <code>\"w\"</code>." },
    { level: "hard", q: "What does mode <code>\"x\"</code> do when the file already exists?", options: ["Overwrites it", "Appends to it", "Raises FileExistsError", "Creates a numbered copy"], correct: 2, why: "<code>\"x\"</code> is exclusive creation — it makes a new file or fails loudly. Use it when a silent overwrite would destroy something you cannot get back, so a name collision becomes a visible error instead of lost data." },
    { level: "hard", q: "<code>with open(\"data.csv\", \"w\") as f:</code> then <code>rows = f.read()</code>. What goes wrong?", options: ["Only the read fails; the file is fine", "It works — w allows reading", "It returns an empty string harmlessly", "The file was already emptied, and the read fails too"], correct: 3, why: "Both things go wrong, and the order matters. <code>\"w\"</code> destroyed the file on open, and <b>then</b> the read raised <code>io.UnsupportedOperation</code> because a write-mode handle is not readable. The error you see is the harmless half; the damage already happened." },
  ],
};

// A lesson's content plus its quiz block (if any), so a quiz lives in one map
// entry instead of being pasted into each lesson array. Skips adding when the
// lesson already carries an inline quiz.
export function lessonContent(l) {
  const q = QUIZZES[l.slug];
  return q && !l.content.some((b) => b.t === "quiz")
    ? [...l.content, { t: "quiz", items: q }]
    : l.content;
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
