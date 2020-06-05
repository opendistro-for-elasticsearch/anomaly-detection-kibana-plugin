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
import {
  EuiOverlayMask,
  EuiCallOut,
  EuiLink,
  EuiIcon,
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalHeader,
  EuiModalFooter,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiDataGrid,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { getAlertingMonitorListLink } from '../../../../utils/utils';
import { Monitor } from '../../../../models/interfaces';
import { DetectorListItem } from '../../../../models/interfaces';
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
    <EuiModal onClose={props.hideModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          {'Are you sure you want to start the selected detectors?'}&nbsp;
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiCallOut
          title="The following detectors will begin initializing:"
          color="success"
          iconType="play"
        ></EuiCallOut>
        <EuiSpacer size="m" />
        <div>{getNamesGrid(props.detectors)}</div>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="cancelButton" onClick={props.hideModal}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton
          data-test-subj="confirmButton"
          color="primary"
          fill
          onClick={() => {
            props.onStartDetectors();
            props.hideModal();
          }}
        >
          {'Start detectors'}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export const ConfirmStopDetectorsModal = (
  props: ConfirmStopDetectorsModalProps
) => (
  <EuiOverlayMask>
    <EuiModal onClose={props.hideModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          {'Are you sure you want to stop the selected detectors?'}&nbsp;
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiCallOut
          title="The following detectors will be stopped. Any associated monitors will
           not be able to receive any anomaly results to generate alerts:"
          color="warning"
          iconType="alert"
        ></EuiCallOut>
        <EuiSpacer size="m" />
        <div>{getNamesAndMonitorsGrid(props.detectors, props.monitors)}</div>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="cancelButton" onClick={props.hideModal}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton
          data-test-subj="confirmButton"
          color="primary"
          fill
          onClick={() => {
            props.onStopDetectors();
            props.hideModal();
          }}
        >
          {'Stop detectors'}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

const getNamesData = (detectors: DetectorListItem[]) => {
  let namesData = [];
  for (let i = 0; i < detectors.length; i++) {
    namesData.push({
      Detector: (
        <EuiLink
          href={`${PLUGIN_NAME}#/detectors/${detectors[i].id}`}
          target="_blank"
        >
          {detectors[i].name} <EuiIcon type="popout" size="s" />
        </EuiLink>
      ),
    });
  }
  return namesData;
};

const getNamesAndMonitorsData = (
  detectors: DetectorListItem[],
  monitors: { [key: string]: Monitor }
) => {
  let namesAndMonitorsData = [];
  for (let i = 0; i < detectors.length; i++) {
    const relatedMonitor = get(monitors, `${detectors[i].id}.0`);
    if (relatedMonitor) {
      namesAndMonitorsData.push({
        Detector: (
          <EuiLink
            href={`${PLUGIN_NAME}#/detectors/${detectors[i].id}`}
            target="_blank"
          >
            {detectors[i].name} <EuiIcon type="popout" size="s" />
          </EuiLink>
        ),
        Monitor: (
          <EuiLink
            href={`${getAlertingMonitorListLink()}/${relatedMonitor.id}`}
            target="_blank"
          >
            {relatedMonitor.name} <EuiIcon type="popout" size="s" />
          </EuiLink>
        ),
      });
    } else {
      namesAndMonitorsData.push({
        Detector: (
          <EuiLink
            href={`${PLUGIN_NAME}#/detectors/${detectors[i].id}`}
            target="_blank"
          >
            {detectors[i].name} <EuiIcon type="popout" size="s" />
          </EuiLink>
        ),
        Monitor: '-',
      });
    }
  }
  return namesAndMonitorsData;
};

const getNamesGrid = (detectors: DetectorListItem[]) => {
  const detectorNames = getNamesData(detectors);
  return (
    <EuiDataGrid
      aria-label="Detector names"
      columns={[
        {
          id: 'Detector',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
      ]}
      columnVisibility={{
        visibleColumns: ['Detector'],
        setVisibleColumns: () => {},
      }}
      rowCount={detectorNames.length}
      renderCellValue={({ rowIndex, columnId }) =>
        //@ts-ignore
        detectorNames[rowIndex][columnId]
      }
      gridStyle={{
        border: 'horizontal',
        header: 'shade',
        rowHover: 'highlight',
        stripes: true,
      }}
      toolbarVisibility={false}
    />
  );
};

const getNamesAndMonitorsGrid = (
  detectors: DetectorListItem[],
  monitors: { [key: string]: Monitor }
) => {
  const detectorNamesAndMonitors = getNamesAndMonitorsData(detectors, monitors);
  return (
    <EuiDataGrid
      aria-label="Detector names"
      columns={[
        {
          id: 'Detector',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
        {
          id: 'Monitor',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
      ]}
      columnVisibility={{
        visibleColumns: ['Detector', 'Monitor'],
        setVisibleColumns: () => {},
      }}
      rowCount={detectorNamesAndMonitors.length}
      renderCellValue={({ rowIndex, columnId }) =>
        //@ts-ignore
        detectorNamesAndMonitors[rowIndex][columnId]
      }
      gridStyle={{
        border: 'horizontal',
        header: 'shade',
        rowHover: 'highlight',
        stripes: true,
      }}
      toolbarVisibility={false}
    />
  );
};
