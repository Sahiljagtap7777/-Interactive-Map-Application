document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([20, 0], 2);

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: { color: '#3388ff' }
            },
            polyline: true,
            rectangle: { shapeOptions: { color: '#3388ff' } },
            circle: { shapeOptions: { color: '#3388ff' } },
            marker: true
        },
        edit: { featureGroup: drawnItems }
    });

    map.addControl(drawControl);

    // Handle shape drawing
    map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);

    let coordinates;
    let shapeType;
    let area = null;

    if (layer instanceof L.Polygon) {
        shapeType = 'polygon';
        coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
        area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    } else if (layer instanceof L.Rectangle) {
        shapeType = 'rectangle';
        const bounds = layer.getBounds();
        coordinates = [
            [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
            [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        ];
        area = L.GeometryUtil.geodesicArea([
            bounds.getSouthWest(),
            L.latLng(bounds.getSouthWest().lat, bounds.getNorthEast().lng),
            bounds.getNorthEast(),
            L.latLng(bounds.getNorthEast().lat, bounds.getSouthWest().lng)
        ]);
    } else if (layer instanceof L.Circle) {
        shapeType = 'circle';
        const radius = layer.getRadius();
        coordinates = {
            center: [layer.getLatLng().lat, layer.getLatLng().lng],
            radius: radius
        };
        area = Math.PI * Math.pow(radius, 2);
    } else if (layer instanceof L.Marker) {
        shapeType = 'marker';
        coordinates = [layer.getLatLng().lat, layer.getLatLng().lng];
    }
    else if (layer instanceof L.Polyline) {
    shapeType = 'polyline';
    coordinates = layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]);
    // No area for polyline
}

    displayCoordinates(coordinates, area, shapeType);
    // sendToServer(coordinates, shapeType);
});


  

    // Display coordinates in <pre>
    function displayCoordinates(data, area = null,  shapeType = '') {
        const display = document.getElementById('coordinates-display');

    let output = `Shape Type: ${shapeType.toUpperCase()}\n\n`;

    output += data ? JSON.stringify(data, null, 2) : 'No coordinates';

    if (area !== null) {
        output += `\n\nArea: ${area.toFixed(2)} m²`;
    }

        display.textContent = output;
    }

    // Save to server
    // function sendToServer(coordinates, shapeType) {
    //     fetch('/save-coordinates/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'X-CSRFToken': getCookie('csrftoken')
    //         },
    //         body: `coordinates=${encodeURIComponent(JSON.stringify(coordinates))}&shape_type=${shapeType}`
    //     }).then(response => response.json())
    //       .then(data => console.log('Saved:', data));
    // }

    // Copy coordinates
    document.getElementById('copy-btn').addEventListener('click', function () {
        const text = document.getElementById('coordinates-display').textContent;
        navigator.clipboard.writeText(text).then(() => alert('Coordinates copied!'));
    });

    // Download coordinates
    document.getElementById('download-btn').addEventListener('click', function () {
        const text = document.getElementById('coordinates-display').textContent;
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coordinates.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // CSRF token helper
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
