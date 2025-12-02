type NavigateFunction = (path: string) => void;

let navigateFunction: NavigateFunction | null = null;

export const setNavigate = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

export const navigate = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    console.warn("[Navigation] No navigate function set, using window.location.href");
    window.location.href = path;
  }
};

