export const BDTrackerAPI = {
  async fetchWithAuth(url, options = {}) {
    const masterToken = localStorage.getItem("bd_admin_token") || "";

    options.headers = {
      ...options.headers,
      "X-Admin-Token": masterToken,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, options);
    return response;
  },

  async getTimeline() {
    const response = await this.fetchWithAuth("/api/timeline");
    if (!response.ok) throw new Error(`HTTP network error: ${response.status}`);
    return await response.json();
  },

  async submitEntry(payload) {
    const response = await this.fetchWithAuth("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Database transmission rejected.");
    }
    return await response.json();
  },

  async generateShareLink(duration = 2) {
    const response = await this.fetchWithAuth("/api/share/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration_hours: duration }),
    });

    if (!response.ok)
      throw new Error(`Token factory failure: ${response.status}`);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return { share_url: text };
    }
  },

  async getSharedTimeline(token) {
    const response = await fetch(
      `/api/share/timeline-data?token=${encodeURIComponent(token)}`,
    );
    if (!response.ok) throw new Error(`Token verification failed.`);
    return await response.json();
  },
};
