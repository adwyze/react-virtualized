/** @flow */
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React, {PureComponent, Children} from 'react';
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
// import { Array } from 'core-js/library/web/timers';

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

console.log(Array(10));

let Main;

export default class MultiGridExample extends PureComponent {
  static contextTypes = {
    list: PropTypes.instanceOf(Immutable.List).isRequired,
  };

  getRawData = () => {
    return Array(50)
      .fill(0)
      .map((d, i) => {
        let tempData = Array(10)
          .fill(0)
          .map((dd, j) => {
            return `${i}, ${j}`;
          });
        return {
          data: tempData,
          children: Array(5)
            .fill(0)
            .map((c, j) => ({
              data: Array(10)
                .fill(0)
                .map((da, k) => {
                  return `${i} ${j} ${k}`;
                }),
            })),
        };
      });
  };

  //   transformer = (data) => {
  //     const newData = []

  //     for(let i=0; i<data.length; i++) {
  //       newData.push(data[i])
  //       if(data[i].expanded) {
  //         newData.push(...data[i].children.map(child => (
  // {          data: child,
  //           level: 1,}
  //         )))
  //         // insert data.children between i and i+1 with level = currentLevel + 1
  //         //(0, i) , children, (i+1, n-1)
  //       }
  //     }

  //     return newData
  //   }

  transformer2 = data => {
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
      if(name === "None") {
        data.children = []
      } else {
        data.children = data.children || dprocessedData
      }
      data.children.forEach(cdata => {
        if(!state) {
          cdata.parent.pop()
        } else {
          if(cdata.parent) {
            cdata.parent.push(name)
          } else {
            cdata.parent = [name]
          }
        }
      })
      this.info = this.transformer2(processedData);
      // Main.measureAllCells()
      this.setState({
        rowCount: this.info.length,
      });
      Main.recomputeGridSize();
      Main.forceUpdateGrids();
    };
    newData.push(data);
    // console.warn(data)
    if (data.expanded) {
      data.children.map(child => {
        child.level = level + 1;
        this.recursion(child, newData, level + 1);
      });
    }
  };

  //   transformerMain = (data, newData, level) => {
  //     let last = data.pop()
  //     newData.push(last)
  //     if(last.expanded) {
  //       newData.push(...data[i].children.map(child => (
  //         {          data: child,
  //                   level: level+1,}
  //                 )))
  //         last.children ? transforMain(last.children, newData, level)
  //     }
  //     for(let i=0; i<data.length; i++) {
  //       newData.push(data[i])
  //       if(data[i].expanded) {
  //         newData.push(...data[i].children.map(child => (
  // {          data: child,
  //           level: 1,}
  //         )))
  //         // insert data.children between i and i+1 with level = currentLevel + 1
  //         //(0, i) , children, (i+1, n-1)
  //       }
  //     }

  //     return newData
  //   }

  constructor(props, context) {
    super(props, context);
    this.state = {
      fixedColumnCount: 1,
      fixedRowCount: 1,
      scrollToColumn: 0,
      scrollToRow: 0,
      rowCount: 10,
      breakdowns: ["Ad Type", "Hour"]
    };

    this._cellRenderer = this._cellRenderer.bind(this);
    this._onFixedColumnCountChange = this._createEventHandler(
      'fixedColumnCount',
    );
    this._onFixedRowCountChange = this._createEventHandler('fixedRowCount');
    this._onScrollToColumnChange = this._createEventHandler('scrollToColumn');
    this._onScrollToRowChange = this._createEventHandler('scrollToRow');
  }

  drillDown = rowIndex => {
    return () => {
      console.log(rowIndex);
    };
    // console.log(rowIndex)
  };

  setRef = ref => {
    Main = ref;
  };

  componentDidMount() {
    const x = {fb_spend: 234, aw_cost: 22};

    this.rawData = this.getRawData();
    // console.log(rawData)

    // this iwll be a function
    this.rawData[0].expanded = true;
    this.rawData[1].expanded = true;
    this.rawData[1].children[0].expanded = true;
    this.rawData[1].children[0].children = [
      {data: [1, 2, 3, 4, 5]},
      {data: [11, 22, 33, 41, 51]},
    ];
    this.rawData[5].expanded = true;

    this.info = this.transformer2(processedData);
    this.setState({
      rowCount: this.info.length,
    });
    console.log('trans data', this.info, this.getRawData());
    // console.log('newdata', this.info)
    // console.warn(this.refs)
    // assert(info.length, 55)
  }

  getRowCount = () => {
    return this.info.length;
  };

  render() {
    if (!this.info) return '';
    // console.warn(this.info.length)
    return (
      <ContentBox>
        <ContentBoxHeader
          text="MultiGrid"
          sourceLink="https://github.com/bvaughn/react-virtualized/blob/master/source/MultiGrid/MultiGrid.example.js"
          docsLink="https://github.com/bvaughn/react-virtualized/blob/master/docs/MultiGrid.md"
        />

        <ContentBoxParagraph>
          This component stitches together several grids to provide a fixed
          column/row interface.
        </ContentBoxParagraph>

        <InputRow>
          {this._createLabeledInput(
            'fixedColumnCount',
            this._onFixedColumnCountChange,
          )}
          {this._createLabeledInput(
            'fixedRowCount',
            this._onFixedRowCountChange,
          )}
          {this._createLabeledInput(
            'scrollToColumn',
            this._onScrollToColumnChange,
          )}
          {this._createLabeledInput('scrollToRow', this._onScrollToRowChange)}
        </InputRow>

        <AutoSizer>
          {({width, height}) => {
            return (
              <MultiGrid
                {...this.state}
                cellRenderer={this._cellRenderer}
                columnWidth={({index}) => {
                  return 200
                }}
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

  _cellRenderer({columnIndex, key, rowIndex, style}) {
    const breakdownLevel = this.state.breakdowns.length
    if (rowIndex === 0) {
      return (
        <div className={styles.Cell} key={key} style={style}>
          {columns[columnIndex]}
        </div>
      );
    }
    const name = (this.info[rowIndex].data[columnIndex].name
    ? this.info[rowIndex].data[columnIndex].metadata
      ? this.info[rowIndex].data[columnIndex].metadata.name
      : this.info[rowIndex].data[columnIndex].name
    : this.info[rowIndex].data[columnIndex])
    return (
      <div className={styles.Cell} key={key} style={style}>
        {columnIndex === 0 && this.info[rowIndex].level < breakdownLevel ? (
          this.info[rowIndex].expanded ? (
            <a onClick={() => this.info[rowIndex].drillDown(false, name)}>(-)</a>
          ) : (
            <a onClick={() => this.info[rowIndex].drillDown(true, name)}>(+)</a>
          )
        ) : null}
        {name}
      </div>
    );
  }

  _createEventHandler(property) {
    return event => {
      const value = parseInt(event.target.value, 10) || 0;

      this.setState({
        [property]: value,
      });
    };
  }

  _createLabeledInput(property, eventHandler) {
    const value = this.state[property];

    return (
      <LabeledInput
        label={property}
        name={property}
        onChange={eventHandler}
        value={value}
      />
    );
  }
}
