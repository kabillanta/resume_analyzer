export const fetchJobs = async () => {
  const res = await fetch("http://localhost:8000/jobs");
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
};

export const analyzeResume = async (file, jobId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_id", jobId);

  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to analyze resume");

  return res.json();
};