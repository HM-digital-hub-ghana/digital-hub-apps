// Minimal mock of react-router-dom for React Native / Expo.
// This prevents Metro from trying to bundle the real web implementation on native.
// It intentionally exports no-op components and hooks.

const React = require('react');

function Identity({ children }) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = {
  // Components
  BrowserRouter: Identity,
  HashRouter: Identity,
  MemoryRouter: Identity,
  Routes: Identity,
  Route: Identity,
  Link: Identity,
  NavLink: Identity,
  Outlet: Identity,

  // Hooks
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'mock' }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), () => {}],
};

/**
 * Native mock for react-router-dom
 * Prevents errors when web-only routing code is analyzed during native builds
 */

const noop = () => {};
const MockComponent = () => null;

// Mock BrowserRouter and related components
module.exports = {
  BrowserRouter: MockComponent,
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
  unstable_HistoryRouter: MockComponent,
};

// Default export
module.exports.default = module.exports;


