/** @flow */
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React, {PureComponent, Children} from 'react';
import Popover from 'antd/lib/popover';
import 'antd/dist/antd.css';

import {
  ContentBox,
  ContentBoxHeader,
  ContentBoxParagraph,
} from '../demo/ContentBox';
import {LabeledInput, InputRow} from '../demo/LabeledInput';
import AutoSizer from '../AutoSizer';
import MultiGrid from './MultiGrid';
import styles from './MultiGrid.example.css';
import {columns, processedData, dprocessedData } from './index';

const STYLE = {
  border: '1px solid #ddd',
};

const STYLE_BOTTOM_LEFT_GRID = {
  borderRight: '2px solid #aaa',
  backgroundColor: '#f7f7f7',
};

const STYLE_TOP_LEFT_GRID = {
  borderBottom: '2px solid #aaa',
  borderRight: '2px solid #aaa',
  fontWeight: 'bold',
};

const STYLE_TOP_RIGHT_GRID = {
  borderBottom: '2px solid #aaa',
  fontWeight: 'bold',
};


let Main;

// props
// breakdowns array
// columns array
// processed data
// breakdown function -> takes parent values, level

export default class Table extends PureComponent {
  static contextTypes = {
    list: PropTypes.instanceOf(Immutable.List).isRequired,
  };

  transformerData = data => {
    const newData = [];

    for (let i = 0; i < data.length; i++) {
      // insert data.children between i and i+1 with level = currentLevel + 1
      this.recursion(data[i], newData, 0);
    }
    return newData;
  };

  recursion = (data, newData, level) => {
    data.level = level;
    data.drillDown = (state, name) => {
      data.expanded = state;
      // hardcoded to test
      if(name === "None") {
        data.children = []
      } else {
        //  will call drill down function here
        data.children = data.children || dprocessedData
      }
      data.children.forEach(childData => {
        if(!state) {
          // remove parent last element on drill up
          childData.parent.pop() 
        } else {
          if(childData.parent) {
            childData.parent.push(name)
          } else {
            childData.parent = [name]
          }
        }
      })
      this.info = this.transformerData(processedData);
      this.setState({
        rowCount: this.info.length,
      });
      Main.recomputeGridSize();
      Main.forceUpdateGrids();
    };
    newData.push(data);
    if (data.expanded) {
      data.children.map(child => {
        child.level = level + 1;
        this.recursion(child, newData, level + 1);
      });
    }
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      breakdowns: ["Ad Type", "Hour"],
      visible: false,
    };
    this._cellRenderer = this._cellRenderer.bind(this);
  }

  setRef = ref => {
    Main = ref;
  };

  componentDidMount() {
    this.info = this.transformerData(processedData);
  }

  getRowCount = () => {
    return this.info.length;
  };

  getFixedColumnCount = () => {
    return 1
  }

  render() {
    if (!this.info) return null;
    return (
      <ContentBox>
        <AutoSizer>
          {({width, height}) => {
            return (
              <MultiGrid
                cellRenderer={this._cellRenderer}
                columnWidth={({index}) => {
                  return 200
                }}
                fixedRowCount={1}
                fixedColumnCount={this.getFixedColumnCount()}
                columnCount={columns.length}
                enableFixedColumnScroll
                ref={this.setRef}
                enableFixedRowScroll
                height={300}
                rowHeight={40}
                rowCount={this.getRowCount()}
                style={STYLE}
                styleBottomLeftGrid={STYLE_BOTTOM_LEFT_GRID}
                styleTopLeftGrid={STYLE_TOP_LEFT_GRID}
                styleTopRightGrid={STYLE_TOP_RIGHT_GRID}
                width={width}
              />
            );
          }}
        </AutoSizer>
      </ContentBox>
    );
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }

  _cellRenderer({columnIndex, key, rowIndex, style}) {
    const breakdownLevel = this.state.breakdowns.length
    if (rowIndex === 0) {
      return (
        <div className={styles.Cell} key={key} style={style}>
          {columns[columnIndex]}
        </div>
      );
    }
    rowIndex -= 1;
    //  extract name from matrix with given col index and row index
    let name = (this.info[rowIndex].data[columnIndex].name
    ? this.info[rowIndex].data[columnIndex].metadata
      ? this.info[rowIndex].data[columnIndex].metadata.name
      : this.info[rowIndex].data[columnIndex].name
    : this.info[rowIndex].data[columnIndex])
    let flag = false
    if(name.length > 45) {
      name = name.slice(0,42)
      flag = true
    }
    return (
      <div className={styles.Cell} key={key} style={style}>
        {columnIndex === 0 && this.info[rowIndex].level < breakdownLevel ? (
          this.info[rowIndex].expanded ? (
            <a className={styles.breakdownIcon} onClick={() => this.info[rowIndex].drillDown(false, name)}>(-)</a>
          ) : (
            <a className={styles.breakdownIcon} onClick={() => this.info[rowIndex].drillDown(true, name)}>(+)</a>
          )
        ) : null}
        <span className="cellData">
          {name} {flag ? (
            <Popover
        content={(
          <div>
            <p>Content</p>
            <p>Content</p>
          </div>
        )}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
      ...
      </Popover>
          ) : null}
        </span>
      </div>
    );
  }

}
