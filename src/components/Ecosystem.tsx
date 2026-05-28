import Image from "next/image";
import diagramImg from "../../public/assets/diagram.png";

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="ecosystem-section container">
      <div className="ecosystem-grid">
        <div className="ecosystem-image-container">
          <Image
            src={diagramImg}
            alt="Jugarr campus ecosystem connection diagram"
            className="ecosystem-image"
          />
        </div>
        <div className="ecosystem-content">
          <h2 className="ecosystem-title">
            Everything students need already exists nearby.
          </h2>
          <div className="editorial-line"></div>
          <p className="ecosystem-desc">
            Jugarr connects campus needs with campus talent. No middlemen, no outside apps. Just student to student.
          </p>
          <div className="ecosystem-tags">
            <span className="ecosystem-tag filled">Sell old stuff</span>
            <span className="ecosystem-tag yellow-accent">Earn from skills</span>
            <span className="ecosystem-tag">Find help nearby</span>
            <span className="ecosystem-tag filled">Collaborate</span>
          </div>
        </div>
      </div>
    </section>
  );
}
