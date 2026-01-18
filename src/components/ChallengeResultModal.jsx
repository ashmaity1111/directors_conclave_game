import "../App.css";

export default function ChallengeResultModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="result-backdrop">
      <div className="result-modal">

        <h1 className="title">🏆 CHALLENGE COMPLETED!</h1>
        <p className="subtitle">
          You have successfully identified all Technology Practice Directors
        </p>

        <div className="cards">
          <Card label="FINAL SCORE" value={data.score} />
          <Card label="CORRECT MATCHES" value={`${data.correct}/${data.total}`} />
          <Card label="ACCURACY" value={`${data.accuracy}%`} />
          <Card label="TOTAL TIME" value={`${data.timeTaken}s`} />
          <Card label="PERFORMANCE" value={data.performance} highlight />
          <Card label="BADGE" value="🎖️" />
        </div>

        <div className="badge-box">
          <strong>🏅 NEEDS PRACTICE PERFORMANCE BADGE EARNED!</strong>
          <p>
            You matched {data.correct} of {data.total} directors with {data.accuracy}% accuracy.
            Review the directory to improve your knowledge.
          </p>
        </div>

        <button className="continue-btn" onClick={onClose}>
          ← Continue Exploring Space
        </button>

      </div>
    </div>
  );
}

const Card = ({ label, value, highlight }) => (
  <div className={`card ${highlight ? "highlight" : ""}`}>
    <div className="card-value">{value}</div>
    <div className="card-label">{label}</div>
  </div>
);
