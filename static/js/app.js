import { BDTrackerAPI } from "/static/js/api.js";

export class UIThemeEngine {
                    static getMoodTheme(val) {
                      if (val === null) return { text: "text-zinc-500", bg: "bg-zinc-950 border-zinc-800/80" };
                      if (val <= 3) return { text: "text-blue-400 font-semibold", bg: "bg-blue-950/30 border-blue-900/50" };
                      if (val >= 8) return { text: "text-orange-400 font-semibold", bg: "bg-orange-950/30 border-orange-900/50" };
                      return { text: "text-emerald-400 font-semibold", bg: "bg-emerald-950/20 border-emerald-900/40" };
                    }

                    static getEnergyTheme(val) {
                      if (val === null) return { text: "text-zinc-500", bg: "bg-zinc-950 border-zinc-800/80" };
                      if (val <= 3) return { text: "text-zinc-400 font-semibold", bg: "bg-zinc-900 border-zinc-800" };
                      if (val >= 8) return { text: "text-amber-400 font-semibold", bg: "bg-amber-950/30 border-amber-900/50" };
                      return { text: "text-emerald-400 font-semibold", bg: "bg-emerald-950/20 border-emerald-900/40" };
                    }

            static getSpectrumColor(type, val) {
  if (type === 'mood') {
    const moodMap = {
      1: "#4f7bb0", // Deep Dusty Blue
      2: "#729ecb", 
      3: "#99bde2", // Distinct Muted Ice Blue
      4: "#94d1b2", // Soft Sage Green
      5: "#72c296", // Matte Emerald Baseline
      6: "#53b37d", 
      7: "#e1c263", // Muted Ochre Yellow
      8: "#e39f6d", // Dusty Apricot
      9: "#e58273", // Soft Terracotta
      10: "#d95f5f" // Matte Crimson
    };
    return moodMap[val];
  } else {
    const energyMap = {
      1: "#788896", // Muted Steel
      2: "#94a4b0", 
      3: "#b0bcc8", // Clear Cold Gray
      4: "#7ec9be", // Light Matte Teal
      5: "#5cbdae", // Focused Teal Center
      6: "#3daea0", 
      7: "#d9b955", // Dull Gold
      8: "#c599d6", // Dusty Lavender
      9: "#b07ec5", // Muted Amethyst
      10: "#965fb0" // Deep Matte Purple
    };
    return energyMap[val];
  }
}
                  }

                  class AppController {
                    constructor() {
                      this.data = [];
                      this.chart = null;
                      this.selectedMood = null;
                      this.selectedEnergy = null;
                      this.activeStateFilter = "All";
                      this.activeTimeWindow = "All";

                      this.elements = {
                        generateShareLinkBtn: document.getElementById("generateShareLinkBtn"),
                        statusBadge: document.getElementById("statusBadge"),
                        matrixTableBody: document.getElementById("matrixTableBody"),
                        openIngestModalBtn: document.getElementById("openIngestModalBtn"),
                        closeIngestModalBtn: document.getElementById("closeIngestModalBtn"),
                        closeViewerModalBtn: document.getElementById("closeViewerModalBtn"),
                        ingestModal: document.getElementById("ingestModal"),
                        viewerModal: document.getElementById("viewerModal"),
                        ingestionForm: document.getElementById("ingestionForm"),
                        modalViewerTitle: document.getElementById("modalViewerTitle"),
                        modalViewerMetrics: document.getElementById("modalViewerMetrics"),
                        modalViewerTags: document.getElementById("modalViewerTags"),
                        modalViewerContent: document.getElementById("modalViewerContent"),
                        moodTrackContainer: document.getElementById("moodTrackContainer"),
                        energyTrackContainer: document.getElementById("energyTrackContainer"),
                        formMood: document.getElementById("formMood"),
                        formEnergy: document.getElementById("formEnergy"),
                        moodPreview: document.getElementById("moodSelectorPreview"),
                        energyPreview: document.getElementById("energySelectorPreview"),
                        stateFilterGroup: document.getElementById("stateFilterGroup"),
                        timeFilterGroup: document.getElementById("timeFilterGroup"),
                        ctx: document.getElementById("timelineChart").getContext("2d"),
                      };

                      this.buildSelectorTracks();
                      this.bindEvents();
                      this.init();
                    }
      
buildSelectorTracks() {
  ['mood', 'energy'].forEach(type => {
    const container = type === 'mood' ? this.elements.moodTrackContainer : this.elements.energyTrackContainer;
    if (!container) return;    
    container.innerHTML = '';
    
    container.className = "flex gap-1 w-full";

    for (let i = 1; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      
      btn.textContent = i;
      btn.dataset.value = i;
      
      btn.className = "flex-1 h-12 flex items-center justify-center font-bold text-xs transition-all duration-200 border border-transparent select-none rounded-sm cursor-pointer";
      
      const bgColor = UIThemeEngine.getSpectrumColor(type, i);
      btn.style.backgroundColor = bgColor;
      btn.style.color = "#0f172a"; 
      btn.addEventListener('click', () => {
        this.setTrackMetric(type, i);
      });

      container.appendChild(btn);
    }
  });
}
                    setTrackMetric(type, val) {
                      if (type === 'mood') {
                        this.selectedMood = val;
                        this.elements.formMood.value = val;
                        const desc = val <= 3 ? "Low Mood Drop" : val >= 8 ? "Elevated Mania / Hypomania" : "Stable Baseline";
                        this.elements.moodPreview.innerHTML = `Selected: <span class="font-semibold" style="color:${UIThemeEngine.getSpectrumColor('mood', val)}">${desc} (${val}/10)</span>`;
                      } else {
                        this.selectedEnergy = val;
                        this.elements.formEnergy.value = val;
                        const desc = val <= 3 ? "Drained / Sluggish Capacity" : val >= 8 ? "Hyperactive Hyper-Surge" : "Balanced Capacity";
                        this.elements.energyPreview.innerHTML = `Selected: <span class="font-semibold" style="color:${UIThemeEngine.getSpectrumColor('energy', val)}">${desc} (${val}/10)</span>`;
                      }

                      const container = type === 'mood' ? this.elements.moodTrackContainer : this.elements.energyTrackContainer;
                      const buttons = container.getElementsByTagName('button');
                      for (let i = 0; i < buttons.length; i++) {
                        const btnVal = parseInt(buttons[i].dataset.value);
                        if (btnVal === val) {
                          buttons[i].classList.add("ring-2", "ring-white", "ring-opacity-80");
                          buttons[i].style.opacity = "1";
                        } else {
                          buttons[i].classList.remove("ring-2", "ring-white", "ring-opacity-80");
                          buttons[i].style.opacity = "0.3";
                        }
                      }
                    }

                    bindEvents() {
                      this.elements.openIngestModalBtn.addEventListener("click", () => this.toggleModal(this.elements.ingestModal, true));
                      this.elements.closeIngestModalBtn.addEventListener("click", () => this.toggleModal(this.elements.ingestModal, false));
                      this.elements.closeViewerModalBtn.addEventListener("click", () => this.toggleModal(this.elements.viewerModal, false));
                      this.elements.ingestionForm.addEventListener("submit", (e) => this.handleSubmission(e));
                      this.elements.generateShareLinkBtn.addEventListener("click", () => this.handleShareLinkGeneration());

                      this.elements.stateFilterGroup.addEventListener("click", (e) => {
                        const btn = e.target.closest("button");
                        if (!btn) return;
                        this.activeStateFilter = btn.dataset.filter;
                        Array.from(this.elements.stateFilterGroup.children).forEach(b => b.className = "px-3 py-1.5 rounded-md font-medium text-zinc-400 hover:text-zinc-200");
                        btn.className = "px-3 py-1.5 rounded-md font-medium text-emerald-400 bg-zinc-900";
                        this.applyFiltersAndRedraw();
                      });

                      this.elements.timeFilterGroup.addEventListener("click", (e) => {
                        const btn = e.target.closest("button");
                        if (!btn) return;
                        this.activeTimeWindow = btn.dataset.window;
                        Array.from(this.elements.timeFilterGroup.children).forEach(b => b.className = "px-3 py-1.5 rounded-md font-medium text-zinc-400 hover:text-zinc-200");
                        btn.className = "px-3 py-1.5 rounded-md font-medium text-emerald-400 bg-zinc-900";
                        this.applyFiltersAndRedraw();
                      });

                      window.addEventListener("click", (e) => {
                        if (e.target === this.elements.ingestModal) this.toggleModal(this.elements.ingestModal, false);
                        if (e.target === this.elements.viewerModal) this.toggleModal(this.elements.viewerModal, false);
                      });
                    }

                    toggleModal(modalElement, open) {
                      if (open) {
                        modalElement.classList.remove("hidden");
                      } else {
                        modalElement.classList.add("hidden");
                        if (modalElement === this.elements.ingestModal) this.resetFormState();
                      }
                    }
async handleShareLinkGeneration() {
                      const originalText = this.elements.generateShareLinkBtn.innerHTML;
                      
                      this.elements.generateShareLinkBtn.innerHTML = `
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        PROVISIONING...
                      `;
                      this.elements.generateShareLinkBtn.disabled = true;

                      try {
                        // Default to the secure 2-hour window
                        const response = await fetch("/api/share/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ duration_hours: 2 })
                        });

                        if (!response.ok) throw new Error("Backend token generation failed");

                        const data = await response.json();
                        const absoluteUrl = `${window.location.origin}${data.share_url}`;

                        await navigator.clipboard.writeText(absoluteUrl);
                        this.showToast("CAPABILITY KEY COPIED (2H VALIDITY)", "success");

                      } catch (error) {
                        console.error("Link generation error:", error);
                        this.showToast("FAILED TO PROVISION CAPABILITY KEY", "error");
                      } finally {
                        this.elements.generateShareLinkBtn.innerHTML = originalText;
                        this.elements.generateShareLinkBtn.disabled = false;
                      }
                    }

                    showToast(message, type = "success") {
                      const toast = document.createElement("div");
                      
                      const borderColor = type === "success" ? "border-emerald-500/50" : "border-rose-500/50";
                      const textColor = type === "success" ? "text-emerald-400" : "text-rose-400";
                      const prefix = type === "success" ? "[ OK ]" : "[ ERR ]";

                      toast.className = `fixed top-6 right-6 bg-zinc-950 border ${borderColor} ${textColor} px-4 py-3 rounded-lg shadow-2xl font-mono text-xs font-semibold z-50 flex items-center gap-3 tracking-wide transform transition-all duration-300 translate-y-0 opacity-100`;
                      toast.innerHTML = `<span>${prefix}</span> <span>${message}</span>`;

                      document.body.appendChild(toast);

                      // Fade out and purge from DOM after 3 seconds
                      setTimeout(() => {
                        toast.classList.remove("translate-y-0", "opacity-100");
                        toast.classList.add("-translate-y-4", "opacity-0");
                        setTimeout(() => toast.remove(), 300);
                      }, 3000);
                    }

                    resetFormState() {
                      this.selectedMood = null;
                      this.selectedEnergy = null;
                      this.elements.formMood.value = "";
                      this.elements.formEnergy.value = "";
                      document.getElementById("formJournal").value = "";

                      const checkboxes = this.elements.ingestionForm.querySelectorAll('input[type="checkbox"]');
                      checkboxes.forEach(cb => cb.checked = false);

                      this.elements.moodPreview.innerText = "Select a level from the track above";
                      this.elements.energyPreview.innerText = "Select a level from the track above";

                      ['mood', 'energy'].forEach(t => {
                        const c = t === 'mood' ? this.elements.moodTrackContainer : this.elements.energyTrackContainer;
                        Array.from(c.getElementsByTagName('button')).forEach(b => b.style.opacity = "1");
                      });
                    }

                    escapeHTML(str) {
                      if (!str) return "";
                      const div = document.createElement("div");
                      div.appendChild(document.createTextNode(str));
                      return div.innerHTML;
                    }

                    async init() {
                      try {
                        const res = await fetch("/api/timeline");
                        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                        this.data = await res.json();

                        this.renderChart();
                        this.renderMatrix();
                        this.updateStatus("Live", "bg-zinc-900 text-emerald-400 border border-zinc-800/80");
                      } catch (error) {
                        console.error("Pipeline failure:", error);
                        this.updateStatus("Disconnected", "bg-zinc-900 text-rose-400 border border-zinc-800/80");
                      }
                    }

                    updateStatus(msg, classes) {
                      this.elements.statusBadge.className = `px-2.5 py-0.5 text-xs font-medium rounded-full ${classes}`;
                      this.elements.statusBadge.innerText = msg;
                    }

                    matchesFilter(entry, filter) {
                      if (filter === "All") return true;
                      if (filter === "Mixed") return entry.is_mixed_state;
                      if (filter === "Depressive") return entry.is_depressive_state;
                      if (filter === "Hypomanic") return entry.is_hypomanic_state;
                      if (filter === "Baseline") return !entry.is_mixed_state && !entry.is_depressive_state && !entry.is_hypomanic_state;
                      return true;
                    }

                    applyFiltersAndRedraw() {
                      this.renderMatrix();

                      if (this.chart) {
                        let minTime = null;
                        const now = Date.now();
                        if (this.activeTimeWindow === "1W") minTime = now - (7 * 24 * 60 * 60 * 1000);
                        else if (this.activeTimeWindow === "1M") minTime = now - (30 * 24 * 60 * 60 * 1000);
                        else if (this.activeTimeWindow === "3M") minTime = now - (90 * 24 * 60 * 60 * 1000);

                        if (minTime) {
                          this.chart.options.scales.x.min = minTime;
                        } else {
                          delete this.chart.options.scales.x.min;
                        }
                        this.chart.update();
                      }
                    }

                    renderMatrix() {
                      this.elements.matrixTableBody.innerHTML = "";
                      const fragment = document.createDocumentFragment();

                      [...this.data].reverse().forEach((entry, reverseIdx) => {
                        const trueIdx = this.data.length - 1 - reverseIdx;

                        if (!this.matchesFilter(entry, this.activeStateFilter)) return;

                        const tr = document.createElement("tr");
                        let rowStyleClasses = "cursor-pointer transition border-b border-zinc-800/30 select-none hover:bg-zinc-900/60 ";
                        let badgeTag = '<span class="text-zinc-500 font-medium text-xs pr-2">Baseline</span>';

                        if (entry.mood === null && entry.energy === null && entry.has_journal) {
                          rowStyleClasses += "bg-emerald-950/10 border-l-2 border-l-emerald-500/40";
                          badgeTag = '<span class="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs px-2.5 py-0.5 rounded-md font-medium">Narrative Only</span>';
                        } else if (entry.is_mixed_state) {
                          rowStyleClasses += "bg-rose-950/20 border-l-2 border-l-rose-500/60";
                          badgeTag = '<span class="bg-rose-950/60 text-rose-400 border border-rose-800/60 text-xs px-2.5 py-0.5 rounded-md font-medium">Mixed Phase</span>';
                        } else if (entry.is_depressive_state) {
                          rowStyleClasses += "bg-blue-950/15 border-l-2 border-l-blue-500/50";
                          badgeTag = '<span class="bg-blue-950/60 text-blue-400 border border-blue-800/60 text-xs px-2.5 py-0.5 rounded-md font-medium">Depressive</span>';
                        } else if (entry.is_hypomanic_state) {
                          rowStyleClasses += "bg-amber-950/15 border-l-2 border-l-amber-500/50";
                          badgeTag = '<span class="bg-amber-950/50 text-amber-400 border border-amber-800/60 text-xs px-2.5 py-0.5 rounded-md font-medium">Hypomanic</span>';
                        }

                        tr.className = rowStyleClasses;
                        tr.addEventListener("click", () => this.viewEntry(trueIdx));

                        const moodTheme = UIThemeEngine.getMoodTheme(entry.mood);
                        const energyTheme = UIThemeEngine.getEnergyTheme(entry.energy);

                        let textDisplay = entry.has_journal ? entry.journal_snippet : "No written narrative recorded.";
                        if (entry.trigger_tags && entry.trigger_tags.length > 0) {
                          const tagsBlob = entry.trigger_tags.map(t => `[${t}]`).join(" ");
                          textDisplay = `<span class="text-emerald-400/90 font-medium">${tagsBlob}</span> ${entry.has_journal ? '— ' + textDisplay : ''}`;
                        }

                        tr.innerHTML = `
                          <td class="py-3.5 px-4 font-medium text-zinc-400 w-44">${entry.timestamp}</td>
                          <td class="py-3.5 px-4 max-w-xl truncate text-zinc-300 font-normal">${textDisplay}</td>
                          <td class="py-2 px-4 text-center w-24">
                            <span class="px-2 py-0.5 rounded text-xs border ${moodTheme.text} ${moodTheme.bg}">${entry.mood ?? "-"}</span>
                          </td>
                          <td class="py-2 px-4 text-center w-24">
                            <span class="px-2 py-0.5 rounded text-xs border ${energyTheme.text} ${energyTheme.bg}">${entry.energy ?? "-"}</span>
                          </td>
                          <td class="py-3.5 px-4 text-right w-32">${badgeTag}</td>
                        `;
                        fragment.appendChild(tr);
                      });

                      this.elements.matrixTableBody.appendChild(fragment);
                    }

                    viewEntry(index) {
                      const entry = this.data[index];
                      if (!entry) return;

                      this.elements.modalViewerTitle.innerText = `Recorded Entry — ${entry.timestamp}`;

                      const moodTheme = UIThemeEngine.getMoodTheme(entry.mood);
                      const energyTheme = UIThemeEngine.getEnergyTheme(entry.energy);

                      let stateBanner = "";
                      if (entry.mood === null && entry.energy === null && entry.has_journal) {
                        stateBanner = '<span class="bg-zinc-950 border border-zinc-800 text-emerald-400 px-3 py-1 rounded-lg font-medium">Narrative Shift Stream Only</span>';
                      } else if (entry.is_mixed_state) {
                        stateBanner = '<span class="bg-rose-950/40 border border-rose-900/60 text-rose-400 px-3 py-1 rounded-lg font-medium">Mixed State Triggered</span>';
                      } else if (entry.is_depressive_state) {
                        stateBanner = '<span class="bg-blue-950/40 border border-blue-900/60 text-blue-400 px-3 py-1 rounded-lg font-medium">Depressive Signatures Flagged</span>';
                      } else if (entry.is_hypomanic_state) {
                        stateBanner = '<span class="bg-amber-950/40 border border-amber-900/60 text-amber-400 px-3 py-1 rounded-lg font-medium">Hypomanic Phase Flagged</span>';
                      }

                      this.elements.modalViewerMetrics.innerHTML = `
                        <span class="px-3 py-1 rounded-lg border ${moodTheme.text} ${moodTheme.bg}">Mood Score: ${entry.mood ?? "N/A"}</span>
                        <span class="px-3 py-1 rounded-lg border ${energyTheme.text} ${energyTheme.bg}">Energy Capacity: ${entry.energy ?? "N/A"}</span>
                        ${stateBanner}
                      `;

                      this.elements.modalViewerTags.innerHTML = "";
                      if (entry.trigger_tags && entry.trigger_tags.length > 0) {
                        entry.trigger_tags.forEach(tag => {
                          const span = document.createElement("span");
                          span.className = "bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium shadow-xs";
                          span.innerText = tag;
                          this.elements.modalViewerTags.appendChild(span);
                        });
                      } else {
                        this.elements.modalViewerTags.innerHTML = '<span class="text-zinc-600 italic">No static category vector tags declared.</span>';
                      }

                      this.elements.modalViewerContent.innerHTML = entry.has_journal
                        ? this.escapeHTML(entry.journal_text || entry.journal_snippet)
                        : '<span class="text-zinc-500 italic">No descriptive narrative details accompanied this entry.</span>';

                      this.toggleModal(this.elements.viewerModal, true);
                    }

                    async handleSubmission(event) {
                      event.preventDefault();

                      const moodVal = parseInt(this.elements.formMood.value);
                      const energyVal = parseInt(this.elements.formEnergy.value);
                      const journalVal = document.getElementById("formJournal").value || "";

                      const checkedBoxes = this.elements.ingestionForm.querySelectorAll('input[name="triggerTag"]:checked');
                      const selectedTags = Array.from(checkedBoxes).map(cb => cb.value);

                      if (isNaN(moodVal) && isNaN(energyVal) && !journalVal.trim() && selectedTags.length === 0) {
                        alert("Please provide metrics, vector tags, or a journal narrative before committing.");
                        return;
                      }

                      const payload = {
                        mood: isNaN(moodVal) ? null : moodVal,
                        energy: isNaN(energyVal) ? null : energyVal,
                        journal_text: journalVal.trim() || null,
                        trigger_tags: selectedTags,
                        timestamp: null
                      };

                      try {
                        const res = await fetch("/api/entries", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload)
                        });

                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.detail || "Database submission rejection.");
                        }

                        this.toggleModal(this.elements.ingestModal, false);
                        await this.init();

                        if (this.data.length > 0) {
                          this.viewEntry(this.data.length - 1);
                        }
                      } catch (error) {
                        alert(`Error handling submission: ${error.message}`);
                      }
                    }

                    renderChart() {
                      if (this.chart) this.chart.destroy();

                      const chartLabels = this.data.map((d) => d.date_formatted);
                      const moodDataset = this.data.map((d) => ({ x: new Date(d.timestamp), y: d.mood }));
                      const energyDataset = this.data.map((d) => ({ x: new Date(d.timestamp), y: d.energy }));

                      const noteDataset = this.data.map((d) => {
                        if (!d.has_journal && (!d.trigger_tags || d.trigger_tags.length === 0)) return { x: new Date(d.timestamp), y: null };
                        if (d.mood === null && d.energy === null) return { x: new Date(d.timestamp), y: 10 };
                        return { x: new Date(d.timestamp), y: null };
                      });

                      const alertBandsPlugin = {
                        id: 'alertBands',
                        beforeDatasetsDraw: (chart) => {
                          const { ctx, chartArea, scales: { x } } = chart;
                          ctx.save();

                          for (let i = 0; i < this.data.length; i++) {
                            const currentEntry = this.data[i];
                            const nextEntry = this.data[i + 1];
                            const prevEntry = this.data[i - 1];

                            let stateType = null;
                            if (currentEntry.is_mixed_state) stateType = 'mixed';
                            else if (currentEntry.is_depressive_state) stateType = 'depressive';
                            else if (currentEntry.is_hypomanic_state) stateType = 'hypomanic';

                            if (!stateType) continue;

                            const pathIsFocused = this.matchesFilter(currentEntry, this.activeStateFilter);
                            const opacityScale = pathIsFocused ? 0.12 : 0.02;

                            if (stateType === 'mixed') ctx.fillStyle = `rgba(244, 63, 94, ${opacityScale})`;
                            else if (stateType === 'depressive') ctx.fillStyle = `rgba(59, 130, 246, ${opacityScale})`;
                            else if (stateType === 'hypomanic') ctx.fillStyle = `rgba(245, 158, 11, ${opacityScale})`;

                            const currentX = x.getPixelForValue(new Date(currentEntry.timestamp));

                            let nextSharesState = false;
                            if (nextEntry) {
                              if (stateType === 'mixed' && nextEntry.is_mixed_state) nextSharesState = true;
                              if (stateType === 'depressive' && nextEntry.is_depressive_state) nextSharesState = true;
                              if (stateType === 'hypomanic' && nextEntry.is_hypomanic_state) nextSharesState = true;
                            }

                            let prevSharedState = false;
                            if (prevEntry) {
                              if (stateType === 'mixed' && prevEntry.is_mixed_state) prevSharedState = true;
                              if (stateType === 'depressive' && prevEntry.is_depressive_state) prevSharedState = true;
                              if (stateType === 'hypomanic' && prevEntry.is_hypomanic_state) prevSharedState = true;
                            }

                            if (nextSharesState) {
                              const nextX = x.getPixelForValue(new Date(nextEntry.timestamp));
                              ctx.fillRect(currentX, chartArea.top, nextX - currentX, chartArea.height);
                            }

                            if (!nextSharesState && !prevSharedState) {
                              const leftBoundary = prevEntry
                                ? currentX - ((currentX - x.getPixelForValue(new Date(prevEntry.timestamp))) * 0.4)
                                : currentX - 10;

                              const rightBoundary = nextEntry
                                ? currentX + ((x.getPixelForValue(new Date(nextEntry.timestamp)) - currentX) * 0.4)
                                : currentX + 10;

                              ctx.fillRect(leftBoundary, chartArea.top, rightBoundary - leftBoundary, chartArea.height);
                            }
                          }
                          ctx.restore();
                        }
                      };

                      this.chart = new Chart(this.elements.ctx, {
                        type: "line",
                        plugins: [alertBandsPlugin],
                        data: {
                          labels: chartLabels,
                          datasets: [
                            {
                              label: "Mood Spectrum",
                              data: moodDataset,
                              borderColor: "#3b82f6",
                              backgroundColor: "#3b82f6",
                              tension: 0.3,
                              pointStyle: this.data.map((d) => (d.has_journal || (d.trigger_tags && d.trigger_tags.length > 0)) ? "rectRot" : "circle"),
                              pointRadius: this.data.map((d) => d.mood === null ? 0 : ((d.has_journal || (d.trigger_tags && d.trigger_tags.length > 0)) ? 5.5 : 3.5)),
                              pointHoverRadius: 7,
                              spanGaps: true,
                              segment: {
                                borderColor: (ctx) => {
                                  if (this.activeStateFilter === "All") return "#3b82f6";
                                  const idx = ctx.p1DataIndex;
                                  const match = this.matchesFilter(this.data[idx], this.activeStateFilter);
                                  return match ? "#3b82f6" : "rgba(59, 130, 246, 0.12)";
                                }
                              }
                            },
                            {
                              label: "Energy Metric",
                              data: energyDataset,
                              borderColor: "#f59e0b",
                              backgroundColor: "#f59e0b",
                              tension: 0.3,
                              pointStyle: this.data.map((d) => (d.has_journal || (d.trigger_tags && d.trigger_tags.length > 0)) ? "rectRot" : "circle"),
                              pointRadius: this.data.map((d) => d.energy === null ? 0 : ((d.has_journal || (d.trigger_tags && d.trigger_tags.length > 0)) ? 5.5 : 3.5)),
                              pointHoverRadius: 7,
                              spanGaps: true,
                              segment: {
                                borderColor: (ctx) => {
                                  if (this.activeStateFilter === "All") return "#f59e0b";
                                  const idx = ctx.p1DataIndex;
                                  const match = this.matchesFilter(this.data[idx], this.activeStateFilter);
                                  return match ? "#f59e0b" : "rgba(245, 158, 11, 0.12)";
                                }
                              }
                            },
                            {
                              label: "Journal/Trigger Logs [N]",
                              data: noteDataset,
                              borderColor: "transparent",
                              backgroundColor: "#10b981",
                              pointBorderColor: "#059669",
                              pointStyle: "triangle",
                              pointRadius: 6,
                              pointHoverRadius: 9,
                              showLine: false,
                            }
                          ],
                        },
                        options: {
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          elements: {
                            point: {
                              backgroundColor: (ctx) => {
                                if (this.activeStateFilter === "All" || ctx.dataIndex === undefined) {
                                  return ctx.dataset.label === "Mood Spectrum" ? "#3b82f6" : "#f59e0b";
                                }
                                const match = this.matchesFilter(this.data[ctx.dataIndex], this.activeStateFilter);
                                if (ctx.dataset.label === "Mood Spectrum") return match ? "#3b82f6" : "rgba(59, 130, 246, 0.15)";
                                return match ? "#f59e0b" : "rgba(245, 158, 11, 0.15)";
                              },
                              borderColor: (ctx) => {
                                if (this.activeStateFilter === "All" || ctx.dataIndex === undefined) {
                                  return ctx.dataset.label === "Mood Spectrum" ? "#3b82f6" : "#f59e0b";
                                }
                                const match = this.matchesFilter(this.data[ctx.dataIndex], this.activeStateFilter);
                                if (ctx.dataset.label === "Mood Spectrum") return match ? "#3b82f6" : "rgba(59, 130, 246, 0.05)";
                                return match ? "#f59e0b" : "rgba(245, 158, 11, 0.05)";
                              }
                            }
                          },
                          scales: {
                            y: {
                              min: 1,
                              max: 10,
                              grid: { color: "rgba(63, 63, 70, 0.25)", drawBorder: false },
                              ticks: { color: "#71717a" },
                            },
                            x: {
                              type: "linear",
                              grid: { color: "rgba(63, 63, 70, 0.35)" },
                              ticks: {
                                color: "#71717a",
                                maxTicksLimit: 8,
                                font: { size: 11 },
                                callback: function (value) {
                                  const date = new Date(value);
                                  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
                                },
                              },
                            },
                          },
                          plugins: {
                            legend: { labels: { color: "#a1a1aa", usePointStyle: true } },
                            tooltip: {
                              backgroundColor: "#18181b",
                              titleColor: "#10b981",
                              borderColor: "#27272a",
                              borderWidth: 1,
                              padding: 10,
                              callbacks: {
                                title: function(context) {
                                  const rawTimestamp = context[0].parsed.x;
                                  const dateObj = new Date(rawTimestamp);
                                  return `${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;
                                },
                                label: (context) => {
                                  let label = context.dataset.label || '';
                                  const itemIdx = context.dataIndex;
                                  const record = this.data[itemIdx];

                                  if (label === "Journal/Trigger Logs [N]") {
                                    return " [Narrative present — Click item to extract]";
                                  }
                                  if (context.parsed.y !== null) {
                                    label += `: ${context.parsed.y}`;
                                  }
                                  return label;
                                },
                                afterBody: (context) => {
                                  const idx = context[0].dataIndex;
                                  const record = this.data[idx];
                                  let lines = [];
                                  if (record && record.trigger_tags && record.trigger_tags.length > 0) {
                                    lines.push(`Triggers: ${record.trigger_tags.join(", ")}`);
                                  }
                                  if (record && record.has_journal) {
                                    lines.push(`Click to read journal entry...`);
                                  }
                                  return lines.join("\n");
                                }
                              }
                            },
                          },
                          onClick: (event, elements) => {
                            if (elements.length > 0) {
                              const chartElementIdx = elements[0].index;
                              this.viewEntry(chartElementIdx);
                            }
                          },
                        },
                      });
                    }
                  }

                  document.addEventListener("DOMContentLoaded", () => new AppController());

