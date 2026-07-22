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
  hintsJson: JSON.stringify(hints), xp: 20,
});

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
  { t: "objectives", items: ["Index aur slicing se string ke tukde nikaalna","<code>upper / lower / strip / replace</code> jaise methods","<code>split</code> aur <code>join</code>","Strings <b>immutable</b> kyun hain"] },
  { t: "hook", q: "Ek file me 5000 logon ke naam aaye — kisi me aage-peeche extra space, koi <code>ALL CAPS</code>, koi <code>small</code>. Kya tum 5000 naam haath se theek karoge?", why: "Kabhi nahi. Ye kaam computer <b>strings</b> pe ek line me karta hai — aur data science me raw data hamesha aisa hi <b>ganda</b> aata hai. String cleaning analyst ka rozana kaam #1 hai." },
  { t: "def", term: "String", en: "A string is an immutable, ordered sequence of characters.", hi: "Matlab: letters ki ek <b>line</b>, jiske har character ki ek fixed <b>jagah (index)</b> hai — aur jo ban-ne ke baad <b>badalti nahi</b> (immutable). Koi bhi change hamesha ek <b>naya</b> string banata hai." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> raw data — naam, dates, categories, address, CSV ke fields — sab text hota hai, aur ganda aata hai. <code>strip()</code>, <code>lower()</code>, <code>replace()</code>, <code>split()</code> — yehi analyst har din use karta hai. Ye lesson seedha job ka daily skill hai." },
  { t: "h2", n: "1", text: "Index — har letter ki position" },
  { t: "p", html: "String ek <b>sequence</b> hai. Har letter ka ek <b>index</b> — aage se <code>0, 1, 2…</code>, peeche se <code>-1, -2…</code>. <code>s[0]</code> pehla letter, <code>s[-1]</code> aakhri." },
  { t: "code", file: "index.py", code: "s = \"DATA\"\nprint(s[0])    # D  (pehla)\nprint(s[-1])   # A  (aakhri)", output: "D\nA" },
  { t: "h2", n: "2", text: "Slicing — tukda nikaalo" },
  { t: "p", html: "<code>s[start:stop:step]</code> se tukda milta hai. Rule (yaad rakho): <b>start included, stop excluded</b>. <code>step</code> optional — <code>2</code> matlab ek chhod ke, <code>-1</code> matlab ulta. Neeche khud khel ke dekho 👇" },
  { t: "viz", name: "string-slicer" },
  { t: "think", q: "<code>s[::-1]</code> kya karega?", a: "<b>Poori string ulti (reverse)</b> kar dega — step <code>-1</code> peeche se chalta hai. Yehi Python ka sabse chhota reverse trick hai, aur <b>palindrome check</b> me kaam aata hai: <code>s == s[::-1]</code>." },
  { t: "h2", n: "3", text: "Kaam ke string methods" },
  { t: "p", html: "<code>.strip()</code> aage-peeche ke space hatao, <code>.upper()</code> / <code>.lower()</code> case badlo, <code>.replace(a, b)</code> a ko b se badlo. Method chain bhi kar sakte ho." },
  { t: "code", file: "clean.py", code: "raw = \"  Freya THOMPSAN  \"\nclean = raw.strip().lower()\nprint(clean)                          # freya thompsan\nprint(\"09-08-2026\".replace(\"-\", \"/\"))  # 09/08/2026", output: "freya thompsan\n09/08/2026" },
  { t: "h2", n: "4", text: "split aur join" },
  { t: "p", html: "<code>.split(sep)</code> string ko ek <b>list</b> me todta hai; <code>sep.join(list)</code> ulta kaam — list ko wapas string banata hai. CSV-jaise data me rozana." },
  { t: "code", file: "split.py", code: "row = \"Freya,Chef,India\"\nparts = row.split(\",\")\nprint(parts)              # ['Freya', 'Chef', 'India']\nprint(\" | \".join(parts))  # Freya | Chef | India", output: "['Freya', 'Chef', 'India']\nFreya | Chef | India" },
  { t: "analogy", concept: "String", real: "Letter-dabbon ki train", html: "String = ek train 🚂 jiske har <b>dabbe</b> me ek letter, aur har dabbe ka ek <b>seat number</b> (index). <b>Slice</b> = kuch dabbe kaat ke alag train bana lena. <b>Immutable</b> = dabbe fix hain — tum badal nahi sakte, sirf ek <b>nayi</b> train bana sakte ho. Isiliye har string method <b>naya</b> string deta hai." },
  { t: "mistakes", items: [
    { bad: "name = \"  Freya  \"\nname.strip()\nprint(name)   # abhi bhi space!", why: "Strings <b>immutable</b> hain — <code>.strip()</code> string badalta nahi, <b>naya</b> string <b>return</b> karta hai. Return value pakadni padegi.", fix: "name = name.strip()\nprint(name)   # Freya" },
    { bad: "s = \"DATA\"\nprint(s[1:4])   # 3 chahiye the?", why: "<code>[1:4]</code> deta hai index 1,2,3 — <b>4 nahi</b> (stop hamesha excluded). Ye off-by-one Python ki sabse aam galti hai.", fix: "print(s[1:4])   # ATA  (3 letters, sahi)" },
    { bad: "s = \"Hi\"\nprint(s[5])   # IndexError!", why: "Index range ke bahar gaye — <code>s[5]</code> exist nahi karta, crash. Par <b>slicing</b> range bahar jaane pe crash nahi karti.", fix: "print(s[5:])   # ''  (khaali, no error)" },
  ] },
  { t: "recap", items: ["<code>s[i]</code> index, <code>s[a:b:c]</code> slice — <b>start in, stop out</b>","<code>s[::-1]</code> = reverse","<code>strip / lower / upper / replace</code> — cleaning","<code>split</code> → list, <code>join</code> → string","strings <b>immutable</b> — method <b>naya</b> string deta hai"] },
  { t: "interview", items: [
    { level: "beginner", q: "Strings <b>immutable</b> hain — iska matlab?", a: "Ban-ne ke baad string badalti nahi. <code>.upper()</code>, <code>.replace()</code> — koi bhi change asli string ko nahi chhedta, hamesha ek <b>naya</b> string return karta hai. Isiliye <code>s = s.strip()</code> likhna padta hai." },
    { level: "beginner", q: "<code>s[::-1]</code> kya karta hai?", a: "String ko <b>ulta</b> (reverse) kar deta hai — step <code>-1</code> peeche se. Palindrome check ka classic tareeka: <code>s == s[::-1]</code>." },
    { level: "intermediate", q: "<code>replace()</code> aur <code>split()</code> kab use karoge?", a: "<code>replace(a,b)</code> jab kisi character/substring ko badalna ho (jaise <code>-</code> ko <code>/</code>). <code>split(sep)</code> jab ek string ko tukdon ki <b>list</b> me todna ho (CSV row → columns). split ke baad aksar <code>strip()</code> lagta hai kyunki tukdon me space reh jaata hai." },
  ] },
];

const L9 = [
  { t: "objectives", items: ["Loop ko ek line ki <b>comprehension</b> me badalna","<code>if</code> se filter karna","set/dict comprehension ka idea","Kab comprehension, kab normal loop"] },
  { t: "hook", q: "Tumhare paas 10,000 prices hain, sabpe 18% GST lagana hai — ek nayi list chahiye. Poora <code>for</code> + <code>append</code> likhoge, ya ek line me?", why: "Python me ye ek line ka kaam hai — <b>list comprehension</b>. Loop + append ka chhota, tez aur saaf roop — aur data transform karne ka sabse aam tareeka." },
  { t: "def", term: "List comprehension", en: "A concise expression that builds a new list by transforming and/or filtering the items of an iterable in a single line.", hi: "Ek line me nayi list banane ka tareeka — kisi list ke har item ko <b>transform</b> karo (expr), aur chaaho to <b>filter</b> karo (if). Formula: <code>[expr for x in list if cond]</code>." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> data transform rozana ka kaam hai — prices pe tax, naam clean karna, ek column se doosra banana, gande rows hatana. Comprehension yehi kaam chhote, padhne-layak code me karta hai. (Pandas me yehi soch <code>df</code> pe kaam aayegi.)" },
  { t: "h2", n: "1", text: "Basic — transform" },
  { t: "p", html: "<code>[expr for x in list]</code> — har item pe <code>expr</code> lagao, nayi list milegi." },
  { t: "code", file: "comp.py", code: "nums = [1, 2, 3, 4]\nsquares = [n * n for n in nums]\nprint(squares)   # [1, 4, 9, 16]", output: "[1, 4, 9, 16]" },
  { t: "h2", n: "2", text: "Filter — if ke saath" },
  { t: "p", html: "Aakhir me <code>if</code> laga ke sirf kuch items rakho: <code>[x for x in list if cond]</code>. Pehle filter, phir transform." },
  { t: "code", file: "compif.py", code: "nums = [1, 2, 3, 4, 5, 6]\nevens_sq = [x*x for x in nums if x % 2 == 0]\nprint(evens_sq)   # [4, 16, 36]", output: "[4, 16, 36]" },
  { t: "viz", name: "comprehension-builder" },
  { t: "think", q: "Har word ko UPPERCASE karke nayi list <code>out</code> banani hai (loop + append). Ek line ki comprehension me kaise?", a: "<code>out = [w.upper() for w in words]</code><br/><br/><code>append</code> waala expr aage, <code>for</code> waisa hi. Teen line ka kaam ek saaf line me." },
  { t: "note", variant: "tip", html: "<b>Bonus:</b> yehi soch set aur dict pe bhi — <code>{x for x in nums}</code> (set), <code>{k: v for k, v in pairs}</code> (dict). Bracket badla, idea wahi." },
  { t: "analogy", concept: "Comprehension", real: "Factory conveyor belt", html: "Socho ek conveyor belt 🏭: items ek taraf se aate hain. Pehle ek <b>gate (if)</b> — kuch nikal jaate hain. Jo bache, unpe ek <b>machine (expr)</b> kaam karti hai. Doosri taraf nayi list nikalti hai. <code>for</code> loop bhi yahi karta hai — comprehension bas usko ek line me likh deta hai." },
  { t: "mistakes", items: [
    { bad: "# 2 nested loop + 2 filter, sab ek line me\nres = [f(x) for x in a for y in b if p(x) if q(y)]", why: "Comprehension ka faayda <b>readability</b> hai. Itna thoos doge to woh khatam — koi (tum bhi) 2 mahine baad nahi samjhega. Complex ho to normal loop saaf hai.", fix: "res = []\nfor x in a:\n    for y in b:\n        if p(x) and q(y):\n            res.append(f(x))" },
    { bad: "# sirf print ke liye comprehension\n[print(x) for x in nums]", why: "Comprehension ka kaam <b>nayi list banana</b> hai. Sirf side-effect (print) ke liye chalाओge to ek bekaar <code>[None, None, …]</code> list bhi banegi. Iske liye seedha <code>for</code> loop.", fix: "for x in nums:\n    print(x)" },
  ] },
  { t: "recap", items: ["<code>[expr for x in list]</code> — transform","<code>[x for x in list if cond]</code> — filter + transform","<code>{}</code> se set/dict comprehension","nayi list <b>return</b> hoti hai, purani nahi badalti","complex ya side-effect ho to normal loop"] },
  { t: "interview", items: [
    { level: "beginner", q: "List comprehension kya hai, faayda kya?", a: "Ek line me list banane ka tareeka — <code>[expr for x in it if cond]</code>. Faayda: chhota, thoda tez (loop+append se), aur padhne me saaf — jab tak simple rahe." },
    { level: "beginner", q: "<code>if</code> comprehension me kahan lagta hai?", a: "<code>for</code> ke <b>baad</b>, filter ke liye: <code>[x for x in xs if x > 0]</code>. (Ek alag roop me <code>if/else</code> <code>for</code> se <b>pehle</b> bhi aa sakta hai — wo transform ke liye, filter ke liye nahi.)" },
    { level: "intermediate", q: "Comprehension kab NA use karein?", a: "Jab logic complex/nested ho (readability marr jaaye), ya sirf side-effect chahiye (print, DB write) — tab normal <code>for</code>. Rule: ek nazar me samajh na aaye to loop." },
  ] },
];

const L10 = [
  { t: "objectives", items: ["<b>class</b> (blueprint) aur <b>object</b> (instance) ka farak","<code>__init__</code> aur <code>self</code> kya karte hain","<b>method</b> — object ka apna function","OOP ki zaroorat kyun"] },
  { t: "hook", q: "Ek app me 100 dogs hain — har ek ka naam, breed, age. Kya tum <code>dog1_name</code>, <code>dog1_age</code>, <code>dog2_name</code>… 300 variables banaoge?", why: "Namumkin. Chahiye ek <b>saancha (blueprint)</b> jisme likha ho \"har dog me naam-breed-age hota hai aur bark karta hai\" — phir usse jitne chaaho dog bana lo. Yehi <b>class</b> hai." },
  { t: "def", term: "Class / Object", en: "A class is a blueprint that bundles data (attributes) and behaviour (methods); an object is a specific instance built from that blueprint.", hi: "<b>Class</b> = design/blueprint (jaise 'Dog' ka saancha). <b>Object</b> = us design se bani ek asli cheez (Bruno naam ka ek dog). Ek class se kai objects — har object ka apna data, par methods sab me common." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> tum jo bhi library use karoge — <code>DataFrame</code>, ek sklearn <code>model</code>, <code>model.fit()</code> / <code>model.predict()</code> — sab <b>objects</b> aur <b>methods</b> hain. OOP samajh gaye to har library apne aap samajh aane lagti hai." },
  { t: "h2", n: "1", text: "Class banao, object banao" },
  { t: "p", html: "<code>class</code> se blueprint likho. Phir <code>Dog(\"Bruno\")</code> jaise call se ek object bana lo — jitne chaaho." },
  { t: "code", file: "class.py", code: "class Dog:\n    def __init__(self, name, breed):\n        self.name = name      # is object ka data\n        self.breed = breed\n    def bark(self):\n        return self.name + \" says woof!\"\n\nd = Dog(\"Bruno\", \"Labrador\")\nprint(d.bark())   # Bruno says woof!", output: "Bruno says woof!" },
  { t: "viz", name: "object-inspector" },
  { t: "h2", n: "2", text: "__init__ aur self — dil ki baat" },
  { t: "p", html: "<code>__init__</code> tab <b>apne aap</b> chalta hai jab tum object banate ho — data set karne ke liye. <code>self</code> = <b>\"yehi object\"</b>. Python <code>self</code> khud bhejta hai; tum likhte ho par call karte waqt paste nahi karte: <code>d.bark()</code>, na ki <code>d.bark(d)</code>." },
  { t: "think", q: "<code>self.name</code> aur sirf <code>name</code> me kya farak hai?", a: "<code>name</code> = sirf ek local variable (function khatam, gaayab). <code>self.name</code> = <b>is object pe chipka</b> data — object jab tak zinda, ye data zinda. Isiliye <code>bark()</code> baad me bhi <code>self.name</code> padh paata hai." },
  { t: "analogy", concept: "Class vs Object", real: "Cookie-cutter vs cookie 🍪", html: "<b>Class</b> = cookie-cutter (saancha) — ek hi hai, khud khaane layak nahi. <b>Object</b> = usse kati asli cookies — jitni chaaho, har ek alag (koi chocolate, koi vanilla = alag data), par shape (methods) same. <code>self</code> = \"yeh waali cookie\", taaki har cookie apna flavour jaane." },
  { t: "mistakes", items: [
    { bad: "class Dog:\n    def bark():          # self bhool gaye\n        return \"woof\"\nDog().bark()             # TypeError", why: "Har method ka <b>pehla</b> parameter <code>self</code> hona chahiye — Python object ko wahin bhejta hai. Bina <code>self</code> ke woh confuse ho jaata hai.", fix: "class Dog:\n    def bark(self):\n        return \"woof\"" },
    { bad: "class Dog:\n    def __init__(self, name):\n        name = name        # self. bhool gaye", why: "<code>self.</code> ke bina <code>name</code> sirf ek local variable hai jo <code>__init__</code> khatam hote hi gaayab. Object me kuch save nahi hua.", fix: "def __init__(self, name):\n    self.name = name" },
  ] },
  { t: "recap", items: ["<b>class</b> = blueprint, <b>object</b> = usse bani cheez","<code>__init__</code> object banate waqt data set karta hai","<code>self</code> = \"yehi object\" — Python khud bhejta hai","<code>self.x</code> object pe data chipkata hai; <b>method</b> = class ke andar function"] },
  { t: "interview", items: [
    { level: "beginner", q: "class aur object me farak?", a: "<b>class</b> blueprint/design hai (ek), <b>object</b> us blueprint se bani asli cheez (kai ho sakti hain). Jaise 'Car' class, aur meri asli car ek object." },
    { level: "beginner", q: "<code>self</code> kya hai?", a: "Method ke andar \"yehi object\" ko refer karta hai — jis object pe method call hua. Python use <b>automatically</b> bhejta hai, isiliye pehla parameter <code>self</code> likhte hain par call me nahi dete." },
    { level: "intermediate", q: "<code>__init__</code> kab aur kyun chalta hai?", a: "Jab tum object banate ho (<code>Dog(\"Bruno\")</code>) tab <b>apne aap</b>. Iska kaam object ka shuruaati data (attributes) set karna — constructor. Tum ise seedha call nahi karte." },
  ] },
];

const L11 = [
  { t: "objectives", items: ["<code>try / except</code> se crash rokna","Specific errors pakadna (<code>ValueError</code> waghairah)","<code>else</code> aur <code>finally</code> ka kaam","<b>Bare except</b> kyun khatarnaak hai"] },
  { t: "hook", q: "Tumhare 50,000 rows ke data me ek row me age likhi hai <code>\"pachees\"</code> (number ki jagah shabd). <code>int(\"pachees\")</code> crash karega — kya poora analysis ek gande row ki wajah se ruk jaaye?", why: "Bilkul nahi. <b>try / except</b> se tum us ek row ko sambhal ke aage badh jaate ho — program zinda rehta hai. Real data <b>hamesha</b> ganda hota hai, isiliye ye skill roz kaam aati hai." },
  { t: "def", term: "Exception handling", en: "A mechanism to catch runtime errors so the program can respond gracefully instead of crashing.", hi: "Jo code fail ho sakta hai use <code>try</code> me rakho; agar error (exception) aaye to <code>except</code> use <b>pakad</b> leta hai aur program crash hone ke bajaye sambhal jaata hai." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> raw data me gande values, missing files, galat types — normal hai. <code>try/except</code> se ek kharab row/file poori pipeline nahi giraati; tum use skip/log karke aage badhte ho. Robust data code ki reedh ki haddi." },
  { t: "h2", n: "1", text: "try / except" },
  { t: "p", html: "Risky code <code>try</code> me, aur error aane pe kya karna hai <code>except</code> me. <b>Specific</b> error pakdo (jaise <code>ValueError</code>) — taaki sirf wahi galti sambhle jiski umeed hai." },
  { t: "code", file: "try.py", code: "try:\n    age = int(\"pachees\")\nexcept ValueError:\n    age = 0            # default, crash nahi\nprint(age)   # 0", output: "0" },
  { t: "h2", n: "2", text: "else aur finally" },
  { t: "p", html: "<code>else</code> tab chalta hai jab <b>koi error nahi</b> aaya. <code>finally</code> <b>hamesha</b> chalta hai — chahe error ho ya na ho (cleanup ke liye: file band karna waghairah). Neeche scenario badal ke dekho 👇" },
  { t: "viz", name: "exception-flow" },
  { t: "think", q: "<code>finally</code> block kab chalta hai?", a: "<b>Hamesha</b> — error aaye ya na aaye, <code>except</code> chale ya <code>else</code>, <code>finally</code> zaroor chalta hai. Isiliye usme cleanup rakhte hain (file close, connection band) — jo har haal me hona chahiye." },
  { t: "analogy", concept: "try / except", real: "Trapeze ke neeche jaal", html: "<code>try</code> = trapeze artist ka daring jump (risky code). <b>Jaal (except)</b> neeche laga hai — agar girre (error), jaal pakad leta hai, artist zinda. <code>finally</code> = show ke baad safai, jo hamesha hoti hai. Bina jaal ke ek galti = poora show (program) khatam." },
  { t: "mistakes", items: [
    { bad: "try:\n    risky()\nexcept:            # sab kuch pakad liya\n    pass", why: "<b>Bare except</b> (ya <code>except Exception</code> + <code>pass</code>) <b>har</b> error nigal jaata hai — tumhari asli bug (typo, galat naam) bhi chup-chaap chhup jaati hai. Debugging naamumkin ho jaati hai.", fix: "try:\n    risky()\nexcept ValueError as e:\n    print(\"skip:\", e)" },
    { bad: "# normal flow control ke liye exception\ntry:\n    return d[key]\nexcept KeyError:\n    return None", why: "Kaam to karta hai, par jab har baar key miss ho sakti ho to exception mehnga aur galat tareeka hai. Iske liye seedha tareeka hai.", fix: "return d.get(key)   # miss pe None, no exception" },
  ] },
  { t: "recap", items: ["<code>try</code> risky code, <code>except</code> error handle","<b>specific</b> error pakdo (<code>except ValueError</code>)","<code>else</code> = koi error nahi to chala","<code>finally</code> = <b>hamesha</b> (cleanup)","<b>bare except</b> mat karo — bugs chhup jaati hain"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>try/except</code> ka kaam?", a: "Risky code ko crash hone se bachana — error aaye to <code>except</code> use pakad ke sambhal leta hai, program aage chalta rehta hai." },
    { level: "beginner", q: "<code>else</code> aur <code>finally</code> me farak?", a: "<code>else</code> sirf tab jab koi error <b>na</b> aaye. <code>finally</code> <b>hamesha</b> — error ho ya na ho — cleanup ke liye." },
    { level: "intermediate", q: "<b>Bare <code>except:</code></b> kyun bura hai?", a: "Woh <b>har</b> exception pakad leta hai — <code>KeyboardInterrupt</code>, tumhari apni bug, sab. Asli galti chhup jaati hai aur debugging behad mushkil. Hamesha <b>specific</b> exception pakdo." },
  ] },
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
  { t: "objectives", items: ["<b>int</b> vs <b>float</b>, aur <code>/</code> vs <code>//</code> vs <code>%</code>","<code>**</code>, <code>round</code>, <code>abs</code>","<code>math</code> module","Float ki <b>precision</b> gotcha (money ka khatra)"] },
  { t: "hook", q: "Python se poochho: <code>0.1 + 0.2</code> kitna hai? Tumhe lagega <code>0.3</code>. Par Python bolta hai <code>0.30000000000000004</code> — kyun??", why: "Ye bug nahi — computer decimals ko <b>binary</b> me store karta hai, aur kuch decimals (jaise 0.1) binary me poore fit hi nahi hote. Isiliye <b>paison ka hisaab float se karna khatarnaak</b> hai." },
  { t: "def", term: "int vs float", en: "int is a whole number with unlimited size; float is a decimal number stored in limited binary precision.", hi: "<b>int</b> = poora number (<code>7</code>, <code>-100</code>), Python me kitna bhi bada. <b>float</b> = decimal (<code>3.14</code>), par <b>seemit precision</b> ke saath — isiliye kabhi-kabhi thoda-sa off hota hai." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> saara analysis numbers pe — averages, totals, percentages, growth. Do cheezein rozana: (1) <code>/</code> hamesha <b>float</b> deta hai, <code>//</code> <b>poora</b> (floor); (2) float precision — money/exact hisaab me <code>round()</code> lagao ya <code>Decimal</code> use karo, warna paise idhar-udhar." },
  { t: "h2", n: "1", text: "Division ki teen shaklein" },
  { t: "p", html: "<code>/</code> normal bhaag (<b>float</b> deta hai, hamesha). <code>//</code> <b>floor</b> division (neeche wala poora). <code>%</code> <b>remainder</b> (bacha hua). <code>**</code> power." },
  { t: "code", file: "div.py", code: "print(7 / 2)     # 3.5   (float)\nprint(7 // 2)    # 3     (poora, neeche)\nprint(7 % 2)     # 1     (remainder)\nprint(2 ** 5)    # 32    (power)", output: "3.5\n3\n1\n32" },
  { t: "h2", n: "2", text: "round, abs aur math" },
  { t: "p", html: "<code>round(x, n)</code> n decimal tak, <code>abs(x)</code> minus hataao. <code>import math</code> se <code>sqrt</code>, <code>ceil</code> (upar), <code>floor</code> (neeche), <code>pi</code>." },
  { t: "code", file: "math.py", code: "import math\nprint(round(3.567, 1))  # 3.6\nprint(abs(-7))          # 7\nprint(math.sqrt(16))    # 4.0\nprint(math.ceil(4.1))   # 5", output: "3.6\n7\n4.0\n5" },
  { t: "think", q: "<code>10 / 3</code> aur <code>10 // 3</code> — dono ka result kya hoga?", a: "<code>10 / 3</code> → <b>3.3333…</b> (float, poora bhaag). <code>10 // 3</code> → <b>3</b> (floor, neeche wala poora — decimal phenk deta hai). Yaad rakho: <code>/</code> hamesha float, <code>//</code> poora." },
  { t: "analogy", concept: "Float precision", real: "Decimal me 1/3", html: "Tum decimal me <code>1/3</code> likho to <code>0.3333…</code> — kabhi khatam nahi hota, isliye tum kahin round kar dete ho, thoda error aa jaata hai. Computer ke saath yahi hai par <b>binary</b> me — <code>0.1</code> jaise numbers binary me theek fit nahi hote, isliye halka-sa off. Bug nahi, ganit ki majboori." },
  { t: "mistakes", items: [
    { bad: "total = 0.1 + 0.2\nif total == 0.3:      # kabhi True nahi!\n    print(\"exact\")", why: "<code>0.1 + 0.2</code> == <code>0.30000000000000004</code>, to <code>== 0.3</code> <b>False</b> hai. Floats ko seedha <code>==</code> se compare mat karo.", fix: "if round(total, 2) == 0.3:\n    print(\"close enough\")" },
    { bad: "half = 7 / 2\nprint(items[half])    # TypeError", why: "<code>/</code> hamesha <b>float</b> deta hai (<code>3.5</code>), aur index int hona chahiye. Poora chahiye to <code>//</code>.", fix: "half = 7 // 2   # 3 (int)\nprint(items[half])" },
  ] },
  { t: "recap", items: ["<code>/</code> float, <code>//</code> poora (floor), <code>%</code> remainder, <code>**</code> power","<code>round</code>, <code>abs</code>, aur <code>math</code>: <code>sqrt/ceil/floor/pi</code>","float ki precision seemit — <code>==</code> se compare mat karo","paise/exact hisaab me <code>round()</code> ya <code>Decimal</code>"] },
  { t: "interview", items: [
    { level: "beginner", q: "<code>/</code> aur <code>//</code> me farak?", a: "<code>/</code> normal bhaag, hamesha <b>float</b> (<code>7/2 = 3.5</code>). <code>//</code> <b>floor</b> division — neeche wala poora number (<code>7//2 = 3</code>). Index/count ke liye <code>//</code>." },
    { level: "intermediate", q: "<code>0.1 + 0.2 == 0.3</code> False kyun?", a: "Floats binary me store hote hain aur <code>0.1</code>/<code>0.2</code> binary me poore represent nahi hote — halki si error rehti hai (<code>0.3000…04</code>). Isiliye floats ko <code>==</code> se nahi, <code>round()</code> ya <code>math.isclose()</code> se compare karo." },
    { level: "intermediate", q: "Paison ke liye float kyun nahi?", a: "Precision errors jud ke paise idhar-udhar kar dete hain. Money ke liye Python ka <code>decimal.Decimal</code> (exact decimal) ya integer paise (100 = ₹1) use karo." },
  ] },
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
  { t: "objectives", items: ["<code>True</code>/<code>False</code> aur comparisons","<code>and</code> / <code>or</code> / <code>not</code>","<b>Truthy</b> aur <b>Falsy</b> values","<code>== None</code> ki jagah <code>is None</code>"] },
  { t: "hook", q: "Code me likha hai <code>if my_list:</code> — bina <code>== something</code> ke. Iska kya matlab? Aur ek khaali list <code>[]</code> — woh <code>True</code> hai ya <code>False</code>?", why: "<code>if my_list:</code> ka matlab hai \"agar list <b>khaali nahi</b>\". Aur haan — khaali <code>[]</code> ko Python <b>False</b> maanta hai! Ye \"truthiness\" har condition ke peeche hai." },
  { t: "def", term: "Boolean", en: "A boolean is one of exactly two values, True or False, used to represent logic and drive conditions.", hi: "Sirf do value: <code>True</code> aur <code>False</code>. Har comparison (<code>&gt;</code>, <code>==</code>, <code>in</code>) ek boolean deta hai, aur <code>if</code>/<code>while</code> isi pe faisla lete hain." },
  { t: "note", variant: "key", html: "💼 <b>DS job me:</b> data filter karna = boolean soch. Pandas me <code>df[df.age &gt; 18]</code> — ye <code>df.age &gt; 18</code> ek poora <b>True/False</b> ka column banata hai (boolean mask), aur wahi rows chunta hai jahan True hai. Boolean pakka to filtering pakki." },
  { t: "h2", n: "1", text: "Comparison aur logic" },
  { t: "p", html: "Comparisons (<code>&gt; &lt; == != &gt;= &lt;=</code>) bool dete hain. Jodne ke liye <code>and</code> (dono sach), <code>or</code> (koi ek), <code>not</code> (ulta)." },
  { t: "code", file: "bool.py", code: "age = 20\nprint(age > 18 and age < 60)   # True\nprint(age < 13 or age > 60)    # False\nprint(not True)                # False", output: "True\nFalse\nFalse" },
  { t: "h2", n: "2", text: "Truthy aur Falsy" },
  { t: "p", html: "Sirf <code>True</code>/<code>False</code> hi nahi — <b>har</b> value ki ek \"truthiness\" hoti hai. <b>Falsy</b> (False jaisi): <code>0</code>, <code>0.0</code>, <code>\"\"</code>, <code>[]</code>, <code>{}</code>, <code>None</code>. Baaki <b>sab truthy</b>. Neeche khud check karo 👇" },
  { t: "viz", name: "truthiness-tester" },
  { t: "think", q: "<code>bool([])</code> kya dega — aur <code>bool([0])</code>?", a: "<code>bool([])</code> → <b>False</b> (khaali list falsy). Par <code>bool([0])</code> → <b>True</b>! List <b>khaali nahi</b> hai — usme ek item (0) hai. \"Khaali\" matter karta hai, andar kya hai wo nahi." },
  { t: "analogy", concept: "Boolean", real: "On/Off switch", html: "Boolean = ek switch 🔘 — sirf <b>ON (True)</b> ya <b>OFF (False)</b>, beech me kuch nahi. Truthiness ka matlab: Python har cheez ko dekh ke keh deta hai \"ye switch on maanein ya off\" — khaali/zero/None ko OFF, baaki sab ko ON." },
  { t: "mistakes", items: [
    { bad: "if is_ready == True:   # fizool\n    go()", why: "<code>is_ready</code> pehle se bool hai — <code>== True</code> lagana bekaar hai. Seedha <code>if is_ready:</code> saaf aur sahi hai.", fix: "if is_ready:\n    go()" },
    { bad: "if x == None:          # kaam karta, par galat style", why: "<code>None</code> ke liye <code>==</code> nahi, <code>is</code> use karo — <code>None</code> poore program me ek hi cheez hai (identity check), aur <code>is None</code> tez + sahi maana jaata hai.", fix: "if x is None:\n    ..." },
  ] },
  { t: "recap", items: ["<code>True</code>/<code>False</code> — comparisons se milte hain","<code>and</code> (dono), <code>or</code> (koi ek), <code>not</code> (ulta)","Falsy: <code>0, 0.0, \"\", [], {}, None</code> — baaki truthy","<code>if my_list:</code> = \"khaali nahi\"","<code>None</code> ke liye <code>is None</code>, <code>== None</code> nahi"] },
  { t: "interview", items: [
    { level: "beginner", q: "Truthy aur Falsy kya hai?", a: "Har value ko Python <code>if</code> me True ya False jaisa maanta hai. <b>Falsy</b>: <code>0, 0.0, \"\", [], {}, (), None, False</code>. Baaki <b>sab truthy</b> — jaise non-empty list/string, non-zero number." },
    { level: "beginner", q: "<code>and</code> aur <code>or</code> ka result kya hota hai?", a: "<code>and</code>: dono True to True. <code>or</code>: koi ek True to True. Dono <b>short-circuit</b> karte hain — <code>and</code> pehli False pe ruk jaata hai, <code>or</code> pehli True pe." },
    { level: "intermediate", q: "<code>== None</code> aur <code>is None</code> me farak?", a: "<code>is None</code> <b>identity</b> check karta hai (None poore program me ek hi object) — sahi aur tez tareeka. <code>==</code> value compare karta hai aur custom objects me galat bhi ho sakta hai. None ke liye hamesha <code>is</code>." },
  ] },
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
  { slug: "getting-started", order: 1, title: "Meet Python — Your First Program", minutes: 14, content: L0, problems: [] },
  { slug: "variables-data-types", order: 2, title: "Variables & Data Types", minutes: 18, content: L1, problems: [
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

  { slug: "operators", order: 3, title: "Operators & Expressions", minutes: 10, content: L2, problems: [
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

  { slug: "conditionals", order: 4, title: "Conditionals (if / else)", minutes: 11, content: L3, problems: [
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

  { slug: "loops", order: 5, title: "Loops (for / while)", minutes: 12, content: L4, problems: [
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

  { slug: "lists-tuples", order: 6, title: "Lists & Tuples", minutes: 13, content: L5, problems: [
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

  { slug: "dicts-sets", order: 7, title: "Dictionaries & Sets", minutes: 12, content: L6, problems: [
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

  { slug: "functions", order: 8, title: "Functions", minutes: 14, content: L7, problems: [
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

  { slug: "strings", order: 9, title: "String Methods & Slicing", minutes: 12, content: L8, problems: [
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

  { slug: "comprehensions", order: 10, title: "List Comprehensions", minutes: 11, content: L9, problems: [
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

  { slug: "oop", order: 11, title: "Classes & Objects (OOP)", minutes: 15, content: L10, problems: [
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

  { slug: "error-handling", order: 12, title: "Error Handling (try / except)", minutes: 11, content: L11, problems: [
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

  { slug: "file-handling", order: 13, title: "File Handling", minutes: 9, content: L12, problems: [] },

  { slug: "modules", order: 14, title: "Modules, pip & venv", minutes: 9, content: L13, problems: [] },

  { slug: "numbers-math", order: 15, title: "Numbers & the Math Module", minutes: 11, content: L14, problems: [
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

  { slug: "string-formatting", order: 16, title: "String Formatting & f-strings", minutes: 11, content: L15, problems: [
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

  { slug: "booleans", order: 17, title: "Booleans & Truthiness", minutes: 10, content: L16, problems: [
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

  { slug: "lambda", order: 18, title: "Lambda Functions", minutes: 11, content: L17, problems: [
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

  { slug: "scope", order: 19, title: "Variable Scope", minutes: 9, content: L18, problems: [] },

  { slug: "json", order: 20, title: "Working with JSON", minutes: 11, content: L19, problems: [
    P(1, "get-json-field", "Read a JSON Field", "get_json_field",
      "Ek function `get_json_field(text, key)` banao jo JSON string me se `key` ki value return kare.",
      [{ input: 'text=\'{"name":"Freya","age":21}\', key="age"', output: "21" }],
      "import json\n\ndef get_json_field(text, key):\n    pass\n", "import json\n\ndef get_json_field(text, key):\n    data = json.loads(text)\n    return data[key]\n",
      [{ args: ['{"name":"Freya","age":21}', "age"], expected: 21 }, { args: ['{"city":"Delhi"}', "city"], expected: "Delhi" }],
      ["json.loads(text) se string -> dict.", "Phir data[key]."], ["json"]) ]},

  { slug: "dates", order: 21, title: "Dates & Time", minutes: 9, content: L20, problems: [] },

  { slug: "more-operators", order: 22, title: "More Operators (Membership, Identity, Bitwise)", minutes: 10, content: L21, problems: [
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

  { slug: "match-case", order: 23, title: "Match-Case Statement", minutes: 9, content: L22, problems: [
    P(1, "day-type", "Weekend or Weekday", "day_type",
      "Ek function `day_type(day)` banao jo `\"weekend\"` return kare agar day `\"Sat\"` ya `\"Sun\"` hai, warna `\"weekday\"`. match-case use karo.",
      [{ input: 'day="Sat"', output: '"weekend"' }, { input: 'day="Mon"', output: '"weekday"' }],
      "def day_type(day):\n    pass\n", 'def day_type(day):\n    match day:\n        case "Sat" | "Sun":\n            return "weekend"\n        case _:\n            return "weekday"\n',
      [{ args: ["Sat"], expected: "weekend" }, { args: ["Sun"], expected: "weekend" }, { args: ["Mon"], expected: "weekday" }],
      ['case "Sat" | "Sun": weekend.', "case _: default (weekday)."], ["match"]) ]},

  { slug: "advanced-functions", order: 24, title: "Advanced Functions (*args, recursion)", minutes: 13, content: L23, problems: [
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

  { slug: "inheritance", order: 25, title: "OOP: Inheritance", minutes: 13, content: L24, problems: [
    P(1, "cat-speak", "Inherit & Override", "cat_speak",
      "`Cat` class `Animal` se inherit karti hai. `speak()` ko override karo taaki wo `<name> says meow` return kare.",
      [{ input: 'name="Kitty"', output: '"Kitty says meow"' }],
      "class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"some sound\"\n\nclass Cat(Animal):\n    def speak(self):\n        # return name + \" says meow\"\n        pass\n\ndef cat_speak(name):\n    return Cat(name).speak()\n",
      'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "some sound"\n\nclass Cat(Animal):\n    def speak(self):\n        return self.name + " says meow"\n\ndef cat_speak(name):\n    return Cat(name).speak()\n',
      [{ args: ["Kitty"], expected: "Kitty says meow" }, { args: ["Tom"], expected: "Tom says meow" }],
      ["self.name Animal se inherit hua hai.", 'return self.name + " says meow"'], ["oop","inheritance"]) ]},

  { slug: "encapsulation", order: 26, title: "OOP: Encapsulation & Polymorphism", minutes: 12, content: L25, problems: [
    P(1, "final-balance", "Bank Account (Encapsulation)", "final_balance",
      "`Account` class me `deposit()` method poora karo (private `__balance` me amount jodo). `final_balance(deposits)` saare deposits ke baad balance deta hai.",
      [{ input: "deposits=[100,50,25]", output: "175" }],
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        # self.__balance me amt jodo\n        pass\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amt):\n        self.__balance += amt\n    def balance(self):\n        return self.__balance\n\ndef final_balance(deposits):\n    a = Account()\n    for d in deposits:\n        a.deposit(d)\n    return a.balance()\n",
      [{ args: [[100,50,25]], expected: 175 }, { args: [[10]], expected: 10 }, { args: [[]], expected: 0 }],
      ["self.__balance += amt.", "Private variable methods se hi badalta hai."], ["oop","encapsulation"]) ]},

  { slug: "dunder-methods", order: 27, title: "OOP: Static & Dunder Methods", minutes: 12, content: L26, problems: [
    P(1, "team-size", "Team Size (__len__)", "team_size",
      "`Team` class ka `__len__` method poora karo taaki `len(team)` members ki ginti de. `team_size(members)` use call karta hai.",
      [{ input: 'members=["a","b","c"]', output: "3" }],
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        # members ki ginti return karo\n        pass\n\ndef team_size(members):\n    return len(Team(members))\n",
      "class Team:\n    def __init__(self, members):\n        self.members = members\n    def __len__(self):\n        return len(self.members)\n\ndef team_size(members):\n    return len(Team(members))\n",
      [{ args: [["a","b","c"]], expected: 3 }, { args: [[]], expected: 0 }, { args: [["x"]], expected: 1 }],
      ["__len__ me return len(self.members).", "len(obj) automatically __len__ call karta hai."], ["oop","dunder"]) ]},

  { slug: "iterators-generators", order: 28, title: "Iterators & Generators", minutes: 13, content: L27, problems: [
    P(1, "first-squares", "Generator: First Squares", "first_squares",
      "Ek generator `gen_squares(n)` complete karo jo 1² se n² tak yield kare. `first_squares(n)` unki list deta hai.",
      [{ input: "n=3", output: "[1, 4, 9]" }, { input: "n=4", output: "[1, 4, 9, 16]" }],
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        # i ka square yield karo\n        pass\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      "def gen_squares(n):\n    for i in range(1, n + 1):\n        yield i * i\n\ndef first_squares(n):\n    return list(gen_squares(n))\n",
      [{ args: [3], expected: [1,4,9] }, { args: [1], expected: [1] }, { args: [4], expected: [1,4,9,16] }],
      ["yield i * i loop ke andar.", "yield ek-ek value deta hai."], ["generators"]) ]},

  { slug: "decorators", order: 29, title: "Decorators & Closures", minutes: 12, content: L28, problems: [] },

  { slug: "regex", order: 30, title: "Regular Expressions (RegEx)", minutes: 12, content: L29, problems: [
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

  { slug: "concurrency", order: 31, title: "Concurrency — Threads & Processes", minutes: 11, content: L30, problems: [] },
  { slug: "async", order: 32, title: "Async Programming (asyncio)", minutes: 11, content: L31, problems: [] },

  { slug: "collections-itertools", order: 33, title: "collections, itertools & functools", minutes: 13, content: L32, problems: [
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

  { slug: "system-modules", order: 34, title: "System Modules — os, sys, pathlib", minutes: 10, content: L33, problems: [] },
  { slug: "data-persistence", order: 35, title: "CSV, Pickle & SQLite", minutes: 11, content: L34, problems: [] },
  { slug: "testing", order: 36, title: "Testing — unittest & pytest", minutes: 11, content: L35, problems: [] },
  { slug: "debugging-logging", order: 37, title: "Debugging & Logging", minutes: 10, content: L36, problems: [] },

  { slug: "clean-code", order: 38, title: "Clean Code — PEP 8, Docstrings, Type Hints", minutes: 11, content: L37, problems: [
    P(1, "repeat-text", "Repeat with Type Hints", "repeat",
      "Ek function `repeat(text, n)` banao (type hints ke saath) jo `text` ko `n` baar repeat kare.",
      [{ input: 'text="ab", n=3', output: '"ababab"' }, { input: 'text="x", n=0', output: '""' }],
      "def repeat(text: str, n: int) -> str:\n    pass\n", "def repeat(text: str, n: int) -> str:\n    return text * n\n",
      [{ args: ["ab", 3], expected: "ababab" }, { args: ["x", 0], expected: "" }, { args: ["hi", 2], expected: "hihi" }],
      ["String ko number se multiply kar sakte ho: text * n.", 'text="x", n=0 pe khaali string.'], ["clean-code"]) ]},

  { slug: "project-git", order: 39, title: "Project Structure & Git Basics", minutes: 10, content: L38, problems: [] },
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
  "getting-started": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which line prints the word <b>Hello</b> on screen?", options: ["print(Hello)", "print(\"Hello\")", "Print(\"Hello\")", "say(\"Hello\")"], correct: 1, why: "Text needs quotes, and the instruction is lowercase <code>print</code>. Without quotes Python looks for something you stored called <code>Hello</code>." },
    { level: "easy", q: "In what order does Python run the lines of your file?", options: ["Top to bottom, one at a time", "All at once", "Bottom to top", "Whatever order is fastest"], correct: 0, why: "Top to bottom, finishing each line before starting the next. Most beginner bugs come from forgetting this." },
    { level: "easy", q: "What does Python do with a line starting with <code>#</code>?", options: ["Prints it", "Ignores it completely", "Treats it as an error", "Runs it twice"], correct: 1, why: "It is a comment — a note for humans. Python skips it entirely." },
    // Medium — apply it
    { level: "medium", q: "<code>marks = 90</code> is the whole program. What appears on screen?", options: ["90", "marks = 90", "Nothing", "An error"], correct: 2, why: "Storing is <b>silent</b>. Without a <code>print()</code>, a working program can look like it did nothing at all." },
    { level: "medium", q: "<code>print(\"Total:\", 90)</code> — what exactly is printed?", options: ["Total:90", "Total: 90", "\"Total:\" 90", "Total:, 90"], correct: 1, why: "A comma inside <code>print()</code> prints each piece with a <b>single space</b> between them." },
    { level: "medium", q: "<code>x = 5</code>, then <code>x = x + 3</code>, then <code>print(x)</code>. What prints?", options: ["5", "8", "53", "x + 3"], correct: 1, why: "The right side is worked out first (5 + 3), and 8 goes back under the same name." },
    { level: "medium", q: "A person types <code>7</code> at <code>age = input()</code>. What is in <code>age</code>?", options: ["the number 7", "the text \"7\"", "nothing", "an error"], correct: 1, why: "<code>input()</code> <b>always</b> hands back text, even when it looks like a number. This is the single most common beginner bug." },
    // Hard — edge cases and bugs; not written in the lesson
    { level: "hard", q: "<code>print(\"Total:\", 90)</code> vs <code>print(\"Total:\" + 90)</code> — what happens with the second one?", options: ["Same output", "Total:90", "TypeError", "Total: 90"], correct: 2, why: "A comma prints things side by side whatever their type. A <code>+</code> means <i>join</i>, and you cannot join text to a number — <code>TypeError</code>. Same-looking line, completely different rule." },
    { level: "hard", q: "<code>x = print(\"hi\")</code>. What ends up inside <code>x</code>?", options: ["\"hi\"", "None", "an error", "an empty string"], correct: 1, why: "<code>print()</code> puts text on screen and <b>returns <code>None</code></b>. Showing something and handing something back are different actions — a distinction that catches people well past their first week." },
    { level: "hard", q: "A file has <code>print(total)</code> on line 1 and <code>total = 5</code> on line 2. What happens?", options: ["Prints 5", "Prints nothing", "NameError", "Prints None"], correct: 2, why: "Both lines are fine; the <b>order</b> is wrong. On line 1 nothing called <code>total</code> exists yet, so Python stops with <code>NameError</code>. You must store before you use." },
  ],
  "variables-data-types": [
    // Easy — did the core idea land?
    { level: "easy", q: "Which line correctly stores the text <b>Priya</b> in a variable?", options: ["name = Priya", "name = \"Priya\"", "\"name\" = Priya", "Priya = name"], correct: 1, why: "Text must sit inside quotes, and the <b>name goes on the left</b> of <code>=</code>. Without quotes Python would look for a variable called <code>Priya</code>." },
    { level: "easy", q: "<code>print(type(21))</code> prints what?", options: ["<class 'int'>", "<class 'float'>", "21", "<class 'str'>"], correct: 0, why: "<code>21</code> is a whole number with no decimal point and no quotes, so its type is <code>int</code>." },
    { level: "easy", q: "Which of these is a <b>valid</b> variable name?", options: ["2nd_place", "my-score", "_total", "for"], correct: 2, why: "It must not start with a digit, cannot contain a hyphen, and cannot be a keyword like <code>for</code>. A leading underscore is allowed, so <code>_total</code> is fine." },
    // Medium — can you apply it to a new case?
    { level: "medium", q: "<code>x = 10</code>, then <code>x = \"ten\"</code>, then <code>print(type(x))</code> — what appears?", options: ["<class 'int'>", "<class 'str'>", "TypeError", "10"], correct: 1, why: "Python is <b>dynamically typed</b> — the type belongs to the value, not the name. <code>x</code> now points at a string, so <code>str</code>." },
    { level: "medium", q: "<code>age = input()</code> and the user types <code>5</code>. What does <code>age + 1</code> do?", options: ["6", "51", "TypeError", "'6'"], correct: 2, why: "<code>input()</code> always returns a <b>string</b>, so <code>age</code> is <code>\"5\"</code>. String + int raises <code>TypeError</code>. Convert it first with <code>int(age)</code>." },
    { level: "medium", q: "What is the output of <code>print(10 / 2)</code>?", options: ["5", "5.0", "\"5\"", "2.5"], correct: 1, why: "<code>/</code> <b>always</b> produces a float — <code>5.0</code>, not <code>5</code>. Use <code>//</code> when you want a whole number." },
    { level: "medium", q: "<code>a, b = 1, 2</code> then <code>a, b = b, a</code> then <code>print(a)</code> — what prints?", options: ["1", "2", "3", "SyntaxError"], correct: 1, why: "Python builds the whole right side <b>first</b> (<code>2, 1</code>) and then assigns, so the swap works without a temp variable. <code>a</code> is now 2." },
    // Hard — edge cases and bugs; the answers are not written in the lesson.
    { level: "hard", q: "<code>price = 100</code>, <code>total = price</code>, <code>price = 200</code>. What does <code>print(total)</code> show?", options: ["200", "100", "300", "None"], correct: 1, why: "<code>total = price</code> copied the <b>value that price pointed at</b>, not a live link to the name. Re-labelling <code>price</code> afterwards leaves <code>total</code> exactly where it was — 100." },
    { level: "hard", q: "<code>marks = input(\"Marks: \")</code> and the user types <code>50</code>. The next line is <code>if marks > 40:</code> — what happens?", options: ["The block runs", "The block is skipped", "TypeError", "It prints 50"], correct: 2, why: "<code>marks</code> is the string <code>\"50\"</code>, and Python refuses to compare a string with an int — <code>TypeError</code>. Note it is not a silent wrong answer, it is a crash; the fix is <code>int(input(...))</code>." },
    { level: "hard", q: "What does <code>print(bool(\"False\"))</code> show?", options: ["False", "True", "TypeError", "None"], correct: 1, why: "The <b>text</b> \"False\" is not the value <code>False</code>. For strings, <code>bool()</code> only asks one thing: is it empty? It has five characters, so it is <code>True</code>. Only <code>\"\"</code> would be False." },
  ],
  "operators": [
    { q: "<code>print(7 % 3)</code> ka output?", options: ["2", "1", "2.33", "0"], correct: 1, why: "<code>%</code> = <b>remainder</b>. 7 ÷ 3 = 2, bacha <b>1</b>." },
    { q: "<code>print(2 + 3 * 2)</code> — kya aayega?", options: ["10", "8", "12", "7"], correct: 1, why: "<code>*</code> pehle chalta hai (precedence): 3*2 = 6, phir 2 + 6 = <b>8</b>." },
    { q: "<code>print(5 > 3 and 2 > 4)</code> ka result?", options: ["True", "False", "error", "None"], correct: 1, why: "<code>and</code> me dono sach hone chahiye. <code>2 > 4</code> False hai, to poora <b>False</b>." },
    { q: "<code>print(\"ha\" * 3)</code> kya dega?", options: ["9", "hahaha", "ha ha ha", "TypeError"], correct: 1, why: "<code>*</code> string aur int pe <b>repeat</b> karta hai — <code>\"ha\"</code> teen baar = <code>hahaha</code>." },
  ],
  "conditionals": [
    // Easy
    { level: "easy", q: "When does the block under an <code>if</code> run?", options: ["Always", "Only when the condition is True", "Only when the condition is False", "Once per program"], correct: 1, why: "The condition answers True or False, and only True runs the block underneath." },
    { level: "easy", q: "What makes a block belong to an <code>if</code> in Python?", options: ["Curly braces", "A semicolon", "Indentation", "The word then"], correct: 2, why: "Python has no braces — the indentation <b>is</b> the syntax. Four spaces is the convention." },
    { level: "easy", q: "<code>marks = 30</code>. Which prints with <code>if marks >= 40: print(\"Pass\") else: print(\"Fail\")</code>?", options: ["Pass", "Fail", "both", "nothing"], correct: 1, why: "<code>30 >= 40</code> is False, so the <code>else</code> branch runs." },
    // Medium
    { level: "medium", q: "<code>x = 5</code>. <code>if x > 3:</code> prints A, <code>elif x > 4:</code> prints B. What appears?", options: ["A", "B", "A and B", "nothing"], correct: 0, why: "The <code>if</code> matched, so the <code>elif</code> is never checked — even though <code>5 > 4</code> is also true. Only <b>A</b>." },
    { level: "medium", q: "<code>if marks >= 40:</code> printing C, then a <b>separate</b> <code>if marks >= 75:</code> printing B. With marks = 82?", options: ["only B", "only C", "C and B both print", "SyntaxError"], correct: 2, why: "Separate <code>if</code>s are separate questions, both asked. 82 satisfies both, so both print — this is why mutually exclusive cases need one <code>elif</code> chain." },
    { level: "medium", q: "What does <code>if marks = 40:</code> do?", options: ["Sets marks to 40", "Compares marks with 40", "SyntaxError", "Always True"], correct: 2, why: "<code>=</code> assigns, <code>==</code> compares. Python refuses this outright rather than letting it silently assign inside a condition." },
    { level: "medium", q: "<code>status = \"Adult\" if age >= 18 else \"Minor\"</code> with <code>age = 15</code> gives?", options: ["Adult", "Minor", "True", "SyntaxError"], correct: 1, why: "In Python's ternary the condition sits in the middle. It is False, so the <code>else</code> value is chosen." },
    // Hard — not answerable by re-reading
    { level: "hard", q: "A discount chain checks <code>amount >= 1000</code> first and <code>amount >= 5000</code> second. What happens at amount = 6000?", options: ["Gets the 5000 tier", "Gets the 1000 tier", "Gets both", "Crashes"], correct: 1, why: "It stops at the first true branch, so the higher tier is unreachable for every amount. No error, just a permanently wrong answer — put the strictest condition first." },
    { level: "hard", q: "<code>items = []</code>. What does <code>if not items:</code> do?", options: ["Runs the block", "Skips the block", "TypeError", "Depends on the contents"], correct: 0, why: "An empty list is falsy, so <code>not items</code> is True and the block runs. That is why <code>if not items:</code> is the Pythonic empty check." },
    { level: "hard", q: "<code>count = 0</code>. Why can <code>if count:</code> be a bug where <code>if count is not None:</code> is not?", options: ["They are identical", "0 is falsy, so a real value of zero is treated as missing", "if count: raises an error", "is not None is slower"], correct: 1, why: "Truthiness collapses \"empty\" and \"zero\" into the same answer. If <b>0</b> is a legitimate value — zero sales, zero errors — the truthy shortcut silently skips it. Check against <code>None</code> when zero means something." },
  ],
  "loops": [
    { q: "<code>for i in range(1, 4): print(i)</code> — kya chhapega?", options: ["1 2 3 4", "1 2 3", "0 1 2 3", "1 2"], correct: 1, why: "<code>range(1, 4)</code> = 1, 2, 3 — <b>stop (4) excluded</b>." },
    { q: "<code>continue</code> loop me kya karta hai?", options: ["poora loop rok deta", "current chakkar chhod ke agle pe", "program band", "kuch nahi"], correct: 1, why: "<code>continue</code> = current iteration <b>skip</b>, agla chalu. <code>break</code> poora loop rokta hai." },
    { q: "<code>while count > 0:</code> me <code>count</code> kabhi na badle to?", options: ["ek baar chalega", "infinite loop", "error", "kabhi nahi chalega"], correct: 1, why: "Condition kabhi False nahi hogi → <b>infinite loop</b>. <code>while</code> me kuch aisa badlo jisse condition ek din False ho." },
    { q: "<code>range(5)</code> kitne aur kaunse numbers deta hai?", options: ["5 numbers: 1-5", "5 numbers: 0-4", "6 numbers: 0-5", "4 numbers: 0-3"], correct: 1, why: "<code>range(5)</code> = 0, 1, 2, 3, 4 — <b>0 se shuru, 5 excluded</b>." },
  ],
  "lists-tuples": [
    { q: "<code>nums = [1, 2, 3]; print(nums[3])</code> — kya hoga?", options: ["3", "IndexError", "None", "0"], correct: 1, why: "Index 0, 1, 2 hi valid hain (3 items). <code>nums[3]</code> range ke bahar — <b>IndexError</b>." },
    { q: "<code>t = (1, 2); t[0] = 9</code> — kya hoga?", options: ["t = (9, 2)", "TypeError", "kuch nahi", "IndexError"], correct: 1, why: "Tuple <b>immutable</b> hai — badal nahi sakte. <code>TypeError</code>. Badalna ho to list use karo." },
    { q: "<code>nums = [10, 20, 30]; print(nums[-1])</code> ka output?", options: ["10", "30", "IndexError", "-1"], correct: 1, why: "Negative index peeche se — <code>-1</code> = <b>aakhri</b> item = 30." },
    { q: "List aur tuple me — kaunsa <b>badla</b> ja sakta hai?", options: ["tuple", "list", "dono", "koi nahi"], correct: 1, why: "<b>list</b> mutable (badalti hai), <b>tuple</b> immutable (fix). Data fix rakhna ho to tuple." },
  ],
  "dicts-sets": [
    // Easy
    { level: "easy", q: "How do you read the value stored under the key <code>\"age\"</code>?", options: ["student(\"age\")", "student[\"age\"]", "student.age()", "student->age"], correct: 1, why: "Square brackets with the key. A dictionary is looked up by name, not by position." },
    { level: "easy", q: "<code>set([1, 2, 2, 3, 3, 3])</code> holds how many items?", options: ["6", "3", "2", "1"], correct: 1, why: "A set keeps each item once, so the repeats are dropped: {1, 2, 3} — three items." },
    { level: "easy", q: "What does <code>s = {}</code> create?", options: ["An empty set", "An empty dictionary", "An empty list", "An error"], correct: 1, why: "Braces belonged to dictionaries first. An empty set has to be written <code>set()</code> — and getting this wrong fails later, at the first <code>.add()</code>, not here." },
    // Medium
    { level: "medium", q: "<code>d = {\"a\": 1}</code>. What does <code>print(d[\"b\"])</code> do?", options: ["Prints None", "Prints 0", "Raises KeyError", "Adds the key b"], correct: 2, why: "A missing key stops the program with <code>KeyError</code>. Use <code>d.get(\"b\")</code> when the key may not be there." },
    { level: "medium", q: "<code>d = {\"a\": 1}</code>, then <code>d[\"a\"] = 5</code>. What is in <code>d</code>?", options: ["{'a': 1, 'a': 5}", "{'a': 5}", "{'a': 1}", "TypeError"], correct: 1, why: "A key appears at most once, so assigning to it <b>replaces</b> the value. There is no way to get a second entry under the same key." },
    { level: "medium", q: "<code>d.get(\"missing\", 0)</code> returns what?", options: ["KeyError", "None", "0", "False"], correct: 2, why: "<code>.get()</code> hands back the default you pass, which is why <code>0</code> is so useful when you are counting." },
    { level: "medium", q: "Why does <code>d = {[\"a\"]: 1}</code> fail?", options: ["Lists are too long", "A list is mutable, so it cannot be hashed", "You need double quotes", "It does not fail"], correct: 1, why: "The slot a key lives in is computed from its hash. A mutable key could change and strand its own value — hence <code>TypeError: unhashable type</code>. A tuple works." },
    // Hard — the silent ones
    { level: "hard", q: "You loop over 5 orders doing <code>counts[city] = 1</code>. Every city shows 1. Why?", options: ["The loop runs once", "Each pass overwrites the key instead of adding to it", "Dictionaries cannot hold numbers", "It should raise KeyError"], correct: 1, why: "The loop runs all five times — and each time replaces the value with 1, wiping the previous count. The fix is <code>counts.get(city, 0) + 1</code>, which reads the old number first. This bug never crashes; it just reports the wrong number." },
    { level: "hard", q: "A list of 5 order IDs contains a genuine repeat. You do <code>ids = set(ids)</code> then sum them. What happened?", options: ["Nothing, the total is right", "A real order was silently deleted from the total", "It raises an error", "The sum doubles"], correct: 1, why: "Converting to a set removes duplicates, including the ones that were real data. If a customer genuinely ordered twice, that order is gone from the total — with no error to warn you. Deduplicate only when duplicates are actually unwanted." },
    { level: "hard", q: "Which is safe to rely on: the printed order of a dictionary, or of a set?", options: ["Both", "Neither", "The dictionary only", "The set only"], correct: 2, why: "Since Python 3.7 a dictionary preserves <b>insertion order</b> as a language guarantee. A set gives no order guarantee at all, so code that depends on how a set prints will work on your machine and fail somewhere else." },
  ],
  "functions": [
    // Easy
    { level: "easy", q: "Which keyword defines a function in Python?", options: ["function", "def", "fun", "define"], correct: 1, why: "<code>def name(parameters):</code> — the body is the indented block underneath." },
    { level: "easy", q: "What does <code>return</code> do?", options: ["Prints the value", "Hands the value back to the caller", "Ends the program", "Saves it to a file"], correct: 1, why: "It passes a value back to whoever called the function — and ends the function immediately." },
    { level: "easy", q: "<code>def f(a, b=2): return a + b</code>. What is <code>f(3)</code>?", options: ["3", "5", "error", "32"], correct: 1, why: "<code>b</code> falls back to its default of 2, so 3 + 2 = 5." },
    // Medium
    { level: "medium", q: "<code>def f(): print(\"hi\")</code>, then <code>x = f()</code>. What is in <code>x</code>?", options: ["\"hi\"", "None", "an error", "an empty string"], correct: 1, why: "It printed rather than returned, so the call evaluates to <code>None</code>. \"hi\" reached the screen and nothing reached <code>x</code>." },
    { level: "medium", q: "<code>def f(): x = 5</code>, then <code>print(x)</code> outside. What happens?", options: ["Prints 5", "NameError", "Prints None", "Prints 0"], correct: 1, why: "<code>x</code> lives only inside that call and is gone once it ends. To get a value out, return it." },
    { level: "medium", q: "Does code written after <code>return</code> run?", options: ["Yes", "No", "Only in loops", "Only if indented"], correct: 1, why: "<code>return</code> ends the function on the spot. Anything below it is dead code, and Python gives no warning." },
    { level: "medium", q: "<code>def rate(price, qty): return price * qty</code>. What does <code>rate(qty=3, price=20)</code> give?", options: ["60", "an error — wrong order", "23", "None"], correct: 0, why: "Naming the arguments makes their order irrelevant. Keyword arguments also make a call far easier to read than three bare numbers." },
    // Hard
    { level: "hard", q: "<code>def add(item, items=[]): items.append(item); return items</code>. You call it twice with 1 then 2. What does the second call return?", options: ["[2]", "[1, 2]", "[]", "an error"], correct: 1, why: "Python's most famous trap. The default list is created <b>once</b>, when the function is defined, so every call shares it — the first item is still in there. Use <code>items=None</code> and build the list inside the body." },
    { level: "hard", q: "A function prints its result. A loop does <code>total = total + f(x)</code>. What happens?", options: ["It works", "TypeError, because the call gives None", "It prints twice", "total stays 0"], correct: 1, why: "The screen shows correct numbers, which is what makes it confusing — but the call itself returns <code>None</code>, and <code>int + None</code> raises <code>TypeError</code>. The values were computed and never handed back." },
    { level: "hard", q: "<code>return min(x), max(x)</code> — what does the caller actually receive?", options: ["Two separate values", "One tuple, which can be unpacked", "Only the min", "An error"], correct: 1, why: "A function returns one object. The comma builds a tuple, and <code>low, high = stats(x)</code> unpacks it — which is why it feels like returning two things. Past two or three values, a dictionary reads better than positional unpacking." },
  ],
  "strings": [
    { q: "<code>s = \"DATA\"; print(s[1:3])</code> — kya aayega?", options: ["AT", "ATA", "DAT", "TA"], correct: 0, why: "Index 1, 2 = A, T — <b>stop (3) excluded</b>. Result <code>AT</code>." },
    { q: "<code>s = \"hi\"; s.upper(); print(s)</code> — kya chhapega?", options: ["HI", "hi", "TypeError", "\"\""], correct: 1, why: "Strings <b>immutable</b> — <code>.upper()</code> naya string return karta hai, <code>s</code> nahi badalta. Return pakadna padta: <code>s = s.upper()</code>." },
    { q: "<code>print(\"abc\"[::-1])</code> ka output?", options: ["abc", "cba", "cab", "TypeError"], correct: 1, why: "Step <code>-1</code> = <b>reverse</b>. <code>abc</code> → <code>cba</code>." },
    { q: "<code>\"a,b,c\".split(\",\")</code> kya deta hai?", options: ["abc", "['a', 'b', 'c']", "a b c", "TypeError"], correct: 1, why: "<code>.split(\",\")</code> string ko <b>list</b> me todta hai — <code>['a', 'b', 'c']</code>." },
  ],
  "comprehensions": [
    { q: "<code>[x*x for x in [1, 2, 3]]</code> — result?", options: ["[1, 4, 9]", "[1, 2, 3]", "[2, 4, 6]", "[1, 8, 27]"], correct: 0, why: "Har item ka square: 1, 4, 9." },
    { q: "<code>[x for x in range(5) if x % 2 == 0]</code> — kya aayega?", options: ["[0, 2, 4]", "[1, 3]", "[2, 4]", "[0, 1, 2, 3, 4]"], correct: 0, why: "range(5) = 0..4, sirf even rakhe: <b>0, 2, 4</b>." },
    { q: "Comprehension me filter (<code>if</code>) kahan aata hai?", options: ["for se pehle", "for ke baad", "bracket ke bahar", "kahin bhi"], correct: 1, why: "<code>[x for x in xs <b>if cond</b>]</code> — filter <code>for</code> ke baad." },
    { q: "<code>{x for x in [1, 1, 2, 2]}</code> kya dega?", options: ["[1, 1, 2, 2]", "{1, 2}", "{1, 1, 2, 2}", "TypeError"], correct: 1, why: "<code>{}</code> = set comprehension — <b>duplicates hata deta</b>: {1, 2}." },
  ],
  "oop": [
    { q: "Class ke method ka <b>pehla</b> parameter kya hona chahiye?", options: ["this", "self", "obj", "kuch bhi"], correct: 1, why: "<code>self</code> — \"yehi object\". Python use automatically bhejta hai, isiliye pehla parameter." },
    { q: "Ek class se kitne objects bana sakte ho?", options: ["sirf 1", "jitne chaaho", "max 10", "0"], correct: 1, why: "Class ek <b>blueprint</b> hai — usse jitne chaaho objects (instances) banao." },
    { q: "<code>__init__</code> kab chalta hai?", options: ["jab tum call karo", "object banate waqt (apne aap)", "kabhi nahi", "program end pe"], correct: 1, why: "Object banate waqt <b>automatically</b> — data (attributes) set karne ke liye. Tum seedha call nahi karte." },
    { q: "<code>Dog</code> class me <code>self.name</code> hai. Bruno aur Rex ka naam?", options: ["same", "alag — har object apna", "error", "None"], correct: 1, why: "Har <b>object apna</b> data rakhta hai — <code>self.name</code> us object ka. Bruno ka \"Bruno\", Rex ka \"Rex\"." },
  ],
  "error-handling": [
    { q: "<code>int(\"x\")</code> ko <code>try</code> me daala, aur <code>except ValueError:</code> me <code>print(\"caught\")</code>. Kya chhapega?", options: ["program crash", "caught", "x", "ValueError"], correct: 1, why: "<code>int(\"x\")</code> ValueError deta, jise <code>except</code> pakad leta hai — <b>caught</b>, crash nahi." },
    { q: "<code>finally</code> block kab chalta hai?", options: ["sirf error pe", "sirf success pe", "hamesha", "kabhi nahi"], correct: 2, why: "<b>Hamesha</b> — error ho ya na ho. Cleanup ke liye." },
    { q: "<b>Bare</b> <code>except:</code> kyun bura hai?", options: ["tez hai", "asli bugs bhi chup-chaap chhup jaati hain", "kaam nahi karta", "kuch bura nahi"], correct: 1, why: "Woh <b>har</b> error nigal jaata hai — tumhari apni bug bhi. Hamesha specific exception pakdo." },
    { q: "Key miss ho sakti ho — crash NA ho, kaunsa?", options: ["d[key]", "d.get(key)", "d.key(key)", "get d[key]"], correct: 1, why: "<code>d.get(key)</code> miss pe <b>None</b> deta (no crash). <code>d[key]</code> KeyError deta." },
  ],
  "booleans": [
    { q: "<code>print(bool([]))</code> — kya aayega?", options: ["True", "False", "TypeError", "None"], correct: 1, why: "Khaali list <b>falsy</b> hai — <code>False</code>." },
    { q: "<code>print(bool([0]))</code> — kya aayega?", options: ["True", "False", "TypeError", "0"], correct: 0, why: "List <b>khaali nahi</b> (usme 0 hai) — to <b>truthy</b>, <code>True</code>. \"Khaali\" matter karta hai, andar kya hai wo nahi." },
    { q: "<code>print(0 or \"hi\")</code> — kya chhapega?", options: ["True", "hi", "0", "False"], correct: 1, why: "<code>or</code> <b>pehli truthy value</b> return karta hai — <code>0</code> falsy, to <code>\"hi\"</code>." },
    { q: "<code>None</code> check karne ka <b>sahi</b> tareeka?", options: ["x == None", "x is None", "x = None", "None(x)"], correct: 1, why: "<code>is None</code> — identity check, sahi aur tez. <code>== None</code> style-wise galat." },
  ],
  "numbers-math": [
    { q: "<code>print(10 // 3)</code> ka output?", options: ["3.33", "3", "4", "1"], correct: 1, why: "<code>//</code> = floor division — neeche wala <b>poora</b> number, 3." },
    { q: "<code>print(10 % 3)</code> — kya aayega?", options: ["3", "1", "0", "3.33"], correct: 1, why: "<code>%</code> = remainder. 10 ÷ 3 = 3, bacha <b>1</b>." },
    { q: "<code>print(0.1 + 0.2 == 0.3)</code> — result?", options: ["True", "False", "error", "0.3"], correct: 1, why: "Float precision — <code>0.1 + 0.2</code> = <code>0.3000…04</code>, to <code>== 0.3</code> <b>False</b>. Floats ko <code>==</code> se mat compare karo." },
    { q: "<code>7 / 2</code> ka type aur value?", options: ["int, 3", "float, 3.5", "int, 4", "str"], correct: 1, why: "<code>/</code> <b>hamesha float</b> — <code>3.5</code>. Poora chahiye to <code>//</code>." },
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
