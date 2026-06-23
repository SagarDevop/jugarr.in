import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import rewardsImg from "@/assets/referral_rewards.png";

interface WaitlistStatus {
  name: string;
  email: string;
  referralCode: string;
  referralCount: number;
  referredBy: string;
  rank: number;
  totalCount: number;
}

const MOCK_EVENTS = [
  "🎉 Dev from VIT Vellore just unlocked the Limited Edition Hustle T-Shirt! 👕",
  "🔥 Shreya from SRCC referred 3 friends and won a Pen & Sticker pack! 🖊️",
  "⚡️ Aman from IIT Delhi has climbed 15 ranks in the last hour! 🚀",
  "🎁 Sneha from DTU just claimed a Premium Matte-Finish Journal! 📓",
  "🚀 Kabir from BITS Pilani invited 5 batchmates to the campus network! 🌐",
  "🔥 Alisha from St. Xavier's just unlocked the Founding Member Elite Box! 🎁",
  "🎉 Rahul from IIT Madras just referred 7 friends and won a Notebook! 📓",
  "⚡️ Tanvi from NMIMS has jumped into the Top 10 of their campus! 🏆"
];

export default function Success() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [data, setData] = useState<WaitlistStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  useEffect(() => {
    const eventInterval = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % MOCK_EVENTS.length);
    }, 3000);
    return () => clearInterval(eventInterval);
  }, []);


  useSEO({
    title: "Waitlist Leaderboard | Jugarr",
    description: "Check your waitlist rank, copy your custom referral link, and share to move up the campus queue.",
  });

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchStatus = () => {
      fetch(`${import.meta.env.VITE_API_URL || "https://jugarr-in.onrender.com"}/api/waitlist/status?email=${encodeURIComponent(email)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to find waitlist details. Make sure your email is registered.");
          }
          return res.json();
        })
        .then((status) => {
          setData(status);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching waitlist status:", err);
          setError(err.message || "Failed to load waitlist status.");
          setLoading(false);
        });
    };

    fetchStatus();
    // Poll status every 30 seconds to show live rank updates if someone signs up
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [email]);

  const referralLink = data ? `${window.location.origin}?ref=${data.referralCode}` : "";
  const shareText = `Hey! I just joined the waitlist for Jugarr - India's student-to-student campus marketplace. Join with my link so we both climb the queue! 🚀 ${referralLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="font-mono" style={{ fontSize: "14px", letterSpacing: "0.15em", color: "var(--color-outline)", marginBottom: "16px" }}>
              LOADING LEADERBOARD...
            </div>
            <div style={{ width: "40px", height: "40px", border: "2px solid var(--color-primary)", borderTopColor: "var(--color-yellow-accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: "500px" }}>
            <h1 className="font-display" style={{ fontSize: "36px", marginBottom: "16px", color: "var(--color-primary)" }}>Oops!</h1>
            <p className="font-body text-muted" style={{ marginBottom: "32px", fontSize: "16px" }}>{error || "An unexpected error occurred."}</p>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const referralCount = data ? data.referralCount : 0;

  return (
    <>
      <Header />
      <main style={{ paddingBottom: "96px" }}>
        <section className="container" style={{ paddingTop: "64px", maxWidth: "800px" }}>
          {/* Header Title */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {data ? "YOU ARE IN THE QUEUE" : "JUGARR EXCLUSIVE GIVEAWAY"}
            </span>
            <h1 className="font-display" style={{ fontSize: "40px", marginTop: "12px", marginBottom: "8px" }}>
              {data ? `Welcome to the Hustle, ${data.name.split(" ")[0]}!` : "The Viral Campus Hustle is Live!"}
            </h1>
            <div className="editorial-line" style={{ margin: "12px auto" }}></div>
            <p className="font-body text-muted" style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              {data 
                ? "Your waitlist registration is complete. Read below to see how to climb the queue and secure early platform access."
                : "Earn limited edition college merch (T-Shirts, notebooks, and pens) by inviting batchmates."}
            </p>
          </div>

          {data ? (
            <>
              {/* Stats Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
                marginBottom: "48px"
              }}>
                {/* Rank Card */}
                <div style={{
                  border: "1px solid var(--color-primary)",
                  boxShadow: "10px 10px 0px 0px var(--color-yellow-accent)",
                  backgroundColor: "var(--color-surface-lowest)",
                  padding: "40px",
                  textAlign: "center",
                  position: "relative"
                }}>
                  <span className="font-mono" style={{ fontSize: "11px", letterSpacing: "0.15em", color: "var(--color-outline)", textTransform: "uppercase" }}>
                    YOUR CURRENT RANK
                  </span>
                  <h2 className="font-display" style={{ fontSize: "80px", margin: "16px 0 8px", lineHeight: "1" }}>
                    #{data.rank}
                  </h2>
                  <p className="font-body" style={{ fontSize: "16px", color: "var(--color-primary)" }}>
                    out of <strong>{data.totalCount}</strong> campus members
                  </p>
                </div>

                {/* Referrals Count Card */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  border: "1px solid var(--color-primary)",
                  backgroundColor: "var(--color-surface-low)",
                  padding: "24px 32px"
                }}>
                  <div style={{ textAlign: "left" }}>
                    <span className="font-mono" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-outline)" }}>
                      SUCCESSFUL REFERRALS
                    </span>
                    <h3 className="font-display" style={{ fontSize: "28px", marginTop: "8px" }}>
                      {data.referralCount} Friend{data.referralCount !== 1 && "s"}
                    </h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: "12px", backgroundColor: "var(--color-yellow-accent)", padding: "8px 16px", border: "1px solid var(--color-primary)", fontWeight: "bold" }}>
                      {data.referralCount * 5} RANKS GAINED
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Link & Actions */}
              <div style={{
                border: "1px solid var(--color-primary)",
                boxShadow: "10px 10px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "40px",
                marginBottom: "64px"
              }}>
                <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "12px", textAlign: "left" }}>
                  Beat the Queue: Invite Your Friends
                </h3>
                <p className="font-body text-muted" style={{ fontSize: "15px", marginBottom: "24px", textAlign: "left", lineHeight: "1.6" }}>
                  Move up <strong>5 ranks</strong> on the waitlist for every friend who joins using your link. Get enough referrals to secure founding member benefits.
                </p>

                {/* Link Box */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    display: "flex",
                    border: "1px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-low)",
                    width: "100%"
                  }}>
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      style={{
                        flexGrow: 1,
                        padding: "16px",
                        border: "none",
                        background: "transparent",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                        color: "var(--color-primary)",
                        outline: "none",
                        textOverflow: "ellipsis"
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="font-mono"
                      style={{
                        backgroundColor: copied ? "var(--color-yellow-accent)" : "var(--color-primary)",
                        color: copied ? "var(--color-primary)" : "var(--color-on-primary)",
                        border: "none",
                        borderLeft: "1px solid var(--color-primary)",
                        padding: "0 24px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {copied ? "COPIED!" : "COPY LINK"}
                    </button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn font-mono"
                    style={{
                      flexGrow: 1,
                      textDecoration: "none",
                      backgroundColor: "#25D366",
                      color: "white",
                      borderColor: "var(--color-primary)",
                      textAlign: "center",
                      padding: "14px",
                      fontSize: "11px"
                    }}
                  >
                    Share on WhatsApp
                  </a>
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn font-mono"
                    style={{
                      flexGrow: 1,
                      textDecoration: "none",
                      backgroundColor: "#1DA1F2",
                      color: "white",
                      borderColor: "var(--color-primary)",
                      textAlign: "center",
                      padding: "14px",
                      fontSize: "11px"
                    }}
                  >
                    Share on Twitter
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Guest welcome section */
            <div style={{
              border: "1px solid var(--color-primary)",
              boxShadow: "10px 10px 0px 0px var(--color-primary)",
              backgroundColor: "var(--color-surface-lowest)",
              padding: "40px",
              marginBottom: "48px",
              textAlign: "center"
            }}>
              {/* Promo Merch Image */}
              <div style={{
                width: "100%",
                maxWidth: "500px",
                margin: "0 auto 24px",
                border: "1px solid var(--color-primary)",
                boxShadow: "6px 6px 0px 0px var(--color-yellow-accent)",
                overflow: "hidden",
                backgroundColor: "var(--color-surface-low)"
              }}>
                <img 
                  src={rewardsImg} 
                  alt="Jugarr Giveaway Merch Campaign - T-Shirt, Notebook, and Pen" 
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block"
                  }}
                />
              </div>

              <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.25em", display: "block", marginBottom: "16px", textTransform: "uppercase" }}>
                🔥 LIVE CAMPUS GIVEAWAY 🔥
              </span>
              
              <h2 className="font-display" style={{ fontSize: "36px", marginBottom: "16px", color: "var(--color-primary)" }}>
                Top 20 Campus Members Get Surprise Gifts!
              </h2>
              
              <p className="font-body text-muted" style={{ fontSize: "15px", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto 32px" }}>
                Join the waitlist to receive your custom referral link. For every friend who joins through your link, your queue rank is boosted by <strong>2 positions</strong>, bringing you closer to early beta access and exclusive rewards like <strong>Branded T-Shirts, Premium Matte Journals, and Sleek Pens</strong>!
              </p>

              <a
                href="/?join=true"
                className="btn btn-primary font-mono"
                style={{
                  textDecoration: "none",
                  display: "inline-block",
                  fontSize: "13px",
                  padding: "18px 36px",
                  width: "100%",
                  maxWidth: "400px"
                }}
              >
                JOIN WAITLIST & GET REWARDS &rarr;
              </a>
            </div>
          )}

          {/* Rewards Milestones Quest */}
          <div style={{
            border: "1px solid var(--color-primary)",
            boxShadow: "10px 10px 0px 0px var(--color-yellow-accent)",
            backgroundColor: "var(--color-surface-lowest)",
            padding: "40px",
            marginBottom: "48px",
            position: "relative"
          }}>
            {/* Live Ticker Bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "var(--color-surface-low)",
              border: "1px solid var(--color-primary)",
              padding: "12px 18px",
              marginBottom: "32px",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: "10px",
                fontWeight: "bold",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                padding: "4px 8px",
                borderRadius: "2px",
                textTransform: "uppercase"
              }}>
                <span className="live-pulse" style={{ width: "6px", height: "6px", backgroundColor: "#ff3b30" }}></span>
                LIVE
              </span>
              <div className="live-activity-message font-mono" style={{
                fontSize: "12px",
                color: "var(--color-primary)",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "opacity 0.3s ease",
              }}>
                {MOCK_EVENTS[currentEventIdx]}
              </div>
            </div>

            <div style={{ textAlign: "left", marginBottom: "28px" }}>
              <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-outline)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                REFERRAL QUESTS & GOODIES
              </span>
              <h3 className="font-display" style={{ fontSize: "28px", marginTop: "8px", marginBottom: "8px" }}>
                Claim Limited Edition Jugarr Merch
              </h3>
              <p className="font-body text-muted" style={{ fontSize: "14px" }}>
                Share your referral link with batchmates. As soon as they join, you automatically unlock rewards!
              </p>
            </div>

            {/* If registered user, show progress bar. If guest, show rewards illustration */}
            {data ? (
              /* Progress Bar for logged in referrers */
              <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: "11px", fontWeight: "bold" }}>
                  <span>YOUR PROGRESS: {referralCount} / 25 REFERRALS</span>
                  <span style={{ color: "var(--color-outline)" }}>
                    {referralCount >= 25 ? "MAX REWARDS UNLOCKED! 🎉" : `${Math.max(0, 3 - referralCount)} more for next reward`}
                  </span>
                </div>
                <div style={{
                  width: "100%",
                  height: "14px",
                  backgroundColor: "var(--color-surface-low)",
                  border: "1px solid var(--color-primary)",
                  padding: "2px"
                }}>
                  <div style={{
                    width: `${Math.min((referralCount / 25) * 100, 100)}%`,
                    height: "100%",
                    backgroundColor: "var(--color-yellow-accent)",
                    borderRight: referralCount > 0 ? "1px solid var(--color-primary)" : "none",
                    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}></div>
                </div>
              </div>
            ) : (
              /* Small spacer for guest */
              <div style={{ marginBottom: "12px" }}></div>
            )}

            {/* Milestones Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              textAlign: "left"
            }}>
              {/* Tier 1 */}
              <div style={{
                border: "1px solid var(--color-primary)",
                padding: "20px",
                backgroundColor: referralCount >= 3 ? "var(--color-yellow-accent)" : "var(--color-surface-low)",
                opacity: referralCount >= 3 ? 1 : 0.8,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "150px"
              }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🖊️</div>
                  <h4 className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Pen & Stickers</h4>
                  <p className="font-body" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                    Jugarr Sticker Pack & premium pen.
                  </p>
                </div>
                <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px", textTransform: "uppercase" }}>
                  {referralCount >= 3 ? "🔓 UNLOCKED" : `🔒 3 REF (${referralCount}/3)`}
                </div>
              </div>

              {/* Tier 2 */}
              <div style={{
                border: "1px solid var(--color-primary)",
                padding: "20px",
                backgroundColor: referralCount >= 7 ? "var(--color-yellow-accent)" : "var(--color-surface-low)",
                opacity: referralCount >= 7 ? 1 : 0.8,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "150px"
              }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📓</div>
                  <h4 className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Matte Journal</h4>
                  <p className="font-body" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                    Premium soft-touch notebook.
                  </p>
                </div>
                <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px", textTransform: "uppercase" }}>
                  {referralCount >= 7 ? "🔓 UNLOCKED" : `🔒 7 REF (${referralCount}/7)`}
                </div>
              </div>

              {/* Tier 3 */}
              <div style={{
                border: "1px solid var(--color-primary)",
                padding: "20px",
                backgroundColor: referralCount >= 15 ? "var(--color-yellow-accent)" : "var(--color-surface-low)",
                opacity: referralCount >= 15 ? 1 : 0.8,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "150px"
              }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>👕</div>
                  <h4 className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Hustler T-Shirt</h4>
                  <p className="font-body" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                    Limited edition branded cotton tee.
                  </p>
                </div>
                <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px", textTransform: "uppercase" }}>
                  {referralCount >= 15 ? "🔓 UNLOCKED" : `🔒 15 REF (${referralCount}/15)`}
                </div>
              </div>

              {/* Tier 4 */}
              <div style={{
                border: "1px solid var(--color-primary)",
                padding: "20px",
                backgroundColor: referralCount >= 25 ? "var(--color-yellow-accent)" : "var(--color-surface-low)",
                opacity: referralCount >= 25 ? 1 : 0.8,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "150px"
              }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎁</div>
                  <h4 className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Elite Box</h4>
                  <p className="font-body" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                    Full merch set & lifetime zero fees.
                  </p>
                </div>
                <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px", textTransform: "uppercase" }}>
                  {referralCount >= 25 ? "🔓 UNLOCKED" : `🔒 25 REF (${referralCount}/25)`}
                </div>
              </div>
            </div>
          </div>

          {/* How it Works / Referral Program Card */}
          <div style={{
            border: "1px solid var(--color-primary)",
            backgroundColor: "var(--color-surface-low)",
            padding: "40px",
            textAlign: "left",
            marginBottom: "64px"
          }}>
            <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-outline)", letterSpacing: "0.15em", display: "block", marginBottom: "12px" }}>
              THE JUGARR REFERRAL HUSTLE
            </span>
            <h3 className="font-display" style={{ fontSize: "28px", marginBottom: "20px", color: "var(--color-primary)" }}>
              How the Waitlist Leaderboard Works
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                <span className="font-mono" style={{ fontSize: "12px", backgroundColor: "var(--color-primary)", color: "white", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "bold" }}>
                  1
                </span>
                <div>
                  <h4 className="font-mono" style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                    Share Your Code
                  </h4>
                  <p className="font-body" style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
                    Send your custom referral link to batchmates, hostel corridors, or college WhatsApp groups.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                <span className="font-mono" style={{ fontSize: "12px", backgroundColor: "var(--color-primary)", color: "white", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "bold" }}>
                  2
                </span>
                <div>
                  <h4 className="font-mono" style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                    Gain Rank Boosts
                  </h4>
                  <p className="font-body" style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
                    For every friend who successfully registers, you automatically leapfrog <strong>5 ranks</strong> ahead of everyone else on the queue.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                <span className="font-mono" style={{ fontSize: "12px", backgroundColor: "var(--color-primary)", color: "white", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "bold" }}>
                  3
                </span>
                <div>
                  <h4 className="font-mono" style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                    Unlock Founding Privileges
                  </h4>
                  <p className="font-body" style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
                    Top 10 referrers on each campus unlock the **Founding Member Badge**, granting lifetime zero-fee listings and early access to the Jugarr mobile application beta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive blog posts section */}
          <div style={{ borderTop: "1px solid var(--color-primary)", paddingTop: "48px" }}>
            <h3 className="font-display" style={{ fontSize: "28px", marginBottom: "32px", textAlign: "center" }}>
              Explore the Campus Hustle Journal
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px"
            }}>
              {/* Blog Card 1 */}
              <Link to="/blog/5-smart-campus-side-hustles-indian-students" className="blog-card" style={{ textDecoration: "none" }}>
                <div className="blog-card-meta">
                  <span className="blog-card-category font-mono">EARN</span>
                  <span className="blog-card-readtime font-mono">5 min read</span>
                </div>
                <h4 className="blog-card-title">5 Smart Campus Side Hustles for Indian College Students</h4>
                <p className="blog-card-excerpt">
                  Discover practical, campus-first side hustles to make money using your coding, design, writing, or tutoring skills right inside your university campus.
                </p>
                <div className="blog-card-footer">
                  <span className="blog-card-date">May 28, 2026</span>
                  <span className="blog-card-link font-mono">READ ARTICLE &rarr;</span>
                </div>
              </Link>

              {/* Blog Card 2 */}
              <Link to="/blog/from-jugaad-to-jugarr" className="blog-card" style={{ textDecoration: "none" }}>
                <div className="blog-card-meta">
                  <span className="blog-card-category font-mono">CAMPUS LIFE</span>
                  <span className="blog-card-readtime font-mono">5 min read</span>
                </div>
                <h4 className="blog-card-title">From Jugaad to Jugarr: Building India's Student Marketplace</h4>
                <p className="blog-card-excerpt">
                  Discover how Jugarr, inspired by the Indian spirit of Jugaad, is building a structured student marketplace for buying, selling, and earning on campus.
                </p>
                <div className="blog-card-footer">
                  <span className="blog-card-date">May 31, 2026</span>
                  <span className="blog-card-link font-mono">READ ARTICLE &rarr;</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
