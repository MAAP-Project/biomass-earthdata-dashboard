import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import get from 'lodash.get';
import find from 'lodash.find';

import App from '../../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody
} from '../../../styles/inpage';
import MbMap from '../../common/mb-map-products/mb-map';
import UhOh from '../../uhoh';
import DataLayersBlock from '../../common/data-layers-block';
import Panel, { PanelHeadline, PanelTitle } from '../../common/panel';
import MapMessage from '../../common/map-message';
import Timeline from '../../common/timeline';
import SecPanel from './sec-panel';
import ProductsNavigation from '../../common/products-navigation';

import { themeVal } from '../../../styles/utils/general';
import { fetchProductSingle as fetchProductSingleAction } from '../../../redux/product';
import { wrapApiResult, getFromState } from '../../../redux/reduxeed';
import {
  showGlobalLoading,
  hideGlobalLoading
} from '../../common/global-loading';
import { getProductLayers } from '../../common/layers';
import {
  setLayerState,
  getLayerState,
  getLayersWithState,
  resizeMap,
  getInitialMapExploreState,
  getActiveTimeseriesLayers,
  handlePanelAction,
  getCommonQsState,
  handleMapAction,
  toggleLayerCommon
} from '../../../utils/map-explore-utils';
import QsState from '../../../utils/qs-state';
import media, { isLargeViewport } from '../../../styles/utils/media-queries';

const ExploreCanvas = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: min-content 1fr min-content;
  overflow: hidden;

  ${media.mediumDown`
    ${({ panelPrime, panelSec }) => {
      if (panelPrime && !panelSec) {
        return 'grid-template-columns: min-content 0 0;';
      }

      if (!panelPrime && panelSec) {
        return 'grid-template-columns: 0 0 min-content;';
      }
    }}
  `}

  > * {
    grid-row: 1;
  }
`;

const ExploreCarto = styled.section`
  position: relative;
  height: 100%;
  background: ${themeVal('color.baseAlphaA')};
  display: grid;
  grid-template-rows: 1fr auto;
  min-width: 0;
  overflow: hidden;
`;

const PrimePanel = styled(Panel)`
  ${media.largeUp`
    width: 18rem;
  `}
`;

class ProductSingle extends React.Component {
  constructor(props) {
    super(props);
    // Functions from helper file.
    this.setLayerState = setLayerState.bind(this);
    this.getLayerState = getLayerState.bind(this);
    this.getLayersWithState = getLayersWithState.bind(this);
    this.getActiveTimeseriesLayers = getActiveTimeseriesLayers.bind(this);
    this.resizeMap = resizeMap.bind(this);

    this.onMapAction = this.onMapAction.bind(this);
    this.onPanelAction = this.onPanelAction.bind(this);
    // Ref to the map component to be able to trigger a resize when the panels
    // are shown/hidden.
    this.mbMapRef = React.createRef();

    const { productId } = this.props.match.params;
    this.selectDefaultLayers(productId, getCommonQsState(this.props));

    // The active layers can only be enabled once the map loads. The toggle
    // layer method checks the state to see what layers are enabled so we can't
    // store the active layers from the url in the same property, otherwise
    // they'd be disabled.
    // They get temporarily stored in another property and once the map loads
    // the layers are enabled and stored in the correct property.
    const { activeLayers, ...urlState } = this.qsState.getState(
      this.props.location.search.substr(1)
    );

    this.state = {
      ...getInitialMapExploreState(),
      ...urlState,
      _urlActiveLayers: activeLayers,
      panelPrime: false,
      panelSec: false
    };
  }

  componentDidMount() {
    this.requestProduct();
  }

  componentDidUpdate(prevProps, prevState) {
    const { productId } = this.props.match.params;
    if (productId !== prevProps.match.params.productId) {
      this.requestProduct();
      this.selectDefaultLayers(productId, getCommonQsState(this.props));
      const { activeLayers } = this.qsState.getState(
        this.props.location.search.substr(1)
      )
      // Reset state on page change.
      this.setState({
        ...getInitialMapExploreState(),
        _urlActiveLayers: activeLayers,
        panelPrime: false,
        panelSec: false
      });
    }
  }

  onPanelChange(panel, revealed) {
    this.setState({ [panel]: revealed });
  }

  updateUrlQS() {
    const qString = this.qsState.getQs(this.state);
    this.props.history.push({ search: qString });
  }

  async requestProduct() {
    showGlobalLoading();
    await this.props.fetchProductSingle(this.props.match.params.productId);
    hideGlobalLoading();
  }

  onPanelAction(action, payload) {
    // Returns true if the action was handled.
    handlePanelAction.call(this, action, payload);
  }

  async onMapAction(action, payload) {
    // Returns true if the action was handled.
    handleMapAction.call(this, action, payload);

    // Extend the map.loaded action
    switch (action) {
      case 'map.loaded':
        if (this.state.mapPos === null) {
          const productData = this.props.product.getData();
          this.mbMapRef.current.mbMap.fitBounds(productData.bounding_box);
        }
        break;
    }
  }

  toggleLayer(layer) {
    toggleLayerCommon.call(this, layer, () => {
      this.updateUrlQS();
    });
  }

  render() {
    const { product, productList } = this.props;

    if (product.hasError()) return <UhOh />;

    const products = productList.isReady() && productList.getData();

    const layers = this.getLayersWithState();
    const activeTimeseriesLayers = this.getActiveTimeseriesLayers();

    // Check if there's any layer that's comparing.
    const comparingLayer = find(layers, 'comparing');
    const isComparing = !!comparingLayer;

    const mapLabel = get(comparingLayer, 'compare.mapLabel');
    const compareMessage =
      isComparing && mapLabel
        ? typeof mapLabel === 'function'
          ? mapLabel(this.state.timelineDate)
          : mapLabel
        : '';

    return (
      <App hideFooter>
        <Inpage isMapCentric>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Map</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          {product.isReady() && (
            <InpageBody>
              <ExploreCanvas panelPrime={this.state.panelPrime} panelSec={this.state.panelSec}>
                <PrimePanel
                  collapsible
                  direction='left'
                  onPanelChange={({ revealed }) => {
                    this.resizeMap();
                    this.onPanelChange('panelPrime', revealed);
                  }}
                  initialState={isLargeViewport()}
                  headerContent={
                    <PanelHeadline>
                      <PanelTitle>Explore</PanelTitle>
                    </PanelHeadline>
                  }
                  bodyContent={
                    <>
                      <ProductsNavigation products={products || []} />
                      <DataLayersBlock
                        layers={layers}
                        mapLoaded={this.state.mapLoaded}
                        onAction={this.onPanelAction}
                      />
                    </>
                  }
                />
                <ExploreCarto>
                  <MapMessage active={isComparing && !!compareMessage}>
                    <p>{compareMessage}</p>
                  </MapMessage>
                  <MbMap
                    ref={this.mbMapRef}
                    position={this.state.mapPos}
                    onAction={this.onMapAction}
                    layers={layers}
                    activeLayers={this.state.activeLayers}
                    date={this.state.timelineDate}
                    aoiState={null}
                    comparing={isComparing}
                  />
                  <Timeline
                    isActive={!!activeTimeseriesLayers.length}
                    layers={activeTimeseriesLayers}
                    date={this.state.timelineDate}
                    onAction={this.onPanelAction}
                    onSizeChange={this.resizeMap}
                  />
                </ExploreCarto>

                <SecPanel
                  onPanelChange={({ revealed }) => {
                    this.resizeMap();
                    this.onPanelChange('panelSec', revealed);
                  }}
                  summary={product.getData().summary}
                  selectedDate={
                    activeTimeseriesLayers.length
                      ? this.state.timelineDate
                      : null
                  }
                />
              </ExploreCanvas>
            </InpageBody>
          )}
        </Inpage>
      </App>
    );
  }

  selectDefaultLayers(productId, common) {
    switch (productId) {
      case 'cci_biomass':
        common.layers.default = 'cci_biomass';
        break;
      case 'gedi_l4b':
        common.layers.default = 'gedi_l4b';
        break;
      case 'nasa_jpl':
        common.layers.default = 'nasa_jpl';
        break;
      case 'icesat2_boreal':
        common.layers.default = 'icesat2_boreal_biomass_reduced';
        break;
      case 'nceo_africa':
        common.layers.default = 'nceo_africa';
        break;
      default:
        break;
    }
    this.qsState = new QsState(common);
  }
}

ProductSingle.propTypes = {
  fetchProductSingle: T.func,
  product: T.object,
  productList: T.object,
  match: T.object,
  location: T.object,
  history: T.object
};

function mapStateToProps(state, props) {
  const { productId } = props.match.params;

  return {
    mapLayers: getProductLayers(productId),
    productList: wrapApiResult(state.product.list),
    product: wrapApiResult(
      getFromState(state, ['product', 'single', productId])
    )
  };
}

const mapDispatchToProps = {
  fetchProductSingle: fetchProductSingleAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductSingle);
