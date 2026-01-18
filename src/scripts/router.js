// const BASE_PATH = '';

// export const router = (() => {
//     const routes = [];

//     function add(path, renderFn) {
//         const paramNames = [];
//         const regexPath = path
//             .replace(/:([^/]+)/g, (_, key) => {
//                 paramNames.push(key);
//                 return '([^/]+)';
//             })
//             .replace(/\//g, '\\/');

//         const regex = new RegExp(`^${BASE_PATH}${regexPath}$`);
//         routes.push({ regex, paramNames, renderFn });
//     }

//     function match(path) {
//         for (const { regex, paramNames, renderFn } of routes) {
//             const match = path.match(regex);
//             if (match) {
//                 const params = {};
//                 paramNames.forEach((name, i) => {
//                     params[name] = decodeURIComponent(match[i + 1]);
//                 });
//                 return { renderFn, params };
//             }
//         }
//         return null;
//     }

//     function navigate(path, push = true) {
//         if (!path.startsWith(BASE_PATH)) {
//             path = BASE_PATH + (path.startsWith('/') ? '' : '/') + path;
//         }

//         const [pathname, queryString] = path.split('?');
//         const result = match(pathname);

//         if (result) {
//             if (push) history.pushState({}, '', path);
//             result.renderFn(result.params);
//         } else {
//             console.warn(`No route found for ${pathname}`);
//         }
//     }

//     function back() {
//         history.back();
//     }

//     function location() {
//         return window.location.pathname.replace(BASE_PATH, '') || '/';
//     }

//     window.addEventListener('popstate', () => {
//         const path = window.location.pathname;
//         navigate(path, false);
//     });

//     return { add, navigate, back, location };
// })();