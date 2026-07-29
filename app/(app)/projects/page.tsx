const projects = [
  { title: "Sales Dashboard EDA", level: "Beginner", em: "📊", grad: "linear-gradient(135deg,#E8920C,#B8690A)", desc: "Clean a messy CSV, find the trends, and write your first insight report.", skills: ["pandas", "matplotlib"], est: "~6 hrs" },
  { title: "Movie Ratings SQL Case", level: "Intermediate", em: "🎬", grad: "linear-gradient(135deg,#0E9C8C,#0A6B60)", desc: "Answer 12 business questions from a three-table database, using SQL.", skills: ["sql", "joins"], est: "~8 hrs" },
  { title: "Churn Prediction Model", level: "Capstone", em: "🤖", grad: "linear-gradient(135deg,#5B4CD6,#3D2FA0)", desc: "End-to-end: clean → EDA → model → evaluate. Portfolio-ready.", skills: ["sklearn", "ml"], est: "~15 hrs" },
  { title: "House Price Predictor", level: "Intermediate", em: "🏠", grad: "linear-gradient(135deg,#2C5FC0,#1E4088)", desc: "Predict house prices with regression — where feature engineering gets fun.", skills: ["regression", "pandas"], est: "~10 hrs" },
  { title: "Twitter Sentiment", level: "Beginner", em: "💬", grad: "linear-gradient(135deg,#1FA85A,#147A40)", desc: "Is a tweet positive or negative? Your first taste of NLP.", skills: ["nlp", "text"], est: "~7 hrs" },
  { title: "Deployed ML Web App", level: "Capstone", em: "🚀", grad: "linear-gradient(135deg,#D9557B,#A83459)", desc: "Deploy your model on Streamlit — put the live link on your resume.", skills: ["streamlit", "deploy"], est: "~12 hrs" },
];

export default function ProjectsPage() {
  return (
    <>
      <p className="page-intro">This page is the <b>plan</b>, not the projects. Nothing here is buildable yet — the briefs, datasets and checkpoints are still to be written. It is here so you can see where the course is going. In the meantime the practice problems are real and checked.</p>
      <div className="projs">
        {projects.map((p) => (
          <div className="proj" key={p.title}>
            <div className="banner" style={{ background: p.grad }}>
              <span className="lvl">{p.level}</span><span className="em">{p.em}</span>
            </div>
            <div className="b">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="skills">{p.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <div className="pf"><span className="est">{p.est}</span><span className="soon">Coming soon</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
