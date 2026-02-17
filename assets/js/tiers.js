(function () {
  "use strict";

  var data = window.__tierData;
  if (!data) return;

  var container = document.getElementById("tiers-container");
  var updatedEl = document.getElementById("last-updated");
  var tabs = document.querySelectorAll(".scoring-tabs .tab");
  var activeFormat = "standard";

  function renderTiers(format) {
    var formatData = data.formats[format];
    if (!formatData || !formatData.tiers) {
      container.innerHTML = "<p>No data available for this format.</p>";
      return;
    }

    var html = "";
    var tiers = formatData.tiers;

    for (var i = 0; i < tiers.length; i++) {
      var tier = tiers[i];
      var colorClass = "tier-color-" + Math.min(tier.tier, 12);

      html += '<div class="tier-row">';
      html += '<div class="tier-label ' + colorClass + '">Tier ' + tier.tier + "</div>";
      html += '<div class="tier-players">';

      for (var j = 0; j < tier.players.length; j++) {
        var p = tier.players[j];
        html += '<div class="player-card">';
        html += '<span class="player-rank">' + p.rank + "</span>";
        html += '<span class="player-name">' + escapeHtml(p.name) + "</span>";
        html += '<span class="player-team">' + escapeHtml(p.team) + "</span>";
        html += "</div>";
      }

      html += "</div></div>";
    }

    container.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function setActiveTab(format) {
    activeFormat = format;
    for (var i = 0; i < tabs.length; i++) {
      var isActive = tabs[i].getAttribute("data-format") === format;
      tabs[i].classList.toggle("active", isActive);
      tabs[i].setAttribute("aria-selected", isActive ? "true" : "false");
    }
    renderTiers(format);
  }

  // Tab click handlers
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      setActiveTab(this.getAttribute("data-format"));
    });
  }

  // Show last updated
  if (data.last_updated && updatedEl) {
    var date = new Date(data.last_updated);
    updatedEl.textContent =
      "Week " + data.week + " \u2022 Last updated: " + date.toLocaleDateString();
  }

  // Initial render
  renderTiers(activeFormat);
})();
