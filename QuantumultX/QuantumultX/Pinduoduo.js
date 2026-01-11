/*********************************
 * Pinduoduo Remove Ads
 * jq-equivalent JS for Quantumult X
 *********************************/

let url = $request.url;
let body = $response.body;

/* ===== 工具函数 ===== */

function delPath(obj, path) {
  let o = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!o || typeof o !== "object") return;
    o = o[path[i]];
  }
  if (o && typeof o === "object") {
    delete o[path[path.length - 1]];
  }
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

/* ===== map_locals 等价（直接空响应）===== */

const EMPTY_API = [
  /unrated_order_for_unreceived_tab/,
  /query_order_list_tabs_element/,
  /aquarius\/hungary\/global\/homepage/,
  /query_order_express_group/,
  /search_hotquery/,
  /chat\/resource\/get_list_data/,
  /query\/new_chat_group/,
  /goods\/back_up/,
  /query\/personal/,
  /goods_detail\/bybt_guide/,
  /reviews\/require\/append/,
  /query\/my_order_group/,
  /query\/likes/,
  /gbdbpdv\/extra/,
  /shortcut\/list/,
  /liveactivity\/push\/create\/url\/report/,
  /growth\/nagato\/app\/index\/gather/,
  /wait\/receive\/review/,
  /nasus\/recommend/
];

if (EMPTY_API.some(r => r.test(url))) {
  $done({ body: "{}" });
  return;
}

/* ===== JSON 解析 ===== */

let obj;
try {
  obj = JSON.parse(body);
} catch (e) {
  $done({});
  return;
}

/* ===== response_jq 等价实现 ===== */

/* 首页 hub */
if (/\/api\/alexa\/homepage\/hub/.test(url)) {

  delPath(obj, ["result", "dy_module", "irregular_banner_dy"]);
  delPath(obj, ["result", "icon_set"]);
  delPath(obj, ["result", "search_bar_hot_query"]);

  // bottom_tabs / buffer_bottom_tabs 仅保留 3 个
  ["bottom_tabs", "buffer_bottom_tabs"].forEach(k => {
    if (obj?.result?.[k]) {
      obj.result[k] = ensureArray(obj.result[k]).filter(i =>
        ["index.html", "chat_list.html", "personal.html"].includes(i.link)
      );
    }
  });

  // all_top_opts 删除图片相关字段
  if (obj?.result?.all_top_opts) {
    obj.result.all_top_opts = ensureArray(obj.result.all_top_opts).map(i => {
      delete i.selected_image;
      delete i.image;
      delete i.height;
      delete i.width;
      return i;
    });
  }
}

/* 搜索 */
if (/^https:\/\/api\.pinduoduo\.com\/search\?/.test(url)) {
  delPath(obj, ["expansion"]);
}

/* 个人中心 */
if (/\/api\/philo\/personal\/hub/.test(url)) {
  delPath(obj, ["monthly_card_entrance"]);
  delPath(obj, ["personal_center_style_v2_vo"]);
  delPath(obj, ["icon_set", "icons"]);
  delPath(obj, ["icon_set", "top_personal_icons"]);
}

/* oak 渲染页 */
if (/\/api\/oak\/integration\/render/.test(url)) {
  delPath(obj, ["bottom_section_list"]);
  delPath(obj, ["ui", "bottom_section"]);
  delPath(obj, ["ui", "live_section", "float_info"]);
}

/* 订单详情 */
if (/\/api\/caterham\/v3\/query\/order_detail_group/.test(url)) {
  delPath(obj, ["data", "goods_list"]);
}

/* 订单页 */
if (/\/order\//.test(url)) {
  delPath(obj, ["marketing_banner_vo"]);
  delPath(obj, ["shipping", "banner_above_recommend"]);
}

/* 订单列表按钮 */
if (/\/api\/aristotle\/order_list_v4/.test(url)) {
  if (Array.isArray(obj.orders)) {
    obj.orders.forEach(o => {
      if (Array.isArray(o.order_buttons)) {
        o.order_buttons.forEach(b => delete b.order_growth_tip);
      }
    });
  }
}

/* ===== 输出 ===== */

$done({ body: JSON.stringify(obj) });
