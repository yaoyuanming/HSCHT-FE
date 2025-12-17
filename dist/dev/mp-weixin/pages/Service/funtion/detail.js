"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {
    consult() {
      common_vendor.index.showToast({
        title: "咨询功能开发中",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.consult && $options.consult(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "B:/海丝出海通/hscht/miniprogram-project/src/pages/Service/funtion/detail.vue"]]);
wx.createPage(MiniProgramPage);
