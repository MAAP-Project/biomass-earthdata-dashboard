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
import MbMap from '../../common/mb-map-country-pilots/mb-map';
import UhOh from '../../uhoh';
import DataLayersBlock from '../../common/data-layers-block';
import Panel, { PanelHeadline, PanelTitle } from '../../common/panel';
import MapMessage from '../../common/map-message';
import Timeline from '../../common/timeline';
import SecPanel from './sec-panel';
import CountryPilotsNavigation from '../../common/country-pilots-navigation';

import { themeVal } from '../../../styles/utils/general';
import { fetchCountryPilotSingle as fetchCountryPilotSingleAction } from '../../../redux/country-pilot';
import { wrapApiResult, getFromState } from '../../../redux/reduxeed';
import {
  showGlobalLoading,
  hideGlobalLoading
} from '../../common/global-loading';
import { getCountryPilotLayers } from '../../common/layers';
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

class CountryPilotSingle extends React.Component {
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

    // Set query state definition for url state storing.
    const common = getCommonQsState(props);

    switch (props.match.params.countryPilotId) {
      case 'wales':
        common.layers.default = 'cci_biomass';
        break;
      case 'japan':
        common.layers.default = 'gedi_l4b';
        break;
      case 'paraguay':
        common.layers.default = 'nasa_jpl';
        break;
      case 'peru':
        common.layers.default = 'icesat2_boreal';
        break;
      default:
        break;
    }

    this.qsState = new QsState(common);

    // The active layers can only be enabled once the map loads. The toggle
    // layer method checks the state to see what layers are enabled so we can't
    // store the active layers from the url in the same property, otherwise
    // they'd be disabled.
    // They get temporarily stored in another property and once the map loads
    // the layers are enabled and stored in the correct property.
    const { activeLayers, ...urlState } = this.qsState.getState(
      props.location.search.substr(1)
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
    this.requestCountryPilot();
  }

  componentDidUpdate(prevProps, prevState) {
    const { countryPilotId } = this.props.match.params;
    if (countryPilotId !== prevProps.match.params.countryPilotId) {
      this.requestCountryPilot();
      // Reset state on page change.
      this.setState({
        ...getInitialMapExploreState(),
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

  async requestCountryPilot() {
    showGlobalLoading();
    await this.props.fetchCountryPilotSingle(this.props.match.params.countryPilotId);
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
          const countryPilotData = this.props.countryPilot.getData();
          this.mbMapRef.current.mbMap.fitBounds(countryPilotData.bounding_box);
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
    const { countryPilot, countryPilotList } = this.props;

    if (countryPilot.hasError()) return <UhOh />;

    const countryPilots = countryPilotList.isReady() && countryPilotList.getData();

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
          {countryPilot.isReady() && (
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
                      <CountryPilotsNavigation countryPilots={countryPilots || []} />
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
                  summary={countryPilot.getData().summary}
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
}

CountryPilotSingle.propTypes = {
  fetchCountryPilotSingle: T.func,
  countryPilot: T.object,
  countryPilotList: T.object,
  match: T.object,
  location: T.object,
  history: T.object
};

function mapStateToProps(state, props) {
  const { countryPilotId } = props.match.params;

  return {
    mapLayers: getCountryPilotLayers(countryPilotId),
    countryPilotList: wrapApiResult(state.countryPilot.list),
    countryPilot: wrapApiResult(
      getFromState(state, ['countryPilot', 'single', countryPilotId])
    )
  };
}

const mapDispatchToProps = {
  fetchCountryPilotSingle: fetchCountryPilotSingleAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CountryPilotSingle);
