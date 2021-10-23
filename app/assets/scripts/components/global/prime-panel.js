import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';

import Panel, { PanelHeadline, PanelTitle } from '../common/panel';
import DataLayersBlock from '../common/data-layers-block';
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
  productList: T.object
};

export default ExpMapPrimePanel;
