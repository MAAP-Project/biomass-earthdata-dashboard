module.exports = {
  default: {
    environment: 'production',
    appTitle: 'Biomass Earthdata Dashboard',
    appDescription: 'Explore the Biomass datasets.',
    // twitterHandle: '@NASAEarthData',
    mbToken: 'pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbDRyaGY4cjgwcjF6M2tscHg2MGR5dzBoIn0.e-izXV-_2jFzZNT8erOOjQ',
    api: process.env.API_URL || 'http://localhost:8000/v1',
    map: {
      center: [0, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 20,
      styleUrl: 'mapbox://styles/covid-nasa/ckb01h6f10bn81iqg98ne0i2y'
    }
  }
};
