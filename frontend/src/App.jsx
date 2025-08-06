import { useEffect, useState } from "react";
import { fetchJobs, analyzeResume } from "../scripts/api";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    fetchJobs().then(setJobs);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedJob) {
      alert("Please select a job and upload a resume.");
      return;
    }

    const res = await analyzeResume(file, selectedJob);
    setResult(res.result);
  };

  return (
    <div className="container">
      <h1>🎯 Resume Analyzer</h1>

      <form onSubmit={handleSubmit} className="analyzer-form">
        <label htmlFor="job-select">Choose Job Role</label>
        <select
          id="job-select"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          required
        >
          <option value="">-- Select a job --</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} @ {job.company}
            </option>
          ))}
        </select>

        <label htmlFor="resume-upload">Upload Resume (PDF)</label>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Analyze Resume</button>
      </form>

      {result && (
        <div className="result-box">
          <h2>📋 AI Feedback</h2>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;
