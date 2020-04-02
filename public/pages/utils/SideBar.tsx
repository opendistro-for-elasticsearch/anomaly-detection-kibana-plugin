import { APP_PATH } from '../../utils/constants';
import React, { Component } from 'react';
//@ts-ignore
import { EuiSideNav, EuiPageSideBar } from '@elastic/eui';

type SideBarState = {
  selectedItemName: string;
};

export class SideBar extends Component<{}, SideBarState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedItemName: 'Lion stuff',
    };
  }

  selectItem = (name: string) => {
    this.setState({
      selectedItemName: name,
    });
  };

  createItem = (name: string, id: number, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: name,
      name,
      isSelected: this.state.selectedItemName === name,
      onClick: () => this.selectItem(name),
    };
  };

  render() {
    const sideNav = [
      {
        name: 'Anomaly detection',
        id: 0,
        items: [
          this.createItem('Dashboard', 1, { href: `#${APP_PATH.DASHBOARD}` }),
          this.createItem('Detectors', 2, {
            href: `#${APP_PATH.LIST_DETECTORS}`,
          }),
        ],
      },
    ];

    return (
      <EuiPageSideBar
        style={{
          flex: 1,
          backgroundColor: '#F5F7FA',
        }}
      >
        <EuiSideNav style={{ width: 150 }} items={sideNav} />
      </EuiPageSideBar>
    );
  }
}
