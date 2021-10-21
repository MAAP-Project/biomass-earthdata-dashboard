import React from 'react';
import T from 'prop-types';
import styled, { withTheme, ThemeProvider } from 'styled-components';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import CompareMbGL from 'mapbox-gl-compare';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import config from '../../../config';
import { fetchProductSingle as fetchProductSingleAction } from '../../../redux/product';
import { wrapApiResult } from '../../../redux/reduxeed';
import { layerTypes } from '../layers/types';
import { glsp } from '../../../styles/utils/theme-values';
import mbAoiDraw from './mb-aoi-draw';
import { round } from '../../../utils/format';
import { createMbMarker } from './mb-popover/utils';
import { getProductLayers } from '../layers';
import MapboxControl from '../mapbox-react-control';

import ReactPopoverGl from './mb-popover';
import Button from '../../../styles/button/button';
import Prose from '../../../styles/type/prose';
import Dl from '../../../styles/type/definition-list';
import LayerControlDropdown from './map-layer-control';

const { center, zoom: defaultZoom, minZoom, maxZoom, styleUrl } = config.map;

const MOSAICJSON = 'mosaicjson';
const COG = 'cog';
const MOSAICS = '/mosaics/';

// Set mapbox token.
mapboxgl.accessToken = config.mbToken;
localStorage.setItem('MapboxAccessToken', config.mbToken);

const MapsContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;

  /* Styles to accommodate the partner logos */
  .mapboxgl-ctrl-bottom-left {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;

    > .mapboxgl-ctrl {
      margin: 0 ${glsp(0.5)} 0 0;
    }
  }

  .partner-logos {
    display: flex;
    img {
      display: block;
      height: 3rem;
    }

    a {
      display: block;
    }

    > *:not(:last-child) {
      margin: 0 ${glsp(0.5)} 0 0;
    }
  }
`;

const SingleMapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const PopoverDetails = styled(Dl)`
  dt {
    font-size: 0.75rem;
    line-height: 1;
    margin: 0;
    margin-bottom: ${glsp(0.25)};

    &:not(:first-child) {
      margin-top: ${glsp(0.75)};
    }
  }
  dd {
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin: 0;
    padding-left: ${glsp(0.25)};
  }
`;

const ProductNavLink = styled(NavLink)`
  &,
  &:visited {
    color: inherit;
  }
`;

class MbMap extends React.Component {
  constructor(props) {
    super(props);
    this.mapContainer = null;
    this.mbMap = null;
    this.mbDraw = null;

    this.state = {
      overlayState: {
        productMarkers: true
      },
      popover: {
        coords: null,
        productId: null
      },
      pointDetails: {
        coords: null,
        values: {}
      }
    };

    // Store markers to be able to remove them.
    this.productMarkersList = [];

    this.handleOverlayChange = this.handleOverlayChange.bind(this);
  }

  componentDidMount() {
    // Mount the map on the net tick to prevent the right side gap.
    setTimeout(() => this.initMap(), 1);
  }

  componentDidUpdate(prevProps, prevState) {
    // Manually trigger render of detached react components.
    this.overlayDropdownControl &&
      this.overlayDropdownControl.render(this.props, this.state);
    this.overlayDropdownControlCompare &&
      this.overlayDropdownControlCompare.render(this.props, this.state);

    const { activeLayers, comparing, productList } = this.props;

    // Compare Maps
    if (comparing !== prevProps.comparing) {
      if (comparing) {
        this.enableCompare(prevProps);
      } else {
        if (this.compareControl) {
          this.compareControl.remove();
          this.compareControl = null;
          this.mbMapComparing.remove();
          this.mbMapComparing = null;
          this.mbMapComparingLoaded = false;
        }
      }
    }

    // Technical debt: The activeLayers and layers prop depend on eachother,
    // but they get updated at different times.
    // This leads to problems when finding a given layer in the layers array.
    // We can safely assume that when the layers array change, all the active
    // layers should be hidden.
    const currId = this.props.layers.map((l) => l.id).join('.');
    const prevIds = prevProps.layers.map((l) => l.id).join('.');
    if (currId !== prevIds) {
      // The 'layers' update before the 'activeLayers', therefore we have to
      // check the current 'activeLayers' against the previous 'layers'. However
      // when the 'layers' update, the prevProps.activeLayers will be the same
      // as this.props.activeLayers. By using the prevProps.activeLayers we fix
      // the problem when 'layers' update at the same time as 'activeLayers'
      // which happens for the stories.
      prevProps.activeLayers.forEach((layerId) => {
        const layerInfo = prevProps.layers.find((l) => l.id === layerId);
        const fns = layerTypes[layerInfo.type];
        if (fns) {
          return fns.hide(this, layerInfo, prevProps);
        }
        /* eslint-disable-next-line no-console */
        console.error('No functions found for layer type', layerInfo.type);
      });
    }

    if (
      prevProps.activeLayers !== activeLayers ||
      comparing !== prevProps.comparing
    ) {
      const toRemove = prevProps.activeLayers.filter(
        (l) => !activeLayers.includes(l)
      );
      const toAdd = activeLayers.filter(
        (l) => !prevProps.activeLayers.includes(l)
      );

      toRemove.forEach((layerId) => {
        const layerInfo = this.props.layers.find((l) => l.id === layerId);
        if (!layerInfo) return;
        const fns = layerTypes[layerInfo.type];
        if (fns) {
          return fns.hide(this, layerInfo, prevProps);
        }
        /* eslint-disable-next-line no-console */
        console.error('No functions found for layer type', layerInfo.type);
      });

      toAdd.forEach(async (layerId) => {
        const layerInfo = this.props.layers.find((l) => l.id === layerId);
        if (!layerInfo) return;
        const fns = layerTypes[layerInfo.type];
        if (fns) {
          fns.show(this, layerInfo, prevProps);
          if (fns.update) {
            fns.update(this, layerInfo, prevProps);
          }
          return;
        }
        /* eslint-disable-next-line no-console */
        console.error('No functions found for layer type', layerInfo.type);
      });
    }

    // Update mapLayers if changed
    const productMarkers = this.state.overlayState;
    if (prevState.overlayState.productMarkers !== productMarkers) {
      if (productMarkers) {
        this.updateProducts();
      } else {
        this.productMarkersList.forEach(m => m.remove());
        this.productMarkersList = [];
        this.setState({ popover: {} });
      }
    }

    // Update all active layers.
    this.updateActiveLayers(prevProps);

    // Handle aoi state props update.
    if (this.mbDraw) {
      this.mbDraw.update(prevProps.aoiState, this.props.aoiState);
    }

    // If productList is active and was made available, add it to the map
    if (
      productList &&
      productList.isReady() &&
      !prevProps.productList.isReady()
    ) {
      this.updateProducts();
    }
  }

  handleOverlayChange(id) {
    this.setState(state => ({
      // Replace the array index with the negated value.
      overlayState: Object.assign({}, state.overlayState, {
        [id]: !state.overlayState[id]
      })
    }));
  }

  /**
   * Adds product markers to mbMap and mbMapComparing. This functions uses
   * component state to control products loading state, because maps will
   * finish loading at different times.
   */
  updateProducts() {
    // Check if products are available
    const { productList } = this.props;
    if (!productList || !productList.isReady()) return;

    // Get products from API data
    const products = productList.getData();

    // Define a common function to add markers
    const addMarker = (product, map) => {
      return createMbMarker(map, { color: this.props.theme.color.primary })
        .setLngLat(product.center)
        .addTo(map)
        .onClick((coords) => {
          this.props.fetchProductSingle(product.id);
          this.setState({ popover: { coords, productId: product.id } });
        });
    };
  }

  enableCompare(prevProps) {
    this.mbMap.resize();
    this.mbMapComparing = new mapboxgl.Map({
      attributionControl: false,
      container: this.mapContainerComparing,
      center: this.mbMap.getCenter(),
      zoom: this.mbMap.getZoom(),
      minZoom: minZoom || 4,
      maxZoom: maxZoom || 9,
      style: styleUrl,
      pitchWithRotate: false,
      dragRotate: false,
      logoPosition: 'bottom-left'
    });

    // Add zoom controls.
    this.mbMapComparing.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Remove compass.
    document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

    if (this.props.enableLocateUser) {
      this.mbMapComparing.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }),
        'top-left'
      );
    }

    if (this.props.enableOverlayControls) {
      this.overlayDropdownControlCompare = new MapboxControl(
        (props, state) => this.renderOverlayDropdown(props, state)
      );

      this.mbMapComparing.addControl(this.overlayDropdownControlCompare, 'top-left');
      // Initial rendering.
      this.overlayDropdownControlCompare.render(this.props, this.state);
    }

    // Style attribution.
    this.mbMapComparing.addControl(
      new mapboxgl.AttributionControl({ compact: true })
    );

    this.mbMapComparing.once('load', () => {
      this.mbMapComparingLoaded = true;
      this.updateActiveLayers(prevProps);
      this.updateProducts();
    });

    this.compareControl = new CompareMbGL(
      this.mbMapComparing,
      this.mbMap,
      '#container'
    );
  }

  updateActiveLayers(prevProps) {
    this.props.activeLayers.forEach((layerId) => {
      const layerInfo = this.props.layers.find((l) => l.id === layerId);
      if (!layerInfo) return;
      const fns = layerTypes[layerInfo.type];
      if (fns && fns.update) {
        return fns.update(this, layerInfo, prevProps);
      }
    });
  }

  initMap() {
    const { lng, lat, zoom } = this.props.position || {
      lng: center[0],
      lat: center[1],
      zoom: defaultZoom
    };

    this.mbMap = new mapboxgl.Map({
      attributionControl: false,
      container: this.mapContainer,
      center: [lng, lat],
      zoom: zoom || 5,
      minZoom: minZoom || 4,
      maxZoom: maxZoom || 9,
      style: styleUrl,
      pitchWithRotate: false,
      dragRotate: false,
      logoPosition: 'bottom-left'
    });

    // Disable map rotation using right click + drag.
    this.mbMap.dragRotate.disable();

    // Disable map rotation using touch rotation gesture.
    this.mbMap.touchZoomRotate.disableRotation();

    if (!this.props.disableControls) {
      // Add zoom controls.
      this.mbMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Remove compass.
      document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

      if (this.props.enableLocateUser) {
        this.mbMap.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          }),
          'top-left'
        );
      }

      if (this.props.enableOverlayControls) {
        this.overlayDropdownControl = new MapboxControl(
          (props, state) => this.renderOverlayDropdown(props, state)
        );

        this.mbMap.addControl(this.overlayDropdownControl, 'top-left');
        // Initial rendering.
        this.overlayDropdownControl.render(this.props, this.state);
      }
    }

    // Style attribution
    this.mbMap.addControl(new mapboxgl.AttributionControl({ compact: true }));

    // Setup the AIO drawing functions.
    if (this.props.aoiState) {
      this.mbDraw = mbAoiDraw(this.mbMap);
      const { feature } = this.props.aoiState;
      this.mbDraw.setup(
        this.props.onAction,
        feature ? [feature] : null,
        this.props.theme
      );
    }

    this.mbMap.on('load', () => {
      const allProps = this.props;
      const { productList, comparing, onAction } = allProps;
      onAction('map.loaded');

      if (comparing) {
        // Fake previous props to simulate the enabling of the compare option.
        this.enableCompare({
          ...allProps,
          comparing: false
        });
      }

      // If product list is available on map mount, add it to the map
      if (productList && productList.isReady()) {
        this.updateProducts(productList.getData());
      }
    });

    this.mbMap.on('moveend', (e) => {
      this.props.onAction('map.move', {
        // The existence of originalEvent indicates that it was not caused by
        // a method call.
        userInitiated: Object.prototype.hasOwnProperty.call(e, 'originalEvent'),
        lng: round(this.mbMap.getCenter().lng, 4),
        lat: round(this.mbMap.getCenter().lat, 4),
        zoom: round(this.mbMap.getZoom(), 2)
      });
    });

    this.mbMap.on('click', (e) => {
      this.setState({ pointDetails: { coords: e.lngLat.toArray() } });
      this.getPointValues(e.lngLat.toArray());
    });
  }

  renderOverlayDropdown(props, state) {
    return (
      <ThemeProvider theme={props.theme}>
        <LayerControlDropdown
          overlayState={state.overlayState}
          handleOverlayChange={this.handleOverlayChange}
        />
      </ThemeProvider>
    );
  }

  renderPopover() {
    const { productId } = this.state.popover;

    let product = {};

    if (productId) {
      const { getData, isReady } = this.props.product[productId];
      product = isReady() ? getData() : {};
    }

    const truncateArray = (arr, count) => {
      if (!arr) return [];
      if (arr.length <= count) return arr;
      return [
        // We always want to have count items. If there are more show, count - 1
        // and "more".
        ...arr.slice(0, count - 1),
        {
          id: 'other',
          name: <em>and {arr.length - (count - 1)} more</em>
        }
      ];
    };

    const productLayers = getProductLayers(productId);
    const layersToShow = truncateArray(productLayers, 3);

    return (
      <ReactPopoverGl
        mbMap={this.mbMap}
        lngLat={this.state.popover.coords}
        onClose={() => this.setState({ popover: {} })}
        offset={[38, 3]}
        suptitle='Area'
        title={
          product.id ? (
            <ProductNavLink
              to={`/products/${product.id}`}
              title={`Visit ${product.label} page`}
            >
              {product.label}
            </ProductNavLink>
          ) : (
            'Loading'
          )
        }
        content={
          product.id && (
            <Prose>
              <PopoverDetails>
                <dt>Layers</dt>
                {layersToShow.map(({ id, name }) => (
                  <dd key={id}>{name}</dd>
                ))}
              </PopoverDetails>
            </Prose>
          )
        }
        footerContent={
          <Button
            variation='primary-raised-dark'
            element={NavLink}
            to={`/products/${productId}`}
            title={`Visit ${product.label} page`}
            useIcon={['chevron-right--small', 'after']}
          >
            Explore area
          </Button>
        }
      />
    );
  }

  getPointValues (longlat) {
    const lon = longlat[0];
    const lat = longlat[1];

    this.props.activeLayers.forEach(activeLayer => {
      const layerInfo = this.props.layers.find(layer => layer.id === activeLayer);
      const tileUrl = new URL(layerInfo?.source.tiles[0]);
      let url = tileUrl.searchParams.get('url');
      const bidx = tileUrl.searchParams.get('bidx') || 1;
      let href = tileUrl.href.split('/tiles')[0];
      const dataType = href.split('/')[3];

      if (dataType === MOSAICJSON) {
        if (href.includes(MOSAICS)) { // in case of dynamodb hosted mosaicjson
          const newHref = href.split(MOSAICS)[0];
          url = `${href}/${MOSAICJSON}`;
          href = newHref;
        }
      }
      const getValueUrl = `${href}/point/${lon},${lat}?url=${url}`;
      axios.get(getValueUrl).then(response => {
        if (response.status === 200) {
          let datasetValue;
          if (dataType === COG) {
            datasetValue = response.data.values[bidx - 1];
          } else if (dataType === MOSAICJSON) {
            datasetValue = response.data.values[0][1][bidx - 1];
          } else {
            datasetValue = null;
          }
          if (datasetValue != null) {
            this.setState(state => {
              return {
                ...state,
                pointDetails: {
                  ...state.pointDetails,
                  values: {
                    ...state.pointDetails.values,
                    [layerInfo.name]: datasetValue
                  }
                }
              };
            });
          }
        }
      }).catch(err =>
        /* eslint-disable-next-line no-console */
        console.log(err));
    });
  }

  renderPointDetails () {
    const dataValues = this.state.pointDetails.values;
    if (!dataValues) return null;
    return (
      <ReactPopoverGl
        mbMap={this.mbMap}
        lngLat={this.state.pointDetails.coords}
        onClose={() => this.setState({ pointDetails: {} })}
        offset={[0, 0]}
        title='Point value'
        content={
          <Prose>
            <PopoverDetails>
              <dt>Layers</dt>
              {
                Object.entries(this.state.pointDetails.values).map((val) => (
                  <div key={val[0]} style={{ fontSize: '12px' }}>
                    <span><b>{val[0]}: </b></span>
                    <span>{parseFloat(val[1]).toFixed(4)}</span>
                  </div>
                ))
              }
            </PopoverDetails>
          </Prose>
        }
      />
    );
  }

  render() {
    return (
      <>
        {this.mbMap && this.renderPopover() && this.renderPointDetails()}
        <MapsContainer id='container'>
          <SingleMapContainer
            ref={(el) => {
              this.mapContainerComparing = el;
            }}
          />
          <SingleMapContainer
            ref={(el) => {
              this.mapContainer = el;
            }}
          />
        </MapsContainer>
      </>
    );
  }
}

MbMap.propTypes = {
  onAction: T.func,
  theme: T.object,
  position: T.object,
  aoiState: T.object,
  comparing: T.bool,
  activeLayers: T.array,
  layers: T.array,
  enableLocateUser: T.bool,
  enableOverlayControls: T.bool,
  disableControls: T.bool,
  productList: T.object,
  product: T.object,
  fetchProduct: T.func
};

function mapStateToProps(state) {
  return {
    product: wrapApiResult(state.product.single, true)
  };
}

const mapDispatchToProps = {
  fetchProductSingle: fetchProductSingleAction
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(withTheme(MbMap));
