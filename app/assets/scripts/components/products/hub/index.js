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
      <App pageTitle='Product areas'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Understanding Products Areas</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <PageConstrainer>
              <HubFold>
                <Prose>
                  <p>
                    The global trajectory of the global phenomena have led to regional
                    changes in air and water quality, night lights, and other
                    economic factors.
                  </p>
                  <p>
                    This dashboard highlights {productsCount} product areas around the
                    world, allowing you to explore how a specific location&apos;s
                    response to global phenomena has influenced local
                    environmental signals.
                  </p>
                  <p>
                    The {productsCount} product areas were chosen based on their large
                    populations and high level of economic activity, which
                    reveal significant changes in response to global phenomena.
                  </p>
                  <p>
                    Click below to visit a product area.
                  </p>
                </Prose>
              </HubFold>
              <HubFold>
                <InpageHGroup
                  title='Areas'
                  dashColor={metadata.color}
                />
                <EntriesList>
                  <li>
                    <EntryNavLink
                      to='/products/global'
                      title='Explore global'
                    >
                      <EntryNavLinkTitle>Global</EntryNavLinkTitle>
                      <EntryNavLinkMedia>
                        <img src={`${baseUrl}/assets/graphics/content/products/global.jpg`} width='960' height='480' alt='Area thumbnail' />
                      </EntryNavLinkMedia>
                    </EntryNavLink>
                  </li>
                  {products &&
                    products.map((item) => (
                      <li key={item.id}>
                        <EntryNavLink
                          to={`/products/${item.id}`}
                          title={`View product area ${item.label}`}
                        >
                          <EntryNavLinkTitle>{item.label}</EntryNavLinkTitle>
                          <EntryNavLinkMedia>
                            <img src={`${baseUrl}/assets/graphics/content/products/${item.id}.jpg`} width='960' height='480' alt='Area thumbnail' />
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
