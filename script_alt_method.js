// Initialize Leaflet map
const map = L.map('map', {
    center: [39.8, -98.5],
    zoom: 4,
    zoomControl: false,
    attributionControl: false
});

// Add dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Create marker cluster group with animations
const markers = L.markerClusterGroup({
    // Enable smooth animations
    animate: true,
    animateAddingMarkers: true,
    
    // Cluster settings
    maxClusterRadius: 20,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    
    // Custom polygon style for hover coverage
    polygonOptions: {
        fillColor: '#ffffff',
        fillOpacity: 0.1,
        color: '#00ffff',    // Border color
        weight: 1,           // Border width
        opacity: 0.4,        // Border opacity
    },
    
    // Custom cluster icon
    iconCreateFunction: function(cluster) {
        const childCount = cluster.getChildCount();
        let c = ' marker-cluster-';
        
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }
        
        return new L.DivIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'marker-cluster' + c,
            iconSize: new L.Point(20, 20)
        });
    }
});

// Load GeoJSON data and add markers
fetch('./input_data.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Create markers from GeoJSON features
        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'individual-marker',
                        html: '<div></div>',
                        iconSize: [10, 10],
                        iconAnchor: [5, 5]
                    })
                });
            },
            // No popups - removed onEachFeature
        });
        
        // Add all markers to cluster group
        markers.addLayer(geoJsonLayer);
        
        // Add cluster group to map
        map.addLayer(markers);
        
        console.log(`Loaded ${data.features.length} points`);
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
        console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    });

// Add custom CSS for cluster styling
const style = document.createElement('style');
style.textContent = `
    .marker-cluster-small {
        background-color: #ffffff;
    }
    .marker-cluster-small div {
        background-color: #ffffff;
    }
    
    .marker-cluster-medium {
        background-color: #ffffff;
    }
    .marker-cluster-medium div {
        background-color: #ffffff;
    }
    
    .marker-cluster-large {
        background-color: #ffffff;
    }
    .marker-cluster-large div {
        background-color: #ffffff;
    }
    
    .marker-cluster {
    }
    
    .marker-cluster div {
        width: 20px;
        height: 20px;
        margin-left: 0px;
        margin-top: 0px;
        text-align: center;
        border-radius: 0;
        background-color: #ffffff;
        border: 1px solid #000000;
        font: 10px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif;
        font-weight: bold;
    }
    
    .marker-cluster span {
        line-height: 20px;
        color: #000000;
    }
    
    .individual-marker {
        background: transparent;
        border: none;
    }
    
    .individual-marker div {
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border: 1px solid #000000;
        border-radius: 0;
    }
`;
document.head.appendChild(style);