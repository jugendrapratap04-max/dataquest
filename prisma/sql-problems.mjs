// SQL practice content — shared by the full seed (seed.mjs) and the additive
// applier (apply-sql-problems.mjs), so both stay in sync from one source.

/* ------------------------------------------------------------------ */
/* SQL practice — runs in sql.js (SQLite) in the browser.             */
/* One small company database shared by every problem, so students    */
/* learn one schema deeply instead of re-reading a new one each time. */
/* ------------------------------------------------------------------ */
const SQL_DB = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);
INSERT INTO departments (id, name, city) VALUES
  (1, 'Engineering', 'Bengaluru'),
  (2, 'Sales', 'Mumbai'),
  (3, 'Marketing', 'Delhi'),
  (4, 'HR', 'Pune');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept_id INTEGER,
  salary INTEGER,
  hire_date TEXT
);
INSERT INTO employees (id, name, dept_id, salary, hire_date) VALUES
  (1,  'Aarav Sharma', 1, 95000,  '2021-03-15'),
  (2,  'Diya Patel',   1, 88000,  '2022-01-10'),
  (3,  'Rohan Mehta',  1, 120000, '2020-07-01'),
  (4,  'Ananya Iyer',  2, 67000,  '2022-05-20'),
  (5,  'Vihaan Nair',  2, 72000,  '2021-11-05'),
  (6,  'Ishita Rao',   2, 59000,  '2023-02-14'),
  (7,  'Kabir Singh',  3, 81000,  '2022-08-30'),
  (8,  'Meera Joshi',  3, 76000,  '2023-06-12'),
  (9,  'Arjun Reddy',  1, 105000, '2023-09-01'),
  (10, 'Saanvi Gupta', 2, 91000,  '2020-12-25');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  emp_id INTEGER,
  amount INTEGER,
  sale_date TEXT
);
INSERT INTO sales (id, emp_id, amount, sale_date) VALUES
  (1, 4,  12000, '2023-01-05'),
  (2, 5,  8000,  '2023-01-12'),
  (3, 4,  15000, '2023-02-03'),
  (4, 6,  5000,  '2023-02-20'),
  (5, 10, 22000, '2023-03-01'),
  (6, 5,  9500,  '2023-03-15'),
  (7, 10, 17000, '2023-04-02'),
  (8, 6,  6500,  '2023-04-18');
`;

const SQ = (lessonSlug, difficulty, order, slug, title, desc, examples, starter, solution, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "sql",
  descriptionMd: desc, tagsCsv: tags.join(","), examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, sqlSetup: SQL_DB,
  functionName: "", testsJson: "[]",
  hintsJson: JSON.stringify(hints), xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const sqlProblems = [
  /* ---------- SELECT ---------- */
  SQ("sql-intro", "Easy", 1, "sql-select-all", "Saare Employees",
    "`employees` table ke **saare rows aur saare columns** nikaalo.\n\nYe SQL ki sabse pehli query hai — `SELECT * FROM table;`",
    [{ input: "employees table", output: "10 rows, saare columns" }],
    "SELECT \n", "SELECT * FROM employees;",
    ["`*` ka matlab hai saare columns.", "SELECT * FROM employees;"], ["select"]),
  SQ("sql-intro", "Easy", 2, "sql-select-cols", "Just Name and Salary",
    "Har employee ka sirf **`name`** aur **`salary`** nikaalo — poori table nahi.\n\nColumns isi order me: `name`, `salary`.",
    [{ input: "employees table", output: "10 rows · name, salary" }],
    "SELECT \n", "SELECT name, salary FROM employees;",
    ["`*` ki jagah column ke naam comma se likho.", "SELECT name, salary FROM employees;"], ["select"]),
  SQ("sql-intro", "Easy", 3, "sql-select-dept", "List the Departments",
    "`departments` table se har department ka **`name`** aur **`city`** nikaalo.",
    [{ input: "departments table", output: "4 rows · name, city" }],
    "SELECT \n", "SELECT name, city FROM departments;",
    ["Table ka naam `departments` hai.", "SELECT name, city FROM departments;"], ["select"]),

  /* ---------- WHERE ---------- */
  SQ("sql-where", "Easy", 4, "sql-where-salary", "Earning Above 80k",
    "Un employees ka **`name`** aur **`salary`** nikaalo jinki salary **80000 se zyada** hai.\n\n(80000 khud include nahi hoga — sirf usse bade.)",
    [{ input: "salary > 80000", output: "6 rows · name, salary" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees WHERE salary > 80000;",
    ["Filter ke liye `WHERE` lagta hai.", "WHERE salary > 80000"], ["where","filter"]),
  SQ("sql-where", "Easy", 5, "sql-where-city", "The Mumbai Department",
    "`departments` me se un departments ka **`name`** nikaalo jinki `city` **Mumbai** hai.\n\nText compare karte waqt single quotes lagti hain: `'Mumbai'`.",
    [{ input: "city = 'Mumbai'", output: "1 row · name" }],
    "SELECT name FROM departments\n", "SELECT name FROM departments WHERE city = 'Mumbai';",
    ["Text ko single quotes me likho: `'Mumbai'`.", "WHERE city = 'Mumbai'"], ["where","filter"]),
  SQ("sql-where", "Medium", 6, "sql-where-year", "Joined in 2022",
    "Un employees ka **`name`** aur **`hire_date`** nikaalo jo **2022** me join hue.\n\n`hire_date` text me hai (`'2022-01-10'` jaisa), toh `LIKE '2022%'` kaam karega.",
    [{ input: "hire_date 2022 me", output: "3 rows · name, hire_date" }],
    "SELECT name, hire_date FROM employees\n", "SELECT name, hire_date FROM employees WHERE hire_date LIKE '2022%';",
    ["`LIKE` pattern match karta hai.", "`%` ka matlab 'iske baad kuch bhi'.", "WHERE hire_date LIKE '2022%'"], ["where","like"]),

  /* ---------- ORDER BY / LIMIT / DISTINCT ---------- */
  SQ("sql-order", "Easy", 7, "sql-order-salary", "Sort by Salary",
    "Saare employees ka **`name`** aur **`salary`** nikaalo, **sabse zyada salary sabse upar** (descending).",
    [{ input: "employees", output: "10 rows · name, salary (highest first)" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees ORDER BY salary DESC;",
    ["Sort ke liye `ORDER BY`.", "Ulta (bade se chhota) karne ke liye `DESC`.", "ORDER BY salary DESC"], ["order by"]),
  SQ("sql-order", "Easy", 8, "sql-top3", "Top 3 Earners",
    "Sabse zyada salary wale **top 3** employees ka **`name`** aur **`salary`** nikaalo.\n\nPehle sort karo, phir sirf 3 rows lo.",
    [{ input: "employees", output: "3 rows · name, salary" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
    ["Pehle `ORDER BY salary DESC`.", "Phir `LIMIT 3` lagao — order ke baad aata hai."], ["order by","limit"]),
  SQ("sql-order", "Easy", 9, "sql-distinct-city", "Unique Cities",
    "`departments` me kitni **alag-alag cities** hain? Har `city` **ek hi baar** aani chahiye, aur **A-Z sorted** ho.\n\nColumn: `city`.",
    [{ input: "departments", output: "4 rows · city (A-Z)" }],
    "SELECT \n", "SELECT DISTINCT city FROM departments ORDER BY city;",
    ["Duplicate hatane ke liye `DISTINCT`.", "SELECT DISTINCT city FROM departments ORDER BY city;"], ["distinct","order by"]),

  /* ---------- GROUP BY ---------- */
  SQ("sql-groupby", "Medium", 10, "sql-count-by-dept", "Headcount per Department",
    "Har department me kitne employees hain, ye ginno.\n\nColumns exactly ye do: **`dept_id`** aur **`emp_count`** — aur `dept_id` ke hisaab se sorted (chhote se bada).",
    [{ input: "employees", output: "3 rows · dept_id, emp_count" }],
    "SELECT dept_id, \n",
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees GROUP BY dept_id ORDER BY dept_id;",
    ["`COUNT(*)` rows ginta hai.", "`GROUP BY dept_id` se har dept alag group ban jaata hai.", "Column ka naam badalne ke liye `AS emp_count`."], ["group by","count"]),
  SQ("sql-groupby", "Medium", 11, "sql-avg-salary", "Average Salary per Department",
    "Har department ki **average salary** nikaalo, **2 decimal tak round** karke.\n\nColumns exactly: **`dept_id`** aur **`avg_salary`** — `dept_id` se sorted.\n\nRound karna zaroori hai: `ROUND(AVG(salary), 2)`.",
    [{ input: "employees", output: "3 rows · dept_id, avg_salary" }],
    "SELECT dept_id, \n",
    "SELECT dept_id, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY dept_id ORDER BY dept_id;",
    ["`AVG(salary)` average deta hai.", "`ROUND(AVG(salary), 2)` se 2 decimal.", "`AS avg_salary` se column ka naam set karo."], ["group by","avg"]),
  SQ("sql-groupby", "Medium", 12, "sql-having", "Bade Departments",
    "Sirf un departments ko dikhao jinme **2 se zyada** employees hain.\n\nColumns exactly: **`dept_id`** aur **`emp_count`**, `dept_id` se sorted.\n\n**Yaad rakho:** group ban jaane ke baad filter karne ke liye `WHERE` nahi, `HAVING` lagta hai.",
    [{ input: "employees", output: "2 rows · dept_id, emp_count" }],
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees\n",
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees GROUP BY dept_id HAVING COUNT(*) > 2 ORDER BY dept_id;",
    ["`WHERE` grouping se pehle chalta hai — isliye COUNT pe kaam nahi karega.", "`GROUP BY dept_id HAVING COUNT(*) > 2`"], ["group by","having"]),

  /* ---------- JOINS ---------- */
  SQ("sql-joins", "Medium", 13, "sql-join-basic", "Each Employee's Department",
    "Har employee ke saath uske department ka naam bhi dikhao.\n\nColumns exactly: **`name`** (employee ka) aur **`dept_name`** (department ka) — employee ke `name` se A-Z sorted.\n\n`employees.dept_id` aur `departments.id` se jodna hai.",
    [{ input: "employees + departments", output: "10 rows · name, dept_name" }],
    "SELECT e.name, \nFROM employees e\n",
    "SELECT e.name, d.name AS dept_name FROM employees e JOIN departments d ON e.dept_id = d.id ORDER BY e.name;",
    ["`JOIN departments d ON e.dept_id = d.id`", "Dono tables me `name` column hai — isliye `d.name AS dept_name` likhna padega."], ["joins"]),
  SQ("sql-joins", "Medium", 14, "sql-join-city", "The Bengaluru Team",
    "Un employees ka **`name`** nikaalo jinka department **Bengaluru** me hai — `name` se A-Z sorted.\n\nCity `departments` table me hai, isliye join karna padega.",
    [{ input: "city = 'Bengaluru'", output: "4 rows · name" }],
    "SELECT e.name\nFROM employees e\n",
    "SELECT e.name FROM employees e JOIN departments d ON e.dept_id = d.id WHERE d.city = 'Bengaluru' ORDER BY e.name;",
    ["Pehle join, phir `WHERE d.city = 'Bengaluru'`.", "JOIN ke baad WHERE lagta hai."], ["joins","where"]),
  SQ("sql-joins", "Hard", 15, "sql-left-join", "The Empty Department",
    "Un departments ka **`name`** dhoondo jinme **ek bhi employee nahi** hai.\n\nNormal `JOIN` se ye nahi milega — kyunki normal join sirf matching rows deta hai. `LEFT JOIN` saare departments rakhega, aur jinka match nahi mila unke employee columns `NULL` honge.\n\nColumn: `name`.",
    [{ input: "departments + employees", output: "1 row · name" }],
    "SELECT d.name\nFROM departments d\n",
    "SELECT d.name FROM departments d LEFT JOIN employees e ON e.dept_id = d.id WHERE e.id IS NULL ORDER BY d.name;",
    ["`LEFT JOIN employees e ON e.dept_id = d.id`", "Jinka match nahi mila unka `e.id` NULL hoga.", "`WHERE e.id IS NULL` — `= NULL` kabhi kaam nahi karta!"], ["joins","left join","null"]),

  /* ---------- SUBQUERIES / WINDOW ---------- */
  SQ("sql-advanced", "Hard", 16, "sql-subquery-avg", "Above the Average",
    "Un employees ka **`name`** aur **`salary`** nikaalo jinki salary **poori company ki average salary se zyada** hai — salary descending.\n\nAverage pehle se pata nahi hai, isliye use ek **subquery** se nikaalna padega.",
    [{ input: "employees", output: "5 rows · name, salary" }],
    "SELECT name, salary FROM employees\nWHERE salary > \n",
    "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;",
    ["Andar wali query: `SELECT AVG(salary) FROM employees`", "Usko bracket me daal ke compare karo: `WHERE salary > (…)`"], ["subquery"]),
  SQ("sql-advanced", "Hard", 17, "sql-window-rank", "Rank Within a Department",
    "Har employee ko uske **apne department ke andar** salary ke hisaab se rank do (sabse zyada = rank 1).\n\nColumns exactly: **`name`**, **`dept_id`**, **`salary`**, **`rnk`** — `dept_id` se, phir `rnk` se sorted.\n\nYe window function ka kaam hai: `RANK() OVER (PARTITION BY … ORDER BY …)`.",
    [{ input: "employees", output: "10 rows · name, dept_id, salary, rnk" }],
    "SELECT name, dept_id, salary,\n  \nFROM employees\n",
    "SELECT name, dept_id, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk FROM employees ORDER BY dept_id, rnk;",
    ["`PARTITION BY dept_id` = har department ka alag group.", "`ORDER BY salary DESC` = us group ke andar sorting.", "`RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk`"], ["window functions","rank"]),
  SQ("sql-advanced", "Super Hard", 18, "sql-window-running", "Running Total",
    "`sales` table me date ke hisaab se **running total** (cumulative sum) nikaalo.\n\nColumns exactly: **`sale_date`**, **`amount`**, **`running_total`** — `sale_date` se sorted.\n\nRunning total = us date tak ke saare amounts ka jod.",
    [{ input: "sales", output: "8 rows · sale_date, amount, running_total" }],
    "SELECT sale_date, amount,\n  \nFROM sales\n",
    "SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date) AS running_total FROM sales ORDER BY sale_date;",
    ["`SUM(amount) OVER (ORDER BY sale_date)` — ORDER BY window ke andar cumulative bana deta hai.", "Yahan `PARTITION BY` ki zaroorat nahi — poori table ek hi group hai."], ["window functions","sum"]),
];

export { SQL_DB, sqlProblems };
