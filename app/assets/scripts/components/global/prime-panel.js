import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';

import Panel, { PanelHeadline, PanelTitle } from '../common/panel';
import DataLayersBlock from '../common/data-layers-block';
import {
  PanelBlock,
  PanelBlockHeader,
  PanelBlockTitle,
  PanelBlockBody
} from '../common/panel-block';
import FilterAoi from './filter-aoi';
import ProductsNavigation from '../common/products-navigation';

import media, { isLargeViewport } from '../../styles/utils/media-queries';

const PrimePanel = styled(Panel)`
  ${media.largeUp`
    width: 18rem;
  `}
`;

class ExpMapPrimePanel extends React.Component {
  render() {
    const {
      layers,
      onAction,
      onPanelChange,
      mapLoaded,
      aoiState,
      productList
    } = this.props;

    const products = productList.isReady() && productList.getData();

    return (
      <PrimePanel
        collapsible
        direction='left'
        onPanelChange={onPanelChange}
        initialState={isLargeViewport()}
        headerContent={(
          <PanelHeadline>
            <PanelTitle>Explore</PanelTitle>
          </PanelHeadline>
        )}
        bodyContent={
          <>
            <ProductsNavigation products={products || []} />
            <DataLayersBlock
              layers={layers}
              mapLoaded={mapLoaded}
              onAction={onAction}
            />

            <PanelBlock>
              <PanelBlockHeader>
                <PanelBlockTitle>Tools</PanelBlockTitle>
              </PanelBlockHeader>
              <PanelBlockBody>
                <FilterAoi onAction={onAction} aoiState={aoiState} />
              </PanelBlockBody>
            </PanelBlock>
          </>
        }
      />
    );
  }
}

ExpMapPrimePanel.propTypes = {
  onPanelChange: T.func,
  onAction: T.func,
  layers: T.array,
  mapLoaded: T.bool,
  aoiState: T.object,
  productList: T.object
};

export default ExpMapPrimePanel;
