"use client";

import { useState } from "react";

const faqData = [
  {
    question: "What is Jugarr?",
    answer:
      "Jugarr is India\u2019s student-to-student campus marketplace where college students can buy, sell, trade, and earn within their own university community. Think of it as a trusted, campus-only marketplace built exclusively for students.",
  },
  {
    question: "How does Jugarr work?",
    answer:
      "Students sign up with their college email, browse or list items and services, and connect directly with other verified students on campus. No middlemen, no shipping \u2014 just meet up on campus and exchange.",
  },
  {
    question: "How can students sell old books on Jugarr?",
    answer:
      "Simply create a listing for your old textbooks with photos and a price. Students in your college searching for those books will find your listing and reach out directly.",
  },
  {
    question: "Can students buy second-hand furniture on Jugarr?",
    answer:
      "Yes. Graduating students frequently list desks, chairs, mattresses, and shelves at affordable prices. Buyers can inspect items on campus before purchasing.",
  },
  {
    question: "Is Jugarr free to use?",
    answer:
      "Yes, Jugarr is completely free. There are no listing fees, no commissions, and no hidden charges. Every transaction is direct and between students.",
  },
  {
    question: "Which colleges can join Jugarr?",
    answer:
      "Jugarr is currently launching across select Indian colleges. Join the waitlist with your college email, and we will notify you when your campus goes live.",
  },
  {
    question: "How does the Jugarr waitlist work?",
    answer:
      "Enter your name and college email on the waitlist form. Once enough students from your campus sign up, we activate Jugarr for your college. Early members get priority access and founding member benefits.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "faq-item-open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="faq-question-num font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question-text font-display">{item.question}</span>
                <span className="faq-toggle-icon" aria-hidden="true">
                  {openIndex === index ? "\u2212" : "+"}
                </span>
              </button>
              <div
                className="faq-answer"
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p className="faq-answer-text font-body text-muted">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
