/* The machine-learning track's reference syllabus.
 *
 * Same shape and same rules as syllabus.mjs, which covers the Python track:
 * W3Schools' own Machine Learning section is the FLOOR, not the target. Filling
 * a `covers: []` closes a deficiency; it is not the achievement. The last group
 * is "Beyond W3Schools" — and anything we teach that they do not MUST be listed
 * there, because a scoreboard that only counts their topics reports our best
 * work as zero.
 *
 * The standing rule for every ML lesson: show where the method BREAKS, not only
 * how to call it. W3Schools shows the happy path. A lesson earns a line in the
 * last group by showing the failure — a model 95% accurate while flagging no
 * fraud at all, feature selection scoring 0.792 on data with no signal, K-Means
 * blind to two obvious groups because one column is measured in bigger numbers,
 * a tuning loop whose reported score climbs as the truth falls.
 *
 * Deliberately NOT listed here: the statistics half of W3Schools' ML pages —
 * mean/median/mode, standard deviation, percentiles, data distributions, normal
 * distribution and scatter plots. Those are Etudo's `statistics` track (11
 * lessons, all at standard) and counting them here would score the same work
 * twice. `covers` can only point at lessons inside this track.
 *
 * An empty `covers` is not an oversight — it is the work list. There are none
 * open at the moment; the six that were (polynomial and multiple regression,
 * KNN, AUC-ROC, bagging, hierarchical clustering) were closed by four new
 * lessons, each carrying its own entries in the last group.
 */

export const ML_SYLLABUS = [
  { group: "Getting started", topics: [
    { t: "What makes a program machine learning rather than ordinary code", covers: ["ml-intro"] },
    { t: "Supervised vs unsupervised — was it given the answers?", covers: ["ml-intro"] },
    { t: "Train/Test — why a model is never graded on what it studied", covers: ["ml-intro", "ml-evaluation"] },
    { t: "fit() / predict() — the shape every scikit-learn model shares", covers: ["ml-intro"] },
  ]},
  { group: "Regression", topics: [
    { t: "Linear Regression", covers: ["ml-regression"] },
    { t: "Polynomial Regression", covers: ["ml-regression-more"] },
    { t: "Multiple Regression — several predictors, and reading their coefficients", covers: ["ml-regression-more"] },
    { t: "MAE, RMSE and R² — and why the choice between them is a decision", covers: ["ml-regression"] },
    { t: "Residuals — one number per row, and the shapes they make", covers: ["ml-regression"] },
  ]},
  { group: "Classification", topics: [
    { t: "Logistic Regression", covers: ["ml-classification"] },
    { t: "Confusion Matrix — the four outcomes", covers: ["ml-classification"] },
    { t: "Precision and recall, and which one your problem wants", covers: ["ml-classification"] },
    { t: "K-nearest neighbours", covers: ["ml-neighbours"] },
    { t: "AUC — ROC curve", covers: ["ml-roc-auc"] },
  ]},
  { group: "Preparing the data", topics: [
    { t: "Scale — StandardScaler, and what a scaler actually learns", covers: ["ml-evaluation", "ml-unsupervised"] },
    { t: "Categorical Data — one-hot encoding", covers: ["ml-regression"] },
  ]},
  { group: "Choosing and checking a model", topics: [
    { t: "Decision Tree — depth, leaves, and what a limit does", covers: ["ml-workflow"] },
    { t: "Cross Validation", covers: ["ml-evaluation"] },
    { t: "Grid Search", covers: ["ml-workflow"] },
    { t: "Bootstrap Aggregation (bagging)", covers: ["ml-neighbours"] },
  ]},
  { group: "Unsupervised", topics: [
    { t: "K-Means", covers: ["ml-unsupervised"] },
    { t: "Hierarchical Clustering", covers: ["ml-hierarchical"] },
    { t: "PCA — and reading what each component is made of", covers: ["ml-unsupervised"] },
  ]},

  { group: "Beyond W3Schools (our own edge)", topics: [
    { t: "Coefficients swinging −0.8, 151.6, 33.0 while R² holds at 0.95", covers: ["ml-regression-more"] },
    { t: "Why collinearity destroys explanation and leaves prediction intact", covers: ["ml-regression-more"] },
    { t: "Degree 15 fitting ten points at R² 1.0 and predicting 11.2 where the truth is −1.75", covers: ["ml-regression-more"] },
    { t: "Cross-validated R² of −17.13 on a model whose training score was 0.922", covers: ["ml-regression-more"] },
    { t: "AUC 0.938 on a model that flags 9 rows out of 40 real positives", covers: ["ml-roc-auc"] },
    { t: "Why FPR hides false alarms that precision cannot", covers: ["ml-roc-auc"] },
    { t: "Average precision as the honest partner to AUC on rare events", covers: ["ml-roc-auc"] },
    { t: "Reporting a cut-off in rows, so the person staffing the queue can answer", covers: ["ml-roc-auc"] },
    { t: "One unscaled rupee column taking KNN from 0.97 to a coin toss", covers: ["ml-neighbours"] },
    { t: "Why k=1 scores exactly 1.0 on training data, on any dataset at all", covers: ["ml-neighbours"] },
    { t: "200 bagged stumps scoring 0.693 — identical to one stump", covers: ["ml-neighbours"] },
    { t: "Bagging reduces variance, not bias — and how to tell which you have", covers: ["ml-neighbours"] },
    { t: "Reading k off the jump in merge heights: 2.57, then 30.87", covers: ["ml-hierarchical"] },
    { t: "Three of four linkage settings returning [1, 1, 80] where ward returns [1, 40, 41]", covers: ["ml-hierarchical"] },
    { t: "Why cluster sizes like 1, 1, 80 are a symptom and not a segmentation", covers: ["ml-hierarchical"] },
    { t: "One tree, cut repeatedly — every k from a single fit", covers: ["ml-hierarchical"] },
    { t: "The two scores that look like success and mean nothing", covers: ["ml-intro"] },
    { t: "A model memorising 200 random labels, then scoring 0.5 on new rows", covers: ["ml-intro"] },
    { t: "R² of 0.95 on a model wrong about every row, in a symmetric shape", covers: ["ml-regression"] },
    { t: "What a model believes when city codes 1, 2, 3 arrive as numbers", covers: ["ml-regression"] },
    { t: "Why one-hot predictions land exactly on the group averages", covers: ["ml-regression"] },
    { t: "95% accuracy on a fraud model that flags nothing at all", covers: ["ml-classification"] },
    { t: "The 0.5 cut-off hidden inside .predict(), and moving it", covers: ["ml-classification"] },
    { t: "A threshold search that maximises accuracy by catching no fraud", covers: ["ml-classification"] },
    { t: "One split moving a score 25 points without touching the model", covers: ["ml-evaluation"] },
    { t: "Reading the spread of the folds, not only their mean", covers: ["ml-evaluation"] },
    { t: "Scoring 0.792 on data with no signal — leakage, measured", covers: ["ml-evaluation"] },
    { t: "Why a Pipeline makes leakage impossible rather than merely avoided", covers: ["ml-evaluation"] },
    { t: "Why an unscaled column decides a clustering on its own", covers: ["ml-unsupervised"] },
    { t: "K-Means returning three confident clusters from data with none", covers: ["ml-unsupervised"] },
    { t: "Why inertia can never choose k, and what a silhouette adds", covers: ["ml-unsupervised"] },
    { t: "PCA reporting 99.8% explained when the component IS the units", covers: ["ml-unsupervised"] },
    { t: "Overfitting as a widening gap, measured: 0.067 to 0.244", covers: ["ml-workflow"] },
    { t: "What tuning on the test set costs, measured: +0.029 at 48 candidates", covers: ["ml-workflow"] },
    { t: "Why best_score_ is how you chose, not what you found", covers: ["ml-workflow"] },
    { t: "One engineered feature beating a tree twelve times deeper", covers: ["ml-workflow"] },
  ]},
];
