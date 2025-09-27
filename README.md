# Tree Card for Home Assistant

A custom Lovelace card that displays JSON data as an interactive, indented tree structure based on the `Name` key.

## Features

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

### Basic Configuration

```yaml
type: custom:tree-card
entity: input_text.json_data
title: "My Tree View"
```

### Advanced Configuration

```yaml
type: custom:tree-card
entity: sensor.api_data
title: "API Data Tree"
card_mod:
  style: |
    ha-card {
      --ha-card-border-radius: 12px;
      --ha-card-box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
```

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

## Creating Data Sources

### Using input_text

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

### Using REST Sensor

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

## Customization

### Styling

You can customize the appearance by adding CSS to your Lovelace configuration:

```yaml
type: custom:tree-card
entity: input_text.json_data
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
2. Verify the entity exists and contains valid JSON
3. Check the browser console for JavaScript errors

### Data Not Displaying

1. Ensure your JSON has objects with `Name` properties
2. Verify the JSON is valid (use a JSON validator)
3. Check that the entity state contains the JSON data

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
