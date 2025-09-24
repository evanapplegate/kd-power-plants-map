// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZXZhbmRhcHBsZWdhdGUiLCJhIjoiY2tmbzA1cWM1MWozeTM4cXV4eHUwMzFhdiJ9.Z5f9p8jJD_N1MQwycF2NEw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-98.5, 39.8], // More centered for globe view
    zoom: 3.5, // Lower zoom to see full globe
    pitch: 0, // Remove tilt for better globe centering
    bearing: 0,
    antialias: true,
    projection: 'globe' // Cool globe projection
});

// Add terrain and sky
map.on('style.load', () => {
    map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
    });
    
    map.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: 1.5
    });
    
    map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });
});

map.on('load', () => {
    // Add GeoJSON source for power plants
    map.addSource('power-plants', {
        type: 'geojson',
        data: './test_data.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });
    
    // Cluster circles
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'power-plants',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#53b7b4', // electric teal
                100,
                '#2e8e8b',
                750,
                '#0e514f'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000000'
        }
    });
    
    // Cluster count labels
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'power-plants',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    });
    
    // Individual points
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'power-plants',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#00ffff', // electric teal
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });
    
    // Cluster click to zoom
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('power-plants').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;
                
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });
    
    // Cursor pointer on clusters
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});

// Navigation controls
map.addControl(new mapboxgl.NavigationControl({
    showCompass: true,
    showZoom: true
}));