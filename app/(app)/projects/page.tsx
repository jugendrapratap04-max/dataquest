const projects = [
  { title: "Sales Dashboard EDA", level: "Beginner", em: "📊", grad: "linear-gradient(135deg,#E8920C,#B8690A)", desc: "Messy CSV clean karo, trends dhoondo, apni pehli insight report banao.", skills: ["pandas", "matplotlib"], est: "~6 hrs" },
  { title: "Movie Ratings SQL Case", level: "Intermediate", em: "🎬", grad: "linear-gradient(135deg,#0E9C8C,#0A6B60)", desc: "3-table database se 12 business questions ka jawaab SQL se nikaalo.", skills: ["sql", "joins"], est: "~8 hrs" },
  { title: "Churn Prediction Model", level: "Capstone", em: "🤖", grad: "linear-gradient(135deg,#5B4CD6,#3D2FA0)", desc: "End-to-end: clean → EDA → model → evaluate. Portfolio-ready.", skills: ["sklearn", "ml"], est: "~15 hrs" },
  { title: "House Price Predictor", level: "Intermediate", em: "🏠", grad: "linear-gradient(135deg,#2C5FC0,#1E4088)", desc: "Regression se ghar ki keemat predict karo. Feature engineering ka maza.", skills: ["regression", "pandas"], est: "~10 hrs" },
  { title: "Twitter Sentiment", level: "Beginner", em: "💬", grad: "linear-gradient(135deg,#1FA85A,#147A40)", desc: "Tweets ka mood — positive ya negative? NLP ki pehli jhalak.", skills: ["nlp", "text"], est: "~7 hrs" },
  { title: "Deployed ML Web App", level: "Capstone", em: "🚀", grad: "linear-gradient(135deg,#D9557B,#A83459)", desc: "Apna model Streamlit pe deploy karo — live link resume me daalo.", skills: ["streamlit", "deploy"], est: "~12 hrs" },
];

export default function ProjectsPage() {
  return (
    <>
      <p className="page-intro">Har skill ke baad ek project banao — yahi cheez resume me sabse zyada matter karti hai. Beginner se capstone tak, sab portfolio-ready.</p>
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
              <div className="pf"><span className="est">{p.est}</span><span className="go">Start →</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
