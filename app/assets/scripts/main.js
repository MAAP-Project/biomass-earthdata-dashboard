import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga';
import ReactTooltip from 'react-tooltip';

import theme from './styles/theme/theme';
import store from './utils/store';
import history from './utils/history';
import config from './config';
import { fetchProductList } from './redux/product';
import { fetchCountryPilotList } from './redux/country-pilot';

import GlobalStyles from './styles/global';
import ErrorBoundary from './fatal-error-boundary';
import { GlobalLoading } from './components/common/global-loading';
import ProductLayerDataLoader from './product-layer-data-loader';
import CountryPilotLayerDataLoader from './country-pilot-layer-data-loader';

// Views
import Home from './components/home';
import GlobalExplore from './components/global';
import ProductHub from './components/products/hub';
import ProductSingle from './components/products/single';
import CountryPilotHub from './components/country-pilots/hub';
import CountryPilotSingle from './components/country-pilots/single';
import Sandbox from './components/sandbox';
import UhOh from './components/uhoh';
import About from './components/about';
import Contact from './components/contact';
import Development from './components/development';

// Load the product
store.dispatch(fetchProductList());

// Load the country pilots
store.dispatch(fetchCountryPilotList());

const { gaTrackingCode } = config;

// Google analytics
if (gaTrackingCode) {
  ReactGA.initialize(gaTrackingCode);
  ReactGA.pageview(window.location.pathname + window.location.search);
  history.listen(location => ReactGA.pageview(location.pathname + location.search));
}

// Root component. Used by the router.
class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windowHeight: window.innerHeight,
      productLayersReady: false,
      countryPilotLayersReady: false,
    };

    window.addEventListener('resize', () => {
      // Store the height to set the page min height. This is needed for mobile
      // devices to account for the address bar, since 100vh does not work.
      // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
      this.setState({ windowHeight: window.innerHeight });
    });
  }

  componentDidMount() {
    // Hide the welcome banner.
    const banner = document.querySelector('#welcome-banner');
    banner.classList.add('dismissed');
    setTimeout(() => banner.remove(), 500);
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <ThemeProvider theme={theme.main}>
            <ErrorBoundary>
              <GlobalStyles innerHeight={this.state.windowHeight} />

              {/* See notes in LayerDataLoader files */}

              <ProductLayerDataLoader
                onReady={() => this.setState({ productLayersReady: true })}
              />

              <CountryPilotLayerDataLoader
                onReady={() => this.setState({ countryPilotLayersReady: true })}
              />

              {this.state.productLayersReady && this.state.countryPilotLayersReady && (
                <Switch>
                  <Route exact path='/' component={Home} />
                  <Route exact path='/products' component={ProductHub} />
                  <Route
                    exact
                    path='/products/global'
                    component={GlobalExplore}
                  />
                  <Route
                    exact
                    path='/products/:productId'
                    component={ProductSingle}
                  />
                  <Route exact path='/country_pilots' component={CountryPilotHub} />
                  <Route
                    exact
                    path='/country_pilots/:countryPilotId'
                    component={CountryPilotSingle}
                  />
                  <Route path='/sandbox' component={Sandbox} />
                  <Route path='/about' component={About} />
                  <Route path='/contact' component={Contact} />
                  <Route path='/development' component={Development} />
                  <Route path='*' component={UhOh} />
                </Switch>
              )}
              <GlobalLoading />
              <ReactTooltip effect='solid' className='type-primary' />
            </ErrorBoundary>
          </ThemeProvider>
        </Router>
      </Provider>
    );
  }
}

render(<Root store={store} />, document.querySelector('#app-container'));
