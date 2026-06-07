export const BDTrackerAPI = {
  async fetchWithAuth(url, options = {}, includeAdminToken = true) {
    const headers = { ...options.headers, "Content-Type": "application/json" };

    if (includeAdminToken) {
      const masterToken = localStorage.getItem("bd_admin_token") || "";
      headers["X-Admin-Token"] = masterToken;
    }

    options.headers = headers;
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

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("Backend did not return JSON, treating as raw string.");
      return { share_url: text };
    }
  },

  async getSharedTimeline(token) {
    const response = await this.fetchWithAuth(
      `/api/timeline?token=${encodeURIComponent(token)}`,
      {},
      false,
    );
    if (!response.ok) throw new Error(`Token verification failed.`);
    return await response.json();
  },
};
