"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {
    onNavClick(type) {
      console.log("Clicked navigation:", type);
    },
    onRecharge() {
      console.log("Clicked recharge");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.onNavClick("company")),
    b: common_vendor.o(($event) => $options.onNavClick("order")),
    c: common_vendor.o(($event) => $options.onNavClick("gov")),
    d: common_vendor.o((...args) => $options.onRecharge && $options.onRecharge(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "B:/海丝出海通/hscht/miniprogram-project/src/pages/My/My.vue"]]);
wx.createPage(MiniProgramPage);
