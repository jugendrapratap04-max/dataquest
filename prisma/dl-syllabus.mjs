/* The deep-learning track's reference syllabus.
 *
 * Same rules as syllabus.mjs and ml-syllabus.mjs. W3Schools has no deep-learning
 * section at all, so there is no external floor to measure against here — which
 * makes the last group not an extra but the whole point. Every line in it is
 * something the three lessons demonstrate by running it.
 *
 * The first groups are the topics any introductory treatment owes a reader
 * (TensorFlow's and PyTorch's own getting-started paths, Andrew Ng's course, any
 * textbook chapter one). They are listed so that a gap here reads as a gap.
 *
 * A note on what this track cannot do, written down rather than left as a
 * surprise: real CNNs and transformers need PyTorch or TensorFlow, a GPU and
 * gigabytes of weights, none of which fit in a browser tab. So the lessons teach
 * the MECHANISMS in numpy and scikit-learn — a convolution is two nested loops,
 * a neuron is a weighted sum and a max — and are explicit about where the
 * demonstration stops. `covers: []` on the two framework rows is honest about
 * that boundary rather than claiming ground we do not hold.
 */

export const DL_SYLLABUS = [
  { group: "What a network is", topics: [
    { t: "A neuron: weights, bias, and one activation function", covers: ["dl-intro"] },
    { t: "Activation functions — ReLU, sigmoid, and what they are for", covers: ["dl-intro"] },
    { t: "Layers, and what \"deep\" actually means", covers: ["dl-intro"] },
    { t: "When a neural network is the wrong tool", covers: ["dl-intro"] },
  ]},
  { group: "Architectures", topics: [
    { t: "CNNs — convolution, kernels, and why images need them", covers: ["dl-types"] },
    { t: "RNNs and sequences — order as a structural assumption", covers: ["dl-types"] },
    { t: "Transformers and attention, in outline", covers: ["dl-types"] },
    { t: "Transfer learning — starting from someone else's weights", covers: ["dl-types"] },
    { t: "Training a real CNN in PyTorch or TensorFlow", covers: [] },
  ]},
  { group: "Language", topics: [
    { t: "Text into numbers — bag of words", covers: ["dl-nlp"] },
    { t: "TF-IDF", covers: ["dl-nlp"] },
    { t: "n-grams", covers: ["dl-nlp"] },
    { t: "Stop words and vocabulary decisions", covers: ["dl-nlp"] },
    { t: "Fine-tuning a pre-trained language model", covers: [] },
  ]},

  { group: "Beyond the textbook (our own edge)", topics: [
    { t: "A neuron written in three lines, with ReLU silencing it at −0.4", covers: ["dl-intro"] },
    { t: "Logistic regression scoring 0.5 on four rows of XOR it can see", covers: ["dl-intro"] },
    { t: "Identity vs ReLU on the same network: 0.5 against 1.0", covers: ["dl-intro"] },
    { t: "Three linear layers and one matrix returning the identical number", covers: ["dl-intro"] },
    { t: "A forest and a network tying on tabular data, and what the tie cost", covers: ["dl-intro"] },
    { t: "Scrambling every pixel and losing 0.004 — the network never saw a picture", covers: ["dl-types"] },
    { t: "A convolution written out, and one kernel finding the edge anywhere", covers: ["dl-types"] },
    { t: "Architecture as an assumption about structure, not a menu choice", covers: ["dl-types"] },
    { t: "Destroy a structure and re-score: the one-line test for what a model uses", covers: ["dl-types"] },
    { t: "\"dog bites man\" and \"man bites dog\" as the identical vector", covers: ["dl-nlp"] },
    { t: "A sentiment model scoring \"not good food\" exactly as \"good food\"", covers: ["dl-nlp"] },
    { t: "Why TF-IDF still ranked \"the\" highest, against expectation", covers: ["dl-nlp"] },
    { t: "Printing dropped words — the one line that makes the failure visible", covers: ["dl-nlp"] },
    { t: "Why fixing the negation also moved \"good food\", and why that is right", covers: ["dl-nlp"] },
  ]},
];
