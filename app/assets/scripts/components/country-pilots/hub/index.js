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

class CountryPilotHub extends React.Component {
  render() {
    const { countryPilotsList } = this.props;
    const countryPilots = countryPilotsList.isReady() && countryPilotsList.getData();
    const countryPilotsCount = converter.toWords(countryPilots ? countryPilots.length : 0);

    return (
      <App pageTitle='Country Pilots'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Understanding Country Pilots</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <PageConstrainer>
              <HubFold>
                <Prose>
                  <p>
                    Improving and integrating national and global data sources is an important task
                    of the UNFCCC Global Stocktake and this aim is also central to the biomass 
                    harmonization work. Combining global Earth Observation with country data should 
                    help to reconcile any differences between country and global estimates, fill national 
                    data gaps, and improve the precision of biomass estimation and potentially emission 
                    factors. The biomass harmonization effort aims to demonstrate, in selected countries 
                    as case studies, the practical implementation of the refined 2019 IPCC Good Practice 
                    Guidance (GPG) with a new section on the use of biomass density maps for GHG 
                    inventories. Based on this guidance, the use of biomass maps is increasingly important, as these wall-to-wall datasets have the potential to complement plot-based biomass measurements available through national forest inventories (NFIs). The characteristics and usefulness of biomass maps produced using space-data for national GHG inventories depend on multiple factors:
                  </p>
                  <p>
                    <ul>
                      <li>The definitions for forest and biomass or AGB used to produce the map and how this definition relates to the one used in the national GHG inventory;</li>
                      <li>The type of space-based data sources in terms of spatial resolution, temporal coverage and the degree to which the signal responds, or is sensitive to AGB;</li>
                      <li>The method used to construct the map. Methods can range from simple interpolation of field estimates of biomass using spatial covariates to more complex modelling of AGB using field estimates, and observed space-based data signals;</li>
                      <li>The availability and reliability of biomass-related field data, which are of better quality than the map, and are needed to produce and validate the biomass map;</li>
                      <li>The degree to which map uncertainty is characterised and the manner in which it is used to assess systematic deviation and precision for large area estimates in support of national GHG inventories.</li>
                    </ul>
                  </p>
                  <p>
                    With these factors in mind, biomass maps can improve the stratification of field-based biomass inventories, increase data in under-sampled or inaccessible areas, and serve as an independent data source for verification purposes (provided that the field data were not used to calibrate the biomass maps used). Such efforts can only be achieved with a close partnership and collaboration between country forest and GHG experts and biomass mapping experts. That is why this effort will engage countries with established national inventory data (NFI) to compare and enhance their forest biomass estimates with best-available satellite-based data products, and will assess the extent to which countries without NFI data benefit from evolving global remote sensing estimates of forest biomass in their national carbon assessment.  We rely strongly on working with national representatives to develop synergistic approaches and bridge any gaps between evolving space-based techniques for biomass estimation and the diverse demands and practices of countries. Their expertise and local knowledge helps us to improve in return the global estimation.
                  </p>
                  <p>
                    Click below to visit a country pilot area.
                  </p>
                </Prose>
              </HubFold>
              <HubFold>
                <InpageHGroup
                  title='Country Pilots'
                  dashColor={metadata.color}
                />
                <EntriesList>
                  {countryPilots &&
                    countryPilots.map((item) => (
                      <li key={item.id}>
                        <EntryNavLink
                          to={`/country_pilots/${item.id}`}
                          title={`View Country Pilot area ${item.label}`}
                        >
                          <EntryNavLinkTitle>{item.label}</EntryNavLinkTitle>
                          <EntryNavLinkMedia>
                            <img src={`${baseUrl}/assets/graphics/content/country_pilots/thumb-${item.id}.jpg`} width='280' alt='Area thumbnail' />
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

CountryPilotHub.propTypes = {
  countryPilotsList: T.object
};

function mapStateToProps(state, props) {
  return {
    countryPilotsList: wrapApiResult(state.countryPilot.list)
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CountryPilotHub);
