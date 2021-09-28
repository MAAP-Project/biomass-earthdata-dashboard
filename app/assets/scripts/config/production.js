module.exports = {
  default: {
    environment: 'production',
    appTitle: 'Biomass Earthdata Dashboard',
    appDescription: 'Explore the Biomass datasets.',
    // twitterHandle: '@NASAEarthData',
    mbToken: 'pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJja2F6eHBobTUwMzVzMzFueGJuczF6ZzdhIn0.8va1fkyaWgM57_gZ2rBMMg',
    api: process.env.STAGE == "production" ?
            process.env.PRODUCTION_API_URL : (
              process.env.STAGE == "staging" ?
              process.env.STAGING_API_URL :
                (process.env.DIT_API_URL || 'http://localhost:8000/v1')),
    map: {
      center: [0, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 20,
      styleUrl: 'mapbox://styles/covid-nasa/ckb01h6f10bn81iqg98ne0i2y'
    }
  }
};
