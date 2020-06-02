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

import React from 'react';
import { EuiOverlayMask, EuiCallOut, EuiLink, EuiIcon } from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { getAlertingMonitorListLink } from '../../../../utils/utils';
import { Monitor } from '../../../../models/interfaces';
import { DetectorListItem } from '../../../../models/interfaces';
import { ConfirmModal } from '../../../DetectorDetail/components/ConfirmModal/ConfirmModal';
import { PLUGIN_NAME } from '../../../../utils/constants';
import { get } from 'lodash';

interface ConfirmStartDetectorsModalProps {
  detectors: DetectorListItem[];
  hideModal(): void;
  onStartDetectors(): void;
}

interface ConfirmStopDetectorsModalProps {
  detectors: DetectorListItem[];
  monitors: { [key: string]: Monitor };
  hideModal(): void;
  onStopDetectors(): void;
}

export const ConfirmStartDetectorsModal = (
  props: ConfirmStartDetectorsModalProps
) => (
  <EuiOverlayMask>
    <ConfirmModal
      title="Are you sure you want to start the selected detectors?"
      description=""
      callout={
        <EuiCallOut
          title="The following detectors will begin initializing:"
          color="success"
          iconType="play"
        >
          <div>
            {props.detectors.map(detector => {
              return (
                <li key={detector.id}>
                  <EuiLink
                    href={`${PLUGIN_NAME}#/detectors/${detector.id}`}
                    target="_blank"
                  >
                    {detector.name} <EuiIcon type="popout" size="s" />
                  </EuiLink>
                </li>
              );
            })}
          </div>
        </EuiCallOut>
      }
      confirmButtonText="Start detectors"
      confirmButtonColor="primary"
      onClose={props.hideModal}
      onCancel={props.hideModal}
      onConfirm={() => {
        props.onStartDetectors();
        props.hideModal();
      }}
    />
  </EuiOverlayMask>
);

export const ConfirmStopDetectorsModal = (
  props: ConfirmStopDetectorsModalProps
) => (
  <EuiOverlayMask>
    <ConfirmModal
      title="Are you sure you want to stop the selected detectors?"
      description=""
      callout={
        <EuiCallOut
          title="The following detectors will be stopped. Any associated monitors will 
          not be able to receive any anomaly results to generate alerts:"
          color="warning"
          iconType="alert"
        >
          <div>
            {props.detectors.map(detector => {
              const relatedMonitor = get(props.monitors, `${detector.id}.0`);
              return (
                <li key={detector.id}>
                  <EuiLink
                    href={`${PLUGIN_NAME}#/detectors/${detector.id}`}
                    target="_blank"
                  >
                    {detector.name} <EuiIcon type="popout" size="s" />
                  </EuiLink>{' '}
                  {relatedMonitor ? (
                    <span>&nbsp;(Associated monitor:&nbsp;</span>
                  ) : (
                    <span>&nbsp;(No associated monitors)</span>
                  )}
                  {relatedMonitor ? (
                    <EuiLink
                      href={`${getAlertingMonitorListLink()}/${
                        relatedMonitor.id
                      }`}
                      target="_blank"
                    >
                      {relatedMonitor.name} <EuiIcon type="popout" size="s" />
                    </EuiLink>
                  ) : null}
                  {relatedMonitor ? <span>)</span> : null}
                </li>
              );
            })}
          </div>
        </EuiCallOut>
      }
      confirmButtonText="Stop detectors"
      confirmButtonColor="primary"
      onClose={props.hideModal}
      onCancel={props.hideModal}
      onConfirm={() => {
        props.onStopDetectors();
        props.hideModal();
      }}
    />
  </EuiOverlayMask>
);
