# Tree Card for Home Assistant

A custom Lovelace card that displays JSON data as an interactive, indented tree structure. The card can fetch data from REST APIs or read from Home Assistant entities, with support for automatic refresh intervals.

## Features

- **Dual Data Sources**: Fetch data from REST APIs or read from Home Assistant entities
- **REST API Integration**: Fetch data directly from external APIs
- **Entity Support**: Read JSON data from Home Assistant entity attributes
- **Auto-Refresh**: Configurable intervals for live data updates
- **Hierarchical Display**: Shows nested JSON objects as an expandable tree
- **Interactive**: Click to expand/collapse branches
- **Status Indicators**: Color-coded text badges or Material Design icons
- **Custom Icon Mapping**: Define custom icons for specific status values
- **State Preservation**: Expanded elements remain expanded during refreshes
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme Support**: Automatically adapts to Home Assistant's theme
- **Shadow DOM**: Proper style encapsulation using Web Components standards
- **Customizable**: Easy to modify styling and behavior

## Installation

### Method 1: Manual Installation

1. Copy `tree-card.js` to your Home Assistant `www` folder:
   ```
   /config/www/tree-card.js
   ```

2. Add the card to your Lovelace dashboard using the card editor or YAML configuration.

**Note**: The CSS styles are now integrated into the JavaScript file, so you only need to include the single `tree-card.js` file.

### Method 2: HACS Installation (if available)

1. Add this repository to HACS
2. Install the Tree Card
3. Restart Home Assistant

## Usage

### REST API Configuration

```yaml
type: custom:tree-card
url: "https://api.example.com/data"
attribute: "Response"
title: "Live Data"
interval: 30
```

### Entity Configuration

```yaml
type: custom:tree-card
entity: input_text.json_data
attribute: "Response"
title: "Entity Data"
```

### Icon Configuration

```yaml
type: custom:tree-card
entity: input_text.json_data
attribute: "Response"
useIcons: true
title: "Tree with Icons"
```

### Custom Icon Mapping

```yaml
type: custom:tree-card
entity: input_text.json_data
attribute: "Response"
useIcons: true
iconMapping:
  "CREATED": "mdi:plus-circle"
  "RUNNING": "mdi:loading"
  "FAILED": "mdi:alert-octagon"
title: "Custom Icons"
```

### Advanced Configuration

```yaml
type: custom:tree-card
url: "https://api.example.com/status"
attribute: "data"
title: "System Status"
interval: 60
card_mod:
  style: |
    ha-card {
      --ha-card-border-radius: 12px;
      --ha-card-box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | - | REST API endpoint URL (required for API mode) |
| `entity` | string | - | Home Assistant entity ID (required for entity mode) |
| `attribute` | string | "Response" | Top-level JSON key (API mode) or entity attribute name (entity mode) |
| `title` | string | "Tree View" | Card title displayed in header |
| `interval` | number | 0 | Auto-refresh interval in seconds (0 = disabled) |
| `useIcons` | boolean | false | Use Material Design icons instead of text status badges |
| `iconMapping` | object | {} | Custom icon mapping for specific status values |

## Data Format

The card expects JSON data with objects containing a `Name` property. Objects with `Items` arrays will be displayed as expandable branches.

Example JSON structure:
```json
{
  "Response": [
    {
      "Name": "Start_Container",
      "Status": "CREATED",
      "Items": [
        {
          "Name": "Startup_Container",
          "Status": "CREATED",
          "Items": [
            {
              "Name": "MQTT Sequence Start_Container",
              "Status": "CREATED"
            }
          ]
        }
      ]
    }
  ]
}
```

## Status Indicators

The card supports two types of status indicators:

### Text Badges (Default)
Color-coded text badges with background colors:
- **CREATED**: Green background
- **DISABLED**: Orange background  
- **RUNNING**: Blue background
- **COMPLETED**: Green background
- **FAILED**: Red background

### Material Design Icons
When `useIcons: true` is set, the card displays Material Design icons instead of text badges:

| Status | Default Icon | Color |
|--------|--------------|-------|
| CREATED | `mdi:check-circle` | Green |
| RUNNING | `mdi:play-circle` | Blue |
| COMPLETED | `mdi:check-circle-outline` | Green |
| FAILED | `mdi:close-circle` | Red |
| DISABLED | `mdi:pause-circle` | Orange |
| PENDING | `mdi:clock-outline` | Orange |
| ERROR | `mdi:alert-circle` | Red |
| WARNING | `mdi:alert` | Orange |
| INFO | `mdi:information` | Blue |
| SUCCESS | `mdi:check` | Green |
| ACTIVE | `mdi:play` | Green |
| INACTIVE | `mdi:pause` | Gray |
| ONLINE | `mdi:circle` | Green |
| OFFLINE | `mdi:circle-outline` | Gray |

### Custom Icon Mapping
You can override any default icon by providing a custom mapping:

```yaml
iconMapping:
  "CREATED": "mdi:plus-circle"
  "RUNNING": "mdi:loading"
  "FAILED": "mdi:alert-octagon"
  "CUSTOM_STATUS": "mdi:star"
```

## Data Sources

### REST API Endpoints

The card can fetch data directly from REST APIs. Simply provide the URL and the card will make HTTP GET requests to fetch the data.

**Example API Response:**
```json
{
  "Response": [
    {
      "Name": "Example Container",
      "Status": "CREATED",
      "Items": [
        {
          "Name": "Sub Container",
          "Status": "RUNNING"
        }
      ]
    }
  ]
}
```

### Home Assistant Entities

The card can read JSON data from Home Assistant entity attributes. The `attribute` parameter specifies which attribute contains the JSON data.

#### input_text
Add to your `configuration.yaml`:

```yaml
input_text:
  json_data:
    name: "JSON Data"
    initial: |
      {
        "Response": [
          {
            "Name": "Example Container",
            "Status": "CREATED"
          }
        ]
      }
```

Then use the card:
```yaml
type: custom:tree-card
entity: input_text.json_data
attribute: "Response"
title: "My Data"
```

#### REST Sensor
Add to your `configuration.yaml`:

```yaml
rest:
  - resource: "http://your-api-endpoint.com/data"
    sensor:
      - name: "API Data"
        value_template: "{{ value_json }}"
        json_attributes:
          - "*"
```

Then use the card:
```yaml
type: custom:tree-card
entity: sensor.api_data
attribute: "Response"
title: "API Data"
```

## Auto-Refresh Examples

### Live System Monitoring (30 seconds)
```yaml
type: custom:tree-card
url: "https://api.mysystem.com/status"
attribute: "components"
interval: 30
title: "System Status"
```

### Periodic Data Updates (5 minutes)
```yaml
type: custom:tree-card
url: "https://api.weather.com/forecast"
attribute: "forecast"
interval: 300
title: "Weather Forecast"
```

### Entity with Auto-Refresh and Icons (1 minute)
```yaml
type: custom:tree-card
entity: sensor.system_status
attribute: "data"
interval: 60
useIcons: true
title: "System Status"
```

### REST API with Custom Icons
```yaml
type: custom:tree-card
url: "https://api.example.com/status"
attribute: "components"
useIcons: true
iconMapping:
  "HEALTHY": "mdi:heart"
  "WARNING": "mdi:alert-circle"
  "CRITICAL": "mdi:alert-octagon"
interval: 30
title: "Service Health"
```

### No Auto-Refresh (Static Data)
```yaml
type: custom:tree-card
url: "https://api.example.com/static-data"
attribute: "data"
title: "Static Information"
```

## Customization

### Integrated Styles

The card includes all necessary CSS styles integrated directly into the JavaScript file. The styles are automatically injected when the card loads and include:

- **Tree Structure Styling**: Proper indentation and visual hierarchy
- **Interactive Elements**: Hover effects and smooth transitions
- **Status Indicators**: Color-coded text badges and Material Design icons
- **Icon Support**: Proper sizing and coloring for status icons
- **Dark Theme Support**: Automatic adaptation to Home Assistant's dark theme
- **Responsive Design**: Mobile-friendly layout adjustments
- **Shadow DOM**: Proper style encapsulation using Web Components standards

### Custom Styling

You can override the default styles by adding custom CSS to your Lovelace configuration:

```yaml
type: custom:tree-card
url: "https://api.example.com/static-data"
useIcons: true
card_mod:
  style: |
    .tree-name {
      font-weight: bold;
      color: #1976d2;
    }
    .tree-toggle {
      color: #1976d2;
    }
    .status-created {
      background-color: #your-custom-color;
      color: #your-text-color;
    }
    .tree-status-icon.status-created {
      color: #your-custom-icon-color;
    }
```

### Icon Customization

You can customize icon colors and sizes:

```yaml
type: custom:tree-card
entity: input_text.demo_data
useIcons: true
card_mod:
  style: |
    .tree-status-icon {
      width: 20px;
      height: 20px;
    }
    .tree-status-icon.status-running {
      color: #ff6b35;
    }
```

### Behavior

The card automatically:
- Expands branches with children
- Shows status indicators (text badges or icons) when available
- Preserves expanded state during data refreshes
- Handles click events for expand/collapse
- Adapts to different screen sizes
- Switches between light and dark themes
- Uses Material Design icons when configured

## Troubleshooting

### Card Not Loading

1. Check that the JavaScript file is in the correct location
2. Verify the URL is accessible or entity exists
3. Check the browser console for JavaScript errors
4. Ensure the REST API endpoint returns valid JSON

### Data Not Displaying

1. Ensure your JSON has objects with `Name` properties
2. Verify the JSON is valid (use a JSON validator)
3. Check that the specified `attribute` key exists in the response
4. For REST APIs, verify the endpoint is accessible and returns data
5. Check network connectivity for REST API calls

### Auto-Refresh Issues

1. Verify the `interval` value is greater than 0
2. Check that the REST API endpoint is stable and responsive
3. Monitor browser console for network errors during refresh
4. Consider increasing interval for slow APIs

### Styling Issues

1. Clear browser cache
2. Check for CSS conflicts with other cards
3. Verify that styles are being injected (check browser developer tools)

### Icon Issues

1. **Icons not displaying**: Ensure `useIcons: true` is set in configuration
2. **Custom icons not working**: Verify icon names are valid Material Design icons (e.g., `mdi:check-circle`)
3. **Icon colors not applying**: Check if custom CSS is overriding icon colors
4. **Icons too small/large**: Use custom CSS to adjust `.tree-status-icon` width and height

## Development

To modify the card:

1. Edit `tree-card.js` for both functionality and styling changes
2. Styles are integrated in the `addStyles()` method within the JavaScript file
3. Test in your Home Assistant environment
4. Submit pull requests for improvements

## License

This project is open source and available under the MIT License.

## Support

For issues and feature requests, please create an issue in the GitHub repository.
