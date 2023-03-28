module.exports = {
  default: {
    environment: 'production',
    appTitle: 'Biomass Earthdata Dashboard',
    appDescription: 'Explore the Biomass datasets.',
    // twitterHandle: '@NASAEarthData',
    mbToken: 'pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbDR6dDV5dWgwZTRtM2RvN2F1a3R1dnhmIn0.ueoAoFT0yBresvYVl8B6Fg',
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
