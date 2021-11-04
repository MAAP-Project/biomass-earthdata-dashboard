import React from 'react';
import styled from 'styled-components';

import App from '../common/app';
import config from '../../config';
const { baseUrl } = config;
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody
} from '../../styles/inpage';
import Constrainer from '../../styles/constrainer';
import Prose from '../../styles/type/prose';

import { glsp } from '../../styles/utils/theme-values';

const PageConstrainer = styled(Constrainer)`
  ${Prose} {
    max-width: 50rem;
  }

  div.logos {
    max-width: 600px;
    margin: 0px auto;
  }

  div.logos img {
    padding-right: 2rem;
  }

  @media only screen and (max-width: 600px) {
    div.logos img {
      display: block;
      margin: 0px auto;
    }
  }

  > *:not(:last-child) {
    margin-bottom: ${glsp(2)};
  }
`;

export default class Contact extends React.Component {
  render () {
    return (
<App pageTitle='Contact'>
  <Inpage>
    <InpageHeader>
      <InpageHeaderInner>
        <InpageHeadline>
          <InpageTitle>Contact Us</InpageTitle>
        </InpageHeadline>
      </InpageHeaderInner>
    </InpageHeader>
    <InpageBody>
      <PageConstrainer>
        <Prose>
          <ul>
            <li>For technical questions, please contact Aimee Barciauskas at aimee@developmentseed.org.</li>
            <li>For content questions, please contact Laura Duncanson at lduncans@umd.edu.</li>            
          </ul>
        </Prose>
      </PageConstrainer>
    </InpageBody>
  </Inpage>
</App>
    );
  }
}
