import '@babel/polyfill';
import React from 'react';
import T from 'prop-types';
import { connect } from 'react-redux';

import config from './config';
import { fetchJSON, wrapApiResult } from './redux/reduxeed';

import {
  hideGlobalLoading,
  showGlobalLoadingMessage
} from './components/common/global-loading';
import { storeCountryPilotLayers } from './components/common/layers';

// Dev note:
// The products (or map layers) information was moved to the api, however some
// parts of the app access the data in a synchronous way, making it impossible
// to fetch datatsets on demand. The homepage itself requires several products
// to be loaded so the map can be animated.
// For the time being, layers will be front loaded as part of the application
// bootstrap process and only when all the data is present the app will start.
// This allows us to quickly get the products information from the api without
// significant refactor. This was decided taking into account that significant
// development is planned for the near future.

class CountryPilotLayerDataLoader extends React.Component {
  componentDidMount() {
    // showGlobalLoadingMessage('Loading data');
  }

  componentDidUpdate(prevProps) {
    const { countryPilotList } = this.props;
    if (countryPilotList.isReady() && !prevProps.countryPilotList.isReady()) {
      this.requestCountryPilotData(countryPilotList.getData());
    }
  }

  async requestCountryPilotData(countryPilotList) {
    const ids = [...countryPilotList.map((s) => s.id)];
    await Promise.all(
      ids.map(async (countryPilotId) => {
        const { body } = await fetchJSON(
          `${config.api}/country_pilots/${countryPilotId}`
        );
        storeCountryPilotLayers(countryPilotId, body.datasets);
      })
    );

    // hideGlobalLoading(); // todo
    this.props.onReady();
  }

  render() {
    return null;
  }
}

CountryPilotLayerDataLoader.propTypes = {
  countryPilotList: T.object,
  onReady: T.func
};

function mapStateToProps(state, props) {
  return {
    countryPilotList: wrapApiResult(state.countryPilot.list)
  };
}

export default connect(mapStateToProps, {})(CountryPilotLayerDataLoader);
