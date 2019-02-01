import React, { Component } from "react";
import { Container, Nav } from "./styled-components";

// fusioncharts
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import Maps from "fusioncharts/fusioncharts.maps";
import USARegion from "fusionmaps/maps/es/fusioncharts.usaregion";
import ReactFC from "react-fusioncharts";
import "./charts-theme";

import config from "./config";
import Dropdown from "react-dropdown";
import formatNum from "./format-number";

import UserImg from "../assets/images/user-img-placeholder.jpeg";

ReactFC.fcRoot(FusionCharts, Charts, Maps, USARegion);

const url = `https://sheets.googleapis.com/v4/spreadsheets/${
  config.spreadsheetId
}/values:batchGet?ranges=Sheet1&majorDimension=ROWS&key=${config.apiKey}`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      dropdownOptions: [],
      selectedValue: null,
      amRevenue: null,
      ebRevenue: null,
      etRevenue: null,
      totalRevenue: null,
      productViews: null,
      purchaseRate: " ",
      checkoutRate: " ",
      abandonedRate: " ",
      ordersTrendStore: []
    };
  }

  getData = arg => {
    // google sheets data
    const arr = this.state.items;
    const arrLen = arr.length;

    // kpi's
    // amazon revenue
    let amRevenue = 0;
    //ebay revenue
    let ebRevenue = 0;
    // etsy revenue
    let etRevenue = 0;
    // total revenue
    let totalRevenue = 0;
    // product views
    let productViews = 0;
    // purchase rate
    let purchaseRate = 0;
    // checkout rate
    let checkoutRate = 0;
    // abandoned rate
    let abandonedRate = 0;
    // order trend by brand
    let ordersTrendStore = [];
    // order trend by region
    let ordersTrendRegion = [];
    let orderesTrendnw = 0;
    let orderesTrendsw = 0;
    let orderesTrendc = 0;
    let orderesTrendne = 0;
    let orderesTrendse = 0;

    let selectedValue = null;

    for (let i = 0; i < arrLen; i++) {
      if (arg === arr[i]["month"]) {
        if (arr[i]["source"] === "AM") {
          amRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Amazon",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        } else if (arr[i]["source"] === "EB") {
          ebRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Ebay",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        } else if (arr[i]["source"] === "ET") {
          etRevenue += parseInt(arr[i].revenue);
          ordersTrendStore.push({
            label: "Etsy",
            value: arr[i].orders,
            displayValue: `${arr[i].orders} orders`
          });
        }
        productViews += parseInt(arr[i].product_views);
        purchaseRate += parseInt(arr[i].purchase_rate / 3);
        checkoutRate += parseInt(arr[i].checkout_rate / 3);
        abandonedRate += parseInt(arr[i].abandoned_rate / 3);
        orderesTrendnw += parseInt(arr[i].orders_nw);
        orderesTrendsw += parseInt(arr[i].orders_sw);
        orderesTrendc += parseInt(arr[i].orders_c);
        orderesTrendne += parseInt(arr[i].orders_ne);
        orderesTrendse += parseInt(arr[i].orders_se);
      }
    }

    totalRevenue = amRevenue + ebRevenue + etRevenue;
    ordersTrendRegion.push({
      id: "01",
      value: orderesTrendne
    }, {
      id: "02",
      value: orderesTrendnw
    }, {
      id: "03",
      value: orderesTrendse
    }, {
      id: "04",
      value: orderesTrendsw
    }, {
      id: "05",
      value: orderesTrendc
    });

    selectedValue = arg;

    // setting state
    this.setState({
      amRevenue: formatNum(amRevenue),
      ebRevenue: formatNum(ebRevenue),
      etRevenue: formatNum(etRevenue),
      totalRevenue: formatNum(totalRevenue),
      productViews: formatNum(productViews),
      purchaseRate: purchaseRate,
      checkoutRate: checkoutRate,
      abandonedRate: abandonedRate,
      ordersTrendStore: ordersTrendStore,
      ordersTrendRegion: ordersTrendRegion,
      selectedValue: selectedValue
    });
  };

  updateDashboard = event => {
    this.getData(event.value);
    this.setState({ selectedValue: event.value });
  };

  componentDidMount() {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let batchRowValues = data.valueRanges[0].values;

        const rows = [];
        for (let i = 1; i < batchRowValues.length; i++) {
          let rowObject = {};
          for (let j = 0; j < batchRowValues[i].length; j++) {
            rowObject[batchRowValues[0][j]] = batchRowValues[i][j];
          }
          rows.push(rowObject);
        }

        // dropdown options
        let dropdownOptions = [];

        for (let i = 0; i < rows.length; i++) {
          dropdownOptions.push(rows[i].month);
        }

        dropdownOptions = Array.from(new Set(dropdownOptions)).reverse();

        this.setState(
          {
            items: rows,
            dropdownOptions: dropdownOptions,
            selectedValue: "Jan 2019"
          },
          () => this.getData("Jan 2019")
        );
      });
  }

  render() {
    return (
      <Container>
        {/* static navbar - top */}
        <Nav className="navbar navbar-expand-lg fixed-top is-white is-dark-text">
          <Container className="navbar-brand h1 mb-0 text-large font-medium">
            Online Retail Dashboard
          </Container>
          <Container className="navbar-nav ml-auto">
            <Container className="user-detail-section">
              <span className="pr-2">Hi, Sean</span>
              <span className="img-container">
                <img src={UserImg} className="rounded-circle" alt="user" />
              </span>
            </Container>
          </Container>
        </Nav>

        {/* static navbar - bottom */}
        <Nav className="navbar fixed-top nav-secondary is-dark is-light-text">
          <Container className="text-medium">Summary</Container>
          <Container className="navbar-nav ml-auto">
            <Dropdown
              className="pr-2 custom-dropdown"
              options={this.state.dropdownOptions}
              onChange={this.updateDashboard}
              value={this.state.selectedValue}
              placeholder="Select an option"
            />
          </Container>
        </Nav>

        {/* content area start */}
        <Container className="container-fluid pr-5 pl-5 pt-5 pb-5">
          {/* row 1 - revenue */}
          <Container className="row">
            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading">
                  <Container className="is-dark-text-light letter-spacing text-small">
                    Total Revenue
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  <span className="text-large pr-1">$</span>
                  {this.state.totalRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading">
                  <Container className="is-dark-text-light letter-spacing text-small">
                    Revenue from Amazon
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fab fa-amazon text-large" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  <span className="text-large pr-1">$</span>
                  {this.state.amRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading">
                  <Container className="is-dark-text-light letter-spacing text-small">
                    Revenue from Ebay
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fab fa-ebay text-x-large logo-adjust" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  <span className="text-large pr-1">$</span>
                  {this.state.ebRevenue}
                </Container>
              </Container>
            </Container>

            <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading">
                  <Container className="is-dark-text-light letter-spacing text-small">
                    Revenue from Etsy
                  </Container>
                  <Container className="card-heading-brand">
                    <i className="fab fa-etsy text-medium" />
                  </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                  <span className="text-large pr-1">$</span>
                  {this.state.etRevenue}
                </Container>
              </Container>
            </Container>
          </Container>

          {/* row 2 - conversion */}
          <Container className="row">
            <Container className="col-md-4 col-lg-3 is-light-text mb-4">
              <Container className="card grid-card is-card-dark">
                <Container className="card-heading mb-3">
                  <Container className="is-dark-text-light letter-spacing text-small">
                    Product Views
                  </Container>
                </Container>
                <Container className="card-value pt-4 text-x-large">
                  {this.state.productViews}
                  <span className="text-medium pl-2 is-dark-text-light">
                    views
                  </span>
                </Container>
              </Container>
            </Container>

            <Container className="col-md-8 col-lg-9 is-light-text mb-4">
              <Container className="card is-card-dark chart-card">
                <Container className="row full-height">
                  <Container className="col-sm-4 full height">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Purchase Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${this.state.purchaseRate}%`,
                              paletteColors: "#3B70C4, #000000"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.purchaseRate}`
                              },
                              {
                                label: "inactive",
                                alpha: 5,
                                value: `${100 - this.state.purchaseRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                  <Container className="col-sm-4 full-height border-left border-right">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Checkout Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${this.state.checkoutRate}%`,
                              paletteColors: "#41B6C4, #000000"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.checkoutRate}`
                              },
                              {
                                label: "inactive",
                                alpha: 5,
                                value: `${100 - this.state.checkoutRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                  <Container className="col-sm-4 full-height">
                    <Container className="chart-container full-height">
                      <ReactFC
                        {...{
                          type: "doughnut2d",
                          width: "100%",
                          height: "100%",
                          dataFormat: "json",
                          containerBackgroundOpacity: "0",
                          dataSource: {
                            chart: {
                              caption: "Abandoned Cart Rate",
                              theme: "ecommerce",
                              defaultCenterLabel: `${
                                this.state.abandonedRate
                              }%`,
                              paletteColors: "#EDF8B1, #000000"
                            },
                            data: [
                              {
                                label: "active",
                                value: `${this.state.abandonedRate}`
                              },
                              {
                                label: "inactive",
                                alpha: 5,
                                value: `${100 - this.state.abandonedRate}`
                              }
                            ]
                          }
                        }}
                      />
                    </Container>
                  </Container>
                </Container>
              </Container>
            </Container>
          </Container>

          {/* row 3 - orders trend */}
          <Container className="row" style={{ minHeight: "400px" }}>
            <Container className="col-md-6 mb-4">
              <Container className="card is-card-dark chart-card">
                <Container className="chart-container large full-height">
                  <ReactFC
                    {...{
                      type: "bar2d",
                      width: "100%",
                      height: "100%",
                      dataFormat: "json",
                      containerBackgroundOpacity: "0",
                      dataEmptyMessage: "Loading Data...",
                      dataSource: {
                        chart: {
                          theme: "ecommerce",
                          caption: "Orders Trend",
                          subCaption: "By Stores"
                        },
                        data: this.state.ordersTrendStore
                      }
                    }}
                  />
                </Container>
              </Container>
            </Container>

            <Container className="col-md-6 mb-4">
              <Container className="card is-card-dark chart-card">
                <Container className="chart-container large full-height">
                  <ReactFC
                    {...{
                      type: "usaregion",
                      width: "100%",
                      height: "100%",
                      dataFormat: "json",
                      containerBackgroundOpacity: "0",
                      dataEmptyMessage: "Loading Data...",
                      dataSource: {
                        chart: {
                          theme: "ecommerce",
                          caption: "Orders Trend",
                          subCaption: "By Region"
                        },
                        colorrange: {
                          code: "#F64F4B",
                          minvalue: "0",
                          gradient: "1",
                          color: [
                            {
                              minValue: "10",
                              maxvalue: "25",
                              code: "#EDF8B1"
                            },
                            {
                              minvalue: "25",
                              maxvalue: "50",
                              code: "#18D380"
                            }
                          ]
                        },
                        data: this.state.ordersTrendRegion
                      }
                    }}
                  />
                </Container>
              </Container>
            </Container>
          </Container>
        </Container>
        {/* content area end */}
      </Container>
    );
  }
}

export default App;
