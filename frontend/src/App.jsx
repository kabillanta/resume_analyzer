import { useEffect, useState } from "react";
import { fetchJobs, analyzeResume } from "../scripts/api";
import ReactMarkdown from "react-markdown";

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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎯 Resume Analyzer</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Choose Job Role:
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">-- Select --</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} @ {job.company}
              </option>
            ))}
          </select>
        </label>

        <br /><br />

        <label>
          Upload Resume (PDF):
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        <br /><br />

        <button type="submit">Analyze Resume</button>
      </form>

      <br />

      {result && (
        <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem", borderRadius: "5px" }}>
          <h2>AI Feedback:</h2>
          <Reactmarkdown>{result}</Reactmarkdown>
        </div>
      )}
    </div>
  );
}

export default App;
