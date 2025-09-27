class TreeCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this.hass = hass;
    this.render();
  }

  render() {
    if (!this.config || !this.hass) return;

    // Get the JSON data from the input sensor
    const entity = this.hass.states[this.config.entity];
    if (!entity) {
      this.innerHTML = `<div class="error">Entity ${this.config.entity} not found</div>`;
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(entity.state);
    } catch (e) {
      this.innerHTML = `<div class="error">Invalid JSON in entity ${this.config.entity}</div>`;
      return;
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
}

customElements.define('tree-card', TreeCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tree-card',
  name: 'Tree Card',
  description: 'Display JSON data as an indented tree structure',
});
