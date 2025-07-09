
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("🙂");
  const navigate = useNavigate();

  const motivationalQuotes = [
    "🌟 You are stronger than you think!",
    "🌈 Each day is a new chance to grow.",
    "💪 Keep going, your future self will thank you!",
    "✨ Focus on the good and keep writing.",
    "☀️ You’re doing amazing. Don’t give up!"
  ];
  const [quote, setQuote] = useState("");

  const fetchEntries = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/diary", {
      headers: { Authorization: token },
    });
    setEntries(res.data);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/diary",
      { entry, mood },
      { headers: { Authorization: token } }
    );
    setEntry("");
    fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
    setQuote(
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    );
  }, []);

  return (
    <div className="card">
      <h2>📖 Your Diary</h2>
      <div className="quote-banner">{quote}</div>
      <textarea
        placeholder="Write your thoughts here..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      /><br />
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="😀">😀 Happy</option>
        <option value="😢">😢 Sad</option>
        <option value="😐">😐 Neutral</option>
      </select>
      <button onClick={handleSave}>Save Entry</button>
      <hr />
      {entries.map((e, i) => (
        <div key={i} className="card">
          <p>{e.entry}</p>
          <p>Mood: {e.mood}</p>
        </div>
      ))}
      <button onClick={() => navigate("/profile")}>👤 Go to Profile</button>
    </div>
  );
}

export default Dashboard;
