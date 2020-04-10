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

import { useEffect } from 'react';
import { SET_HIDE_SIDE_NAV_BAR_STATE } from '../../../redux/reducers/adAppReducer';
import { useDispatch } from 'react-redux';

//A hook which hide side nav bar
export const useHideSideNavBar = (hidden: boolean, hiddenAfterClear: boolean) => {
    const dispatch = useDispatch();
    useEffect(
        () => {
            dispatch({ type: SET_HIDE_SIDE_NAV_BAR_STATE, payload: hidden })
            return () => {
                dispatch({ type: SET_HIDE_SIDE_NAV_BAR_STATE, payload: hiddenAfterClear })
            }
        },
        []
    );
};
