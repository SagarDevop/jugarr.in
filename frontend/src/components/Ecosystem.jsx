import diagramImg from "@/assets/diagram.png";

const categories = [
  {
    label: "Books",
    desc: "Sell old textbooks or find affordable second-hand books from seniors on your campus.",
  },
  {
    label: "Notes",
    desc: "Share or buy handwritten and digital study notes for every subject and semester.",
  },
  {
    label: "Furniture",
    desc: "Buy and sell second-hand hostel furniture — desks, chairs, mattresses, kettles and more.",
  },
  {
    label: "Cycles",
    desc: "Find affordable used bicycles or sell your campus cycle before you graduate.",
  },
  {
    label: "Gadgets",
    desc: "Trade second-hand laptops, phones, chargers, and accessories with verified students.",
  },
  {
    label: "Skills",
    desc: "Offer your design, coding, writing, or tutoring skills and earn from peers who need them.",
  },
];

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="ecosystem-section container">
      <div className="ecosystem-grid">
        <div className="ecosystem-image-container">
          <img
            src={diagramImg}
            alt="Jugarr campus marketplace ecosystem — books, notes, furniture, gadgets, internships, skills"
            className="ecosystem-image"
          />
        </div>
        <div className="ecosystem-content">
          <h2 className="ecosystem-title">
            Everything students need already exists nearby.
          </h2>
          <div className="editorial-line"></div>
          <p className="ecosystem-desc">
            Jugarr is the student marketplace that connects campus needs with campus talent — no middlemen, no outside apps. Just student-to-student exchange.
          </p>
          <div className="ecosystem-categories">
            {categories.map((cat) => (
              <div key={cat.label} className="ecosystem-category-item">
                <h3 className="ecosystem-category-label">{cat.label}</h3>
                <p className="ecosystem-category-desc">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
