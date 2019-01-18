module.exports = function(api) {
    api.cache(true);
    return {
      plugins: [
        ["import", {
          "libraryName": "antd",
          "libraryDirectory": "lib",
          "style": "css"
          // "style": (name) => `antd/lib/${name}/style`
        }]
      ]
    }
    // return  (name) => name;
  }