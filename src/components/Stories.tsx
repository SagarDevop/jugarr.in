import Image from "next/image";
import comicExam from "../../public/assets/comic_exam.png";
import comicDelivery from "../../public/assets/comic_delivery.png";
import comicGigs from "../../public/assets/comic_gigs.png";

export default function Stories() {
  const storiesData = [
    {
      tag: "01 / ACADEMIC HUSTLE",
      title: "The Exam Savior",
      desc: "Who needs standard lectures when Room 304 has the ultimate Exam Cheat-Sheets? Handwritten, comprehensive exam prep packages passed under doors for tea, snacks, or split cash.",
      img: comicExam,
    },
    {
      tag: "02 / LATE NIGHT HUSTLE",
      title: "The 3 AM Maggi Express",
      desc: "Hostel gates close at 11, college hunger peaks at 2 AM. A student-run bicycle delivery network bringing hot Maggi and hot chai straight to hostel lobbies in minutes.",
      img: comicDelivery,
    },
    {
      tag: "03 / TECH HUSTLE",
      title: "The Broke Genius Studio",
      desc: "Designing seed round startup decks for seniors, coding custom websites for college festivals, or building campus projects — funded entirely by local peer-to-peer exchanges.",
      img: comicGigs,
    },
  ];

  return (
    <section id="stories" className="stories-section container">
      <div className="text-center" style={{ marginBottom: "48px" }}>
        <span
          className="font-mono text-outline"
          style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
        >
          REAL CAMPUS LEGENDS
        </span>
        <h2 className="section-title" style={{ marginTop: "0", marginBottom: "12px" }}>
          Campus Hustle Stories
        </h2>
        <div className="editorial-line" style={{ margin: "0 auto" }}></div>
      </div>

      <div className="comic-grid">
        {storiesData.map((story, i) => (
          <div className="comic-panel-card" key={i}>
            <div className="comic-header-tag">{story.tag}</div>
            <div className="comic-image-wrap">
              <Image
                src={story.img}
                alt={story.title}
                className="comic-panel-img"
                placeholder="blur"
              />
            </div>
            <div className="comic-bubble-text">
              <h3 className="comic-title">{story.title}</h3>
              <p className="comic-description">{story.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
