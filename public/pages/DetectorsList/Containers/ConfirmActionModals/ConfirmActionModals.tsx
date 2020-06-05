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

import React, { useState } from 'react';
import {
  EuiOverlayMask,
  EuiCallOut,
  EuiLink,
  EuiIcon,
  EuiText,
  EuiFieldText,
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalHeader,
  EuiModalFooter,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiDataGrid,
  EuiLoadingSpinner,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { getAlertingMonitorListLink } from '../../../../utils/utils';
import { Monitor } from '../../../../models/interfaces';
import { DetectorListItem } from '../../../../models/interfaces';
import { PLUGIN_NAME } from '../../../../utils/constants';
import { Listener } from '../../../../utils/utils';
import { get } from 'lodash';
import { containsEnabledDetectors } from '../../utils/helpers';
import { EuiSpacer } from '@elastic/eui';

interface ConfirmStartDetectorsModalProps {
  detectors: DetectorListItem[];
  hideModal(): void;
  onStartDetectors(): void;
  isListLoading: boolean;
}

interface ConfirmStopDetectorsModalProps {
  detectors: DetectorListItem[];
  monitors: { [key: string]: Monitor };
  hideModal(): void;
  onStopDetectors(listener?: Listener): void;
  isListLoading: boolean;
}

interface ConfirmDeleteDetectorsModalProps {
  detectors: DetectorListItem[];
  monitors: { [key: string]: Monitor };
  hideModal(): void;
  onStopDetectors(listener?: Listener): void;
  onDeleteDetectors(): void;
  isListLoading: boolean;
}

export const ConfirmStartDetectorsModal = (
  props: ConfirmStartDetectorsModalProps
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
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
          <div>
            {props.isListLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesGrid(props.detectors)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty
            data-test-subj="cancelButton"
            onClick={props.hideModal}
          >
            Cancel
          </EuiButtonEmpty>
          <EuiButton
            data-test-subj="confirmButton"
            color="primary"
            fill
            isLoading={isLoading || props.isListLoading}
            onClick={async () => {
              setIsLoading(true);
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
};

export const ConfirmStopDetectorsModal = (
  props: ConfirmStopDetectorsModalProps
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
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
          <div>
            {props.isListLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesAndMonitorsGrid(props.detectors, props.monitors)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty
            data-test-subj="cancelButton"
            onClick={props.hideModal}
          >
            Cancel
          </EuiButtonEmpty>
          <EuiButton
            data-test-subj="confirmButton"
            color="primary"
            fill
            isLoading={isLoading || props.isListLoading}
            onClick={async () => {
              setIsLoading(true);
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
};

export const ConfirmDeleteDetectorsModal = (
  props: ConfirmDeleteDetectorsModalProps
) => {
  const containsEnabled = containsEnabledDetectors(props.detectors);
  const [deleteTyped, setDeleteTyped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.hideModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {'Are you sure you want to delete the selected detectors?'}&nbsp;
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          {containsEnabled ? (
            <EuiCallOut
              title="Some of the selected detectors are currently running"
              color="warning"
              iconType="alert"
            ></EuiCallOut>
          ) : null}
          {containsEnabled ? <EuiSpacer size="s" /> : null}
          <EuiCallOut
            title="The following detectors and feature configurations will be permanently removed. Any associated monitors will
              not be able to receive any anomaly results to generate alerts"
            color="warning"
            iconType="alert"
          ></EuiCallOut>
          <EuiSpacer size="s" />
          <EuiText>
            <p>
              To confirm deletion, type <i>delete</i> in the field.
            </p>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFieldText
            fullWidth={true}
            placeholder="delete"
            onChange={e => {
              if (e.target.value === 'delete') {
                setDeleteTyped(true);
              } else {
                setDeleteTyped(false);
              }
            }}
          />
          <EuiSpacer size="m" />
          <div>
            {props.isListLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesAndMonitorsGrid(props.detectors, props.monitors)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty
            data-test-subj="cancelButton"
            onClick={props.hideModal}
          >
            Cancel
          </EuiButtonEmpty>
          <EuiButton
            data-test-subj="confirmButton"
            color="danger"
            disabled={!deleteTyped}
            fill
            isLoading={isLoading || props.isListLoading}
            onClick={async () => {
              setIsLoading(true);
              if (containsEnabled) {
                const listener: Listener = {
                  onSuccess: () => {
                    props.onDeleteDetectors();
                    props.hideModal();
                  },
                  onException: props.hideModal,
                };
                props.onStopDetectors(listener);
              } else {
                props.onDeleteDetectors();
                props.hideModal();
              }
            }}
          >
            {'Delete detectors'}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

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
