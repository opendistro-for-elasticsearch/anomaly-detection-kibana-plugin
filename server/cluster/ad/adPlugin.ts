/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { API } from '../../utils/constants';

export default function adPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.ad = components.clientAction.namespaceFactory();
  const ad = Client.prototype.ad.prototype;
  ad.deleteDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });

  ad.previewDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>/_preview`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });
  ad.createDetector = ca({
    url: {
      fmt: API.DETECTOR_BASE,
    },
    needBody: true,
    method: 'POST',
  });
  ad.searchDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/_search`,
    },
    needBody: true,
    method: 'POST',
  });
  ad.updateDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>?if_seq_no=<%=ifSeqNo%>&if_primary_term=<%=ifPrimaryTerm%>&refresh=wait_for`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
        ifSeqNo: {
          type: 'string',
          required: true,
        },
        ifPrimaryTerm: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });
  ad.getDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>?job=true`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });
  ad.searchResults = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/results/_search`,
    },
    needBody: true,
    method: 'POST',
  });

  ad.startDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>/_start`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'POST',
  });

  ad.stopDetector = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>/_stop`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'POST',
  });

  ad.detectorProfile = ca({
    url: {
      fmt: `${API.DETECTOR_BASE}/<%=detectorId%>/_profile/init_progress,state,error`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });
}
