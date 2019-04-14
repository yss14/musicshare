const { override, fixBabelImports, addLessLoader } = require("customize-cra");

const theme = {
  main: "#275dad",
  white: "#fcf7f8",
  lightgrey: "#aba9c3",
  grey: "#ced3dc",
  darkgrey: "#474350"
};

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { "@primary-color": theme.main }
  })
);
