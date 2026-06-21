async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  algorithms: () => fetch("/api/algorithms").then(handle),
  run: (id, code) =>
    fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, code }),
    }).then(handle),
  reset: (id) => fetch(`/api/reset/${id}`, { method: "POST" }).then(handle),
};
