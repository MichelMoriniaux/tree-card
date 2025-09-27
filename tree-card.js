class TreeCard extends HTMLElement {
  constructor() {
    super();
    this.addStyles();
  }

  addStyles() {
    if (!document.getElementById('tree-card-styles')) {
      const style = document.createElement('style');
      style.id = 'tree-card-styles';
      style.textContent = `
        /* Tree Card Styles */
        .tree-container {
          font-family: 'Roboto', sans-serif;
          line-height: 1.4;
        }

        .tree-item {
          margin: 2px 0;
          border-left: 1px solid #e0e0e0;
          padding-left: 8px;
        }

        .tree-node {
          display: flex;
          align-items: center;
          padding: 4px 0;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .tree-node:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .tree-toggle {
          display: inline-block;
          width: 16px;
          height: 16px;
          text-align: center;
          font-size: 12px;
          color: #666;
          cursor: pointer;
          user-select: none;
          margin-right: 8px;
          transition: transform 0.2s ease;
        }

        .tree-toggle:hover {
          color: #1976d2;
          transform: scale(1.1);
        }

        .tree-spacer {
          display: inline-block;
          width: 16px;
          margin-right: 8px;
        }

        .tree-name {
          flex: 1;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .tree-status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: 8px;
        }

        .status-created {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        .status-disabled {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .status-running {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-completed {
          background-color: #e8f5e8;
          color: #388e3c;
        }

        .status-failed {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .tree-children {
          margin-left: 16px;
          border-left: 1px solid #e0e0e0;
          padding-left: 8px;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .tree-item {
            border-left-color: #424242;
          }
          
          .tree-node:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          
          .tree-toggle {
            color: #aaa;
          }
          
          .tree-toggle:hover {
            color: #64b5f6;
          }
          
          .tree-name {
            color: #e0e0e0;
          }
          
          .tree-children {
            border-left-color: #424242;
          }
          
          .status-created {
            background-color: #1b5e20;
            color: #a5d6a7;
          }
          
          .status-disabled {
            background-color: #e65100;
            color: #ffcc02;
          }
          
          .status-running {
            background-color: #0d47a1;
            color: #90caf9;
          }
          
          .status-completed {
            background-color: #1b5e20;
            color: #a5d6a7;
          }
          
          .status-failed {
            background-color: #b71c1c;
            color: #ef9a9a;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .tree-item {
            margin-left: 10px !important;
          }
          
          .tree-children {
            margin-left: 8px;
          }
          
          .tree-name {
            font-size: 13px;
          }
          
          .tree-status {
            font-size: 10px;
            padding: 1px 6px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  setConfig(config) {
    this.config = {
      url: '', // REST endpoint URL
      entity: '', // Home Assistant entity ID
      attribute: 'Response', // Top-level key in JSON response or entity attribute name
      interval: 0, // Refresh interval in seconds (0 = no auto-refresh)
      ...config
    };
    this.expandedItems = new Set(); // Track expanded items
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
    if (!this.config.url && !this.config.entity) {
      this.innerHTML = `<div class="error">Either URL or entity must be configured</div>`;
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
      let jsonData;

      if (this.config.url) {
        // REST API mode
        const response = await fetch(this.config.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Extract data using the configured attribute as top-level key
        if (this.config.attribute && responseData[this.config.attribute] !== undefined) {
          jsonData = responseData[this.config.attribute];
        } else if (this.config.attribute) {
          this.innerHTML = `<div class="error">Key '${this.config.attribute}' not found in response</div>`;
          return;
        } else {
          jsonData = responseData;
        }
      } else {
        // Entity mode
        const entity = this._hass.states[this.config.entity];
        if (!entity) {
          this.innerHTML = `<div class="error">Entity ${this.config.entity} not found</div>`;
          return;
        }

        // Get data from entity attribute
        const attributeValue = entity.attributes[this.config.attribute];
        if (attributeValue === undefined) {
          this.innerHTML = `<div class="error">Attribute '${this.config.attribute}' not found in entity ${this.config.entity}</div>`;
          return;
        }

        // Parse JSON from attribute
        if (typeof attributeValue === 'string') {
          jsonData = JSON.parse(attributeValue);
        } else {
          jsonData = attributeValue;
        }
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

  createTree(data, level, path = '') {
    let html = '';
    const indent = '  '.repeat(level);
    
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        html += this.createTree(item, level, itemPath);
      });
    } else if (typeof data === 'object' && data !== null) {
      // Check if this object has a Name property
      if (data.Name) {
        const hasChildren = data.Items && data.Items.length > 0;
        const itemPath = path ? `${path}.${data.Name}` : data.Name;
        const itemId = `item-${itemPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Check if this item should be expanded
        const isExpanded = this.expandedItems.has(itemPath);
        
        html += `
          <div class="tree-item" style="margin-left: ${level * 20}px;">
            <div class="tree-node" data-item-id="${itemId}" data-path="${itemPath}">
              ${hasChildren ? 
                `<span class="tree-toggle" data-target="${itemId}">${isExpanded ? '▼' : '▶'}</span>` : 
                '<span class="tree-spacer"></span>'
              }
              <span class="tree-name">${data.Name}</span>
              ${data.Status ? `<span class="tree-status status-${data.Status.toLowerCase()}">${data.Status}</span>` : ''}
            </div>
            ${hasChildren ? `
              <div class="tree-children" id="${itemId}" style="display: ${isExpanded ? 'block' : 'none'};">
                ${this.createTree(data.Items, level + 1, itemPath)}
              </div>
            ` : ''}
          </div>
        `;
      }
      
      // Process other properties that might contain nested objects
      Object.keys(data).forEach(key => {
        if (key !== 'Name' && key !== 'Items' && typeof data[key] === 'object') {
          const itemPath = path ? `${path}.${key}` : key;
          html += this.createTree(data[key], level, itemPath);
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
        const treeNode = toggle.closest('.tree-node');
        const itemPath = treeNode.getAttribute('data-path');
        
        if (target.style.display === 'none') {
          target.style.display = 'block';
          toggle.textContent = '▼';
          this.expandedItems.add(itemPath);
        } else {
          target.style.display = 'none';
          toggle.textContent = '▶';
          this.expandedItems.delete(itemPath);
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
