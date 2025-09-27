class TreeCard extends HTMLElement {  
  setConfig(config) {
    this.config = {
      url: '', // REST endpoint URL
      attribute: 'Response', // Top-level key in JSON response
      interval: 0, // Refresh interval in seconds (0 = no auto-refresh)
      ...config
    };
    this.render();
    this.startInterval(); // Restart interval with new config
  }

  set hass(hass) {
    if (this._hass !== hass) {
      this._hass = hass;
      this.render();
    }
  }

  connectedCallback() {
    this.startInterval();
  }

  disconnectedCallback() {
    this.stopInterval();
  }

  async render() {
    if (!this.config || !this._hass) return;

    // Validate configuration
    if (!this.config.url) {
      this.innerHTML = `<div class="error">URL not configured</div>`;
      return;
    }

    // Show loading state
    this.innerHTML = `
      <ha-card header="${this.config.title || 'Tree View'}">
        <div class="card-content">
          <div class="loading">Loading...</div>
        </div>
      </ha-card>
    `;

    try {
      // Make REST call
      const response = await fetch(this.config.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Extract data using the configured attribute as top-level key
      let jsonData;
      if (this.config.attribute && responseData[this.config.attribute] !== undefined) {
        jsonData = responseData[this.config.attribute];
      } else if (this.config.attribute) {
        this.innerHTML = `<div class="error">Key '${this.config.attribute}' not found in response</div>`;
        return;
      } else {
        jsonData = responseData;
      }

      // Create the tree structure
      const treeHtml = this.createTree(jsonData, 0);
      
      this.innerHTML = `
        <ha-card header="${this.config.title || 'Tree View'}">
          <div class="card-content">
            <div class="tree-container">
              ${treeHtml}
            </div>
          </div>
        </ha-card>
      `;

      // Add click handlers for expand/collapse
      this.addEventListeners();
      
    } catch (error) {
      this.innerHTML = `<div class="error">Failed to fetch data: ${error.message}</div>`;
    }
  }

  startInterval() {
    this.stopInterval(); // Clear any existing interval
    
    if (this.config && this.config.interval > 0) {
      const intervalMs = this.config.interval * 1000; // Convert seconds to milliseconds
      this.refreshInterval = setInterval(() => {
        this.render();
      }, intervalMs);
    }
  }

  stopInterval() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  createTree(data, level) {
    let html = '';
    const indent = '  '.repeat(level);
    
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        html += this.createTree(item, level);
      });
    } else if (typeof data === 'object' && data !== null) {
      // Check if this object has a Name property
      if (data.Name) {
        const hasChildren = data.Items && data.Items.length > 0;
        const itemId = `item-${level}-${Math.random().toString(36).substr(2, 9)}`;
        
        html += `
          <div class="tree-item" style="margin-left: ${level * 20}px;">
            <div class="tree-node" data-item-id="${itemId}">
              ${hasChildren ? 
                `<span class="tree-toggle" data-target="${itemId}">▶</span>` : 
                '<span class="tree-spacer"></span>'
              }
              <span class="tree-name">${data.Name}</span>
              ${data.Status ? `<span class="tree-status status-${data.Status.toLowerCase()}">${data.Status}</span>` : ''}
            </div>
            ${hasChildren ? `
              <div class="tree-children" id="${itemId}" style="display: none;">
                ${this.createTree(data.Items, level + 1)}
              </div>
            ` : ''}
          </div>
        `;
      }
      
      // Process other properties that might contain nested objects
      Object.keys(data).forEach(key => {
        if (key !== 'Name' && key !== 'Items' && typeof data[key] === 'object') {
          html += this.createTree(data[key], level);
        }
      });
    }
    
    return html;
  }

  addEventListeners() {
    const toggles = this.querySelectorAll('.tree-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = toggle.getAttribute('data-target');
        const target = this.querySelector(`#${targetId}`);
        
        if (target.style.display === 'none') {
          target.style.display = 'block';
          toggle.textContent = '▼';
        } else {
          target.style.display = 'none';
          toggle.textContent = '▶';
        }
      });
    });
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return {
      rows: 3,
      columns: 1,
      min_rows: 3,
      max_rows: 6,
    };
  }
}

customElements.define('tree-card', TreeCard);

// Register the card with Home Assistant
/*
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tree-card',
  name: 'Tree Card',
  description: 'Display JSON data as an indented tree structure',
});
*/
