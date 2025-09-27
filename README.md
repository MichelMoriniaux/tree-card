# Tree Card for Home Assistant

A custom Lovelace card that displays JSON data as an interactive, indented tree structure. The card can fetch data from REST APIs or read from Home Assistant entities, with support for automatic refresh intervals.

## Features

- **REST API Integration**: Fetch data directly from external APIs
- **Auto-Refresh**: Configurable intervals for live data updates
- **Hierarchical Display**: Shows nested JSON objects as an expandable tree
- **Interactive**: Click to expand/collapse branches
- **Status Indicators**: Color-coded status badges for different states
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme Support**: Automatically adapts to Home Assistant's theme
- **Customizable**: Easy to modify styling and behavior

## Installation

### Method 1: Manual Installation

1. Copy `tree-card.js` to your Home Assistant `www` folder:
   ```
   /config/www/tree-card.js
   ```

2. Copy `tree-card.css` to your Home Assistant `www` folder:
   ```
   /config/www/tree-card.css
   ```

3. Add the card to your Lovelace dashboard using the card editor or YAML configuration.

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
| `attribute` | string | "Response" | Top-level JSON key to extract from response |
| `title` | string | "Tree View" | Card title displayed in header |
| `interval` | number | 0 | Auto-refresh interval in seconds (0 = disabled) |

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

## Status Colors

The card supports different status indicators with color coding:

- **CREATED**: Green background
- **DISABLED**: Orange background  
- **RUNNING**: Blue background
- **COMPLETED**: Green background
- **FAILED**: Red background

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

For entity-based data sources, you can use:

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

### No Auto-Refresh (Static Data)
```yaml
type: custom:tree-card
url: "https://api.example.com/static-data"
attribute: "data"
title: "Static Information"
```

## Customization

### Styling

You can customize the appearance by adding CSS to your Lovelace configuration:

```yaml
type: custom:tree-card
url: "https://api.example.com/static-data"
card_mod:
  style: |
    .tree-name {
      font-weight: bold;
      color: #1976d2;
    }
    .tree-toggle {
      color: #1976d2;
    }
```

### Behavior

The card automatically:
- Expands branches with children
- Shows status badges when available
- Handles click events for expand/collapse
- Adapts to different screen sizes

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
3. Verify the CSS file is loaded correctly

## Development

To modify the card:

1. Edit `tree-card.js` for functionality changes
2. Edit `tree-card.css` for styling changes
3. Test in your Home Assistant environment
4. Submit pull requests for improvements

## License

This project is open source and available under the MIT License.

## Support

For issues and feature requests, please create an issue in the GitHub repository.
