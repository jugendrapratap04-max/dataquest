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
    { q: "<code>print(7 % 3)</code> ka output?", options: ["2", "2.33", "1", "0"], correct: 2, why: "<code>%</code> = <b>remainder</b>. 7 ÷ 3 = 2, bacha <b>1</b>." },
    { q: "<code>print(2 + 3 * 2)</code> — kya aayega?", options: ["10", "8", "12", "7"], correct: 1, why: "<code>*</code> pehle chalta hai (precedence): 3*2 = 6, phir 2 + 6 = <b>8</b>." },
    { q: "<code>print(5 > 3 and 2 > 4)</code> ka result?", options: ["False", "True", "error", "None"], correct: 0, why: "<code>and</code> me dono sach hone chahiye. <code>2 > 4</code> False hai, to poora <b>False</b>." },
    { q: "<code>print(\"ha\" * 3)</code> kya dega?", options: ["9", "ha ha ha", "TypeError", "hahaha"], correct: 3, why: "<code>*</code> string aur int pe <b>repeat</b> karta hai — <code>\"ha\"</code> teen baar = <code>hahaha</code>." },
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
    { q: "<code>for i in range(1, 4): print(i)</code> — kya chhapega?", options: ["1 2 3 4", "0 1 2 3", "1 2 3", "1 2"], correct: 2, why: "<code>range(1, 4)</code> = 1, 2, 3 — <b>stop (4) excluded</b>." },
    { q: "<code>continue</code> loop me kya karta hai?", options: ["poora loop rok deta", "current chakkar chhod ke agle pe", "program band", "kuch nahi"], correct: 1, why: "<code>continue</code> = current iteration <b>skip</b>, agla chalu. <code>break</code> poora loop rokta hai." },
    { q: "<code>while count > 0:</code> me <code>count</code> kabhi na badle to?", options: ["infinite loop", "ek baar chalega", "error", "kabhi nahi chalega"], correct: 0, why: "Condition kabhi False nahi hogi → <b>infinite loop</b>. <code>while</code> me kuch aisa badlo jisse condition ek din False ho." },
    { q: "<code>range(5)</code> kitne aur kaunse numbers deta hai?", options: ["5 numbers: 1-5", "6 numbers: 0-5", "4 numbers: 0-3", "5 numbers: 0-4"], correct: 3, why: "<code>range(5)</code> = 0, 1, 2, 3, 4 — <b>0 se shuru, 5 excluded</b>." },
  ],
  "lists-tuples": [
    { q: "<code>nums = [1, 2, 3]; print(nums[3])</code> — kya hoga?", options: ["3", "None", "IndexError", "0"], correct: 2, why: "Index 0, 1, 2 hi valid hain (3 items). <code>nums[3]</code> range ke bahar — <b>IndexError</b>." },
    { q: "<code>t = (1, 2); t[0] = 9</code> — kya hoga?", options: ["t = (9, 2)", "TypeError", "kuch nahi", "IndexError"], correct: 1, why: "Tuple <b>immutable</b> hai — badal nahi sakte. <code>TypeError</code>. Badalna ho to list use karo." },
    { q: "<code>nums = [10, 20, 30]; print(nums[-1])</code> ka output?", options: ["30", "10", "IndexError", "-1"], correct: 0, why: "Negative index peeche se — <code>-1</code> = <b>aakhri</b> item = 30." },
    { q: "List aur tuple me — kaunsa <b>badla</b> ja sakta hai?", options: ["tuple", "dono", "koi nahi", "list"], correct: 3, why: "<b>list</b> mutable (badalti hai), <b>tuple</b> immutable (fix). Data fix rakhna ho to tuple." },
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
    { q: "<code>s = \"DATA\"; print(s[1:3])</code> — kya aayega?", options: ["ATA", "DAT", "AT", "TA"], correct: 2, why: "Index 1, 2 = A, T — <b>stop (3) excluded</b>. Result <code>AT</code>." },
    { q: "<code>s = \"hi\"; s.upper(); print(s)</code> — kya chhapega?", options: ["HI", "hi", "TypeError", "\"\""], correct: 1, why: "Strings <b>immutable</b> — <code>.upper()</code> naya string return karta hai, <code>s</code> nahi badalta. Return pakadna padta: <code>s = s.upper()</code>." },
    { q: "<code>print(\"abc\"[::-1])</code> ka output?", options: ["cba", "abc", "cab", "TypeError"], correct: 0, why: "Step <code>-1</code> = <b>reverse</b>. <code>abc</code> → <code>cba</code>." },
    { q: "<code>\"a,b,c\".split(\",\")</code> kya deta hai?", options: ["abc", "a b c", "TypeError", "['a', 'b', 'c']"], correct: 3, why: "<code>.split(\",\")</code> string ko <b>list</b> me todta hai — <code>['a', 'b', 'c']</code>." },
  ],
  "comprehensions": [
    { q: "<code>[x*x for x in [1, 2, 3]]</code> — result?", options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "[1, 8, 27]"], correct: 2, why: "Har item ka square: 1, 4, 9." },
    { q: "<code>[x for x in range(5) if x % 2 == 0]</code> — kya aayega?", options: ["[1, 3]", "[0, 2, 4]", "[2, 4]", "[0, 1, 2, 3, 4]"], correct: 1, why: "range(5) = 0..4, sirf even rakhe: <b>0, 2, 4</b>." },
    { q: "Comprehension me filter (<code>if</code>) kahan aata hai?", options: ["for ke baad", "for se pehle", "bracket ke bahar", "kahin bhi"], correct: 0, why: "<code>[x for x in xs <b>if cond</b>]</code> — filter <code>for</code> ke baad." },
    { q: "<code>{x for x in [1, 1, 2, 2]}</code> kya dega?", options: ["[1, 1, 2, 2]", "{1, 1, 2, 2}", "TypeError", "{1, 2}"], correct: 3, why: "<code>{}</code> = set comprehension — <b>duplicates hata deta</b>: {1, 2}." },
  ],
  "oop": [
    { q: "Class ke method ka <b>pehla</b> parameter kya hona chahiye?", options: ["this", "obj", "self", "kuch bhi"], correct: 2, why: "<code>self</code> — \"yehi object\". Python use automatically bhejta hai, isiliye pehla parameter." },
    { q: "Ek class se kitne objects bana sakte ho?", options: ["sirf 1", "jitne chaaho", "max 10", "0"], correct: 1, why: "Class ek <b>blueprint</b> hai — usse jitne chaaho objects (instances) banao." },
    { q: "<code>__init__</code> kab chalta hai?", options: ["object banate waqt (apne aap)", "jab tum call karo", "kabhi nahi", "program end pe"], correct: 0, why: "Object banate waqt <b>automatically</b> — data (attributes) set karne ke liye. Tum seedha call nahi karte." },
    { q: "<code>Dog</code> class me <code>self.name</code> hai. Bruno aur Rex ka naam?", options: ["same", "error", "None", "alag — har object apna"], correct: 3, why: "Har <b>object apna</b> data rakhta hai — <code>self.name</code> us object ka. Bruno ka \"Bruno\", Rex ka \"Rex\"." },
  ],
  "error-handling": [
    { q: "<code>int(\"x\")</code> ko <code>try</code> me daala, aur <code>except ValueError:</code> me <code>print(\"caught\")</code>. Kya chhapega?", options: ["program crash", "x", "caught", "ValueError"], correct: 2, why: "<code>int(\"x\")</code> ValueError deta, jise <code>except</code> pakad leta hai — <b>caught</b>, crash nahi." },
    { q: "<code>finally</code> block kab chalta hai?", options: ["sirf error pe", "hamesha", "sirf success pe", "kabhi nahi"], correct: 1, why: "<b>Hamesha</b> — error ho ya na ho. Cleanup ke liye." },
    { q: "<b>Bare</b> <code>except:</code> kyun bura hai?", options: ["asli bugs bhi chup-chaap chhup jaati hain", "tez hai", "kaam nahi karta", "kuch bura nahi"], correct: 0, why: "Woh <b>har</b> error nigal jaata hai — tumhari apni bug bhi. Hamesha specific exception pakdo." },
    { q: "Key miss ho sakti ho — crash NA ho, kaunsa?", options: ["d[key]", "d.key(key)", "get d[key]", "d.get(key)"], correct: 3, why: "<code>d.get(key)</code> miss pe <b>None</b> deta (no crash). <code>d[key]</code> KeyError deta." },
  ],
  "booleans": [
    { q: "<code>print(bool([]))</code> — kya aayega?", options: ["True", "TypeError", "False", "None"], correct: 2, why: "Khaali list <b>falsy</b> hai — <code>False</code>." },
    { q: "<code>print(bool([0]))</code> — kya aayega?", options: ["False", "True", "TypeError", "0"], correct: 1, why: "List <b>khaali nahi</b> (usme 0 hai) — to <b>truthy</b>, <code>True</code>. \"Khaali\" matter karta hai, andar kya hai wo nahi." },
    { q: "<code>print(0 or \"hi\")</code> — kya chhapega?", options: ["hi", "True", "0", "False"], correct: 0, why: "<code>or</code> <b>pehli truthy value</b> return karta hai — <code>0</code> falsy, to <code>\"hi\"</code>." },
    { q: "<code>None</code> check karne ka <b>sahi</b> tareeka?", options: ["x == None", "x = None", "None(x)", "x is None"], correct: 3, why: "<code>is None</code> — identity check, sahi aur tez. <code>== None</code> style-wise galat." },
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
