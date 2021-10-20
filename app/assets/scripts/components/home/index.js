import React from 'react';
import styled, { keyframes } from 'styled-components';
import T from 'prop-types';

import { connect } from 'react-redux';

import { themeVal } from '../../styles/utils/general';
import { visuallyHidden } from '../../styles/helpers';

import { Link } from 'react-router-dom';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody
} from '../../styles/inpage';
import Prose from '../../styles/type/prose';
import MbMap from '../common/mb-map-products/mb-map';
import { fetchProductSingle as fetchProductSingleAction } from '../../redux/product';
import { wrapApiResult } from '../../redux/reduxeed';

import { headingAlt } from '../../styles/type/heading';
import {
  getLayersWithState,
  getInitialMapExploreState,
  getLayerState,
  setLayerState,
  toggleLayerCommon,
  resizeMap,
  getActiveTimeseriesLayers
} from '../../utils/map-explore-utils';

import { glsp } from '../../styles/utils/theme-values';
import { surfaceElevatedD } from '../../styles/skins';
import media from '../../styles/utils/media-queries';

import stories from './stories';
import { getProductLayers } from '../common/layers';
import { mod } from '../../utils/utils';

const CYCLE_TIME = 8000;

const Intro = styled.section`
  position: relative;
  min-height: 100%;
  background: ${themeVal('color.baseAlphaA')};
  display: flex;
  flex-flow: column nowrap;
  padding: ${glsp()};

  ${media.mediumUp`
    padding: ${glsp(2)};
  `}
`;

const IntroCopy = styled.div`
  ${surfaceElevatedD()}
  position: relative;
  z-index: 10;
  border-radius: ${themeVal('shape.rounded')};
  overflow: hidden;
  width: 100%;
  display: grid;

  ${media.smallUp`
    max-width: 32rem;
  `}

  ${media.mediumUp`
    max-width: 34rem;
  `}

  ${media.largeUp`
    max-width: 36rem;
  `}

  ${media.xlargeUp`
    max-width: 40rem;
  `}
`;

const IntroTitle = styled.h1`
  ${visuallyHidden()}
`;

const IntroWelcomeTitle = styled.h1`
  font-size: 1.25rem;
  line-height: 1.5rem;
  margin: 0;


  ${media.mediumUp`
    font-size: 1.5rem;
    line-height: 1.75rem;
  `}

  small {
    ${headingAlt()}
    display: block;

    ${media.mediumUp`
      font-size: 1rem;
      line-height: 1;
    `}
  }

  strong {
    display: block;
    font-size: 2rem;
    line-height: 2.5rem;
    letter-spacing: -0.016em;
  }
`;

const IntroWelcome = styled.section`
  display: grid;
  grid-gap: ${glsp()};
  padding: ${glsp()};
  box-shadow: 0 1px 0 0 ${themeVal('color.baseAlphaB')};

  ${Prose} {
    a {
      font-weight: ${themeVal('type.base.bold')};
    }
  }

  ${media.mediumUp`
    grid-gap: ${glsp()} 0;
    padding: ${glsp(1.25, 2)};
  `}
`;

const IntroStats = styled.section`
  display: grid;
  grid-gap: ${glsp()} 0;
  padding: ${glsp()};

  ${media.mediumUp`
    grid-gap: ${glsp()} 0;
    padding: ${glsp(1.25, 2)};
  `}
`;

const IntroStatsTitle = styled.h1`
  ${visuallyHidden()}
`;

const IntroStatsList = styled.dl`
  display: grid;
  grid-auto-columns: min-content;
  grid-auto-rows: auto;
  grid-auto-flow: column;
  grid-gap: ${glsp(0.25, 1.5)};
  align-items: end;

  * {
    line-height: 1;
    margin: 0;
  }

  dt {
    ${headingAlt}
    font-size: 0.75rem;
    line-height: 1;
    grid-row: 1;
  }

  dd {
    font-family: ${themeVal('type.base.family')};
    font-weight: ${themeVal('type.heading.weight')};
    font-size: 2rem;
    line-height: 1;
    grid-row: 2;

    ${media.mediumUp`
      font-size: 3rem;
    `}
  }
`;

const IntroMedia = styled.figure`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`;

const grow = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.mbMapRef = React.createRef();
    this.state = {
      storyIndex: 0,
      mapLoaded: false,
      mapLayers: [],
      storiesCycling: true,
      storiesCyclingIteration: 0,
      ...getInitialMapExploreState()
    };

    this.prevStory = this.prevStory.bind(this);
    this.nextStory = this.nextStory.bind(this);
    this.toggleStoriesCycling = this.toggleStoriesCycling.bind(this);
    this.onMapAction = this.onMapAction.bind(this);
    this.getLayersWithState = getLayersWithState.bind(this);
    this.getLayerState = getLayerState.bind(this);
    this.setLayerState = setLayerState.bind(this);
    this.getActiveTimeseriesLayers = getActiveTimeseriesLayers.bind(this);
    this.resizeMap = resizeMap.bind(this);

    this.storiesCyclingTimeout = null;
  }

  componentDidMount(prevProps, prevState) {
    this.requestProduct();
  }

  componentDidUpdate(prevProps, prevState) {
    const { mapLoaded, storyIndex } = this.state;
    const { product } = this.props;
    const { productId, layers } = stories[storyIndex];
    if (mapLoaded) {
      if (product !== prevProps.product) {
        this.resizeMap();
        const productData = product[productId].getData();
        if (productData.bounding_box) {
          const storyLayers = layers;
          const productLayers = getProductLayers(productId)
            .map(layer => ({ ...layer, enabled: storyLayers.includes(layer.id) }));
          this.mbMapRef.current.mbMap.fitBounds(productData.bounding_box);
          this.setState({
            mapLayers: productLayers
          }, () => {
            for (const l of productLayers) {
              if (l.enabled && !this.state.activeLayers.includes(l.id)) {
                this.toggleLayer(l);
              }
            }
          });
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.storiesCyclingTimeout) {
      clearTimeout(this.storiesCyclingTimeout);
    }
  }

  toggleLayer(layer) {
    toggleLayerCommon.call(this, layer, () => {
      if (this.storiesCyclingTimeout) {
        clearTimeout(this.storiesCyclingTimeout);
      }
      if (this.state.storiesCycling) {
        this.setState(state => ({
          storiesCyclingIteration: state.storiesCyclingIteration + 1
        }));
        this.storiesCyclingTimeout = setTimeout(() => {
          this.nextStory();
        }, CYCLE_TIME);
      }
    });
  }

  async requestProduct() {
    await this.props.fetchProductSingle(stories[this.state.storyIndex].productId);
  }

  async onMapAction(action, payload) {
    switch (action) {
      case 'map.loaded': {
        this.setState({ mapLoaded: true }, this.requestProduct);
        break;
      }
      case 'map.move': {
        // Any user interaction with the map will stop the stories.
        if (payload.userInitiated) {
          this.stopStoriesCycling();
        }
        break;
      }
    }
  }

  toggleStoriesCycling() {
    const { storiesCycling } = this.state;
    if (storiesCycling) {
      this.stopStoriesCycling();
    } else {
      this.startStoriesCycling();
    }
  }

  stopStoriesCycling() {
    // Stop timeout when the user paused
    if (this.storiesCyclingTimeout) {
      clearTimeout(this.storiesCyclingTimeout);
    }
    this.setState({ storiesCycling: false });
  }

  startStoriesCycling() {
    // Prepare timeout when the user restarts.
    this.storiesCyclingTimeout = setTimeout(() => {
      this.nextStory();
    }, CYCLE_TIME);
    this.setState({ storiesCycling: true });
  }

  prevStory(e) {
    // If the user is manually navigating, stop the auto play.
    if (e) {
      e.preventDefault();
      this.stopStoriesCycling();
    }
    this.setState(prevState => {
      return ({
        storyIndex: mod(prevState.storyIndex - 1, stories.length)
      });
    }, this.requestProduct);
  }

  nextStory(e) {
    // If the user is manually navigating, stop the auto play.
    if (e) {
      e.preventDefault();
      this.stopStoriesCycling();
    }
    this.setState(prevState => {
      return ({
        storyIndex: mod(prevState.storyIndex + 1, stories.length)
      });
    }, this.requestProduct);
  }

  render() {
    const {
      storyIndex,
      mapLayers,
      activeLayers
    } = this.state;
    const currentStory = stories[storyIndex];
    const { storyDate } = currentStory;
    const layers = this.getLayersWithState(mapLayers);

    const { isReady, getData } = this.props.productList;
    const productsCount = isReady() ? getData().length : 0;

    const { isReady: isReadyCp, getData: getDataCp } = this.props.countryPilotList;
    const countryPilotsCount = isReadyCp() ? getDataCp().length : 0;

    return (
      <App pageTitle='Home'>
        <Inpage isMapCentric>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Home</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <Intro>
              <IntroCopy>
                <IntroTitle>Start exploring</IntroTitle>
                <IntroWelcome>
                  <IntroWelcomeTitle>The Biomass Harmonization Activity</IntroWelcomeTitle>
                  <Prose>
                    <p>
                      <b>Biomass, the living part of vegetation systems, plays a crucial role in climate.</b> Around half of biomass is carbon, so destruction of vegetation, as in deforestation, releases carbon dioxide to the atmosphere. This carbon source is huge (about 6 billion tons of carbon dioxide per year). At the same time, vegetation growth pulls carbon dioxide out of the atmosphere and stores it as biomass. Hence biomass and its change, especially forest biomass, is a key part of both the climate <i>problem</i> and its <i>solution</i>.
                    </p>
                    <p>
                      <b>Mapping aboveground biomass is therefore a priority of several new and upcoming NASA, ESA and JAXA missions, including GEDI, ICESat-2, BIOMASS, ALOS-4 and NISAR.</b>
                    </p>
                    <p>
                      A primary purpose of these missions is to provide biomass density maps that can be used in forest carbon estimation and reporting, and forest and land use management for climate mitigation purposes. Currently, national GHG estimation and reporting depends on either National Forest Inventories (NFIs) or other sparse forest plot data. While the IPCC 2017 AFOLU GPG  provides guidance on using biomass density maps for country purposes, there are very few concrete country examples because it is only recently that space-based data have become available at the level of detail and quality useful for such purposes. There are, however, different space missions using different sensors and technologies (radar, lidar) and thus produce different estimates of biomass. Such disparities are a potential source of confusion for users, so it is highly desirable to produce a single most accurate biomass dataset by combining the strengths of the individual sensors. This dataset must have undergone rigorous, consistent and transparent validation if it is to be used with confidence by the policy community. This issue is pressing as the world prepares for the United Nations Framework Convention on Climate Change's first ‘Global Stocktake' (GST); this will take place in 2023, with repetitions every five years. For space-based biomass information to become a key input to future GSTs, it is essential that it be included in the baseline methods established in the 2023 GST.
                    </p>
                    <p><Link to='/about' title='About'>Learn More</Link></p>
                  </Prose>
                </IntroWelcome>
                <IntroStats>
                  <IntroStatsTitle>Some numbers</IntroStatsTitle>
                  <IntroStatsList>
                    <dt>Products</dt>
                    <dd><Link to='/products' title='Explore the products'>{productsCount - 1}</Link></dd>
                    <dt>Country Pilots</dt>
                    <dd><Link to='/country_pilots' title='Explore the country pilots'>{countryPilotsCount}</Link></dd>
                  </IntroStatsList>
                </IntroStats>
              </IntroCopy>
              <IntroMedia>
                <MbMap
                  ref={this.mbMapRef}
                  onAction={this.onMapAction}
                  layers={layers}
                  activeLayers={activeLayers}
                  date={storyDate ? new Date(storyDate) : new Date('03/01/20')}
                  aoiState={null}
                  comparing={false}
                  disableControls
                />
              </IntroMedia>
            </Intro>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

Home.propTypes = {
  fetchProductSingle: T.func,
  productList: T.object,
  countryPilotList: T.object,
  product: T.object
};

function mapStateToProps(state, props) {
  return {
    productList: wrapApiResult(state.product.list),
    countryPilotList: wrapApiResult(state.countryPilot.list),
    product: wrapApiResult(state.product.single, true)
  };
}

const mapDispatchToProps = {
  fetchProductSingle: fetchProductSingleAction
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
