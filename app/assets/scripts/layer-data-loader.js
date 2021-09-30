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
import { storeProductLayers } from './components/common/layers';

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

class LayerDataLoader extends React.Component {
  componentDidMount() {
    showGlobalLoadingMessage('Loading products');
  }

  componentDidUpdate(prevProps) {
    const { productList: productList } = this.props;
    if (productList.isReady() && !prevProps.productList.isReady()) {
      this.requestProductData(productList.getData());
    }
  }

  async requestProductData(productList) {
    const ids = [...productList.map((s) => s.id), 'global'];
    await Promise.all(
      ids.map(async (productId) => {
        const { body } = await fetchJSON(
          `${config.api}/products/${productId}`
        );
        storeProductLayers(productId, body.datasets);
      })
    );

    hideGlobalLoading();
    this.props.onReady();
  }

  render() {
    return null;
  }
}

LayerDataLoader.propTypes = {
  productList: T.object,
  onReady: T.func
};

function mapStateToProps(state, props) {
  return {
    productList: wrapApiResult(state.product.list)
  };
}

export default connect(mapStateToProps, {})(LayerDataLoader);
