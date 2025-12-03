/**
 * Native mock for react-router
 * Prevents errors when web-only routing code is analyzed during native builds
 */

const noop = () => {};
const MockComponent = () => null;

module.exports = {
  Router: MockComponent,
  Routes: MockComponent,
  Route: MockComponent,
  Link: MockComponent,
  Navigate: MockComponent,
  useNavigate: () => noop,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), noop],
  Outlet: MockComponent,
  useOutlet: () => null,
  useOutletContext: () => ({}),
  useNavigationType: () => 'POP',
  useHref: () => '#',
  useResolvedPath: (to) => ({ pathname: to, search: '', hash: '' }),
  useMatch: () => null,
  useRoutes: () => null,
  RouterProvider: MockComponent,
  createBrowserRouter: () => null,
  createHashRouter: () => null,
  createMemoryRouter: () => null,
  createRouter: () => null,
  createRoutesFromElements: () => [],
  createRoutesFromChildren: () => [],
  generatePath: (pattern, params) => pattern,
  matchRoutes: () => null,
  matchPath: () => null,
  resolvePath: (to) => ({ pathname: to, search: '', hash: '' }),
  parsePath: (path) => ({ pathname: path, search: '', hash: '' }),
};

// Default export
module.exports.default = module.exports;

