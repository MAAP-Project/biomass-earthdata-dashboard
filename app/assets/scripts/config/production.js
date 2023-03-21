module.exports = {
  default: {
    environment: 'production',
    appTitle: 'Biomass Earthdata Dashboard',
    appDescription: 'Explore the Biomass datasets.',
    // twitterHandle: '@NASAEarthData',
    mbToken: 'pk.eyJ1IjoiYWltZWVyb3NlIiwiYSI6ImNsZmlqY3ZubjA0ZmozcnBwd2FpZHpnbWYifQ.yST3RIUdFQ8-QGj77L3WXQ',
    api: process.env.API_URL || 'http://localhost:8000/v1',
    map: {
      center: [0, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 20,
      styleUrl: 'mapbox://styles/mapbox/satellite-v9'
    }
  }
};
