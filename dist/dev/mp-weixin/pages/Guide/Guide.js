"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      headerHeight: 0,
      statusBarHeight: 0,
      sections: [
        {
          title: "出口贸易服务",
          icon: "paperplane-filled",
          // Placeholder for Ship icon
          collapsed: false,
          items: [
            { name: "报关报检服务", icon: "list" },
            { name: "国际物流安排", icon: "map-filled" },
            { name: "外汇结算服务", icon: "wallet-filled" },
            { name: "出口退税办理", icon: "compose" }
          ]
        },
        {
          title: "境外投资服务",
          icon: "world-filled",
          // Placeholder for Globe icon
          collapsed: false,
          items: [
            { name: "投资环境评估", icon: "globe-filled" },
            { name: "项目可行性研究", icon: "checkbox-filled" },
            { name: "海外公司注册", icon: "home-filled" },
            { name: "投资融资服务", icon: "vip-filled" }
          ]
        },
        {
          title: "综合支持服务",
          icon: "staff-filled",
          // Placeholder for Support icon
          collapsed: false,
          items: [
            { name: "多语言翻译服务", icon: "chat-filled" },
            { name: "法律文书公证", icon: "auth-filled" },
            { name: "商务谈判支持", icon: "chatboxes-filled" },
            { name: "市场调研报告", icon: "search" }
          ]
        }
      ]
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.headerHeight = this.statusBarHeight + 44;
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    toggleSection(index) {
      this.sections[index].collapsed = !this.sections[index].collapsed;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      type: "arrowleft",
      size: "20",
      color: "#fff"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.sections, (section, index, i0) => {
      return common_vendor.e({
        a: "0a75e22d-1-" + i0,
        b: common_vendor.p({
          type: section.icon,
          size: "24",
          color: "#333"
        }),
        c: common_vendor.t(section.title),
        d: common_vendor.t(section.collapsed ? "展开" : "收起"),
        e: common_vendor.o(($event) => $options.toggleSection(index), index),
        f: !section.collapsed
      }, !section.collapsed ? {
        g: common_vendor.f(section.items, (item, idx, i1) => {
          return {
            a: "0a75e22d-2-" + i0 + "-" + i1,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#1e90ff"
            }),
            c: common_vendor.t(item.name),
            d: idx
          };
        })
      } : {}, {
        h: index
      });
    }),
    d: $data.headerHeight + "px"
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0a75e22d"], ["__file", "B:/海丝出海通/hscht/miniprogram-project/src/pages/Guide/Guide.vue"]]);
wx.createPage(MiniProgramPage);
