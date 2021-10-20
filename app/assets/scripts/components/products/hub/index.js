import React from 'react';
import T from 'prop-types';
import { connect } from 'react-redux';
import converter from 'number-to-words';

import App from '../../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody
} from '../../../styles/inpage';
import Prose from '../../../styles/type/prose';
import InpageHGroup from '../../../styles/inpage-hgroup';
import {
  PageConstrainer,
  HubFold,
  EntriesList,
  EntryNavLink,
  EntryNavLinkTitle,
  EntryNavLinkMedia
} from '../../../styles/hub-pages';

import { wrapApiResult } from '../../../redux/reduxeed';

import config from '../../../config';
const { baseUrl } = config;

const metadata = {
  color: '#2276AC'
};

class ProductHub extends React.Component {
  render() {
    const { productsList } = this.props;
    const products = productsList.isReady() && productsList.getData();
    const productsCount = converter.toWords(products ? products.length : 0);

    return (
      <App pageTitle='Products'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Understanding Products</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <PageConstrainer>
              <HubFold>
                <Prose>
                  <p>
                    Several current projects are producing continental to global biomass maps. These include 
                    ESA’s CCI-Biomass global maps at a scale of 100 m for 2010, 2017, 2018, 2020; JPL’s global 
                    100 m map for 2020, and a time series of 10 km (global?) biomass maps from 2000-2020; 
                    NASA GEDI’s 1 km map for 2020 covering latitudes between ~52° N and 52° S; the NASA 
                    ICESat-2 30 m boreal map for 2020; and the UK National Centre for Earth Observation (EO) 
                    100 m time series of maps for Africa from 2007 to 2017.
                  </p>
                  <p>
                    This new generation of biomass products will provide improved global and regional 
                    estimation of carbon fluxes from forest changes, but their widespread take-up requires 
                    that their differences are addressed and their accuracy is known. The world’s EO biomass 
                    community is therefore undertaking a programme aimed at resolving discrepancies between 
                    products and producing harmonized estimates of biomass and uncertainty at a policy-relevant, 
                    jurisdictional-level scale. This effort builds on the CEOS biomass cal/val protocol and 
                    reference data and tools available and used by CEOS partners. Key global biomass production 
                    and validation teams, including national experts, are engaged in this effort, with a shared 
                    goal of producing harmonized biomass products for use in the UNFCCC GST process, with 
                    anticipated release in the first half of 2022. Besides the global harmonization effort, 
                    the community is working with varying country experts and agencies to demonstrate the 
                    uptake of space-based biomass to improve national biomass and forest carbon stock 
                    estimation in different country circumstances.
                  </p>
                  <p>Click below to view a product.</p>
                </Prose>
              </HubFold>
              <HubFold>
                <InpageHGroup
                  title='Products'
                  dashColor={metadata.color}
                />
                <EntriesList>
                  {products &&
                    products.map((item) => (
                      <li key={item.id}>
                        <EntryNavLink
                          to={`/products/${item.id}`}
                          title={`View product area ${item.label}`}
                        >
                          <EntryNavLinkTitle>{item.label}</EntryNavLinkTitle>
                          <EntryNavLinkMedia>
                            <img src={`${baseUrl}/assets/graphics/content/products/thumb-${item.id}.jpg`} width='280' alt='Area thumbnail' />
                          </EntryNavLinkMedia>
                        </EntryNavLink>
                      </li>
                    ))}
                </EntriesList>
              </HubFold>
              {/* <HubFold>
                <InpageHGroup
                  title='Attribution'
                  dashColor={metadata.color}
                />
                <Prose>
                  <ul>
                    <li>
                      Togo image by{' '}
                      <a
                        href='https://commons.wikimedia.org/wiki/File:ECOWAS_Bank_for_Investment_and_Development_headquarters_in_Lom%C3%A9.jpg'
                        target='_blank'
                        rel='noopener noreferrer'
                        title='View more'
                      >
                        Willem Heerbaart
                      </a>, available under cc-by-2.0
                    </li>
                  </ul>
                </Prose>
              </HubFold> */}
            </PageConstrainer>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

ProductHub.propTypes = {
  productsList: T.object
};

function mapStateToProps(state, props) {
  return {
    productsList: wrapApiResult(state.product.list)
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ProductHub);
