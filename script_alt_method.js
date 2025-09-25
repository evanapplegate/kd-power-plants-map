// Initialize Leaflet map
const map = L.map('map', {
    center: [39.8, -98.5],
    zoom: 4,
    zoomControl: false
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
    maxClusterRadius: 80,
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
            iconSize: new L.Point(40, 40)
        });
    }
});

// Load GeoJSON data and add markers
fetch('./test_data.geojson')
    .then(response => response.json())
    .then(data => {
        // Create markers from GeoJSON features
        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: '#00ffff',
                    color: '#000000 ',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            // No popups - removed onEachFeature
        });
        
        // Add all markers to cluster group
        markers.addLayer(geoJsonLayer);
        
        // Add cluster group to map
        map.addLayer(markers);
        
        console.log(`Loaded ${data.features.length} power plants`);
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
    });

// Add custom CSS for cluster styling
const style = document.createElement('style');
style.textContent = `
    .marker-cluster-small {
        background-color: rgba(83, 183, 180, 0.8);
    }
    .marker-cluster-small div {
        background-color: rgba(83, 183, 180, 0.9);
    }
    
    .marker-cluster-medium {
        background-color: rgba(46, 142, 139, 0.8);
    }
    .marker-cluster-medium div {
        background-color: rgba(46, 142, 139, 0.9);
    }
    
    .marker-cluster-large {
        background-color: rgba(14, 81, 79, 0.8);
    }
    .marker-cluster-large div {
        background-color: rgba(14, 81, 79, 0.9);
    }
    
    .marker-cluster {
    }
    
    .marker-cluster div {
        width: 36px;
        height: 36px;
        margin-left: 2px;
        margin-top: 2px;
        text-align: center;
        border-radius: 50%;
        font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
        font-weight: bold;
    }
    
    .marker-cluster span {
        line-height: 36px;
        color: #ffffff;
    }
`;
document.head.appendChild(style);