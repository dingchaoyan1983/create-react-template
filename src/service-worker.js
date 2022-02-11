import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
import { createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// 设置缓存名称
setCacheNameDetails({
  prefix: 'app',
  suffix: 'v1.0.0',
});

// 预缓存文件，self.__WB_MANIFEST是workbox生成的文件地址数组，项目中打包生成的所有静态文件都会自动添加到里面
// eslint-disable-next-line
precacheAndRoute(self.__WB_MANIFEST || []);

// 单页应用需要应用NavigationRoute进行缓存，此处可自定义白名单和黑名单
// 跳过登录和退出页面的拦截
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /login/,
    /logout/,
  ],
});
// 运行时缓存配置
registerRoute(navigationRoute);
// 接口数据使用服务端数据
registerRoute(/api/, new NetworkFirst());

// aliyun cdn上面的静态资源
registerRoute(/^https:\/\/resources.betalpha.com\/wms\/.*\/.*.([css|js])$/, new StaleWhileRevalidate({}));
// config 文件
registerRoute('/config.js', new NetworkFirst());

// eslint-disable-next-line
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // eslint-disable-next-line
    self.skipWaiting();
    // 更新时自动生效
    clientsClaim();
  }
});
