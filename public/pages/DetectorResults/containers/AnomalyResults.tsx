/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
  //@ts-ignore
  EuiBasicTable,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiCallOut,
  EuiButton,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { get, isEmpty } from 'lodash';
import React, { useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { AppState } from '../../../redux/reducers';
import { BREADCRUMBS } from '../../../utils/constants';
import { AnomalyResultsLiveChart } from './AnomalyResultsLiveChart';
import { AnomalyHistory } from './AnomalyHistory';

interface AnomalyResultsProps extends RouteComponentProps {
  detectorId: string;
  onSwitchToConfiguration(): void;
}

export function AnomalyResults(props: AnomalyResultsProps) {
  const detectorId = get(props, 'match.params.detectorId', '') as string;
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[detectorId]
  );

  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      { text: detector ? detector.name : '' },
    ]);
  }, []);

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);
  return (
    <Fragment>
      <EuiPage style={{ marginTop: '16px', paddingTop: '0px' }}>
        <EuiPageBody>
          <EuiSpacer size="l" />
          {detector && isEmpty(detector.featureAttributes) ? (
            <EuiEmptyPrompt
              title={<h2>Features are required to run a detector</h2>}
              body={
                <Fragment>
                  <p>
                    Specify index fields that you want to find anomalies for by
                    defining features. Once you define the features, you can
                    preview your anomalies from a sample feature output.
                  </p>
                </Fragment>
              }
              actions={
                <EuiButton
                  color="primary"
                  fill
                  href={`#/detectors/${detectorId}/features`}
                >
                  Add features
                </EuiButton>
              }
            />
          ) : (
            <Fragment>
              {detector ? (
                <Fragment>
                  {!detector.enabled &&
                  detector.disabledTime &&
                  detector.lastUpdateTime > detector.disabledTime ? (
                    <EuiCallOut
                      title="There are change(s) to the detector configuration after the detector is stopped."
                      color="warning"
                      iconType="alert"
                    >
                      <p>
                        Restart the detector to see accurate anomalies based on
                        your latest configuration.
                      </p>
                      <EuiButton
                        onClick={props.onSwitchToConfiguration}
                        color="warning"
                      >
                        View detector configuration
                      </EuiButton>
                    </EuiCallOut>
                  ) : null}
                  <AnomalyResultsLiveChart
                    detector={detector}
                  />
                  <EuiSpacer size="l" />
                  <AnomalyHistory
                    detector={detector}
                    monitor={monitor}
                    createFeature={() =>
                      props.history.push(`/detectors/${detectorId}/features`)
                    }
                  />
                </Fragment>
              ) : null}
            </Fragment>
          )}
        </EuiPageBody>
      </EuiPage>
    </Fragment>
  );
}
