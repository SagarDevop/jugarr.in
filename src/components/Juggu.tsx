import Image from "next/image";
import jugguImg from "../../public/assets/juggu.png";

export default function Juggu() {
  return (
    <section className="juggu-section container">
      <div className="juggu-card">
        <div className="juggu-image-container">
          <Image
            src={jugguImg}
            alt="Juggu - Jugarr official mascot character shape of letter J"
            className="juggu-image"
          />
        </div>
        <div className="juggu-content">
          <h2 className="juggu-title">Meet Juggu: The 'J' of Jugarr</h2>
          <div className="editorial-line" style={{ margin: "12px auto" }}></div>
          <p className="hero-subtitle" style={{ maxWidth: "none" }}>
            Juggu is not just a character—he is the literal <strong>"J"</strong> of Jugarr. He is the ultimate street-smart broke genius representing the hustle, resourcefulness, and mutual support of Indian campus life. Whenever notes move, gear changes hands, or cash is earned, Juggu is there pulling the strings.
          </p>
          <div className="juggu-badge yellow-accent">
            Jugarr’s Official Hustle Mascot
          </div>
        </div>
      </div>
    </section>
  );
}
