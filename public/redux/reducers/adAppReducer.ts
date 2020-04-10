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

import { Action } from 'redux';


export const SET_HIDE_SIDE_NAV_BAR_STATE = 'adApp/SET_HIDE_SIDE_NAV_BAR_STATE';

const initialAdAppState = {
  hideSideNavBar: false
};

export interface AdAppState {
  hideSideNavBar: boolean;
}

const reducer = (state = initialAdAppState, action: Action) => {
  switch (action.type) {
    case SET_HIDE_SIDE_NAV_BAR_STATE: {
      // @ts-ignore
      const hideNaveBar = action.payload;
      return {
        ...state,
        hideSideNavBar: hideNaveBar,
      };
    }
    default:
      return state;
  }
}

export default reducer;
