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
  SQ("sql-intro", "Easy", 1, "sql-select-all", "All Employees",
    "Get **all rows and all columns** from the `employees` table.\n\nThis is the very first query in SQL: `SELECT * FROM table;`",
    [{ input: "employees table", output: "10 rows, all columns" }],
    "SELECT \n", "SELECT * FROM employees;",
    ["`*` means all columns.", "SELECT * FROM employees;"], ["select"]),
  SQ("sql-intro", "Easy", 2, "sql-select-cols", "Just Name and Salary",
    "Get only the **`name`** and **`salary`** of each employee, not the whole table.\n\nColumns in this order: `name`, `salary`.",
    [{ input: "employees table", output: "10 rows · name, salary" }],
    "SELECT \n", "SELECT name, salary FROM employees;",
    ["Instead of `*`, write the column names separated by commas.", "SELECT name, salary FROM employees;"], ["select"]),
  SQ("sql-intro", "Easy", 3, "sql-select-dept", "List the Departments",
    "Get the **`name`** and **`city`** of each department from the `departments` table.",
    [{ input: "departments table", output: "4 rows · name, city" }],
    "SELECT \n", "SELECT name, city FROM departments;",
    ["The table name is `departments`.", "SELECT name, city FROM departments;"], ["select"]),

  /* ---------- WHERE ---------- */
  SQ("sql-where", "Easy", 4, "sql-where-salary", "Earning Above 80k",
    "Get the **`name`** and **`salary`** of the employees whose salary is **more than 80000**.\n\n(80000 itself is not included, only the values above it.)",
    [{ input: "salary > 80000", output: "6 rows · name, salary" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees WHERE salary > 80000;",
    ["`WHERE` is used to filter rows.", "WHERE salary > 80000"], ["where","filter"]),
  SQ("sql-where", "Easy", 5, "sql-where-city", "The Mumbai Department",
    "From `departments`, get the **`name`** of the departments whose `city` is **Mumbai**.\n\nWhen you compare text, put it in single quotes: `'Mumbai'`.",
    [{ input: "city = 'Mumbai'", output: "1 row · name" }],
    "SELECT name FROM departments\n", "SELECT name FROM departments WHERE city = 'Mumbai';",
    ["Write text inside single quotes: `'Mumbai'`.", "WHERE city = 'Mumbai'"], ["where","filter"]),
  SQ("sql-where", "Medium", 6, "sql-where-year", "Joined in 2022",
    "Get the **`name`** and **`hire_date`** of the employees who joined in **2022**.\n\n`hire_date` is stored as text (like `'2022-01-10'`), so `LIKE '2022%'` will work.",
    [{ input: "hire_date in 2022", output: "3 rows · name, hire_date" }],
    "SELECT name, hire_date FROM employees\n", "SELECT name, hire_date FROM employees WHERE hire_date LIKE '2022%';",
    ["`LIKE` matches a pattern.", "`%` means 'anything after this'.", "WHERE hire_date LIKE '2022%'"], ["where","like"]),

  /* ---------- ORDER BY / LIMIT / DISTINCT ---------- */
  SQ("sql-order", "Easy", 7, "sql-order-salary", "Sort by Salary",
    "Get the **`name`** and **`salary`** of all employees, with the **highest salary at the top** (descending).",
    [{ input: "employees", output: "10 rows · name, salary (highest first)" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees ORDER BY salary DESC;",
    ["Use `ORDER BY` to sort.", "Use `DESC` to go from largest to smallest.", "ORDER BY salary DESC"], ["order by"]),
  SQ("sql-order", "Easy", 8, "sql-top3", "Top 3 Earners",
    "Get the **`name`** and **`salary`** of the **top 3** employees by salary.\n\nSort first, then take only 3 rows.",
    [{ input: "employees", output: "3 rows · name, salary" }],
    "SELECT name, salary FROM employees\n", "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
    ["First `ORDER BY salary DESC`.", "Then add `LIMIT 3`, it comes after the order."], ["order by","limit"]),
  SQ("sql-order", "Easy", 9, "sql-distinct-city", "Unique Cities",
    "How many **different cities** are there in `departments`? Each `city` should appear **only once**, and the result should be **sorted A-Z**.\n\nColumn: `city`.",
    [{ input: "departments", output: "4 rows · city (A-Z)" }],
    "SELECT \n", "SELECT DISTINCT city FROM departments ORDER BY city;",
    ["Use `DISTINCT` to remove duplicates.", "SELECT DISTINCT city FROM departments ORDER BY city;"], ["distinct","order by"]),

  /* ---------- GROUP BY ---------- */
  SQ("sql-groupby", "Medium", 10, "sql-count-by-dept", "Headcount per Department",
    "Count how many employees are in each department.\n\nExactly these two columns: **`dept_id`** and **`emp_count`**, sorted by `dept_id` (smallest to largest).",
    [{ input: "employees", output: "3 rows · dept_id, emp_count" }],
    "SELECT dept_id, \n",
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees GROUP BY dept_id ORDER BY dept_id;",
    ["`COUNT(*)` counts rows.", "`GROUP BY dept_id` makes a separate group for each department.", "Use `AS emp_count` to rename the column."], ["group by","count"]),
  SQ("sql-groupby", "Medium", 11, "sql-avg-salary", "Average Salary per Department",
    "Find the **average salary** of each department, **rounded to 2 decimals**.\n\nExactly these columns: **`dept_id`** and **`avg_salary`**, sorted by `dept_id`.\n\nRounding is required: `ROUND(AVG(salary), 2)`.",
    [{ input: "employees", output: "3 rows · dept_id, avg_salary" }],
    "SELECT dept_id, \n",
    "SELECT dept_id, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY dept_id ORDER BY dept_id;",
    ["`AVG(salary)` gives the average.", "`ROUND(AVG(salary), 2)` gives 2 decimals.", "Use `AS avg_salary` to set the column name."], ["group by","avg"]),
  SQ("sql-groupby", "Medium", 12, "sql-having", "Large Departments",
    "Show only the departments that have **more than 2** employees.\n\nExactly these columns: **`dept_id`** and **`emp_count`**, sorted by `dept_id`.\n\n**Remember:** to filter after the groups are made, you use `HAVING`, not `WHERE`.",
    [{ input: "employees", output: "2 rows · dept_id, emp_count" }],
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees\n",
    "SELECT dept_id, COUNT(*) AS emp_count FROM employees GROUP BY dept_id HAVING COUNT(*) > 2 ORDER BY dept_id;",
    ["`WHERE` runs before grouping, so it cannot work on COUNT.", "`GROUP BY dept_id HAVING COUNT(*) > 2`"], ["group by","having"]),

  /* ---------- JOINS ---------- */
  SQ("sql-joins", "Medium", 13, "sql-join-basic", "Each Employee's Department",
    "Show each employee along with the name of their department.\n\nExactly these columns: **`name`** (the employee's) and **`dept_name`** (the department's), sorted A-Z by the employee `name`.\n\nJoin them using `employees.dept_id` and `departments.id`.",
    [{ input: "employees + departments", output: "10 rows · name, dept_name" }],
    "SELECT e.name, \nFROM employees e\n",
    "SELECT e.name, d.name AS dept_name FROM employees e JOIN departments d ON e.dept_id = d.id ORDER BY e.name;",
    ["`JOIN departments d ON e.dept_id = d.id`", "Both tables have a `name` column, so you have to write `d.name AS dept_name`."], ["joins"]),
  SQ("sql-joins", "Medium", 14, "sql-join-city", "The Bengaluru Team",
    "Get the **`name`** of the employees whose department is in **Bengaluru**, sorted A-Z by `name`.\n\nThe city is in the `departments` table, so you will need a join.",
    [{ input: "city = 'Bengaluru'", output: "4 rows · name" }],
    "SELECT e.name\nFROM employees e\n",
    "SELECT e.name FROM employees e JOIN departments d ON e.dept_id = d.id WHERE d.city = 'Bengaluru' ORDER BY e.name;",
    ["First the join, then `WHERE d.city = 'Bengaluru'`.", "WHERE comes after the JOIN."], ["joins","where"]),
  SQ("sql-joins", "Hard", 15, "sql-left-join", "The Empty Department",
    "Find the **`name`** of the departments that have **no employees at all**.\n\nA normal `JOIN` will not find them, because a normal join returns only matching rows. `LEFT JOIN` keeps all departments, and for the ones with no match the employee columns will be `NULL`.\n\nColumn: `name`.",
    [{ input: "departments + employees", output: "1 row · name" }],
    "SELECT d.name\nFROM departments d\n",
    "SELECT d.name FROM departments d LEFT JOIN employees e ON e.dept_id = d.id WHERE e.id IS NULL ORDER BY d.name;",
    ["`LEFT JOIN employees e ON e.dept_id = d.id`", "For the rows with no match, `e.id` will be NULL.", "`WHERE e.id IS NULL`, because `= NULL` never works!"], ["joins","left join","null"]),

  /* ---------- SUBQUERIES / WINDOW ---------- */
  SQ("sql-advanced", "Hard", 16, "sql-subquery-avg", "Above the Average",
    "Get the **`name`** and **`salary`** of the employees whose salary is **more than the average salary of the whole company**, salary descending.\n\nYou do not know the average in advance, so you have to find it with a **subquery**.",
    [{ input: "employees", output: "5 rows · name, salary" }],
    "SELECT name, salary FROM employees\nWHERE salary > \n",
    "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;",
    ["The inner query: `SELECT AVG(salary) FROM employees`", "Put it in brackets and compare: `WHERE salary > (...)`"], ["subquery"]),
  SQ("sql-advanced", "Hard", 17, "sql-window-rank", "Rank Within a Department",
    "Rank each employee by salary **within their own department** (highest = rank 1).\n\nExactly these columns: **`name`**, **`dept_id`**, **`salary`**, **`rnk`**, sorted by `dept_id` and then by `rnk`.\n\nThis is a job for a window function: `RANK() OVER (PARTITION BY ... ORDER BY ...)`.",
    [{ input: "employees", output: "10 rows · name, dept_id, salary, rnk" }],
    "SELECT name, dept_id, salary,\n  \nFROM employees\n",
    "SELECT name, dept_id, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk FROM employees ORDER BY dept_id, rnk;",
    ["`PARTITION BY dept_id` = a separate group for each department.", "`ORDER BY salary DESC` = the sorting inside that group.", "`RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk`"], ["window functions","rank"]),
  SQ("sql-advanced", "Super Hard", 18, "sql-window-running", "Running Total",
    "Find the **running total** (cumulative sum) in the `sales` table, in date order.\n\nExactly these columns: **`sale_date`**, **`amount`**, **`running_total`**, sorted by `sale_date`.\n\nRunning total = the sum of all the amounts up to that date.",
    [{ input: "sales", output: "8 rows · sale_date, amount, running_total" }],
    "SELECT sale_date, amount,\n  \nFROM sales\n",
    "SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date) AS running_total FROM sales ORDER BY sale_date;",
    ["`SUM(amount) OVER (ORDER BY sale_date)`, because ORDER BY inside a window makes it cumulative.", "No `PARTITION BY` needed here, the whole table is one group."], ["window functions","sum"]),
];

export { SQL_DB, sqlProblems };
