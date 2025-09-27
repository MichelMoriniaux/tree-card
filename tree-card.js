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
        /* Tree Card Styles - Home Assistant Specific */
        tree-card .tree-container,
        ha-card .tree-container {
          font-family: 'Roboto', sans-serif !important;
          line-height: 1.4 !important;
        }

        tree-card .tree-item,
        ha-card .tree-item {
          margin: 2px 0 !important;
          border-left: 1px solid #e0e0e0 !important;
          padding-left: 8px !important;
        }

        tree-card .tree-node,
        ha-card .tree-node {
          display: flex !important;
          align-items: center !important;
          padding: 4px 0 !important;
          cursor: pointer !important;
          border-radius: 4px !important;
          transition: background-color 0.2s ease !important;
        }

        tree-card .tree-node:hover,
        ha-card .tree-node:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }

        tree-card .tree-toggle,
        ha-card .tree-toggle {
          display: inline-block !important;
          width: 16px !important;
          height: 16px !important;
          text-align: center !important;
          font-size: 12px !important;
          color: #666 !important;
          cursor: pointer !important;
          user-select: none !important;
          margin-right: 8px !important;
          transition: transform 0.2s ease !important;
        }

        tree-card .tree-toggle:hover,
        ha-card .tree-toggle:hover {
          color: #1976d2 !important;
          transform: scale(1.1) !important;
        }

        tree-card .tree-spacer,
        ha-card .tree-spacer {
          display: inline-block !important;
          width: 16px !important;
          margin-right: 8px !important;
        }

        tree-card .tree-name,
        ha-card .tree-name {
          flex: 1 !important;
          font-weight: 500 !important;
          color: #333 !important;
          font-size: 14px !important;
        }

        tree-card .tree-status,
        ha-card .tree-status {
          display: inline-block !important;
          padding: 2px 8px !important;
          border-radius: 12px !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          margin-left: 8px !important;
        }

        tree-card .status-created,
        ha-card .status-created {
          background-color: #e8f5e8 !important;
          color: #2e7d32 !important;
        }

        tree-card .status-disabled,
        ha-card .status-disabled {
          background-color: #fff3e0 !important;
          color: #f57c00 !important;
        }

        tree-card .status-running,
        ha-card .status-running {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }

        tree-card .status-completed,
        ha-card .status-completed {
          background-color: #e8f5e8 !important;
          color: #388e3c !important;
        }

        tree-card .status-failed,
        ha-card .status-failed {
          background-color: #ffebee !important;
          color: #d32f2f !important;
        }

        tree-card .tree-children,
        ha-card .tree-children {
          margin-left: 16px !important;
          border-left: 1px solid #e0e0e0 !important;
          padding-left: 8px !important;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          tree-card .tree-item,
          ha-card .tree-item {
            border-left-color: #424242 !important;
          }
          
          tree-card .tree-node:hover,
          ha-card .tree-node:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          
          tree-card .tree-toggle,
          ha-card .tree-toggle {
            color: #aaa !important;
          }
          
          tree-card .tree-toggle:hover,
          ha-card .tree-toggle:hover {
            color: #64b5f6 !important;
          }
          
          tree-card .tree-name,
          ha-card .tree-name {
            color: #e0e0e0 !important;
          }
          
          tree-card .tree-children,
          ha-card .tree-children {
            border-left-color: #424242 !important;
          }
          
          tree-card .status-created,
          ha-card .status-created {
            background-color: #1b5e20 !important;
            color: #a5d6a7 !important;
          }
          
          tree-card .status-disabled,
          ha-card .status-disabled {
            background-color: #e65100 !important;
            color: #ffcc02 !important;
          }
          
          tree-card .status-running,
          ha-card .status-running {
            background-color: #0d47a1 !important;
            color: #90caf9 !important;
          }
          
          tree-card .status-completed,
          ha-card .status-completed {
            background-color: #1b5e20 !important;
            color: #a5d6a7 !important;
          }
          
          tree-card .status-failed,
          ha-card .status-failed {
            background-color: #b71c1c !important;
            color: #ef9a9a !important;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          tree-card .tree-item,
          ha-card .tree-item {
            margin-left: 10px !important;
          }
          
          tree-card .tree-children,
          ha-card .tree-children {
            margin-left: 8px !important;
          }
          
          tree-card .tree-name,
          ha-card .tree-name {
            font-size: 13px !important;
          }
          
          tree-card .tree-status,
          ha-card .tree-status {
            font-size: 10px !important;
            padding: 1px 6px !important;
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
